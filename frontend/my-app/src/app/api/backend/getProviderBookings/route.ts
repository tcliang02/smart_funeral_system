/**
 * Next.js API Route: /api/backend/getProviderBookings
 * Replaces: backend/getProviderBookings.php
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryAll, queryOne } from '@/lib/db';
import { successResponse } from '@/lib/api-response';
import { ValidationError, NotFoundError, formatErrorResponse, getErrorStatusCode, InternalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const provider_id = request.nextUrl.searchParams.get('provider_id');
    const user_id = request.nextUrl.searchParams.get('user_id');

    // If user_id is provided, look up provider_id from service_provider table
    let resolved_provider_id = provider_id;
    
    if (user_id && !provider_id) {
      const provider = await queryOne(
        'SELECT provider_id FROM service_provider WHERE user_id = $1',
        [user_id]
      );
      
      if (!provider) {
        throw new NotFoundError('Provider profile not found for this user');
      }
      
      resolved_provider_id = provider.provider_id.toString();
    }

    if (!resolved_provider_id) {
      throw new ValidationError('Provider ID or User ID is required');
    }

    // Get all bookings for this provider's packages
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
        sp.company_name as provider_name,
        sp.phone as provider_phone
      FROM bookings b
      INNER JOIN packages p ON b.package_id = p.package_id
      INNER JOIN service_provider sp ON p.provider_id = sp.provider_id
      WHERE sp.provider_id = $1
      ORDER BY b.created_at DESC
    `, [resolved_provider_id]);

    // Fetch add-ons for each booking
    const bookingsWithAddons = await Promise.all(
      bookings.map(async (booking: any) => {
        const addons = await queryAll(
          'SELECT addon_name as name, addon_price as price FROM booking_addons WHERE booking_id = $1',
          [booking.booking_id]
        );

        return {
          ...booking,
          addons: addons.map((addon: any) => ({
            ...addon,
            category: 'Other Services'
          }))
        };
      })
    );

    return NextResponse.json(
      successResponse(
        { 
          bookings: bookingsWithAddons,
          total_bookings: bookingsWithAddons.length 
        },
        'Bookings retrieved successfully'
      )
    );

  } catch (error: any) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      const errorResponseData = formatErrorResponse(error);
      return NextResponse.json(errorResponseData, { status: getErrorStatusCode(error) });
    }
    
    logger.error('Get provider bookings error', { error: error.message, stack: error.stack });
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

