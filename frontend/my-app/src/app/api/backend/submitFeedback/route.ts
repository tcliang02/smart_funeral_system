/**
 * Next.js API Route: /api/backend/submitFeedback
 * Handles: POST (submit feedback form - bug, feature, or general)
 * Saves to: feedback table
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { successResponse } from '@/lib/api-response';
import { ValidationError, formatErrorResponse, getErrorStatusCode, InternalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { verifyAuth } from '@/lib/helpers';

export async function POST(request: NextRequest) {
  try {
    const input = await request.json();

    // Validate required fields
    if (!input.name || !input.email || !input.message || !input.type) {
      throw new ValidationError('Name, email, message, and type are required');
    }

    // Validate feedback_type (must be 'bug', 'feature', or 'general')
    const validTypes = ['bug', 'feature', 'general'];
    if (!validTypes.includes(input.type)) {
      throw new ValidationError('Invalid feedback type. Must be: bug, feature, or general');
    }

    // Validate field lengths (matching database constraints)
    if (input.name.length > 100) {
      throw new ValidationError('Name must be 100 characters or less');
    }

    if (input.email.length > 100) {
      throw new ValidationError('Email must be 100 characters or less');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email)) {
      throw new ValidationError('Invalid email format');
    }

    // Get user_id from token if available, or use provided user_id (optional)
    let userId = input.user_id || null;
    try {
      const auth = verifyAuth(request.headers);
      if (auth && (auth.user_id || auth.id)) {
        userId = auth.user_id || auth.id;
      }
    } catch (e) {
      // Ignore auth errors - feedback form is public and can be used by non-logged-in users
    }

    // Insert feedback
    // feedback_type comes from the form (bug, feature, or general)
    // status = 'pending' (default)
    // user_id can be null for non-logged-in users
    const result = await query(
      `INSERT INTO feedback (user_id, feedback_type, name, email, message, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING feedback_id, created_at`,
      [userId, input.type, input.name, input.email, input.message]
    );

    const feedbackId = result.rows[0]?.feedback_id;
    const createdAt = result.rows[0]?.created_at;

    if (!feedbackId) {
      throw new InternalServerError('Failed to save feedback');
    }

    logger.info('Feedback received', {
      feedbackId,
      feedbackType: input.type,
      email: input.email,
      name: input.name,
      userId: userId || 'anonymous'
    });

    return NextResponse.json(
      successResponse({
        feedback_id: feedbackId,
        created_at: createdAt
      }, 'Feedback submitted successfully. Thank you for your input!')
    );

  } catch (error: any) {
    if (error instanceof ValidationError) {
      const errorResponseData = formatErrorResponse(error);
      return NextResponse.json(errorResponseData, { status: getErrorStatusCode(error) });
    }
    
    logger.error('Submit feedback error', { error: error.message, stack: error.stack });
    const serverError = new InternalServerError('Failed to submit feedback');
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
