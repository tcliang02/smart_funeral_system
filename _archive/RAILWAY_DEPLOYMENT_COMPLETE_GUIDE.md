# 🚂 Railway Deployment Guide - Smart Funeral System

## ✅ What You Already Have:
- ✅ Railway configuration (`backend/railway.json`)
- ✅ Dockerfile for PHP + MySQL
- ✅ Database environment variables setup
- ✅ 72 PHP backend files ready

---

## 🚀 Step-by-Step Deployment (20 minutes)

### Step 1: Create Railway Account (2 minutes)

1. Go to: https://railway.app
2. Click **"Start a New Project"**
3. Sign in with GitHub
4. You get **$5 free credit** every month

---

### Step 2: Create MySQL Database (3 minutes)

1. In Railway dashboard, click **"+ New"**
2. Select **"Database"** → **"Add MySQL"**
3. Wait for database to provision (30 seconds)
4. Click on MySQL service → **"Variables"** tab
5. **Copy these values:**
   - `MYSQL_HOST`
   - `MYSQL_USER` 
   - `MYSQL_PASSWORD`
   - `MYSQL_DATABASE`
   - `MYSQL_PORT`

---

### Step 3: Deploy Backend to Railway (5 minutes)

#### Option A: Using Railway CLI (Recommended)

```powershell
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Deploy backend
cd c:\xampp\htdocs\smart_funeral_system\backend
railway up
```

#### Option B: Using GitHub (Alternative)

1. Push your code to GitHub
2. In Railway: **"+ New"** → **"GitHub Repo"**
3. Select your repository
4. Railway auto-detects Dockerfile and deploys!

---

### Step 4: Set Environment Variables (3 minutes)

In Railway Dashboard → Backend Service → **"Variables"** tab:

Add these variables (use values from Step 2):

```env
DB_HOST=${MYSQL_HOST}
DB_USER=${MYSQL_USER}
DB_PASSWORD=${MYSQL_PASSWORD}
DB_NAME=${MYSQL_DATABASE}
DB_PORT=${MYSQL_PORT}
```

**Click "Deploy"** to apply changes.

---

### Step 5: Export Your Local Database (5 minutes)

```powershell
# Using MySQL command (if you have it in PATH)
mysqldump -u root smart_funeral_system > database_backup.sql

# OR using HeidiSQL:
# 1. Open HeidiSQL
# 2. Select smart_funeral_system database
# 3. Tools → Export database as SQL
# 4. Save as database_backup.sql
```

---

### Step 6: Import Database to Railway (5 minutes)

#### Option A: Using Railway CLI

```powershell
# Connect to Railway MySQL
railway connect MySQL

# Then run:
source database_backup.sql;
exit;
```

#### Option B: Using MySQL Workbench or HeidiSQL

1. Get connection details from Railway (Step 2)
2. Create new connection:
   - Host: `MYSQL_HOST` from Railway
   - User: `MYSQL_USER`
   - Password: `MYSQL_PASSWORD`
   - Database: `MYSQL_DATABASE`
   - Port: `MYSQL_PORT`
3. Import `database_backup.sql`

---

### Step 7: Get Your Live Backend URL (1 minute)

1. In Railway Dashboard → Backend Service
2. Go to **"Settings"** tab
3. Scroll to **"Domains"**
4. Click **"Generate Domain"**
5. Copy your URL: `https://your-app.railway.app`

---

### Step 8: Update Frontend Configuration (2 minutes)

Update `frontend/my-app/src/config.js`:

```javascript
// API Configuration for deployment
export const API_BASE_URL = import.meta.env.PROD 
  ? 'https://your-app.railway.app'  // 👈 Your Railway backend URL
  : '/backend';  // Local development

export const BACKEND_URL = import.meta.env.PROD 
  ? 'https://your-app.railway.app'  // 👈 Your Railway backend URL
  : 'http://localhost/smart_funeral_system/backend';
```

---

### Step 9: Deploy Frontend to Vercel (3 minutes)

```powershell
cd c:\xampp\htdocs\smart_funeral_system\frontend\my-app
vercel --prod
```

**Done!** Your app is now live! 🎉

---

## 🧪 Testing Your Deployment

1. Visit your Vercel URL: https://your-app.vercel.app
2. Try logging in with: `user1` / your password
3. Test creating a tribute
4. Check if data is saved in Railway MySQL

---

## 💰 Cost Tracking

Railway Free Tier:
- **$5 credit/month**
- **~550 hours** of uptime
- **Perfect for testing** (20 respondents)

**Monitor usage:** https://railway.app/account/usage

---

## 📊 Your Architecture

```
User → Vercel (React Frontend)
       ↓
Railway Backend (PHP + Apache)
       ↓  
Railway MySQL (Database)
```

**Two separate services:**
- Frontend: Vercel (free forever)
- Backend + DB: Railway (free $5/month)

---

## 🆘 Troubleshooting

**Backend not connecting to database:**
→ Check environment variables in Railway

**CORS errors:**
→ Your PHP files already have CORS headers

**Database import fails:**
→ Make sure MySQL service is running in Railway

---

## ✅ Success Checklist

- [ ] Railway account created
- [ ] MySQL database provisioned
- [ ] Backend deployed to Railway
- [ ] Environment variables set
- [ ] Local database exported
- [ ] Database imported to Railway
- [ ] Backend URL generated
- [ ] Frontend updated with Railway URL
- [ ] Frontend deployed to Vercel
- [ ] Login tested successfully

---

**You're done! Everything is on Railway + Vercel with $0 ongoing cost (within free tier)! 🚀**
