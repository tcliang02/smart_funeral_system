# 🚨 CRITICAL: Add Environment Variables to Vercel

## Your deployment URL:
**https://smartfuneralsystem-c5xa1me1e-tan-chia-bi22-2712s-projects.vercel.app**

---

## ⚡ STEP 1: Add Environment Variables (DO THIS NOW!)

1. **Go to Vercel Dashboard:**
   https://vercel.com/tan-chia-bi22-2712s-projects/smart_funeral_system/settings/environment-variables

2. **Click "Add New"** and add these **7 variables** (one by one):

### Variable 1:
- **Name:** `DB_HOST`
- **Value:** `db.wtfngwbynkkmtjcsdqnw.supabase.co`
- **Environments:** ✅ Production ✅ Preview ✅ Development

### Variable 2:
- **Name:** `DB_USER`
- **Value:** `postgres`
- **Environments:** ✅ Production ✅ Preview ✅ Development

### Variable 3:
- **Name:** `DB_PASSWORD`
- **Value:** `9K5XOne9Fwq7Q71o`
- **Environments:** ✅ Production ✅ Preview ✅ Development

### Variable 4:
- **Name:** `DB_NAME`
- **Value:** `postgres`
- **Environments:** ✅ Production ✅ Preview ✅ Development

### Variable 5:
- **Name:** `DB_PORT`
- **Value:** `5432`
- **Environments:** ✅ Production ✅ Preview ✅ Development

### Variable 6:
- **Name:** `JWT_SECRET`
- **Value:** `cNOruspUQwSJWt7ld2GKXqBe9vV5RoEkMz0C1gifPy8hZaIHFTnxmj4YDLb6A3`
- **Environments:** ✅ Production ✅ Preview ✅ Development

### Variable 7:
- **Name:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** `https://wtfngwbynkkmtjcsdqnw.supabase.co`
- **Environments:** ✅ Production ✅ Preview ✅ Development

### Variable 8:
- **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0Zm5nd2J5bmtrbXRqY3NkcW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NjcwODcsImV4cCI6MjA3ODI0MzA4N30.8J-bES2J8VYbuFOb_urIK2cK0qb9QcdYqetVSE02qzE`
- **Environments:** ✅ Production ✅ Preview ✅ Development

---

## ⚡ STEP 2: Redeploy

After adding all variables:

1. Go to: https://vercel.com/tan-chia-bi22-2712s-projects/smart_funeral_system/deployments
2. Click **"..."** on the latest deployment
3. Click **"Redeploy"**
4. Wait 2-3 minutes

---

## ⚡ STEP 3: Test

After redeploy:

1. Visit: `https://smartfuneralsystem-c5xa1me1e-tan-chia-bi22-2712s-projects.vercel.app/api/backend/test-db`
2. Should return: `{"success":true,"message":"Database test successful",...}`

---

## ✅ DONE!

Your website will be online and working!

