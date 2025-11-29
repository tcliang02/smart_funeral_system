/**
 * Next.js API Route: /api/backend/manageProviderAvailability
 * Replaces: backend/manageProviderAvailability.php
 * Handles: GET (fetch unavailable dates), POST (add unavailable dates), DELETE (remove unavailable dates)
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryOne, queryAll, query } from '@/lib/db';
import { successResponse } from '@/lib/api-response';
import { ValidationError, NotFoundError, formatErrorResponse, getErrorStatusCode, InternalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('provider_id');
    const startDate = searchParams.get('start_date') || new Date().toISOString().split('T')[0];
    const endDate = searchParams.get('end_date') || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    if (!providerId) {
      throw new ValidationError('Provider ID is required');
    }

    // Check if provider exists
    const provider = await queryOne(
      'SELECT provider_id FROM service_provider WHERE provider_id = $1',
      [providerId]
    );

    if (!provider) {
      return NextResponse.json(
        { success: false, message: 'Provider not found' },
        { status: 404 }
      );
    }

    // Query to get unavailable dates
    const unavailableDates = await queryAll(`
      SELECT date_unavailable, reason 
      FROM provider_availability 
      WHERE provider_id = $1 
      AND date_unavailable::date BETWEEN $2::date AND $3::date
      ORDER BY date_unavailable ASC
    `, [providerId, startDate, endDate]);

    // Format the response - ensure dates are in YYYY-MM-DD format
    const formattedDates = unavailableDates.map((row: any) => {
      let dateStr: string;
      
      if (row.date_unavailable instanceof Date) {
        // If it's a Date object, format it as YYYY-MM-DD in local timezone
        const year = row.date_unavailable.getFullYear();
        const month = String(row.date_unavailable.getMonth() + 1).padStart(2, '0');
        const day = String(row.date_unavailable.getDate()).padStart(2, '0');
        dateStr = `${year}-${month}-${day}`;
      } else if (typeof row.date_unavailable === 'string') {
        // If it's already a string, extract just the date part (YYYY-MM-DD)
        dateStr = row.date_unavailable.split('T')[0].split(' ')[0];
      } else {
        // Fallback: try to convert to string
        dateStr = String(row.date_unavailable).split('T')[0].split(' ')[0];
      }
      
      logger.debug('Formatting unavailable date', {
        original: row.date_unavailable,
        type: typeof row.date_unavailable,
        formatted: dateStr
      });
      
      return {
        date: dateStr,
        reason: row.reason || ''
      };
    });

    return NextResponse.json(
      successResponse({
        provider_id: parseInt(providerId),
        start_date: startDate,
        end_date: endDate,
        unavailable_dates: formattedDates
      }, 'Availability retrieved successfully')
    );

  } catch (error: any) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      const errorResponseData = formatErrorResponse(error);
      return NextResponse.json(errorResponseData, { status: getErrorStatusCode(error) });
    }
    
    logger.error('Get provider availability error', { error: error.message, stack: error.stack });
    const serverError = new InternalServerError('Failed to retrieve availability');
    const errorResponseData = formatErrorResponse(serverError);
    return NextResponse.json(errorResponseData, { status: getErrorStatusCode(serverError) });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.provider_id || !data.dates) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: provider_id, dates' },
        { status: 400 }
      );
    }

    const providerId = parseInt(data.provider_id);
    const dates = data.dates;
    const reason = data.reason || '';

    // Validate dates array
    if (!Array.isArray(dates) || dates.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Dates must be a non-empty array' },
        { status: 400 }
      );
    }

    // Check if provider exists
    const provider = await queryOne(
      'SELECT provider_id FROM service_provider WHERE provider_id = $1',
      [providerId]
    );

    if (!provider) {
      return NextResponse.json(
        { success: false, message: 'Provider not found' },
        { status: 404 }
      );
    }

    // Start transaction
    await query('BEGIN');

    let addedCount = 0;

    try {
      // Process each date or date range
      for (const dateItem of dates) {
        let datesToAdd: string[] = [];

        // Handle date ranges
        if (dateItem.start && dateItem.end) {
          const start = new Date(dateItem.start);
          const end = new Date(dateItem.end);
          
          // Generate all dates in the range
          const current = new Date(start);
          while (current <= end) {
            datesToAdd.push(current.toISOString().split('T')[0]);
            current.setDate(current.getDate() + 1);
          }
        }
        // Handle single dates
        else if (dateItem.date) {
          datesToAdd.push(dateItem.date);
        }
        // Simple date string
        else if (typeof dateItem === 'string') {
          datesToAdd.push(dateItem);
        }

        // Insert each date (check if exists first, then insert or update)
        for (const dateStr of datesToAdd) {
          const specificReason = dateItem.reason || reason;
          
          // Check if record already exists
          const existing = await queryOne(
            'SELECT availability_id FROM provider_availability WHERE provider_id = $1 AND date_unavailable = $2::date',
            [providerId, dateStr]
          );
          
          if (existing) {
            // Update existing record
            await query(
              'UPDATE provider_availability SET reason = $1 WHERE provider_id = $2 AND date_unavailable = $3::date',
              [specificReason, providerId, dateStr]
            );
          } else {
            // Insert new record
            await query(
              'INSERT INTO provider_availability (provider_id, date_unavailable, reason) VALUES ($1, $2::date, $3)',
              [providerId, dateStr, specificReason]
            );
          }
          
          addedCount++;
        }
      }

      await query('COMMIT');

      return NextResponse.json(
        successResponse({ added_count: addedCount }, `${addedCount} unavailable date(s) added successfully`)
      );

    } catch (error: any) {
      await query('ROLLBACK');
      throw error;
    }

  } catch (error: any) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      const errorResponseData = formatErrorResponse(error);
      return NextResponse.json(errorResponseData, { status: getErrorStatusCode(error) });
    }
    
    logger.error('Add unavailable date error', { error: error.message, stack: error.stack });
    const serverError = new InternalServerError('Failed to add unavailable dates');
    const errorResponseData = formatErrorResponse(serverError);
    return NextResponse.json(errorResponseData, { status: getErrorStatusCode(serverError) });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.provider_id || !data.dates) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: provider_id, dates' },
        { status: 400 }
      );
    }

    const providerId = parseInt(data.provider_id);
    const dates = data.dates;

    // Validate dates array
    if (!Array.isArray(dates) || dates.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Dates must be a non-empty array' },
        { status: 400 }
      );
    }

    // Check if provider exists
    const provider = await queryOne(
      'SELECT provider_id FROM service_provider WHERE provider_id = $1',
      [providerId]
    );

    if (!provider) {
      return NextResponse.json(
        { success: false, message: 'Provider not found' },
        { status: 404 }
      );
    }

    // Start transaction
    await query('BEGIN');

    let removedCount = 0;

    try {
      // Process each date or date range
      for (const dateItem of dates) {
        let datesToRemove: string[] = [];

        // Handle date ranges
        if (dateItem.start && dateItem.end) {
          const start = new Date(dateItem.start);
          const end = new Date(dateItem.end);
          
          // Generate all dates in the range
          const current = new Date(start);
          while (current <= end) {
            datesToRemove.push(current.toISOString().split('T')[0]);
            current.setDate(current.getDate() + 1);
          }
        }
        // Handle single dates
        else if (dateItem.date) {
          datesToRemove.push(dateItem.date);
        }
        // Simple date string
        else if (typeof dateItem === 'string') {
          datesToRemove.push(dateItem);
        }

        // Delete each date
        for (const dateStr of datesToRemove) {
          const result = await query(
            'DELETE FROM provider_availability WHERE provider_id = $1 AND date_unavailable::date = $2::date',
            [providerId, dateStr]
          );
          removedCount += result.rowCount || 0;
        }
      }

      await query('COMMIT');

      return NextResponse.json(
        successResponse({ removed_count: removedCount }, `${removedCount} unavailable date(s) removed successfully`)
      );

    } catch (error: any) {
      await query('ROLLBACK');
      throw error;
    }

  } catch (error: any) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      const errorResponseData = formatErrorResponse(error);
      return NextResponse.json(errorResponseData, { status: getErrorStatusCode(error) });
    }
    
    logger.error('Remove unavailable date error', { error: error.message, stack: error.stack });
    const serverError = new InternalServerError('Failed to remove unavailable dates');
    const errorResponseData = formatErrorResponse(serverError);
    return NextResponse.json(errorResponseData, { status: getErrorStatusCode(serverError) });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

