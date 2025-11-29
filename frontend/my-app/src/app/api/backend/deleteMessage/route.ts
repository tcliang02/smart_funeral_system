/**
 * Next.js API Route: /api/backend/deleteMessage
 * Replaces: backend/deleteMessage.php
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
    if (!input.message_id || !input.user_id || !input.tribute_id) {
      throw new ValidationError('Message ID, User ID, and Tribute ID are required');
    }

    // Verify user is the tribute creator (family member)
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
      throw new ForbiddenError('Only the tribute creator can delete messages');
    }

    // Delete the message
    const result = await query(
      'DELETE FROM tribute_messages WHERE message_id = $1 AND tribute_id = $2',
      [input.message_id, input.tribute_id]
    );

    if (result.rowCount && result.rowCount > 0) {
      return NextResponse.json(
        successResponse({}, 'Message deleted successfully')
      );
    } else {
      throw new NotFoundError('Message not found or already deleted');
    }

  } catch (error: any) {
    if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof ForbiddenError) {
      const errorResponseData = formatErrorResponse(error);
      return NextResponse.json(errorResponseData, { status: getErrorStatusCode(error) });
    }
    
    logger.error('Delete message error', { error: error.message, stack: error.stack });
    const serverError = new InternalServerError('Failed to delete message');
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

