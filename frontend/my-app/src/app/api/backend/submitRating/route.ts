/**
 * Next.js API Route: /api/backend/submitRating
 * Replaces: backend/submitRating.php
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';
import { successResponse } from '@/lib/api-response';
import { ValidationError, NotFoundError, ForbiddenError, ConflictError, formatErrorResponse, getErrorStatusCode, InternalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.booking_id || !data.rating || !data.reviewer_user_id) {
      throw new ValidationError('Missing required fields: booking_id, rating, reviewer_user_id');
    }

    const booking_id = parseInt(data.booking_id);
    const rating = parseInt(data.rating);
    const reviewer_user_id = parseInt(data.reviewer_user_id);
    const review_text = (data.review_text || '').trim();
    const review_type = data.review_type || 'customer_to_provider';
    const review_category = data.review_category || 'quality';

    // Validate rating range
    if (rating < 1 || rating > 5) {
      throw new ValidationError('Rating must be between 1 and 5 stars');
    }

    // Verify the booking exists and is completed
    const booking = await queryOne(`
      SELECT booking_id, status, user_id, package_id 
      FROM bookings 
      WHERE booking_id = $1 AND status = 'completed'
    `, [booking_id]);

    if (!booking) {
      throw new NotFoundError('Booking not found or not completed yet. Ratings can only be submitted for completed services.');
    }

    // Get provider information for this booking
    const provider = await queryOne(`
      SELECT sp.provider_id, sp.user_id as provider_user_id 
      FROM packages p 
      JOIN service_provider sp ON p.provider_id = sp.provider_id 
      WHERE p.package_id = $1
    `, [booking.package_id]);

    if (!provider) {
      throw new NotFoundError('Provider information not found for this booking');
    }

    // Get reviewer information
    const reviewer = await queryOne(
      'SELECT user_id, name, email, role FROM users WHERE user_id = $1',
      [reviewer_user_id]
    );

    if (!reviewer) {
      throw new NotFoundError('Reviewer not found');
    }

    // Determine review type and validate permissions
    if (review_type === 'customer_to_provider') {
      // Customer rating provider
      if (reviewer.role !== 'family' || booking.user_id !== reviewer_user_id) {
        throw new ForbiddenError('Only the customer who made this booking can rate the provider');
      }

      // Check if rating already exists
      const existing = await queryOne(
        `SELECT review_id FROM provider_reviews 
         WHERE booking_id = $1 AND reviewer_user_id = $2 AND review_type = 'customer_to_provider'`,
        [booking_id, reviewer_user_id]
      );

      if (existing) {
        throw new ConflictError('You have already rated this service provider');
      }

      // Insert provider review
      await query(
        `INSERT INTO provider_reviews 
         (booking_id, provider_id, reviewer_user_id, rating, review_text, review_category, review_type) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [booking_id, provider.provider_id, reviewer_user_id, rating, review_text, review_category, review_type]
      );

      return NextResponse.json(
        successResponse({ rating, review_type, booking_id }, 'Thank you! Your rating for the service provider has been submitted successfully.')
      );

    } else if (review_type === 'provider_to_customer') {
      // Provider rating customer
      if (reviewer.role !== 'provider' || provider.provider_user_id !== reviewer_user_id) {
        throw new ForbiddenError('Only the service provider for this booking can rate the customer');
      }

      // Check if rating already exists
      const existing = await queryOne(
        `SELECT review_id FROM customer_reviews 
         WHERE booking_id = $1 AND provider_id = $2`,
        [booking_id, provider.provider_id]
      );

      if (existing) {
        throw new ConflictError('You have already rated this customer');
      }

      // Insert customer review
      await query(
        `INSERT INTO customer_reviews 
         (booking_id, customer_user_id, provider_id, rating, review_text, review_category) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [booking_id, booking.user_id, provider.provider_id, rating, review_text, review_category]
      );

      return NextResponse.json(
        successResponse({ rating, review_type, booking_id }, 'Thank you! Your rating for the customer has been submitted successfully.')
      );

    } else {
      throw new ValidationError('Invalid review type');
    }

  } catch (error: any) {
    if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof ForbiddenError || error instanceof ConflictError) {
      const errorResponseData = formatErrorResponse(error);
      return NextResponse.json(errorResponseData, { status: getErrorStatusCode(error) });
    }
    
    logger.error('Submit rating error', { error: error.message, stack: error.stack });
    const serverError = new InternalServerError('Failed to submit rating');
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

