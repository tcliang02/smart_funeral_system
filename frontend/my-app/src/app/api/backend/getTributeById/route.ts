/**
 * Next.js API Route: /api/backend/getTributeById
 * Replaces: backend/getTributeById.php
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryOne, queryAll, query } from '@/lib/db';
import { successResponse } from '@/lib/api-response';
import { ValidationError, NotFoundError, formatErrorResponse, getErrorStatusCode, InternalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const tribute_id = request.nextUrl.searchParams.get('id');

    if (!tribute_id || parseInt(tribute_id) <= 0) {
      throw new ValidationError('Invalid tribute ID');
    }

    // Increment view count first (before fetching tribute data)
    try {
      await query(
        `UPDATE tributes SET view_count = COALESCE(view_count, 0) + 1 WHERE tribute_id = $1`,
        [tribute_id]
      );
    } catch (e) {
      logger.warn('Error incrementing view count', { error: e instanceof Error ? e.message : String(e) });
      // Continue even if view count update fails
    }

    // Fetch tribute details - use SELECT * to get all available columns
    const tribute = await queryOne(`
      SELECT *
      FROM tributes 
      WHERE tribute_id = $1
    `, [tribute_id]);

    if (!tribute) {
      throw new NotFoundError('Tribute not found');
    }

    // Fetch messages - handle missing columns gracefully
    let messages = [];
    try {
      const messagesRaw = await queryAll(`
        SELECT *
        FROM tribute_messages
        WHERE tribute_id = $1 AND (is_approved = true OR is_approved IS NULL)
        ORDER BY created_at DESC
      `, [tribute_id]);
      
      // Map messages to include id field for frontend compatibility
      messages = messagesRaw.map(msg => ({
        ...msg,
        id: msg.message_id, // Add id field for frontend compatibility
      }));
    } catch (e) {
      logger.warn('Error fetching messages', { error: e instanceof Error ? e.message : String(e) });
      messages = [];
    }

    // Fetch tribute photos (gallery) - handle missing table gracefully
    let photos = [];
    try {
      const photosRaw = await queryAll(`
        SELECT *
        FROM tribute_photos
        WHERE tribute_id = $1
        ORDER BY created_at DESC
      `, [tribute_id]);
      
      // Map caption to photo_description and add id field for frontend compatibility
      photos = photosRaw.map(photo => ({
        ...photo,
        id: photo.photo_id, // Add id field for frontend compatibility
        photo_description: photo.caption || photo.photo_description || null
      }));
    } catch (e) {
      logger.warn('Error fetching photos', { error: e instanceof Error ? e.message : String(e) });
      photos = [];
    }

    // Note: familyPhotos uses same as photos for now

    // Fetch RSVP stats - handle missing table gracefully
    // Calculate in JavaScript to avoid SQL type issues with will_attend
    let rsvpStats = { count: 0, total_guests: 0, attending_guests: 0 };
    try {
      const allRsvps = await queryAll(`
        SELECT will_attend, number_of_guests 
        FROM tribute_rsvp 
        WHERE tribute_id = $1
      `, [tribute_id]);
      
      let totalGuests = 0;
      let attendingGuests = 0;
      
      allRsvps.forEach((rsvp: any) => {
        const guests = parseInt(String(rsvp.number_of_guests || '0'));
        totalGuests += guests;
        
        // Handle will_attend as boolean, integer, or string
        const willAttend = rsvp.will_attend;
        const isAttending = willAttend === true || willAttend === 1 || willAttend === '1' || willAttend === 'true' || willAttend === 't';
        
        if (isAttending) {
          attendingGuests += guests;
        }
      });
      
      rsvpStats = {
        count: allRsvps.length,
        total_guests: totalGuests,
        attending_guests: attendingGuests
      };
    } catch (e) {
      logger.warn('Error fetching RSVP stats', { error: e instanceof Error ? e.message : String(e) });
      // Use default values
    }

    // Build full photo URL if photo_url exists
    let photoUrl = null;
    if (tribute.photo_url) {
      if (tribute.photo_url.startsWith('http')) {
        photoUrl = tribute.photo_url;
      } else {
        photoUrl = tribute.photo_url;
      }
    }

    // Parse donation items if it's a JSON string
    let donationItems = [];
    if (tribute.donation_items) {
      try {
        if (typeof tribute.donation_items === 'string') {
          // Try parsing as JSON
          donationItems = JSON.parse(tribute.donation_items);
        } else if (Array.isArray(tribute.donation_items)) {
          donationItems = tribute.donation_items;
        } else if (typeof tribute.donation_items === 'object') {
          donationItems = [tribute.donation_items];
        }
      } catch (e) {
        logger.warn('Error parsing donation_items', { 
          error: e instanceof Error ? e.message : String(e),
          raw: tribute.donation_items 
        });
        donationItems = [];
      }
    }

    // Safely get field values with defaults
    const getField = (field: string, defaultValue: any = null) => {
      return tribute[field] !== undefined && tribute[field] !== null ? tribute[field] : defaultValue;
    };

    // Map fields for frontend compatibility - use safe getters
    return NextResponse.json(
      successResponse({
        tribute: {
          id: getField('tribute_id'),
          tribute_id: getField('tribute_id'),
          name: getField('deceased_name', ''),
          deceased_name: getField('deceased_name', ''),
          birth_date: getField('birth_date'),
          date_of_birth: getField('birth_date'),
          death_date: getField('death_date'),
          date_of_death: getField('death_date'),
          biography: getField('biography'),
          life_story: getField('life_story'),
          location_of_birth: getField('location_of_birth'),
          photo: photoUrl,
          photo_url: photoUrl,
          portrait_photo: photoUrl,
          created_by: getField('created_by'),
          created_at: getField('created_at'),
          updated_at: getField('updated_at'),
          is_public: getField('is_public', 1),
          allow_messages: getField('allow_messages', 1),
          allow_photos: getField('allow_photos', 1),
          enable_rsvp: getField('enable_rsvp', 0),
          rsvp_max_guests: getField('rsvp_max_guests'),
          max_guests: getField('rsvp_max_guests'), // Alias for backward compatibility
          view_count: getField('view_count', 0),
          flower_count: getField('flower_count', 0),
          donation_items: donationItems,
          bank_account_name: getField('bank_account_name'),
          bank_account_number: getField('bank_account_number'),
          bank_name: getField('bank_name'),
          donation_qr_code: getField('donation_qr_code'),
          grave_location_name: getField('grave_location_name'),
          grave_address: getField('grave_address'),
          grave_datetime: getField('grave_datetime'),
          grave_invite_message: getField('grave_invite_message'),
          map_link: getField('map_link'),
          virtual_link: getField('virtual_link')
        },
        messages: messages || [],
        photos: photos || [],
        family_photos: photos || [],
        rsvp_stats: {
          count: rsvpStats.count || 0,
          total_guests: rsvpStats.total_guests || 0,
          attending_guests: rsvpStats.attending_guests || 0
        }
      }, 'Tribute retrieved successfully')
    );

  } catch (error: any) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      const errorResponseData = formatErrorResponse(error);
      return NextResponse.json(errorResponseData, { status: getErrorStatusCode(error) });
    }
    
    logger.error('Get tribute by ID error', { error: error.message, stack: error.stack });
    const serverError = new InternalServerError('Failed to retrieve tribute');
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

