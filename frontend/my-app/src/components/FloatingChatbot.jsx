'use client';

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, X, Bot, Heart, HelpCircle,
  Send, Minimize2, Maximize2
} from "lucide-react";
import "./FloatingChatbot.css";
import { logger } from '@/lib/logger';

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [showLabel, setShowLabel] = useState(true);
  const messagesEndRef = useRef(null);

  // Quick action questions
  const quickActions = [
    {
      icon: "👤",
      label: "Guest Access",
      question: "How do I access as a guest without registering?"
    },
    {
      icon: "📝",
      label: "Create Memorial",
      question: "How do I create a memorial page?"
    },
    {
      icon: "📅",
      label: "Book Service",
      question: "How do I book funeral services?"
    },
    {
      icon: "🎤",
      label: "Voice Memorial",
      question: "How does AI Voice Memorial work?"
    },
    {
      icon: "💰",
      label: "Pricing",
      question: "Is this platform free or do I need to pay?"
    },
    {
      icon: "🏢",
      label: "For Providers",
      question: "How do I register as a service provider?"
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-hide label after 30 seconds
  useEffect(() => {
    if (showLabel) {
      const timer = setTimeout(() => {
        setShowLabel(false);
      }, 30000); // 30 seconds

      return () => clearTimeout(timer);
    }
  }, [showLabel]);

  useEffect(() => {
    // Auto-initialize with AI Assistant welcome message when opened
    if (isOpen && messages.length === 0) {
      const welcomeMessage = {
        role: 'bot',
        content: "Hi! I'm your AI Website Assistant. I can help you navigate our platform and answer any questions.\n\nClick a quick action below or ask me anything!",
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
      setShowQuickActions(true);
    }
  }, [isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    // Hide quick actions after first message
    setShowQuickActions(false);

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      // Prepare conversation history
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      const response = await fetch('/api/backend/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputMessage,
          mode: 'website', // Always use website mode (AI Assistant)
          user_id: user.user_id || null,
          conversation_history: conversationHistory
        })
      });

      const data = await response.json();
      console.log('API Response:', { status: response.status, data }); // DEBUG

      if (data.success) {
        const botMessage = {
          role: 'bot',
          content: data.reply,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(data.message || data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Full error:', error); // DEBUG
      logger.error('Chat error', {
        message: error.message || error.toString(),
        error: error
      });
      const errorMessage = {
        role: 'bot',
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (question) => {
    setInputMessage(question);
    setShowQuickActions(false);
    // Auto-submit the question
    setTimeout(() => {
      const event = { preventDefault: () => { } };
      handleSendMessage(event);
    }, 100);
  };

  const handleReset = () => {
    setMessages([]);
    setInputMessage("");
    setShowQuickActions(true);
    // Re-add welcome message
    const welcomeMessage = {
      role: 'bot',
      content: "Hi! I'm your AI Website Assistant. I can help you navigate our platform and answer any questions.\n\nClick a quick action below or ask me anything!",
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMessage]);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset after animation completes
    setTimeout(() => {
      setMessages([]);
      setInputMessage("");
      setIsMinimized(false);
    }, 300);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="floating-chat-button-wrapper"
          >
            <motion.button
              className="floating-chat-button"
              onClick={() => setIsOpen(true)}
              whileHover={{ scale: 1.1, y: -4 }}
              whileTap={{ scale: 0.9 }}
            >
              <MessageCircle size={28} />
              <span className="chat-button-badge">AI</span>
            </motion.button>

            {/* Persistent Label for AI Chat Button */}
            <AnimatePresence>
              {showLabel && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: 0.5 }}
                  className="chat-button-label"
                >
                  <div className="chat-label-text">
                    <span>Greetings! I'm ZENLINK AI ready to assist you</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowLabel(false);
                      }}
                      className="ml-2 p-1 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
                      aria-label="Close label"
                      type="button"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="chat-label-arrow"></div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`floating-chat-window ${isMinimized ? 'minimized' : ''}`}
            initial={{ scale: 0, opacity: 0, y: 100 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Chat Header */}
            <div className="chat-window-header">
              <div className="chat-header-left">
                <Bot size={20} />
                <div>
                  <h3>AI Assistant</h3>
                  <span className="chat-status">Website Help</span>
                </div>
              </div>
              <div className="chat-header-actions">
                <button
                  className="chat-action-btn"
                  onClick={handleReset}
                  title="Restart Chat"
                >
                  ↺
                </button>
                <button
                  className="chat-action-btn"
                  onClick={toggleMinimize}
                  title={isMinimized ? "Maximize" : "Minimize"}
                >
                  {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </button>
                <button
                  className="chat-action-btn close-btn"
                  onClick={handleClose}
                  title="Close"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            {!isMinimized && (
              <div className="chat-window-body">
                {/* Chat Interface */}
                <>
                  <div className="chat-messages">
                    {messages.map((message, index) => (
                      <motion.div
                        key={index}
                        className={`chat-message ${message.role}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="message-avatar">
                          {message.role === 'bot' ? <Bot size={16} /> : <HelpCircle size={16} />}
                        </div>
                        <div className="message-content">
                          <p>{message.content}</p>
                          <span className="message-time">
                            {new Date(message.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </motion.div>
                    ))}

                    {isLoading && (
                      <div className="chat-message bot">
                        <div className="message-avatar">
                          <Bot size={16} />
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

                    {/* Quick Action Buttons */}
                    {showQuickActions && messages.length === 1 && !isLoading && (
                      <motion.div
                        className="quick-actions-container"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className="quick-actions-grid">
                          {quickActions.map((action, index) => (
                            <motion.button
                              key={index}
                              className="quick-action-btn"
                              onClick={() => handleQuickAction(action.question)}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.4 + (index * 0.1) }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <span className="quick-action-icon">{action.icon}</span>
                              <span className="quick-action-label">{action.label}</span>
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  <form className="chat-input-form" onSubmit={handleSendMessage}>
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Ask me anything about the website..."
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={!inputMessage.trim() || isLoading}
                      className="send-button"
                    >
                      <Send size={18} />
                    </button>
                  </form>
                </>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
