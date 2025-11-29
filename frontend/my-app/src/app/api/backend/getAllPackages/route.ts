/**
 * Next.js API Route: /api/backend/getAllPackages
 * Replaces: backend/getAllPackages.php
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';
import { successResponse } from '@/lib/api-response';
import { formatErrorResponse, getErrorStatusCode, InternalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const packagesData = await queryAll(`
      SELECT 
        p.*, 
        sp.company_name, 
        sp.address, 
        sp.phone,
        COALESCE(pr.avg_rating, 0) AS average_rating,
        COALESCE(pr.total_reviews, 0) AS total_reviews,
        COALESCE(bk.total_bookings, 0) AS total_bookings
      FROM packages p
      LEFT JOIN service_provider sp ON p.provider_id = sp.provider_id
      LEFT JOIN (
        SELECT 
          b.package_id,
          AVG(pr.rating) AS avg_rating,
          COUNT(DISTINCT pr.review_id) AS total_reviews
        FROM provider_reviews pr
        INNER JOIN bookings b ON b.booking_id = pr.booking_id
        WHERE pr.review_type = 'customer_to_provider'
        GROUP BY b.package_id
      ) pr ON pr.package_id = p.package_id
      LEFT JOIN (
        SELECT 
          package_id,
          COUNT(*) FILTER (WHERE status <> 'cancelled') AS total_bookings
        FROM bookings
        GROUP BY package_id
      ) bk ON bk.package_id = p.package_id
      ORDER BY p.created_at DESC
    `);

    const packages = await Promise.all(
      packagesData.map(async (pkg: any) => {
        const features = await queryAll(
          'SELECT feature_name FROM package_features WHERE package_id = $1',
          [pkg.package_id]
        );

        return {
          ...pkg,
          average_rating: pkg.average_rating ? Number(pkg.average_rating) : 0,
          total_reviews: Number(pkg.total_reviews) || 0,
          total_bookings: Number(pkg.total_bookings) || 0,
          features: features.map((f: any) => f.feature_name)
        };
      })
    );

    return NextResponse.json(
      successResponse({ packages }, 'Packages retrieved successfully')
    );

  } catch (error: any) {
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

