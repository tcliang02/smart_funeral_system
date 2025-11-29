# 🚀 Deploy Backend to Railway (Permanent URL Solution)

## Why Railway Instead of Ngrok?
✅ **Permanent URL** - Never changes, even after restarts
✅ **Free Tier** - $5 free credit monthly (enough for testing)
✅ **No Tunnel Required** - Direct cloud hosting
✅ **Always Online** - No need to keep computer running
✅ **Professional** - Production-ready infrastructure

---

## 📋 Prerequisites
- [ ] Railway account (sign up at railway.app)
- [ ] GitHub account
- [ ] Supabase database already set up ✅
- [ ] Backend files ready in `/backend` folder ✅

---

## 🎯 Step-by-Step Deployment

### **Step 1: Create Railway Account**
1. Go to https://railway.app
2. Click "Start a New Project"
3. Sign up with GitHub (recommended)
4. Verify email

### **Step 2: Push Backend to GitHub (if not already)**
```powershell
# In backend folder
cd C:\xampp\htdocs\smart_funeral_system\backend
git init
git add .
git commit -m "Initial backend setup"
git branch -M main

# Create new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/funeral-backend.git
git push -u origin main
```

### **Step 3: Deploy to Railway**
1. In Railway dashboard, click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `funeral-backend` repository
4. Railway will auto-detect the Dockerfile ✅
5. Wait for deployment (2-3 minutes)

### **Step 4: Configure Environment Variables**
In Railway project settings, add these variables:

```
DB_HOST=wtfngwbynkkmtjcsdqnw.supabase.co
DB_USER=postgres
DB_PASSWORD=<your_supabase_password>
DB_NAME=postgres
DB_PORT=5432
```

**Get Supabase Password:**
1. Go to Supabase dashboard
2. Project Settings → Database
3. Copy connection string password

### **Step 5: Get Your Railway URL**
1. In Railway, click on your deployment
2. Go to "Settings" tab
3. Click "Generate Domain"
4. You'll get: `your-app-name.railway.app`
5. **COPY THIS URL** - it's permanent!

### **Step 6: Update Frontend Config**
```javascript
// In frontend/my-app/src/config.js
export const BACKEND_URL = import.meta.env.PROD 
  ? 'https://your-app-name.railway.app'  // ← Paste your Railway URL here
  : 'http://localhost/smart_funeral_system/backend';
```

### **Step 7: Update Serverless Functions**
Update both login.js and register.js:

```javascript
// In frontend/my-app/api/login.js
const BACKEND_URL = 'https://your-app-name.railway.app';  // ← Update here
```

### **Step 8: Redeploy Frontend**
```powershell
cd C:\xampp\htdocs\smart_funeral_system\frontend\my-app
vercel --prod
```

---

## ✅ Testing Checklist

After deployment:

- [ ] Visit your Railway URL: `https://your-app-name.railway.app/login.php`
- [ ] Should see JSON response (not error)
- [ ] Visit Vercel app and try logging in
- [ ] Check browser console for errors
- [ ] Test creating tribute with image upload (Supabase)
- [ ] Test order services page
- [ ] Share URL with test user to verify remote access

---

## 🔧 Troubleshooting

### Railway URL shows 404
- Check deployment logs in Railway dashboard
- Ensure Dockerfile is in backend root
- Verify build completed successfully

### Database Connection Error
- Double-check Supabase credentials in Railway env vars
- Ensure Supabase allows connections from Railway IP
- Check Supabase dashboard for connection errors

### CORS Errors
- All backend PHP files already have CORS headers ✅
- If issues persist, check Railway logs

### Images Not Loading
- Supabase Storage setup is correct ✅
- New tributes should upload to Supabase (permanent)
- Old tributes (if any) may need migration

---

## 💰 Cost Breakdown

**Railway Free Tier:**
- $5 credit per month
- ~500 hours of uptime
- Enough for SUS testing + demo period
- Upgrade to $5/month for production

**Total Cost:**
- Supabase: FREE (25,000 rows, 500MB)
- Vercel: FREE (personal use)
- Railway: FREE for testing
- **Total: $0 during testing phase**

---

## 🎊 Benefits Over Ngrok

| Feature | Ngrok Free | Railway |
|---------|------------|---------|
| URL Changes | ✅ Every restart | ❌ Never |
| Keep Computer On | ✅ Required | ❌ Not needed |
| Cost | Free | Free (then $5/mo) |
| Warning Page | ✅ Yes | ❌ No |
| Production Ready | ❌ No | ✅ Yes |

---

## 📝 Next Steps After Railway Deploy

1. ✅ Test all features with permanent URL
2. ✅ Share URL with 20 SUS respondents
3. ✅ Collect feedback
4. ✅ Monitor Railway logs for issues
5. ✅ Consider upgrading Railway if needed

---

## 🆘 Need Help?

**Railway Docs:** https://docs.railway.app
**Railway Discord:** https://discord.gg/railway
**Supabase Docs:** https://supabase.com/docs

---

**You're almost there!** Railway deployment takes ~15 minutes total, then your system will be accessible 24/7 from anywhere with a permanent URL. 🚀
