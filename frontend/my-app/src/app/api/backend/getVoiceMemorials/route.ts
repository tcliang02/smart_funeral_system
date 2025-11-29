/**
 * Next.js API Route: /api/backend/getVoiceMemorials
 * Replaces: backend/getVoiceMemorials.php
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';
import { successResponse } from '@/lib/api-response';
import { formatErrorResponse, getErrorStatusCode, InternalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const user_id = request.nextUrl.searchParams.get('user_id');

    let query = `
      SELECT 
        t.tribute_id,
        t.deceased_name as name,
        t.birth_date as date_of_birth,
        t.death_date as date_of_death,
        t.photo_url as profile_picture,
        t.created_by,
        vm.voice_id,
        vm.elevenlabs_voice_id,
        vm.audio_sample_path,
        vm.status as voice_status,
        vm.created_at as voice_created_at,
        (SELECT COUNT(*) FROM memories_database WHERE tribute_id = t.tribute_id) as memory_count,
        (SELECT COUNT(*) FROM personality_traits WHERE tribute_id = t.tribute_id) as trait_count
      FROM tributes t
      INNER JOIN voice_models vm ON t.tribute_id = vm.tribute_id
      WHERE vm.status IN ('ready', 'processing', 'failed')
    `;

    const params: any[] = [];

    // If user_id is provided, filter by tributes they created
    if (user_id && parseInt(user_id) > 0) {
      query += ' AND t.created_by = $1';
      params.push(parseInt(user_id));
    }

    query += ' ORDER BY vm.created_at DESC';

    const results = await queryAll(query, params);

    const voiceMemorials = results.map((row: any) => {
      // Build full photo URL if photo_url exists
      let photoUrl = null;
      if (row.profile_picture) {
        if (row.profile_picture.startsWith('http')) {
          photoUrl = row.profile_picture;
        } else {
          photoUrl = process.env.NEXT_PUBLIC_BASE_URL 
            ? `${process.env.NEXT_PUBLIC_BASE_URL}/${row.profile_picture}`
            : row.profile_picture;
        }
      }

      return {
        tribute_id: row.tribute_id,
        name: row.name,
        birth_date: row.date_of_birth,
        death_date: row.date_of_death,
        photo: photoUrl,
        profile_picture: photoUrl,
        voice_id: row.voice_id,
        elevenlabs_voice_id: row.elevenlabs_voice_id,
        audio_sample_path: row.audio_sample_path,
        voice_status: row.voice_status,
        memory_count: parseInt(row.memory_count) || 0,
        trait_count: parseInt(row.trait_count) || 0,
        setup_complete: (parseInt(row.memory_count) > 0 || parseInt(row.trait_count) > 0),
        created_at: row.voice_created_at
      };
    });

    return NextResponse.json(
      successResponse({ 
        voice_memorials: voiceMemorials,
        count: voiceMemorials.length 
      }, 'Voice memorials retrieved successfully')
    );

  } catch (error: any) {
    logger.error('Get voice memorials error', { error: error.message, stack: error.stack });
    const serverError = new InternalServerError('Failed to retrieve voice memorials');
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
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

