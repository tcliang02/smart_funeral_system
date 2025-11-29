# 🚀 Next.js Setup Instructions

## Step 1: Install Dependencies

```bash
cd frontend/my-app

# Install Next.js and required packages
npm install next@latest react@latest react-dom@latest
npm install pg @types/pg bcryptjs @types/bcryptjs
npm install --save-dev typescript @types/node @types/react @types/react-dom
```

## Step 2: Update package.json

Replace your current `package.json` scripts with:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

Or use the provided `package-nextjs.json` as reference.

## Step 3: Create Next.js Structure

1. **Create `app` directory** (Next.js App Router):
   ```
   frontend/my-app/
   ├── app/
   │   ├── api/
   │   │   └── backend/
   │   ├── layout.tsx
   │   └── page.tsx
   ├── lib/
   │   ├── db.ts
   │   └── helpers.ts
   └── components/ (keep existing)
   ```

2. **Move your React pages**:
   - Convert `src/pages/*.jsx` → `app/*/page.tsx`
   - Or keep using `src/pages` with Pages Router (simpler migration)

## Step 4: Environment Variables

Create `.env.local`:

```env
# Supabase Database
DB_HOST=your-supabase-host.supabase.co
DB_USER=postgres
DB_PASSWORD=your-password
DB_NAME=postgres
DB_PORT=5432

# JWT Secret
JWT_SECRET=your-secret-key-here

# Supabase Client (if using Supabase JS)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**For Vercel**: Add these in Vercel Dashboard → Settings → Environment Variables

## Step 5: Convert React App

### Option A: Keep Pages Router (Easier)
1. Create `pages/` directory
2. Move `src/pages/*.jsx` → `pages/*.tsx`
3. Update imports

### Option B: Use App Router (Modern)
1. Create `app/` directory
2. Convert pages to `app/[route]/page.tsx`
3. Update routing

## Step 6: Convert API Routes

I've created examples:
- ✅ `app/api/backend/login/route.ts`
- ✅ `app/api/backend/register/route.ts`
- ✅ `app/api/backend/getTributes/route.ts`
- ✅ `app/api/backend/getAllPackages/route.ts`

**Pattern for other endpoints:**
```typescript
// app/api/backend/[endpoint]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { queryAll, queryOne } from '@/lib/db';

export async function GET(request: NextRequest) {
  // Your logic here
  const data = await queryAll('SELECT * FROM table');
  return NextResponse.json({ success: true, data });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  // Your logic here
  return NextResponse.json({ success: true });
}
```

## Step 7: Update Frontend API Calls

Update `src/api.js` to use new endpoints:

```javascript
// Before: /backend/login.php
// After: /api/backend/login (or /backend/login with rewrite)

export const API_BASE_URL = '/api/backend';
```

## Step 8: Test Locally

```bash
npm run dev
```

Visit: http://localhost:3000

## Step 9: Deploy to Vercel

1. **Push to GitHub**
2. **Connect to Vercel**:
   - Go to vercel.com
   - Import your repository
   - Vercel will auto-detect Next.js

3. **Add Environment Variables** in Vercel Dashboard

4. **Deploy!**

## Migration Checklist

- [ ] Install Next.js dependencies
- [ ] Create `app/` or `pages/` directory
- [ ] Move React components
- [ ] Convert critical API routes (login, register, getTributes, etc.)
- [ ] Update `src/api.js` endpoints
- [ ] Set environment variables
- [ ] Test locally
- [ ] Deploy to Vercel
- [ ] Test production deployment

## Remaining Work

You have ~70 PHP files to convert. Priority order:

1. ✅ Login
2. ✅ Register  
3. ✅ GetTributes
4. ✅ GetAllPackages
5. ⏳ GetProviders
6. ⏳ GetPackages
7. ⏳ CreateBooking
8. ⏳ ... (rest of endpoints)

**Tip**: Convert endpoints as you need them, or convert all at once following the pattern I've shown.

## Need Help?

The pattern is the same for all endpoints:
1. Create `app/api/backend/[name]/route.ts`
2. Import database helpers
3. Convert PHP logic to TypeScript
4. Return NextResponse.json()

