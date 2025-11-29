# 🔧 Fix Vercel Root Directory Issue

## ❌ Problem:
Vercel is detecting the wrong root directory, causing: `pages and app directories should be under the same folder`

## ✅ Solution:

### Option 1: Set Root Directory in Vercel Dashboard (RECOMMENDED)

1. **Go to Vercel Dashboard:**
   https://vercel.com/tan-chia-bi22-2712s-projects/smart_funeral_system/settings/general

2. **Scroll to "Root Directory"**
3. **Set it to:** `frontend/my-app`
4. **Click "Save"**
5. **Redeploy**

---

### Option 2: Deploy from Correct Directory

Make sure you're deploying from `frontend/my-app` directory:

```powershell
cd C:\xampp\htdocs\smart_funeral_system\frontend\my-app
vercel --prod
```

---

## ✅ After Fixing:

1. **Add Environment Variables** (if not done):
   - Go to: Settings → Environment Variables
   - Add all 8 variables (see UPDATE_ENV_VARS.md)

2. **Redeploy**
3. **Test**: `https://your-url.vercel.app/api/backend/test-db`

---

**The root directory MUST be set to `frontend/my-app` in Vercel!**














