/**
 * Next.js API Route: /api/backend/getAllProviders
 * Replaces: backend/getAllProviders.php
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';
import { formatErrorResponse, getErrorStatusCode, InternalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const providers = await queryAll(`
      SELECT 
        sp.*,
        u.name as username,
        u.email,
        COALESCE(AVG(pr.rating), 0) as average_rating,
        COUNT(DISTINCT pr.rating) as total_ratings
      FROM service_provider sp
      LEFT JOIN users u ON sp.user_id = u.user_id
      LEFT JOIN packages p ON sp.provider_id = p.provider_id
      LEFT JOIN bookings b ON p.package_id = b.package_id
      LEFT JOIN provider_reviews pr ON b.booking_id = pr.booking_id 
        AND pr.review_type = 'customer_to_provider'
      WHERE sp.is_active = true
      GROUP BY sp.provider_id, u.name, u.email
      ORDER BY sp.created_at DESC
    `);

    // Format providers
    const formattedProviders = providers.map((provider: any) => ({
      ...provider,
      average_rating: provider.average_rating ? parseFloat(provider.average_rating).toFixed(1) : '0.0',
      total_ratings: parseInt(provider.total_ratings) || 0
    }));

    return NextResponse.json(
      successResponse({ providers: formattedProviders }, 'Providers retrieved successfully')
    );

  } catch (error: any) {
    logger.error('Get providers error', { error: error.message, stack: error.stack });
    const serverError = new InternalServerError('Failed to retrieve providers');
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

