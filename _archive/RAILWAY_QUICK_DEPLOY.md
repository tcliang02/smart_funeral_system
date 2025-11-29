# 🚀 Railway Import & Deploy - Quick Steps

## ✅ You Have:
- Railway MySQL database (credentials received)
- Database backup: `database_backup.sql`
- Railway CLI installed

---

## 🎯 Next Steps (10 minutes)

### Step 1: Import Database to Railway (5 minutes)

#### Option A: Using Railway CLI (Recommended)

```powershell
# 1. Navigate to backend
cd c:\xampp\htdocs\smart_funeral_system\backend

# 2. Connect to Railway MySQL
railway connect MySQL

# 3. In the MySQL prompt, run:
USE railway;
SOURCE c:/xampp/htdocs/smart_funeral_system/database_backup.sql;
SHOW TABLES;
EXIT;
```

#### Option B: Using Automated Script

```powershell
cd c:\xampp\htdocs\smart_funeral_system
.\import-to-railway.ps1
```

---

### Step 2: Set Environment Variables in Railway Dashboard (2 minutes)

1. Go to: https://railway.app/dashboard
2. Select your **Backend** service (not MySQL)
3. Go to **Variables** tab
4. Add these variables:

```env
DB_HOST=mysql.railway.internal
DB_USER=root
DB_PASSWORD=SjGGZXZkqBcQkvsdubCUethcNxEmxDJG
DB_NAME=railway
DB_PORT=3306
```

5. Click **"Deploy"** to apply changes

---

### Step 3: Deploy Backend to Railway (3 minutes)

```powershell
cd c:\xampp\htdocs\smart_funeral_system\backend
railway up
```

Wait for deployment to complete...

---

### Step 4: Get Your Backend URL (1 minute)

1. In Railway Dashboard → Your Backend Service
2. Go to **Settings** tab
3. Scroll to **Networking** → **Public Networking**
4. Click **"Generate Domain"**
5. Copy your URL: `https://your-backend.railway.app`

---

### Step 5: Update Frontend Configuration (2 minutes)

Edit `frontend/my-app/src/config.js`:

```javascript
// API Configuration for deployment
export const API_BASE_URL = import.meta.env.PROD 
  ? 'https://your-backend.railway.app'  // 👈 PASTE YOUR RAILWAY URL HERE
  : '/backend';

export const BACKEND_URL = import.meta.env.PROD 
  ? 'https://your-backend.railway.app'  // 👈 PASTE YOUR RAILWAY URL HERE
  : 'http://localhost/smart_funeral_system/backend';
```

---

### Step 6: Deploy Frontend to Vercel (2 minutes)

```powershell
cd c:\xampp\htdocs\smart_funeral_system\frontend\my-app
vercel --prod
```

---

## 🧪 Testing

1. Visit your Vercel URL
2. Try logging in with `user1`
3. Check if data loads from Railway MySQL

---

## ✅ Success Checklist

- [ ] Database imported to Railway MySQL
- [ ] Environment variables set in Railway backend
- [ ] Backend deployed to Railway
- [ ] Backend URL generated
- [ ] Frontend config updated with Railway URL
- [ ] Frontend deployed to Vercel
- [ ] Login tested successfully

---

## 🎊 What You'll Have:

```
Users → Vercel (Frontend - FREE)
         ↓
      Railway Backend (PHP - $5/month free credit)
         ↓
      Railway MySQL (Database - included)
```

**Cost: $0** (within free tier)
**Uptime: 24/7**
**Access: Anywhere, anytime**

---

**Ready? Run Step 1 to import your database!** 🚀
