/**
 * Next.js API Route: /api/backend/getFamilyProfile
 * Replaces: backend/getFamilyProfile.php
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { successResponse } from '@/lib/api-response';
import { ValidationError, NotFoundError, formatErrorResponse, getErrorStatusCode, InternalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const user_id = request.nextUrl.searchParams.get('user_id');

    if (!user_id) {
      throw new ValidationError('User ID is required');
    }

    // Get user profile
    const profile = await queryOne(`
      SELECT 
        user_id,
        name,
        email,
        phone,
        address,
        profile_picture,
        role,
        is_active,
        created_at,
        updated_at
      FROM users 
      WHERE user_id = $1 AND role IN ('family', 'attendee')
    `, [parseInt(user_id)]);

    if (!profile) {
      throw new NotFoundError('Family profile not found');
    }

    // Count tributes created by this user
    const tributeResult = await queryOne(
      'SELECT COUNT(*) as tribute_count FROM tributes WHERE created_by = $1',
      [parseInt(user_id)]
    );
    profile.tribute_count = tributeResult?.tribute_count || 0;

    // Count bookings made by this user
    const bookingResult = await queryOne(
      'SELECT COUNT(*) as booking_count FROM bookings WHERE user_id = $1',
      [parseInt(user_id)]
    );
    profile.booking_count = bookingResult?.booking_count || 0;

    // Format profile picture URL
    if (profile.profile_picture) {
      profile.profile_picture_url = process.env.NEXT_PUBLIC_BASE_URL 
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/${profile.profile_picture}`
        : profile.profile_picture;
    } else {
      profile.profile_picture_url = null;
    }

    return NextResponse.json(
      successResponse({ profile }, 'Profile retrieved successfully')
    );

  } catch (error: any) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      const errorResponseData = formatErrorResponse(error);
      return NextResponse.json(errorResponseData, { status: getErrorStatusCode(error) });
    }
    
    logger.error('Get family profile error', { error: error.message, stack: error.stack });
    const serverError = new InternalServerError('Failed to retrieve profile');
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

