/**
 * Next.js API Route: /api/backend/getVoiceStatus
 * Replaces: backend/checkVoiceStatus.php
 *
 * Provides aggregated status information for a tribute's AI voice memorial.
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryOne, queryAll, query } from '@/lib/db';
import { successResponse } from '@/lib/api-response';
import { ValidationError, NotFoundError, formatErrorResponse, getErrorStatusCode, InternalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';

type RawVoiceModel = {
  voice_id: string | null;
  elevenlabs_voice_id: string | null;
  status: string | null;
  audio_sample_path: string | null;
  created_at: Date | null;
};

type RawVoiceSettings = {
  is_enabled: boolean | number | null;
  access_level: string | null;
  daily_limit: number | null;
  updated_at?: Date | null;
};

function toBoolean(value: any, fallback = false): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    return ['true', '1', 't', 'yes'].includes(value.toLowerCase());
  }
  return fallback;
}

function formatTribute(row: any) {
  if (!row) return null;
  return {
    tribute_id: row.tribute_id,
    name: row.deceased_name,
    deceased_name: row.deceased_name,
    birth_date: row.birth_date,
    death_date: row.death_date,
    biography: row.biography,
    photo_url: row.photo_url,
    created_by: row.created_by,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
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
    logger.warn('voice_chat_settings ensure failed', { error: error instanceof Error ? error.message : String(error) });
  }
}

async function ensureVoiceConversationsTable() {
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
    logger.warn('voice_conversations ensure failed', { error: error instanceof Error ? error.message : String(error) });
  }
}

export async function GET(request: NextRequest) {
  try {
    const tributeIdParam =
      request.nextUrl.searchParams.get('tribute_id') ??
      request.nextUrl.searchParams.get('id');

    const tributeId = tributeIdParam ? parseInt(tributeIdParam) : NaN;

    if (!tributeId || Number.isNaN(tributeId) || tributeId <= 0) {
      throw new ValidationError('Invalid tribute ID');
    }

    const tribute = await queryOne(
      `
        SELECT tribute_id, deceased_name, birth_date, death_date, biography, photo_url,
               created_by, created_at, updated_at
        FROM tributes
        WHERE tribute_id = $1
      `,
      [tributeId]
    );

    if (!tribute) {
      throw new NotFoundError('Tribute not found');
    }

    let voiceModel: RawVoiceModel | null = null;
    try {
      voiceModel = (await queryOne(
        `
          SELECT voice_id, elevenlabs_voice_id, status, audio_sample_path, created_at
          FROM voice_models
          WHERE tribute_id = $1
          ORDER BY created_at DESC
          LIMIT 1
        `,
        [tributeId]
      )) as RawVoiceModel | null;
    } catch (error) {
      logger.warn('voice_models lookup failed', { error: error instanceof Error ? error.message : String(error) });
      voiceModel = null;
    }

    let memoryCountRow: { count: number } | null = null;
    try {
      memoryCountRow = await queryOne(
        `SELECT COUNT(*)::int AS count FROM memories_database WHERE tribute_id = $1`,
        [tributeId]
      );
    } catch (error) {
      logger.warn('memories_database count failed', { error: error instanceof Error ? error.message : String(error) });
      memoryCountRow = { count: 0 };
    }

    let traitCountRow: { count: number } | null = null;
    try {
      traitCountRow = await queryOne(
        `SELECT COUNT(*)::int AS count FROM personality_traits WHERE tribute_id = $1`,
        [tributeId]
      );
    } catch (error) {
      logger.warn('personality_traits count failed', { error: error instanceof Error ? error.message : String(error) });
      traitCountRow = { count: 0 };
    }

    await ensureVoiceSettingsTable();
    await ensureVoiceConversationsTable();

    let voiceSettingsRow: RawVoiceSettings | null = null;
    try {
      voiceSettingsRow = (await queryOne(
        `
          SELECT is_enabled, access_level, daily_limit, updated_at
          FROM voice_chat_settings
          WHERE tribute_id = $1
          LIMIT 1
        `,
        [tributeId]
      )) as RawVoiceSettings | null;
    } catch (error) {
      logger.warn('voice_chat_settings lookup failed', { error: error instanceof Error ? error.message : String(error) });
      voiceSettingsRow = null;
    }

    let conversationsCountRow: { count: number } | null = null;
    try {
      conversationsCountRow = await queryOne(
        `SELECT COUNT(*)::int AS count FROM voice_conversations WHERE tribute_id = $1`,
        [tributeId]
      );
    } catch (error) {
      logger.warn('voice_conversations count failed', { error: error instanceof Error ? error.message : String(error) });
      conversationsCountRow = { count: 0 };
    }

    const memoryCount = memoryCountRow?.count ?? 0;
    const traitCount = traitCountRow?.count ?? 0;
    const totalConversations = conversationsCountRow?.count ?? 0;

    const voiceUploaded = Boolean(voiceModel?.voice_id || voiceModel?.elevenlabs_voice_id);
    const voiceStatus = voiceModel?.status ?? (voiceUploaded ? 'processing' : 'not_started');
    const voiceReady = voiceStatus === 'ready';
    const memoriesAdded = memoryCount > 0 || traitCount > 0;

    const isEnabled = toBoolean(voiceSettingsRow?.is_enabled, true);
    const accessLevel =
      voiceSettingsRow?.access_level && typeof voiceSettingsRow.access_level === 'string'
        ? voiceSettingsRow.access_level
        : 'family';
    const dailyLimit =
      typeof voiceSettingsRow?.daily_limit === 'number'
        ? voiceSettingsRow.daily_limit
        : 50;

    const chatEnabled = voiceReady && isEnabled;
    const setupComplete = voiceReady && memoriesAdded;

    return NextResponse.json(
      successResponse({
        tribute: formatTribute(tribute),
        voice_model: voiceModel
          ? {
              voice_id: voiceModel.voice_id,
              elevenlabs_voice_id: voiceModel.elevenlabs_voice_id,
              status: voiceStatus,
              audio_sample_path: voiceModel.audio_sample_path,
              created_at: voiceModel.created_at
            }
          : null,
        memory_count: memoryCount,
        trait_count: traitCount,
        voice_status: voiceStatus,
        flags: {
          voiceUploaded,
          voiceReady,
          voiceProcessing: voiceStatus === 'processing',
          memoriesAdded,
          chatEnabled,
          setupComplete
        },
        settings: {
          is_enabled: isEnabled,
          access_level: accessLevel,
          daily_limit: dailyLimit,
          updated_at: voiceSettingsRow?.updated_at ?? null
        },
        stats: {
          total_conversations: totalConversations
        }
      }, 'Voice status retrieved successfully')
    );
  } catch (error: any) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      const errorResponseData = formatErrorResponse(error);
      return NextResponse.json(errorResponseData, { status: getErrorStatusCode(error) });
    }
    
    logger.error('Get voice status error', { error: error.message, stack: error.stack });
    const serverError = new InternalServerError('Error fetching voice status');
    const errorResponseData = formatErrorResponse(serverError);
    return NextResponse.json(errorResponseData, { status: getErrorStatusCode(serverError) });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}


