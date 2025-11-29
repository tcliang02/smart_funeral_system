import { NextRequest, NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';
import { successResponse } from '@/lib/api-response';
import { ValidationError, formatErrorResponse, getErrorStatusCode, InternalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const tributeIdParam =
      request.nextUrl.searchParams.get('tribute_id') ??
      request.nextUrl.searchParams.get('id');

    const tributeId = tributeIdParam ? parseInt(tributeIdParam, 10) : NaN;

    if (!tributeId || Number.isNaN(tributeId) || tributeId <= 0) {
      throw new ValidationError('Invalid tribute ID');
    }

    try {
      const rows = await queryAll(
        `
          SELECT id, tribute_id, memory_text, memory_type, created_at
          FROM memories_database
          WHERE tribute_id = $1
          ORDER BY created_at DESC
        `,
        [tributeId]
      );

      const memories = rows.map((row: any) => ({
        id: row.id,
        tribute_id: row.tribute_id,
        title: row.memory_type,
        content: row.memory_text,
        type: row.memory_type,
        importance: 'medium',
        created_at: row.created_at
      }));

      return NextResponse.json(
        successResponse({ memories }, 'Memories retrieved successfully')
      );
    } catch (error: any) {
      const message = String(error?.message || error);
      if (message.includes('memories_database')) {
        return NextResponse.json(
          successResponse({ memories: [] }, 'Memories retrieved successfully (table not found, returning empty)')
        );
      }

      throw error;
    }
  } catch (error: any) {
    if (error instanceof ValidationError) {
      const errorResponseData = formatErrorResponse(error);
      return NextResponse.json(errorResponseData, { status: getErrorStatusCode(error) });
    }
    
    logger.error('Get memories error', { error: error.message, stack: error.stack });
    const serverError = new InternalServerError('Failed to fetch memories');
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



