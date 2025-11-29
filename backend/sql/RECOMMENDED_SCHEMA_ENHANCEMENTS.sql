-- ZENLINK: Recommended Database Schema Enhancements
-- These SQL statements add the improvements discussed in the documentation
-- Run these AFTER reviewing with your live agent

-- ============================================
-- ENHANCEMENT 1: Inventory Tracking for Addons
-- ============================================
-- Add fields to distinguish between services (unlimited) and physical items (stock-limited)

ALTER TABLE provider_addons 
ADD COLUMN addon_type ENUM('service', 'item') DEFAULT 'service' AFTER is_custom,
ADD COLUMN stock_quantity INT DEFAULT NULL AFTER addon_type,
ADD COLUMN min_quantity INT DEFAULT 1 AFTER stock_quantity,
ADD COLUMN max_quantity INT DEFAULT NULL AFTER min_quantity,
ADD COLUMN capacity INT DEFAULT NULL AFTER price COMMENT 'For venue/hall addons';

-- Set existing addons as 'service' type (default)
UPDATE provider_addons SET addon_type = 'service' WHERE addon_type IS NULL;

-- Example: Mark physical items
-- UPDATE provider_addons SET addon_type = 'item', stock_quantity = 10 
-- WHERE addon_name LIKE '%Urn%' OR addon_name LIKE '%Casket%';

-- ============================================
-- ENHANCEMENT 2: Multi-Day Booking Support
-- ============================================
-- Create table to support multi-day funeral services (Wake, Cremation, Prayers)

CREATE TABLE IF NOT EXISTS booking_dates (
    booking_date_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    event_type VARCHAR(50) COMMENT 'wake_day_1, wake_day_2, cremation, prayer, etc.',
    location VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    INDEX idx_booking_date (booking_id, date),
    INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Migrate existing single-date bookings to booking_dates
-- (Only run this once, after creating the table)
-- INSERT INTO booking_dates (booking_id, date, start_time, event_type)
-- SELECT booking_id, service_date, service_time, 'main_service'
-- FROM bookings
-- WHERE service_date IS NOT NULL 
--   AND booking_id NOT IN (SELECT DISTINCT booking_id FROM booking_dates);

-- ============================================
-- ENHANCEMENT 3: Resource Availability Tracking
-- ============================================
-- Track availability of resources (parlours, monks, equipment) for scheduling

CREATE TABLE IF NOT EXISTS resource_availability (
    availability_id INT PRIMARY KEY AUTO_INCREMENT,
    provider_id INT NOT NULL,
    resource_type VARCHAR(50) COMMENT 'parlour, monk, equipment, vehicle',
    resource_name VARCHAR(255) COMMENT 'Hall A, Monk John, Hearse #1',
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    is_available BOOLEAN DEFAULT TRUE,
    booking_id INT NULL COMMENT 'If booked, link to booking',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES service_provider(provider_id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE SET NULL,
    INDEX idx_resource_date (provider_id, resource_type, date),
    INDEX idx_booking (booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- ENHANCEMENT 4: Add Paper Products Category
-- ============================================
-- Add category for Chinese Buddhist/Taoist paper offerings (Zhizha)

INSERT INTO addon_categories (category_name, description, display_order, is_active)
SELECT 'Paper Effigies (Zhizha)', 
       'Traditional Chinese paper offerings including houses, cars, money, and other symbolic items burned during funeral ceremonies',
       8,
       1
WHERE NOT EXISTS (
    SELECT 1 FROM addon_categories WHERE category_name = 'Paper Effigies (Zhizha)'
);

-- ============================================
-- ENHANCEMENT 5: Add Venue Rental Category
-- ============================================
-- Create category for parlour/hall rentals (replaces binary location_type)

INSERT INTO addon_categories (category_name, description, display_order, is_active)
SELECT 'Venue Rental',
       'Funeral parlours, halls, and venue spaces for wake and ceremony services',
       10,
       1
WHERE NOT EXISTS (
    SELECT 1 FROM addon_categories WHERE category_name = 'Venue Rental'
);

-- ============================================
-- ENHANCEMENT 6: Add Quantity to Booking Addons
-- ============================================
-- Allow customers to book multiple quantities of the same addon

ALTER TABLE booking_addons 
ADD COLUMN quantity INT DEFAULT 1 AFTER addon_price;

-- Update existing records to have quantity = 1
UPDATE booking_addons SET quantity = 1 WHERE quantity IS NULL;

-- ============================================
-- ENHANCEMENT 7: Add Stock Tracking History
-- ============================================
-- Track stock changes for audit purposes

CREATE TABLE IF NOT EXISTS addon_stock_history (
    history_id INT PRIMARY KEY AUTO_INCREMENT,
    addon_id INT NOT NULL,
    booking_id INT NULL,
    change_type ENUM('purchase', 'sale', 'adjustment', 'return') NOT NULL,
    quantity_change INT NOT NULL COMMENT 'Positive for stock in, negative for stock out',
    previous_stock INT,
    new_stock INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (addon_id) REFERENCES provider_addons(addon_id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE SET NULL,
    INDEX idx_addon (addon_id),
    INDEX idx_booking (booking_id),
    INDEX idx_date (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- ENHANCEMENT 8: Addon Bundles/Packages
-- ============================================
-- Allow providers to create pre-configured addon bundles

CREATE TABLE IF NOT EXISTS addon_bundles (
    bundle_id INT PRIMARY KEY AUTO_INCREMENT,
    provider_id INT NOT NULL,
    bundle_name VARCHAR(255) NOT NULL,
    description TEXT,
    bundle_price DECIMAL(10,2) COMMENT 'Discounted price if bundle is cheaper than sum of addons',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES service_provider(provider_id) ON DELETE CASCADE,
    INDEX idx_provider (provider_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS addon_bundle_items (
    bundle_item_id INT PRIMARY KEY AUTO_INCREMENT,
    bundle_id INT NOT NULL,
    addon_id INT NOT NULL,
    quantity INT DEFAULT 1,
    FOREIGN KEY (bundle_id) REFERENCES addon_bundles(bundle_id) ON DELETE CASCADE,
    FOREIGN KEY (addon_id) REFERENCES provider_addons(addon_id) ON DELETE CASCADE,
    UNIQUE KEY unique_bundle_addon (bundle_id, addon_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if enhancements were applied
SELECT 
    'Inventory Tracking' as enhancement,
    COUNT(*) as addons_with_type,
    COUNT(CASE WHEN addon_type = 'item' THEN 1 END) as physical_items,
    COUNT(CASE WHEN addon_type = 'service' THEN 1 END) as services
FROM provider_addons
WHERE addon_type IS NOT NULL;

SELECT 
    'Multi-Day Bookings' as enhancement,
    COUNT(*) as total_booking_dates,
    COUNT(DISTINCT booking_id) as bookings_with_dates
FROM booking_dates;

SELECT 
    'Paper Products Category' as enhancement,
    category_id,
    category_name
FROM addon_categories
WHERE category_name LIKE '%Paper%' OR category_name LIKE '%Zhizha%';

SELECT 
    'Venue Rental Category' as enhancement,
    category_id,
    category_name
FROM addon_categories
WHERE category_name LIKE '%Venue%' OR category_name LIKE '%Rental%';

-- ============================================
-- ROLLBACK (if needed)
-- ============================================
-- Uncomment to rollback changes (USE WITH CAUTION)

-- ALTER TABLE provider_addons 
-- DROP COLUMN addon_type,
-- DROP COLUMN stock_quantity,
-- DROP COLUMN min_quantity,
-- DROP COLUMN max_quantity,
-- DROP COLUMN capacity;

-- ALTER TABLE booking_addons DROP COLUMN quantity;

-- DROP TABLE IF EXISTS addon_stock_history;
-- DROP TABLE IF EXISTS addon_bundle_items;
-- DROP TABLE IF EXISTS addon_bundles;
-- DROP TABLE IF EXISTS resource_availability;
-- DROP TABLE IF EXISTS booking_dates;

-- ============================================
-- END OF ENHANCEMENTS
-- ============================================

