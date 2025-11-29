# 🎙️ AI Voice Chatbot - Complete Implementation Plan

## 📊 Executive Summary

This document outlines the implementation of **TWO major AI features** for your Smart Funeral System:

1. **✅ AI Grief Support Chatbot** (Already Built - DeepSeek API)
2. **🎙️ AI Voice Chatbot** (New - ElevenLabs + DeepSeek)

---

## 🎯 Feature Comparison

| Feature | Grief Support Chatbot | AI Voice Chatbot |
|---------|----------------------|------------------|
| **Purpose** | Emotional support & platform help | Speak with loved one's voice |
| **Primary API** | DeepSeek (text responses) | ElevenLabs (voice synthesis) |
| **Secondary API** | - | DeepSeek (personality/memories) |
| **Input** | User types questions | User speaks/types questions |
| **Output** | Text responses | Audio in deceased's voice |
| **Use Case** | General grief counseling | Personal connection to specific person |
| **Emotional Impact** | Supportive & healing | VERY powerful - use carefully |
| **Cost** | ~$0.002 per conversation | ~$0.05-0.20 per response |
| **Setup Complexity** | Simple ⭐⭐ | Complex ⭐⭐⭐⭐⭐ |
| **Status** | ✅ Complete | 📋 Planning phase |

---

## 🎙️ AI Voice Chatbot - Detailed Plan

### Concept Overview

**What Users Experience:**
1. Family uploads voice samples of deceased (30s - 3min audio)
2. System creates voice clone using ElevenLabs
3. Family members add memories, personality traits, stories
4. Users can ask questions and hear responses in their loved one's voice
5. AI combines personality data + voice cloning for realistic experience

**Technical Architecture:**

```
┌──────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                       │
├──────────────────────────────────────────────────────────┤
│  1. Voice Upload Page (family only)                      │
│     - Record or upload audio files                       │
│     - Minimum 30 seconds of clear speech                 │
│     - Preview and quality check                          │
│                                                           │
│  2. Memory Collection Page (family only)                 │
│     - Add personality traits                             │
│     - Upload stories and memories                        │
│     - Common phrases they used                           │
│     - Speaking style (formal, casual, humorous)          │
│                                                           │
│  3. Voice Chat Interface (all visitors)                  │
│     - Microphone input OR text input                     │
│     - Audio playback of responses                        │
│     - Conversation history                               │
│     - Privacy controls (family decides who can access)   │
└──────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────┐
│                    BACKEND (PHP)                          │
├──────────────────────────────────────────────────────────┤
│  1. voiceUpload.php                                      │
│     - Upload audio to server                             │
│     - Send to ElevenLabs Voice Cloning API               │
│     - Store voice_id in database                         │
│                                                           │
│  2. memoryManagement.php                                 │
│     - CRUD operations for memories/traits                │
│     - Build personality profile                          │
│                                                           │
│  3. voiceChatbot.php (Main Intelligence)                 │
│     - Receive user question                              │
│     - Fetch personality profile from DB                  │
│     - Send to DeepSeek with context                      │
│     - Get text response matching personality             │
│     - Send text to ElevenLabs Text-to-Speech             │
│     - Return audio file URL                              │
└──────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────┐
│                    EXTERNAL APIs                          │
├──────────────────────────────────────────────────────────┤
│  ElevenLabs API (https://api.elevenlabs.io)             │
│  ├─ Voice Cloning: /v1/voices/add                       │
│  │  Input: Audio file(s)                                │
│  │  Output: voice_id                                    │
│  │                                                       │
│  └─ Text-to-Speech: /v1/text-to-speech/{voice_id}      │
│     Input: Text + voice_id                              │
│     Output: MP3/WAV audio file                          │
│                                                           │
│  DeepSeek API (https://api.deepseek.com)                │
│  └─ Chat Completions: /v1/chat/completions              │
│     Input: User question + personality context          │
│     Output: Response in deceased's style                │
└──────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

### New Tables Required

**1. voice_models**
```sql
CREATE TABLE voice_models (
    voice_id INT AUTO_INCREMENT PRIMARY KEY,
    tribute_id INT NOT NULL,
    elevenlabs_voice_id VARCHAR(255) NOT NULL,
    audio_sample_path VARCHAR(500),
    sample_duration INT, -- seconds
    quality_score DECIMAL(3,2), -- 0.00 to 1.00
    status ENUM('processing', 'ready', 'failed') DEFAULT 'processing',
    created_by INT, -- user_id of family member
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tribute_id) REFERENCES tributes(tribute_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**2. personality_traits**
```sql
CREATE TABLE personality_traits (
    trait_id INT AUTO_INCREMENT PRIMARY KEY,
    tribute_id INT NOT NULL,
    category ENUM('personality', 'speech_pattern', 'humor_style', 'values', 'interests'),
    trait_key VARCHAR(100), -- e.g., 'speaking_pace', 'formality_level'
    trait_value TEXT, -- e.g., 'slow and thoughtful', 'informal and friendly'
    added_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tribute_id) REFERENCES tributes(tribute_id) ON DELETE CASCADE,
    FOREIGN KEY (added_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**3. memories_database**
```sql
CREATE TABLE memories_database (
    memory_id INT AUTO_INCREMENT PRIMARY KEY,
    tribute_id INT NOT NULL,
    memory_type ENUM('story', 'phrase', 'belief', 'experience', 'relationship'),
    title VARCHAR(255),
    content TEXT NOT NULL,
    context TEXT, -- When/where this was relevant
    importance ENUM('high', 'medium', 'low') DEFAULT 'medium',
    added_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tribute_id) REFERENCES tributes(tribute_id) ON DELETE CASCADE,
    FOREIGN KEY (added_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_tribute_type (tribute_id, memory_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**4. voice_conversations**
```sql
CREATE TABLE voice_conversations (
    conversation_id INT AUTO_INCREMENT PRIMARY KEY,
    tribute_id INT NOT NULL,
    user_id INT,
    user_input TEXT NOT NULL,
    input_method ENUM('text', 'voice') DEFAULT 'text',
    ai_response TEXT NOT NULL,
    audio_url VARCHAR(500), -- ElevenLabs audio file
    personality_context JSON, -- What memories/traits were used
    duration_seconds INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tribute_id) REFERENCES tributes(tribute_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_tribute (tribute_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**5. voice_chat_settings**
```sql
CREATE TABLE voice_chat_settings (
    setting_id INT AUTO_INCREMENT PRIMARY KEY,
    tribute_id INT NOT NULL UNIQUE,
    is_enabled BOOLEAN DEFAULT FALSE,
    access_level ENUM('family_only', 'all_visitors', 'invited_only') DEFAULT 'family_only',
    disclaimer_shown BOOLEAN DEFAULT TRUE,
    response_style ENUM('conversational', 'formal', 'warm', 'humorous') DEFAULT 'conversational',
    max_daily_conversations INT DEFAULT 50,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tribute_id) REFERENCES tributes(tribute_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 🔧 API Integration Details

### ElevenLabs API Setup

**Pricing Plans:**
- **Free Tier**: 10,000 characters/month (testing only)
- **Starter**: $5/month - 30,000 characters
- **Creator**: $22/month - 100,000 characters
- **Pro**: $99/month - 500,000 characters
- **Recommended**: Creator plan for production

**Voice Cloning Process:**

**Step 1: Upload Voice Sample**
```php
// File: backend/elevenLabsVoiceClone.php

<?php
header('Content-Type: application/json');
require_once 'db_connect.php';

$apiKey = 'YOUR_ELEVENLABS_API_KEY';
$tributeId = $_POST['tribute_id'];
$uploadedFile = $_FILES['audio_sample'];

// ElevenLabs requires:
// - 30 seconds to 3 minutes of audio
// - Clear speech, no background noise
// - WAV, MP3, or M4A format
// - Sample rate: 44.1kHz recommended

$url = 'https://api.elevenlabs.io/v1/voices/add';

$data = [
    'name' => "Tribute_{$tributeId}_Voice",
    'files' => new CURLFile($uploadedFile['tmp_name'], $uploadedFile['type'], $uploadedFile['name']),
    'description' => "Voice clone for tribute ID: {$tributeId}"
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "xi-api-key: {$apiKey}"
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    $result = json_decode($response, true);
    $voiceId = $result['voice_id'];
    
    // Save to database
    $stmt = $conn->prepare("INSERT INTO voice_models (tribute_id, elevenlabs_voice_id, audio_sample_path, status, created_by) VALUES (?, ?, ?, 'ready', ?)");
    $stmt->bind_param("issi", $tributeId, $voiceId, $uploadedFile['name'], $_SESSION['user_id']);
    $stmt->execute();
    
    echo json_encode(['success' => true, 'voice_id' => $voiceId]);
} else {
    echo json_encode(['success' => false, 'error' => 'Voice cloning failed']);
}
?>
```

**Step 2: Text-to-Speech Conversion**
```php
// File: backend/voiceChatbot.php

<?php
header('Content-Type: application/json');
require_once 'db_connect.php';

$data = json_decode(file_get_contents('php://input'), true);
$tributeId = $data['tribute_id'];
$userQuestion = $data['question'];

// 1. Get voice model
$stmt = $conn->prepare("SELECT elevenlabs_voice_id FROM voice_models WHERE tribute_id = ? AND status = 'ready' LIMIT 1");
$stmt->bind_param("i", $tributeId);
$stmt->execute();
$result = $stmt->get_result()->fetch_assoc();
$voiceId = $result['elevenlabs_voice_id'];

// 2. Get personality data
$stmt = $conn->prepare("SELECT trait_key, trait_value FROM personality_traits WHERE tribute_id = ?");
$stmt->bind_param("i", $tributeId);
$stmt->execute();
$traits = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

// 3. Get relevant memories
$stmt = $conn->prepare("SELECT title, content, context FROM memories_database WHERE tribute_id = ? AND importance IN ('high', 'medium') ORDER BY created_at DESC LIMIT 10");
$stmt->bind_param("i", $tributeId);
$stmt->execute();
$memories = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

// 4. Build personality context for DeepSeek
$personalityPrompt = "You are speaking as the deceased person. Here's what you need to know about them:\n\n";
$personalityPrompt .= "PERSONALITY TRAITS:\n";
foreach ($traits as $trait) {
    $personalityPrompt .= "- {$trait['trait_key']}: {$trait['trait_value']}\n";
}
$personalityPrompt .= "\nMEMORIES & EXPERIENCES:\n";
foreach ($memories as $memory) {
    $personalityPrompt .= "- {$memory['title']}: {$memory['content']}\n";
}
$personalityPrompt .= "\nSpeak in FIRST PERSON as if you are this person. Use their language style, tone, and personality. Be warm and authentic.";

// 5. Get response from DeepSeek
$deepseekApiKey = 'YOUR_DEEPSEEK_API_KEY';
$deepseekUrl = 'https://api.deepseek.com/v1/chat/completions';

$messages = [
    ['role' => 'system', 'content' => $personalityPrompt],
    ['role' => 'user', 'content' => $userQuestion]
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $deepseekUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'model' => 'deepseek-chat',
    'messages' => $messages,
    'temperature' => 0.8, // Higher for more personality
    'max_tokens' => 500
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    "Authorization: Bearer {$deepseekApiKey}"
]);

$response = curl_exec($ch);
curl_close($ch);

$deepseekResult = json_decode($response, true);
$textResponse = $deepseekResult['choices'][0]['message']['content'];

// 6. Convert to speech with ElevenLabs
$elevenLabsApiKey = 'YOUR_ELEVENLABS_API_KEY';
$ttsUrl = "https://api.elevenlabs.io/v1/text-to-speech/{$voiceId}";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $ttsUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'text' => $textResponse,
    'model_id' => 'eleven_multilingual_v2',
    'voice_settings' => [
        'stability' => 0.5,
        'similarity_boost' => 0.75
    ]
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    "xi-api-key: {$elevenLabsApiKey}"
]);

$audioData = curl_exec($ch);
curl_close($ch);

// 7. Save audio file
$audioFilename = "voice_response_" . time() . "_" . uniqid() . ".mp3";
$audioPath = "../uploads/voice_responses/" . $audioFilename;
file_put_contents($audioPath, $audioData);

// 8. Save conversation to database
$stmt = $conn->prepare("INSERT INTO voice_conversations (tribute_id, user_id, user_input, ai_response, audio_url) VALUES (?, ?, ?, ?, ?)");
$userId = $_SESSION['user_id'] ?? null;
$audioUrl = "/uploads/voice_responses/" . $audioFilename;
$stmt->bind_param("iisss", $tributeId, $userId, $userQuestion, $textResponse, $audioUrl);
$stmt->execute();

// 9. Return response
echo json_encode([
    'success' => true,
    'text_response' => $textResponse,
    'audio_url' => $audioUrl,
    'duration' => strlen($textResponse) * 0.06 // Rough estimate: ~60ms per character
]);
?>
```

---

## 🎨 Frontend Components

### 1. Voice Upload Component

```jsx
// File: frontend/my-app/src/components/VoiceUpload.jsx

import { useState } from "react";
import { Upload, Mic, CheckCircle, AlertCircle } from "lucide-react";
import "./VoiceUpload.css";

export default function VoiceUpload({ tributeId }) {
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [audioFile, setAudioFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    const validTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/m4a'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload WAV, MP3, or M4A file');
      return;
    }

    // Check duration (need at least 30 seconds)
    const audio = new Audio(URL.createObjectURL(file));
    audio.onloadedmetadata = async () => {
      if (audio.duration < 30) {
        alert('Audio must be at least 30 seconds long');
        return;
      }

      setUploadStatus('uploading');
      const formData = new FormData();
      formData.append('audio_sample', file);
      formData.append('tribute_id', tributeId);

      try {
        const response = await fetch('/backend/elevenLabsVoiceClone.php', {
          method: 'POST',
          body: formData
        });

        const data = await response.json();
        if (data.success) {
          setUploadStatus('success');
        } else {
          setUploadStatus('error');
        }
      } catch (error) {
        console.error(error);
        setUploadStatus('error');
      }
    };
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setRecordedAudio(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Stop after 3 minutes max
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          setIsRecording(false);
        }
      }, 180000);
    } catch (error) {
      alert('Microphone access denied');
    }
  };

  return (
    <div className="voice-upload-container">
      <h2>Create Voice Clone</h2>
      <p className="upload-description">
        Upload or record a voice sample of your loved one. 
        We need at least 30 seconds of clear speech.
      </p>

      <div className="upload-options">
        {/* File Upload */}
        <div className="upload-card">
          <Upload size={48} />
          <h3>Upload Audio File</h3>
          <p>WAV, MP3, or M4A format</p>
          <input 
            type="file" 
            accept="audio/*"
            onChange={handleFileUpload}
            id="audio-upload"
          />
          <label htmlFor="audio-upload" className="upload-button">
            Choose File
          </label>
        </div>

        {/* Record Audio */}
        <div className="upload-card">
          <Mic size={48} />
          <h3>Record Audio</h3>
          <p>Record directly from your device</p>
          <button 
            onClick={isRecording ? stopRecording : startRecording}
            className={`record-button ${isRecording ? 'recording' : ''}`}
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {uploadStatus === 'uploading' && (
        <div className="status-message uploading">
          <div className="spinner"></div>
          <p>Creating voice clone... This may take a minute.</p>
        </div>
      )}

      {uploadStatus === 'success' && (
        <div className="status-message success">
          <CheckCircle size={24} />
          <p>Voice clone created successfully!</p>
        </div>
      )}

      {uploadStatus === 'error' && (
        <div className="status-message error">
          <AlertCircle size={24} />
          <p>Voice clone failed. Please try again with better quality audio.</p>
        </div>
      )}

      {/* Tips */}
      <div className="upload-tips">
        <h4>Tips for Best Results:</h4>
        <ul>
          <li>✓ Use clear, noise-free audio</li>
          <li>✓ Include varied speech (different sentences)</li>
          <li>✓ Avoid background music or noise</li>
          <li>✓ 1-3 minutes is ideal length</li>
          <li>✓ Natural speaking voice (not shouting/whispering)</li>
        </ul>
      </div>
    </div>
  );
}
```

### 2. Memory Collection Component

```jsx
// File: frontend/my-app/src/components/MemoryCollection.jsx

import { useState, useEffect } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import "./MemoryCollection.css";

export default function MemoryCollection({ tributeId }) {
  const [memories, setMemories] = useState([]);
  const [traits, setTraits] = useState([]);
  const [newMemory, setNewMemory] = useState({
    type: 'story',
    title: '',
    content: '',
    importance: 'medium'
  });

  useEffect(() => {
    fetchMemories();
    fetchTraits();
  }, [tributeId]);

  const fetchMemories = async () => {
    const response = await fetch(`/backend/getMemories.php?tribute_id=${tributeId}`);
    const data = await response.json();
    setMemories(data.memories || []);
  };

  const fetchTraits = async () => {
    const response = await fetch(`/backend/getTraits.php?tribute_id=${tributeId}`);
    const data = await response.json();
    setTraits(data.traits || []);
  };

  const addMemory = async () => {
    if (!newMemory.title || !newMemory.content) {
      alert('Please fill in all fields');
      return;
    }

    const response = await fetch('/backend/addMemory.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newMemory, tribute_id: tributeId })
    });

    const data = await response.json();
    if (data.success) {
      fetchMemories();
      setNewMemory({ type: 'story', title: '', content: '', importance: 'medium' });
    }
  };

  return (
    <div className="memory-collection">
      <h2>Build Personality Profile</h2>
      <p>Add memories, stories, and personality traits to make the AI voice more authentic.</p>

      {/* Personality Traits Section */}
      <section className="traits-section">
        <h3>Personality Traits</h3>
        <div className="trait-grid">
          <TraitInput label="Speaking Pace" placeholder="e.g., Slow and thoughtful" />
          <TraitInput label="Formality Level" placeholder="e.g., Casual and friendly" />
          <TraitInput label="Humor Style" placeholder="e.g., Dry wit, dad jokes" />
          <TraitInput label="Common Phrases" placeholder="e.g., 'Well, I'll be...'" />
        </div>
      </section>

      {/* Memories Section */}
      <section className="memories-section">
        <h3>Memories & Stories</h3>
        
        <div className="add-memory-form">
          <select 
            value={newMemory.type}
            onChange={(e) => setNewMemory({...newMemory, type: e.target.value})}
          >
            <option value="story">Story</option>
            <option value="phrase">Favorite Phrase</option>
            <option value="belief">Belief/Value</option>
            <option value="experience">Life Experience</option>
          </select>

          <input
            type="text"
            placeholder="Memory Title"
            value={newMemory.title}
            onChange={(e) => setNewMemory({...newMemory, title: e.target.value})}
          />

          <textarea
            placeholder="Describe the memory in detail..."
            value={newMemory.content}
            onChange={(e) => setNewMemory({...newMemory, content: e.target.value})}
            rows={4}
          />

          <select
            value={newMemory.importance}
            onChange={(e) => setNewMemory({...newMemory, importance: e.target.value})}
          >
            <option value="high">High Importance</option>
            <option value="medium">Medium Importance</option>
            <option value="low">Low Importance</option>
          </select>

          <button onClick={addMemory} className="add-memory-btn">
            <Plus size={20} />
            Add Memory
          </button>
        </div>

        {/* Existing Memories List */}
        <div className="memories-list">
          {memories.map((memory) => (
            <div key={memory.memory_id} className="memory-card">
              <span className="memory-type">{memory.memory_type}</span>
              <h4>{memory.title}</h4>
              <p>{memory.content}</p>
              <div className="memory-meta">
                <span className={`importance ${memory.importance}`}>
                  {memory.importance} importance
                </span>
                <button className="delete-btn">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
```

### 3. Voice Chat Interface

```jsx
// File: frontend/my-app/src/components/VoiceChat.jsx

import { useState, useEffect, useRef } from "react";
import { Mic, Send, Volume2, StopCircle } from "lucide-react";
import "./VoiceChat.css";

export default function VoiceChat({ tributeId }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const audioRef = useRef(null);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch('/backend/voiceChatbot.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tribute_id: tributeId,
          question: text
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const aiMessage = {
          role: 'assistant',
          content: data.text_response,
          audioUrl: data.audio_url
        };
        setMessages(prev => [...prev, aiMessage]);
        
        // Auto-play audio
        playAudio(data.audio_url);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = (url) => {
    if (currentAudio) {
      currentAudio.pause();
    }
    const audio = new Audio(url);
    audio.play();
    setCurrentAudio(audio);
  };

  const startVoiceInput = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      sendMessage(transcript);
      setIsListening(false);
    };
    recognition.start();
    setIsListening(true);
  };

  return (
    <div className="voice-chat-container">
      <div className="chat-header">
        <h2>Speak with {/* Loved One's Name */}</h2>
        <p>Ask questions, share thoughts, or just talk</p>
      </div>

      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="message-content">
              <p>{msg.content}</p>
              {msg.audioUrl && (
                <button 
                  className="play-audio-btn"
                  onClick={() => playAudio(msg.audioUrl)}
                >
                  <Volume2 size={16} />
                  Play Voice
                </button>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message assistant">
            <div className="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
      </div>

      <div className="chat-input-area">
        <button 
          className={`voice-input-btn ${isListening ? 'listening' : ''}`}
          onClick={startVoiceInput}
          disabled={isLoading}
        >
          {isListening ? <StopCircle size={24} /> : <Mic size={24} />}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputText)}
          placeholder="Type your message or use voice..."
          disabled={isLoading}
        />

        <button 
          onClick={() => sendMessage(inputText)}
          disabled={isLoading || !inputText.trim()}
          className="send-btn"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
```

---

## ⚠️ Ethical Considerations & Safeguards

### Important Warnings

**1. Emotional Impact**
This technology is EXTREMELY powerful emotionally. You MUST:
- ✅ Show clear disclaimers that this is AI, not the real person
- ✅ Require family consent before enabling voice chat
- ✅ Provide easy opt-out for family members
- ✅ Include grief counselor resources
- ✅ Monitor for unhealthy usage patterns

**2. Privacy & Consent**
- ✅ Only family members can upload voice samples
- ✅ Get explicit permission from all family members
- ✅ Allow anyone to request voice removal
- ✅ Secure storage of voice models
- ✅ Clear data retention policies

**3. Recommended Disclaimer**

```jsx
<div className="ai-disclaimer">
  <h3>⚠️ Important Notice</h3>
  <p>
    This is an AI-generated voice based on memories and recordings. 
    It is NOT the actual voice of your loved one speaking to you. 
    This technology is meant to provide comfort and preserve memories, 
    but should not replace professional grief counseling.
  </p>
  <p>
    If you're experiencing intense grief, please contact:
    <br />• 988 Suicide & Crisis Lifeline
    <br />• 741741 Crisis Text Line
  </p>
  <label>
    <input type="checkbox" required />
    I understand this is AI technology and will use it responsibly
  </label>
</div>
```

---

## 📊 Cost Estimates

### Monthly Operating Costs

**Scenario: 100 active tributes with voice chat**

| Service | Usage | Cost |
|---------|-------|------|
| ElevenLabs (Creator Plan) | 100,000 characters/month | $22/month |
| DeepSeek API | ~50,000 conversations | ~$10/month |
| Audio Storage (AWS S3) | 50GB | ~$1.15/month |
| **Total** | | **~$33/month** |

**Revenue Model Suggestions:**
- Free: Grief support chatbot
- Premium ($5-10/month): Voice chatbot access
- One-time: Voice cloning setup ($25-50)

---

## 🚀 Implementation Timeline

### Phase 1: Foundation (Week 1-2)
- [ ] Create database tables
- [ ] Set up ElevenLabs account
- [ ] Build voice upload component
- [ ] Test voice cloning API

### Phase 2: Intelligence (Week 3-4)
- [ ] Build memory collection interface
- [ ] Create personality profile system
- [ ] Integrate DeepSeek with personality context
- [ ] Test response quality

### Phase 3: Voice Chat (Week 5-6)
- [ ] Build voice chat interface
- [ ] Integrate text-to-speech
- [ ] Add voice input capability
- [ ] Test end-to-end flow

### Phase 4: Polish & Safety (Week 7-8)
- [ ] Add disclaimers
- [ ] Implement access controls
- [ ] Create admin dashboard
- [ ] User testing with real families
- [ ] Grief counselor consultation

### Phase 5: Launch (Week 9)
- [ ] Soft launch to beta users
- [ ] Monitor emotional impact
- [ ] Gather feedback
- [ ] Adjust as needed

---

## 🎯 Success Metrics

### Technical Metrics
- Voice clone quality score > 0.85
- Response time < 5 seconds
- Audio generation success rate > 95%
- User satisfaction > 4.5/5

### Emotional Safety Metrics
- Zero crisis incidents
- Grief counselor approval
- Family member comfort level > 4/5
- Healthy usage patterns (not excessive dependency)

---

## 🔐 Security & Privacy

### Required Security Measures

1. **Voice Model Protection**
   - Encrypt voice_id in database
   - Restrict API access by IP
   - Rate limiting per tribute
   - Audit logs for all voice generations

2. **Access Control**
   - Family-only voice upload
   - Tribute owner can disable voice chat
   - Guest access requires family approval
   - Delete voice model option

3. **Data Retention**
   - Voice samples deleted after cloning
   - Conversation history retention limit (90 days)
   - Right to be forgotten compliance
   - Export data capability

---

## 📚 Additional Resources

### Recommended Reading
- ElevenLabs Docs: https://docs.elevenlabs.io/
- DeepSeek API Docs: https://platform.deepseek.com/docs
- Grief Tech Ethics: [Research papers on digital memorials]
- Voice Cloning Best Practices

### Support Resources
- Grief counseling integration
- Crisis hotline partnerships
- Digital legacy guidelines
- Family support materials

---

## ✅ Summary

Your AI feature plan is **excellent and achievable**!

### Feature 1: Grief Support Chatbot ✅
- **Status**: Already built!
- **API**: DeepSeek (perfect choice)
- **Next**: Add API key and launch

### Feature 2: Voice Chatbot 🎙️
- **Status**: Detailed plan ready
- **APIs**: ElevenLabs + DeepSeek (correct approach!)
- **Timeline**: 8-9 weeks to production
- **Cost**: ~$33/month for 100 tributes
- **Critical**: Implement ethical safeguards first

**Your instincts were spot-on**. The combination of:
- DeepSeek for personality/intelligence
- ElevenLabs for voice cloning
- Strong ethical guidelines
- Family-first approach

...makes this a powerful, responsible, and marketable feature set.

**Next Steps:**
1. Launch grief chatbot (already done!)
2. Set up ElevenLabs account
3. Start with Phase 1 (voice upload)
4. Consult with grief counselors
5. Beta test with willing families

This will be a **game-changing feature** in the funeral tech space! 🚀
