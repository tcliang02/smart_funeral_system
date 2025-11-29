'use client';

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Brain,
  CheckCircle,
  Plus,
  Save,
  Sparkles,
  Trash2,
  BookOpen
} from "lucide-react";
import VoiceGuidedQuestions from "../components/VoiceGuidedQuestions";
import "./MemoryCollection.css";

const emptyMemory = () => ({
  type: "story",
  title: "",
  content: "",
  importance: "medium"
});

const emptyTrait = () => ({
  category: "general",
  key: "",
  value: ""
});

const normalizeApiData = (payload) => {
  if (
    payload &&
    typeof payload === "object" &&
    !Array.isArray(payload) &&
    payload.data &&
    typeof payload.data === "object"
  ) {
    return payload.data;
  }
  return payload;
};

const extractApiErrorMessage = (payload, fallback) => {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  if (typeof payload.error === "string") {
    return payload.error;
  }

  if (payload.error?.message) {
    return payload.error.message;
  }

  if (typeof payload.message === "string") {
    return payload.message;
  }

  return fallback;
};

const isApiSuccess = (payload) =>
  typeof payload?.success === "boolean" ? payload.success : true;

const fetchVoiceStatus = async (tributeId) => {
  const response = await fetch(`/api/backend/getVoiceStatus?tribute_id=${tributeId}`);
  let payload = null;

  try {
    payload = await response.json();
  } catch (error) {
    payload = null;
  }

  if (!response.ok) {
    const message =
      payload?.message ||
      (await response.text().catch(() => null)) ||
      `Failed to load voice status (HTTP ${response.status})`;
    return { success: false, message };
  }

  if (!payload || typeof payload !== "object") {
    return { success: false, message: "Unexpected voice status response." };
  }

  return payload;
};

const MemoryCollection = ({ id }) => {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const [voiceStatus, setVoiceStatus] = useState(null);
  const [existingMemories, setExistingMemories] = useState([]);
  const [existingTraits, setExistingTraits] = useState([]);

  const [guidedMemories, setGuidedMemories] = useState([]);
  const [draftMemories, setDraftMemories] = useState([emptyMemory()]);
  const [draftTraits, setDraftTraits] = useState([emptyTrait()]);

  const flags = voiceStatus?.flags ?? {};

  const tributeId = useMemo(() => {
    const parsed = parseInt(id ?? "", 10);
    return Number.isNaN(parsed) ? null : parsed;
  }, [id]);

  const memoryCount = existingMemories.length;
  const traitCount = existingTraits.length;

  const progress = useMemo(() => {
    if (voiceStatus?.flags?.setupComplete) {
      return 100;
    }

    const steps = [
      voiceStatus?.flags?.voiceReady,
      memoryCount > 0,
      traitCount > 0,
      voiceStatus?.flags?.memoriesAdded
    ];

    const completed = steps.filter(Boolean).length;
    return Math.min(100, Math.round((completed / steps.length) * 100));
  }, [voiceStatus, memoryCount, traitCount]);

  const progressChecks = useMemo(
    () => [
      {
        label: "Voice sample",
        status: voiceStatus?.flags?.voiceReady
          ? "Ready"
          : voiceStatus?.flags?.voiceProcessing
          ? "Processing"
          : voiceStatus?.flags?.voiceUploaded
          ? "Uploaded"
          : "Not uploaded",
        complete: Boolean(voiceStatus?.flags?.voiceReady)
      },
      {
        label: "Stories captured",
        status: memoryCount > 0 ? `${memoryCount} saved` : "Add at least one story",
        complete: memoryCount > 0
      },
      {
        label: "Personality traits",
        status: traitCount > 0 ? `${traitCount} noted` : "Add at least one trait",
        complete: traitCount > 0
      }
    ],
    [voiceStatus, memoryCount, traitCount]
  );

  useEffect(() => {
    if (!tributeId) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setFeedback(null);
        setError(null);

        const [statusResult, memoriesResponse, traitsResponse] = await Promise.all([
          fetchVoiceStatus(tributeId),
          fetch(`/api/backend/getMemories?tribute_id=${tributeId}`).then((res) => res.json()),
          fetch(`/api/backend/getTraits?tribute_id=${tributeId}`).then((res) => res.json())
        ]);

        const statusData = normalizeApiData(statusResult);
        if (isApiSuccess(statusResult) && statusData) {
          setVoiceStatus(statusData);
        } else {
          setVoiceStatus(null);
        }

        const memoryPayload = normalizeApiData(memoriesResponse);
        if (isApiSuccess(memoriesResponse)) {
          setExistingMemories(memoryPayload?.memories || []);
        } else {
          setExistingMemories([]);
          setFeedback({
            type: "warning",
            message: extractApiErrorMessage(memoriesResponse, "Unable to load memories.")
          });
        }

        const traitsPayload = normalizeApiData(traitsResponse);
        if (isApiSuccess(traitsResponse)) {
          setExistingTraits(traitsPayload?.traits || []);
        } else {
          setExistingTraits([]);
          setFeedback({
            type: "warning",
            message: extractApiErrorMessage(traitsResponse, "Unable to load personality traits.")
          });
        }
      } catch (err) {
        console.error("Memory collection load error:", err);
        setError(err?.message || "Unable to load memory collection.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [tributeId]);

  const handleMemoryFieldChange = (index, field, value) => {
    setDraftMemories((prev) =>
      prev.map((memory, idx) => (idx === index ? { ...memory, [field]: value } : memory))
    );
  };

  const handleAddMemoryForm = () => {
    setDraftMemories((prev) => [...prev, emptyMemory()]);
  };

  const handleRemoveMemoryForm = (index) => {
    setDraftMemories((prev) => (prev.length === 1 ? [emptyMemory()] : prev.filter((_, idx) => idx !== index)));
  };

  const handleTraitFieldChange = (index, field, value) => {
    setDraftTraits((prev) =>
      prev.map((trait, idx) => (idx === index ? { ...trait, [field]: value } : trait))
    );
  };

  const handleAddTraitForm = () => {
    setDraftTraits((prev) => [...prev, emptyTrait()]);
  };

  const handleRemoveTraitForm = (index) => {
    setDraftTraits((prev) => (prev.length === 1 ? [emptyTrait()] : prev.filter((_, idx) => idx !== index)));
  };

  const handleAddGuidedMemory = (memory) => {
    if (!memory || typeof memory !== "object") return;
    const content = (memory.content || memory.text || "").trim();
    if (!content) return;

    setGuidedMemories((prev) => [
      ...prev,
      {
        type: memory.type || "story",
        title: memory.title || memory.question || "Guided Memory",
        content,
        importance: memory.importance || "high",
        source: "guided"
      }
    ]);

    setFeedback({
      type: "success",
      message: "Guided answer saved! It will be included when you click Save Memories."
    });
  };

  const handleRemoveGuidedMemory = (index) => {
    setGuidedMemories((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSave = async () => {
    try {
      if (!tributeId) return;

      setSaving(true);
      setFeedback(null);

      const preparedManualMemories = draftMemories
        .map((memory) => ({
          type: memory.type || "story",
          title: (memory.title || "").trim(),
          content: (memory.content || "").trim(),
          importance: memory.importance || "medium"
        }))
        .filter((memory) => memory.content.length >= 5);

      const preparedGuidedMemories = guidedMemories.map((memory) => ({
        type: memory.type || "story",
        title: (memory.title || "Guided Memory").trim(),
        content: (memory.content || "").trim(),
        importance: memory.importance || "high"
      }));

      const preparedTraits = draftTraits
        .map((trait) => ({
          category: trait.category || trait.key || "general",
          value: (trait.value || "").trim()
        }))
        .filter((trait) => trait.value.length >= 3);

      if (preparedManualMemories.length === 0 && preparedGuidedMemories.length === 0 && preparedTraits.length === 0) {
        setFeedback({
          type: "error",
          message: "Add at least one memory or personality trait before saving."
        });
        return;
      }

      const response = await fetch("/api/backend/saveMemories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          tribute_id: tributeId,
          memories: [...preparedGuidedMemories, ...preparedManualMemories],
          traits: preparedTraits
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const resultPayload = normalizeApiData(data) || {};
        const memoriesSaved = resultPayload?.memories_saved ?? 0;
        const traitsSaved = resultPayload?.traits_saved ?? 0;
        setFeedback({
          type: "success",
          message: `Saved ${memoriesSaved} memories and ${traitsSaved} traits.`
        });
        setGuidedMemories([]);
        setDraftMemories([emptyMemory()]);
        setDraftTraits([emptyTrait()]);

        setLoading(true);
        const [memoriesResponse, traitsResponse, statusResult] = await Promise.all([
          fetch(`/api/backend/getMemories?tribute_id=${tributeId}`).then((res) => res.json()),
          fetch(`/api/backend/getTraits?tribute_id=${tributeId}`).then((res) => res.json()),
          fetchVoiceStatus(tributeId)
        ]);

        const memoryPayload = normalizeApiData(memoriesResponse);
        if (isApiSuccess(memoriesResponse)) {
          setExistingMemories(memoryPayload?.memories || []);
        }

        const traitsPayload = normalizeApiData(traitsResponse);
        if (isApiSuccess(traitsResponse)) {
          setExistingTraits(traitsPayload?.traits || []);
        }

        const statusData = normalizeApiData(statusResult);
        if (isApiSuccess(statusResult) && statusData) {
          setVoiceStatus(statusData);
        }
      } else {
        setFeedback({
          type: "error",
          message: extractApiErrorMessage(data, "Failed to save memories. Please try again.")
        });
      }
    } catch (error) {
      console.error("Save memories error:", error);
      setFeedback({
        type: "error",
        message: error?.message || "Failed to save memories. Please try again."
      });
    } finally {
      setSaving(false);
      setLoading(false);
    }
  };

  if (!tributeId) {
    return (
      <div className="memory-page">
        <div className="memory-shell">
          <div className="memory-feedback-card error">
            <h2>Unable to load tribute</h2>
            <p>We couldn&apos;t find a valid tribute reference for this page.</p>
            <button className="memory-back" onClick={() => router.push("/grief-support/voice")}>
              <ArrowLeft size={18} />
              Back to Voice Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="memory-page">
        <div className="memory-shell">
          <div className="memory-loading-card">
            <div className="memory-spinner" />
            <p>Loading memory collection…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="memory-page">
      <div className="memory-shell">
        <div className="memory-header">
          <button className="memory-back" onClick={() => router.push(`/grief-support/voice/${tributeId}/setup`)}>
            <ArrowLeft size={16} />
            Back to Voice Setup
          </button>
          <div className="memory-title-block">
            <h1>
              <BookOpen size={26} />
              Memory &amp; Personality Collection
            </h1>
            <p>
              Capture their stories, phrases, and personality quirks. These become the training data that makes the AI
              sound and behave like them.
            </p>
          </div>
          {voiceStatus?.tribute?.name && (
            <div className="memory-tag">
              Tribute to <strong>{voiceStatus.tribute.name}</strong>
            </div>
          )}
        </div>

        {error && (
          <div className="memory-alert error">
            <strong>Unable to load data.</strong> {error}
          </div>
        )}

        {feedback && (
          <div className={`memory-alert ${feedback.type || "info"}`}>
            {feedback.message}
          </div>
        )}

        <div className="memory-summary-grid">
          <div className="memory-progress-card">
            <div className="memory-progress-head">
              <span className="memory-progress-label">Overall progress</span>
              <div className="memory-progress-value">
                <span>{progress}</span>
                <span>%</span>
              </div>
              <p className="memory-progress-subtext">
                {voiceStatus?.flags?.setupComplete
                  ? "Everything is ready. You can open the voice chat whenever you need it."
                  : "Complete the tasks below to finish training their memorial voice."}
              </p>
            </div>
            <div className="memory-progress-bar">
              <div className="memory-progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
            <ul className="memory-progress-list">
              {progressChecks.map((item) => (
                <li key={item.label} className={item.complete ? "complete" : ""}>
                  <span className="memory-progress-icon">
                    <CheckCircle size={16} />
                  </span>
                  <span className="memory-progress-text">
                    <strong>{item.label}</strong>
                    <span>{item.status}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="memory-info-stack">
            <div className="memory-info-card">
              <div className="memory-info-icon">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="memory-info-label">Voice status</p>
                <p className="memory-info-value capitalize">
                  {voiceStatus?.voice_status?.replace("_", " ") ?? "Not started"}
                </p>
              </div>
              <p className="memory-info-subtext">
                {flags.voiceReady
                  ? "Their voice is ready. You can start a conversation whenever you're ready."
                  : flags.voiceProcessing
                  ? "We’re processing the uploaded voice sample. This usually takes a few minutes."
                  : "Upload a clear voice clip so we can recreate their voice."}
              </p>
            </div>

            <div className="memory-info-card">
              <div className="memory-info-icon">
                <Brain size={18} />
              </div>
              <div>
                <p className="memory-info-label">Memories captured</p>
                <p className="memory-info-value">
                  {memoryCount} memories · {traitCount} traits
                </p>
              </div>
              <p className="memory-info-subtext">
                Detailed stories and personality notes help the AI respond with Jacky&apos;s warmth and tone.
              </p>
            </div>
          </div>
        </div>

        <section className="memory-section">
          <div className="memory-section-header">
            <div>
              <h2>Guided questions</h2>
              <p>Answer a few heartfelt prompts and we’ll save them as training data automatically.</p>
            </div>
            <div className="memory-section-chip">
              <Sparkles size={16} />
              Boost accuracy
            </div>
          </div>
          <div className="memory-section-body">
            <div className="memory-card memory-card--guide">
              <VoiceGuidedQuestions onAddMemory={handleAddGuidedMemory} />
            </div>
            {guidedMemories.length > 0 && (
              <div className="memory-card">
                <div className="memory-card-header">
                  <h3>Saved answers</h3>
                  <span className="memory-tag">{guidedMemories.length}</span>
                </div>
                <div className="memory-guided-list">
                  {guidedMemories.map((memory, index) => (
                    <article key={`guided-${index}`} className="memory-guided-item">
                      <div className="memory-guided-meta">
                        <span className={`memory-pill memory-pill-${memory.type}`}>{memory.type}</span>
                        <span className={`memory-pill memory-pill-${memory.importance}`}>{memory.importance}</span>
                      </div>
                      <h4>{memory.title}</h4>
                      <p>{memory.content}</p>
                      <button
                        type="button"
                        className="memory-remove"
                        onClick={() => handleRemoveGuidedMemory(index)}
                      >
                        <Trash2 size={16} />
                        Remove
                      </button>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="memory-section">
          <div className="memory-section-header">
            <div>
              <h2>Stories &amp; memories</h2>
              <p>Document the stories that best capture Jacky’s character and voice.</p>
            </div>
          </div>
          <div className="memory-two-column">
            <div className="memory-column">
              <div className="memory-card">
                <div className="memory-card-header">
                  <h3>Saved stories</h3>
                  <span className="memory-tag">{existingMemories.length}</span>
                </div>
                {existingMemories.length > 0 ? (
                  <div className="memory-list">
                    {existingMemories.map((memory) => (
                      <article key={memory.id} className="memory-list-item">
                        <div className="memory-list-meta">
                          <span className={`memory-pill memory-pill-${memory.type}`}>{memory.type}</span>
                        </div>
                        <h4>{memory.title || memory.type}</h4>
                        <p>{memory.content}</p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="memory-placeholder">
                    <p>No memories saved yet. Share a short story to get started.</p>
                  </div>
                )}
              </div>
            </div>
            <div className="memory-column">
              <div className="memory-card">
                <div className="memory-card-header">
                  <h3>Add a new story</h3>
                  <p>Focus on meaningful phrases, routines, and moments you want the AI to remember.</p>
                </div>
                <div className="memory-form-stack">
                  {draftMemories.map((memory, index) => (
                    <div key={`memory-${index}`} className="memory-form-card">
                      <div className="memory-form-card-header">
                        <span>Story #{index + 1}</span>
                        {draftMemories.length > 1 && (
                          <button type="button" onClick={() => handleRemoveMemoryForm(index)}>
                            <Trash2 size={16} />
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="memory-form-row">
                        <div className="memory-form-group">
                          <label>Story type</label>
                          <select
                            className="memory-input"
                            value={memory.type}
                            onChange={(e) => handleMemoryFieldChange(index, "type", e.target.value)}
                          >
                            <option value="story">Story / Anecdote</option>
                            <option value="phrase">Favourite Phrase</option>
                            <option value="belief">Belief / Value</option>
                            <option value="experience">Life Experience</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div className="memory-form-group">
                          <label>Importance</label>
                          <select
                            className="memory-input"
                            value={memory.importance}
                            onChange={(e) => handleMemoryFieldChange(index, "importance", e.target.value)}
                          >
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                          </select>
                        </div>
                      </div>
                      <div className="memory-form-group">
                        <label>Title / summary</label>
                        <input
                          className="memory-input"
                          type="text"
                          placeholder="e.g., Their favourite greeting or family story"
                          value={memory.title}
                          onChange={(e) => handleMemoryFieldChange(index, "title", e.target.value)}
                        />
                      </div>
                      <div className="memory-form-group">
                        <label>Full story</label>
                        <textarea
                          className="memory-input memory-textarea"
                          rows={5}
                          placeholder="Describe the memory in detail. Include exact words or phrases they used."
                          value={memory.content}
                          onChange={(e) => handleMemoryFieldChange(index, "content", e.target.value)}
                        />
                        <div className="memory-char-count">{memory.content.length} characters</div>
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" className="memory-add" onClick={handleAddMemoryForm}>
                  <Plus size={16} />
                  Add another story
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="memory-section">
          <div className="memory-section-header">
            <div>
              <h2>Personality traits</h2>
              <p>Note the habits, quirks, and beliefs that shaped how Jacky interacted with everyone.</p>
            </div>
          </div>
          <div className="memory-two-column">
            <div className="memory-column">
              <div className="memory-card">
                <div className="memory-card-header">
                  <h3>Saved traits</h3>
                  <span className="memory-tag">{existingTraits.length}</span>
                </div>
                {existingTraits.length > 0 ? (
                  <div className="memory-list">
                    {existingTraits.map((trait) => (
                      <article key={trait.id} className="memory-list-item">
                        <div className="memory-list-meta">
                          <span className="memory-pill memory-pill-neutral">{trait.category}</span>
                        </div>
                        <p>{trait.trait_value}</p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="memory-placeholder">
                    <p>No personality traits recorded yet. Add a few to teach the AI their unique character.</p>
                  </div>
                )}
              </div>
            </div>
            <div className="memory-column">
              <div className="memory-card">
                <div className="memory-card-header">
                  <h3>Add new traits</h3>
                  <p>Describe the traits or quirks that Jacky was known for.</p>
                </div>
                <div className="memory-form-stack">
                  {draftTraits.map((trait, index) => (
                    <div key={`trait-${index}`} className="memory-form-card">
                      <div className="memory-form-card-header">
                        <span>Trait #{index + 1}</span>
                        {draftTraits.length > 1 && (
                          <button type="button" onClick={() => handleRemoveTraitForm(index)}>
                            <Trash2 size={16} />
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="memory-form-group">
                        <label>Category</label>
                        <select
                          className="memory-input"
                          value={trait.category}
                          onChange={(e) => handleTraitFieldChange(index, "category", e.target.value)}
                        >
                          <option value="general">General personality</option>
                          <option value="values">Values &amp; beliefs</option>
                          <option value="interests">Interests &amp; hobbies</option>
                          <option value="habits">Habits &amp; routines</option>
                          <option value="relationships">Relationships</option>
                          <option value="professional">Professional life</option>
                          <option value="quirks">Unique quirks</option>
                        </select>
                      </div>
                      <div className="memory-form-group">
                        <label>Description</label>
                        <textarea
                          className="memory-input memory-textarea"
                          rows={3}
                          placeholder="Describe this trait or habit in their own words."
                          value={trait.value}
                          onChange={(e) => handleTraitFieldChange(index, "value", e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" className="memory-add" onClick={handleAddTraitForm}>
                  <Plus size={16} />
                  Add another trait
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="memory-actions">
          <button
            className="memory-action-secondary"
            onClick={() => router.push(`/grief-support/voice/${tributeId}/setup`)}
            disabled={saving}
          >
            Cancel
          </button>
          <button className="memory-action-primary" onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <div className="memory-spinner memory-spinner--inline" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save to AI training
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemoryCollection;
