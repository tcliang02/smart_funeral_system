-- ========================================
-- MIGRATE PACKAGES DATA FROM MySQL TO SUPABASE
-- Data extracted from: package.sql (HeidiSQL export)
-- ========================================

-- First, check what location_type values are allowed
-- If you get an error, run CHECK_LOCATION_TYPE_CONSTRAINT.sql first
-- to see the constraint definition

-- Temporarily disable RLS for data operations
ALTER TABLE packages DISABLE ROW LEVEL SECURITY;
ALTER TABLE package_features DISABLE ROW LEVEL SECURITY;

-- ========================================
-- INSERT PACKAGES DATA
-- Converted from MySQL format to PostgreSQL format
-- ========================================

INSERT INTO packages (
    package_id, 
    provider_id, 
    name, 
    description, 
    price, 
    capacity, 
    duration_hours, 
    location_type, 
    is_active, 
    is_featured, 
    created_at, 
    updated_at
) VALUES
-- Package ID 23 (changed 'venue' to 'both' to match constraint)
(23, 19, 'Premium Service 16', 'Comprehensive funeral service', 5000.00, NULL, NULL, 'both', TRUE, FALSE, '2025-10-23 09:57:14', '2025-10-23 11:46:00'),
-- Package ID 26
(26, 19, 'Deluxe Funeral Service', 'Complete luxury funeral service', 7500.00, 500, 36.00, 'both', TRUE, FALSE, '2025-10-23 10:26:16', '2025-10-23 11:45:47'),
-- Package ID 30 (changed 'venue' to 'both' to match constraint)
(30, 20, 'Basic Farewell Package', 'Essential funeral service with basic amenities', 3500.00, 50, 12.00, 'both', TRUE, FALSE, '2025-10-29 16:30:05', '2025-10-29 16:30:05'),
-- Package ID 31
(31, 20, 'Premium Memorial Package', 'Comprehensive funeral service with premium amenities', 7500.00, 100, 24.00, 'both', TRUE, TRUE, '2025-10-29 16:30:05', '2025-10-29 16:30:05'),
-- Package ID 32
(32, 20, 'Deluxe Celebration of Life', 'Complete luxury funeral service with personalized touches', 12000.00, 150, 36.00, 'both', TRUE, TRUE, '2025-10-29 16:30:05', '2025-10-29 16:30:05'),
-- Package ID 33 (changed 'venue' to 'both' to match constraint)
(33, 21, 'Buddhist Basic Service', 'Traditional Buddhist funeral ceremony', 4000.00, 60, 18.00, 'both', TRUE, FALSE, '2025-10-29 16:30:05', '2025-10-29 16:30:05'),
-- Package ID 34
(34, 21, 'Buddhist Premium Service', 'Complete Buddhist funeral with monks and chanting', 8500.00, 120, 48.00, 'both', TRUE, TRUE, '2025-10-29 16:30:05', '2025-10-29 16:30:05'),
-- Package ID 35
(35, 21, 'Buddhist Deluxe Service', 'Elaborate Buddhist ceremony with 7-day memorial', 15000.00, 200, 72.00, 'both', TRUE, TRUE, '2025-10-29 16:30:05', '2025-10-29 16:30:05'),
-- Package ID 36 (changed 'venue' to 'both' to match constraint)
(36, 19, 'Essential Memorial Service', 'Simple and dignified funeral service', 2800.00, 40, 8.00, 'both', TRUE, FALSE, '2025-10-29 16:43:01', '2025-10-29 16:43:01'),
-- Package ID 100 (changed 'venue' to 'both' to match constraint)
(100, 19, 'Essential Memorial Service', 'Simple and dignified funeral service', 2800.00, 40, 8.00, 'both', TRUE, FALSE, '2025-10-29 16:52:24', '2025-10-29 16:52:24'),
-- Package ID 102
(102, 19, 'Premium Tribute Service', 'Comprehensive memorial with premium features', 9500.00, 120, 30.00, 'both', TRUE, TRUE, '2025-10-29 16:52:24', '2025-10-29 16:52:24')

ON CONFLICT (package_id) DO UPDATE SET
    provider_id = EXCLUDED.provider_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    capacity = EXCLUDED.capacity,
    duration_hours = EXCLUDED.duration_hours,
    location_type = EXCLUDED.location_type,
    is_active = EXCLUDED.is_active,
    is_featured = EXCLUDED.is_featured,
    updated_at = EXCLUDED.updated_at;

-- Update the sequence to ensure next package_id is correct
SELECT setval('packages_package_id_seq', (SELECT GREATEST(MAX(package_id), 102) FROM packages));

-- ========================================
-- INSERT PACKAGE FEATURES
-- Features extracted from database_backup_utf8.sql
-- ========================================

INSERT INTO package_features (package_id, feature_name, created_at) VALUES
-- Features for package_id 26 (Deluxe Funeral Service)
(26, 'Deluxe Funeral 1', '2025-10-23 11:45:47'),
(26, 'Deluxe Funeral 2', '2025-10-23 11:45:47'),

-- Features for package_id 30 (Basic Farewell Package)
(30, 'Basic Casket', '2025-10-29 16:30:05'),
(30, 'Embalming Service', '2025-10-29 16:30:05'),
(30, 'Memorial Hall (12 hours)', '2025-10-29 16:30:05'),
(30, 'Standard Hearse', '2025-10-29 16:30:05'),

-- Features for package_id 31 (Premium Memorial Package)
(31, 'Premium Wooden Casket', '2025-10-29 16:30:05'),
(31, 'Professional Embalming', '2025-10-29 16:30:05'),
(31, 'Private Memorial Hall (24 hours)', '2025-10-29 16:30:05'),
(31, 'Luxury Hearse Service', '2025-10-29 16:30:05'),
(31, 'Floral Arrangements', '2025-10-29 16:30:05'),
(31, 'Photo/Video Documentation', '2025-10-29 16:30:05'),

-- Features for package_id 32 (Deluxe Celebration of Life)
(32, 'Designer Casket with Custom Interior', '2025-10-29 16:30:05'),
(32, 'Premium Embalming & Restoration', '2025-10-29 16:30:05'),
(32, 'Grand Memorial Hall (36 hours)', '2025-10-29 16:30:05'),
(32, 'Fleet of Luxury Vehicles', '2025-10-29 16:30:05'),
(32, 'Premium Floral Decorations', '2025-10-29 16:30:05'),
(32, 'Professional Photography & Videography', '2025-10-29 16:30:05'),
(32, 'Memorial Book & Guest Registry', '2025-10-29 16:30:05'),
(32, 'Catering Service for 150 Guests', '2025-10-29 16:30:05'),

-- Features for package_id 33 (Buddhist Basic Service)
(33, 'Buddhist Casket with Lotus Design', '2025-10-29 16:30:05'),
(33, 'Single Monk Chanting Service', '2025-10-29 16:30:05'),
(33, 'Buddhist Altar Setup', '2025-10-29 16:30:05'),
(33, 'Incense and Candle Package', '2025-10-29 16:30:05'),

-- Features for package_id 34 (Buddhist Premium Service)
(34, 'Premium Buddhist Casket', '2025-10-29 16:30:05'),
(34, 'Triple Monk Chanting Ceremony', '2025-10-29 16:30:05'),
(34, 'Elaborate Buddhist Altar', '2025-10-29 16:30:05'),
(34, 'Lotus Lamp Set (108 pcs)', '2025-10-29 16:30:05'),
(34, 'Vegetarian Buffet (50 pax)', '2025-10-29 16:30:05'),
(34, 'Buddhist Scripture Set', '2025-10-29 16:30:05'),

-- Features for package_id 35 (Buddhist Deluxe Service)
(35, 'Luxury Buddhist Casket with Gold Accents', '2025-10-29 16:30:05'),
(35, 'Full Monk Assembly (7 monks)', '2025-10-29 16:30:05'),
(35, 'Grand Buddhist Altar with Buddha Statue', '2025-10-29 16:30:05'),
(35, 'Complete 7-Day Memorial Service', '2025-10-29 16:30:05'),
(35, 'Vegetarian Buffet (100 pax)', '2025-10-29 16:30:05'),
(35, 'Buddhist Prayer Flags & Decorations', '2025-10-29 16:30:05'),
(35, 'Premium Cremation Service', '2025-10-29 16:30:05'),
(35, 'Columbarium Niche (1 year)', '2025-10-29 16:30:05'),

-- Features for package_id 36 (Essential Memorial Service)
(36, 'Basic Wooden Casket', '2025-10-29 16:43:01'),
(36, 'Simple Embalming', '2025-10-29 16:43:01'),
(36, 'Small Memorial Room (8 hours)', '2025-10-29 16:43:01'),
(36, 'Basic Transportation', '2025-10-29 16:43:01'),

-- Features for package_id 100 (Essential Memorial Service)
(100, 'Basic Wooden Casket', '2025-10-29 16:52:24'),
(100, 'Simple Embalming', '2025-10-29 16:52:24'),
(100, 'Small Memorial Room (8 hours)', '2025-10-29 16:52:24'),
(100, 'Basic Transportation', '2025-10-29 16:52:24'),

-- Features for package_id 102 (Premium Tribute Service)
(102, 'Luxury Mahogany Casket', '2025-10-29 16:52:24'),
(102, 'Expert Embalming & Cosmetics', '2025-10-29 16:52:24'),
(102, 'Large Memorial Hall (30 hours)', '2025-10-29 16:52:24'),
(102, 'Executive Hearse & Family Car', '2025-10-29 16:52:24'),
(102, 'Designer Floral Arrangements', '2025-10-29 16:52:24'),
(102, 'Professional Video Recording', '2025-10-29 16:52:24'),
(102, 'Memorial Website Creation', '2025-10-29 16:52:24'),
(102, 'Refreshments for 100 Guests', '2025-10-29 16:52:24')

ON CONFLICT DO NOTHING;

-- Re-enable RLS
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_features ENABLE ROW LEVEL SECURITY;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================
SELECT 'packages' as table_name, COUNT(*) as count FROM packages
UNION ALL
SELECT 'package_features', COUNT(*) FROM package_features;

-- View all imported packages
SELECT 
    package_id,
    provider_id,
    name,
    price,
    is_active,
    is_featured,
    created_at
FROM packages
WHERE package_id IN (23, 26, 30, 31, 32, 33, 34, 35, 36, 100, 102)
ORDER BY package_id;

-- View package features count
SELECT 
    p.package_id,
    p.name,
    COUNT(pf.feature_id) as feature_count
FROM packages p
LEFT JOIN package_features pf ON p.package_id = pf.package_id
WHERE p.package_id IN (23, 26, 30, 31, 32, 33, 34, 35, 36, 100, 102)
GROUP BY p.package_id, p.name
ORDER BY p.package_id;
