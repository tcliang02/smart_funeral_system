# ✅ Service Role Key Added

## What I Did

✅ **Added `SUPABASE_SERVICE_ROLE_KEY` to your `.env.local` file**

This key is used for:
- **File uploads** to Supabase Storage
- **Server-side operations** that bypass Row Level Security (RLS)
- **Admin operations** in API routes

---

## ⚠️ IMPORTANT SECURITY NOTES

### 1. **Never Commit This Key to Git**
- ✅ `.env.local` is already in `.gitignore` (safe)
- ❌ **Never** add this key to public repositories
- ❌ **Never** share this key publicly

### 2. **For Vercel Deployment**
You need to add this to Vercel environment variables:

1. Go to **Vercel Dashboard** → Your Project
2. Click **Settings** → **Environment Variables**
3. Add:
   - **Name:** `SUPABASE_SERVICE_ROLE_KEY`
   - **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0Zm5nd2J5bmtrbXRqY3NkcW53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY2NzA4NywiZXhwIjoyMDc4MjQzMDg3fQ.6nJQzduFKH6lk5-VBgNf59kl1BqNKkRIYLWw0ECE9zM`
   - **Environment:** Production, Preview, Development (select all)
4. Click **Save**

---

## How It Works

The upload route (`/api/backend/uploadFile`) uses this key to:
1. Authenticate with Supabase Storage
2. Upload files to the `tribute-images` bucket
3. Get public URLs for uploaded images

**Code:**
```typescript
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);
```

---

## Next Steps

1. ✅ **Service role key added** to `.env.local`
2. ⏳ **Create Supabase Storage bucket** (if not done):
   - Go to Supabase Dashboard → Storage
   - Create bucket: `tribute-images`
   - Make it **Public**
3. ⏳ **Add to Vercel** (when deploying):
   - Add `SUPABASE_SERVICE_ROLE_KEY` to Vercel environment variables

---

## Testing

After setting up the storage bucket, test upload:
```bash
# Test upload endpoint
curl -X POST http://localhost:3000/api/backend/uploadFile \
  -F "file=@test.jpg" \
  -F "type=portrait"
```

Should return:
```json
{
  "success": true,
  "file_url": "https://wtfngwbynkkmtjcsdqnw.supabase.co/storage/v1/object/public/tribute-images/tributes/portrait_xxx.jpg"
}
```

---

**Your service role key is now configured!** 🚀

