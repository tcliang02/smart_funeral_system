/**
 * Next.js API Route: /api/backend/checkAvailability
 * 
 * GET: Checks if a provider is available on a specific date (legacy)
 * POST: Checks resource or inventory availability (new)
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';
import { successResponse } from '@/lib/api-response';
import { ValidationError, NotFoundError, formatErrorResponse, getErrorStatusCode, InternalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';

// Legacy GET endpoint for provider availability
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('provider_id');
    const date = searchParams.get('date');

    if (!providerId || !date) {
      throw new ValidationError('Missing provider_id or date parameter');
    }

    // Check if provider exists
    const provider = await queryOne(
      'SELECT provider_id, company_name FROM service_provider WHERE provider_id = $1 AND is_active = true',
      [providerId]
    );

    if (!provider) {
      throw new NotFoundError('Provider not found or inactive');
    }

    // Check if date is in provider_availability (unavailable dates)
    const formattedDate = date.split('T')[0];
    const providerIdInt = parseInt(providerId, 10);
    
    const unavailableDate = await queryOne(
      'SELECT availability_id, date_unavailable, reason FROM provider_availability WHERE provider_id = $1::integer AND date_unavailable::date = $2::date',
      [providerIdInt, formattedDate]
    );

    const isAvailable = !unavailableDate;

    return NextResponse.json(
      successResponse({
        date: date,
        provider: {
          id: provider.provider_id,
          name: provider.company_name,
          is_available: isAvailable
        },
        available: isAvailable
      }, 'Provider availability checked successfully')
    );

  } catch (error: any) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      const errorResponseData = formatErrorResponse(error);
      return NextResponse.json(errorResponseData, { status: getErrorStatusCode(error) });
    }
    
    logger.error('Check availability error', { error: error.message, stack: error.stack });
    const serverError = new InternalServerError('Failed to check availability');
    const errorResponseData = formatErrorResponse(serverError);
    return NextResponse.json(errorResponseData, { status: getErrorStatusCode(serverError) });
  }
}

// ERP FEATURE: REAL-TIME AVAILABILITY CHECKING (COMMENTED OUT)
// New POST endpoint for resource and inventory availability
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { success: false, message: 'ERP availability checking feature is disabled' },
    { status: 501 }
  );

  // COMMENTED OUT: Inventory and Resource Availability Checking
  // try {
  //   const body = await request.json();
  //   const { type } = body;

  //   if (!type || !['resource', 'inventory'].includes(type)) {
  //     return NextResponse.json(
  //       { success: false, message: "Missing or invalid 'type' field (must be 'resource' or 'inventory')" },
  //       { status: 400 }
  //     );
  //   }

  //   if (type === 'inventory') {
  //     // Check inventory availability
  //     const { addon_id, quantity = 1, exclude_booking_id } = body;

  //     if (!addon_id) {
  //       return NextResponse.json(
  //         { success: false, message: 'Missing required field: addon_id' },
  //         { status: 400 }
  //       );
  //     }

  //     // Get addon info
  //     const addon = await queryOne(
  //       'SELECT addon_id, COALESCE(stock_quantity, 0) as stock_quantity, addon_type FROM provider_addons WHERE addon_id = $1',
  //       [addon_id]
  //     );

  //     if (!addon) {
  //       return NextResponse.json({
  //         success: true,
  //         type: 'inventory',
  //         data: {
  //           is_available: false,
  //           available_stock: 0,
  //           total_stock: 0,
  //           reserved_quantity: 0,
  //           message: 'Addon not found'
  //         }
  //       });
  //     }

  //     // If not an item type, return available (services are unlimited)
  //     if (addon.addon_type !== 'item' || addon.stock_quantity === null) {
  //       return NextResponse.json({
  //         success: true,
  //         type: 'inventory',
  //         data: {
  //           is_available: true,
  //           available_stock: 999999,
  //           total_stock: 999999,
  //           reserved_quantity: 0,
  //           message: 'Service type - unlimited availability'
  //         }
  //       });
  //     }

  //     const current_stock = parseInt(addon.stock_quantity);

  //     // Calculate reserved quantity (bookings that are pending/confirmed but not expired - 15 min TTL)
  //     const reservedResult = await queryOne(
  //       `SELECT COALESCE(SUM(COALESCE(ba.quantity, 1)), 0) as reserved_quantity
  //        FROM booking_addons ba
  //        JOIN bookings b ON ba.booking_id = b.booking_id
  //        WHERE ba.addon_id = $1
  //          AND b.status IN ('pending', 'confirmed')
  //          AND ($2::integer IS NULL OR b.booking_id != $2)
  //          AND EXTRACT(EPOCH FROM (NOW() - b.created_at))/60 < 15`,
  //       [addon_id, exclude_booking_id || null]
  //     );

  //     const reserved_quantity = parseInt(reservedResult?.reserved_quantity || '0');
  //     const available_stock = current_stock - reserved_quantity;
  //     const is_available = available_stock >= quantity;

  //     return NextResponse.json({
  //       success: true,
  //       type: 'inventory',
  //       data: {
  //         is_available,
  //         available_stock,
  //         total_stock: current_stock,
  //         reserved_quantity,
  //         message: is_available 
  //           ? `Available: ${available_stock} units`
  //           : `Insufficient stock. Available: ${available_stock}, Requested: ${quantity}`
  //       }
  //     });

  //   } else if (type === 'resource') {
  //     // Check resource availability
  //     const { provider_id, resource_type, resource_name, start_date, end_date, start_time, end_time, exclude_booking_id } = body;

  //     const required = ['provider_id', 'resource_type', 'resource_name', 'start_date', 'end_date'];
  //     for (const field of required) {
  //       if (!body[field]) {
  //         return NextResponse.json(
  //           { success: false, message: `Missing required field: ${field}` },
  //           { status: 400 }
  //         );
  //       }
  //     }

  //     // Check for overlapping bookings
  //     let conflictQuery = `
  //       SELECT COUNT(*) as conflict_count
  //       FROM booking_dates bd
  //       JOIN bookings b ON bd.booking_id = b.booking_id
  //       JOIN resource_availability ra ON bd.booking_id = ra.booking_id
  //       WHERE ra.provider_id = $1
  //         AND ra.resource_type = $2
  //         AND ra.resource_name = $3
  //         AND b.status IN ('pending', 'confirmed', 'in_progress')
  //         AND ($8::integer IS NULL OR b.booking_id != $8)
  //         AND (
  //             ($4::date BETWEEN bd.date AND COALESCE(
  //                 (SELECT MAX(date) FROM booking_dates WHERE booking_id = bd.booking_id),
  //                 bd.date
  //             ))
  //             OR ($5::date BETWEEN bd.date AND COALESCE(
  //                 (SELECT MAX(date) FROM booking_dates WHERE booking_id = bd.booking_id),
  //                 bd.date
  //             ))
  //             OR (bd.date >= $4::date AND bd.date <= $5::date)
  //             OR ($4::date >= bd.date AND $5::date <= COALESCE(
  //                 (SELECT MAX(date) FROM booking_dates WHERE booking_id = bd.booking_id),
  //                 bd.date
  //             ))
  //         )
  //     `;

  //     const params: any[] = [
  //       provider_id,
  //       resource_type,
  //       resource_name,
  //       start_date,
  //       end_date,
  //       exclude_booking_id || null
  //     ];

  //     // Add time overlap check if times are provided
  //     if (start_time && end_time) {
  //       conflictQuery += `
  //         AND (
  //             bd.start_time IS NULL OR bd.end_time IS NULL OR
  //             ($6::time < COALESCE(bd.end_time, '23:59:59'::time) 
  //              AND $7::time > COALESCE(bd.start_time, '00:00:00'::time))
  //         )
  //       `;
  //       // Insert time params before exclude_booking_id (which is at index 5)
  //       params.splice(5, 0, start_time, end_time);
  //     }

  //     const conflictResult = await queryOne(conflictQuery, params);
  //     const conflict_count = parseInt(conflictResult?.conflict_count || '0');
  //     const is_available = conflict_count === 0;

  //     return NextResponse.json({
  //       success: true,
  //       type: 'resource',
  //       data: {
  //         is_available,
  //         conflict_count,
  //         message: is_available 
  //           ? 'Resource is available.'
  //           : `Resource is booked. Found ${conflict_count} conflicting booking(s).`
  //       }
  //     });
  //   }

  //   return NextResponse.json(
  //     { success: false, message: `Invalid type: ${type}` },
  //     { status: 400 }
  //   );

  // } catch (error: any) {
  //   console.error('Check availability error:', error);
  //   return NextResponse.json(
  //     { success: false, message: 'Server error: ' + error.message },
  //     { status: 500 }
  //   );
  // }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

