/**
 * Next.js API Route: /api/backend/getProviderAddons
 * Replaces: backend/getProviderAddons.php
 * Handles: POST (get addons for a provider)
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';
import { successResponse } from '@/lib/api-response';
import { ValidationError, formatErrorResponse, getErrorStatusCode, InternalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const providerId = data.provider_id;

    if (!providerId) {
      throw new ValidationError('Missing provider_id');
    }

    // Get provider's add-ons with category information
    const addons = await queryAll(`
      SELECT 
        pa.addon_id,
        pa.provider_id,
        pa.template_id,
        pa.addon_name,
        pa.description,
        pa.price,
        pa.category_id,
        pa.is_active,
        pa.is_custom,
        c.category_name,
        at.template_name
      FROM provider_addons pa
      JOIN addon_categories c ON pa.category_id = c.category_id
      LEFT JOIN addon_templates at ON pa.template_id = at.template_id
      WHERE pa.provider_id = $1
      ORDER BY c.display_order, pa.addon_name
    `, [providerId]);

    return NextResponse.json(
      successResponse({ addons }, 'Addons retrieved successfully')
    );

  } catch (error: any) {
    if (error instanceof ValidationError) {
      const errorResponseData = formatErrorResponse(error);
      return NextResponse.json(errorResponseData, { status: getErrorStatusCode(error) });
    }
    
    logger.error('Get provider addons error', { error: error.message, stack: error.stack });
    const serverError = new InternalServerError('Failed to retrieve addons');
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

