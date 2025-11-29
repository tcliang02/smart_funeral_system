-- ==========================================
-- DATABASE UPDATE FOR ACCESS CONTROL
-- Smart Funeral System - AI Access Restrictions
-- ==========================================
-- 
-- ROLES IN THE SYSTEM:
-- 1. family   - Can access ALL 3 AI systems
-- 2. guest    - Can only access AI Assistant (website help)
-- 3. provider - Can only access AI Assistant (website help)
-- ==========================================

USE smart_funeral_system;

-- 1. Update the 'role' column to only have the 3 roles you need
ALTER TABLE users 
MODIFY COLUMN role ENUM('family', 'guest', 'provider') 
DEFAULT 'guest' 
NOT NULL;

-- 2. Check current users and their roles
SELECT 
    user_id, 
    name, 
    email, 
    role,
    created_at
FROM users
ORDER BY user_id DESC
LIMIT 20;

-- 3. Update any invalid roles to 'guest' (if needed)
-- This converts 'attendee' or 'admin' to 'guest' if they exist
UPDATE users 
SET role = 'guest' 
WHERE role NOT IN ('family', 'guest', 'provider');

-- 4. Create index on role column for faster queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 5. Verify the update
SELECT 
    role,
    COUNT(*) as user_count
FROM users
GROUP BY role
ORDER BY user_count DESC;

-- ==========================================
-- TESTING QUERIES
-- ==========================================

-- Test 1: Check if specific user is family
-- Replace USER_ID with actual user ID
SELECT user_id, name, role 
FROM users 
WHERE user_id = 1;  -- Change this to your test user ID

-- Test 2: List all family members
SELECT user_id, name, email, role 
FROM users 
WHERE role = 'family'
ORDER BY user_id DESC;

-- Test 3: List all providers
SELECT user_id, name, email, role 
FROM users 
WHERE role = 'provider'
ORDER BY user_id DESC;

-- ==========================================
-- NOTES:
-- ==========================================
-- YOUR SYSTEM'S 3 ROLES:
-- 
-- 1. FAMILY ROLE:
--    - Can access AI Assistant (website help)
--    - Can access Counselor AI (grief support)
--    - Can access Deceased Person AI (voice memorial)
--    - Full access to all AI systems
--
-- 2. GUEST ROLE:
--    - Can ONLY access AI Assistant (website help)
--    - Cannot access Counselor AI
--    - Cannot access Deceased Person AI
--
-- 3. PROVIDER ROLE (Service Providers):
--    - Can ONLY access AI Assistant (website help)
--    - Cannot access Counselor AI
--    - Cannot access Deceased Person AI
--    - Has their own dashboard for managing services
-- ==========================================
