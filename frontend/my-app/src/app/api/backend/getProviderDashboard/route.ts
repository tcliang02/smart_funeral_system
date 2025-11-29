/**
 * Next.js API Route: /api/backend/getProviderDashboard
 * Replaces: backend/getProviderDashboard.php
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryOne, queryAll } from '@/lib/db';
import { successResponse } from '@/lib/api-response';
import { ValidationError, NotFoundError, formatErrorResponse, getErrorStatusCode, InternalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      throw new ValidationError('Missing user_id parameter');
    }

    // Get provider dashboard data
    const provider = await queryOne(`
      SELECT 
        sp.provider_id,
        sp.company_name,
        sp.address,
        sp.phone,
        sp.description,
        sp.website,
        sp.logo_url,
        sp.average_price,
        sp.total_packages,
        sp.created_at,
        u.email,
        u.username,
        COALESCE(AVG(pr.rating), 0) as avg_rating,
        COUNT(DISTINCT pr.review_id) as review_count
      FROM service_provider sp
      LEFT JOIN users u ON sp.user_id = u.user_id
      LEFT JOIN packages p ON sp.provider_id = p.provider_id
      LEFT JOIN bookings b ON p.package_id = b.package_id
      LEFT JOIN provider_reviews pr ON b.booking_id = pr.booking_id AND pr.review_type = 'customer_to_provider'
      WHERE sp.user_id = $1
      GROUP BY sp.provider_id, sp.company_name, sp.address, sp.phone, sp.description, 
               sp.website, sp.logo_url, sp.average_price, sp.total_packages, 
               sp.created_at, u.email, u.username
    `, [userId]);

    if (!provider) {
      throw new NotFoundError('Provider profile not found');
    }

    const providerId = provider.provider_id;
    const avgRating = Math.round(parseFloat(provider.avg_rating || 0) * 10) / 10;

    // Get recent bookings
    const recentBookings = await queryAll(`
      SELECT 
        b.booking_id,
        b.customer_name,
        b.customer_email,
        b.customer_phone,
        b.service_date,
        b.total_amount,
        b.status,
        b.created_at,
        p.name as package_name
      FROM bookings b
      LEFT JOIN packages p ON b.package_id = p.package_id
      WHERE p.provider_id = $1
      ORDER BY b.created_at DESC
      LIMIT 10
    `, [providerId]);

    // Get monthly statistics (last 12 months)
    const monthlyStats = await queryAll(`
      SELECT 
        EXTRACT(MONTH FROM b.created_at)::integer as month,
        EXTRACT(YEAR FROM b.created_at)::integer as year,
        COUNT(*)::integer as booking_count,
        COALESCE(SUM(b.total_amount), 0)::numeric as total_revenue
      FROM bookings b
      LEFT JOIN packages p ON b.package_id = p.package_id
      WHERE p.provider_id = $1 
        AND b.created_at >= NOW() - INTERVAL '12 months'
      GROUP BY EXTRACT(YEAR FROM b.created_at), EXTRACT(MONTH FROM b.created_at)
      ORDER BY year DESC, month DESC
    `, [providerId]);

    // Get recent reviews with customer information
    const recentReviews = await queryAll(`
      SELECT 
        pr.review_id,
        pr.rating,
        pr.review_text,
        pr.review_category,
        pr.created_at,
        u.username as reviewer_name,
        u.email as reviewer_email,
        b.booking_id,
        b.customer_name,
        pkg.name as package_name
      FROM provider_reviews pr
      JOIN bookings b ON pr.booking_id = b.booking_id
      JOIN packages pkg ON b.package_id = pkg.package_id
      JOIN users u ON pr.reviewer_user_id = u.user_id
      WHERE pkg.provider_id = $1 
        AND pr.review_type = 'customer_to_provider'
      ORDER BY pr.created_at DESC
      LIMIT 10
    `, [providerId]);

    // Get overall statistics
    const stats = await queryOne(`
      SELECT 
        COUNT(DISTINCT b.booking_id)::integer as total_bookings,
        COUNT(DISTINCT p.package_id)::integer as total_packages,
        COALESCE(SUM(b.total_amount), 0)::numeric as total_revenue,
        COUNT(DISTINCT CASE WHEN b.status = 'pending' THEN b.booking_id END)::integer as pending_bookings,
        COUNT(DISTINCT CASE WHEN b.status = 'confirmed' THEN b.booking_id END)::integer as confirmed_bookings,
        COUNT(DISTINCT CASE WHEN b.status = 'completed' THEN b.booking_id END)::integer as completed_bookings
      FROM service_provider sp
      LEFT JOIN packages p ON sp.provider_id = p.provider_id
      LEFT JOIN bookings b ON p.package_id = b.package_id
      WHERE sp.provider_id = $1
    `, [providerId]);

    // Get packages with booking counts
    const packagesData = await queryAll(`
      SELECT 
        p.*,
        COUNT(b.booking_id)::integer as booking_count
      FROM packages p
      LEFT JOIN bookings b ON p.package_id = b.package_id
      WHERE p.provider_id = $1
      GROUP BY p.package_id
      ORDER BY p.is_featured DESC, p.created_at DESC
    `, [providerId]);

    // Get features for each package
    const packages = await Promise.all(
      packagesData.map(async (pkg: any) => {
        const features = await queryAll(
          'SELECT feature_id, package_id, feature_name FROM package_features WHERE package_id = $1',
          [pkg.package_id]
        );
        return {
          ...pkg,
          features: features.map((f: any) => ({
            feature_id: f.feature_id,
            package_id: f.package_id,
            feature_name: f.feature_name
          }))
        };
      })
    );

    // Calculate revenue growth percentage
    let revenueGrowth = 0;
    if (monthlyStats.length >= 2) {
      const currentMonthRevenue = parseFloat(monthlyStats[0]?.total_revenue || '0');
      const previousMonthRevenue = parseFloat(monthlyStats[1]?.total_revenue || '0');
      
      if (previousMonthRevenue > 0) {
        revenueGrowth = ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
      } else if (currentMonthRevenue > 0) {
        revenueGrowth = 100; // First month with revenue
      }
    }

    return NextResponse.json(
      successResponse({
        provider_id: providerId,
        company_name: provider.company_name || '',
        stats: {
          totalBookings: parseInt(stats?.total_bookings || '0'),
          pendingBookings: parseInt(stats?.pending_bookings || '0'),
          completedBookings: parseInt(stats?.completed_bookings || '0'),
          totalRevenue: parseFloat(stats?.total_revenue || '0'),
          averageRating: avgRating,
          totalReviews: parseInt(provider.review_count || '0'),
          revenueGrowth: Math.round(revenueGrowth * 10) / 10
        },
        recentBookings: recentBookings,
        recentReviews: recentReviews,
        monthlyRevenue: monthlyStats,
        packages: packages
      }, 'Dashboard data retrieved successfully')
    );

  } catch (error: any) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      const errorResponseData = formatErrorResponse(error);
      return NextResponse.json(errorResponseData, { status: getErrorStatusCode(error) });
    }
    
    logger.error('Get provider dashboard error', { error: error.message, stack: error.stack });
    const serverError = new InternalServerError('Failed to retrieve dashboard data');
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

