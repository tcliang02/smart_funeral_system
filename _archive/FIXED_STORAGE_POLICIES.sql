-- ============================================
-- Fixed: Supabase Storage Policies
-- ============================================
-- Run this in Supabase SQL Editor
-- Go to: Dashboard → SQL Editor → New Query

-- Step 1: Drop existing policies (if they exist) - This prevents errors
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow Anonymous Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;

-- Step 2: Create Public Read Policy (SELECT)
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'tribute-images');

-- Step 3: Create Authenticated Upload Policy (INSERT)
CREATE POLICY "Allow Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tribute-images');

-- Step 4: Create Anonymous Upload Policy (INSERT)
CREATE POLICY "Allow Anonymous Upload"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'tribute-images');

-- Step 5: Verify policies were created
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%tribute%' OR policyname LIKE '%Public%' OR policyname LIKE '%Upload%';

-- Expected output: Should show 3 policies
-- 1. Public Read Access (SELECT, public)
-- 2. Allow Authenticated Upload (INSERT, authenticated)
-- 3. Allow Anonymous Upload (INSERT, anon)

