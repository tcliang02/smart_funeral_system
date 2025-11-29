/**
 * Next.js API Route: /api/backend/offerFlower
 * Replaces: backend/offerFlower.php
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';
import { successResponse } from '@/lib/api-response';
import { ValidationError, formatErrorResponse, getErrorStatusCode, InternalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const input = await request.json();

    if (!input.tribute_id) {
      throw new ValidationError('Missing tribute_id');
    }

    // Increment flower count
    await query(
      'UPDATE tributes SET flower_count = COALESCE(flower_count, 0) + 1 WHERE tribute_id = $1',
      [input.tribute_id]
    );

    // Get updated count
    const tribute = await queryOne(
      'SELECT flower_count FROM tributes WHERE tribute_id = $1',
      [input.tribute_id]
    );

    return NextResponse.json(
      successResponse({ flower_count: tribute?.flower_count || 0 }, 'Flower offered successfully')
    );

  } catch (error: any) {
    if (error instanceof ValidationError) {
      const errorResponseData = formatErrorResponse(error);
      return NextResponse.json(errorResponseData, { status: getErrorStatusCode(error) });
    }
    
    logger.error('Offer flower error', { error: error.message, stack: error.stack });
    const serverError = new InternalServerError('Failed to offer flower');
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

