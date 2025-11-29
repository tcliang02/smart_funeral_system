# 📸 Image Upload Setup for Vercel + Supabase

## ⚠️ Important: Why Local Storage Won't Work on Vercel

**Vercel is serverless:**
- ❌ Filesystem is **NOT persistent**
- ❌ Files uploaded to one function instance won't be available to others
- ❌ Files will be **lost** when function instance is destroyed
- ❌ Your current `/api/uploads/[...path]` route reads from local filesystem (won't work)

## ✅ Solution: Use Supabase Storage

**Supabase Storage:**
- ✅ **Persistent** - Files stored permanently
- ✅ **Public URLs** - Accessible from anywhere online
- ✅ **CDN-backed** - Fast global access
- ✅ **Works with Vercel** - Perfect for serverless

---

## Step 1: Create Supabase Storage Bucket

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **Storage** in the left sidebar
4. Click **New Bucket**
5. Enter bucket name: `tribute-images`
6. ✅ **Check "Public bucket"** (important!)
7. Click **Create Bucket**

---

## Step 2: Set Up Storage Policies (Public Access)

1. In Storage, click on `tribute-images` bucket
2. Go to **Policies** tab
3. Click **New Policy**
4. Select **For full customization**
5. Add this policy:

```sql
-- Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'tribute-images');

-- Allow authenticated uploads
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'tribute-images' AND
  auth.role() = 'authenticated'
);
```

Or use the **Simple** option:
- **Policy name:** `Public Read`
- **Allowed operation:** `SELECT`
- **Target roles:** `public`
- **USING expression:** `bucket_id = 'tribute-images'`

---

## Step 3: Add Environment Variable (Optional)

For better security, add a service role key (optional for public bucket):

1. Go to **Settings** → **API**
2. Copy **Service Role Key** (keep this secret!)
3. Add to Vercel environment variables:
   - `SUPABASE_SERVICE_ROLE_KEY` = `your-service-role-key`

**Note:** For public buckets, the anon key works fine for uploads.

---

## Step 4: Update Frontend Upload Code

The new API route `/api/backend/uploadFile` is ready! It:
- ✅ Accepts file uploads
- ✅ Uploads to Supabase Storage
- ✅ Returns public URL
- ✅ Works on Vercel

**Update your frontend upload code:**

```javascript
// Example: Upload portrait photo
const formData = new FormData();
formData.append('file', file);
formData.append('type', 'portrait');

const response = await fetch('/api/backend/uploadFile', {
  method: 'POST',
  body: formData
});

const data = await response.json();
if (data.success) {
  // data.file_url is the Supabase public URL
  // Save this to database: tributes.photo_url = data.file_url
  console.log('Image URL:', data.file_url);
}
```

---

## Step 5: How Images Are Accessed

**After upload:**
- **Supabase URL:** `https://[project].supabase.co/storage/v1/object/public/tribute-images/tributes/portrait_xxx.jpg`
- **Saved to database:** `tributes.photo_url` = full Supabase URL
- **Displayed in frontend:** Direct Supabase URL (no API route needed!)

**Benefits:**
- ✅ **Accessible from anywhere** - Public URLs work globally
- ✅ **Fast** - CDN-backed delivery
- ✅ **Persistent** - Never lost
- ✅ **Scalable** - Handles millions of images

---

## Step 6: Migrate Existing Images (Optional)

If you have existing images in `uploads/tributes/`, you can migrate them:

1. Use the migration script in `src/utils/migrateImagesToSupabase.js`
2. Or manually upload via Supabase Dashboard
3. Update database `photo_url` columns to Supabase URLs

---

## Testing

1. **Upload a test image:**
   ```bash
   curl -X POST http://localhost:3000/api/backend/uploadFile \
     -F "file=@test.jpg" \
     -F "type=portrait"
   ```

2. **Check Supabase Storage:**
   - Go to Storage → tribute-images
   - You should see the uploaded file

3. **Verify public URL:**
   - Copy the public URL from Supabase
   - Open in browser - should display image

---

## Summary

✅ **Before (Local - Won't work on Vercel):**
- Upload → Save to `uploads/tributes/` → Serve via `/api/uploads/...`
- ❌ Files lost on Vercel

✅ **After (Supabase - Works on Vercel):**
- Upload → Save to Supabase Storage → Get public URL → Save URL to database
- ✅ Files accessible from anywhere, forever!

---

**Your images will be accessible from anywhere once uploaded to Supabase Storage!** 🌍

