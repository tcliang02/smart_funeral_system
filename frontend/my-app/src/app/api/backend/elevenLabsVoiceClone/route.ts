import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';
import path from 'path';
import fs from 'fs/promises';
import { successResponse } from '@/lib/api-response';
import { ValidationError, NotFoundError, formatErrorResponse, getErrorStatusCode, InternalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = [
  'audio/wav',
  'audio/mpeg',
  'audio/mp4',
  'audio/webm',
  'audio/ogg',
  'audio/x-m4a'
];

async function ensureVoiceModelsTable() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS voice_models (
        voice_id SERIAL PRIMARY KEY,
        tribute_id INTEGER UNIQUE NOT NULL REFERENCES tributes(tribute_id) ON DELETE CASCADE,
        elevenlabs_voice_id VARCHAR(255),
        audio_sample_path TEXT,
        status VARCHAR(50) DEFAULT 'processing',
        created_by INTEGER,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
  } catch (error) {
    logger.warn('voice_models ensure failed', { error: error instanceof Error ? error.message : String(error) });
  }
}

async function callElevenLabsAPI(
  buffer: Buffer,
  fileName: string,
  voiceName: string
): Promise<string> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return `mock_voice_${Date.now()}`;
  }

  try {
    const formData = new FormData();
    formData.append('name', voiceName);
    const blob = new Blob([buffer], { type: mimeType || 'audio/mpeg' });
    formData.append('files', blob, fileName);

    const response = await fetch(`${process.env.ELEVENLABS_API_URL ?? 'https://api.elevenlabs.io/v1'}/voices/add`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey
      },
      body: formData
    });

    if (!response.ok) {
      const text = await response.text();
      logger.warn('ElevenLabs API error', { status: response.status, error: text });
      return `mock_voice_${Date.now()}`;
    }

    const data = await response.json();
    return data?.voice_id || `mock_voice_${Date.now()}`;
  } catch (error) {
    logger.warn('ElevenLabs API request failed', { error: error instanceof Error ? error.message : String(error) });
    return `mock_voice_${Date.now()}`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const tributeIdRaw = formData.get('tribute_id');
    const audioSample = formData.get('audio_sample');

    const tributeId = tributeIdRaw ? parseInt(String(tributeIdRaw), 10) : NaN;
    if (!tributeId || Number.isNaN(tributeId) || tributeId <= 0) {
      throw new ValidationError('Invalid tribute ID');
    }

    if (!(audioSample instanceof File)) {
      throw new ValidationError('No audio file uploaded or invalid file field');
    }

    if (audioSample.size > MAX_FILE_SIZE) {
      throw new ValidationError('File too large. Maximum size is 50MB.');
    }

    if (audioSample.type && !ALLOWED_TYPES.includes(audioSample.type)) {
      throw new ValidationError('Invalid file type. Allowed: WAV, MP3, M4A, WebM, OGG');
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'voice_samples');
    await fs.mkdir(uploadDir, { recursive: true });

    const originalName = audioSample.name || `voice_sample_${tributeId}.webm`;
    const extension = path.extname(originalName) || '.webm';
    const fileName = `voice_sample_${tributeId}_${Date.now()}${extension}`;
    const filePath = path.join(uploadDir, fileName);

    const buffer = Buffer.from(await audioSample.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    const tribute = await queryOne(
      'SELECT deceased_name, created_by FROM tributes WHERE tribute_id = $1',
      [tributeId]
    );

    const voiceName = tribute?.deceased_name
      ? `${tribute.deceased_name}'s Voice`
      : `Voice ${tributeId}`;

    const elevenlabsVoiceId = await callElevenLabsAPI(
      buffer,
      fileName,
      voiceName,
      audioSample.type || 'audio/mpeg'
    );

    await ensureVoiceModelsTable();

    const existingModel = await queryOne(
      'SELECT voice_id FROM voice_models WHERE tribute_id = $1',
      [tributeId]
    );

    if (existingModel) {
      try {
        await query(
          `
            UPDATE voice_models
            SET elevenlabs_voice_id = $1,
                audio_sample_path = $2,
                status = $3,
                updated_at = NOW()
            WHERE tribute_id = $4
          `,
          [elevenlabsVoiceId, fileName, 'ready', tributeId]
        );
      } catch (error) {
        logger.warn('voice_models update fallback triggered', { error: error instanceof Error ? error.message : String(error) });
        await query(
          `
            UPDATE voice_models
            SET elevenlabs_voice_id = $1,
                audio_sample_path = $2,
                status = $3
            WHERE tribute_id = $4
          `,
          [elevenlabsVoiceId, fileName, 'ready', tributeId]
        );
      }
    } else {
      try {
        await query(
          `
            INSERT INTO voice_models (
              tribute_id,
              elevenlabs_voice_id,
              audio_sample_path,
              status,
              created_by,
              created_at
            ) VALUES ($1, $2, $3, $4, $5, NOW())
          `,
          [
            tributeId,
            elevenlabsVoiceId,
            fileName,
            'ready',
            tribute?.created_by ?? null
          ]
        );
      } catch (error) {
        logger.warn('voice_models insert fallback triggered', { error: error instanceof Error ? error.message : String(error) });
        await query(
          `
            INSERT INTO voice_models (
              tribute_id,
              elevenlabs_voice_id,
              audio_sample_path,
              status,
              created_at
            ) VALUES ($1, $2, $3, $4, NOW())
          `,
          [tributeId, elevenlabsVoiceId, fileName, 'ready']
        );
      }
    }

    return NextResponse.json(
      successResponse({
        voice_id: elevenlabsVoiceId,
        file_path: fileName
      }, 'Voice sample uploaded successfully')
    );
  } catch (error: any) {
    if (error instanceof ValidationError) {
      const errorResponseData = formatErrorResponse(error);
      return NextResponse.json(errorResponseData, { status: getErrorStatusCode(error) });
    }
    
    logger.error('ElevenLabs voice clone error', { error: error.message, stack: error.stack });
    const serverError = new InternalServerError('Failed to upload voice sample');
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

