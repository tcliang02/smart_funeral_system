# 🚨 IMMEDIATE FIX: Storage RLS Policy Error

## The Problem
```
StorageApiError: new row violates row-level security policy
```

Your storage bucket has RLS enabled but no policies to allow uploads.

---

## ⚡ QUICK FIX (2 Minutes)

### Option 1: Use SQL Editor (Fastest)

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **New Query**
3. Copy and paste this SQL:

```sql
-- Allow public read access
CREATE POLICY IF NOT EXISTS "Public Read Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'tribute-images');

-- Allow authenticated uploads
CREATE POLICY IF NOT EXISTS "Allow Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tribute-images');

-- Allow anonymous uploads (for unauthenticated users)
CREATE POLICY IF NOT EXISTS "Allow Anonymous Upload"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'tribute-images');
```

4. Click **Run** (or press Ctrl+Enter)
5. You should see: "Success. No rows returned"

### Option 2: Use Storage UI

1. Go to **Storage** → **`tribute-images`** bucket
2. Click **Policies** tab
3. Click **New Policy**
4. Select **Simple** mode
5. Create these 3 policies:

**Policy 1: Public Read**
- Name: `Public Read`
- Operation: `SELECT`
- Roles: `public`
- USING: `bucket_id = 'tribute-images'`

**Policy 2: Authenticated Upload**
- Name: `Allow Upload`
- Operation: `INSERT`
- Roles: `authenticated`
- WITH CHECK: `bucket_id = 'tribute-images'`

**Policy 3: Anonymous Upload** (Optional but recommended)
- Name: `Allow Anonymous Upload`
- Operation: `INSERT`
- Roles: `anon`
- WITH CHECK: `bucket_id = 'tribute-images'`

---

## ✅ After Fixing

1. **Restart your dev server:**
   ```bash
   # Stop (Ctrl+C) and restart
   npm run dev
   ```

2. **Test upload again:**
   - Try uploading an image
   - Should work now!

3. **Verify:**
   - Check Supabase Storage → `tribute-images` → `tributes/`
   - File should appear there

---

## Why This Happened

Supabase Storage has Row Level Security (RLS) enabled by default. Even though you're using the service role key (which should bypass RLS), the storage bucket itself needs explicit policies to allow INSERT operations.

---

## Alternative: Disable RLS (Not Recommended)

If you want to disable RLS entirely (less secure):

```sql
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

**But creating policies is better!** ✅

---

**Run the SQL above and your uploads will work!** 🚀

