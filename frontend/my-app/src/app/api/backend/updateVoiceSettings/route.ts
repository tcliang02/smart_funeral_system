/**
 * Next.js API Route: /api/backend/updateVoiceSettings
 * Replaces: backend/updateVoiceSettings.php
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';
import { successResponse } from '@/lib/api-response';
import { ValidationError, formatErrorResponse, getErrorStatusCode, InternalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';

const VALID_ACCESS_LEVELS = ['family', 'all_visitors', 'invited'];

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

    // Ensure legacy tables have the latest columns/constraints
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

    // Refresh the check constraint so legacy databases accept new access levels
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
    logger.warn('voice_chat_settings table ensure failed', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    // Continue execution - table might already exist
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tributeIdRaw = body.tribute_id ?? body.tributeId;
    const tributeId = tributeIdRaw ? parseInt(tributeIdRaw) : NaN;

    if (!tributeId || Number.isNaN(tributeId) || tributeId <= 0) {
      throw new ValidationError('Invalid tribute ID');
    }

    const isEnabled = Boolean(body.is_enabled ?? body.isEnabled ?? false);
    const accessLevelRaw = (body.access_level ?? body.accessLevel ?? 'family') as string;
    const accessLevel = VALID_ACCESS_LEVELS.includes(accessLevelRaw)
      ? accessLevelRaw
      : 'family';

    await ensureVoiceSettingsTable();

    // Check if settings exist
    let existing;
    try {
      existing = await queryOne(
        'SELECT id FROM voice_chat_settings WHERE tribute_id = $1',
        [tributeId]
      );
    } catch (error) {
      logger.error('Failed to check existing voice settings', { 
        error: error instanceof Error ? error.message : String(error),
        tributeId 
      });
      throw new InternalServerError('Failed to check existing settings');
    }

    try {
      if (existing) {
        await query(
          `
            UPDATE voice_chat_settings
            SET is_enabled = $1,
                access_level = $2,
                updated_at = NOW()
            WHERE tribute_id = $3
          `,
          [isEnabled, accessLevel, tributeId]
        );
      } else {
        await query(
          `
            INSERT INTO voice_chat_settings (tribute_id, is_enabled, access_level)
            VALUES ($1, $2, $3)
          `,
          [tributeId, isEnabled, accessLevel]
        );
      }
    } catch (error) {
      logger.error('Failed to save voice settings', { 
        error: error instanceof Error ? error.message : String(error),
        tributeId,
        isEnabled,
        accessLevel
      });
      throw new InternalServerError('Failed to save voice settings to database');
    }

    return NextResponse.json(
      successResponse({
        settings: {
          is_enabled: isEnabled,
          access_level: accessLevel
        }
      }, 'Voice chat settings updated successfully')
    );
  } catch (error: any) {
    if (error instanceof ValidationError || error instanceof InternalServerError) {
      const errorResponseData = formatErrorResponse(error);
      return NextResponse.json(errorResponseData, { status: getErrorStatusCode(error) });
    }
    
    // Log the full error details for debugging
    logger.error('Update voice settings error', { 
      error: error?.message || String(error), 
      stack: error?.stack,
      name: error?.name,
      body: error?.body
    });
    
    const serverError = new InternalServerError(
      error?.message || 'Failed to update voice settings'
    );
    const errorResponseData = formatErrorResponse(serverError);
    return NextResponse.json(errorResponseData, { status: getErrorStatusCode(serverError) });
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



