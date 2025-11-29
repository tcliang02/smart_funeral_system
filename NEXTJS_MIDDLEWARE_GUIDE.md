# 🛡️ Next.js API Route Authentication - Step by Step

## 🎯 What We're Building

**Goal:** Create a centralized authentication middleware that protects all your API routes automatically.

**Current Problem:**
- Each route checks auth manually (or doesn't check at all)
- Code is duplicated across routes
- Easy to forget to add auth to new routes

**Solution:**
- Create ONE middleware file
- It runs BEFORE every API request
- Automatically checks authentication
- Routes don't need to check auth themselves

---

## 📊 How It Works

### **Before (Current):**
```
Request → Route Handler → Check Auth → Process Request
```

**Problem:** Each route has to remember to check auth

### **After (With Middleware):**
```
Request → Middleware (checks auth) → Route Handler → Process Request
```

**Benefit:** Auth is checked automatically, routes just process the request

---

## ✅ Step 1: Understand Your Current Setup

### **What You Already Have:**

1. **JWT Token Generation:**
   - `generateToken()` in `@/lib/helpers`
   - Used in `/api/backend/login`

2. **JWT Token Verification:**
   - `verifyAuth()` in `@/lib/helpers`
   - Used in `/api/backend/verifyAuth`

3. **Some Routes Check Auth:**
   - `chatbot/route.ts` checks `hasAccess()`
   - But most routes don't check auth

### **What We Need:**
- Create `middleware.ts` that uses your existing `verifyAuth()` function
- Automatically protect all routes (except public ones)

---

## ✅ Step 2: Create the Middleware File

### **Location:** `frontend/my-app/src/middleware.ts`

**What it does:**
1. Intercepts ALL requests to `/api/backend/*`
2. Checks if endpoint is public (login, register, etc.)
3. If protected, verifies JWT token
4. Allows request to continue if auth is valid
5. Blocks request if auth is invalid

---

## ✅ Step 3: Implementation Code

### **File: `frontend/my-app/src/middleware.ts`**

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/helpers';

// List of public endpoints (no authentication required)
const publicEndpoints = [
  '/api/backend/login',
  '/api/backend/register',
  '/api/backend/verifyAuth', // This endpoint verifies auth itself
  '/api/backend/getAllProviders', // Public - anyone can see providers
  '/api/backend/getAllPackages', // Public - anyone can see packages
  '/api/backend/getTributes', // Public - tributes are public
  '/api/backend/getTribute', // Public - viewing tribute is public
  '/api/backend/checkAvailability', // Public - checking availability is public
];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Skip auth check for public endpoints
  if (publicEndpoints.some(endpoint => path.startsWith(endpoint))) {
    return NextResponse.next();
  }
  
  // Get JWT token from Authorization header
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
  // Note: verifyAuth expects headers object, so we need to create one
  const headers = new Headers();
  headers.set('authorization', `Bearer ${token}`);
  
  const auth = verifyAuth(headers);
  
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
  
  // Token is valid - allow request to continue
  // You can also attach user info to request headers for routes to use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', auth.user_id.toString());
  requestHeaders.set('x-user-role', auth.role);
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Configure which routes this middleware runs on
export const config = {
  matcher: [
    '/api/backend/:path*', // All routes under /api/backend/*
  ],
};
```

---

## ✅ Step 4: Update Your Helpers (If Needed)

### **Check: Does `verifyAuth()` work with Headers object?**

Look at `frontend/my-app/src/lib/helpers.ts`:

```typescript
// It should accept Headers or headers object
export function verifyAuth(headers: Headers | { get: (key: string) => string | null }) {
  // Your existing implementation
}
```

**If it doesn't accept Headers, we'll need to adapt it.**

---

## ✅ Step 5: Test the Middleware

### **Test 1: Public Endpoint (Should Work)**

```bash
# Test login (public endpoint)
curl http://localhost:3000/api/backend/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

**Expected:** Should work (no auth required) ✅

---

### **Test 2: Protected Endpoint Without Token (Should Fail)**

```bash
# Test createBooking without token
curl http://localhost:3000/api/backend/createBooking \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"package_id":1}'
```

**Expected:** `401 Unauthorized` ✅

---

### **Test 3: Protected Endpoint With Token (Should Work)**

```bash
# First, login to get token
TOKEN=$(curl -s http://localhost:3000/api/backend/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}' | jq -r '.token')

# Then use token for protected endpoint
curl http://localhost:3000/api/backend/createBooking \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"package_id":1,"customer_name":"Test"}'
```

**Expected:** Should work (with valid token) ✅

---

## ✅ Step 6: Update Routes to Use User Info (Optional)

### **Routes can now access user info from headers:**

```typescript
// In any route handler
export async function POST(request: NextRequest) {
  // Get user info from headers (set by middleware)
  const userId = request.headers.get('x-user-id');
  const userRole = request.headers.get('x-user-role');
  
  // Use in your logic
  if (userRole !== 'provider') {
    return NextResponse.json(
      { success: false, message: 'Provider access required' },
      { status: 403 }
    );
  }
  
  // Continue with route logic...
}
```

---

## 📋 Step-by-Step Checklist

### **Implementation:**

- [ ] **Step 1:** Check `verifyAuth()` function signature in `@/lib/helpers`
- [ ] **Step 2:** Create `frontend/my-app/src/middleware.ts` with code above
- [ ] **Step 3:** Update `publicEndpoints` list with your actual public routes
- [ ] **Step 4:** Test public endpoints (should work)
- [ ] **Step 5:** Test protected endpoints without token (should fail with 401)
- [ ] **Step 6:** Test protected endpoints with token (should work)
- [ ] **Step 7:** Remove manual auth checks from individual routes (optional cleanup)

---

## 🎯 Benefits

### **Before Middleware:**
- ❌ Each route checks auth manually
- ❌ Easy to forget auth check
- ❌ Code duplication
- ❌ Inconsistent error messages

### **After Middleware:**
- ✅ Centralized auth check
- ✅ Automatic protection
- ✅ Consistent error messages
- ✅ Routes focus on business logic

---

## ❓ Common Questions

### **Q: What if a route needs different auth logic?**
**A:** You can still check auth manually in that route. Middleware is a baseline check.

### **Q: What if I want to allow some routes for specific roles only?**
**A:** You can check `x-user-role` header in the route handler, or add role checking to middleware.

### **Q: Will this break my existing routes?**
**A:** No, if they already send tokens, they'll work. If they don't send tokens, they'll get 401 (which is correct).

---

## 🚀 Next Steps After Middleware

1. ✅ **Test thoroughly** - Make sure all routes work
2. ✅ **Update public endpoints list** - Add any routes that should be public
3. ✅ **Optional:** Remove duplicate auth checks from routes
4. ✅ **Optional:** Add rate limiting
5. ✅ **Optional:** Add logging for security events

---

**Ready to implement? Start with Step 1 - check your `verifyAuth()` function!** 🎯

