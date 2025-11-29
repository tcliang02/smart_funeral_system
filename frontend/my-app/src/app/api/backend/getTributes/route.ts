/**
 * Next.js API Route: /api/backend/getTributes
 * Replaces: backend/getTributes.php
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';
import { verifyAuth, sanitize } from '@/lib/helpers';
import { successResponse, paginatedResponse } from '@/lib/api-response';
import { formatErrorResponse, getErrorStatusCode, InternalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    // Get auth token
    const headers = request.headers;
    const auth = verifyAuth(headers);

    // Build query
    let query = `
      SELECT t.*, u.name as created_by 
      FROM tributes t
      LEFT JOIN users u ON t.created_by = u.user_id
      WHERE t.is_public = true
    `;
    const params: any[] = [];

    // If authenticated, also show user's private tributes
    if (auth && auth.user_id) {
      query += ' OR t.created_by = $1';
      params.push(auth.user_id);
    }

    // Get filter, page, and limit parameters
    const filter = request.nextUrl.searchParams.get('filter') || 'recent';
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '9');
    const offset = (page - 1) * limit;

    // Add search functionality
    const search = request.nextUrl.searchParams.get('search');
    if (search && search.trim()) {
      const searchTerm = `%${sanitize(search)}%`;
      if (params.length > 0) {
        query += ' AND (t.deceased_name LIKE $2 OR t.biography LIKE $3)';
        params.push(searchTerm, searchTerm);
      } else {
        query += ' AND (t.deceased_name LIKE $1 OR t.biography LIKE $2)';
        params.push(searchTerm, searchTerm);
      }
    }

    // Add sorting based on filter
    if (filter === 'recent') {
      query += ' ORDER BY t.created_at DESC';
    } else if (filter === 'popular') {
      // Order by number of messages/RSVPs (you may need to adjust this)
      query += ' ORDER BY (SELECT COUNT(*) FROM tribute_messages WHERE tribute_id = t.tribute_id) DESC, t.created_at DESC';
    } else {
      query += ' ORDER BY t.created_at DESC';
    }

    // Add pagination
    const paramIndex = params.length + 1;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    // Execute query
    const rows = await queryAll(query, params.length > 0 ? params : undefined);

    // Format tributes with all necessary fields
    const tributes = rows.map((row: any) => {
      let daysSincePassing = null;
      if (row.death_date) {
        const deathDate = new Date(row.death_date);
        const now = new Date();
        daysSincePassing = Math.floor((now.getTime() - deathDate.getTime()) / (1000 * 60 * 60 * 24));
      }

      return {
        id: row.tribute_id,
        tribute_id: row.tribute_id,
        name: row.deceased_name,
        deceased_name: row.deceased_name,
        // Date fields - provide both naming conventions for compatibility
        birth_date: row.birth_date,
        date_of_birth: row.birth_date,
        death_date: row.death_date,
        date_of_death: row.death_date,
        // Photo fields
        photo_url: row.photo_url,
        portrait_photo: row.photo_url,
        // Biography
        biography: row.biography,
        life_story: row.life_story,
        // Location fields
        location_of_birth: row.location_of_birth,
        grave_location_name: row.grave_location_name,
        grave_address: row.grave_address,
        // Public/Privacy
        is_public: row.is_public,
        // Creator
        created_by: row.created_by,
        created_at: row.created_at,
        // Stats - get counts from related tables
        view_count: row.view_count || 0,
        flower_count: row.flower_count || 0,
        message_count: 0, // Will be calculated if needed
        days_since_passing: daysSincePassing
      };
    });

    // Get message counts for each tribute
    if (tributes.length > 0) {
      const tributeIds = tributes.map(t => t.id);
      try {
        // Use IN clause with array for PostgreSQL
        const placeholders = tributeIds.map((_, i) => `$${i + 1}`).join(',');
        const messageCounts = await queryAll(
          `SELECT tribute_id, COUNT(*) as count 
           FROM tribute_messages 
           WHERE tribute_id IN (${placeholders})
           GROUP BY tribute_id`,
          tributeIds
        );

        const countMap = new Map();
        messageCounts.forEach((mc: any) => {
          countMap.set(mc.tribute_id, parseInt(mc.count));
        });

        tributes.forEach(tribute => {
          tribute.message_count = countMap.get(tribute.id) || 0;
        });
      } catch (e) {
        logger.error('Error fetching message counts', { error: e instanceof Error ? e.message : String(e) });
        // Continue without message counts
      }
    }

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM tributes t
      WHERE t.is_public = true
    `;
    if (auth && auth.user_id) {
      countQuery += ' OR t.created_by = $1';
    }
    const countResult = await queryAll(countQuery, auth && auth.user_id ? [auth.user_id] : undefined);
    const total = parseInt(countResult[0]?.total || '0');

    return NextResponse.json({
      success: true,
      data: {
        tributes: tributes,
        pagination: {
          page,
          limit,
          total,
          total_pages: Math.ceil(total / limit)
        }
      },
      message: 'Tributes retrieved successfully'
    });

  } catch (error: any) {
    logger.error('Get tributes error', { error: error.message, stack: error.stack });
    const serverError = new InternalServerError('Failed to retrieve tributes');
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

