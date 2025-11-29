/**
 * Next.js API Route: /api/backend/getAddonTemplates
 * Replaces: backend/getAddonTemplates.php
 * Handles: GET (get all addon categories and templates)
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';
import { successResponse } from '@/lib/api-response';
import { formatErrorResponse, getErrorStatusCode, InternalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    // Get all categories
    const categories = await queryAll(`
      SELECT 
        c.category_id,
        c.category_name,
        c.description,
        c.display_order
      FROM addon_categories c
      ORDER BY c.display_order
    `);

    // Get templates for each category
    const categoriesWithTemplates = await Promise.all(
      categories.map(async (category: any) => {
        const templates = await queryAll(`
          SELECT 
            template_id,
            template_name,
            description,
            suggested_price,
            is_popular,
            category_id
          FROM addon_templates
          WHERE category_id = $1
          ORDER BY is_popular DESC, template_name
        `, [category.category_id]);

        return {
          ...category,
          templates: templates
        };
      })
    );

    return NextResponse.json(
      successResponse({ categories: categoriesWithTemplates }, 'Templates retrieved successfully')
    );

  } catch (error: any) {
    logger.error('Get addon templates error', { error: error.message, stack: error.stack });
    const serverError = new InternalServerError('Failed to retrieve templates');
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

