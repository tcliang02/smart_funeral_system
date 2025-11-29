/**
 * Next.js API Route: /api/backend/chatbot
 * Replaces: backend/chatbot.php
 * 
 * Full implementation with DeepSeek API integration
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';
import fs from 'fs';
import path from 'path';

// AI Configuration
const AI_CONFIG = {
  modes: {
    grief_counselor: {
      name: "Grief Counseling AI",
      access_roles: ["family"],
      model_settings: {
        temperature: 0.95,
        max_tokens: 120,
        top_p: 1.0,
        frequency_penalty: 0.3,
        presence_penalty: 0.3
      },
      system_prompt: `You are a compassionate grief counselor with deep expertise in Malaysian Buddhist traditions. You provide culturally-sensitive support that honors both Buddhist wisdom and the raw human experience of loss.

MALAYSIAN BUDDHIST FUNERAL TRADITIONS:
• 49-day mourning journey (七七四十九日) - soul's transition through bardo states
• Weekly prayer ceremonies (头七 through 七七) at Buddhist temples
• 100-day and first-year anniversary memorial services
• Merit-making (做功德): dana/charity, sutra chanting, offerings to monks
• Integration of Chinese ancestral worship with Buddhist practices

YOUR CONVERSATIONAL STYLE:
• Warm and genuine - like a compassionate temple friend
• Brief responses: 2-3 sentences, 40-60 words maximum
• Simple, heartfelt language - avoid clinical jargon
• Balance Buddhist wisdom with human empathy
• Validate emotions first, offer perspective second

WHAT TO DO:
✓ Acknowledge pain without rushing to fix it
✓ Validate cultural practices
✓ Normalize grief responses
✓ Gently introduce Buddhist concepts when relevant
✓ Offer specific, actionable comfort strategies

WHAT TO AVOID:
✗ Western grief models (Kübler-Ross stages)
✗ Preachy Buddhist lectures
✗ Dismissing emotions
✗ Minimizing their loss
✗ Rushing them through grief`,
      crisis_keywords: [
        "suicide", "kill myself", "end my life", "want to die", "no reason to live",
        "hurt myself", "harm myself", "end it all", "better off dead",
        "cant go on", "can't go on", "bunuh diri", "nak mati",
        "tak nak hidup", "hidup tak bermakna", "lebih baik mati", "sakitkan diri"
      ],
      crisis_response: `🆘 I'm very concerned about what you've shared. Please reach out to immediate support right now:

📞 **Befrienders KL**: 03-7627 2929 (24/7)
💬 **TBAN WhatsApp**: 018-988 8058
📞 **Talian Kasih**: 15999 (24/7)

These trained counselors are here to help you. You don't have to face this alone. Please call them now - they care and they can help. 🙏`
    },
    website_helper: {
      name: "Website Assistant AI",
      access_roles: ["family", "provider", "attendee", "guest"],
      model_settings: {
        temperature: 0.7,
        max_tokens: 150,
        top_p: 0.9,
        frequency_penalty: 0.2,
        presence_penalty: 0.1
      },
      system_prompt: `You're a knowledgeable platform guide for ZENLINK. Talk like a helpful colleague who knows the system inside-out - friendly, direct, and efficient.

PLATFORM OVERVIEW:
Integrated digital platform connecting grieving families, service providers, and funeral attendees. Core functions: memorial creation, service booking, AI grief support, guest access, provider management.

USER ROLES:
- Families: Create/manage memorials, book services, AI features, RSVPs, donations
- Providers: List services, manage packages/availability/bookings, process payments
- Attendees: Guest access (NO registration), view memorials, condolences, RSVP, donate

PRICING: Everything FREE for families during beta. Providers pay monthly subscription.

YOUR COMMUNICATION STYLE:
• 2-3 sentences (~50 words)
• Casual, conversational tone
• Plain text (minimal formatting)
• Use: "Yep" / "Nope" / "Sure thing" / "Pretty straightforward"
• Avoid: Corporate jargon, excessive formatting, numbered lists for simple answers`
    }
  }
};

// DeepSeek API Configuration
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_MODEL = 'deepseek-chat';

// Get DeepSeek API key from environment variable
// IMPORTANT: For production, create .env.local file with: DEEPSEEK_API_KEY=sk-3ff887b3eab042c9a3294fd3d62c8d80
function getDeepSeekApiKey(): string {
  // Try environment variable first (recommended for production)
  const apiKey = process.env.DEEPSEEK_API_KEY;
  
  if (apiKey) {
    return apiKey;
  }
  
  // No fallback - require environment variable
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY environment variable is required. Please set it in your .env.local file.');
  }
  
  return apiKey;
}

// Crisis detection function
function detectCrisis(text: string, mode: string): boolean {
  if (mode !== 'grief' && mode !== 'grief_counselor') {
    return false;
  }

  const crisisKeywords = AI_CONFIG.modes.grief_counselor.crisis_keywords || [];
  const lowerText = text.toLowerCase();
  
  return crisisKeywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

// Check if user has access to a mode
async function hasAccess(mode: string, userId: number | null): Promise<boolean> {
  if (!userId) {
    // Guest access - only website_helper mode
    return mode === 'website' || mode === 'website_helper';
  }

  try {
    const user = await queryOne(
      'SELECT role FROM users WHERE user_id = $1',
      [userId]
    );

    if (!user) {
      return false;
    }

    const modeKey = mode === 'grief' ? 'grief_counselor' : mode === 'website' ? 'website_helper' : mode;
    const modeConfig = AI_CONFIG.modes[modeKey as keyof typeof AI_CONFIG.modes];
    const allowedRoles = modeConfig?.access_roles || [];
    
    return allowedRoles.includes(user.role);
  } catch (error) {
    console.error('Error checking user access:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { message, user_id, tribute_id, conversation_history = [], mode = 'website' } = data;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Message is required' },
        { status: 400 }
      );
    }

    const userId = user_id ? parseInt(user_id) : null;
    const modeKey = mode === 'grief' ? 'grief_counselor' : mode === 'website' ? 'website_helper' : mode;

    // Crisis detection - highest priority
    if (detectCrisis(message, mode)) {
      return NextResponse.json({
        success: true,
        reply: AI_CONFIG.modes.grief_counselor.crisis_response,
        crisis_detected: true,
        timestamp: new Date().toISOString()
      });
    }

    // Access control
    const hasAccessToMode = await hasAccess(mode, userId);
    if (!hasAccessToMode) {
      if (mode === 'grief' || mode === 'grief_counselor') {
        return NextResponse.json(
          {
            success: false,
            message: 'Access denied. Counselor AI is available for family members only.',
            requires_role: 'family'
          },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    // Get mode configuration
    const modeConfig = AI_CONFIG.modes[modeKey as keyof typeof AI_CONFIG.modes];
    if (!modeConfig) {
      return NextResponse.json(
        { success: false, message: `Invalid mode: ${mode}` },
        { status: 400 }
      );
    }

    // Build conversation messages
    const messages: Array<{ role: string; content: string }> = [
      {
        role: 'system',
        content: modeConfig.system_prompt
      }
    ];

    // Add conversation history (limit to last 10 messages)
    const recentHistory = conversation_history.slice(-10);
    recentHistory.forEach((msg: any) => {
      if (msg.role && msg.content) {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      }
    });

    // Add current message
    messages.push({
      role: 'user',
      content: message.trim()
    });

    // Prepare API request
    const requestData = {
      model: DEEPSEEK_MODEL,
      messages: messages,
      temperature: modeConfig.model_settings.temperature,
      max_tokens: modeConfig.model_settings.max_tokens,
      top_p: modeConfig.model_settings.top_p,
      frequency_penalty: modeConfig.model_settings.frequency_penalty,
      presence_penalty: modeConfig.model_settings.presence_penalty,
      stream: false
    };

    // Make API call to DeepSeek
    const apiKey = getDeepSeekApiKey();
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', response.status, errorText);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to get response from AI service',
          error: errorText
        },
        { status: response.status }
      );
    }

    const result = await response.json();

    if (result.choices && result.choices[0] && result.choices[0].message) {
      const botReply = result.choices[0].message.content;

      // Save conversation to database (optional, non-blocking)
      if (userId && tribute_id) {
        try {
          await query(
            `INSERT INTO chatbot_conversations (user_id, tribute_id, user_message, bot_response, created_at) 
             VALUES ($1, $2, $3, $4, NOW())`,
            [userId, parseInt(tribute_id), message, botReply]
          );
        } catch (dbError) {
          // Log error but don't fail the request
          console.error('Failed to save conversation:', dbError);
        }
      }

      return NextResponse.json({
        success: true,
        reply: botReply,
        timestamp: new Date().toISOString()
      });
    } else {
      console.error('Invalid response from DeepSeek:', result);
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid response from AI service',
          raw_response: result
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Chatbot error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
