-- ==========================================
-- QUICK REFERENCE: HeidiSQL Commands
-- Copy and paste these into HeidiSQL Query tab
-- ==========================================

-- 1️⃣ CHECK CURRENT USER ROLES
-- See all users and their roles
SELECT user_id, name, email, role, created_at
FROM users
ORDER BY created_at DESC;

-- 2️⃣ COUNT USERS BY ROLE
-- See how many users in each role
SELECT 
    role,
    COUNT(*) as total_users
FROM users
GROUP BY role;

-- 3️⃣ UPDATE SPECIFIC USER ROLE TO FAMILY
-- Replace USER_ID with actual user ID
UPDATE users 
SET role = 'family' 
WHERE user_id = 1;  -- Change this number

-- 4️⃣ UPDATE SPECIFIC USER ROLE TO PROVIDER
UPDATE users 
SET role = 'provider' 
WHERE user_id = 2;  -- Change this number

-- 5️⃣ UPDATE SPECIFIC USER ROLE TO GUEST
UPDATE users 
SET role = 'guest' 
WHERE user_id = 3;  -- Change this number

-- 6️⃣ FIND USER BY EMAIL
SELECT user_id, name, email, role
FROM users
WHERE email = 'your@email.com';  -- Change this

-- 7️⃣ FIND ALL FAMILY MEMBERS
SELECT user_id, name, email, created_at
FROM users
WHERE role = 'family'
ORDER BY created_at DESC;

-- 8️⃣ FIND ALL SERVICE PROVIDERS
SELECT user_id, name, email, created_at
FROM users
WHERE role = 'provider'
ORDER BY created_at DESC;

-- 9️⃣ UPDATE MULTIPLE USERS TO FAMILY
-- Make all current users family members
UPDATE users 
SET role = 'family' 
WHERE role IS NULL OR role = '';

-- 🔟 VERIFY ROLE COLUMN STRUCTURE
-- Check if role column has correct ENUM values
SHOW COLUMNS FROM users 
WHERE Field = 'role';

-- ==========================================
-- TESTING QUERIES
-- ==========================================

-- Test if a specific user can access Counselor AI
SELECT 
    user_id,
    name,
    email,
    role,
    CASE 
        WHEN role = 'family' THEN '✅ CAN access Counselor AI'
        ELSE '❌ CANNOT access Counselor AI'
    END as counselor_ai_access,
    CASE 
        WHEN role = 'family' THEN '✅ CAN access Deceased Person AI'
        ELSE '❌ CANNOT access Deceased Person AI'
    END as voice_ai_access
FROM users
WHERE user_id = 1;  -- Change this to your test user ID

-- ==========================================
-- BACKUP BEFORE CHANGES (OPTIONAL)
-- ==========================================

-- Create backup of users table
CREATE TABLE users_backup AS 
SELECT * FROM users;

-- Verify backup
SELECT COUNT(*) as backup_count FROM users_backup;

-- ==========================================
-- RESTORE FROM BACKUP (IF NEEDED)
-- ==========================================

-- Restore all users from backup
-- ⚠️ WARNING: This will overwrite current users table!
DELETE FROM users;
INSERT INTO users SELECT * FROM users_backup;

-- ==========================================
-- DELETE BACKUP (AFTER SUCCESSFUL TESTING)
-- ==========================================

DROP TABLE IF EXISTS users_backup;
