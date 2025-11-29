# ✅ Railway Deployment Checklist

## Before You Start
- [ ] Railway account created (https://railway.app)
- [ ] GitHub account ready
- [ ] Supabase password handy
- [ ] 15 minutes available

---

## Step 1: Prepare Backend (Already Done! ✅)
- [x] Dockerfile created
- [x] db_connect.php updated for environment variables
- [x] .railwayignore created
- [x] railway.json config ready

---

## Step 2: Deploy to Railway
- [ ] Push backend to GitHub (or connect existing repo)
- [ ] Create new Railway project
- [ ] Connect GitHub repository
- [ ] Wait for auto-deploy (~2-3 min)
- [ ] Verify deployment logs show success

---

## Step 3: Configure Environment
- [ ] In Railway dashboard, go to Variables tab
- [ ] Add DB_HOST: `wtfngwbynkkmtjcsdqnw.supabase.co`
- [ ] Add DB_USER: `postgres`
- [ ] Add DB_PASSWORD: `<your_supabase_password>`
- [ ] Add DB_NAME: `postgres`
- [ ] Add DB_PORT: `5432`
- [ ] Click "Redeploy" if needed

---

## Step 4: Generate Domain
- [ ] In Railway, go to Settings
- [ ] Click "Generate Domain"
- [ ] Copy your permanent URL (e.g., `your-app.railway.app`)
- [ ] **WRITE IT DOWN** - you'll need it!

---

## Step 5: Test Backend
- [ ] Visit: `https://your-app.railway.app/login.php`
- [ ] Should see JSON response (not 404)
- [ ] Check Railway logs for any errors
- [ ] Test database connection

---

## Step 6: Update Frontend Config
- [ ] Run PowerShell script:
  ```powershell
  .\update-railway-url.ps1 -RailwayURL "https://your-app.railway.app"
  ```
- [ ] OR manually update these 3 files:
  - [ ] `frontend/my-app/src/config.js`
  - [ ] `frontend/my-app/api/login.js`
  - [ ] `frontend/my-app/api/register.js`

---

## Step 7: Deploy Frontend
```powershell
cd frontend/my-app
vercel --prod
```
- [ ] Deployment successful
- [ ] Copy new Vercel URL

---

## Step 8: Final Testing
- [ ] Visit Vercel URL
- [ ] Try logging in (user1/123456)
- [ ] Test Order Services page
- [ ] Create new tribute with image
- [ ] Verify image uploads to Supabase
- [ ] Check all features work

---

## Step 9: Share with Testers
- [ ] Document your permanent URLs:
  - **Frontend**: `https://your-app.vercel.app`
  - **Backend**: `https://your-app.railway.app`
  - **Database**: Supabase (already permanent)
  - **Storage**: Supabase (already permanent)

- [ ] Share Vercel URL with 20 SUS respondents
- [ ] Provide test credentials
- [ ] Set up feedback collection form

---

## Step 10: Monitor
- [ ] Check Railway dashboard for uptime
- [ ] Monitor Supabase usage
- [ ] Review Railway logs if issues occur
- [ ] Track $5 free credit usage

---

## 🎊 Success Criteria

Your system is ready when:
- ✅ Railway URL responds 24/7
- ✅ No computer running required
- ✅ Vercel frontend connects to Railway backend
- ✅ Images upload to Supabase
- ✅ Users can login remotely
- ✅ All features work from any device
- ✅ URL never changes

---

## 💰 Cost Tracking

**Current Status:**
- Supabase: FREE ✅
- Vercel: FREE ✅
- Railway: $5 credit (good for ~1 month of testing) ✅

**After Free Credit:**
- Railway: $5/month
- **Total: $5/month for production**

---

## 🆘 Quick Fixes

**404 on Railway URL:**
```
Check Railway logs → Ensure Dockerfile built successfully
```

**Database Connection Error:**
```
Verify Supabase credentials in Railway env vars
Check Supabase allows Railway connections
```

**Frontend Can't Connect:**
```
Ensure you updated all 3 files with Railway URL
Redeploy frontend with: vercel --prod
```

**Images Not Loading:**
```
Check Supabase Storage bucket is public
Verify VITE_SUPABASE env vars in Vercel
```

---

## 📞 Support

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs

---

**Estimated Total Time: 15-20 minutes**

You're ready! Let's make your system accessible 24/7! 🚀
