/**
 * Next.js API Route: /api/backend/getProviderProfile
 * Replaces: backend/getProviderProfile.php
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryOne, queryAll } from '@/lib/db';
import { successResponse } from '@/lib/api-response';
import { ValidationError, NotFoundError, formatErrorResponse, getErrorStatusCode, InternalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const provider_id = request.nextUrl.searchParams.get('provider_id');
    const user_id = request.nextUrl.searchParams.get('user_id');

    let resolved_provider_id: number | null = null;

    // If provider_id is provided, use it
    if (provider_id) {
      resolved_provider_id = parseInt(provider_id);
    } 
    // If user_id is provided, look up provider_id
    else if (user_id) {
      const provider = await queryOne(
        'SELECT provider_id FROM service_provider WHERE user_id = $1',
        [parseInt(user_id)]
      );
      if (provider) {
        resolved_provider_id = provider.provider_id;
      }
    }

    if (!resolved_provider_id) {
      throw new ValidationError('Provider ID is required');
    }

    // Get comprehensive provider profile with calculated average rating
    const profile = await queryOne(`
      SELECT 
        sp.provider_id,
        sp.user_id,
        sp.company_name,
        sp.business_type,
        sp.business_registration,
        sp.description,
        sp.address,
        sp.city,
        sp.state,
        sp.postal_code,
        sp.phone,
        sp.email,
        sp.website,
        sp.logo,
        sp.operating_hours,
        sp.services_offered,
        sp.facebook_url,
        sp.instagram_url,
        COALESCE(AVG(pr.rating), 0) as rating,
        COUNT(pr.review_id) as total_reviews,
        sp.is_verified,
        sp.is_active,
        sp.created_at,
        sp.updated_at,
        u.name as user_name,
        u.email as user_email
      FROM service_provider sp
      LEFT JOIN users u ON sp.user_id = u.user_id
      LEFT JOIN provider_reviews pr ON sp.provider_id = pr.provider_id
      WHERE sp.provider_id = $1
      GROUP BY sp.provider_id, sp.user_id, sp.company_name, sp.business_type, 
               sp.business_registration, sp.description, sp.address, sp.city, 
               sp.state, sp.postal_code, sp.phone, sp.email, sp.website, sp.logo,
               sp.operating_hours, sp.services_offered, sp.facebook_url, 
               sp.instagram_url, sp.is_verified, sp.is_active, sp.created_at, 
               sp.updated_at, u.name, u.email
    `, [resolved_provider_id]);

    if (!profile) {
      throw new NotFoundError('Provider not found');
    }

    // Count total packages
    const packageResult = await queryOne(
      'SELECT COUNT(*) as package_count FROM packages WHERE provider_id = $1 AND is_active = TRUE',
      [resolved_provider_id]
    );
    profile.package_count = packageResult?.package_count || 0;

    // Count total bookings (need to join through packages)
    const bookingResult = await queryOne(`
      SELECT COUNT(*) as booking_count 
      FROM bookings b
      INNER JOIN packages p ON b.package_id = p.package_id
      WHERE p.provider_id = $1
    `, [resolved_provider_id]);
    profile.booking_count = bookingResult?.booking_count || 0;

    // Format logo URL
    if (profile.logo) {
      profile.logo_url = process.env.NEXT_PUBLIC_BASE_URL 
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/${profile.logo}`
        : profile.logo;
    } else {
      profile.logo_url = null;
    }

    // Parse services_offered if JSON
    if (profile.services_offered) {
      try {
        const decoded = JSON.parse(profile.services_offered);
        if (Array.isArray(decoded)) {
          profile.services_offered = decoded;
        }
      } catch (e) {
        // Keep as string if not valid JSON
      }
    }

    return NextResponse.json(
      successResponse({ profile }, 'Profile retrieved successfully')
    );

  } catch (error: any) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      const errorResponseData = formatErrorResponse(error);
      return NextResponse.json(errorResponseData, { status: getErrorStatusCode(error) });
    }
    
    logger.error('Get provider profile error', { error: error.message, stack: error.stack });
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

