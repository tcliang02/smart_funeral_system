/**
 * Next.js API Route: /api/backend/updateProviderProfile
 * Replaces: backend/updateProviderProfile.php
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';
import { successResponse } from '@/lib/api-response';
import { ValidationError, NotFoundError, ConflictError, formatErrorResponse, getErrorStatusCode, InternalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.provider_id) {
      throw new ValidationError('Provider ID is required');
    }

    const provider_id = parseInt(data.provider_id);

    // Verify provider exists
    const provider = await queryOne(
      'SELECT provider_id, user_id FROM service_provider WHERE provider_id = $1',
      [provider_id]
    );

    if (!provider) {
      throw new NotFoundError('Provider not found');
    }

    // Check if email is being changed and if it's already taken
    if (data.email) {
      const emailCheck = await queryOne(
        'SELECT provider_id FROM service_provider WHERE email = $1 AND provider_id != $2',
        [data.email, provider_id]
      );

      if (emailCheck) {
        throw new ConflictError('Email address is already in use');
      }
    }

    // Build dynamic update query
    const updateFields: string[] = [];
    const values: any[] = [];

    const fields = [
      'company_name', 'business_type', 'business_registration', 'description',
      'address', 'city', 'state', 'postal_code', 'phone', 'email', 'website',
      'logo', 'operating_hours', 'services_offered', 'facebook_url', 'instagram_url'
    ];

    fields.forEach(field => {
      if (data[field] !== undefined && data[field] !== null) {
        updateFields.push(`${field} = $${values.length + 1}`);
        if (field === 'services_offered') {
          // Handle services_offered as JSON
          values.push(Array.isArray(data[field]) ? JSON.stringify(data[field]) : data[field]);
        } else {
          values.push(data[field]);
        }
      }
    });

    if (updateFields.length === 0) {
      throw new ValidationError('No fields to update');
    }

    // Add provider_id to parameters
    values.push(provider_id);

    // Execute update
    const updateQuery = `
      UPDATE service_provider 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE provider_id = $${values.length}
    `;

    await query(updateQuery, values);

    // Log the activity if user_id exists
    if (provider.user_id) {
      try {
        await query(
          `INSERT INTO profile_activity_log (user_id, action_type, action_details) 
           VALUES ($1, 'profile_update', $2)`,
          [
            provider.user_id,
            JSON.stringify({
              provider_id: provider_id,
              updated_fields: Object.keys(data).filter(k => k !== 'provider_id'),
              timestamp: new Date().toISOString()
            })
          ]
        );
      } catch (logError) {
        // Log error but don't fail the update
        logger.warn('Failed to log activity', { error: logError instanceof Error ? logError.message : String(logError) });
      }
    }

    return NextResponse.json(
      successResponse({}, 'Provider profile updated successfully')
    );

  } catch (error: any) {
    if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof ConflictError) {
      const errorResponseData = formatErrorResponse(error);
      return NextResponse.json(errorResponseData, { status: getErrorStatusCode(error) });
    }
    
    logger.error('Update provider profile error', { error: error.message, stack: error.stack });
    const serverError = new InternalServerError('Failed to update provider profile');
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

