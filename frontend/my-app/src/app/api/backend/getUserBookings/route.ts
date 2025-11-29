/**
 * Next.js API Route: /api/backend/getUserBookings
 * Replaces: backend/getUserBookings.php
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryAll, queryOne } from '@/lib/db';
import { successResponse } from '@/lib/api-response';
import { ValidationError, formatErrorResponse, getErrorStatusCode, InternalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const user_id = request.nextUrl.searchParams.get('user_id');

    if (!user_id) {
      throw new ValidationError('User ID is required');
    }

    // Fetch user's bookings with package and provider details
    const bookings = await queryAll(`
      SELECT 
        b.booking_id,
        b.booking_reference,
        b.user_id,
        b.customer_name,
        b.customer_email,
        b.customer_phone,
        b.service_date,
        b.service_address,
        b.special_requirements,
        b.total_amount,
        b.payment_method,
        b.uploaded_files,
        b.status,
        b.provider_notes,
        b.cancellation_reason,
        b.cancelled_by,
        b.cancelled_at,
        b.confirmed_at,
        b.refund_amount,
        b.created_at,
        b.updated_at,
        p.package_id,
        p.name as package_name,
        p.description as package_description,
        p.price as package_price,
        p.provider_id,
        sp.company_name as provider_name,
        sp.phone as provider_phone,
        sp.address as provider_address,
        pr.rating as submitted_rating,
        pr.review_text as submitted_review,
        pr.review_category as submitted_category
      FROM bookings b
      LEFT JOIN packages p ON b.package_id = p.package_id
      LEFT JOIN service_provider sp ON p.provider_id = sp.provider_id
      LEFT JOIN provider_reviews pr ON b.booking_id = pr.booking_id 
        AND pr.review_type = 'customer_to_provider'
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
    `, [user_id]);

    // Fetch add-ons for each booking
    const bookingsWithAddons = await Promise.all(
      bookings.map(async (booking: any) => {
        const addons = await queryAll(
          'SELECT addon_name, addon_price FROM booking_addons WHERE booking_id = $1',
          [booking.booking_id]
        );

        return {
          ...booking,
          addons: addons.map((addon: any) => ({
            name: addon.addon_name,
            price: parseFloat(addon.addon_price),
            category: 'Other Services'
          }))
        };
      })
    );

    return NextResponse.json(
      successResponse(
        { 
          bookings: bookingsWithAddons,
          count: bookingsWithAddons.length 
        },
        'Bookings retrieved successfully'
      )
    );

  } catch (error: any) {
    if (error instanceof ValidationError) {
      const errorResponseData = formatErrorResponse(error);
      return NextResponse.json(errorResponseData, { status: getErrorStatusCode(error) });
    }
    
    logger.error('Get user bookings error', { error: error.message, stack: error.stack });
    const serverError = new InternalServerError('Failed to retrieve bookings');
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

