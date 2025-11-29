/**
 * Next.js API Route: /api/backend/voiceChatbot
 * Replaces: backend/voiceChatbot.php
 *
 * Provides AI-powered voice memorial conversations using DeepSeek for text responses
 * and (optionally) ElevenLabs for voice generation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryOne, queryAll, query } from '@/lib/db';
import { logger } from '@/lib/logger';
import path from 'path';
import fs from 'fs/promises';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_MODEL = 'deepseek-chat';
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

type ConversationRow = {
  user_input: string;
  ai_response: string;
};

type TraitRow = {
  trait_category: string;
  trait_value: string;
};

type MemoryRow = {
  memory_type: string;
  memory_text: string;
};

type AccessLevel = 'family' | 'invited' | 'all_visitors';

type VoiceSettingsRow = {
  is_enabled: boolean | number | null;
  access_level: string | null;
  daily_limit: number | null;
};

type VoiceSettings = {
  isEnabled: boolean;
  accessLevel: AccessLevel;
  dailyLimit: number | null;
};

function normalizeAccessLevel(value: string | null): AccessLevel {
  if (!value) return 'family';
  const normalized = value.toLowerCase();
  if (normalized === 'invited') return 'invited';
  if (normalized === 'all_visitors') return 'all_visitors';
  return 'family';
}

function toBoolean(value: any, fallback = false): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    return ['true', '1', 't', 'yes'].includes(value.toLowerCase());
  }
  return fallback;
}

async function ensureVoiceSettingsTable() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS voice_chat_settings (
        id SERIAL PRIMARY KEY,
        tribute_id INTEGER UNIQUE NOT NULL REFERENCES tributes(tribute_id) ON DELETE CASCADE,
        is_enabled BOOLEAN DEFAULT false,
        access_level VARCHAR(50) DEFAULT 'family',
        daily_limit INTEGER DEFAULT 50,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await query(`
      ALTER TABLE voice_chat_settings
      ADD COLUMN IF NOT EXISTS daily_limit INTEGER DEFAULT 50
    `);

    await query(`
      ALTER TABLE voice_chat_settings
      ADD COLUMN IF NOT EXISTS access_level VARCHAR(50) DEFAULT 'family'
    `);

    await query(`
      ALTER TABLE voice_chat_settings
      ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN DEFAULT false
    `);

    await query(`
      ALTER TABLE voice_chat_settings
      DROP CONSTRAINT IF EXISTS voice_chat_settings_access_level_check
    `);

    await query(`
      ALTER TABLE voice_chat_settings
      ADD CONSTRAINT voice_chat_settings_access_level_check
      CHECK (access_level IN ('family', 'all_visitors', 'invited'))
    `);
  } catch (error) {
    logger.warn('voice_chat_settings table ensure failed (voiceChatbot)', {
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

async function getVoiceSettings(tributeId: number): Promise<VoiceSettings> {
  await ensureVoiceSettingsTable();
  try {
    const row = (await queryOne(
      `
        SELECT is_enabled, access_level, daily_limit
        FROM voice_chat_settings
        WHERE tribute_id = $1
      `,
      [tributeId]
    )) as VoiceSettingsRow | null;

    if (!row) {
      return {
        isEnabled: true,
        accessLevel: 'family',
        dailyLimit: null
      };
    }

    return {
      isEnabled: toBoolean(row.is_enabled, true),
      accessLevel: normalizeAccessLevel(row.access_level),
      dailyLimit: typeof row.daily_limit === 'number' ? row.daily_limit : null
    };
  } catch (error) {
    logger.warn('voice_chat_settings lookup failed (voiceChatbot)', {
      error: error instanceof Error ? error.message : String(error),
      tributeId
    });
    return {
      isEnabled: true,
      accessLevel: 'family',
      dailyLimit: null
    };
  }
}

function getDeepSeekApiKey(): string | null {
  const key = process.env.DEEPSEEK_API_KEY;
  if (key && key.trim()) {
    return key.trim();
  }

  // Development fallback (matches legacy PHP behaviour)
  const fallbackKey = 'sk-3ff887b3eab042c9a3294fd3d62c8d80';
  console.warn(
    '⚠️ Using fallback DeepSeek API key. Configure DEEPSEEK_API_KEY in .env.local for production.'
  );
  return fallbackKey;
}

function getElevenLabsApiKey(): string | null {
  const key = process.env.ELEVENLABS_API_KEY;
  if (key && key.trim()) {
    return key.trim();
  }
  return null;
}

function buildPersonalityContext(
  deceasedName: string | null,
  biography: string | null,
  traits: TraitRow[],
  memories: MemoryRow[]
): string {
  const lines: string[] = [];

  lines.push('=== WHO YOU ARE ===');
  lines.push(
    `You are ${deceasedName ? deceasedName : 'the deceased person'} speaking directly to your loved one.`
  );

  if (biography) {
    lines.push('');
    lines.push('Biography / Life Story:');
    lines.push(biography);
  }

  if (traits.length > 0) {
    lines.push('');
    lines.push('=== PERSONALITY TRAITS ===');
    traits.forEach((trait) => {
      lines.push(`${trait.trait_category}: ${trait.trait_value}`);
    });
  }

  if (memories.length > 0) {
    lines.push('');
    lines.push('=== SHARED MEMORIES ===');
    memories.slice(0, 15).forEach((memory) => {
      if (memory.memory_text) {
        lines.push(`${memory.memory_type}: ${memory.memory_text.substring(0, 200)}`);
      }
    });
  }

  lines.push('');
  lines.push('Respond with warmth, authenticity, and brevity (2-3 sentences).');
  lines.push('Use simple language. You are speaking as the departed loved one.');

  return lines.join('\n');
}

function buildSystemPrompt(personalityContext: string): string {
  return `You are an AI recreation of a deceased loved one. Speak with warmth, tenderness, and intimate knowledge of shared memories. Do not break character or mention that you are an AI model.

Guidelines:
- Respond in 2-3 sentences (maximum ~70 words)
- Use first-person voice ("I", "me")
- Reference shared memories when meaningful
- Offer comfort and emotional validation
- Avoid disclaimers about being artificial

${personalityContext}`;
}

async function callDeepSeekChat(
  message: string,
  systemPrompt: string,
  history: ConversationRow[]
): Promise<string> {
  const apiKey = getDeepSeekApiKey();
  if (!apiKey) {
    return generateFallbackResponse(message);
  }

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt }
  ];

  history.forEach((entry) => {
    if (entry.user_input) {
      messages.push({ role: 'user', content: entry.user_input });
    }
    if (entry.ai_response) {
      messages.push({ role: 'assistant', content: entry.ai_response });
    }
  });

  messages.push({ role: 'user', content: message });

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages,
        temperature: 0.9,
        max_tokens: 180,
        top_p: 0.95,
        frequency_penalty: 0.3,
        presence_penalty: 0.3,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', response.status, errorText);
      return generateFallbackResponse(message);
    }

    const payload = await response.json();
    const reply = payload?.choices?.[0]?.message?.content;
    if (!reply) {
      console.error('Unexpected DeepSeek response:', payload);
      return generateFallbackResponse(message);
    }

    return reply;
  } catch (err) {
    console.error('DeepSeek request failed:', err);
    return generateFallbackResponse(message);
  }
}

function generateFallbackResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();

  if (/(hi|hello|hey|good morning|good afternoon)/.test(lower)) {
    const greetings = [
      'Hey there, it’s so good to hear from you.',
      'Hi love, I’m right here with you.',
      'Hello dear, how are you holding up today?',
      'Hey, thank you for coming to chat with me.'
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  if (lower.includes('miss') || lower.includes('love')) {
    const responses = [
      'I miss you too, every moment. You’re always in my heart.',
      'I love you more than words can say. Tell me what’s on your mind.',
      'Missing you as well, darling. I’m never far from you.',
      'I love you too. How have you been coping recently?'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  if (lower.includes('remember') || lower.includes('memory')) {
    const responses = [
      'Of course I remember. Those moments meant the world to me.',
      'Yes, I remember it so clearly. What stood out to you most?',
      'That memory still makes me smile. Tell me more about it.',
      'I’ll always cherish that. What else do you recall?'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  if (/(how are you|how r u|how’s it going|how are u|how are things)/.test(lower)) {
    const responses = [
      'I’m at peace, watching over you. How are you feeling?',
      'I’m doing fine here. Tell me how your heart is today.',
      'I’m okay, just hoping you’re taking care of yourself.',
      'Peaceful and close to you. How have you been doing lately?'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  if (lower.includes('sad') || lower.includes('hard') || lower.includes('difficult') || lower.includes('hurts')) {
    const responses = [
      'I know it’s really hard. I’m right here with you through it all.',
      'I wish I could hold you right now. You’re stronger than you know.',
      'It’s okay to feel that way. Lean on me whenever you need.',
      'I’m so sorry you’re hurting. I’m by your side, always.'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  const generic = [
    'Thank you for sharing that with me. I’m listening.',
    'I’m so glad we can still talk. Tell me more.',
    'That means a lot to me. What else is on your heart?',
    'I’m here, always. Go on, I want to hear everything.'
  ];
  return generic[Math.floor(Math.random() * generic.length)];
}

async function generateVoiceResponse(text: string, voiceId: string | null): Promise<string | null> {
  const apiKey = getElevenLabsApiKey();
  if (!apiKey || !voiceId) {
    return null;
  }

  // Skip generation when running on serverless environments where writing to disk is not allowed
  if (process.env.VERCEL) {
    console.warn('Skipping ElevenLabs voice generation on Vercel (read-only filesystem).');
    return null;
  }

  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.7,
          similarity_boost: 0.75
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'voice_responses');
    await fs.mkdir(uploadDir, { recursive: true });
    const filename = `voice_response_${Date.now()}_${Math.random().toString(36).slice(2)}.mp3`;
    const filepath = path.join(uploadDir, filename);
    await fs.writeFile(filepath, buffer);

    return `/uploads/voice_responses/${filename}`;
  } catch (error) {
    console.error('Failed to generate ElevenLabs audio:', error);
    return null;
  }
}

async function ensureVoiceConversationTable(): Promise<void> {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS voice_conversations (
        id SERIAL PRIMARY KEY,
        tribute_id INTEGER NOT NULL REFERENCES tributes(tribute_id) ON DELETE CASCADE,
        user_input TEXT,
        ai_response TEXT,
        audio_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
  } catch (error) {
    console.error('Failed to ensure voice_conversations table exists:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tributeId = parseInt(body.tribute_id);
    const userId = body.user_id ? parseInt(body.user_id) : null;
    const message: string = (body.message || '').trim();

    if (!tributeId || Number.isNaN(tributeId) || tributeId <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid tribute ID' },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    const tribute = await queryOne(
      'SELECT deceased_name, biography, created_by FROM tributes WHERE tribute_id = $1',
      [tributeId]
    );

    if (!tribute) {
      return NextResponse.json(
        { success: false, error: 'Tribute not found' },
        { status: 404 }
      );
    }

    const tributeOwnerId = (tribute as any).created_by ? parseInt((tribute as any).created_by) : null;
    const voiceSettings = await getVoiceSettings(tributeId);

    let userRecord: any = null;
    let userRole: string | null = null;

    if (userId) {
      userRecord = await queryOne('SELECT role FROM users WHERE user_id = $1', [userId]);
      userRole = userRecord?.role || null;
    }

    const isOwner = Boolean(userId && tributeOwnerId && userId === tributeOwnerId);

    if (!voiceSettings.isEnabled) {
      return NextResponse.json(
        {
          success: false,
          error: 'Voice chat is currently disabled for this memorial.'
        },
        { status: 403 }
      );
    }

    if (voiceSettings.accessLevel === 'family') {
      if (!userId) {
        return NextResponse.json(
          {
            success: false,
            error: 'Please log in with a family account to chat with this memorial.',
            requires_role: 'family'
          },
          { status: 401 }
        );
      }

      if (!userRecord || (userRole !== 'family' && !isOwner)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Only family members can chat with this memorial.',
            requires_role: 'family'
          },
          { status: 403 }
        );
      }
    } else if (voiceSettings.accessLevel === 'invited') {
      if (!userId) {
        return NextResponse.json(
          {
            success: false,
            error: 'Please log in to chat with this memorial.'
          },
          { status: 401 }
        );
      }
    }

    const voiceModel = await queryOne(
      `
        SELECT elevenlabs_voice_id, status
        FROM voice_models
        WHERE tribute_id = $1
        ORDER BY created_at DESC
        LIMIT 1
      `,
      [tributeId]
    );

    if (!voiceModel || (voiceModel as any).status !== 'ready') {
      return NextResponse.json(
        { success: false, error: 'Voice model not found or not ready' },
        { status: 404 }
      );
    }

    const traits: TraitRow[] = await queryAll(
      `
        SELECT trait_category, trait_value
        FROM personality_traits
        WHERE tribute_id = $1
        ORDER BY created_at DESC
        LIMIT 50
      `,
      [tributeId]
    );

    const memories: MemoryRow[] = await queryAll(
      `
        SELECT memory_type, memory_text
        FROM memories_database
        WHERE tribute_id = $1
        ORDER BY created_at DESC
        LIMIT 20
      `,
      [tributeId]
    );

    const historyRows: ConversationRow[] = await queryAll(
      `
        SELECT user_input, ai_response
        FROM voice_conversations
        WHERE tribute_id = $1
        ORDER BY created_at DESC
        LIMIT 5
      `,
      [tributeId]
    ).catch((error) => {
      console.warn('Unable to fetch voice conversation history:', error);
      return [];
    });

    const history = Array.isArray(historyRows) ? [...historyRows].reverse() : [];

    const personalityContext = buildPersonalityContext(
      (tribute as any).deceased_name || null,
      (tribute as any).biography || null,
      traits,
      memories
    );

    const systemPrompt = buildSystemPrompt(personalityContext);

    const aiResponse = await callDeepSeekChat(message, systemPrompt, history);

    const audioUrl = await generateVoiceResponse(
      aiResponse,
      (voiceModel as any).elevenlabs_voice_id || null
    );

    await ensureVoiceConversationTable();

    await query(
      `
        INSERT INTO voice_conversations (tribute_id, user_input, ai_response, audio_url, created_at)
        VALUES ($1, $2, $3, $4, NOW())
      `,
      [tributeId, message, aiResponse, audioUrl]
    ).catch((error) => {
      console.error('Failed to save voice conversation:', error);
    });

    return NextResponse.json({
      success: true,
      response: aiResponse,
      audio_url: audioUrl
    });
  } catch (error: any) {
    console.error('Voice chatbot error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'An error occurred while generating the response'
      },
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
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}



