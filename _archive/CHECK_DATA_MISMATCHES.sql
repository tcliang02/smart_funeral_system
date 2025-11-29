-- ========================================
-- CHECK FOR DATA MISMATCHES - Compare critical fields
-- Run this in Supabase to verify data accuracy
-- ========================================

-- 1. Check service_provider table (likely has wrong data)
SELECT 
    '🔍 SERVICE_PROVIDER CHECK' as check_type,
    provider_id, 
    user_id,
    company_name, 
    email,
    phone,
    business_registration
FROM service_provider
ORDER BY provider_id;

-- Expected from your HeidiSQL:
-- provider_id=19, user_id=16, company_name='Nirvana', email='nirvana@test.com'

-- 2. Check bookings (verify customer names match users)
SELECT 
    '🔍 BOOKINGS CHECK' as check_type,
    booking_id,
    user_id,
    customer_name,
    customer_email,
    booking_reference
FROM bookings
WHERE user_id IN (15, 16)
ORDER BY booking_id
LIMIT 5;

-- Expected: 
-- user_id=15 should have customer_name='user1', email='tcliang2002@gmail.com'
-- user_id=16 should have customer_name='provider1', email='provider1@gmail.com'

-- 3. Check tributes (created_by should match user_id)
SELECT 
    '🔍 TRIBUTES CHECK' as check_type,
    tribute_id,
    deceased_name,
    created_by,
    photo_url
FROM tributes
ORDER BY tribute_id;

-- 4. Check if any emails still have 'example.com' that shouldn't
SELECT 
    '⚠️ PLACEHOLDER EMAILS' as check_type,
    'users' as table_name,
    user_id as id,
    email
FROM users
WHERE email LIKE '%example.com'
UNION ALL
SELECT 
    '⚠️ PLACEHOLDER EMAILS',
    'service_provider',
    provider_id,
    email
FROM service_provider
WHERE email LIKE '%example.com'
UNION ALL
SELECT 
    '⚠️ PLACEHOLDER EMAILS',
    'bookings',
    booking_id,
    customer_email
FROM bookings
WHERE customer_email LIKE '%example.com';

-- 5. Check for generic/placeholder names
SELECT 
    '⚠️ PLACEHOLDER NAMES' as check_type,
    user_id,
    name,
    username
FROM users
WHERE name LIKE '%User%' 
   OR name LIKE '%Provider%' 
   OR name LIKE '%Customer%'
ORDER BY user_id;

-- ========================================
-- SUMMARY
-- ========================================
-- Review the results above to identify:
-- 1. service_provider table - likely needs fixing
-- 2. Any bookings with wrong customer names
-- 3. Any emails with 'example.com' that should be real
-- 4. Any placeholder names that need updating
