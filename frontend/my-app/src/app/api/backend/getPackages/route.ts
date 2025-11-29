/**
 * Next.js API Route: /api/backend/getPackages
 * Replaces: backend/getPackages.php
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';
import { successResponse } from '@/lib/api-response';
import { ValidationError, formatErrorResponse, getErrorStatusCode, InternalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider_id } = body;

    if (!provider_id) {
      throw new ValidationError('Missing provider_id');
    }

    // Get packages with ratings
    const packages = await queryAll(`
      SELECT 
        p.*,
        COALESCE(AVG(pr.rating), 0) as average_rating,
        COUNT(pr.rating) as total_ratings
      FROM packages p
      LEFT JOIN bookings b ON p.package_id = b.package_id
      LEFT JOIN provider_reviews pr ON b.booking_id = pr.booking_id 
        AND pr.review_type = 'customer_to_provider'
      WHERE p.provider_id = $1
      GROUP BY p.package_id
      ORDER BY p.created_at DESC
    `, [provider_id]);

    // Format packages
    const formattedPackages = packages.map((pkg: any) => ({
      ...pkg,
      average_rating: pkg.average_rating ? parseFloat(pkg.average_rating).toFixed(1) : '0.0',
      total_ratings: parseInt(pkg.total_ratings) || 0
    }));

    return NextResponse.json(
      successResponse({ packages: formattedPackages }, 'Packages retrieved successfully')
    );

  } catch (error: any) {
    if (error instanceof ValidationError) {
      const errorResponseData = formatErrorResponse(error);
      return NextResponse.json(errorResponseData, { status: getErrorStatusCode(error) });
    }
    
    logger.error('Get packages error', { error: error.message, stack: error.stack });
    const serverError = new InternalServerError('Failed to retrieve packages');
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

