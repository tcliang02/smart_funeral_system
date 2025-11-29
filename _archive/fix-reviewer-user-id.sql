-- FIX FOR ALL MISSING COLUMNS IN DASHBOARD QUERIES
-- Run this in HeidiSQL to add all missing columns at once

USE smart_funeral_system;

-- ============================================
-- FIX 1: Add reviewer_user_id to provider_reviews table
-- ============================================
ALTER TABLE provider_reviews 
ADD COLUMN IF NOT EXISTS reviewer_user_id INT NULL AFTER id;

-- Add index for performance
ALTER TABLE provider_reviews 
ADD INDEX IF NOT EXISTS idx_reviewer_user_id (reviewer_user_id);

SELECT '✅ Step 1: reviewer_user_id column added to provider_reviews' as status;

-- ============================================
-- FIX 2: Add is_featured to packages table
-- ============================================
ALTER TABLE packages 
ADD COLUMN IF NOT EXISTS is_featured TINYINT(1) DEFAULT 0 AFTER is_active;

-- Add index for performance (used in ORDER BY)
ALTER TABLE packages 
ADD INDEX IF NOT EXISTS idx_is_featured (is_featured);

SELECT '✅ Step 2: is_featured column added to packages' as status;

-- ============================================
-- FIX 3: Check for any other missing columns
-- ============================================

-- Check packages table structure
SELECT 'Packages table columns:' as check_name;
SHOW COLUMNS FROM packages;

-- Check provider_reviews table structure
SELECT 'Provider reviews table columns:' as check_name;
SHOW COLUMNS FROM provider_reviews;

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify the changes worked
SELECT 'Verification - Count of reviews:' as check_name;
SELECT COUNT(*) as total_reviews FROM provider_reviews;

SELECT 'Verification - Count of packages:' as check_name;
SELECT COUNT(*) as total_packages FROM packages;

SELECT 'Verification - Packages for provider 16:' as check_name;
SELECT package_id, name, package_name, is_featured, is_active 
FROM packages 
WHERE provider_id = (SELECT provider_id FROM service_provider WHERE user_id = 16)
ORDER BY is_featured DESC, created_at DESC;

SELECT '✅✅✅ ALL MISSING COLUMNS ADDED SUCCESSFULLY! ✅✅✅' as final_result;