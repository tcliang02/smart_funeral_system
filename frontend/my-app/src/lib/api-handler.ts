/**
 * API Route Handler Utilities
 * Provides standardized error handling wrapper for API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { AppError, formatErrorResponse, getErrorStatusCode } from './errors';
import { successResponse, errorResponse, ApiResponse } from './api-response';
import { logger } from './logger';

/**
 * Wrapper for API route handlers with automatic error handling
 * 
 * Usage:
 * ```typescript
 * export const POST = apiHandler(async (request) => {
 *   const body = await request.json();
 *   // Your logic here
 *   return successResponse(data, 'Success message');
 * });
 * ```
 */
export function apiHandler<T = any>(
  handler: (request: NextRequest) => Promise<ApiResponse<T> | NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const result = await handler(request);
      
      // If already a NextResponse, return it
      if (result instanceof NextResponse) {
        return result;
      }
      
      // Otherwise, wrap in NextResponse
      return NextResponse.json(result);
    } catch (error) {
      // Log error
      logger.error('API route error', error, {
        path: request.nextUrl.pathname,
        method: request.method,
      });
      
      // Format error response
      const errorResponse = formatErrorResponse(error);
      const statusCode = getErrorStatusCode(error);
      
      return NextResponse.json(errorResponse, { status: statusCode });
    }
  };
}

/**
 * Validate request body
 * Throws ValidationError if validation fails
 */
export function validateRequestBody<T>(
  body: any,
  validator: (data: any) => data is T
): T {
  if (!validator(body)) {
    throw new (await import('./errors')).ValidationError(
      'Invalid request body',
      body
    );
  }
  return body;
}

