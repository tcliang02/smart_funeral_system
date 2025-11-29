# 🚀 Quick Start: JSON AI Configuration

## ⚡ Edit AI in 3 Steps

### **Step 1: Open Config File**
```
backend/config/ai_prompts.json
```

### **Step 2: Find Your Mode**
```json
{
  "modes": {
    "grief_counselor": { ... },     // Grief support AI
    "website_helper": { ... },      // Platform helper AI
    "voice_memorial": { ... }       // Deceased person AI
  }
}
```

### **Step 3: Make Changes**
```json
"grief_counselor": {
  "model_settings": {
    "temperature": 0.9,    // Change this!
    "max_tokens": 100      // Or this!
  },
  "system_prompt": "Your new prompt here..."  // Or this!
}
```

**Save → Done!** No code changes needed! ✨

---

## 🎯 Common Tasks

### **Make AI More Concise**
```json
"max_tokens": 80  // Reduce from 120
```

### **Make AI More Creative**
```json
"temperature": 1.0  // Increase from 0.85
```

### **Make Voice More Expressive**
```json
"voice_settings": {
  "stability": 0.3  // Reduce from 0.5
}
```

### **Add Crisis Keyword**
```json
"crisis_keywords": [
  "suicide",
  "your new keyword"  // Add here
]
```

### **Update Prompt**
```json
"system_prompt": "You are a compassionate AI counselor specialized in Buddhist grief support..."
```

---

## 📖 Full Documentation

**Complete Guide:** `backend/AI_CONFIG_GUIDE.md`

**Voice AI Details:** `VOICE_CHATBOT_CONFIG_COMPLETE.md`

**Overview:** `AI_SYSTEM_COMPLETE_OVERVIEW.md`

---

## ✅ What's Configured

- ✅ **Grief Counselor AI** (chatbot.php)
- ✅ **Website Helper AI** (chatbot.php)
- ✅ **Voice Memorial AI** (voiceChatbot.php)

All using `backend/config/ai_prompts.json`

---

## 💡 Pro Tip

**Before editing:**
```bash
# Make a backup
cp ai_prompts.json ai_prompts.backup.json
```

**After editing:**
```bash
# Validate JSON
cat ai_prompts.json | python -m json.tool
```

---

**Professional AI configuration made simple!** 🎉
