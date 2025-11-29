/**
 * Next.js API Route: /api/backend/updateTribute
 * Replaces: backend/updateTribute.php
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
    if (!input.tribute_id || !input.user_id) {
      throw new ValidationError('Missing tribute_id or user_id');
    }

    // Verify user is tribute creator
    const tribute = await queryOne(
      'SELECT created_by FROM tributes WHERE tribute_id = $1',
      [input.tribute_id]
    );

    if (!tribute) {
      throw new NotFoundError('Tribute not found');
    }

    if (tribute.created_by != input.user_id) {
      throw new ForbiddenError('Only the tribute creator can edit');
    }

    // Map frontend field names to database column names
    const fieldMap: { [key: string]: string } = {
      date_of_birth: 'birth_date',
      date_of_death: 'death_date',
      portrait_photo: 'photo_url'
    };

    const allowed_fields = [
      'deceased_name', 'birth_date', 'death_date', 'biography', 'location_of_birth',
      'life_story', 'photo_url',
      'grave_invite_message', 'grave_location_name', 'grave_address', 'grave_datetime',
      'map_link', 'virtual_link',
      'bank_account_name', 'bank_name', 'bank_account_number', 'donation_qr_code', 'donation_items',
      'enable_rsvp', 'rsvp_max_guests', 'is_public', 'allow_messages', 'allow_photos'
    ];

    // Build update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const field of allowed_fields) {
      const inputField = fieldMap[field] || field;
      if (input[inputField] !== undefined) {
        updates.push(`${field} = $${paramIndex}`);
        
        // Handle boolean fields
        if (['is_public', 'allow_messages', 'allow_photos', 'enable_rsvp'].includes(field)) {
          values.push(Boolean(input[inputField]));
        } else {
          values.push(input[inputField]);
        }
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      throw new ValidationError('No fields to update');
    }

    // Add tribute_id to the end
    values.push(input.tribute_id);
    const sql = `UPDATE tributes SET ${updates.join(', ')} WHERE tribute_id = $${paramIndex}`;

    await query(sql, values);

    return NextResponse.json(
      successResponse({ updated_fields: updates.length }, 'Tribute updated successfully')
    );

  } catch (error: any) {
    if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof ForbiddenError) {
      const errorResponseData = formatErrorResponse(error);
      return NextResponse.json(errorResponseData, { status: getErrorStatusCode(error) });
    }
    
    logger.error('Update tribute error', { error: error.message, stack: error.stack });
    const serverError = new InternalServerError('Failed to update tribute');
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

