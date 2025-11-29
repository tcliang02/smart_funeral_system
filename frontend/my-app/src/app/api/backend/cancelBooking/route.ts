/**
 * Next.js API Route: /api/backend/cancelBooking
 * Replaces: backend/cancelBooking.php
 * Handles customer-initiated booking cancellations
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';
import { successResponse } from '@/lib/api-response';
import { ValidationError, NotFoundError, ForbiddenError, ConflictError, formatErrorResponse, getErrorStatusCode, InternalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.booking_id || !data.user_id) {
      throw new ValidationError('Missing required fields: booking_id, user_id');
    }

    const booking_id = parseInt(data.booking_id);
    const user_id = parseInt(data.user_id);
    const cancellation_reason = data.cancellation_reason || 'Customer requested cancellation';

    // Verify booking exists and belongs to this user
    const booking = await queryOne(`
      SELECT 
        b.booking_id, 
        b.status, 
        b.total_amount,
        b.user_id
      FROM bookings b
      WHERE b.booking_id = $1
    `, [booking_id]);

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // Verify ownership
    if (booking.user_id !== user_id) {
      throw new ForbiddenError("You don't have permission to cancel this booking");
    }

    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      throw new ConflictError('This booking is already cancelled');
    }

    if (booking.status === 'completed') {
      throw new ConflictError('Cannot cancel a completed booking');
    }

    // Calculate refund (95% of total amount, 5% processing fee)
    const total_amount = parseFloat(booking.total_amount);
    const refund_percentage = 95;
    const refund_amount = total_amount * (refund_percentage / 100);
    const processing_fee = total_amount * 0.05;

    // Update booking status
    await query(`
      UPDATE bookings 
      SET 
        status = 'cancelled',
        cancellation_reason = $1,
        cancelled_by = 'customer',
        cancelled_at = NOW(),
        refund_amount = $2,
        updated_at = NOW()
      WHERE booking_id = $3
    `, [cancellation_reason, refund_amount, booking_id]);

    return NextResponse.json(
      successResponse({
        booking_id: booking_id,
        refund_amount: refund_amount,
        refund_percentage: refund_percentage,
        processing_fee: processing_fee,
        total_amount: total_amount
      }, 'Booking cancelled successfully')
    );

  } catch (error: any) {
    // Handle known error types
    if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof ForbiddenError || error instanceof ConflictError) {
      const errorResponseData = formatErrorResponse(error);
      return NextResponse.json(errorResponseData, { status: getErrorStatusCode(error) });
    }
    
    // Log unexpected errors
    logger.error('Cancel booking error', { error: error.message, stack: error.stack });
    const serverError = new InternalServerError('Failed to cancel booking');
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

