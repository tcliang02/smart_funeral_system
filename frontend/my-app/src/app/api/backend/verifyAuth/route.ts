/**
 * Next.js API Route: /api/backend/verifyAuth
 * Replaces: verifyAuth functionality from api.js
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, getUserById, getProviderByUserId } from '@/lib/helpers';
import { successResponse } from '@/lib/api-response';
import { UnauthorizedError, NotFoundError, formatErrorResponse, getErrorStatusCode, InternalServerError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const headers = request.headers;
    const auth = verifyAuth(headers);

    if (!auth) {
      throw new UnauthorizedError('Invalid or expired token');
    }

    // Get user details
    const user = await getUserById(auth.user_id);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // If provider, get provider details
    let provider = null;
    if (user.role === 'provider') {
      provider = await getProviderByUserId(user.user_id);
    }

    return NextResponse.json(
      successResponse({
        authenticated: true,
        user: {
          user_id: user.user_id,
          name: user.username || user.name,
          email: user.email,
          role: user.role
        },
        provider
      }, 'Authentication verified')
    );

  } catch (error: any) {
    if (error instanceof UnauthorizedError || error instanceof NotFoundError) {
      const errorResponseData = formatErrorResponse(error);
      return NextResponse.json(errorResponseData, { status: getErrorStatusCode(error) });
    }
    
    logger.error('Verify auth error', { error: error.message, stack: error.stack });
    const serverError = new InternalServerError('Authentication verification failed');
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

