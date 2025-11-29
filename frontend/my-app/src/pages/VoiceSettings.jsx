'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, ArrowLeft, Save, Shield, Users, Lock } from "lucide-react";
import "./VoiceSettings.css";

const accessLevelOptions = [
  {
    value: "family",
    label: "Family Only",
    icon: Lock,
    description: "Only family accounts (or the memorial owner) can use the AI voice",
    color: "#8b5cf6"
  },
  {
    value: "invited",
    label: "Invited Guests (login required)",
    icon: Shield,
    description: "Anyone with a Smart Funeral login that you share the link with can chat after signing in",
    color: "#f59e0b"
  },
  {
    value: "all_visitors",
    label: "All Visitors",
    icon: Users,
    description: "Anyone can chat with the AI voice without logging in",
    color: "#10b981"
  }
];

export default function VoiceSettings({ id }) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const [isEnabled, setIsEnabled] = useState(true);
  const [accessLevel, setAccessLevel] = useState("family");
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadStatus = async () => {
      try {
        setLoading(true);
        // Get auth token
        const token = localStorage.getItem("token");
        const headers = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`/api/backend/getVoiceStatus?tribute_id=${id}`, {
          headers: headers
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || data.error?.message || "Failed to load voice settings");
        }

        if (isMounted) {
          // Handle standardized API response format: data is nested under data.data
          const responseData = data.data || data;
          setStatus(responseData);
          setIsEnabled(responseData?.settings?.is_enabled ?? true);
          setAccessLevel(responseData?.settings?.access_level ?? "family");
          setFeedback(null);
        }
      } catch (error) {
        console.error("Voice settings load error:", error);
        if (isMounted) {
          setFeedback({
            success: false,
            message: error.message || "Unable to load voice settings. Please try again later."
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadStatus();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setFeedback(null);

      // Get auth token
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("/api/backend/updateVoiceSettings", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          tribute_id: parseInt(id, 10),
          is_enabled: isEnabled,
          access_level: accessLevel
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        // Extract error message - handle both string and object formats
        let errorMessage = "Failed to update settings";
        if (data.error) {
          if (typeof data.error === 'string') {
            errorMessage = data.error;
          } else if (data.error.message) {
            errorMessage = data.error.message;
          }
        } else if (data.message) {
          errorMessage = data.message;
        }
        throw new Error(errorMessage);
      }

      setFeedback({
        success: true,
        message: "Voice chat settings updated successfully."
      });
    } catch (error) {
      console.error("Save voice settings error:", error);
      setFeedback({
        success: false,
        message: error.message || "Unable to save settings. Please try again."
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="voice-settings-loading">
        <div className="spinner"></div>
        <p>Loading voice settings...</p>
      </div>
    );
  }

  return (
    <div className="voice-settings">
      <div className="voice-settings-header">
        <button className="back-button" onClick={() => router.push(`/grief-support/voice/${id}/setup`)}>
          <ArrowLeft size={20} />
          Back to Voice Setup
        </button>

        <div className="header-content">
          <h1>
            <Settings className="header-icon" />
            Voice Chat Settings
          </h1>
          <p>Control who can talk to your loved one’s AI voice and whether the chat is enabled.</p>
        </div>
      </div>

      <div className="voice-settings-container">
        {feedback && (
          <div className={`settings-alert ${feedback.success ? "success" : "error"}`} role="alert">
            {feedback.message}
          </div>
        )}

        <section className="settings-section">
          <div className="section-header">
            <h2>Voice Chat Status</h2>
            <p>Turn the voice chat on or off for this memorial.</p>
          </div>

          <div className="toggle-container">
            <div className="toggle-info">
              <strong>{isEnabled ? "Voice chat enabled" : "Voice chat disabled"}</strong>
              <span>
                {isEnabled
                  ? "Family members can connect with the AI voice."
                  : "No one can start conversations until you enable it again."}
              </span>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={isEnabled} onChange={(e) => setIsEnabled(e.target.checked)} />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </section>

        <section className="settings-section">
          <div className="section-header">
            <h2>Access Control</h2>
            <p>Choose who has permission to use the AI voice.</p>
          </div>

          <div className="access-level-options">
            {accessLevelOptions.map((option) => {
              const Icon = option.icon;
              return (
                <label
                  key={option.value}
                  className={`access-option ${accessLevel === option.value ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="accessLevel"
                    value={option.value}
                    checked={accessLevel === option.value}
                    onChange={(e) => setAccessLevel(e.target.value)}
                  />
                  <div className="option-content">
                    <div className="option-icon" style={{ background: option.color }}>
                      <Icon size={24} />
                    </div>
                    <div className="option-text">
                      <strong>{option.label}</strong>
                      <span>{option.description}</span>
                    </div>
                    <div className="option-check">{accessLevel === option.value && "✓"}</div>
                  </div>
                </label>
              );
            })}
          </div>
        </section>

        <section className="settings-section">
          <div className="section-header">
            <h2>Current Status</h2>
            <p>Review the voice memorial readiness before enabling the chat.</p>
          </div>

          <div className="status-overview">
            <div className={`status-pill ${status?.flags?.voiceReady ? "ready" : "pending"}`}>
              <span className="dot"></span>
              Voice sample {status?.flags?.voiceReady ? "ready" : "not ready yet"}
            </div>
            <div className={`status-pill ${status?.flags?.memoriesAdded ? "ready" : "pending"}`}>
              <span className="dot"></span>
              {status?.memory_count ?? 0} memories · {status?.trait_count ?? 0} traits saved
            </div>
          </div>
        </section>

        <div className="action-buttons">
          <button className="btn-secondary" onClick={() => router.push(`/grief-support/voice/${id}/setup`)}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <div className="spinner small"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={20} />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
