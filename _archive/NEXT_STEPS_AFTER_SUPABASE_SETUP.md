# ✅ Next Steps After Supabase Storage Setup

## What You've Completed ✅

1. ✅ Created Supabase Storage bucket: `tribute-images` (public)
2. ✅ Set up storage policies for public access
3. ✅ Added service role key to environment variables

## What's Already Done ✅

- ✅ Upload API route created: `/api/backend/uploadFile`
- ✅ Frontend upload code updated to use Supabase
- ✅ Service role key configured in `.env.local`

---

## Step 4: Test the Upload (Do This Now!)

### Option 1: Test via Your App (Recommended)

1. **Start your Next.js dev server:**
   ```bash
   cd frontend/my-app
   npm run dev
   ```

2. **Test upload in your app:**
   - Go to a tribute page
   - Try uploading a portrait photo
   - Or upload a photo in a tribute message
   - Check browser console for any errors

3. **Verify in Supabase:**
   - Go to Supabase Dashboard → Storage → `tribute-images`
   - You should see the uploaded file in `tributes/` folder
   - Click on the file to see the public URL

### Option 2: Test via API Directly

1. **Create a test image file** (or use any image)

2. **Test upload with curl:**
   ```bash
   curl -X POST http://localhost:3000/api/backend/uploadFile \
     -F "file=@test.jpg" \
     -F "type=portrait"
   ```

3. **Expected response:**
   ```json
   {
     "success": true,
     "message": "File uploaded successfully",
     "file_url": "https://wtfngwbynkkmtjcsdqnw.supabase.co/storage/v1/object/public/tribute-images/tributes/portrait_xxx.jpg",
     "filename": "portrait_xxx.jpg",
     "path": "tributes/portrait_xxx.jpg"
   }
   ```

4. **Verify:**
   - Copy the `file_url` from response
   - Open it in a browser - should display the image
   - Check Supabase Storage - file should be there

---

## Step 5: Verify Everything Works

### Checklist:

- [ ] Upload test image via app or API
- [ ] Image appears in Supabase Storage → `tribute-images` → `tributes/`
- [ ] Public URL works (opens image in browser)
- [ ] No errors in browser console
- [ ] No errors in terminal/server logs

### Common Issues & Fixes:

**❌ Error: "Bucket not found"**
- ✅ Solution: Make sure bucket name is exactly `tribute-images`
- ✅ Check: Supabase Dashboard → Storage → bucket exists

**❌ Error: "new row violates row-level security policy"**
- ✅ Solution: Check storage policies are set correctly
- ✅ Make sure bucket is marked as "Public"
- ✅ Verify policy allows `SELECT` for `public` role

**❌ Error: "Invalid API key"**
- ✅ Solution: Check `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
- ✅ Restart dev server after adding env variable

**❌ Upload works but image doesn't display**
- ✅ Check: Image URL is saved to database correctly
- ✅ Verify: URL starts with `https://wtfngwbynkkmtjcsdqnw.supabase.co/...`
- ✅ Test: Open URL directly in browser

---

## Step 6: For Vercel Deployment

When you're ready to deploy:

1. **Add environment variables to Vercel:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all variables from `.env.local`:
     - `DATABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **Important!**
     - `JWT_SECRET`
   - Select environments: **Production, Preview, Development**

2. **Deploy:**
   ```bash
   cd frontend/my-app
   vercel --prod
   ```

3. **Test on production:**
   - Upload an image on your live site
   - Verify it appears in Supabase Storage
   - Check public URL works

---

## Step 7: Migrate Existing Images (Optional)

If you have existing images in `uploads/tributes/`:

### Option A: Manual Migration
1. Go to Supabase Dashboard → Storage → `tribute-images`
2. Click "Upload file"
3. Upload each image manually
4. Copy the public URL
5. Update database: `UPDATE tributes SET photo_url = 'new-supabase-url' WHERE photo_url = 'old-path'`

### Option B: Automated Migration (Future)
- Use migration script in `src/utils/migrateImagesToSupabase.js`
- Run from browser console after deployment

---

## How It Works Now

**Upload Flow:**
```
User uploads image
  ↓
Frontend sends to /api/backend/uploadFile
  ↓
API route uploads to Supabase Storage
  ↓
Returns public Supabase URL
  ↓
Frontend saves URL to database (tributes.photo_url)
  ↓
Image accessible globally via Supabase CDN! 🌍
```

**Display Flow:**
```
Frontend requests tribute
  ↓
Database returns photo_url (Supabase URL)
  ↓
Frontend displays image directly from Supabase
  ↓
No API route needed - direct CDN access! ⚡
```

---

## Summary

✅ **Setup Complete:**
- Supabase Storage bucket created
- Policies configured
- Service role key added
- Upload route ready
- Frontend code updated

⏳ **Next Actions:**
1. **Test upload** (do this now!)
2. **Verify in Supabase** (check storage)
3. **Test public URL** (open in browser)
4. **Deploy to Vercel** (when ready)
5. **Add env vars to Vercel** (before deploying)

---

## 🎉 You're Ready!

Your image upload system is now configured for Vercel! Images will be:
- ✅ Stored permanently in Supabase
- ✅ Accessible from anywhere globally
- ✅ Served via fast CDN
- ✅ Never lost (unlike local storage)

**Test it now and let me know if everything works!** 🚀

