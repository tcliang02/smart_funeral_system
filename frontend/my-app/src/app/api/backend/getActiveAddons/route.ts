/**
 * Next.js API Route: /api/backend/getActiveAddons
 * Get active add-ons for a specific provider (for customer to see during checkout)
 * Replaces: backend/getActiveAddons.php
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';
import { successResponse } from '@/lib/api-response';
import { ValidationError, formatErrorResponse, getErrorStatusCode, InternalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('provider_id');

    if (!providerId) {
      throw new ValidationError('Missing provider_id parameter');
    }

    // Get active add-ons grouped by category
    const addons = await queryAll(`
      SELECT 
        pa.addon_id,
        pa.addon_name,
        pa.description,
        pa.price,
        pa.is_custom,
        c.category_id,
        c.category_name,
        c.display_order
      FROM provider_addons pa
      JOIN addon_categories c ON pa.category_id = c.category_id
      WHERE pa.provider_id = $1 AND pa.is_active = true
      ORDER BY c.display_order, pa.addon_name
    `, [providerId]);

    // Group addons by category
    const categoriesMap: Record<number, {
      category_id: number;
      category_name: string;
      addons: Array<{
        addon_id: number;
        addon_name: string;
        description: string | null;
        price: number;
        is_custom: boolean;
      }>;
    }> = {};

    addons.forEach((row: any) => {
      const categoryId = row.category_id;
      const categoryName = row.category_name;

      if (!categoriesMap[categoryId]) {
        categoriesMap[categoryId] = {
          category_id: categoryId,
          category_name: categoryName,
          addons: []
        };
      }

      categoriesMap[categoryId].addons.push({
        addon_id: row.addon_id,
        addon_name: row.addon_name,
        description: row.description,
        price: parseFloat(row.price),
        is_custom: row.is_custom === true || row.is_custom === 1
      });
    });

    // Convert to array
    const categories = Object.values(categoriesMap);

    return NextResponse.json(
      successResponse({ categories }, 'Active addons retrieved successfully')
    );

  } catch (error: any) {
    if (error instanceof ValidationError) {
      const errorResponseData = formatErrorResponse(error);
      return NextResponse.json(errorResponseData, { status: getErrorStatusCode(error) });
    }
    
    logger.error('Get active addons error', { error: error.message, stack: error.stack });
    const serverError = new InternalServerError('Failed to retrieve active addons');
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
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

