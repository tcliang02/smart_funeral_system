import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { successResponse } from '@/lib/api-response';
import { ValidationError, formatErrorResponse, getErrorStatusCode, InternalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';

type NewMemory = {
  content?: string;
  text?: string;
  type?: string;
};

type NewTrait = {
  category?: string;
  key?: string;
  trait_key?: string;
  value?: string;
  trait_value?: string;
};

async function ensureMemoriesTable() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS memories_database (
        id SERIAL PRIMARY KEY,
        tribute_id INTEGER NOT NULL REFERENCES tributes(tribute_id) ON DELETE CASCADE,
        memory_text TEXT NOT NULL,
        memory_type VARCHAR(50) DEFAULT 'story',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
  } catch (error) {
    logger.warn('memories_database ensure failed', { error: error instanceof Error ? error.message : String(error) });
  }
}

async function ensureTraitsTable() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS personality_traits (
        id SERIAL PRIMARY KEY,
        tribute_id INTEGER NOT NULL REFERENCES tributes(tribute_id) ON DELETE CASCADE,
        trait_category VARCHAR(100) DEFAULT 'general',
        trait_value TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
  } catch (error) {
    logger.warn('personality_traits ensure failed', { error: error instanceof Error ? error.message : String(error) });
  }
}

export async function POST(request: NextRequest) {
  let transactionStarted = false;

  try {
    const body = await request.json();
    const tributeIdRaw = body.tribute_id ?? body.tributeId;
    const tributeId = tributeIdRaw ? parseInt(tributeIdRaw, 10) : NaN;

    if (!tributeId || Number.isNaN(tributeId) || tributeId <= 0) {
      throw new ValidationError('Invalid tribute ID');
    }

    const memories: NewMemory[] = Array.isArray(body.memories) ? body.memories : [];
    const traits: NewTrait[] = Array.isArray(body.traits) ? body.traits : [];

    await ensureMemoriesTable();
    await ensureTraitsTable();

    await query('BEGIN');
    transactionStarted = true;

    let memoriesSaved = 0;
    for (const memory of memories) {
      const content =
        (typeof memory.content === 'string' ? memory.content : null) ??
        (typeof memory.text === 'string' ? memory.text : null) ??
        '';

      const cleaned = content.trim();
      if (!cleaned) continue;

      const type = (memory.type || 'story').toLowerCase();

      await query(
        `
          INSERT INTO memories_database (tribute_id, memory_text, memory_type, created_at)
          VALUES ($1, $2, $3, NOW())
        `,
        [tributeId, cleaned, type]
      );
      memoriesSaved++;
    }

    let traitsSaved = 0;
    for (const trait of traits) {
      const value =
        (typeof trait.value === 'string' ? trait.value : null) ??
        (typeof trait.trait_value === 'string' ? trait.trait_value : null) ??
        '';

      const cleaned = value.trim();
      if (!cleaned) continue;

      const category =
        (trait.category || trait.key || trait.trait_key || 'general').toLowerCase();

      await query(
        `
          INSERT INTO personality_traits (tribute_id, trait_category, trait_value, created_at)
          VALUES ($1, $2, $3, NOW())
        `,
        [tributeId, category, cleaned]
      );
      traitsSaved++;
    }

    await query('COMMIT');

    return NextResponse.json(
      successResponse({
        memories_saved: memoriesSaved,
        traits_saved: traitsSaved
      }, 'Memories and traits saved successfully')
    );
  } catch (error: any) {
    if (transactionStarted) {
      await query('ROLLBACK');
    }

    if (error instanceof ValidationError) {
      const errorResponseData = formatErrorResponse(error);
      return NextResponse.json(errorResponseData, { status: getErrorStatusCode(error) });
    }
    
    logger.error('Save memories error', { error: error.message, stack: error.stack });
    const serverError = new InternalServerError('Failed to save memories and traits');
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



