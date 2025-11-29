# ✅ FINAL FIX - Set Root Directory in Vercel

## 🎯 The Problem:
Vercel is using the wrong root directory (`frontend/` instead of `frontend/my-app/`)

## ✅ The Solution:

### Step 1: Set Root Directory in Vercel Dashboard

1. **Go to:** https://vercel.com/tan-chia-bi22-2712s-projects/smart_funeral_system/settings/general

2. **Find "Root Directory" section**

3. **Change from:** (empty or `frontend`)
   **Change to:** `frontend/my-app`

4. **Click "Save"**

---

### Step 2: Add Environment Variables (If Not Done)

**Go to:** https://vercel.com/tan-chia-bi22-2712s-projects/smart_funeral_system/settings/environment-variables

**Add/Update these 8 variables:**

1. `DB_HOST` = `db.wtfngwbynkkmtjcsdqnw.supabase.co` ⚠️ **MUST have `db.` prefix!**
2. `DB_USER` = `postgres`
3. `DB_PASSWORD` = `PZNKtuFpEugR4Gwh` (your current password)
4. `DB_NAME` = `postgres`
5. `DB_PORT` = `5432`
6. `JWT_SECRET` = `cNOruspUQwSJWt7ld2GKXqBe9vV5RoEkMz0C1gifPy8hZaIHFTnxmj4YDLb6A3`
7. `NEXT_PUBLIC_SUPABASE_URL` = `https://wtfngwbynkkmtjcsdqnw.supabase.co` (rename from VITE_)
8. `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (your current value) (rename from VITE_)

**Enable for:** Production, Preview, Development

---

### Step 3: Redeploy

1. **Go to:** https://vercel.com/tan-chia-bi22-2712s-projects/smart_funeral_system/deployments
2. **Click "..."** on latest deployment
3. **Click "Redeploy"**
4. **Wait 2-3 minutes**

---

### Step 4: Test

Visit: `https://your-url.vercel.app/api/backend/test-db`

Should return: `{"success":true,...}`

---

## ✅ That's It!

After setting the root directory to `frontend/my-app`, the build will work!














