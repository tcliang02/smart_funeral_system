/**
 * Next.js API Route: /api/backend/changePassword
 * Allows users to change their password by verifying existing credentials
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';
import * as bcrypt from 'bcryptjs';
import { successResponse } from '@/lib/api-response';
import { ValidationError, NotFoundError, UnauthorizedError, ConflictError, formatErrorResponse, getErrorStatusCode, InternalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      username,
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: confirmPassword,
    } = data;

    if (!username || !currentPassword || !newPassword || !confirmPassword) {
      throw new ValidationError('All fields are required.');
    }

    if (newPassword !== confirmPassword) {
      throw new ValidationError('New passwords do not match.');
    }

    if (newPassword.length < 6) {
      throw new ValidationError('New password must be at least 6 characters.');
    }

    const user = await queryOne(
      'SELECT user_id, password FROM users WHERE name = $1',
      [username]
    );

    if (!user) {
      throw new NotFoundError('User not found.');
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect.');
    }

    if (await bcrypt.compare(newPassword, user.password)) {
      throw new ConflictError('New password must be different from the current password.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE user_id = $2',
      [hashedPassword, user.user_id]
    );

    return NextResponse.json(
      successResponse({}, 'Password updated successfully. You can now sign in with your new password.')
    );
  } catch (error: any) {
    if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof UnauthorizedError || error instanceof ConflictError) {
      const errorResponseData = formatErrorResponse(error);
      return NextResponse.json(errorResponseData, { status: getErrorStatusCode(error) });
    }
    
    logger.error('Change password error', { error: error.message, stack: error.stack });
    const serverError = new InternalServerError('Failed to change password');
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

