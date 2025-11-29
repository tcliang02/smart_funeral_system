# 🔍 Debug: API Returning HTML Instead of JSON

## Problem

The error "Unexpected token '<', "<!DOCTYPE "... is not valid JSON" means the API is returning an HTML error page instead of JSON.

## Most Likely Causes

1. **API Route is Crashing** - Check your terminal where `npm run dev` is running for error messages
2. **Path Alias Not Resolving** - The `@/lib/db` import might not be working
3. **Database Connection Error** - The route might be crashing when connecting to the database

## Quick Debug Steps

### 1. Check Server Logs

Look at your terminal where `npm run dev` is running. You should see error messages like:
```
Error: Cannot find module '@/lib/db'
```
or
```
Database connection error: ...
```

### 2. Test Database Connection First

Before testing login, verify the database connection works:
- Visit: http://localhost:3000/api/backend/test-db
- Should return JSON, not HTML

### 3. Check Browser Network Tab

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Try to login
4. Click on the `/api/backend/login` request
5. Check the **Response** tab - is it HTML or JSON?

### 4. Common Fixes

**If path alias is the issue:**
- The `@/lib/db` might not resolve from `src/app/api/backend/login/route.ts`
- Try changing the import to a relative path: `import { queryOne } from '../../../../lib/db';`

**If database connection is the issue:**
- Check `.env.local` has the correct `DATABASE_URL`
- Restart the dev server after changing `.env.local`

## Next Steps

1. **Check your terminal** for error messages
2. **Share the error** you see in the terminal
3. **Check browser Network tab** to see the actual response

---

**The server logs will tell us exactly what's wrong!** 🔍

