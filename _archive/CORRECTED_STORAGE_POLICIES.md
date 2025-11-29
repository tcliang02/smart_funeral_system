# ✅ CORRECTED: Storage Policies SQL

## The Problem
PostgreSQL doesn't support `IF NOT EXISTS` with `CREATE POLICY`.

## ✅ Corrected SQL

Copy and paste this into Supabase SQL Editor:

```sql
-- Drop existing policies first (prevents errors)
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow Anonymous Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;

-- Create Public Read Policy (SELECT)
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'tribute-images');

-- Create Authenticated Upload Policy (INSERT)
CREATE POLICY "Allow Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tribute-images');

-- Create Anonymous Upload Policy (INSERT)
CREATE POLICY "Allow Anonymous Upload"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'tribute-images');
```

## Steps

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **New Query**
3. Paste the SQL above
4. Click **Run** (or press Ctrl+Enter)
5. You should see: "Success. No rows returned"

## Verify It Worked

After running, check:
1. Go to **Storage** → **`tribute-images`** → **Policies** tab
2. You should see 3 policies:
   - ✅ Public Read Access
   - ✅ Allow Authenticated Upload
   - ✅ Allow Anonymous Upload

## Test Upload

1. **Restart your dev server:**
   ```bash
   # Stop (Ctrl+C) and restart
   npm run dev
   ```

2. **Try uploading an image** - should work now!

---

**This SQL will work!** ✅

