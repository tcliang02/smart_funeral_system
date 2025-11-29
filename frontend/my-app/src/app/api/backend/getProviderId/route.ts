/**
 * Next.js API Route: /api/backend/getProviderId
 * Simple endpoint to get provider_id from user_id
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { successResponse } from '@/lib/api-response';
import { ValidationError, NotFoundError, formatErrorResponse, getErrorStatusCode, InternalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const user_id = request.nextUrl.searchParams.get('user_id');

    if (!user_id) {
      throw new ValidationError('User ID is required');
    }

    // Get provider_id from user_id
    const provider = await queryOne(
      'SELECT provider_id FROM service_provider WHERE user_id = $1',
      [user_id]
    );

    if (!provider) {
      throw new NotFoundError('Provider profile not found for this user');
    }

    return NextResponse.json(
      successResponse({ provider_id: provider.provider_id }, 'Provider ID retrieved successfully')
    );

  } catch (error: any) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      const errorResponseData = formatErrorResponse(error);
      return NextResponse.json(errorResponseData, { status: getErrorStatusCode(error) });
    }
    
    logger.error('Get provider ID error', { error: error.message, stack: error.stack });
    const serverError = new InternalServerError('Failed to retrieve provider ID');
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

