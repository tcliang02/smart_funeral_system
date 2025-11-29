/**
 * Next.js API Route: /api/backend/updateProviderAddon
 * Replaces: backend/updateProviderAddon.php
 * Handles: PUT (update an existing provider addon)
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { successResponse } from '@/lib/api-response';
import { ValidationError, NotFoundError, formatErrorResponse, getErrorStatusCode, InternalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();

    const addonId = data.addon_id;
    const addonName = data.addon_name;
    const description = data.description || null;
    const price = data.price;
    const isActive = data.is_active !== undefined ? Boolean(data.is_active) : true;

    if (!addonId || !addonName || price === null) {
      throw new ValidationError('Missing required fields: addon_id, addon_name, price');
    }

    // Update provider addon
    const result = await query(`
      UPDATE provider_addons 
      SET addon_name = $1, 
          description = $2, 
          price = $3, 
          is_active = $4,
          updated_at = NOW()
      WHERE addon_id = $5
    `, [addonName, description, price, isActive, addonId]);

    if (result.rowCount === 0) {
      throw new NotFoundError('Add-on not found');
    }

    return NextResponse.json(
      successResponse({}, 'Add-on updated successfully')
    );

  } catch (error: any) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      const errorResponseData = formatErrorResponse(error);
      return NextResponse.json(errorResponseData, { status: getErrorStatusCode(error) });
    }
    
    logger.error('Update provider addon error', { error: error.message, stack: error.stack });
    const serverError = new InternalServerError('Failed to update add-on');
    const errorResponseData = formatErrorResponse(serverError);
    return NextResponse.json(errorResponseData, { status: getErrorStatusCode(serverError) });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

