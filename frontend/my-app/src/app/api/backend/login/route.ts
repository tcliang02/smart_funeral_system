/**
 * Next.js API Route: /api/backend/login
 * Replaces: backend/login.php
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { generateToken, getProviderByUserId } from '@/lib/helpers';
import * as bcrypt from 'bcryptjs';
import { ValidationError, NotFoundError, UnauthorizedError, formatErrorResponse, getErrorStatusCode, InternalServerError } from '@/lib/errors';
import { successResponse, errorResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';
// Validate environment variables on module load
import '@/lib/env';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, role } = body;

    // Validation
    if (!username || !password) {
      throw new ValidationError('Please fill in all fields.');
    }

    // Query user
    let user;
    if (role) {
      user = await queryOne(
        'SELECT * FROM users WHERE name = $1 AND role = $2',
        [username, role]
      );
    } else {
      user = await queryOne(
        'SELECT * FROM users WHERE name = $1',
        [username]
      );
    }

    if (!user) {
      throw new NotFoundError('User not found.');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid password.');
    }

    // Create user data for token
    const userData = {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    // Generate JWT token
    const token = generateToken(userData);

    // If provider, fetch their provider details
    let provider = null;
    if (user.role === 'provider') {
      provider = await getProviderByUserId(user.user_id);
    }

    return NextResponse.json(
      successResponse(
        {
          token,
          user: {
            user_id: user.user_id,
            name: user.name,
            role: user.role,
            email: user.email
          },
          provider
        },
        'Login successful'
      )
    );

  } catch (error: any) {
    // Re-throw AppError instances (they have proper status codes)
    if (error instanceof ValidationError ||
      error instanceof NotFoundError ||
      error instanceof UnauthorizedError) {
      const errorResponse = formatErrorResponse(error);
      const statusCode = getErrorStatusCode(error);
      return NextResponse.json(errorResponse, { status: statusCode });
    }

    // Log unexpected errors with full details
    logger.error('Login error', { 
      error: error.message, 
      stack: error.stack,
      name: error.name,
      code: error.code,
      detail: error.detail,
      originalError: error.originalError
    });
    
    // Check if it's a database connection error
    const isDbError = error.message?.includes('Database') || 
                      error.code === 'ENOTFOUND' ||
                      error.code === 'ECONNREFUSED' ||
                      error.code === 'ETIMEDOUT';
    
    // Return more detailed error in development or for database errors
    let errorMessage = 'Login failed. Please try again.';
    if (process.env.NODE_ENV === 'development' || isDbError) {
      errorMessage = `Login failed: ${error.message}`;
      if (error.code) {
        errorMessage += ` (${error.code})`;
      }
    }
    
    const serverError = new InternalServerError(errorMessage);
    const errorResponse = formatErrorResponse(serverError);
    
    // Add debug info in development
    if (process.env.NODE_ENV === 'development' || isDbError) {
      (errorResponse as any).debug = {
        code: error.code,
        name: error.name,
        detail: error.detail
      };
    }
    
    return NextResponse.json(errorResponse, { status: 500 });
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

