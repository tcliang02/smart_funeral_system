/**
 * Next.js API Route: /api/backend/managePackage
 * Replaces: backend/managePackage.php
 * Handles: POST (create package) and PUT (update package)
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query, queryAll } from '@/lib/db';
import { successResponse } from '@/lib/api-response';
import { ValidationError, NotFoundError, ForbiddenError, formatErrorResponse, getErrorStatusCode, InternalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';

// Helper function to update provider statistics
async function updateProviderStats(providerId: number) {
  await query(`
    UPDATE service_provider 
    SET total_packages = (SELECT COUNT(*) FROM packages WHERE provider_id = $1),
        average_price = (SELECT AVG(price) FROM packages WHERE provider_id = $2)
    WHERE provider_id = $3
  `, [providerId, providerId, providerId]);
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Get user from Authorization header or session
    // For now, we'll get provider_id from the request body or look it up
    // In a real app, you'd verify the JWT token here
    const userId = data.user_id || data.provider_id;
    
    if (!userId) {
      throw new ValidationError('User ID or Provider ID is required');
    }

    // Get provider_id from user_id if needed
    let providerId = data.provider_id;
    if (!providerId) {
      const provider = await queryOne(
        'SELECT provider_id FROM service_provider WHERE user_id = $1',
        [userId]
      );
      
      if (!provider) {
        throw new NotFoundError('Provider profile not found');
      }
      
      providerId = provider.provider_id;
    }

    // Validate required fields for POST
    if (!data.name || !data.description || data.price === undefined) {
      throw new ValidationError('Missing required fields: name, description, price');
    }

    // Insert new package
    const result = await query(`
      INSERT INTO packages (provider_id, name, description, price, is_featured, 
                           duration_hours, capacity, location_type, is_active) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING package_id
    `, [
      providerId,
      data.name,
      data.description,
      parseFloat(data.price),
      data.is_featured !== undefined ? Boolean(data.is_featured) : false,
      data.duration_hours || null,
      data.capacity || null,
      data.location_type || 'both',
      data.is_active !== undefined ? Boolean(data.is_active) : true
    ]);

    const newPackageId = result.rows[0]?.package_id;

    if (!newPackageId) {
      throw new InternalServerError('Failed to create package');
    }

    // Add package features if provided
    if (data.features && Array.isArray(data.features) && data.features.length > 0) {
      for (const feature of data.features) {
        if (feature && feature.trim()) {
          await query(
            'INSERT INTO package_features (package_id, feature_name) VALUES ($1, $2)',
            [newPackageId, feature.trim()]
          );
        }
      }
    }

    // Update provider stats
    await updateProviderStats(providerId);

    return NextResponse.json(
      successResponse({ package_id: newPackageId }, 'Package created successfully')
    );

  } catch (error: any) {
    if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof InternalServerError) {
      const errorResponseData = formatErrorResponse(error);
      return NextResponse.json(errorResponseData, { status: getErrorStatusCode(error) });
    }
    
    logger.error('Create package error', { error: error.message, stack: error.stack });
    const serverError = new InternalServerError('Failed to create package');
    const errorResponseData = formatErrorResponse(serverError);
    return NextResponse.json(errorResponseData, { status: getErrorStatusCode(serverError) });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate package_id
    if (!data.package_id) {
      throw new ValidationError('Missing required field: package_id');
    }

    // Get user from request (in real app, verify JWT token)
    const userId = data.user_id;
    
    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    // Get provider_id from user_id
    const provider = await queryOne(
      'SELECT provider_id FROM service_provider WHERE user_id = $1',
      [userId]
    );
    
    if (!provider) {
      throw new NotFoundError('Provider profile not found');
    }
    
    const providerId = provider.provider_id;
    const packageId = parseInt(data.package_id);

    // Verify package belongs to provider
    const existingPackage = await queryOne(
      'SELECT package_id FROM packages WHERE package_id = $1 AND provider_id = $2',
      [packageId, providerId]
    );

    if (!existingPackage) {
      throw new ForbiddenError('Package not found or unauthorized');
    }

    // Get current package data to preserve fields not being updated
    const currentPackage = await queryOne(
      'SELECT * FROM packages WHERE package_id = $1',
      [packageId]
    );

    // Build update query - only update fields that are provided
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    // Only add fields that are explicitly provided in the request
    if (data.name !== undefined) {
      updateFields.push(`name = $${paramIndex++}`);
      updateValues.push(data.name);
    }

    if (data.description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      updateValues.push(data.description);
    }

    if (data.price !== undefined) {
      updateFields.push(`price = $${paramIndex++}`);
      updateValues.push(parseFloat(data.price));
    }

    if (data.is_featured !== undefined) {
      updateFields.push(`is_featured = $${paramIndex++}`);
      updateValues.push(Boolean(data.is_featured));
    }

    if (data.is_active !== undefined) {
      updateFields.push(`is_active = $${paramIndex++}`);
      updateValues.push(Boolean(data.is_active));
    }

    if (data.duration_hours !== undefined) {
      updateFields.push(`duration_hours = $${paramIndex++}`);
      updateValues.push(data.duration_hours || null);
    }

    if (data.capacity !== undefined) {
      updateFields.push(`capacity = $${paramIndex++}`);
      updateValues.push(data.capacity || null);
    }

    if (data.location_type !== undefined) {
      updateFields.push(`location_type = $${paramIndex++}`);
      updateValues.push(data.location_type || 'both');
    }

    // If no fields to update, return error
    if (updateFields.length === 0) {
      throw new ValidationError('No fields to update');
    }

    // Add updated_at and WHERE clause parameters
    updateFields.push(`updated_at = NOW()`);
    updateValues.push(packageId, providerId);

    const updateQuery = `
      UPDATE packages 
      SET ${updateFields.join(', ')}
      WHERE package_id = $${paramIndex++} AND provider_id = $${paramIndex++}
    `;

    await query(updateQuery, updateValues);

    // Update package features if provided
    if (data.features !== undefined && Array.isArray(data.features)) {
      // Delete existing features
      await query('DELETE FROM package_features WHERE package_id = $1', [packageId]);

      // Add new features
      if (data.features.length > 0) {
        for (const feature of data.features) {
          if (feature && feature.trim()) {
            await query(
              'INSERT INTO package_features (package_id, feature_name) VALUES ($1, $2)',
              [packageId, feature.trim()]
            );
          }
        }
      }
    }

    // Update provider stats
    await updateProviderStats(providerId);

    return NextResponse.json(
      successResponse({}, 'Package updated successfully')
    );

  } catch (error: any) {
    if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof ForbiddenError) {
      const errorResponseData = formatErrorResponse(error);
      return NextResponse.json(errorResponseData, { status: getErrorStatusCode(error) });
    }
    
    logger.error('Update package error', { error: error.message, stack: error.stack });
    const serverError = new InternalServerError('Failed to update package');
    const errorResponseData = formatErrorResponse(serverError);
    return NextResponse.json(errorResponseData, { status: getErrorStatusCode(serverError) });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

