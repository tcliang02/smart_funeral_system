# 🔧 Fix: Supabase Storage RLS Policy Error

## Problem
```
StorageApiError: new row violates row-level security policy
```

This means the storage bucket's Row Level Security (RLS) policies aren't allowing uploads.

---

## Solution: Set Up Storage Policies

### Step 1: Go to Supabase Storage Policies

1. Go to **Supabase Dashboard** → **Storage**
2. Click on **`tribute-images`** bucket
3. Click on **Policies** tab
4. You should see policies listed (or empty if none exist)

---

### Step 2: Create Upload Policy (INSERT)

1. Click **New Policy**
2. Select **For full customization**
3. **Policy name:** `Allow Authenticated Upload`
4. **Allowed operation:** `INSERT`
5. **Target roles:** `authenticated` (or `anon` if you want anonymous uploads)
6. **WITH CHECK expression:**
   ```sql
   bucket_id = 'tribute-images'
   ```
7. Click **Review** → **Save Policy**

**OR use Simple mode:**
- **Policy name:** `Allow Upload`
- **Allowed operation:** `INSERT`
- **Target roles:** `anon, authenticated` (select both)
- **WITH CHECK expression:** `bucket_id = 'tribute-images'`

---

### Step 3: Create Read Policy (SELECT) - If Not Already Exists

1. Click **New Policy**
2. Select **For full customization**
3. **Policy name:** `Public Read Access`
4. **Allowed operation:** `SELECT`
5. **Target roles:** `public`
6. **USING expression:**
   ```sql
   bucket_id = 'tribute-images'
   ```
7. Click **Review** → **Save Policy**

**OR use Simple mode:**
- **Policy name:** `Public Read`
- **Allowed operation:** `SELECT`
- **Target roles:** `public`
- **USING expression:** `bucket_id = 'tribute-images'`

---

### Step 4: Alternative - Disable RLS (Not Recommended for Production)

If you want to disable RLS entirely (less secure):

1. Go to **Storage** → **`tribute-images`** bucket
2. Click **Settings** tab
3. Find **"Public bucket"** - make sure it's checked
4. Go to **Policies** tab
5. If RLS is enabled, you can disable it (but policies are better)

---

## Step 5: Verify Service Role Key is Used

The service role key should bypass RLS, but let's make sure it's being used:

1. Check `.env.local` has:
   ```
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. Restart your dev server:
   ```bash
   # Stop server (Ctrl+C)
   # Then restart
   npm run dev
   ```

3. The upload route should use service role key automatically

---

## Quick Fix: SQL Commands (Alternative)

If the UI doesn't work, you can run SQL directly:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run these commands:

```sql
-- Allow public read access
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'tribute-images');

-- Allow authenticated uploads
CREATE POLICY "Allow Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tribute-images');

-- Allow anonymous uploads (if needed)
CREATE POLICY "Allow Anonymous Upload"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'tribute-images');
```

---

## Test After Fixing

1. **Restart your dev server**
2. **Try uploading again**
3. **Check browser console** - should see success
4. **Verify in Supabase Storage** - file should appear

---

## Summary

✅ **What to do:**
1. Go to Storage → `tribute-images` → Policies
2. Create INSERT policy for `authenticated` (or `anon`)
3. Create SELECT policy for `public` (if not exists)
4. Restart dev server
5. Test upload

✅ **Expected result:**
- Upload succeeds
- File appears in Supabase Storage
- Public URL works

---

**After fixing policies, your uploads should work!** 🚀

