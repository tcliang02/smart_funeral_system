# 🏗️ Architecture: Vercel + Supabase

## Overview

This project uses a modern serverless architecture:

- **Vercel**: Hosts both frontend (Next.js React app) and backend (Next.js API routes)
- **Supabase**: PostgreSQL database with built-in authentication and storage

```
┌─────────────────────────────────────────┐
│           Vercel Platform               │
│  ┌───────────────────────────────────┐  │
│  │     Frontend (Next.js App)        │  │
│  │  - React Components               │  │
│  │  - Pages & Routes                 │  │
│  │  - Client-side code               │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │     Backend (Next.js API Routes)  │  │
│  │  - /api/backend/*                 │  │
│  │  - Serverless Functions           │  │
│  │  - Database queries               │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
                    │
                    │ HTTPS
                    ▼
┌─────────────────────────────────────────┐
│         Supabase (PostgreSQL)            │
│  - Database (PostgreSQL)                 │
│  - Connection Pooling                    │
│  - SSL Required                          │
└─────────────────────────────────────────┘
```

## Architecture Benefits

✅ **Serverless**: Auto-scaling, pay-per-use  
✅ **Global CDN**: Fast content delivery  
✅ **Zero DevOps**: No server management  
✅ **Type Safety**: TypeScript throughout  
✅ **Unified Deployment**: Frontend + Backend in one repo  

---

## 📁 Project Structure

```
frontend/my-app/
├── app/                          # Next.js App Router
│   ├── api/                      # Backend API routes
│   │   └── backend/              # All API endpoints
│   │       ├── login/route.ts
│   │       ├── register/route.ts
│   │       ├── getTributes/route.ts
│   │       └── ...
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
│
├── src/                          # Frontend source
│   ├── pages/                    # React pages
│   ├── components/               # React components
│   └── api.js                    # API client
│
├── lib/                          # Shared utilities
│   ├── db.ts                     # Database connection (Supabase)
│   └── helpers.ts                # Helper functions
│
├── vercel.json                   # Vercel configuration
├── next.config.js                # Next.js configuration
└── .env.local                    # Environment variables (gitignored)
```

---

## 🔧 Configuration Files

### 1. `vercel.json`
Routes `/backend/*` requests to Next.js API routes:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "rewrites": [
    {
      "source": "/backend/:path*",
      "destination": "/api/backend/:path*"
    }
  ]
}
```

### 2. `lib/db.ts`
Database connection to Supabase PostgreSQL:

- Uses `pg` (node-postgres) library
- Supports connection string (`DATABASE_URL`) or individual variables
- SSL enabled (required by Supabase)
- Connection pooling configured

### 3. Environment Variables

**Server-side** (used in API routes):
- `DATABASE_URL` - Full Supabase connection string (recommended)
- OR individual: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`
- `JWT_SECRET` - For authentication tokens

**Client-side** (exposed to browser):
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

---

## 🚀 Deployment Steps

### Step 1: Set Up Supabase Database

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create new project
   - Wait for database to initialize

2. **Get Connection Details**
   - Go to: Settings → Database
   - Copy connection string or individual credentials
   - Go to: Settings → API
   - Copy `anon` key

3. **Import Database Schema**
   - Use Supabase SQL Editor
   - Import your database schema
   - Or use migration scripts

### Step 2: Configure Environment Variables

**For Local Development:**

1. Create `.env.local` in `frontend/my-app/`:
   ```bash
   cp env.example .env.local
   ```

2. Update with your Supabase credentials:
   ```env
   # Option 1: Connection String (Recommended)
   DATABASE_URL=postgres://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   
   # Option 2: Individual Variables
   DB_HOST=db.[PROJECT-REF].supabase.co
   DB_USER=postgres
   DB_PASSWORD=your-password
   DB_NAME=postgres
   DB_PORT=5432
   
   # JWT Secret (generate a random string)
   JWT_SECRET=your-very-long-random-secret-key
   
   # Client-side (browser-accessible)
   NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

**For Vercel Deployment:**

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all the same variables from `.env.local`
3. Make sure to add them for **Production**, **Preview**, and **Development** environments

### Step 3: Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Project**
   - **Root Directory**: `frontend/my-app`
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

4. **Add Environment Variables**
   - Add all variables from `.env.local`
   - Use the same values

5. **Deploy!**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-project.vercel.app`

---

## 🔄 API Route Pattern

All backend endpoints follow this pattern:

```typescript
// app/api/backend/[endpoint]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { queryAll, queryOne } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const data = await queryAll('SELECT * FROM table');
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Process request
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
```

**URL Mapping:**
- Frontend calls: `/backend/login`
- Vercel rewrites to: `/api/backend/login`
- Next.js handles: `app/api/backend/login/route.ts`

---

## 📊 Database Connection

### Connection Methods

**Method 1: Connection String (Recommended)**
```env
DATABASE_URL=postgres://postgres:password@db.project.supabase.co:5432/postgres
```

**Method 2: Individual Variables**
```env
DB_HOST=db.project.supabase.co
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=postgres
DB_PORT=5432
```

### Connection Pooling

Supabase offers two connection methods:

1. **Direct Connection** (Port 5432)
   - Host: `db.[project-ref].supabase.co`
   - Use for: Development, low concurrency

2. **Connection Pooler** (Port 6543) - **Recommended for Vercel**
   - Host: `aws-0-[region].pooler.supabase.com`
   - Use for: Production, high concurrency
   - Better for serverless functions

**To use pooler:**
```env
DB_HOST=aws-0-[region].pooler.supabase.com
DB_PORT=6543
```

---

## 🔐 Security Best Practices

1. **Environment Variables**
   - Never commit `.env.local` to git
   - Use Vercel's environment variables for production
   - Rotate secrets regularly

2. **Database Access**
   - Use connection pooling for production
   - Enable SSL (required by Supabase)
   - Use least-privilege database users

3. **API Routes**
   - Validate all inputs
   - Use parameterized queries (prevent SQL injection)
   - Implement rate limiting (Vercel Pro)

4. **CORS**
   - Configure CORS headers in API routes
   - Restrict origins in production

---

## 🧪 Testing Locally

1. **Start Development Server**
   ```bash
   cd frontend/my-app
   npm run dev
   ```

2. **Test API Routes**
   - Visit: http://localhost:3000/api/backend/test-db
   - Should return database connection status

3. **Test Frontend**
   - Visit: http://localhost:3000
   - Test all features

---

## 📝 Migration Checklist

- [ ] Supabase project created
- [ ] Database schema imported
- [ ] Environment variables configured locally
- [ ] Environment variables added to Vercel
- [ ] All API routes converted from PHP to TypeScript
- [ ] Frontend API calls updated to use `/backend/*` endpoints
- [ ] Tested locally
- [ ] Deployed to Vercel
- [ ] Tested production deployment

---

## 🐛 Troubleshooting

### Database Connection Issues

**Error: "Connection refused"**
- Check `DB_HOST` format: Should be `db.[project-ref].supabase.co`
- Verify SSL is enabled in `lib/db.ts`
- Check Supabase project is active

**Error: "Authentication failed"**
- Verify `DB_PASSWORD` is correct
- Check password doesn't have special characters that need URL encoding
- Try using `DATABASE_URL` connection string instead

### Vercel Deployment Issues

**Error: "Build failed"**
- Check `package.json` has correct scripts
- Verify all dependencies are listed
- Check TypeScript errors: `npm run build` locally

**Error: "Environment variable not found"**
- Verify all variables are added in Vercel Dashboard
- Check variable names match exactly (case-sensitive)
- Redeploy after adding variables

### API Route Issues

**Error: "Route not found"**
- Check `vercel.json` rewrites are correct
- Verify route file exists: `app/api/backend/[name]/route.ts`
- Check file exports `GET`, `POST`, etc.

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)

---

## 🎯 Next Steps

1. ✅ Complete API route migration (convert remaining PHP files)
2. ✅ Set up Supabase database
3. ✅ Configure environment variables
4. ✅ Deploy to Vercel
5. ✅ Test production deployment
6. ✅ Set up monitoring and error tracking

---

**Architecture Status:** ✅ Ready for deployment

