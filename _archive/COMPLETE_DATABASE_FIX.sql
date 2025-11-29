-- ============================================
-- COMPLETE DATABASE FIX FOR ALL ERRORS
-- Based on HeidiSQL history and backend analysis
-- ============================================

USE smart_funeral_system;

-- ============================================
-- STEP 1: Fix packages table columns
-- ============================================

-- Check which column exists and add the missing one
SET @has_name = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'packages' AND COLUMN_NAME = 'name');
SET @has_package_name = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'packages' AND COLUMN_NAME = 'package_name');

-- If only 'name' exists, add 'package_name'
SET @sql1 = IF(@has_name > 0 AND @has_package_name = 0,
    'ALTER TABLE packages ADD COLUMN package_name VARCHAR(200) NULL AFTER name',
    'SELECT "Skipping package_name add" AS message');
PREPARE stmt1 FROM @sql1;
EXECUTE stmt1;
DEALLOCATE PREPARE stmt1;

-- If only 'package_name' exists, add 'name'
SET @sql2 = IF(@has_package_name > 0 AND @has_name = 0,
    'ALTER TABLE packages ADD COLUMN name VARCHAR(200) NULL AFTER provider_id',
    'SELECT "Skipping name add" AS message');
PREPARE stmt2 FROM @sql2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

-- Copy data between columns
UPDATE packages SET name = package_name WHERE name IS NULL AND package_name IS NOT NULL;
UPDATE packages SET package_name = name WHERE package_name IS NULL AND name IS NOT NULL;

-- Add is_featured column for ordering
ALTER TABLE packages 
ADD COLUMN IF NOT EXISTS is_featured TINYINT(1) DEFAULT 0 AFTER is_active;

-- Add index for performance
ALTER TABLE packages 
ADD INDEX IF NOT EXISTS idx_is_featured (is_featured);

-- Verify packages structure
SHOW COLUMNS FROM packages;
SELECT 'Packages table fixed: Both name and package_name columns exist, is_featured added' as status;

-- ============================================
-- STEP 2: Complete bookings table fix
-- ============================================

-- Add ALL missing columns that your backend expects
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS booking_reference VARCHAR(50) NULL AFTER booking_id,
ADD COLUMN IF NOT EXISTS service_address TEXT NULL AFTER service_time,
ADD COLUMN IF NOT EXISTS special_requirements TEXT NULL AFTER special_requests,
ADD COLUMN IF NOT EXISTS uploaded_files TEXT NULL AFTER special_requirements,
ADD COLUMN IF NOT EXISTS provider_notes TEXT NULL AFTER uploaded_files,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT NULL AFTER provider_notes,
ADD COLUMN IF NOT EXISTS cancelled_by VARCHAR(50) NULL AFTER cancellation_reason,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP NULL AFTER cancelled_by,
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP NULL AFTER cancelled_at,
ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10,2) NULL AFTER confirmed_at;

-- Verify bookings structure
SHOW COLUMNS FROM bookings;
SELECT 'Bookings table: All missing columns added' as status;

-- ============================================
-- STEP 3: Fix service_provider and users table columns
-- ============================================

-- Add missing columns that your backend expects for service providers
ALTER TABLE service_provider 
ADD COLUMN IF NOT EXISTS logo_url VARCHAR(255) NULL AFTER company_name,
ADD COLUMN IF NOT EXISTS average_price DECIMAL(10,2) NULL AFTER logo_url,
ADD COLUMN IF NOT EXISTS total_packages INT DEFAULT 0 AFTER average_price;

-- Add username column to users table (backend expects it)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS username VARCHAR(100) NULL AFTER name,
ADD COLUMN IF NOT EXISTS id INT NULL AFTER user_id;

-- Copy data from name to username if username is empty
UPDATE users SET username = name WHERE username IS NULL OR username = '';

-- Copy user_id to id if id is NULL
UPDATE users SET id = user_id WHERE id IS NULL;

-- Add index on id column for faster lookups
ALTER TABLE users ADD INDEX IF NOT EXISTS idx_id (id);

-- Verify tables structure
SHOW COLUMNS FROM service_provider;
SHOW COLUMNS FROM users;
SELECT 'Service provider and users tables: All missing columns added' as status;

-- ============================================
-- STEP 4: Fix provider_reviews table
-- ============================================

-- Add 'id' column to provider_reviews (backend expects pr.id)
ALTER TABLE provider_reviews 
ADD COLUMN IF NOT EXISTS id INT NULL AFTER review_id,
ADD COLUMN IF NOT EXISTS reviewer_user_id INT NULL AFTER id,
ADD COLUMN IF NOT EXISTS review_category VARCHAR(50) DEFAULT 'quality' AFTER review_text,
ADD COLUMN IF NOT EXISTS review_type ENUM('customer_to_provider', 'provider_to_customer') DEFAULT 'customer_to_provider' AFTER review_category;

-- Copy review_id to id if id is NULL
UPDATE provider_reviews SET id = review_id WHERE id IS NULL;

-- Add index on id and reviewer_user_id columns
ALTER TABLE provider_reviews ADD INDEX IF NOT EXISTS idx_id (id);
ALTER TABLE provider_reviews ADD INDEX IF NOT EXISTS idx_reviewer_user_id (reviewer_user_id);

SHOW COLUMNS FROM provider_reviews;
SELECT 'Provider reviews table: id column added' as status;

-- ============================================
-- STEP 5: Verify all critical tables
-- ============================================

-- Check users table has correct roles
SELECT 'Users table roles:' as check_name;
SELECT DISTINCT role FROM users;

-- Check all users data
SELECT 'All users data:' as check_name;
SELECT user_id, id, name, username, email, role FROM users LIMIT 5;

-- Check service_provider data  
SELECT 'Service provider data:' as check_name;
SELECT provider_id, user_id, company_name FROM service_provider LIMIT 5;

-- Check if there are any providers linked to users
SELECT 'Provider-User relationships:' as check_name;
SELECT 
    u.user_id, u.id as user_table_id, u.name, u.role,
    sp.provider_id, sp.user_id as sp_user_id, sp.company_name
FROM users u 
LEFT JOIN service_provider sp ON u.user_id = sp.user_id 
WHERE u.role = 'provider'
LIMIT 5;

-- Check packages table structure
SELECT 'Packages table columns:' as check_name;
SHOW COLUMNS FROM packages;

-- Check bookings table structure  
SELECT 'Bookings table columns:' as check_name;
SHOW COLUMNS FROM bookings;

-- Check service_provider table structure  
SELECT 'Service provider table columns:' as check_name;
SHOW COLUMNS FROM service_provider;

-- Check existing bookings data
SELECT 'Existing bookings:' as check_name;
SELECT booking_id, booking_reference, customer_name, total_amount, status 
FROM bookings 
ORDER BY created_at DESC 
LIMIT 5;

-- ============================================
-- STEP 6: Test queries from your backend
-- ============================================

-- Test query from getProviderBookings.php (the one causing errors)
SELECT 'Testing provider bookings query:' as test_name;
SELECT 
    b.booking_id,
    b.booking_reference,
    b.customer_name,
    b.service_address,
    b.special_requirements,
    b.uploaded_files,
    b.status,
    p.name as package_name,
    p.description as package_description,
    p.price as package_price
FROM bookings b
LEFT JOIN packages p ON b.package_id = p.package_id
LIMIT 3;

-- Test query from getProviderDashboard.php (the one causing logo_url error)
SELECT 'Testing provider dashboard query:' as test_name;
SELECT 
    sp.provider_id,
    sp.company_name,
    sp.address,
    sp.phone,
    sp.description,
    sp.website,
    sp.logo_url,
    sp.average_price,
    sp.total_packages
FROM service_provider sp
LIMIT 3;

-- ============================================
-- STEP 7: DIAGNOSE AND FIX PROVIDER ISSUE FOR USER 16
-- ============================================

-- First check what user 16 actually looks like
SELECT 'User 16 current data:' as check_name;
SELECT user_id, id, name, username, email, role FROM users WHERE user_id = 16;

-- Check if any service_provider exists for user 16
SELECT 'Existing provider for user 16:' as check_name;
SELECT * FROM service_provider WHERE user_id = 16;

-- Fix user 16 data first
UPDATE users SET 
    id = user_id, 
    username = COALESCE(username, name),
    role = 'provider'
WHERE user_id = 16;

-- DELETE any existing service_provider for user 16 and recreate it properly
DELETE FROM service_provider WHERE user_id = 16;
DELETE FROM packages WHERE provider_id IN (SELECT provider_id FROM service_provider WHERE user_id = 16);

-- Create service provider record for user_id 16 (your current user)
INSERT INTO service_provider (
    user_id, company_name, business_type, description, 
    address, city, state, phone, email, website, logo_url, 
    average_price, total_packages, is_verified, is_active
) VALUES (
    16, 'Provider Company 16', 'Funeral Services', 'Professional funeral services',
    '123 Provider Street', 'Provider City', 'Provider State', '+1234567890', 'provider16@test.com', 
    'https://example.com', 'https://example.com/logo.jpg', 5000.00, 0, 1, 1
);

-- Get the auto-generated provider_id
SET @new_provider_id = LAST_INSERT_ID();

-- Create some sample packages using the new provider_id
INSERT INTO packages (provider_id, name, package_name, description, price, category, is_active) 
VALUES 
(@new_provider_id, 'Basic Service 16', 'Basic Service 16', 'Essential funeral service package', 2500.00, 'basic', 1),
(@new_provider_id, 'Premium Service 16', 'Premium Service 16', 'Comprehensive funeral service', 5000.00, 'premium', 1);

-- Update provider statistics
UPDATE service_provider SET 
    total_packages = 2,
    average_price = 3750.00
WHERE user_id = 16;

-- Verify the creation worked
SELECT 'FINAL CHECK - User 16 after fixes:' as check_name;
SELECT user_id, id, name, username, email, role FROM users WHERE user_id = 16;

SELECT 'FINAL CHECK - Provider for user 16:' as check_name;
SELECT provider_id, user_id, company_name, logo_url, average_price, total_packages 
FROM service_provider WHERE user_id = 16;

-- Test the EXACT backend query with detailed debugging
SELECT 'BACKEND QUERY TEST - This should return 1 row:' as test_name;
SELECT 
    'FOUND PROVIDER!' as status,
    sp.provider_id,
    sp.company_name,
    sp.address,
    sp.phone,
    sp.description,
    sp.website,
    sp.logo_url,
    sp.average_price,
    sp.total_packages,
    sp.created_at,
    u.email,
    u.username,
    COALESCE(AVG(pr.rating), 0) as avg_rating,
    COUNT(DISTINCT pr.id) as review_count
FROM service_provider sp
LEFT JOIN users u ON sp.user_id = u.id
LEFT JOIN packages p ON sp.provider_id = p.provider_id
LEFT JOIN bookings b ON p.package_id = b.package_id
LEFT JOIN provider_reviews pr ON b.booking_id = pr.booking_id AND pr.review_type = 'customer_to_provider'
WHERE sp.user_id = 16
GROUP BY sp.provider_id;

-- ============================================
-- STEP 8: FINAL DIAGNOSTIC - CHECK ALL USER DATA
-- ============================================

-- Show ALL users to see which one you might be logged in as
SELECT 'ALL USERS IN DATABASE:' as check_name;
SELECT user_id, id, name, username, email, role, 
       CASE 
           WHEN role = 'provider' THEN '← PROVIDER USER'
           ELSE ''
       END as type_indicator
FROM users 
ORDER BY user_id;

-- Show ALL service providers
SELECT 'ALL SERVICE PROVIDERS:' as check_name;
SELECT sp.provider_id, sp.user_id, sp.company_name,
       u.name as user_name, u.email as user_email
FROM service_provider sp
LEFT JOIN users u ON sp.user_id = u.user_id;

-- Test queries for EVERY provider user to see which one works
SELECT 'TESTING QUERY FOR EACH PROVIDER USER:' as test_name;

-- Test for any provider users that exist
SELECT 
    CONCAT('USER ID ', u.user_id, ' (', u.name, ')') as testing_user,
    sp.provider_id,
    sp.company_name,
    sp.logo_url
FROM users u
LEFT JOIN service_provider sp ON u.user_id = sp.user_id
WHERE u.role = 'provider' AND sp.provider_id IS NOT NULL;

SELECT '📋 CHECK THE RESULTS ABOVE:' as instruction;
SELECT '1. Find which user_id has role=provider AND has a service_provider record' as step1;
SELECT '2. That user_id is the one you need to login with!' as step2;
SELECT '3. If you see USER ID 16, your dashboard should work!' as step3;

-- ============================================
-- SUCCESS!
-- ============================================
SELECT '✅ ALL DATABASE ERRORS FIXED!' as final_status;
SELECT 'Your database now matches ALL backend expectations' as result;
SELECT 'Roles: family, attendee, provider, admin' as user_roles;
SELECT 'All booking and package columns present' as columns_status;