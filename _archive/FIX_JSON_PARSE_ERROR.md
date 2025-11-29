# 🔧 Fix: "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"

## Problem

The API is returning HTML (likely an error page) instead of JSON. This happens when:
1. The API route crashes and Next.js returns an error page
2. The route path is incorrect
3. There's a build/compilation error

## Debugging Steps

### 1. Check Browser Console

Open browser DevTools (F12) and check:
- **Network tab**: See what URL is being called and what response is returned
- **Console tab**: Look for any error messages

### 2. Check Server Logs

Look at your terminal where `npm run dev` is running. You should see:
- Any compilation errors
- Any runtime errors from the API route

### 3. Test API Route Directly

Try accessing the API route directly in your browser or with curl:
```
http://localhost:3000/api/backend/login
```

If it returns HTML, the route is crashing.

### 4. Common Causes

**Path Alias Issue:**
- The `@/lib/db` import might not be resolving correctly
- Check if `lib/db.ts` exists at the root level

**Database Connection Error:**
- The route might be crashing when trying to connect to the database
- Check server logs for database connection errors

**Missing Dependencies:**
- `bcryptjs`, `pg`, or other dependencies might not be installed
- Run: `npm install`

## Quick Fix

1. **Check server logs** for the actual error
2. **Verify the route exists**: `src/app/api/backend/login/route.ts`
3. **Test the database connection**: http://localhost:3000/api/backend/test-db
4. **Check browser Network tab** to see the actual response

---

**Share the server logs or browser console errors for more specific help!**

