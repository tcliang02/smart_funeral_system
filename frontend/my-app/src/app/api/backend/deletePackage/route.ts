/**
 * Next.js API Route: /api/backend/deletePackage
 * Replaces: backend/deletePackage.php
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';
import { successResponse } from '@/lib/api-response';
import { ValidationError, NotFoundError, ConflictError, formatErrorResponse, getErrorStatusCode, InternalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const package_id = data.id || data.package_id;

    if (!package_id) {
      throw new ValidationError('Missing package ID');
    }

    const id = parseInt(package_id);

    // Check if package exists
    const packageData = await queryOne(
      'SELECT package_id, provider_id FROM packages WHERE package_id = $1',
      [id]
    );

    if (!packageData) {
      throw new NotFoundError('Package not found');
    }

    // Check for active bookings
    const activeBookings = await queryOne(
      'SELECT COUNT(*) as count FROM bookings WHERE package_id = $1 AND status IN ($2, $3)',
      [id, 'pending', 'confirmed']
    );

    if (activeBookings && parseInt(activeBookings.count) > 0) {
      throw new ConflictError('Cannot delete package with active bookings. Please complete or cancel all pending bookings first.', { active_bookings: parseInt(activeBookings.count) });
    }

    // Delete the package
    await query('DELETE FROM packages WHERE package_id = $1', [id]);

    return NextResponse.json(
      successResponse({}, 'Package deleted successfully')
    );

  } catch (error: any) {
    if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof ConflictError) {
      const errorResponseData = formatErrorResponse(error);
      return NextResponse.json(errorResponseData, { status: getErrorStatusCode(error) });
    }
    
    logger.error('Delete package error', { error: error.message, stack: error.stack });
    const serverError = new InternalServerError('Failed to delete package');
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

