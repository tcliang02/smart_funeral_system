'use client';

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  Loader,
  MessageCircle,
  Send,
  User,
  Volume2,
  VolumeX
} from "lucide-react";
import "./VoiceChat.css";

const QUICK_QUESTIONS = [
  "How are you feeling today?",
  "Can you share a memory with me?",
  "What advice would you give me right now?",
  "What do you remember about our last holiday?",
  "Tell me something comforting."
];

const STORAGE_PREFIX = "voice_chat_";
const ACCESS_LEVEL_LABELS = {
  family: "Family only",
  invited: "Logged-in guests",
  all_visitors: "All visitors"
};

export default function VoiceChat({ id }) {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [tributeData, setTributeData] = useState(null);
  const [voiceStatus, setVoiceStatus] = useState(null);

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const [playingMessageId, setPlayingMessageId] = useState(null);

  const messagesEndRef = useRef(null);
  const currentAudioRef = useRef(null);
  const speechSynthesisRef = useRef(
    typeof window !== "undefined" ? window.speechSynthesis : null
  );

  // Load user and conversation history
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const savedHistory = localStorage.getItem(`${STORAGE_PREFIX}${id}`);
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          setShowQuickQuestions(false);
        }
      } catch (err) {
        console.error("Failed to parse saved conversation:", err);
      }
    }
  }, [id]);

  // Fetch tribute + voice status
  useEffect(() => {
    let isMounted = true;

    const loadStatus = async () => {
      try {
        setError(null);
        const response = await fetch(`/api/backend/getVoiceStatus?tribute_id=${id}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || data.error?.message || "Unable to load voice status");
        }

        if (isMounted) {
          // Handle standardized API response format: data is nested under data.data
          const responseData = data.data || data;
          setTributeData(responseData.tribute);
          setVoiceStatus(responseData);
        }
      } catch (err) {
        console.error("Voice chat status error:", err);
        if (isMounted) {
          setError(err.message || "Unable to load voice memorial details.");
        }
      }
    };

    loadStatus();
    return () => {
      isMounted = false;
    };
  }, [id]);

  // Save messages whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`${STORAGE_PREFIX}${id}`, JSON.stringify(messages));
    } else {
      localStorage.removeItem(`${STORAGE_PREFIX}${id}`);
    }
  }, [messages, id]);

  // Auto-scroll (optional)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const rawUserId = user?.user_id ?? user?.id ?? null;
  const normalizedUserId = typeof rawUserId === "number"
    ? rawUserId
    : rawUserId
      ? parseInt(rawUserId, 10)
      : null;
  const userRole = user?.role ?? user?.user_role ?? null;
  const tributeOwnerIdRaw =
    tributeData?.created_by ?? tributeData?.creator_user_id ?? tributeData?.createdBy ?? null;
  const normalizedOwnerId = tributeOwnerIdRaw ? parseInt(tributeOwnerIdRaw, 10) : null;
  const accessLevel =
    (voiceStatus?.settings?.access_level || voiceStatus?.settings?.accessLevel || 'family').toLowerCase();
  const accessLabel = ACCESS_LEVEL_LABELS[accessLevel] || ACCESS_LEVEL_LABELS.family;

  const accessInfo = useMemo(() => {
    if (!voiceStatus?.settings) {
      return { allowed: true, reason: '', requireLogin: false };
    }

    if (voiceStatus.settings.is_enabled === false) {
      return {
        allowed: false,
        reason: 'Voice chat is currently disabled by the memorial owner.',
        requireLogin: false
      };
    }

    if (accessLevel === 'family') {
      if (!normalizedUserId) {
        return {
          allowed: false,
          reason: 'Please log in with a family account to chat with this memorial.',
          requireLogin: true
        };
      }

      if (
        userRole !== 'family' &&
        !(normalizedOwnerId && normalizedUserId === normalizedOwnerId)
      ) {
        return {
          allowed: false,
          reason: 'Only family accounts can chat with this memorial.',
          requireLogin: false
        };
      }
    } else if (accessLevel === 'invited') {
      if (!normalizedUserId) {
        return {
          allowed: false,
          reason: 'Please sign in to chat with this memorial.',
          requireLogin: true
        };
      }
    }

    return { allowed: true, reason: '', requireLogin: false };
  }, [voiceStatus, accessLevel, normalizedUserId, userRole, normalizedOwnerId]);

  const voiceReady = Boolean(voiceStatus?.flags?.voiceReady);
  const chatDisabled = !voiceReady || !accessInfo.allowed;

  const playAudioFromUrl = (url, messageId) => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
    }

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    if (!url) {
      setPlayingMessageId(null);
      return;
    }

    const audio = new Audio(url);
    currentAudioRef.current = audio;

    audio.onplay = () => setPlayingMessageId(messageId);
    audio.onended = () => {
      setPlayingMessageId(null);
      currentAudioRef.current = null;
    };
    audio.onerror = () => {
      setPlayingMessageId(null);
      currentAudioRef.current = null;
    };

    audio.play().catch((err) => {
      console.error("Audio playback error:", err);
      setPlayingMessageId(null);
    });
  };

  const speakTextFallback = (text, messageId) => {
    if (!speechSynthesisRef.current) return;

    if (playingMessageId === messageId) {
      speechSynthesisRef.current.cancel();
      setPlayingMessageId(null);
      return;
    }

    speechSynthesisRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.voice =
      speechSynthesisRef.current
        .getVoices()
        .find((voice) => voice.lang.startsWith("en")) || null;

    utterance.onstart = () => setPlayingMessageId(messageId);
    utterance.onend = () => setPlayingMessageId(null);
    utterance.onerror = () => setPlayingMessageId(null);

    speechSynthesisRef.current.speak(utterance);
  };

  const handleSendMessage = async (prompt) => {
    const messageToSend = (prompt ?? inputMessage).trim();
    if (!messageToSend || isLoading) return;
    if (!voiceReady) {
      alert("Voice model is still getting ready. Please try again shortly.");
      return;
    }
    if (!accessInfo.allowed) {
      alert(accessInfo.reason || "Voice chat is currently unavailable.");
      return;
    }

    setShowQuickQuestions(false);
    setInputMessage("");

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: messageToSend,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Get auth token
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("/api/backend/voiceChatbot", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          tribute_id: parseInt(id, 10),
          user_id: normalizedUserId,
          message: messageToSend
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        // Extract error message - handle both string and object formats
        let errorMessage = "Failed to get response";
        if (data.error) {
          if (typeof data.error === 'string') {
            errorMessage = data.error;
          } else if (data.error.message) {
            errorMessage = data.error.message;
          } else if (typeof data.error === 'object') {
            errorMessage = JSON.stringify(data.error);
          }
        } else if (data.message) {
          errorMessage = data.message;
        }
        throw new Error(errorMessage);
      }

      // Handle standardized API response format if present
      const responseData = data.data || data;
      
      const aiMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: responseData.response || data.response,
        audio_url: responseData.audio_url || data.audio_url || null,
        timestamp: new Date().toISOString()
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (data.audio_url) {
        playAudioFromUrl(data.audio_url, aiMessage.id);
      } else {
        speakTextFallback(data.response, aiMessage.id);
      }
    } catch (err) {
      console.error("Voice chatbot error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          role: "assistant",
          content:
            "I’m having trouble responding right now, but I’m still right here. Please try again in a little while.",
          isError: true,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (confirm("Clear this conversation? This will remove saved messages for this memorial.")) {
      setMessages([]);
      setShowQuickQuestions(true);
      localStorage.removeItem(`${STORAGE_PREFIX}${id}`);
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    }
  };

  if (error) {
    return (
      <div className="voice-chat-loading">
        <p>{error}</p>
        <button
          className="back-button"
          onClick={() => router.push(`/grief-support/voice/${id}/setup`)}
        >
          <ArrowLeft size={20} />
          Back to Voice Setup
        </button>
      </div>
    );
  }

  if (!tributeData || !voiceStatus) {
    return (
      <div className="voice-chat-loading">
        <Loader className="spinner" size={40} />
        <p>Getting things ready...</p>
      </div>
    );
  }

  return (
    <div className="voice-chat">
      <div className="voice-chat-header">
        <button className="back-button" onClick={() => router.push(`/grief-support/voice/${id}/setup`)}>
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="tribute-info">
          <div className="tribute-avatar">
            {tributeData.photo_url ? (
              <img src={tributeData.photo_url} alt={tributeData.deceased_name || "Tribute"} />
            ) : (
              <User size={24} />
            )}
            <div className="online-indicator" />
          </div>
          <div className="tribute-details">
            <h2>{tributeData.deceased_name}</h2>
            <p className="tribute-dates">
              {tributeData.birth_date ? new Date(tributeData.birth_date).getFullYear() : "----"} –{" "}
              {tributeData.death_date ? new Date(tributeData.death_date).getFullYear() : "----"}
            </p>
            <div className="voice-tags">
              <span className="voice-active">
                {voiceStatus.flags.voiceReady ? "Voice ready" : "Voice processing"}
              </span>
              <span className="voice-access-tag">
                Access: {accessLabel}
              </span>
            </div>
          </div>
        </div>

        <button className="clear-history-btn" onClick={handleClearHistory}>
          Clear chat
        </button>
      </div>

      {!accessInfo.allowed && (
        <div className="access-warning">
          <p>{accessInfo.reason}</p>
          {accessInfo.requireLogin && (
            <button className="access-warning-btn" onClick={() => router.push("/login")}>
              Log in
            </button>
          )}
        </div>
      )}

      <div className="messages-container">
        {chatDisabled && (
          <div className="welcome-message">
            <div className="welcome-avatar">
              {tributeData.photo_url ? (
                <img src={tributeData.photo_url} alt={tributeData.deceased_name || "Tribute"} />
              ) : (
                <Bot size={36} />
              )}
            </div>
            <h3>We’re almost ready</h3>
            <p>
              Finish uploading their voice sample and add a few memories to start chatting. Once
              everything is set, enable voice chat in settings and come back here anytime.
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.role} ${message.isError ? "error" : ""}`}
          >
            <div className="message-avatar">
              {message.role === "user" ? <User size={18} /> : <Bot size={18} />}
            </div>
            <div className="message-content">
              <div className="message-text">{message.content}</div>
              <span className="message-time">
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit"
                })}
              </span>
              {message.role === "assistant" && !message.isError && (
                <button
                  className="audio-play-btn"
                  onClick={() => {
                    if (message.audio_url) {
                      playAudioFromUrl(
                        playingMessageId === message.id ? null : message.audio_url,
                        message.id
                      );
                    } else {
                      speakTextFallback(message.content, message.id);
                    }
                  }}
                >
                  {playingMessageId === message.id ? (
                    <>
                      <VolumeX size={16} />
                      Stop
                    </>
                  ) : (
                    <>
                      <Volume2 size={16} />
                      {message.audio_url ? "Play voice" : "Speak aloud"}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message assistant typing">
            <div className="message-avatar">
              <Bot size={18} />
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

        {showQuickQuestions && !chatDisabled && (
          <div className="quick-questions">
            <div className="quick-questions-header">
              <span className="quick-icon">💭</span>
              <p>Need help starting the conversation?</p>
            </div>
            <div className="quick-questions-grid">
              {QUICK_QUESTIONS.map((question) => (
                <button
                  key={question}
                  className="quick-question-btn"
                  onClick={() => handleSendMessage(question)}
                >
                  {question}
                </button>
              ))}
            </div>
            <p className="quick-hint">These prompts help the AI respond more naturally.</p>
          </div>
        )}

      <div className="input-area">
        <div className="input-container">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={
              chatDisabled
                ? "Complete voice setup before chatting."
                : `Message ${tributeData.deceased_name || "them"}...`
            }
            disabled={chatDisabled || isLoading}
            rows={1}
          />
          <button
            className="send-button"
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || chatDisabled || isLoading}
          >
            {isLoading ? <Loader className="spinner" size={18} /> : <Send size={18} />}
          </button>
        </div>
        <p className="input-hint">Press Enter to send, Shift + Enter for a new line</p>
      </div>
    </div>
  );
}
