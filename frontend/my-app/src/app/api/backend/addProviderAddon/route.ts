/**
 * Next.js API Route: /api/backend/addProviderAddon
 * Replaces: backend/addProviderAddon.php
 * Handles: POST (add a new addon for provider)
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';
import { successResponse } from '@/lib/api-response';
import { ValidationError, NotFoundError, ConflictError, formatErrorResponse, getErrorStatusCode, InternalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const providerId = data.provider_id;
    const templateId = data.template_id || null;
    let addonName = data.addon_name;
    let description = data.description || null;
    const price = data.price;
    const categoryId = data.category_id;
    const isCustom = data.is_custom || 0;

    if (!providerId || !addonName || price === null || !categoryId) {
      throw new ValidationError('Missing required fields: provider_id, addon_name, price, category_id');
    }

    // If using template, get template details
    if (templateId && !isCustom) {
      const template = await queryOne(
        'SELECT template_name, description FROM addon_templates WHERE template_id = $1',
        [templateId]
      );

      if (template) {
        // Use template data if not overridden
        if (!addonName) addonName = template.template_name;
        if (!description) description = template.description;
      }
    }

    // Check if this addon already exists for this provider
    const existing = await queryOne(
      'SELECT addon_id FROM provider_addons WHERE provider_id = $1 AND addon_name = $2',
      [providerId, addonName]
    );

    if (existing) {
      throw new ConflictError('Add-on with this name already exists for this provider');
    }

    // Insert new provider add-on
    const result = await query(`
      INSERT INTO provider_addons 
      (provider_id, template_id, addon_name, description, price, category_id, is_custom, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
      RETURNING addon_id
    `, [providerId, templateId, addonName, description, price, categoryId, isCustom]);

    const addonId = result.rows[0]?.addon_id;

    if (!addonId) {
      throw new InternalServerError('Failed to add add-on');
    }

    return NextResponse.json(
      successResponse({ addon_id: addonId }, 'Add-on added successfully')
    );

  } catch (error: any) {
    if (error instanceof ValidationError || error instanceof ConflictError) {
      const errorResponseData = formatErrorResponse(error);
      return NextResponse.json(errorResponseData, { status: getErrorStatusCode(error) });
    }
    
    logger.error('Add provider addon error', { error: error.message, stack: error.stack });
    const serverError = error instanceof InternalServerError ? error : new InternalServerError('Failed to add add-on');
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

