/**
 * Next.js API Route: /api/backend/updateBookingStatus
 * Replaces: backend/updateBookingStatus.php
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';
import { successResponse } from '@/lib/api-response';
import { ValidationError, NotFoundError, ForbiddenError, formatErrorResponse, getErrorStatusCode, InternalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.booking_id || !data.provider_id || !data.new_status) {
      throw new ValidationError('Missing required fields: booking_id, provider_id, new_status');
    }

    const booking_id = parseInt(data.booking_id);
    const provider_id = parseInt(data.provider_id);
    const new_status = data.new_status;
    const provider_notes = data.provider_notes || '';
    const cancellation_reason = data.cancellation_reason || '';

    // Validate status
    const valid_statuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
    if (!valid_statuses.includes(new_status)) {
      throw new ValidationError(`Invalid status: ${new_status}`);
    }

    // Verify booking exists and belongs to this provider's package
    const booking = await queryOne(`
      SELECT b.booking_id, b.status, b.total_amount, p.provider_id 
      FROM bookings b
      INNER JOIN packages p ON b.package_id = p.package_id
      WHERE b.booking_id = $1
    `, [booking_id]);

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // Verify ownership
    if (booking.provider_id !== provider_id) {
      throw new ForbiddenError("You don't have permission to update this booking");
    }

    // Prepare update query based on new status
    let updateQuery: string;
    let params: any[];

    if (new_status === 'confirmed') {
      updateQuery = `
        UPDATE bookings 
        SET status = 'confirmed', 
            confirmed_at = NOW(),
            provider_notes = COALESCE(provider_notes || E'\\n', '') || $1,
            updated_at = NOW()
        WHERE booking_id = $2
      `;
      const note = provider_notes || 'Booking confirmed by provider';
      params = [note, booking_id];
    } else if (new_status === 'cancelled') {
      const refund_amount = parseFloat(booking.total_amount);
      updateQuery = `
        UPDATE bookings 
        SET status = 'cancelled', 
            cancellation_reason = $1,
            cancelled_by = 'provider',
            cancelled_at = NOW(),
            refund_amount = $2,
            provider_notes = COALESCE(provider_notes || E'\\n', '') || $3,
            updated_at = NOW()
        WHERE booking_id = $4
      `;
      const reason = cancellation_reason || 'Cancelled by service provider';
      params = [reason, refund_amount, provider_notes, booking_id];
    } else {
      // For other statuses (in_progress, completed)
      updateQuery = `
        UPDATE bookings 
        SET status = $1,
            provider_notes = COALESCE(provider_notes || E'\\n', '') || $2,
            updated_at = NOW()
        WHERE booking_id = $3
      `;
      params = [new_status, provider_notes, booking_id];
    }

    await query(updateQuery, params);

    // ============================================
    // ERP FEATURE: INVENTORY MANAGEMENT (COMMENTED OUT)
    // CONFIRM INVENTORY: Decrement stock when booking is confirmed
    // ============================================
    // let inventoryResult: any = null;
    // if (new_status === 'confirmed') {
    //   try {
    //     // Get all physical item addons for this booking
    //     const items = await query(`
    //       SELECT ba.addon_id, COALESCE(ba.quantity, 1) as quantity, pa.stock_quantity
    //       FROM booking_addons ba
    //       JOIN provider_addons pa ON ba.addon_id = pa.addon_id
    //       WHERE ba.booking_id = $1
    //         AND pa.addon_type = 'item'
    //         AND pa.stock_quantity IS NOT NULL
    //     `, [booking_id]);

    //     let items_decremented = 0;
        
    //     for (const item of items.rows) {
    //       const addon_id = item.addon_id;
    //       const quantity = parseInt(item.quantity);
    //       const current_stock = parseInt(item.stock_quantity);

    //       // Safety check: ensure stock is sufficient
    //       if (current_stock < quantity) {
    //         throw new Error(`Insufficient stock for addon ID ${addon_id}. Available: ${current_stock}, Required: ${quantity}`);
    //       }

    //       // Decrement stock
    //       await query(`
    //         UPDATE provider_addons
    //         SET stock_quantity = stock_quantity - $1
    //         WHERE addon_id = $2
    //           AND stock_quantity >= $1
    //       `, [quantity, addon_id]);

    //       // Log stock change (if addon_stock_history table exists)
    //       try {
    //         await query(`
    //           INSERT INTO addon_stock_history 
    //           (addon_id, booking_id, change_type, quantity_change, previous_stock, new_stock, notes)
    //           VALUES ($1, $2, 'sale', $3, $4, $5, $6)
    //         `, [
    //           addon_id,
    //           booking_id,
    //           -quantity,
    //           current_stock,
    //           current_stock - quantity,
    //           `Stock decremented for booking #${booking_id}`
    //         ]);
    //       } catch (historyError: any) {
    //         // Table might not exist yet, just log and continue
    //         logger.warn('Note: addon_stock_history table not found, skipping history log', { error: historyError.message });
    //       }

    //       items_decremented++;
    //     }

    //     inventoryResult = {
    //       success: true,
    //       message: `Inventory confirmed and stock decremented for ${items_decremented} item(s)`,
    //       items_decremented: items_decremented
    //     };
    //   } catch (inventoryError: any) {
    //     logger.error('Error confirming inventory', { error: inventoryError.message });
    //     inventoryResult = {
    //       success: false,
    //       message: 'Error confirming inventory: ' + inventoryError.message,
    //       items_decremented: 0
    //     };
    //     // Don't fail the entire request, but log the error
    //   }
    // }

    const response: any = {
      success: true,
      message: `Booking status updated to: ${new_status}`,
      booking_id: booking_id,
      new_status: new_status
    };

    if (new_status === 'cancelled') {
      response.refund_amount = parseFloat(booking.total_amount);
      response.refund_percentage = 100;
      response.note = '100% refund will be issued as this was cancelled by the provider';
    }

    // if (inventoryResult) {
    //   response.inventory_confirmation = inventoryResult;
    // }

    return NextResponse.json(
      successResponse(response, 'Booking status updated successfully')
    );

  } catch (error: any) {
    // Handle known error types
    if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof ForbiddenError) {
      const errorResponseData = formatErrorResponse(error);
      return NextResponse.json(errorResponseData, { status: getErrorStatusCode(error) });
    }
    
    // Log unexpected errors
    logger.error('Update booking status error', { error: error.message, stack: error.stack });
    const serverError = new InternalServerError('Failed to update booking status');
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

