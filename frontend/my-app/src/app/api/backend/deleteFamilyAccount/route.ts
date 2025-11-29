/**
 * Next.js API Route: /api/backend/deleteFamilyAccount
 * Replaces: backend/deleteFamilyAccount.php
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';
import * as bcrypt from 'bcryptjs';
import { successResponse } from '@/lib/api-response';
import { ValidationError, NotFoundError, ForbiddenError, UnauthorizedError, formatErrorResponse, getErrorStatusCode, InternalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.user_id) {
      throw new ValidationError('User ID is required');
    }

    const user_id = parseInt(data.user_id);
    const permanent_delete = data.permanent === true;
    const password_confirmation = data.password || null;

    // Verify user exists and get password hash
    const user = await queryOne(
      'SELECT user_id, role, password, is_active FROM users WHERE user_id = $1',
      [user_id]
    );

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!['family', 'attendee'].includes(user.role)) {
      throw new ForbiddenError('Only family and attendee accounts can be deleted through this endpoint');
    }

    // Verify password if provided
    if (password_confirmation && user.password) {
      const isValidPassword = await bcrypt.compare(password_confirmation, user.password);
      if (!isValidPassword) {
        throw new UnauthorizedError('Invalid password confirmation');
      }
    }

    if (permanent_delete) {
      // PERMANENT DELETE
      await query('DELETE FROM users WHERE user_id = $1', [user_id]);

      return NextResponse.json(
        successResponse({ type: 'permanent' }, 'Account permanently deleted')
      );
    } else {
      // SOFT DELETE (recommended)
      await query('UPDATE users SET is_active = FALSE WHERE user_id = $1', [user_id]);

      // Log the deactivation
      try {
        await query(
          `INSERT INTO profile_activity_log (user_id, action_type, action_details) 
           VALUES ($1, 'account_deactivation', $2)`,
          [
            user_id,
            JSON.stringify({
              deactivated_at: new Date().toISOString(),
              reason: data.reason || 'User requested deletion'
            })
          ]
        );
      } catch (logError) {
        logger.warn('Failed to log activity', { error: logError instanceof Error ? logError.message : String(logError) });
      }

      return NextResponse.json(
        successResponse({ type: 'soft_delete', note: 'Account can be reactivated by contacting support' }, 'Account deactivated successfully')
      );
    }

  } catch (error: any) {
    if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof ForbiddenError || error instanceof UnauthorizedError) {
      const errorResponseData = formatErrorResponse(error);
      return NextResponse.json(errorResponseData, { status: getErrorStatusCode(error) });
    }
    
    logger.error('Delete family account error', { error: error.message, stack: error.stack });
    const serverError = new InternalServerError('Failed to delete account');
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
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

