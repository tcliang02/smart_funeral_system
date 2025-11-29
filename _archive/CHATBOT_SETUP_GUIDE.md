# AI Grief Support Chatbot - Setup Guide

## 🤖 Overview
An AI-powered grief counselor chatbot integrated into the Smart Funeral System. Uses DeepSeek API to provide compassionate emotional support to family members who have lost loved ones.

---

## 📋 Features

✅ **Empathetic Grief Support** - AI trained specifically for grief counseling
✅ **24/7 Availability** - Always available when family needs support
✅ **Conversation History** - Maintains context across messages
✅ **Privacy-First** - Only visible to family members (not guests)
✅ **Beautiful UI** - Floating chat button with smooth animations
✅ **Suggested Prompts** - Helps users start the conversation
✅ **Mobile Responsive** - Works perfectly on all devices
✅ **Database Logging** - Saves conversations for review (optional)

---

## 🔧 Setup Instructions

### Step 1: Create Database Table

Run this script to create the conversations table:

```bash
http://localhost/smart_funeral_system/create-chatbot-table.php
```

This creates the `chatbot_conversations` table to store chat history.

### Step 2: Get DeepSeek API Key

1. Visit: https://platform.deepseek.com/
2. Sign up for an account
3. Navigate to API Keys section
4. Create a new API key
5. Copy your API key

### Step 3: Configure Backend

Open `backend/chatbot.php` and replace the API key:

```php
// Line 17
$apiKey = 'YOUR_DEEPSEEK_API_KEY'; // Replace with your actual key
```

**Example:**
```php
$apiKey = 'sk-abc123def456...'; // Your real DeepSeek API key
```

### Step 4: Test the Chatbot

1. Navigate to any tribute page as a **family member**
2. You'll see a floating purple chat button in the bottom-right corner
3. Click it to open the chatbot
4. Try one of the suggested prompts or type your own message

---

## 🎨 UI Components

### Floating Button
- Purple gradient circular button
- Sparkle badge animation
- Bottom-right position (above back-to-top button)
- Only visible to family members

### Chat Window
- 420px wide x 600px tall
- Clean white design with purple accents
- Header shows "Grief Support Assistant"
- Scrollable message area
- Suggested prompts for easy start
- Input field with send button

### Messages
- User messages: Purple gradient (right-aligned)
- Bot messages: White with border (left-aligned)
- Timestamps for each message
- Typing indicator while AI responds
- Smooth slide-in animations

---

## 💬 AI Capabilities

The chatbot is specifically trained to:

1. **Provide Empathetic Support**
   - Validates feelings without judgment
   - Uses warm, compassionate language
   - Respects the grieving process

2. **Offer Coping Strategies**
   - Shares healthy grief processing techniques
   - Suggests memorial activities
   - Provides emotional regulation tips

3. **Memorial Planning Guidance**
   - Helps with tribute creation
   - Suggests ways to honor memories
   - Offers creative remembrance ideas

4. **Active Listening**
   - Asks follow-up questions
   - Encourages sharing stories
   - Creates safe space for emotions

5. **Cultural Sensitivity**
   - Respects different mourning traditions
   - Acknowledges religious differences
   - Adapts to individual needs

---

## 🔒 Privacy & Security

- ✅ **Family-Only Access** - Only users with `role: "family"` can see the chatbot
- ✅ **Conversation Privacy** - Messages saved with user_id for privacy
- ✅ **Secure API** - HTTPS encryption for DeepSeek API calls
- ✅ **Optional Logging** - Database storage can be disabled if needed

---

## 📊 Database Schema

```sql
chatbot_conversations
├── id (INT, PRIMARY KEY, AUTO_INCREMENT)
├── user_id (INT, FOREIGN KEY → users)
├── tribute_id (INT, FOREIGN KEY → tributes, NULLABLE)
├── user_message (TEXT)
├── bot_response (TEXT)
└── created_at (TIMESTAMP)
```

---

## 🎯 Suggested Prompts

The chatbot shows 5 suggested prompts to help users start:

1. "I'm struggling with grief today"
2. "How do I cope with this loss?"
3. "Tell me about the stages of grief"
4. "I want to share a memory"
5. "Help me plan a memorial"

---

## 🔧 Customization

### Change AI Model

Edit `backend/chatbot.php` line 60:

```php
'model' => 'deepseek-chat', // Default model
// OR
'model' => 'deepseek-coder', // For code-related tasks
```

### Adjust AI Temperature

Edit `backend/chatbot.php` line 62:

```php
'temperature' => 0.7, // 0.0 = deterministic, 1.0 = creative
```

- **0.3-0.5**: More focused, consistent responses
- **0.7-0.8**: Balanced (recommended for grief support)
- **0.9-1.0**: More creative, varied responses

### Change Max Response Length

Edit `backend/chatbot.php` line 63:

```php
'max_tokens' => 800, // Adjust response length (default: 800)
```

### Modify System Prompt

Edit the AI's personality in `backend/chatbot.php` lines 23-42. This is where you define how the AI behaves.

---

## 🧪 Testing Guide

### Test 1: Basic Conversation
1. Open chatbot as family member
2. Send: "I'm feeling sad today"
3. Expect: Empathetic response validating feelings

### Test 2: Memory Sharing
1. Send: "I want to share a memory about my loved one"
2. Expect: Encouraging response asking for the memory

### Test 3: Grief Stages
1. Send: "Tell me about the stages of grief"
2. Expect: Educational response about 5 stages

### Test 4: Coping Strategies
1. Send: "How can I cope with this loss?"
2. Expect: Practical coping techniques and resources

### Test 5: Memorial Planning
1. Send: "Help me plan a memorial"
2. Expect: Creative suggestions for honoring memories

---

## 🚨 Troubleshooting

### Chatbot Not Appearing
- **Check:** Are you logged in as family member?
- **Solution:** Only users with `role: "family"` can see it

### "Failed to get response" Error
- **Check:** Is API key correct in `chatbot.php`?
- **Check:** Do you have internet connection?
- **Check:** Is DeepSeek API working? (Check status page)

### Messages Not Saving to Database
- **Check:** Did you run `create-chatbot-table.php`?
- **Check:** Are `user_id` and `tribute_id` being sent?
- **Solution:** Check browser console for errors

### Slow Responses
- **Check:** DeepSeek API response time
- **Solution:** Reduce `max_tokens` for faster responses
- **Solution:** Use lower temperature (0.5-0.6)

### API Rate Limits
- **Issue:** Too many requests
- **Solution:** Implement request throttling
- **Solution:** Upgrade DeepSeek API plan

---

## 💰 DeepSeek Pricing

DeepSeek offers competitive pricing:
- **Free Tier**: Limited requests for testing
- **Pay-as-you-go**: ~$0.14 per 1M input tokens
- **Monthly Plans**: Available for high usage

Check current pricing: https://platform.deepseek.com/pricing

---

## 🔮 Future Enhancements

Possible improvements:

1. **Voice Support** - Add voice input/output
2. **Emotion Detection** - Analyze emotional state
3. **Resource Links** - Provide grief support hotlines
4. **Scheduled Check-ins** - Proactive support messages
5. **Multi-language** - Support different languages
6. **Export Conversations** - Download chat history
7. **Admin Dashboard** - Review conversations for quality
8. **Crisis Detection** - Alert if user shows signs of crisis

---

## 📱 Mobile Experience

The chatbot is fully responsive:

- **Desktop**: Floating window (420x600px)
- **Mobile**: Full-screen overlay
- **Tablet**: Optimized floating window

---

## ✅ Checklist

Before going live:

- [ ] Create database table
- [ ] Add DeepSeek API key
- [ ] Test as family member
- [ ] Test guest access (should not see chatbot)
- [ ] Verify messages save to database
- [ ] Test on mobile devices
- [ ] Set appropriate API rate limits
- [ ] Add monitoring for API costs
- [ ] Review system prompt for appropriateness
- [ ] Test error handling

---

## 📞 Support Resources

If users need immediate crisis support, the chatbot can direct them to:

- **National Suicide Prevention Lifeline**: 988
- **Crisis Text Line**: Text HOME to 741741
- **GriefShare**: https://www.griefshare.org/
- **The Compassionate Friends**: https://www.compassionatefriends.org/

---

## 🎉 Summary

You now have a fully functional AI grief support chatbot that:

✅ Provides 24/7 emotional support
✅ Uses state-of-the-art AI (DeepSeek)
✅ Maintains conversation context
✅ Respects privacy (family-only)
✅ Looks beautiful and professional
✅ Works on all devices
✅ Saves conversations for continuity

**The chatbot will appear on all tribute pages for family members, offering compassionate support whenever they need it.** 💜
