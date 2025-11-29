/**
 * Next.js API Route: /api/backend/createTribute
 * Replaces: backend/createTribute.php
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { successResponse } from '@/lib/api-response';
import { ValidationError, UnauthorizedError, formatErrorResponse, getErrorStatusCode, InternalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { verifyAuth } from '@/lib/helpers';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = verifyAuth(request.headers);
    if (!auth || (!auth.user_id && !auth.id)) {
      throw new UnauthorizedError('Please login to create a tribute');
    }

    const authenticatedUserId = auth.user_id || auth.id;
    const input = await request.json();

    // Map frontend field names to database column names
    // Use authenticated user_id for security (don't trust client-provided user_id)
    if (input.creator_user_id && !input.created_by) {
      input.created_by = authenticatedUserId; // Use authenticated user ID
    } else if (!input.created_by) {
      input.created_by = authenticatedUserId; // Use authenticated user ID
    }

    // Validate required fields
    const required = ['created_by', 'deceased_name', 'date_of_birth', 'date_of_death'];
    for (const field of required) {
      if (field === 'created_by' && !input.created_by && input.creator_user_id) {
        continue;
      }
      if (!input[field]) {
        throw new ValidationError(`Missing required field: ${field}`);
      }
    }

    // Map field names - include ALL fields from create form
    // Use authenticated user_id for security (override any client-provided user_id)
    const created_by = authenticatedUserId;
    const deceased_name = input.deceased_name;
    const birth_date = input.date_of_birth;
    const death_date = input.date_of_death;
    const biography = input.life_story || input.biography || '';
    const photo_url = input.portrait_photo || null;
    const is_public = input.is_public !== undefined ? Boolean(input.is_public) : true;
    const life_story = input.life_story || biography;
    const location_of_birth = input.location_of_birth || null;
    const allow_messages = input.allow_messages !== undefined ? Boolean(input.allow_messages) : true;
    const allow_photos = input.allow_photos !== undefined ? Boolean(input.allow_photos) : true;
    const enable_rsvp = input.enable_rsvp !== undefined ? Boolean(input.enable_rsvp) : false;
    const rsvp_max_guests = input.rsvp_max_guests ? parseInt(input.rsvp_max_guests) : null;
    
    // Donation fields
    const donation_items = input.donation_items ? 
      (typeof input.donation_items === 'string' ? input.donation_items : JSON.stringify(input.donation_items)) 
      : null;
    const bank_account_name = input.bank_account_name || null;
    const bank_name = input.bank_name || null;
    const bank_account_number = input.bank_account_number || null;
    const donation_qr_code = input.donation_qr_code || null;
    
    // Grave/Memorial fields
    const grave_location_name = input.grave_location_name || null;
    const grave_address = input.grave_address || null;
    const grave_datetime = input.grave_datetime || null;
    const grave_invite_message = input.grave_invite_message || null;
    const map_link = input.map_link || null;
    const virtual_link = input.virtual_link || null;

    // Insert tribute with ALL fields
    const result = await query(
      `INSERT INTO tributes (
        created_by,
        deceased_name,
        birth_date,
        death_date,
        biography,
        photo_url,
        is_public,
        life_story,
        location_of_birth,
        allow_messages,
        allow_photos,
        enable_rsvp,
        rsvp_max_guests,
        donation_items,
        bank_account_name,
        bank_name,
        bank_account_number,
        donation_qr_code,
        grave_location_name,
        grave_address,
        grave_datetime,
        grave_invite_message,
        map_link,
        virtual_link
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
      RETURNING tribute_id`,
      [
        created_by,
        deceased_name,
        birth_date,
        death_date,
        biography,
        photo_url,
        is_public,
        life_story,
        location_of_birth,
        allow_messages,
        allow_photos,
        enable_rsvp,
        rsvp_max_guests,
        donation_items,
        bank_account_name,
        bank_name,
        bank_account_number,
        donation_qr_code,
        grave_location_name,
        grave_address,
        grave_datetime,
        grave_invite_message,
        map_link,
        virtual_link
      ]
    );

    const tribute_id = result.rows[0].tribute_id;

    return NextResponse.json(
      successResponse({ tribute_id }, 'Tribute created successfully')
    );

  } catch (error: any) {
    if (error instanceof ValidationError) {
      const errorResponseData = formatErrorResponse(error);
      return NextResponse.json(errorResponseData, { status: getErrorStatusCode(error) });
    }
    
    logger.error('Create tribute error', { error: error.message, stack: error.stack });
    const serverError = new InternalServerError('Failed to create tribute');
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

