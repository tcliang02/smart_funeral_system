'use client';

import { useState, useEffect, useRef } from 'react';
import { BACKEND_URL } from "../config";
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader, Heart, Sparkles, MessageCircle, User, Bot, Trash2, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/logger';

export default function AIChatbot() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const messagesEndRef = useRef(null);

  // Load conversation from session storage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Try to restore previous conversation from session storage
    const savedConversation = sessionStorage.getItem('grief_ai_conversation');

    if (savedConversation) {
      try {
        const parsed = JSON.parse(savedConversation);
        setMessages(parsed);
      } catch (error) {
        logger.error('Error loading saved conversation', { error: error.message });
        // Fallback to initial greeting
        setInitialGreeting();
      }
    } else {
      // First time - show initial greeting
      setInitialGreeting();
    }
  }, []);

  // Helper function to set initial greeting
  const setInitialGreeting = () => {
    setMessages([{
      role: 'assistant',
      content: "Hello, I'm here to support you during this difficult time. I understand that losing a loved one is never easy. I'm a compassionate AI trained to provide grief support and help you process your emotions. How are you feeling today? Is there anything you'd like to talk about or any way I can help?",
      timestamp: new Date().toISOString()
    }]);
  };

  // Save conversation to session storage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem('grief_ai_conversation', JSON.stringify(messages));
    }
  }, [messages]);

  // Removed auto-scroll - user can manually scroll
  // useEffect(() => {
  //   scrollToBottom();
  // }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    // Add user message to chat
    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Prepare conversation history (last 10 messages for context)
      const history = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch('/api/backend/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage,
          user_id: user?.user_id || user?.id,
          mode: 'grief',
          conversation_history: history
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const botMessage = {
          role: 'assistant',
          content: data.reply,
          timestamp: data.timestamp
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(data.message || 'Failed to get response from chatbot');
      }
    } catch (error) {
      logger.error('Chatbot error', {
        message: error.message || error.toString(),
        error: error
      });
      const errorMessage = {
        role: 'assistant',
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment. If you need immediate support, please reach out to a grief counselor or crisis hotline: Befrienders KL (03-76272929) available 24/7 or WhatsApp TBAN at 018-9888058.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedPrompts = [
    "I'm struggling with grief today",
    "How do I cope with this loss?",
    "Tell me about the stages of grief",
    "I want to share a memory",
    "Help me plan a memorial",
    "I feel guilty about moving on",
    "How do I talk to my children about death?",
    "I'm having trouble sleeping"
  ];

  const handleSuggestedPrompt = (prompt) => {
    setInputMessage(prompt);
  };

  const clearChat = () => {
    if (confirm('Are you sure you want to clear the conversation? This will delete all messages from this session.')) {
      const freshMessages = [{
        role: 'assistant',
        content: "The conversation has been cleared. How can I support you today?",
        timestamp: new Date().toISOString()
      }];
      setMessages(freshMessages);
      // Clear from session storage
      sessionStorage.removeItem('grief_ai_conversation');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/grief-support')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Counselor AI</h1>
                  <p className="text-sm text-gray-600">Your compassionate grief support companion</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Available 24/7
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                <Heart className="w-4 h-4" />
                Family Only
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat Area */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col"
              style={{ height: 'calc(100vh - 250px)', minHeight: '600px' }}
            >
              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <AnimatePresence>
                  {messages.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      )}

                      <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-2xl`}>
                        <div className={`px-4 py-3 rounded-2xl ${msg.role === 'user'
                          ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                          }`}>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        <span className="text-xs text-gray-500 mt-1 px-2">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      {msg.role === 'user' && (
                        <div className="flex-shrink-0">
                          {user?.profile_photo ? (
                            <img
                              src={`${BACKEND_URL}/uploads/profiles/${user.profile_photo}`}
                              alt={user.name || 'User'}
                              className="w-10 h-10 rounded-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center" style={{ display: user?.profile_photo ? 'none' : 'flex' }}>
                            <User className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-gray-100 px-4 py-3 rounded-2xl">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggested Prompts */}
              {messages.length <= 2 && (
                <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    Suggested topics to explore:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {suggestedPrompts.slice(0, 4).map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestedPrompt(prompt)}
                        className="px-3 py-2 bg-white hover:bg-purple-50 border border-gray-200 hover:border-purple-300 rounded-lg text-sm text-gray-700 hover:text-purple-700 transition-all duration-200 text-left"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="p-6 bg-white border-t border-gray-200">
                <form onSubmit={sendMessage} className="flex gap-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Share your thoughts or ask me anything..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {isLoading ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </form>

                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      🔒 Conversation saved for this session only
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-purple-600 font-medium">
                      {messages.length - 1} {messages.length === 2 ? 'message' : 'messages'}
                    </span>
                  </span>
                  {messages.length > 2 && (
                    <button
                      onClick={clearChat}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700 font-medium"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear chat
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* How I Can Help */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <h3 className="text-lg font-semibold text-gray-900">How I Can Help</h3>
              </div>
              <ul className="space-y-3">
                {[
                  { icon: '💬', text: 'Listen without judgment' },
                  { icon: '🤝', text: 'Provide emotional support' },
                  { icon: '📚', text: 'Share coping strategies' },
                  { icon: '🪷', text: 'Buddhist grief wisdom' },
                  { icon: '🙏', text: 'Meditation guidance' },
                  { icon: '💭', text: 'Process complex emotions' },
                  { icon: '📖', text: 'Suggest healing resources' }
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm text-gray-700">
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Crisis Support */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-red-900 mb-2">Need Immediate Help?</h3>
              <p className="text-sm text-red-700 mb-4">If you're in crisis, please contact:</p>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3 border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-red-900">03-7627 2929</p>
                      <p className="text-xs text-red-700">Befrienders KL (24/7)</p>
                    </div>
                    <a href="tel:03-76272929" className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors">
                      Call
                    </a>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-red-900">018-988 8058</p>
                      <p className="text-xs text-red-700">TBAN WhatsApp</p>
                    </div>
                    <a href="https://wa.me/60189888058" target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors">
                      WhatsApp
                    </a>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-red-900">15999</p>
                      <p className="text-xs text-red-700">Talian Kasih (24/7)</p>
                    </div>
                    <a href="tel:15999" className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors">
                      Call
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* About */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-purple-900 mb-2">About This AI</h3>
              <p className="text-sm text-purple-800 leading-relaxed">
                This AI counselor is trained specifically for grief support.
                While I can provide comfort and guidance, I'm not a replacement
                for professional therapy. If you need clinical support, please
                consult a licensed grief counselor.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

