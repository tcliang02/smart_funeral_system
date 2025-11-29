'use client';

import Link from "next/link";
import { MessageCircle, Mic2, Heart, Shield, Clock, Sparkles, Wind, Book } from "lucide-react";
import { useState } from "react";
import BreathingMeditation from "../components/BreathingMeditation";
import BuddhistGriefResources from "../components/BuddhistGriefResources";
import "./GriefSupportHub.css";

export default function GriefSupportHub() {
  const [activeTab, setActiveTab] = useState('tools'); // 'tools', 'meditation', 'resources'
  
  return (
    <div className="grief-support-hub">
      {/* Hero Section */}
      <div className="grief-hero">
        <div className="grief-hero-content">
          <div className="grief-hero-badge">
            <Heart className="badge-icon" />
            <span>AI-Powered Support</span>
          </div>
          <h1 className="grief-hero-title">Grief Support & Healing Tools</h1>
          <p className="grief-hero-description">
            We're here to support you through every step of your grief journey with 
            compassionate AI technology designed to listen, comfort, and preserve precious memories.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grief-container">
        {/* Tab Navigation */}
        <div className="mb-8 bg-white rounded-xl shadow-lg p-2 inline-flex gap-2">
          <button
            onClick={() => setActiveTab('tools')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'tools'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Heart size={20} />
            AI Support Tools
          </button>
          <button
            onClick={() => setActiveTab('meditation')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'meditation'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Wind size={20} />
            Meditation & Calm
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'resources'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Book size={20} />
            Buddhist Resources
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'tools' && (
          <>
        {/* Feature Cards */}
        <div className="grief-features">
          {/* Chat Counselor Card */}
          <div className="grief-feature-card chat-card">
            <div className="feature-icon-wrapper">
              <MessageCircle className="feature-icon" />
            </div>
            <h2 className="feature-title">AI Grief Counselor</h2>
            <p className="feature-description">
              Talk to our compassionate AI counselor anytime you need support. 
              Get guidance, comfort, and understanding 24/7 in a private, judgment-free space.
            </p>
            
            <div className="feature-benefits">
              <div className="benefit-item">
                <Shield className="benefit-icon" />
                <span>Private & Safe</span>
              </div>
              <div className="benefit-item">
                <Clock className="benefit-icon" />
                <span>Available 24/7</span>
              </div>
              <div className="benefit-item">
                <Heart className="benefit-icon" />
                <span>Non-judgmental</span>
              </div>
              <div className="benefit-item">
                <Sparkles className="benefit-icon" />
                <span>Always Free</span>
              </div>
            </div>

            <Link href="/grief-support/chat" className="feature-cta chat-cta">
              <MessageCircle size={20} />
              <span>Start Chatting</span>
              <span className="cta-arrow">→</span>
            </Link>
          </div>

          {/* Voice Memories Card */}
          <div className="grief-feature-card voice-card">
            <div className="feature-icon-wrapper voice-icon-wrapper">
              <Mic2 className="feature-icon" />
            </div>
            <h2 className="feature-title">AI Voice Memories</h2>
            <p className="feature-description">
              Preserve their voice forever with cutting-edge AI voice cloning technology. 
              Ask questions and hear responses in their unique voice, tone, and warmth.
            </p>
            
            <div className="feature-benefits">
              <div className="benefit-item">
                <Mic2 className="benefit-icon" />
                <span>Their Real Voice</span>
              </div>
              <div className="benefit-item">
                <Heart className="benefit-icon" />
                <span>Share Memories</span>
              </div>
              <div className="benefit-item">
                <Sparkles className="benefit-icon" />
                <span>Unique Personality</span>
              </div>
              <div className="benefit-item">
                <Shield className="benefit-icon" />
                <span>Premium Feature</span>
              </div>
            </div>

            <Link href="/grief-support/voice" className="feature-cta voice-cta">
              <Mic2 size={20} />
              <span>Create Voice AI</span>
              <span className="cta-arrow">→</span>
            </Link>
          </div>
        </div>

        {/* How It Helps Section */}
        <div className="grief-info-section">
          <h3 className="info-title">How Grief Support Helps You Heal</h3>
          <div className="info-grid">
            <div className="info-card">
              <h4>🤝 Constant Companion</h4>
              <p>Never feel alone in your grief journey. Our AI is available whenever you need someone to talk to.</p>
            </div>
            <div className="info-card">
              <h4>💬 Express Freely</h4>
              <p>Share your thoughts, feelings, and memories without fear of judgment or time constraints.</p>
            </div>
            <div className="info-card">
              <h4>🎯 Personalized Support</h4>
              <p>Get guidance tailored to your unique situation and stage of grief.</p>
            </div>
            <div className="info-card">
              <h4>❤️ Preserve Connection</h4>
              <p>Keep their memory alive through voice technology that captures their essence.</p>
            </div>
          </div>
        </div>

        {/* Crisis Resources */}
        <div className="crisis-resources">
          <div className="crisis-icon">
            <Heart size={32} />
          </div>
          <h3 className="crisis-title">Need Immediate Help?</h3>
          <p className="crisis-description">
            If you're experiencing a mental health crisis, please reach out to these resources:
          </p>
          <div className="crisis-links">
            <a href="tel:03-76272929" className="crisis-link">
              <span className="crisis-number">03-7627 2929</span>
              <span className="crisis-label">Befrienders KL (24/7)</span>
            </a>
            <a href="https://wa.me/60189888058" target="_blank" rel="noopener noreferrer" className="crisis-link">
              <span className="crisis-number">018-988 8058</span>
              <span className="crisis-label">TBAN WhatsApp Support</span>
            </a>
            <a href="tel:15999" className="crisis-link">
              <span className="crisis-number">15999</span>
              <span className="crisis-label">Talian Kasih (24/7)</span>
            </a>
          </div>
          <p className="crisis-note">
            Our AI tools are designed to support you, but they are not a replacement for 
            professional mental health care or crisis intervention.
          </p>
        </div>
        </>
        )}

        {/* Meditation Tab */}
        {activeTab === 'meditation' && (
          <div className="max-w-4xl mx-auto">
            <BreathingMeditation />
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="max-w-6xl mx-auto">
            <BuddhistGriefResources />
          </div>
        )}
      </div>
    </div>
  );
}
