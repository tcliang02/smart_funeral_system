/**
 * Next.js API Route: /api/backend/addMessage
 * Replaces: backend/addMessage.php
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
    if (!input.tribute_id || !input.message) {
      throw new ValidationError('Tribute ID and message are required');
    }

    // Check if tribute allows messages
    const tribute = await queryOne(
      'SELECT allow_messages FROM tributes WHERE tribute_id = $1',
      [input.tribute_id]
    );

    if (!tribute) {
      throw new NotFoundError('Tribute not found');
    }

    if (!tribute.allow_messages) {
      throw new ForbiddenError('This tribute does not allow messages');
    }

    // Auto-approve all messages
    const is_approved = true;

    // Insert message
    const sender_name = input.guest_name || input.sender_name || 'Anonymous';
    const sender_email = input.guest_email || input.sender_email || '';
    const photo_url = input.photo_url || null;

    const result = await query(
      `INSERT INTO tribute_messages (
        tribute_id,
        sender_name,
        sender_email,
        message,
        photo_url,
        is_approved
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING message_id`,
      [
        input.tribute_id,
        sender_name,
        sender_email,
        input.message,
        photo_url,
        is_approved
      ]
    );

    return NextResponse.json(
      successResponse({
        message_id: result.rows[0].message_id,
        is_approved: is_approved
      }, 'Message posted successfully')
    );

  } catch (error: any) {
    if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof ForbiddenError) {
      const errorResponseData = formatErrorResponse(error);
      return NextResponse.json(errorResponseData, { status: getErrorStatusCode(error) });
    }
    
    logger.error('Add message error', { error: error.message, stack: error.stack });
    const serverError = new InternalServerError('Failed to post message');
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

