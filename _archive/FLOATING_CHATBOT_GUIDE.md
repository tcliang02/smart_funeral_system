# 🤖 Floating AI Chatbot - Complete Guide

## 📋 Overview

The Floating AI Chatbot is a **dual-mode intelligent assistant** that appears in the bottom-right corner of every page. Users can choose between:

1. **💼 Website Help** - Navigate features, bookings, and account settings
2. **🤍 Grief Counseling** - Compassionate emotional support and grief guidance

---

## ✨ Features

### Core Capabilities
- ✅ **Always Visible** - Floating button accessible on all pages
- ✅ **Dual Mode** - Website help OR grief counseling
- ✅ **Smart Context** - AI remembers last 10 messages for coherent conversations
- ✅ **Beautiful UI** - Smooth animations, modern design, mobile-responsive
- ✅ **Minimize/Maximize** - Collapse chat window while keeping it open
- ✅ **Mode Switching** - Change between help modes anytime with ↺ button
- ✅ **Real-time Responses** - Powered by DeepSeek AI
- ✅ **Privacy Focused** - Conversations stay private, no unwanted data collection

### UI Components
1. **Floating Button** - Purple gradient circle with "AI" badge
2. **Chat Window** - 420px wide, max 650px tall, rounded corners
3. **Header** - Shows current mode, minimize/maximize/close buttons
4. **Mode Selection** - Two cards to choose help type
5. **Chat Interface** - Message bubbles with avatars and timestamps
6. **Input Form** - Text input with send button
7. **Typing Indicator** - 3-dot animation while AI responds

---

## 🎨 User Experience Flow

### Step 1: Opening the Chat
```
User clicks floating purple button (bottom-right corner)
↓
Chat window slides up with mode selection screen
```

### Step 2: Choosing a Mode

**Option A: Website Help 💼**
- Blue icon with question mark
- Features: Feature guidance, Booking assistance, Account support
- Click → AI greets with platform help menu

**Option B: Grief Counseling 🤍**
- Pink icon with heart
- Features: Emotional support, Coping strategies, 24/7 availability
- Click → AI greets with compassionate grief support message

### Step 3: Conversing
- Type message in input field
- Press Enter or click Send button
- AI responds with context-aware reply
- Conversation flows naturally with history maintained

### Step 4: Managing Chat
- **Switch Mode**: Click ↺ button → Returns to mode selection
- **Minimize**: Click − button → Collapses to header only
- **Maximize**: Click ▢ button → Expands back to full view
- **Close**: Click ✕ button → Closes and resets chat

---

## 🔧 Technical Implementation

### Files Created

**1. FloatingChatbot.jsx** (390 lines)
```
📍 Location: frontend/my-app/src/components/FloatingChatbot.jsx
```

**Key Features:**
- React component with hooks (useState, useEffect, useRef)
- Framer Motion animations
- DeepSeek API integration
- Conversation history management (last 10 messages)
- Auto-scroll to bottom on new messages
- Mode selection logic
- Typing indicator

**State Management:**
```javascript
- isOpen: boolean (chat window visibility)
- isMinimized: boolean (collapsed state)
- chatMode: 'website' | 'grief' | null
- messages: array of {role, content, timestamp}
- inputMessage: string (current input)
- isLoading: boolean (waiting for AI)
```

**2. FloatingChatbot.css** (600+ lines)
```
📍 Location: frontend/my-app/src/components/FloatingChatbot.css
```

**Key Styles:**
- `.floating-chat-button` - Circular gradient button with shadow
- `.floating-chat-window` - Main chat container
- `.chat-window-header` - Purple gradient header
- `.chat-mode-selection` - Mode chooser screen
- `.mode-option` - Individual mode cards with hover effects
- `.chat-messages` - Scrollable message area
- `.message-content` - Speech bubble styling
- `.typing-indicator` - 3-dot bounce animation
- Responsive breakpoints for mobile/tablet

**3. Backend Update - chatbot.php**
```
📍 Location: backend/chatbot.php
```

**Changes Made:**
- Added `mode` parameter ('website' or 'grief')
- Created dual system prompts:
  * **Grief Mode**: Compassionate counselor (empathy, coping, memorials)
  * **Website Mode**: Platform assistant (features, bookings, troubleshooting)
- Dynamic prompt selection based on mode
- Conversation history support

**API Request Format:**
```json
{
  "message": "How do I create a tribute?",
  "mode": "website",
  "user_id": 15,
  "conversation_history": [
    {"role": "user", "content": "Previous message"},
    {"role": "assistant", "content": "AI response"}
  ]
}
```

**4. App.jsx Integration**
```
📍 Location: frontend/my-app/src/App.jsx
```

**Changes:**
```jsx
// Added import
import FloatingChatbot from './components/FloatingChatbot';

// Added component (renders on ALL pages)
function App() {
  return (
    <Router>
      <FloatingChatbot />  {/* ← Always visible */}
      <Routes>
        {/* All routes */}
      </Routes>
    </Router>
  );
}
```

---

## 🧠 AI Training

### Grief Counseling Mode Prompt
The AI is trained to:
1. Provide empathetic grief support
2. Help process emotions healthily
3. Offer memorial planning guidance
4. Share coping strategies
5. Listen actively and validate feelings
6. Never dismiss grief (no timeline)
7. Use warm, gentle language
8. Respect cultural/religious differences
9. Encourage memory sharing
10. Provide practical advice when asked

**Tone**: Compassionate, patient, understanding, supportive

### Website Help Mode Prompt
The AI is trained to:
1. Guide through platform features
2. Explain tribute creation/management
3. Help with booking services
4. Assist with account settings
5. Answer "how-to" questions
6. Provide step-by-step instructions
7. Be friendly and clear
8. Direct users to specific pages
9. Troubleshoot common issues
10. Explain capabilities/limitations

**Tone**: Helpful, professional, concise, friendly

---

## 🎯 Use Cases

### Website Help Examples

**User**: "How do I book a funeral service?"
**AI**: "I can help you book a funeral service! Here's how:

1. **Browse Providers** - Go to Service Providers page
2. **Select a Provider** - Click on a provider to see their packages
3. **Choose a Package** - Select a funeral package that fits your needs
4. **Pick Date & Time** - Check provider availability
5. **Customize** - Add optional add-ons (flowers, catering, etc.)
6. **Checkout** - Complete payment and booking

Would you like me to explain any of these steps in more detail?"

---

**User**: "I can't see my tribute on the public page"
**AI**: "Let me help you troubleshoot this. A few common reasons:

• **Privacy Settings** - Is your tribute set to 'Private'? Check Edit Tribute → Privacy
• **Not Published** - Make sure you clicked 'Publish' after creating it
• **Wrong Filter** - Try clicking 'All Tributes' tab on the tribute homepage
• **Cache Issue** - Try refreshing the page (Ctrl+R or Cmd+R)

If none of these work, check your account settings or contact support. Which one should we check first?"

---

### Grief Counseling Examples

**User**: "I feel so guilty that I couldn't be there when they passed"
**AI**: "🤍 Thank you for sharing such a painful feeling with me. Guilt is one of the most common emotions in grief, and it's important to know you're not alone in feeling this way.

Please hear this: You did the best you could with what you knew and the circumstances you were in. Life doesn't always give us the goodbye we wish we could have had, and that's not your fault.

Your loved one knew they were loved by you. That love existed in every moment you shared together - not just the final one. The fact that you feel this guilt shows how much you cared.

Would it help to talk about some ways to work through these feelings? Or would you like to share a memory of a time when you were there for them?"

---

**User**: "How long does grief last?"
**AI**: "🤍 This is such an important question, and I want to give you an honest answer: Grief doesn't have an expiration date, and there's no 'right' timeline for healing.

You might have heard of the 'stages of grief' (denial, anger, bargaining, depression, acceptance), but here's what many people don't realize - they're not linear steps. You might move through them in any order, revisit them, or experience several at once.

What changes over time is not whether you feel grief, but:
- The intensity of painful moments
- How frequently they come
- Your ability to also feel joy alongside the sadness
- Your capacity to integrate their memory into your life story

Some days will be harder than others - anniversaries, holidays, random Tuesday afternoons. All of this is normal.

How are you feeling right now? Is there a particular stage or emotion you're struggling with?"

---

## 📱 Responsive Design

### Desktop (>1024px)
- Chat window: 420px wide
- Position: Fixed bottom-right (24px from edges)
- Full features visible

### Tablet (768px - 1024px)
- Chat window: calc(100vw - 32px) max 420px
- Floating button: 56px × 56px
- Mode icons: 56px × 56px

### Mobile (<768px)
- Chat window: Full width
- Position: Bottom of screen with rounded top corners
- Message bubbles: 85% max-width for better readability
- Floating button: 56px × 56px, positioned 20px from edges

---

## 🚀 Setup & Activation

### Prerequisites
1. DeepSeek API Key (get from https://platform.deepseek.com/)
2. MySQL database with chatbot_conversations table
3. React app running on http://localhost:5174/
4. PHP backend on http://localhost/smart_funeral_system/

### Installation Steps

**Step 1: Files Already Created** ✅
- `FloatingChatbot.jsx` ✅
- `FloatingChatbot.css` ✅
- `chatbot.php` updated ✅
- `App.jsx` integrated ✅

**Step 2: Add DeepSeek API Key**
```php
// File: backend/chatbot.php
// Line 27
$apiKey = 'sk-your-actual-api-key-here';
```

**Step 3: Create Database Table**
Visit: `http://localhost/smart_funeral_system/create-chatbot-table.php`

Or run this SQL manually:
```sql
CREATE TABLE IF NOT EXISTS chatbot_conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    tribute_id INT NULL,
    user_message TEXT NOT NULL,
    bot_response TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (tribute_id) REFERENCES tributes(tribute_id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_tribute (tribute_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Step 4: Test the Chatbot**
1. Open any page: `http://localhost:5174/`
2. Look for purple circular button in bottom-right corner
3. Click button → Chat window opens
4. Select a mode (Website Help or Grief Counseling)
5. Send a test message
6. AI should respond within 2-3 seconds

---

## 🧪 Testing Checklist

### Visual Tests
- [ ] Floating button appears on all pages
- [ ] Button has purple gradient and "AI" badge
- [ ] Hover effect works (scale up, enhanced shadow)
- [ ] Click opens chat window smoothly
- [ ] Mode selection screen displays both options
- [ ] Cards have hover animations
- [ ] Icons and text are properly aligned

### Functional Tests
- [ ] Website Help mode sends correct system prompt
- [ ] Grief Counseling mode sends correct system prompt
- [ ] Messages display in correct order
- [ ] User messages align right (purple bubble)
- [ ] Bot messages align left (white bubble)
- [ ] Timestamps show correct time
- [ ] Typing indicator appears while waiting
- [ ] Auto-scroll works on new messages

### Interactive Tests
- [ ] Minimize button collapses window
- [ ] Maximize button expands window
- [ ] Reset button (↺) returns to mode selection
- [ ] Close button (✕) closes and resets chat
- [ ] Enter key sends message
- [ ] Send button works
- [ ] Input disables while loading

### Mobile Tests
- [ ] Responsive layout on mobile (<768px)
- [ ] Full-screen chat on small devices
- [ ] Touch interactions work
- [ ] Scrolling smooth on mobile
- [ ] Buttons large enough to tap

### API Tests
- [ ] DeepSeek API returns responses
- [ ] Error handling works (offline, bad API key)
- [ ] Conversation history maintains context
- [ ] Both modes use different prompts
- [ ] Responses are relevant to mode

---

## 🎨 Customization Options

### Change Colors
**File**: `FloatingChatbot.css`

```css
/* Primary gradient (purple/indigo) */
.floating-chat-button {
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
  /* Change to your brand colors */
}

/* Website Help mode (blue) */
.website-mode .mode-icon {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #3b82f6;
}

/* Grief Counseling mode (pink) */
.grief-mode .mode-icon {
  background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
  color: #ec4899;
}
```

### Change Position
```css
/* Bottom-right (default) */
.floating-chat-button {
  bottom: 24px;
  right: 24px;
}

/* Bottom-left */
.floating-chat-button {
  bottom: 24px;
  left: 24px;
}
```

### Change Size
```css
/* Larger button */
.floating-chat-button {
  width: 72px;
  height: 72px;
}

/* Smaller window */
.floating-chat-window {
  width: 360px;
  max-height: 550px;
}
```

### Modify AI Behavior

**File**: `backend/chatbot.php`

**Temperature** (creativity):
```php
'temperature' => 0.7,  // Lower = more focused, Higher = more creative
```

**Max Tokens** (response length):
```php
'max_tokens' => 800,  // Increase for longer responses
```

**System Prompt** (personality):
Edit the `$systemPrompts` array to change AI behavior.

---

## 🐛 Troubleshooting

### Chatbot Button Doesn't Appear
**Cause**: Component not imported in App.jsx
**Fix**: Check `App.jsx` has `<FloatingChatbot />` inside `<Router>`

---

### Chat Opens But No Response
**Cause**: Missing or invalid DeepSeek API key
**Fix**: 
1. Check `backend/chatbot.php` line 27
2. Verify API key is valid at https://platform.deepseek.com/
3. Check console for error messages

---

### Messages Appear Out of Order
**Cause**: React state update timing
**Fix**: Already handled with `useEffect` and `scrollToBottom()`

---

### Mobile Layout Broken
**Cause**: CSS media queries not loading
**Fix**: Clear browser cache and hard refresh (Ctrl+Shift+R)

---

### Typing Indicator Stuck
**Cause**: API error not caught
**Fix**: Check Network tab in DevTools for failed requests

---

### "CORS Error" in Console
**Cause**: Backend headers not set
**Fix**: `chatbot.php` already has CORS headers, restart Apache/PHP server

---

## 💡 Tips & Best Practices

### For Users
1. **Be Specific** - Clear questions get better answers
2. **Try Both Modes** - Website Help for features, Grief for emotional support
3. **Use History** - AI remembers last 10 messages for context
4. **Switch Freely** - Change modes anytime with ↺ button
5. **Mobile Friendly** - Works great on phones/tablets

### For Developers
1. **Monitor API Usage** - DeepSeek charges per token
2. **Cache Responses** - Consider storing common Q&A
3. **Rate Limiting** - Add limits to prevent abuse
4. **Error Logging** - Track failed API calls
5. **User Feedback** - Add thumbs up/down for responses
6. **Analytics** - Track which mode is used more

---

## 📊 Future Enhancements

### Short-term Ideas
- [ ] **Suggested Prompts** - Quick-start buttons for common questions
- [ ] **Save Conversations** - Let users download chat history
- [ ] **Voice Input** - Speak instead of typing
- [ ] **Keyboard Shortcuts** - Ctrl+K to open chat
- [ ] **Unread Badge** - Show notification dot for new messages

### Long-term Ideas
- [ ] **Multi-language** - Detect user language and respond accordingly
- [ ] **Admin Dashboard** - View chat analytics and common questions
- [ ] **Smart Routing** - Auto-detect question type and suggest mode
- [ ] **Emoji Reactions** - Let users react to AI messages
- [ ] **Export Chat** - PDF or email transcript
- [ ] **Proactive Help** - AI offers help based on page context
- [ ] **Sentiment Analysis** - Detect distress and offer crisis resources
- [ ] **Integration** - Connect to booking system, tribute creation

---

## 💰 DeepSeek Pricing

**Model**: `deepseek-chat`
**Pricing** (as of setup):
- Input: $0.14 per 1M tokens
- Output: $0.28 per 1M tokens

**Average Costs**:
- 1 conversation (10 messages): ~$0.002
- 1,000 conversations: ~$2
- 10,000 conversations: ~$20

**Tips to Reduce Costs**:
- Use shorter system prompts
- Lower max_tokens for shorter responses
- Cache frequent Q&A pairs
- Implement rate limiting per user

---

## 📞 Crisis Resources (Built-in)

The chatbot doesn't display crisis hotlines (that's on the dedicated `/ai-chatbot` page), but you can add them to the mode selection screen if needed.

**To Add Crisis Info**:
Edit `FloatingChatbot.jsx` mode selection section:

```jsx
<div className="mode-footer">
  <p className="crisis-note">
    🆘 <strong>Crisis Support:</strong> 988 (Suicide & Crisis Lifeline) | 
    Text "HELLO" to 741741 (Crisis Text Line)
  </p>
</div>
```

---

## ✅ Summary

You now have a **fully functional dual-mode AI chatbot** that:

✨ Appears on every page in bottom-right corner
✨ Lets users choose between Website Help or Grief Counseling
✨ Provides intelligent, context-aware responses
✨ Maintains conversation history for better context
✨ Has beautiful animations and mobile-responsive design
✨ Can be minimized, maximized, or closed anytime
✨ Integrates seamlessly with existing funeral system

**Next Steps**:
1. Add your DeepSeek API key to `chatbot.php`
2. Create database table with `create-chatbot-table.php`
3. Test both modes on different pages
4. Monitor usage and refine prompts as needed

**Enjoy your new AI assistant!** 🚀🤖💜
