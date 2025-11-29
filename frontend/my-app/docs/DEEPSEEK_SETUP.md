# DeepSeek API Setup

The chatbot endpoint has been fully implemented with DeepSeek AI integration.

## Environment Variable Setup

Create a `.env.local` file in the `frontend/my-app` directory with your DeepSeek API key:

```env
DEEPSEEK_API_KEY=sk-3ff887b3eab042c9a3294fd3d62c8d80
```

## Features Implemented

✅ **Full DeepSeek API Integration**
- Uses DeepSeek Chat API for AI responses
- Configurable temperature, max_tokens, and other model parameters
- Supports both "grief_counselor" and "website_helper" modes

✅ **Crisis Detection**
- Automatically detects crisis keywords (suicide, self-harm, etc.)
- Returns immediate crisis resources (Befrienders KL, TBAN, Talian Kasih)
- Highest priority - checked before any AI processing

✅ **Role-Based Access Control**
- Grief counselor mode: Family members only
- Website helper mode: All users (family, provider, attendee, guest)
- Guest users: Website helper only

✅ **Conversation History**
- Maintains context from previous messages
- Limits to last 10 messages for efficiency
- Saves conversations to database (optional)

✅ **Malaysian Buddhist Cultural Context**
- Grief counselor understands 49-day mourning traditions
- Culturally-sensitive responses
- Integration of Buddhist wisdom with modern grief support

## API Endpoint

**POST** `/api/backend/chatbot`

### Request Body:
```json
{
  "message": "User's message here",
  "user_id": 123,  // Optional
  "tribute_id": 456,  // Optional
  "conversation_history": [  // Optional
    {"role": "user", "content": "Previous message"},
    {"role": "assistant", "content": "Previous response"}
  ],
  "mode": "website"  // "website" or "grief"
}
```

### Response:
```json
{
  "success": true,
  "reply": "AI response here",
  "timestamp": "2025-01-XX...",
  "crisis_detected": false  // Only present if true
}
```

## Security Notes

⚠️ **Important**: 
- The API key is currently using a fallback for development
- For production deployment, **remove the fallback** and ensure `DEEPSEEK_API_KEY` is set in environment variables
- Never commit `.env.local` to version control
- For Vercel deployment, add the environment variable in the Vercel dashboard

## Testing

The chatbot is now fully functional. Test it by:
1. Making a POST request to `/api/backend/chatbot`
2. Using the FloatingChatbot component in the frontend
3. Accessing the Grief Support page (family members only)


