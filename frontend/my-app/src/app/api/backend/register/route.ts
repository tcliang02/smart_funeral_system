/**
 * Next.js API Route: /api/backend/register
 * Replaces: backend/register.php
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';
import * as bcrypt from 'bcryptjs';
import { successResponse, errorResponse } from '@/lib/api-response';
import { ValidationError, ConflictError, formatErrorResponse, getErrorStatusCode, InternalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password, role: requestedRole } = body;

    // Validation
    if (!username || !email || !password) {
      throw new ValidationError('All fields are required.');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format.');
    }

    // Validate password strength
    if (password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters.');
    }

    // Valid roles
    const validRoles = ['family', 'guest', 'provider'];
    const role = validRoles.includes(requestedRole) ? requestedRole : 'guest';

    // Check if user already exists
    const existingUser = await queryOne(
      'SELECT * FROM users WHERE name = $1 OR email = $2',
      [username, email]
    );

    if (existingUser) {
      throw new ConflictError('Username or email already exists.');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING user_id',
      [username, email, hashedPassword, role]
    );

    const userId = result.rows[0].user_id;

    // If provider, create service_provider entry
    if (role === 'provider') {
      await query(
        `INSERT INTO service_provider (user_id, company_name, phone, email, is_active)
         VALUES ($1, $2, '', $3, true)`,
        [userId, username, email]
      );
    }

    return NextResponse.json(
      successResponse({ user_id: userId }, 'Registration successful')
    );

  } catch (error: any) {
    // Handle known error types
    if (error instanceof ValidationError || error instanceof ConflictError) {
      const errorResponseData = formatErrorResponse(error);
      return NextResponse.json(errorResponseData, { status: getErrorStatusCode(error) });
    }
    
    // Log unexpected errors
    logger.error('Registration error', { error: error.message, stack: error.stack });
    const serverError = new InternalServerError('Registration failed. Please try again.');
    const errorResponseData = formatErrorResponse(serverError);
    return NextResponse.json(errorResponseData, { status: getErrorStatusCode(serverError) });
  }
}

// Handle OPTIONS for CORS
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

