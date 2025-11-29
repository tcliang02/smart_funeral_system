/**
 * Next.js API Route: /api/backend/deleteProviderAccount
 * Replaces: backend/deleteProviderAccount.php
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';
import * as bcrypt from 'bcryptjs';
import { successResponse } from '@/lib/api-response';
import { ValidationError, NotFoundError, UnauthorizedError, ConflictError, formatErrorResponse, getErrorStatusCode, InternalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.provider_id) {
      throw new ValidationError('Provider ID is required');
    }

    const provider_id = parseInt(data.provider_id);
    const permanent_delete = data.permanent === true;
    const password_confirmation = data.password || null;

    // Get provider and user information
    const provider = await queryOne(`
      SELECT sp.provider_id, sp.user_id, sp.is_active, u.password 
      FROM service_provider sp
      LEFT JOIN users u ON sp.user_id = u.user_id
      WHERE sp.provider_id = $1
    `, [provider_id]);

    if (!provider) {
      throw new NotFoundError('Provider not found');
    }

    // Verify password if provided
    if (password_confirmation && provider.user_id && provider.password) {
      const isValidPassword = await bcrypt.compare(password_confirmation, provider.password);
      if (!isValidPassword) {
        throw new UnauthorizedError('Invalid password confirmation');
      }
    }

    // Check for active bookings (need to join through packages)
    const activeBookings = await queryOne(`
      SELECT COUNT(*) as count 
      FROM bookings b
      INNER JOIN packages p ON b.package_id = p.package_id
      WHERE p.provider_id = $1 
      AND b.status IN ('pending', 'confirmed')
    `, [provider_id]);

    if (activeBookings && parseInt(activeBookings.count) > 0) {
      throw new ConflictError('Cannot delete account with active bookings. Please complete or cancel all pending bookings first.', { active_bookings: parseInt(activeBookings.count) });
    }

    if (permanent_delete) {
      // PERMANENT DELETE
      await query('DELETE FROM service_provider WHERE provider_id = $1', [provider_id]);

      // Also deactivate the user account if exists
      if (provider.user_id) {
        await query('UPDATE users SET is_active = FALSE WHERE user_id = $1', [provider.user_id]);
      }

      return NextResponse.json(
        successResponse({ type: 'permanent' }, 'Provider account permanently deleted')
      );
    } else {
      // SOFT DELETE (recommended)
      await query('UPDATE service_provider SET is_active = FALSE WHERE provider_id = $1', [provider_id]);

      // Deactivate all packages
      await query('UPDATE packages SET is_active = FALSE WHERE provider_id = $1', [provider_id]);

      // Deactivate user account if exists
      if (provider.user_id) {
        await query('UPDATE users SET is_active = FALSE WHERE user_id = $1', [provider.user_id]);

        // Log the deactivation
        try {
          await query(
            `INSERT INTO profile_activity_log (user_id, action_type, action_details) 
             VALUES ($1, 'account_deactivation', $2)`,
            [
              provider.user_id,
              JSON.stringify({
                provider_id: provider_id,
                deactivated_at: new Date().toISOString(),
                reason: data.reason || 'Provider requested deletion'
              })
            ]
          );
        } catch (logError) {
          logger.warn('Failed to log activity', { error: logError instanceof Error ? logError.message : String(logError) });
        }
      }

      return NextResponse.json(
        successResponse({ type: 'soft_delete', note: 'Account can be reactivated by contacting support' }, 'Provider account deactivated successfully')
      );
    }

  } catch (error: any) {
    if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof UnauthorizedError || error instanceof ConflictError) {
      const errorResponseData = formatErrorResponse(error);
      return NextResponse.json(errorResponseData, { status: getErrorStatusCode(error) });
    }
    
    logger.error('Delete provider account error', { error: error.message, stack: error.stack });
    const serverError = new InternalServerError('Failed to delete provider account');
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

