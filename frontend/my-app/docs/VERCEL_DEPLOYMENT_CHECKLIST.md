# 🚀 Vercel Deployment Checklist - Frontend + Backend + Supabase

## ✅ Your Setup:
- **Frontend**: Next.js (will be on Vercel)
- **Backend**: Next.js API Routes (will be on Vercel)
- **Database**: Supabase PostgreSQL (already online)

---

## 📋 Step 1: Deploy to Vercel

### Option A: Using Vercel CLI (Fastest)

```powershell
cd C:\xampp\htdocs\smart_funeral_system\frontend\my-app
vercel --prod
```

### Option B: Using Vercel Dashboard

1. Go to: https://vercel.com/dashboard
2. Click "Add New Project"
3. Import from GitHub (or drag & drop folder)
4. **IMPORTANT**: Set **Root Directory** to: `frontend/my-app`
5. Click "Deploy"

---

## 📋 Step 2: Add Environment Variables (CRITICAL!)

**⚠️ Your backend won't work without these!**

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to: **Settings** → **Environment Variables**
4. Add these **7 variables** (for Production, Preview, AND Development):

### Database Connection (for Next.js API routes):
```
DB_HOST=db.wtfngwbynkkmtjcsdqnw.supabase.co
DB_USER=postgres
DB_PASSWORD=9K5XOne9Fwq7Q71o
DB_NAME=postgres
DB_PORT=5432
```

### JWT Secret:
```
JWT_SECRET=cNOruspUQwSJWt7ld2GKXqBe9vV5RoEkMz0C1gifPy8hZaIHFTnxmj4YDLb6A3
```

### Supabase Client (for frontend):
```
NEXT_PUBLIC_SUPABASE_URL=https://wtfngwbynkkmtjcsdqnw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0Zm5nd2J5bmtrbXRqY3NkcW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NjcwODcsImV4cCI6MjA3ODI0MzA4N30.8J-bES2J8VYbuFOb_urIK2cK0qb9QcdYqetVSE02qzE
```

5. **Click "Save"** for each variable
6. **Select all environments** (Production, Preview, Development) for each variable

---

## 📋 Step 3: Import Database to Supabase

Your Supabase database needs your tables!

1. Go to: https://supabase.com/dashboard/project/wtfngwbynkkmtjcsdqnw
2. Click **"SQL Editor"** (left sidebar)
3. Click **"New Query"**
4. Open: `C:\xampp\htdocs\smart_funeral_system\SUPABASE_COMPLETE_IMPORT.sql`
5. Copy **ALL** contents
6. Paste into Supabase SQL Editor
7. Click **"Run"** (or press Ctrl+Enter)
8. Wait for "Success" message

---

## 📋 Step 4: Redeploy After Adding Env Vars

1. Go to Vercel Dashboard → **Deployments**
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete (2-3 minutes)

---

## ✅ Step 5: Test Your Backend

After deployment, test your API:

1. Visit: `https://your-project.vercel.app/api/backend/test-db`
2. Should return: `{"success":true,"message":"Database test successful",...}`
3. If error: Check Vercel logs (Deployments → Click deployment → Logs)

---

## 🔧 Troubleshooting

### Backend Returns 500 Error?

1. **Check Vercel Logs**:
   - Go to: Deployments → Click deployment → Logs
   - Look for database connection errors

2. **Verify Environment Variables**:
   - Settings → Environment Variables
   - Make sure all 7 variables are added
   - Make sure they're enabled for "Production"

3. **Check Database Connection**:
   - Verify Supabase database has tables (Step 3)
   - Test connection: Visit `/api/backend/test-db`

### Database Connection Error?

- ✅ Environment variables are correct
- ✅ Supabase database has tables
- ✅ Wait 2-3 minutes after adding env vars (they need to redeploy)

### Still Not Working?

1. Check browser console (F12) for errors
2. Check Vercel function logs
3. Verify Supabase connection string is correct

---

## 🎉 Success!

Once deployed:
- ✅ Frontend: `https://your-project.vercel.app`
- ✅ Backend API: `https://your-project.vercel.app/api/backend/*`
- ✅ Database: Supabase (connected automatically)

**Your website is now online and accessible from anywhere!** 🌍

---

## 📝 Quick Reference

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard/project/wtfngwbynkkmtjcsdqnw
- **Environment Variables**: Vercel → Project → Settings → Environment Variables

