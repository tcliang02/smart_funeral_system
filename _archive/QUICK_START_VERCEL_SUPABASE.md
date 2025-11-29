# 🚀 Quick Start: Vercel + Supabase Setup

## Architecture Overview

- **Vercel**: Frontend (Next.js) + Backend (API Routes)
- **Supabase**: PostgreSQL Database

## 5-Minute Setup

### Step 1: Supabase Setup (2 minutes)

1. Go to https://supabase.com and create account
2. Click "New Project"
3. Fill in:
   - Project name: `smart-funeral-system`
   - Database password: (save this!)
   - Region: Choose closest to you
4. Wait 2-3 minutes for database to initialize

### Step 2: Get Supabase Credentials (1 minute)

1. In Supabase Dashboard, go to **Settings → Database**
2. Find **Connection String** section
3. Copy the connection string (looks like: `postgres://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres`)
4. Go to **Settings → API**
5. Copy:
   - **Project URL**: `https://[PROJECT-REF].supabase.co`
   - **anon public key**: Long JWT token

### Step 3: Configure Environment Variables (1 minute)

1. Go to `frontend/my-app/`
2. Copy example file:
   ```bash
   cp env.example .env.local
   ```
3. Open `.env.local` and update:
   ```env
   DATABASE_URL=postgres://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres
   JWT_SECRET=generate-random-string-here
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### Step 4: Test Locally (1 minute)

```bash
cd frontend/my-app
npm install
npm run dev
```

Visit: http://localhost:3000/api/backend/test-db

Should see: `{"success":true,"message":"Database connected"}`

### Step 5: Deploy to Vercel (2 minutes)

1. Push to GitHub:
   ```bash
   git add .
   git commit -m "Ready for Vercel"
   git push
   ```

2. Go to https://vercel.com
3. Click "New Project"
4. Import your GitHub repository
5. Configure:
   - **Root Directory**: `frontend/my-app`
   - **Framework**: Next.js (auto-detected)
6. Add Environment Variables:
   - Copy all from `.env.local`
   - Add in Vercel Dashboard → Settings → Environment Variables
7. Click "Deploy"

Done! Your app is live at `https://your-project.vercel.app`

## Verify Deployment

1. Test database: `https://your-app.vercel.app/api/backend/test-db`
2. Test login: Try logging in
3. Check Vercel logs if issues

## Need Help?

- Full guide: `VERCEL_SUPABASE_ARCHITECTURE.md`
- Checklist: `DEPLOYMENT_CHECKLIST_VERCEL_SUPABASE.md`
- Troubleshooting: See architecture guide

---

**Time to deploy: ~5 minutes** ⚡

