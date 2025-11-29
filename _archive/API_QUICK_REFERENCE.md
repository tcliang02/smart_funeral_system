# 🔌 AI Grief Support - API Quick Reference

## 🎯 Base URL
```
http://localhost/smart_funeral_system/backend/
```

---

## 📡 Endpoints

### 1️⃣ AI Grief Counselor Chat
**Endpoint**: `POST /chatbot.php`

**Request**:
```json
{
  "message": "I'm struggling with grief",
  "user_id": 123,
  "tribute_id": 456,
  "conversation_history": [],
  "mode": "grief"
}
```

**Response**:
```json
{
  "success": true,
  "reply": "I'm here for you. Grief is a natural process...",
  "timestamp": "2024-01-15 14:30:00"
}
```

**Modes**: `"grief"` | `"website"`

---

### 2️⃣ Voice Memorial Chat
**Endpoint**: `POST /voiceChatbot.php`

**Request**:
```json
{
  "tribute_id": 123,
  "message": "Tell me about your childhood"
}
```

**Response**:
```json
{
  "success": true,
  "response": "I remember when I was five...",
  "audio_url": "/uploads/voice_responses/voice_response_123456.mp3"
}
```

**Play Audio**:
```javascript
const audio = new Audio(data.audio_url);
audio.play();
```

---

### 3️⃣ Upload Voice Sample
**Endpoint**: `POST /elevenLabsVoiceClone.php`

**Request**: `multipart/form-data`
```
tribute_id: 123
voice_name: "John Smith"
audio_file: [audio file]
```

**Response**:
```json
{
  "success": true,
  "message": "Voice uploaded successfully",
  "voice_id": "abc123xyz",
  "status": "ready"
}
```

**Accepted Formats**: WAV, MP3, M4A, WebM, OGG  
**Max Size**: 50MB

---

### 4️⃣ Save Memories & Traits
**Endpoint**: `POST /saveMemories.php`

**Request**:
```json
{
  "tribute_id": 123,
  "memories": [
    {
      "type": "story",
      "title": "First day of school",
      "content": "I remember when I started first grade...",
      "importance": "high"
    }
  ],
  "traits": [
    {
      "category": "general",
      "key": "personality",
      "value": "warm and caring"
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Saved successfully",
  "memories_saved": 5,
  "traits_saved": 8
}
```

**Memory Types**: `story` | `phrase` | `belief` | `experience` | `other`  
**Importance**: `high` | `medium` | `low`

---

### 5️⃣ Update Voice Settings
**Endpoint**: `POST /updateVoiceSettings.php`

**Request**:
```json
{
  "tribute_id": 123,
  "is_enabled": true,
  "access_level": "family"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Settings updated",
  "is_enabled": true,
  "access_level": "family"
}
```

**Access Levels**: `family` | `all_visitors` | `invited`

---

### 6️⃣ Check Voice Status
**Endpoint**: `GET /checkVoiceStatus.php?tribute_id=123`

**Response**:
```json
{
  "voice_uploaded": true,
  "voice_status": "ready",
  "voice_id": "abc123",
  "memories_added": true,
  "memory_count": 15,
  "trait_count": 8,
  "is_enabled": true,
  "access_level": "family",
  "setup_complete": true
}
```

---

### 7️⃣ Get Voice Memorials
**Endpoint**: `GET /getVoiceMemorials.php?user_id=123`

**Response**:
```json
[
  {
    "tribute_id": 456,
    "name": "John Smith",
    "photo": "/uploads/profile.jpg",
    "birth_date": "1950-01-15",
    "death_date": "2024-01-10",
    "voice_status": "ready",
    "memory_count": 15,
    "trait_count": 8,
    "is_enabled": true,
    "setup_complete": true
  }
]
```

---

## 🔑 Configuration

### API Keys (backend/api_config.php)
```php
DEEPSEEK_API_KEY    → sk-3ff887b3eab042c9a3294fd3d62c8d80
ELEVENLABS_API_KEY  → sk_c986151a7b7b8133875347496ad0ced54a66d63623c371bf
```

### Rate Limits
- Max Requests: 100/hour
- Max Conversation History: 10 messages
- Max Voice Sample: 50MB

---

## 🎨 Frontend Integration Examples

### Example 1: Voice Upload
```javascript
const uploadVoice = async (tributeId, audioBlob, voiceName) => {
  const formData = new FormData();
  formData.append('tribute_id', tributeId);
  formData.append('voice_name', voiceName);
  formData.append('audio_file', audioBlob);
  
  const response = await fetch('/backend/elevenLabsVoiceClone.php', {
    method: 'POST',
    body: formData
  });
  
  return await response.json();
};
```

### Example 2: Chat with AI
```javascript
const chatWithAI = async (tributeId, message) => {
  const response = await fetch('/backend/voiceChatbot.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tribute_id: tributeId, message })
  });
  
  const data = await response.json();
  
  // Display text response
  console.log(data.response);
  
  // Play audio
  const audio = new Audio(data.audio_url);
  audio.play();
  
  return data;
};
```

### Example 3: Save Memories
```javascript
const saveMemories = async (tributeId, memories, traits) => {
  const response = await fetch('/backend/saveMemories.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tribute_id: tributeId,
      memories,
      traits
    })
  });
  
  return await response.json();
};

// Usage
await saveMemories(123, [
  {
    type: 'story',
    title: 'Family Vacation',
    content: 'We went to the beach in 1985...',
    importance: 'high'
  }
], [
  {
    category: 'general',
    key: 'personality',
    value: 'adventurous and fun-loving'
  }
]);
```

### Example 4: Check Setup Status
```javascript
const checkStatus = async (tributeId) => {
  const response = await fetch(
    `/backend/checkVoiceStatus.php?tribute_id=${tributeId}`
  );
  
  const status = await response.json();
  
  // Calculate progress
  const progress = status.setup_complete ? 100 : 
    (status.voice_uploaded ? 33 : 0) +
    (status.memories_added ? 33 : 0) +
    (status.is_enabled ? 34 : 0);
  
  return { ...status, progress };
};
```

---

## 🐛 Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": "Error message here"
}
```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Voice not found` | No voice_id in database | Upload voice sample first |
| `Invalid audio format` | Unsupported file type | Use WAV, MP3, M4A, WebM, or OGG |
| `File too large` | Audio > 50MB | Reduce file size or trim audio |
| `DeepSeek API Error` | API key invalid or quota exceeded | Check API key and credits |
| `ElevenLabs API Error` | API key invalid or quota exceeded | Check API key and credits |
| `Tribute not found` | Invalid tribute_id | Verify tribute exists |

---

## ✅ Testing Checklist

- [ ] Test grief counselor chat
- [ ] Test website help chat
- [ ] Upload voice sample (verify voice_id returned)
- [ ] Add memories and traits
- [ ] Send voice chat message
- [ ] Play voice response audio
- [ ] Update settings
- [ ] Check status endpoint
- [ ] List voice memorials
- [ ] Test error scenarios (invalid IDs, missing data)

---

## 🚀 Quick Start

```javascript
// 1. Upload voice
const voiceResult = await uploadVoice(123, audioBlob, "John Smith");
console.log(voiceResult.voice_id); // abc123xyz

// 2. Add personality data
await saveMemories(123, memories, traits);

// 3. Chat with AI voice
const chatResult = await chatWithAI(123, "Tell me about yourself");
const audio = new Audio(chatResult.audio_url);
audio.play();
```

---

**Status**: All endpoints production-ready ✅  
**Last Updated**: 2024-01-15
