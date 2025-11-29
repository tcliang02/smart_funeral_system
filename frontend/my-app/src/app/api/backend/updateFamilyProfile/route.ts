/**
 * Next.js API Route: /api/backend/updateFamilyProfile
 * Replaces: backend/updateFamilyProfile.php
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';
import { successResponse } from '@/lib/api-response';
import { ValidationError, NotFoundError, ForbiddenError, ConflictError, formatErrorResponse, getErrorStatusCode, InternalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.user_id) {
      throw new ValidationError('User ID is required');
    }

    const user_id = parseInt(data.user_id);

    // Verify user exists and is family/attendee
    const user = await queryOne(
      'SELECT user_id, role FROM users WHERE user_id = $1',
      [user_id]
    );

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!['family', 'attendee'].includes(user.role)) {
      throw new ForbiddenError('Only family and attendee accounts can use this endpoint');
    }

    // Check if email is being changed and if it's already taken
    if (data.email) {
      const emailCheck = await queryOne(
        'SELECT user_id FROM users WHERE email = $1 AND user_id != $2',
        [data.email, user_id]
      );

      if (emailCheck) {
        throw new ConflictError('Email address is already in use');
      }
    }

    // Build dynamic update query
    const updateFields: string[] = [];
    const values: any[] = [];

    const fields = ['name', 'email', 'phone', 'address', 'profile_picture'];

    fields.forEach(field => {
      if (data[field] !== undefined && data[field] !== null) {
        updateFields.push(`${field} = $${values.length + 1}`);
        values.push(data[field]);
      }
    });

    if (updateFields.length === 0) {
      throw new ValidationError('No fields to update');
    }

    // Add user_id to parameters
    values.push(user_id);

    // Execute update
    const updateQuery = `
      UPDATE users 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE user_id = $${values.length}
    `;

    await query(updateQuery, values);

    // Log the activity
    try {
      await query(
        `INSERT INTO profile_activity_log (user_id, action_type, action_details) 
         VALUES ($1, 'profile_update', $2)`,
        [
          user_id,
          JSON.stringify({
            updated_fields: Object.keys(data).filter(k => k !== 'user_id'),
            timestamp: new Date().toISOString()
          })
        ]
      );
    } catch (logError) {
      // Log error but don't fail the update
      logger.warn('Failed to log activity', { error: logError instanceof Error ? logError.message : String(logError) });
    }

    return NextResponse.json(
      successResponse({}, 'Profile updated successfully')
    );

  } catch (error: any) {
    if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof ForbiddenError || error instanceof ConflictError) {
      const errorResponseData = formatErrorResponse(error);
      return NextResponse.json(errorResponseData, { status: getErrorStatusCode(error) });
    }
    
    logger.error('Update family profile error', { error: error.message, stack: error.stack });
    const serverError = new InternalServerError('Failed to update profile');
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

