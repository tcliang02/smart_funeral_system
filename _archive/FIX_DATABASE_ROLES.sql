-- ============================================
-- FIX DATABASE TO MATCH FRONTEND/BACKEND
-- Smart Funeral System - Role Migration
-- ============================================
-- Run this ONCE in HeidiSQL to update your database
-- This will convert old roles to new ones
-- ============================================

USE smart_funeral_system;

-- ============================================
-- STEP 1: Temporarily add old roles to ENUM
-- ============================================
ALTER TABLE users MODIFY COLUMN role 
ENUM('family', 'attendee', 'provider', 'admin', 'customer', 'guest') DEFAULT 'family';

SELECT '✅ Step 1: Old roles temporarily added' as status;

-- ============================================
-- STEP 2: Convert old roles to new roles
-- ============================================

-- Convert 'customer' to 'family' (main user)
UPDATE users SET role = 'family' WHERE role = 'customer';

-- Convert 'guest' to 'attendee' (funeral attendee)
UPDATE users SET role = 'attendee' WHERE role = 'guest';

SELECT '✅ Step 2: Old roles converted' as status;

-- ============================================
-- STEP 3: Remove old roles from ENUM
-- ============================================
ALTER TABLE users MODIFY COLUMN role 
ENUM('family', 'attendee', 'provider', 'admin') DEFAULT 'family';

SELECT '✅ Step 3: Old roles removed from database' as status;

-- ============================================
-- STEP 4: Verify the fix
-- ============================================

-- Show all users with their roles
SELECT 
    user_id,
    name,
    email,
    role,
    CASE 
        WHEN role = 'family' THEN 'Family Member (Main User)'
        WHEN role = 'attendee' THEN 'Funeral Attendee (Guest)'
        WHEN role = 'provider' THEN 'Service Provider'
        WHEN role = 'admin' THEN 'Administrator'
    END as role_description,
    created_at
FROM users
ORDER BY created_at DESC;

-- Count users by role
SELECT 
    role,
    COUNT(*) as user_count
FROM users 
GROUP BY role;

-- ============================================
-- DONE!
-- ============================================
SELECT 'DATABASE NOW MATCHES FRONTEND/BACKEND' as status;
SELECT 'Roles: family, attendee, provider, admin' as available_roles;
