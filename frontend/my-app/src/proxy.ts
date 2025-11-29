import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';

// ============================================
// EDGE-COMPATIBLE JWT VERIFICATION
// ============================================
// Proxy runs in Edge runtime (no Node.js modules)
// So we need Edge-compatible JWT verification

/**
 * Base64 URL decode (Edge-compatible, no Buffer)
 */
function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  // Use atob (available in Edge runtime) instead of Buffer
  try {
    return atob(str);
  } catch (e) {
    // Fallback for environments without atob
    return decodeURIComponent(escape(atob(str)));
  }
}

/**
 * Verify JWT token (Edge-compatible version)
 * Note: This only checks expiry, not signature (for performance in Edge)
 * Full signature verification happens in API routes
 */
function verifyTokenEdge(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const payload = JSON.parse(base64UrlDecode(parts[1]));

    // Check expiry
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return false;
    }

    // Return payload if valid
    return payload;
  } catch (error) {
    return false;
  }
}

/**
 * Verify authentication from request headers (Edge-compatible)
 */
function verifyAuthEdge(headers: Headers): any {
  const authHeader = headers.get('authorization') || headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.substring(7);
  return verifyTokenEdge(token);
}

// ============================================
// FRONTEND ROUTES (Pages)
// ============================================

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/contact',
  '/faqs',
  '/tribute',
  '/unauthorized',
  '/test-supabase',
  '/test-providers-supabase',
];

// Routes that require authentication but are accessible to all authenticated users
const protectedRoutes = [
  '/profile-settings',
  '/service-provider-dashboard',
  '/manage-packages',
  '/manage-addons',
  '/provider-bookings',
  '/provider-ratings',
  '/order-services',
  '/service-provider',
  '/checkout',
  '/payment',
  '/thankyou',
  '/orders',
  '/customer-ratings',
  '/grief-support/chat',
  '/grief-support/voice',
  '/tribute/create',
  '/tribute/edit',
];

// ============================================
// API ROUTES
// ============================================

// Public API endpoints (no authentication required)
const publicApiEndpoints = [
  '/api/backend/login',
  '/api/backend/register',
  '/api/backend/verifyAuth', // This endpoint verifies auth itself
  '/api/backend/getAllProviders', // Public - anyone can see providers
  '/api/backend/getAllPackages', // Public - anyone can see packages
  '/api/backend/getPackages', // Public - get packages by provider
  '/api/backend/getProviderProfile', // Public - view provider profiles
  '/api/backend/getProviderAddons', // Public - view provider addons
  '/api/backend/getAddonTemplates', // Public - view addon templates
  '/api/backend/getActiveAddons', // Public - view active addons
  '/api/backend/getTributes', // Public - tributes are public
  '/api/backend/getTributeById', // Public - viewing tribute is public
  '/api/backend/getTribute', // Public - viewing tribute is public (legacy)
  '/api/backend/getVoiceMemorials', // Public - view voice memorials
  '/api/backend/getVoiceStatus', // Public - check voice status
  '/api/backend/getMemories', // Public - view memories
  '/api/backend/getTraits', // Public - view personality traits
  '/api/backend/checkAvailability', // Public - checking availability (legacy)
  '/api/backend/check-availability', // Public - new availability endpoint
  '/api/backend/manageProviderAvailability', // Public - view provider availability calendar
  '/api/backend/submitRSVP', // Public - anyone can RSVP
  '/api/backend/getRSVPList', // Public - anyone can view RSVP list
  '/api/backend/addMessage', // Public - anyone can add messages
  '/api/backend/offerFlower', // Public - anyone can offer flowers
  '/api/backend/chatbot', // Public - website assistant mode (grief mode requires auth)
  '/api/backend/submitContact', // Public - contact form (no login required)
  '/api/backend/submitFeedback', // Public - feedback form (no login required)
];

// ============================================
// PROXY FUNCTION
// ============================================

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ============================================
  // HANDLE API ROUTES
  // ============================================
  if (pathname.startsWith('/api/backend/')) {
    // Check if it's a public endpoint
    if (publicApiEndpoints.some(endpoint => pathname.startsWith(endpoint))) {
      return NextResponse.next();
    }

    // Protected API endpoint - check authentication
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || null;

    if (!token) {
      logger.debug('Proxy blocking request - no token', { pathname });
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized. Please login first.',
          error: {
            code: 'MISSING_TOKEN',
            message: 'Unauthorized. Please login first.'
          }
        },
        { status: 401 }
      );
    }

    // Verify token using Edge-compatible verifyAuth
    const auth = verifyAuthEdge(request.headers);

    if (!auth) {
      logger.debug('Proxy blocking request - invalid token', { pathname });
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid or expired token. Please login again.',
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid or expired token. Please login again.'
          }
        },
        { status: 401 }
      );
    }

    // Token is valid - attach user info to headers for routes to use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', auth.user_id.toString());
    requestHeaders.set('x-user-role', auth.role);

    logger.debug('Proxy allowing request - valid token', {
      pathname,
      userId: auth.user_id
    });

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // ============================================
  // HANDLE FRONTEND ROUTES (Pages)
  // ============================================

  // Allow public routes
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next();
  }

  // For protected frontend routes, we check auth in the component level
  // (using ProtectedRoute component)
  // Proxy can't easily access client-side auth state
  return NextResponse.next();
}

// ============================================
// PROXY CONFIG
// ============================================

export const config = {
  matcher: [
    /*
     * Match all request paths including API routes
     * Explicitly include API routes to ensure proxy runs
     */
    '/api/backend/:path*',
    /*
     * Also match frontend pages (exclude static files)
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};

