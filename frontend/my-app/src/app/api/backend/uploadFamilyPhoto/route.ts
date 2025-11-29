/**
 * Next.js API Route: /api/backend/uploadFamilyPhoto
 * Replaces: backend/uploadFamilyPhoto.php
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';
import { successResponse } from '@/lib/api-response';
import { ValidationError, NotFoundError, ForbiddenError, formatErrorResponse, getErrorStatusCode, InternalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const input = await request.json();

    // Validate required fields
    if (!input.tribute_id || !input.user_id || !input.photo_url) {
      throw new ValidationError('Missing required fields: tribute_id, user_id, photo_url');
    }

    // Verify user is tribute creator (family member)
    const tribute = await queryOne(
      'SELECT created_by FROM tributes WHERE tribute_id = $1',
      [input.tribute_id]
    );

    if (!tribute) {
      throw new NotFoundError('Tribute not found');
    }

    // Convert both to integers for comparison
    const creatorId = parseInt(String(tribute.created_by || '0'));
    const userIdInt = parseInt(String(input.user_id));

    if (creatorId !== userIdInt) {
      throw new ForbiddenError('Only family members can upload to gallery');
    }

    // Get uploader name from user_id
    let uploaded_by = 'Family Member';
    try {
      const user = await queryOne(
        'SELECT name FROM users WHERE user_id = $1',
        [input.user_id]
      );
      if (user && user.name) {
        uploaded_by = user.name;
      }
    } catch (e) {
      // Use default if user lookup fails
    }

    // Insert photo into family gallery (tribute_photos table)
    const caption = input.photo_description || '';

    const result = await query(
      `INSERT INTO tribute_photos (
        tribute_id,
        photo_url,
        caption,
        uploaded_by
      ) VALUES ($1, $2, $3, $4)
      RETURNING photo_id`,
      [
        input.tribute_id,
        input.photo_url,
        caption,
        uploaded_by
      ]
    );

    return NextResponse.json(
      successResponse({ photo_id: result.rows[0].photo_id }, 'Photo added to family gallery')
    );

  } catch (error: any) {
    if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof ForbiddenError) {
      const errorResponseData = formatErrorResponse(error);
      return NextResponse.json(errorResponseData, { status: getErrorStatusCode(error) });
    }
    
    logger.error('Upload family photo error', { error: error.message, stack: error.stack });
    const serverError = new InternalServerError('Failed to upload photo');
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
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

