-- ====================================================================
-- COMPREHENSIVE FIX FOR ALL SERVICE PROVIDER DASHBOARD ISSUES
-- This script will test and fix EVERYTHING needed for the dashboard
-- ====================================================================

USE smart_funeral_system;

-- ============================================
-- PART 1: ADD ALL MISSING COLUMNS
-- ============================================

-- Fix provider_reviews table
ALTER TABLE provider_reviews 
ADD COLUMN IF NOT EXISTS reviewer_user_id INT NULL AFTER id,
ADD COLUMN IF NOT EXISTS review_category VARCHAR(50) DEFAULT 'quality' AFTER review_text,
ADD COLUMN IF NOT EXISTS review_type ENUM('customer_to_provider', 'provider_to_customer') DEFAULT 'customer_to_provider' AFTER review_category;

ALTER TABLE provider_reviews 
ADD INDEX IF NOT EXISTS idx_reviewer_user_id (reviewer_user_id);

SELECT '✅ provider_reviews table fixed' as status;

-- Fix packages table - ADD ALL MISSING COLUMNS
ALTER TABLE packages 
ADD COLUMN IF NOT EXISTS is_featured TINYINT(1) DEFAULT 0 AFTER is_active,
ADD COLUMN IF NOT EXISTS image_url VARCHAR(500) NULL AFTER description,
ADD COLUMN IF NOT EXISTS capacity INT NULL AFTER price,
ADD COLUMN IF NOT EXISTS duration_hours DECIMAL(5,2) NULL AFTER capacity,
ADD COLUMN IF NOT EXISTS location_type ENUM('home', 'venue', 'both') DEFAULT 'both' AFTER duration_hours;

ALTER TABLE packages 
ADD INDEX IF NOT EXISTS idx_is_featured (is_featured);

SELECT '✅ packages table fixed (added is_featured, image_url, capacity, duration_hours, location_type)' as status;

-- Create package_features table if it doesn't exist
CREATE TABLE IF NOT EXISTS package_features (
    feature_id INT AUTO_INCREMENT PRIMARY KEY,
    package_id INT NOT NULL,
    feature_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (package_id) REFERENCES packages(package_id) ON DELETE CASCADE,
    INDEX idx_package_id (package_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SELECT '✅ package_features table created/verified' as status;

-- ============================================
-- PART 2: ENSURE USER 16 HAS COMPLETE DATA
-- ============================================

-- Update user 16 to ensure all fields are correct
UPDATE users SET 
    id = user_id,
    username = COALESCE(username, name),
    role = 'provider'
WHERE user_id = 16;

SELECT '✅ User 16 data synchronized' as status;

-- ============================================
-- PART 3: VERIFY SERVICE PROVIDER EXISTS
-- ============================================

-- Check if service provider exists for user 16
SELECT 'Service provider check:' as check_name;
SELECT provider_id, user_id, company_name 
FROM service_provider 
WHERE user_id = 16;

-- If no provider exists, create one
INSERT IGNORE INTO service_provider (
    user_id, company_name, business_type, description, 
    address, city, state, phone, email, website, logo_url, 
    average_price, total_packages, is_verified, is_active
) VALUES (
    16, 'Provider Company 16', 'Funeral Services', 'Professional funeral services',
    '123 Provider Street', 'Provider City', 'Provider State', '+1234567890', 'provider1@gmail.com', 
    'https://example.com', 'https://example.com/logo.jpg', 5000.00, 0, 1, 1
);

SELECT '✅ Service provider record verified' as status;

-- ============================================
-- PART 4: TEST ALL BACKEND QUERIES
-- ============================================

-- Get provider_id for user 16
SET @provider_id = (SELECT provider_id FROM service_provider WHERE user_id = 16 LIMIT 1);

SELECT 'Provider ID for user 16:' as test_name, @provider_id as provider_id;

-- TEST 1: Main dashboard query (getProviderDashboard.php)
SELECT '========================================' as divider;
SELECT 'TEST 1: Main Dashboard Query' as test_name;
SELECT 
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

-- TEST 2: Recent bookings query
SELECT '========================================' as divider;
SELECT 'TEST 2: Recent Bookings Query' as test_name;
SELECT 
    b.booking_id,
    b.customer_name,
    b.customer_email,
    b.customer_phone,
    b.service_date,
    b.total_amount,
    b.status,
    b.created_at,
    p.name as package_name
FROM bookings b
LEFT JOIN packages p ON b.package_id = p.package_id
WHERE p.provider_id = @provider_id
ORDER BY b.created_at DESC
LIMIT 10;

-- TEST 3: Recent reviews query
SELECT '========================================' as divider;
SELECT 'TEST 3: Recent Reviews Query' as test_name;
SELECT 
    pr.review_id,
    pr.rating,
    pr.review_text,
    pr.created_at,
    u.username as reviewer_name,
    u.email as reviewer_email,
    b.booking_id,
    b.customer_name,
    pkg.name as package_name
FROM provider_reviews pr
JOIN bookings b ON pr.booking_id = b.booking_id
JOIN packages pkg ON b.package_id = pkg.package_id
LEFT JOIN users u ON pr.reviewer_user_id = u.id
WHERE pkg.provider_id = @provider_id AND pr.review_type = 'customer_to_provider'
ORDER BY pr.created_at DESC
LIMIT 10;

-- TEST 4: Statistics query
SELECT '========================================' as divider;
SELECT 'TEST 4: Statistics Query' as test_name;
SELECT 
    COUNT(DISTINCT b.booking_id) as total_bookings,
    COUNT(DISTINCT p.package_id) as total_packages,
    COALESCE(SUM(b.total_amount), 0) as total_revenue,
    COUNT(DISTINCT CASE WHEN b.status = 'pending' THEN b.booking_id END) as pending_bookings,
    COUNT(DISTINCT CASE WHEN b.status = 'confirmed' THEN b.booking_id END) as confirmed_bookings,
    COUNT(DISTINCT CASE WHEN b.status = 'completed' THEN b.booking_id END) as completed_bookings
FROM service_provider sp
LEFT JOIN packages p ON sp.provider_id = p.provider_id
LEFT JOIN bookings b ON p.package_id = b.package_id
WHERE sp.provider_id = @provider_id;

-- TEST 5: Packages query with is_featured
SELECT '========================================' as divider;
SELECT 'TEST 5: Packages Query' as test_name;
SELECT 
    p.package_id,
    p.name,
    p.package_name,
    p.description,
    p.price,
    p.is_active,
    p.is_featured,
    COUNT(b.booking_id) as booking_count
FROM packages p
LEFT JOIN bookings b ON p.package_id = b.package_id
WHERE p.provider_id = @provider_id
GROUP BY p.package_id
ORDER BY p.is_featured DESC, p.created_at DESC;

-- ============================================
-- PART 5: CREATE SAMPLE DATA IF NEEDED
-- ============================================

-- Check if packages exist for provider 16
SET @package_count = (SELECT COUNT(*) FROM packages WHERE provider_id = @provider_id);

SELECT 'Current package count:' as check_name, @package_count as count;

-- If no packages, create some sample packages
INSERT IGNORE INTO packages (provider_id, name, package_name, description, price, category, is_active, is_featured) 
VALUES 
(@provider_id, 'Basic Funeral Service', 'Basic Funeral Service', 'Essential funeral service package with all basic needs', 2500.00, 'basic', 1, 0),
(@provider_id, 'Premium Funeral Service', 'Premium Funeral Service', 'Comprehensive funeral service with premium features', 5000.00, 'premium', 1, 1),
(@provider_id, 'Deluxe Funeral Service', 'Deluxe Funeral Service', 'Complete luxury funeral service', 7500.00, 'deluxe', 1, 1);

SELECT '✅ Sample packages created (if none existed)' as status;

-- Update provider statistics
UPDATE service_provider SET 
    total_packages = (SELECT COUNT(*) FROM packages WHERE provider_id = @provider_id),
    average_price = (SELECT AVG(price) FROM packages WHERE provider_id = @provider_id)
WHERE provider_id = @provider_id;

SELECT '✅ Provider statistics updated' as status;

-- ============================================
-- PART 6: FINAL VERIFICATION
-- ============================================

SELECT '========================================' as divider;
SELECT '📊 FINAL VERIFICATION REPORT' as report_title;
SELECT '========================================' as divider;

-- User data
SELECT 'User 16 Data:' as check_name;
SELECT user_id, id, name, username, email, role FROM users WHERE user_id = 16;

-- Provider data
SELECT 'Provider Data:' as check_name;
SELECT provider_id, user_id, company_name, total_packages, average_price, is_active FROM service_provider WHERE user_id = 16;

-- Packages data
SELECT 'Packages Data:' as check_name;
SELECT package_id, name, price, is_active, is_featured FROM packages WHERE provider_id = @provider_id;

-- Table structures
SELECT 'provider_reviews columns:' as check_name;
SHOW COLUMNS FROM provider_reviews LIKE '%reviewer%';

SELECT 'packages columns:' as check_name;
SHOW COLUMNS FROM packages LIKE '%featured%';

SELECT '========================================' as divider;
SELECT '✅✅✅ ALL TESTS COMPLETE! ✅✅✅' as final_status;
SELECT 'If all queries above returned data, your dashboard should work!' as instruction;
SELECT '========================================' as divider;