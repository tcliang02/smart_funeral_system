/**
 * Next.js API Route: /api/backend/deleteProviderAddon
 * Replaces: backend/deleteProviderAddon.php
 * Handles: DELETE (delete a provider addon)
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { successResponse } from '@/lib/api-response';
import { ValidationError, NotFoundError, formatErrorResponse, getErrorStatusCode, InternalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function DELETE(request: NextRequest) {
  try {
    const data = await request.json();
    const addonId = data.addon_id;

    if (!addonId) {
      throw new ValidationError('Missing addon_id');
    }

    // Delete provider addon
    const result = await query(
      'DELETE FROM provider_addons WHERE addon_id = $1',
      [addonId]
    );

    if (result.rowCount === 0) {
      throw new NotFoundError('Add-on not found');
    }

    return NextResponse.json(
      successResponse({}, 'Add-on deleted successfully')
    );

  } catch (error: any) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      const errorResponseData = formatErrorResponse(error);
      return NextResponse.json(errorResponseData, { status: getErrorStatusCode(error) });
    }
    
    logger.error('Delete provider addon error', { error: error.message, stack: error.stack });
    const serverError = new InternalServerError('Failed to delete add-on');
    const errorResponseData = formatErrorResponse(serverError);
    return NextResponse.json(errorResponseData, { status: getErrorStatusCode(serverError) });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

