# Supabase Image Migration Guide

## Step 1: Create Storage Bucket in Supabase

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on **Storage** in the left sidebar
3. Click **New Bucket**
4. Enter bucket name: `funeral-images`
5. Make it **Public** (check the "Public bucket" option)
6. Click **Create Bucket**

## Step 2: Run Migration

1. **Make sure these are running:**
   - ✅ Ngrok tunnel: `ngrok http 80 --host-header=rewrite`
   - ✅ XAMPP Apache server

2. **Deploy to Vercel:**
   ```bash
   cd frontend/my-app
   vercel --prod
   ```

3. **Access migration page:**
   - Go to: `https://your-vercel-url.vercel.app/migrate-images`
   - Click "Start Migration"
   - Wait for completion

## Step 3: Verify Migration

1. Check Supabase Storage:
   - Go to Storage → funeral-images
   - You should see folders: `tributes/`, `profiles/`
   - Images should have timestamped names

2. Check Tribute Pages:
   - Visit any tribute page
   - Images should load from Supabase URLs (https://wtfngwbynkkmtjcsdqnw.supabase.co/storage/...)

## Step 4: Update Future Uploads

After migration is complete, new tribute photos will automatically use the ngrok URL since we're using `BACKEND_URL`. To make new uploads go directly to Supabase, we'll need to update the upload logic in the backend PHP files.

## Troubleshooting

**Migration fails with "Failed to fetch image":**
- Check ngrok is running
- Check XAMPP is running
- Verify backend URL in migration script

**403 Forbidden errors:**
- Check Supabase bucket is set to Public
- Verify Storage policies allow public read access

**Images still showing localhost URLs:**
- Migration may have failed
- Check browser console for errors
- Re-run migration

## Optional: Update Backend for Direct Supabase Upload

To make future uploads go directly to Supabase (bypass localhost completely), you'll need to:

1. Install Supabase PHP client
2. Update `uploadFile.php` to use Supabase Storage API
3. Store Supabase credentials in PHP config

This is recommended for full production deployment.
