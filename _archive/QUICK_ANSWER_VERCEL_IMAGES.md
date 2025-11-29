# 🚀 Quick Answer: Will Images Work on Vercel?

## ❌ NO - Current Setup Won't Work

**Problem:**
- Your images are saved locally in `uploads/tributes/` folder
- Vercel is **serverless** - filesystem is **NOT persistent**
- Files will be **lost** when function instances restart
- Users **cannot access** images uploaded after deployment

## ✅ YES - With Supabase Storage

**Solution:**
- Upload images to **Supabase Storage** (cloud storage)
- Get **public URLs** that work from anywhere
- Save URLs to database (`tributes.photo_url`)
- Images accessible **globally** via Supabase CDN

---

## What I've Done

✅ **Created:** `/api/backend/uploadFile` route
- Uploads to Supabase Storage
- Returns public URL
- Works on Vercel

✅ **Updated:** Frontend upload calls
- `TributePage.jsx` - Now uses Supabase
- `EditTribute.jsx` - Now uses Supabase

---

## What You Need to Do

### 1. Create Supabase Storage Bucket (5 minutes)

1. Go to Supabase Dashboard → **Storage**
2. Click **New Bucket**
3. Name: `tribute-images`
4. ✅ Check **"Public bucket"**
5. Click **Create**

### 2. Set Public Access Policy

1. Click on `tribute-images` bucket
2. Go to **Policies** tab
3. Add policy:
   - **Name:** `Public Read`
   - **Operation:** `SELECT`
   - **Roles:** `public`

### 3. Test Upload

Upload a photo through your app - it will:
- ✅ Upload to Supabase Storage
- ✅ Get public URL
- ✅ Save URL to database
- ✅ Be accessible from anywhere!

---

## Result

**Before (Local - ❌ Won't work):**
```
Upload → Save to uploads/ → Lost on Vercel
```

**After (Supabase - ✅ Works!):**
```
Upload → Supabase Storage → Public URL → Accessible globally!
```

---

**Once you set up the Supabase bucket, your images will be accessible from anywhere in the world!** 🌍

