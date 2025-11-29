# AI Configuration System - Professional Guide

## 🎯 Overview

The Smart Funeral System now uses a **professional JSON-based configuration system** for all AI features. This approach provides:

- ✅ **Centralized Management** - All AI settings in one JSON file
- ✅ **Easy Fine-Tuning** - Adjust prompts without touching PHP code
- ✅ **Version Control** - Track changes to AI behavior over time
- ✅ **Scalability** - Add new AI modes easily
- ✅ **Maintainability** - Non-developers can update prompts

---

## 📁 File Structure

```
backend/
├── config/
│   └── ai_prompts.json          # Main configuration file
├── AIConfigManager.php          # Configuration loader class
├── chatbot.php                  # Uses config for grief & website AI ✅
└── voiceChatbot.php            # Uses config for voice memorial AI ✅
```

---

## 📝 Configuration File: `ai_prompts.json`

### **Structure**

```json
{
  "version": "1.0.0",
  "last_updated": "2025-10-27",
  "modes": {
    "grief_counselor": { ... },
    "website_helper": { ... },
    "voice_memorial": { ... }
  },
  "global_settings": { ... },
  "api_endpoints": { ... }
}
```

### **AI Modes**

#### 1. **Grief Counselor AI** (`grief_counselor`)
- **Purpose**: Emotional support for grieving family members
- **Access**: Family members only
- **Features**: Crisis detection, Buddhist cultural awareness
- **Temperature**: 0.95 (more empathetic/natural)
- **Max Tokens**: 120 (concise responses)

#### 2. **Website Helper AI** (`website_helper`)
- **Purpose**: Help users navigate the platform
- **Access**: Everyone (family, provider, attendee, guest)
- **Features**: FAQs knowledge, quick actions, feature guides
- **Temperature**: 0.7 (balanced, informative)
- **Max Tokens**: 150 (detailed instructions)

#### 3. **Voice Memorial AI** (`voice_memorial`)
- **Purpose**: Chat with deceased loved one's AI voice
- **Access**: Family members only
- **Features**: Personality matching, memory integration, voice synthesis
- **Temperature**: 0.85 (natural conversation)
- **Max Tokens**: 100 (short, personal responses)
- **Voice Settings**: ElevenLabs TTS with configurable stability and similarity

**Template Placeholders:**
The voice memorial uses a template system with dynamic data injection:
- `{deceased_name}` - Name of the deceased person
- `{biography}` - Life story and background
- `{personality_traits}` - Character traits and behaviors
- `{memories}` - Specific memories and experiences

---

## 🔧 How to Fine-Tune AI

### **1. Update System Prompts**

Edit `backend/config/ai_prompts.json`:

```json
{
  "modes": {
    "grief_counselor": {
      "system_prompt": "Your updated prompt here..."
    }
  }
}
```

**No PHP code changes needed!** The system automatically loads the new prompt.

### **2. Adjust AI Behavior Settings**

```json
"model_settings": {
  "temperature": 0.95,      // 0.0-2.0 (higher = more creative)
  "max_tokens": 120,        // Response length
  "top_p": 1.0,             // Nucleus sampling (0.0-1.0)
  "frequency_penalty": 0.3, // Reduce repetition (0.0-2.0)
  "presence_penalty": 0.3   // Encourage new topics (0.0-2.0)
}
```

**Settings Guide:**

| Setting | Range | Effect |
|---------|-------|--------|
| **temperature** | 0.0-2.0 | Lower = focused, Higher = creative |
| **max_tokens** | 1-4000 | Maximum response length |
| **top_p** | 0.0-1.0 | Diversity of word choices |
| **frequency_penalty** | 0.0-2.0 | Prevents repetitive words |
| **presence_penalty** | 0.0-2.0 | Encourages new topics |

### **3. Update Crisis Keywords**

```json
"crisis_keywords": [
  "suicide",
  "kill myself",
  "bunuh diri",     // Bahasa Malaysia
  "new keyword"     // Add more as needed
]
```

### **4. Modify Quick Actions (Website Helper)**

```json
"quick_actions": [
  {
    "label": "New Action",
    "question": "Your predefined question here"
  }
]
```

---

## 💻 Using the Configuration in Code

### **Load Configuration**

```php
require_once 'AIConfigManager.php';

// Initialize
$aiConfig = new AIConfigManager();
```

### **Get System Prompt**

```php
// For grief counselor
$prompt = $aiConfig->getSystemPrompt('grief');

// For website helper
$prompt = $aiConfig->getSystemPrompt('website');
```

### **Get Model Settings**

```php
$settings = $aiConfig->getModelSettings('grief');
// Returns: ['temperature' => 0.95, 'max_tokens' => 120, ...]
```

### **Check User Access**

```php
$hasAccess = $aiConfig->hasAccess('grief', 'family'); // true
$hasAccess = $aiConfig->hasAccess('grief', 'provider'); // false
```

### **Crisis Detection**

```php
$keywords = $aiConfig->getCrisisKeywords();
$response = $aiConfig->getCrisisResponse();
```

### **Quick Actions**

```php
$actions = $aiConfig->getQuickActions();
// Returns array of quick action buttons
```

### **Get Voice Settings**

```php
$voiceSettings = $aiConfig->getVoiceSettings();
// Returns: [
//   'model_id' => 'eleven_monolingual_v1',
//   'stability' => 0.5,
//   'similarity_boost' => 0.75
// ]
```

### **Voice Memorial with Template**

```php
// Prepare data for personalization
$templateData = [
    'deceased_name' => 'John Smith',
    'biography' => 'Loving father and carpenter...',
    'personality_traits' => 'Kind, humorous, wise',
    'memories' => 'Loved fishing, told dad jokes, built treehouse'
];

// Get personalized prompt
$prompt = $aiConfig->getVoiceMemorialPrompt($templateData);
// The template replaces {deceased_name}, {biography}, etc.
```

---

## 🚀 Adding a New AI Mode

### **Step 1: Add to JSON Config**

Edit `backend/config/ai_prompts.json`:

```json
"modes": {
  "grief_counselor": { ... },
  "website_helper": { ... },
  "new_ai_mode": {
    "name": "New AI Feature",
    "description": "What this AI does",
    "access_roles": ["family"],
    "model_settings": {
      "temperature": 0.8,
      "max_tokens": 100,
      "top_p": 0.9,
      "frequency_penalty": 0.2,
      "presence_penalty": 0.1
    },
    "system_prompt": "Your detailed system prompt here..."
  }
}
```

### **Step 2: Update Mode Mapping (if needed)**

Edit `AIConfigManager.php` if your mode has an alias:

```php
private function getModeKey($mode) {
    $mapping = [
        'grief' => 'grief_counselor',
        'website' => 'website_helper',
        'voice' => 'voice_memorial',
        'new' => 'new_ai_mode'  // Add this
    ];
    return $mapping[$mode] ?? $mode;
}
```

### **Step 3: Use in Your Code**

```php
$prompt = $aiConfig->getSystemPrompt('new');
$settings = $aiConfig->getModelSettings('new');
```

---

## 📊 Configuration Best Practices

### **1. Version Control**

Always update the version number when making changes:

```json
{
  "version": "1.0.1",  // Increment
  "last_updated": "2025-10-28"
}
```

### **2. Backup Before Changes**

```bash
cp ai_prompts.json ai_prompts.backup.json
```

### **3. Test Changes**

After updating configuration:
1. Clear any cache
2. Test the AI in browser
3. Verify responses match expectations

### **4. Document Changes**

Keep a changelog in the JSON:

```json
"changelog": [
  {
    "version": "1.0.1",
    "date": "2025-10-28",
    "changes": "Improved grief counselor empathy"
  }
]
```

---

## 🔍 Troubleshooting

### **"Configuration file not found"**

**Solution:** Check the path in `AIConfigManager.php`:

```php
$this->configPath = __DIR__ . '/config/ai_prompts.json';
```

### **"Invalid JSON"**

**Solution:** Validate your JSON at [jsonlint.com](https://jsonlint.com)

Common issues:
- Missing commas
- Extra commas at end of arrays
- Unescaped quotes in strings (use `\"`)

### **AI Not Using New Prompt**

**Solution:**
1. Clear PHP opcode cache: `opcache_reset()`
2. Restart Apache/XAMPP
3. Verify file was saved correctly

---

## 🎓 Example: Tuning Grief Counselor

### **Scenario: Make AI more concise**

**Before:**
```json
"model_settings": {
  "temperature": 0.95,
  "max_tokens": 120
}
```

**After:**
```json
"model_settings": {
  "temperature": 0.95,
  "max_tokens": 80  // Shorter responses
}
```

### **Scenario: Add more Buddhist terms**

Update system prompt:

```json
"system_prompt": "...Reference Buddhist teachings like Dana (giving), Sila (morality), Bhavana (meditation)..."
```

### **Scenario: Add new crisis keyword**

```json
"crisis_keywords": [
  "suicide",
  "hopeless",  // Add this
  "..."
]
```

---

## 📈 Benefits of This Approach

### **Before (Hardcoded)**
```php
// Had to edit PHP file
$prompt = "You are a grief counselor...";
// Risk of syntax errors
// Needed developer to change
```

### **After (JSON Config)**
```json
// Just edit JSON
{
  "system_prompt": "You are a grief counselor..."
}
// No syntax errors
// Anyone can update
```

### **Advantages**

✅ **Separation of Concerns** - Config vs Logic  
✅ **Non-Technical Edits** - Content team can update prompts  
✅ **A/B Testing** - Easy to swap configurations  
✅ **Rollback** - Just restore old JSON file  
✅ **Documentation** - Self-documenting configuration  
✅ **Scalability** - Add unlimited AI modes  

---

## 🎤 Voice Memorial AI Configuration

### **How It Works**

The `voiceChatbot.php` uses the same JSON configuration system with **template-based personalization**:

1. **Loads Configuration**: Uses `AIConfigManager` to load voice_memorial settings
2. **Template Injection**: Replaces placeholders with tribute data
3. **Dynamic Settings**: Uses configured temperature, max_tokens, voice settings
4. **Access Control**: Checks user role against config

### **Template System**

The voice memorial prompt in JSON uses placeholders:

```json
{
  "voice_memorial": {
    "system_prompt": "You are {deceased_name}, speaking to your loved ones...\n\nYOUR LIFE STORY:\n{biography}\n\nYOUR PERSONALITY:\n{personality_traits}\n\nYOUR MEMORIES:\n{memories}"
  }
}
```

When called, the system injects real data:

```php
$templateData = [
    'deceased_name' => 'John Smith',
    'biography' => 'Loving father and carpenter who built homes for 40 years...',
    'personality_traits' => 'Kind, humorous, wise, patient',
    'memories' => 'Loved fishing on Sunday mornings, told terrible dad jokes, built a treehouse for grandkids'
];

$prompt = $aiConfig->getVoiceMemorialPrompt($templateData);
// Result: Fully personalized system prompt unique to this deceased person
```

### **Voice Synthesis Settings**

ElevenLabs TTS settings are also configurable:

```json
{
  "voice_memorial": {
    "voice_settings": {
      "model_id": "eleven_monolingual_v1",
      "stability": 0.5,
      "similarity_boost": 0.75
    }
  }
}
```

**Settings Explained:**
- **model_id**: ElevenLabs voice model to use
- **stability**: 0.0-1.0 (lower = more expressive, higher = more consistent)
- **similarity_boost**: 0.0-1.0 (higher = closer to original voice sample)

### **Tuning Voice Memorial AI**

**Example 1: Make responses even shorter**
```json
"voice_memorial": {
  "model_settings": {
    "max_tokens": 60  // Changed from 100
  }
}
```

**Example 2: Make voice more expressive**
```json
"voice_settings": {
  "stability": 0.3,  // Changed from 0.5
  "similarity_boost": 0.8  // Changed from 0.75
}
```

**Example 3: Update conversation style**
Edit the system_prompt template to change tone, examples, or instructions.

---

## 🔐 Security Notes

1. **File Permissions**: Set config file to read-only for web server
2. **Validation**: Config manager validates structure on load
3. **Escaping**: All strings properly escaped in JSON
4. **No User Input**: Config never uses user-supplied data

---

## 📞 Support

For questions about AI configuration:
- Check this README first
- Test in development environment
- Document all changes
- Keep backups!

---

**Professional AI management made easy!** 🚀✨
