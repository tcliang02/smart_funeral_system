# 🚀 Deploy Your Website Online - Complete Guide

## ✅ What You'll Get:
- **Live website** accessible from anywhere, anytime
- **Next.js frontend** on Vercel (fast, global CDN)
- **Supabase database** (works perfectly from Vercel servers)
- **Free hosting** (Vercel free tier is generous)

---

## 📋 Step 1: Prepare Your Code

Your code is already set up! ✅
- Next.js API routes are ready
- Supabase connection configured
- All files are in place

---

## 📋 Step 2: Push to GitHub

1. **Open terminal** in your project folder:
   ```powershell
   cd C:\xampp\htdocs\smart_funeral_system\frontend\my-app
   ```

2. **Initialize git** (if not already done):
   ```powershell
   git init
   git add .
   git commit -m "Ready for deployment"
   ```

3. **Create GitHub repository**:
   - Go to: https://github.com/new
   - Name it: `smart-funeral-system` (or any name)
   - Click "Create repository"

4. **Push your code**:
   ```powershell
   git remote add origin https://github.com/YOUR_USERNAME/smart-funeral-system.git
   git branch -M main
   git push -u origin main
   ```
   (Replace `YOUR_USERNAME` with your GitHub username)

---

## 📋 Step 3: Deploy to Vercel

1. **Go to Vercel**: https://vercel.com
2. **Sign up/Login** (use GitHub account - it's free)
3. **Click "Add New Project"**
4. **Import your GitHub repository**:
   - Select `smart-funeral-system`
   - Click "Import"
5. **Configure project**:
   - **Root Directory**: `frontend/my-app` (IMPORTANT!)
   - **Framework Preset**: Next.js (auto-detected)
   - Click "Deploy"

---

## 📋 Step 4: Add Environment Variables (CRITICAL!)

**⚠️ Your website won't work without these!**

1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables

2. **Add these variables** (for Production, Preview, AND Development):

   ```
   DB_HOST=db.wtfngwbynkkmtjcsdqnw.supabase.co
   DB_USER=postgres
   DB_PASSWORD=9K5XOne9Fwq7Q71o
   DB_NAME=postgres
   DB_PORT=5432
   JWT_SECRET=cNOruspUQwSJWt7ld2GKXqBe9vV5RoEkMz0C1gifPy8hZaIHFTnxmj4YDLb6A3
   NEXT_PUBLIC_SUPABASE_URL=https://wtfngwbynkkmtjcsdqnw.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0Zm5nd2J5bmtrbXRqY3NkcW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NjcwODcsImV4cCI6MjA3ODI0MzA4N30.8J-bES2J8VYbuFOb_urIK2cK0qb9QcdYqetVSE02qzE
   ```

3. **Click "Save"** for each variable

4. **Redeploy**:
   - Go to "Deployments" tab
   - Click "..." on latest deployment
   - Click "Redeploy"

---

## 📋 Step 5: Import Database to Supabase

Your Supabase database needs your tables! 

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard/project/wtfngwbynkkmtjcsdqnw
2. **Click "SQL Editor"** (left sidebar)
3. **Click "New Query"**
4. **Copy and paste** your SQL file:
   - Open: `C:\xampp\htdocs\smart_funeral_system\SUPABASE_COMPLETE_IMPORT.sql`
   - Copy all contents
   - Paste into Supabase SQL Editor
   - Click "Run" (or press Ctrl+Enter)

---

## ✅ Done! Your Website is Live!

After deployment:
- **Your URL**: `https://your-project-name.vercel.app`
- **Users can access** from anywhere in the world
- **Auto-updates** when you push to GitHub

---

## 🔧 Troubleshooting

### Database Connection Error?
- ✅ Check environment variables in Vercel
- ✅ Make sure Supabase database has tables (Step 5)
- ✅ Wait 2-3 minutes after adding env vars (they need to redeploy)

### Still Not Working?
1. Check Vercel deployment logs (Deployments → Click deployment → Logs)
2. Check browser console (F12) for errors
3. Verify Supabase connection string is correct

---

## 🎉 Next Steps

- **Custom Domain**: Add your own domain in Vercel Settings
- **Auto Deploy**: Every push to GitHub auto-deploys
- **Monitor**: Check Vercel Analytics for traffic

---

**Need Help?** Check Vercel docs: https://vercel.com/docs

