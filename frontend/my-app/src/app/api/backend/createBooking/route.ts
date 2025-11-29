/**
 * Next.js API Route: /api/backend/createBooking
 * Replaces: backend/createBooking.php
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { successResponse } from '@/lib/api-response';
import { ValidationError, NotFoundError, ConflictError, formatErrorResponse, getErrorStatusCode, InternalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    const required_fields = ['package_id', 'customer_name', 'customer_email', 'customer_phone', 'service_date'];
    for (const field of required_fields) {
      if (!data[field]) {
        throw new ValidationError(`Missing required field: ${field}`);
      }
    }

    const {
      package_id,
      customer_name,
      customer_email,
      customer_phone,
      service_date,
      service_time = null,
      service_address = '',
      special_requirements = '',
      selected_addons = [],
      service_dates = [], // Multi-day booking support: array of {date, start_time, end_time, event_type, location}
      uploaded_files = null,
      total_amount,
      user_id = null,
      payment_method = null
    } = data;

    // Validate service_date is not empty
    if (!service_date || (typeof service_date === 'string' && service_date.trim() === '')) {
      logger.error('Invalid service_date received', { service_date, type: typeof service_date });
      throw new ValidationError('Service date is required and cannot be empty');
    }

    // Verify package exists and get provider_id
    const packageData = await queryOne(
      'SELECT provider_id, name, price FROM packages WHERE package_id = $1',
      [package_id]
    );

    if (!packageData) {
      throw new NotFoundError('Package not found');
    }

    const provider_id = packageData.provider_id;

    // Note: Multi-day booking support is enabled via service_dates array
    // This is a core feature, not an ERP feature

    // Prepare uploaded files JSON
    const uploaded_files_json = uploaded_files && Array.isArray(uploaded_files)
      ? JSON.stringify(uploaded_files)
      : null;

    // Get current date for booking_date (date when booking was created)
    const booking_date = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

    // Ensure service_date is in correct format (YYYY-MM-DD)
    let formatted_service_date = service_date;
    if (service_date instanceof Date) {
      formatted_service_date = service_date.toISOString().split('T')[0];
    } else if (typeof service_date === 'string') {
      // If it's already in YYYY-MM-DD format, use it; otherwise try to parse
      if (!/^\d{4}-\d{2}-\d{2}$/.test(service_date)) {
        const parsedDate = new Date(service_date);
        if (!isNaN(parsedDate.getTime())) {
          formatted_service_date = parsedDate.toISOString().split('T')[0];
        }
      }
    }

    // Create booking
    const bookingResult = await query(
      `INSERT INTO bookings 
       (package_id, provider_id, user_id, customer_name, customer_email, customer_phone, 
        booking_date, service_date, service_time, service_address, special_requirements, total_amount, payment_method, uploaded_files, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'pending')
       RETURNING booking_id`,
      [
        package_id,
        provider_id,
        user_id,
        customer_name,
        customer_email,
        customer_phone,
        booking_date, // Date when booking was created
        formatted_service_date, // Date when service will happen
        service_time, // Optional time for service
        service_address,
        special_requirements,
        total_amount,
        payment_method,
        uploaded_files_json
      ]
    );

    const booking_id = bookingResult.rows[0].booking_id;

    // ============================================
    // INSERT MULTI-DAY BOOKING DATES
    // ============================================
    if (service_dates && Array.isArray(service_dates) && service_dates.length > 0) {
      for (const dateEntry of service_dates) {
        await query(
          `INSERT INTO booking_dates (booking_id, date, start_time, end_time, event_type, location)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            booking_id,
            dateEntry.date,
            dateEntry.start_time || null,
            dateEntry.end_time || null,
            dateEntry.event_type || null,
            dateEntry.location || service_address || null
          ]
        );
      }
    } else {
      // Fallback: create single booking_date from service_date
      await query(
        `INSERT INTO booking_dates (booking_id, date, start_time, event_type)
         VALUES ($1, $2, $3, 'main_service')`,
        [booking_id, formatted_service_date, service_time]
      );
    }

    // ============================================
    // INSERT SELECTED ADD-ONS (with quantity support)
    // ============================================
    if (selected_addons && Array.isArray(selected_addons) && selected_addons.length > 0) {
      for (const addon of selected_addons) {
        const addon_name = addon.addon_name || addon.name || '';
        const addon_price = addon.price || 0;
        const addon_id = addon.addon_id || null;
        const quantity = addon.quantity || 1;

        if (addon_name && addon_price !== undefined) {
          if (addon_id !== null) {
            // Insert with addon_id and quantity
            await query(
              'INSERT INTO booking_addons (booking_id, addon_id, addon_name, addon_price, quantity) VALUES ($1, $2, $3, $4, $5)',
              [booking_id, addon_id, addon_name, addon_price, quantity]
            );

            // ERP FEATURE: INVENTORY RESERVATION (COMMENTED OUT)
            // Reserve inventory for physical items
            // try {
            //   const addonInfo = await queryOne(
            //     'SELECT addon_type, stock_quantity FROM provider_addons WHERE addon_id = $1',
            //     [addon_id]
            //   );

            //   if (addonInfo && addonInfo.addon_type === 'item' && addonInfo.stock_quantity !== null) {
            //     // Call ReserveInventory stored procedure
            //     await query(
            //       `SELECT ReserveInventory($1::INTEGER, $2::INTEGER, $3::INTEGER)`,
            //       [addon_id, booking_id, quantity]
            //     );
            //   }
            // } catch (inventoryError: any) {
            //   // If ReserveInventory doesn't exist yet, log warning but continue
            //   logger.warn('ReserveInventory procedure not found, skipping inventory reservation', { error: inventoryError.message });
            // }
          } else {
            // Insert without addon_id for custom add-ons (with quantity)
            await query(
              'INSERT INTO booking_addons (booking_id, addon_name, addon_price, quantity) VALUES ($1, $2, $3, $4)',
              [booking_id, addon_name, addon_price, quantity]
            );
          }
        }
      }
    }

    // Generate booking reference
    const booking_ref = `BK${String(booking_id).padStart(6, '0')}`;
    await query(
      'UPDATE bookings SET booking_reference = $1 WHERE booking_id = $2',
      [booking_ref, booking_id]
    );

    // Fetch provider information for the response
    const providerInfo = await queryOne(
      'SELECT company_name, phone, email FROM service_provider WHERE provider_id = $1',
      [provider_id]
    );

    return NextResponse.json(
      successResponse({
        booking_id,
        booking_reference: booking_ref,
        package_name: packageData.name,
        provider_name: providerInfo?.company_name || null,
        provider_phone: providerInfo?.phone || null,
        provider_email: providerInfo?.email || null
      }, 'Booking created successfully')
    );

  } catch (error: any) {
    // Handle known error types
    if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof ConflictError) {
      const errorResponseData = formatErrorResponse(error);
      return NextResponse.json(errorResponseData, { status: getErrorStatusCode(error) });
    }

    // Log unexpected errors
    logger.error('Create booking error', { error: error.message, stack: error.stack });
    const serverError = new InternalServerError('Failed to create booking');
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

