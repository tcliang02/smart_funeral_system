# 🛡️ Implement API Route Authentication - Step by Step

## 🎯 What We're Doing

**Goal:** Add automatic authentication to ALL your API routes (`/api/backend/*`)

**Current Situation:**
- ✅ You have `verifyAuth()` function in `@/lib/helpers`
- ✅ Some routes check auth manually (like `getTributes`, `getRSVPList`)
- ❌ Most routes don't check auth at all
- ❌ No centralized protection

**Solution:**
- Add API route middleware (separate from your existing frontend middleware)
- Automatically protect all `/api/backend/*` routes
- Use your existing `verifyAuth()` function

---

## 📊 How It Works

### **Current Flow:**
```
Request → API Route → (maybe checks auth) → Process
```

**Problem:** Inconsistent, easy to forget

### **New Flow:**
```
Request → Middleware (checks auth) → API Route → Process
```

**Benefit:** Automatic, consistent protection

---

## ✅ Step 1: Understand Your Current Setup

### **What You Have:**

1. **`verifyAuth()` function:**
   - Location: `@/lib/helpers`
   - Usage: `verifyAuth(request.headers)`
   - Returns: `{ user_id, role }` or `null`

2. **Existing middleware:**
   - File: `src/middleware.ts`
   - Purpose: Protects frontend pages (not API routes)
   - Config: Excludes `/api` routes

3. **Some routes already check auth:**
   - `getTributes/route.ts` uses `verifyAuth()`
   - `getRSVPList/route.ts` uses `verifyAuth()`
   - But most routes don't

---

## ✅ Step 2: Update Your Middleware

### **Current `src/middleware.ts`:**
- Protects frontend pages
- Excludes API routes (line 62: `'/((?!api|_next/static|_next/image|favicon.ico).*)'`)

### **What We Need:**
- Keep frontend protection
- ADD API route protection

### **Solution:**
Update `src/middleware.ts` to handle BOTH frontend pages AND API routes.

---

## ✅ Step 3: Implementation

### **File: `frontend/my-app/src/middleware.ts`**

**Replace the entire file with this:**

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/helpers';

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

// Protected routes (require authentication)
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
  '/api/backend/getTributes', // Public - tributes are public
  '/api/backend/getTribute', // Public - viewing tribute is public
  '/api/backend/checkAvailability', // Public - checking availability
  '/api/backend/check-availability', // Public - new availability endpoint
];

// ============================================
// MIDDLEWARE FUNCTION
// ============================================

export function middleware(request: NextRequest) {
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
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || null;
    
    if (!token) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Unauthorized. Please login first.',
          error: 'MISSING_TOKEN'
        },
        { status: 401 }
      );
    }
    
    // Verify token using your existing verifyAuth function
    const auth = verifyAuth(request.headers);
    
    if (!auth) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid or expired token. Please login again.',
          error: 'INVALID_TOKEN'
        },
        { status: 401 }
      );
    }
    
    // Token is valid - attach user info to headers for routes to use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', auth.user_id.toString());
    requestHeaders.set('x-user-role', auth.role);
    
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
  // Middleware can't easily access client-side auth state
  return NextResponse.next();
}

// ============================================
// MIDDLEWARE CONFIG
// ============================================

export const config = {
  matcher: [
    /*
     * Match all request paths including API routes
     * Exclude:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

---

## ✅ Step 4: Update Public Endpoints List

### **Review Your Routes:**

Check which endpoints should be public (no auth required):

**Common Public Endpoints:**
- ✅ Login, Register (obviously)
- ✅ Viewing providers/packages (public browsing)
- ✅ Viewing tributes (public memorials)
- ✅ Checking availability (public service)

**Common Protected Endpoints:**
- ❌ Creating bookings (requires login)
- ❌ Managing packages (provider only)
- ❌ Updating profile (user only)
- ❌ Chatbot (may require login for some modes)

### **Update the `publicApiEndpoints` array** in the middleware with your actual public routes.

---

## ✅ Step 5: Test the Middleware

### **Test 1: Public Endpoint (Should Work)**

```bash
# Test login (public)
curl http://localhost:3000/api/backend/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

**Expected:** Should work ✅

---

### **Test 2: Protected Endpoint Without Token (Should Fail)**

```bash
# Test createBooking without token
curl http://localhost:3000/api/backend/createBooking \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"package_id":1}'
```

**Expected:** `401 Unauthorized` with message "Please login first" ✅

---

### **Test 3: Protected Endpoint With Token (Should Work)**

```bash
# First login to get token
TOKEN=$(curl -s http://localhost:3000/api/backend/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"your_username","password":"your_password"}' \
  | jq -r '.token')

# Then use token
curl http://localhost:3000/api/backend/createBooking \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"package_id":1,"customer_name":"Test"}'
```

**Expected:** Should work ✅

---

## ✅ Step 6: Clean Up (Optional)

### **Remove Duplicate Auth Checks:**

Since middleware now handles auth, you can remove manual checks from routes:

**Example - Before:**
```typescript
// getTributes/route.ts
export async function GET(request: NextRequest) {
  const auth = verifyAuth(request.headers); // ← Remove this
  if (!auth) {
    return NextResponse.json({...}, { status: 401 });
  }
  // ... rest of code
}
```

**After:**
```typescript
// getTributes/route.ts
export async function GET(request: NextRequest) {
  // Auth already checked by middleware!
  // Just get user info if needed:
  const userId = request.headers.get('x-user-id');
  // ... rest of code
}
```

**Note:** Only remove if the route is in the protected list. If it's public, keep it as is.

---

## 📋 Implementation Checklist

- [ ] **Step 1:** Backup current `middleware.ts`
- [ ] **Step 2:** Update `middleware.ts` with code above
- [ ] **Step 3:** Review and update `publicApiEndpoints` list
- [ ] **Step 4:** Test public endpoints (should work)
- [ ] **Step 5:** Test protected endpoints without token (should fail with 401)
- [ ] **Step 6:** Test protected endpoints with token (should work)
- [ ] **Step 7:** Test your app normally (should work if logged in)
- [ ] **Step 8:** Optional - Remove duplicate auth checks from routes

---

## 🎯 Benefits

### **Before:**
- ❌ Each route checks auth manually (or doesn't)
- ❌ Easy to forget auth check
- ❌ Inconsistent error messages
- ❌ Code duplication

### **After:**
- ✅ Automatic auth check for all protected routes
- ✅ Consistent error messages
- ✅ Routes focus on business logic
- ✅ Centralized security

---

## ❓ Troubleshooting

### **Issue: All requests return 401**

**Check:**
1. Is the endpoint in `publicApiEndpoints`? (if it should be public)
2. Is the token being sent? (check browser Network tab)
3. Is `verifyAuth()` working correctly?

**Debug:**
```typescript
// Add logging in middleware
console.log('Path:', pathname);
console.log('Token:', token ? 'Present' : 'Missing');
console.log('Auth result:', auth);
```

---

### **Issue: Public endpoint returns 401**

**Solution:** Add it to `publicApiEndpoints` array

---

### **Issue: Protected endpoint works without token**

**Check:**
1. Is middleware running? (check Next.js console)
2. Is the path matching correctly?
3. Is the endpoint in `publicApiEndpoints` by mistake?

---

## 🚀 Next Steps After Implementation

1. ✅ **Test thoroughly** - All routes should work correctly
2. ✅ **Update public endpoints** - Add any routes that should be public
3. ✅ **Monitor logs** - Check for any auth errors
4. ✅ **Optional:** Remove duplicate auth checks from routes
5. ✅ **Optional:** Add rate limiting for production

---

**Ready to implement? Start with Step 1 - backup your current middleware!** 🎯

