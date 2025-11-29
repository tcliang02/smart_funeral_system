/**
 * Next.js API Route: /api/backend/submitRSVP
 * Replaces: backend/submitRSVP.php
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';
import { successResponse } from '@/lib/api-response';
import { ValidationError, NotFoundError, ForbiddenError, formatErrorResponse, getErrorStatusCode, InternalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const input = await request.json();

    // Validate required fields
    if (!input.tribute_id || !input.guest_name) {
      throw new ValidationError('Tribute ID and guest name are required');
    }

    // Check if tribute has RSVP enabled and get max guests
    const tribute = await queryOne(
      'SELECT enable_rsvp, rsvp_max_guests FROM tributes WHERE tribute_id = $1',
      [input.tribute_id]
    );

    if (!tribute) {
      throw new NotFoundError('Tribute not found');
    }

    if (!tribute.enable_rsvp) {
      throw new ForbiddenError('This tribute does not have RSVP enabled');
    }

    // Map frontend fields to database columns
    const attendee_name = input.guest_name || input.attendee_name || 'Anonymous';
    const attendee_phone = input.guest_phone || input.attendee_phone || '';
    const attendee_email = input.guest_email || input.attendee_email || '';
    const number_of_guests = parseInt(String(input.number_of_guests || input.guests || 1));

    // Check capacity if limit is set
    if (tribute.rsvp_max_guests && tribute.rsvp_max_guests > 0) {
      const stats = await queryOne(
        'SELECT COALESCE(SUM(number_of_guests), 0) as total_guests FROM tribute_rsvp WHERE tribute_id = $1 AND will_attend = true',
        [input.tribute_id]
      );
      
      const currentTotal = parseInt(stats?.total_guests || '0');
      
      if (currentTotal + number_of_guests > tribute.rsvp_max_guests) {
        const remaining = Math.max(0, tribute.rsvp_max_guests - currentTotal);
        throw new ValidationError(
          remaining === 0 
            ? 'Sorry, this event is fully booked.' 
            : `Sorry, only ${remaining} spot${remaining === 1 ? '' : 's'} remaining.`
        );
      }
    }
    const attendance_type = input.attendance_type || input.type || 'physical';
    const will_attend = (attendance_type === 'physical' || attendance_type === 'virtual') ? true : false;
    const message = input.message || '';

    // Insert RSVP
    const result = await query(
      `INSERT INTO tribute_rsvp (
        tribute_id,
        attendee_name,
        attendee_phone,
        attendee_email,
        number_of_guests,
        will_attend,
        attendance_type,
        message
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING rsvp_id`,
      [
        input.tribute_id,
        attendee_name,
        attendee_phone,
        attendee_email,
        number_of_guests,
        will_attend,
        attendance_type,
        message
      ]
    );

    return NextResponse.json(
      successResponse({ rsvp_id: result.rows[0].rsvp_id }, 'RSVP submitted successfully')
    );

  } catch (error: any) {
    if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof ForbiddenError) {
      const errorResponseData = formatErrorResponse(error);
      return NextResponse.json(errorResponseData, { status: getErrorStatusCode(error) });
    }
    
    logger.error('Submit RSVP error', { error: error.message, stack: error.stack });
    const serverError = new InternalServerError('Failed to submit RSVP');
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
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

