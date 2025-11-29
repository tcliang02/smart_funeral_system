/**
 * Next.js API Route: /api/backend/getRSVPList
 * Replaces: backend/getRSVPList.php
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryAll, queryOne } from '@/lib/db';
import { verifyAuth } from '@/lib/helpers';
import { successResponse } from '@/lib/api-response';
import { ValidationError, NotFoundError, ForbiddenError, formatErrorResponse, getErrorStatusCode, InternalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const tribute_id = parseInt(searchParams.get('tribute_id') || '0');
    const user_id = parseInt(searchParams.get('user_id') || '0');

    // Validate required parameters
    if (!tribute_id || !user_id) {
      throw new ValidationError('Missing tribute_id or user_id');
    }

    // Verify user is tribute creator (family member)
    const tribute = await queryOne(
      'SELECT created_by FROM tributes WHERE tribute_id = $1',
      [tribute_id]
    );

    if (!tribute) {
      throw new NotFoundError('Tribute not found');
    }

    // Convert both to integers for comparison (PostgreSQL may return different types)
    const creatorId = parseInt(String(tribute.created_by || '0'));
    const userIdInt = parseInt(String(user_id));
    
    if (creatorId !== userIdInt) {
      throw new ForbiddenError('Only family members can view RSVP list');
    }

    // Get all RSVPs for this tribute
    const rsvpsRaw = await queryAll(
      `SELECT 
        rsvp_id as id,
        attendee_name as guest_name,
        attendee_phone as guest_phone,
        attendee_email as guest_email,
        number_of_guests,
        will_attend,
        attendance_type,
        message,
        created_at
      FROM tribute_rsvp 
      WHERE tribute_id = $1 
      ORDER BY created_at DESC`,
      [tribute_id]
    );

    // Map RSVPs to include both 'name' and 'guest_name' for frontend compatibility
    const rsvps = rsvpsRaw.map((rsvp: any) => ({
      ...rsvp,
      name: rsvp.guest_name, // Add 'name' field for frontend compatibility
    }));

    // Get statistics - use simpler approach to avoid type issues
    let stats = { total_rsvps: '0', total_guests: '0', attending_guests: '0', not_attending_guests: '0' };
    try {
      // First get all RSVPs and calculate in JavaScript to avoid SQL type issues
      const allRsvps = await queryAll(
        `SELECT will_attend, number_of_guests FROM tribute_rsvp WHERE tribute_id = $1`,
        [tribute_id]
      );
      
      let totalGuests = 0;
      let attendingGuests = 0;
      let notAttendingGuests = 0;
      
      allRsvps.forEach((rsvp: any) => {
        const guests = parseInt(String(rsvp.number_of_guests || '0'));
        totalGuests += guests;
        
        // Handle will_attend as boolean, integer, or string
        const willAttend = rsvp.will_attend;
        const isAttending = willAttend === true || willAttend === 1 || willAttend === '1' || willAttend === 'true' || willAttend === 't';
        
        if (isAttending) {
          attendingGuests += guests;
        } else {
          notAttendingGuests += guests;
        }
      });
      
      stats = {
        total_rsvps: String(allRsvps.length),
        total_guests: String(totalGuests),
        attending_guests: String(attendingGuests),
        not_attending_guests: String(notAttendingGuests)
      };
    } catch (e) {
      logger.warn('Error fetching RSVP stats', { error: e instanceof Error ? e.message : String(e) });
      // Use default values
    }

    return NextResponse.json(
      successResponse({ rsvps, statistics: stats }, 'RSVP list retrieved successfully')
    );

  } catch (error: any) {
    if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof ForbiddenError) {
      const errorResponseData = formatErrorResponse(error);
      return NextResponse.json(errorResponseData, { status: getErrorStatusCode(error) });
    }
    
    logger.error('Get RSVP list error', { error: error.message, stack: error.stack });
    const serverError = new InternalServerError('Failed to retrieve RSVP list');
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

