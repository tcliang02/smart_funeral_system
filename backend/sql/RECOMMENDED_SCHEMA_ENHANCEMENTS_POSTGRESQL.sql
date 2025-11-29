-- ZENLINK: Recommended Database Schema Enhancements (PostgreSQL/Supabase)
-- These SQL statements add the improvements discussed in the documentation
-- Run these AFTER reviewing with your live agent

-- ============================================
-- ENHANCEMENT 1: Inventory Tracking for Addons
-- ============================================
-- Add fields to distinguish between services (unlimited) and physical items (stock-limited)

-- Check if columns exist before adding (PostgreSQL doesn't support IF NOT EXISTS for ALTER TABLE)
DO $$ 
BEGIN
    -- Add addon_type column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'provider_addons' AND column_name = 'addon_type'
    ) THEN
        ALTER TABLE provider_addons 
        ADD COLUMN addon_type VARCHAR(20) DEFAULT 'service' CHECK (addon_type IN ('service', 'item'));
    END IF;
    
    -- Add stock_quantity column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'provider_addons' AND column_name = 'stock_quantity'
    ) THEN
        ALTER TABLE provider_addons 
        ADD COLUMN stock_quantity INTEGER DEFAULT NULL;
    END IF;
    
    -- Add min_quantity column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'provider_addons' AND column_name = 'min_quantity'
    ) THEN
        ALTER TABLE provider_addons 
        ADD COLUMN min_quantity INTEGER DEFAULT 1;
    END IF;
    
    -- Add max_quantity column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'provider_addons' AND column_name = 'max_quantity'
    ) THEN
        ALTER TABLE provider_addons 
        ADD COLUMN max_quantity INTEGER DEFAULT NULL;
    END IF;
    
    -- Add capacity column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'provider_addons' AND column_name = 'capacity'
    ) THEN
        ALTER TABLE provider_addons 
        ADD COLUMN capacity INTEGER DEFAULT NULL;
    END IF;
END $$;

-- Set all existing addons as 'service' type (default)
UPDATE provider_addons SET addon_type = 'service' WHERE addon_type IS NULL;

-- ============================================
-- ENHANCEMENT 2: Multi-Day Booking Support
-- ============================================
-- Create table to support multi-day funeral services (Wake, Cremation, Prayers)

CREATE TABLE IF NOT EXISTS booking_dates (
    booking_date_id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    event_type VARCHAR(50),
    location VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_booking_dates_booking 
        FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_booking_dates_booking_id ON booking_dates(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_dates_date ON booking_dates(date);
CREATE INDEX IF NOT EXISTS idx_booking_dates_booking_date ON booking_dates(booking_id, date);

-- Migrate existing single-date bookings to booking_dates (if table exists and has data)
DO $$
DECLARE
    booking_record RECORD;
BEGIN
    -- Only migrate if bookings table exists and has records without corresponding booking_dates
    FOR booking_record IN 
        SELECT booking_id, service_date, service_time
        FROM bookings
        WHERE service_date IS NOT NULL
          AND booking_id NOT IN (SELECT DISTINCT booking_id FROM booking_dates)
        LIMIT 1000  -- Limit to prevent long-running query
    LOOP
        INSERT INTO booking_dates (booking_id, date, start_time, event_type)
        VALUES (
            booking_record.booking_id,
            booking_record.service_date,
            booking_record.service_time,
            'main_service'
        );
    END LOOP;
END $$;

-- ============================================
-- ENHANCEMENT 3: Resource Availability Tracking
-- ============================================
-- Track availability of resources (parlours, monks, equipment) for scheduling

CREATE TABLE IF NOT EXISTS resource_availability (
    availability_id SERIAL PRIMARY KEY,
    provider_id INTEGER NOT NULL,
    resource_type VARCHAR(50),
    resource_name VARCHAR(255),
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    is_available BOOLEAN DEFAULT TRUE,
    booking_id INTEGER NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_resource_availability_provider 
        FOREIGN KEY (provider_id) REFERENCES service_provider(provider_id) ON DELETE CASCADE,
    CONSTRAINT fk_resource_availability_booking 
        FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_resource_availability_provider ON resource_availability(provider_id, resource_type, date);
CREATE INDEX IF NOT EXISTS idx_resource_availability_booking ON resource_availability(booking_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_resource_availability_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_resource_availability_updated_at ON resource_availability;
CREATE TRIGGER trigger_update_resource_availability_updated_at
    BEFORE UPDATE ON resource_availability
    FOR EACH ROW
    EXECUTE FUNCTION update_resource_availability_updated_at();

-- ============================================
-- ENHANCEMENT 4: Add Paper Products Category
-- ============================================
-- Add category for Chinese Buddhist/Taoist paper offerings (Zhizha)

-- Check if is_active column exists, then insert accordingly
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'addon_categories' AND column_name = 'is_active'
    ) THEN
        INSERT INTO addon_categories (category_name, description, display_order, is_active)
        SELECT 'Paper Effigies (Zhizha)', 
               'Traditional Chinese paper offerings including houses, cars, money, and other symbolic items burned during funeral ceremonies',
               8,
               TRUE
        WHERE NOT EXISTS (
            SELECT 1 FROM addon_categories WHERE category_name = 'Paper Effigies (Zhizha)'
        );
    ELSE
        INSERT INTO addon_categories (category_name, description, display_order)
        SELECT 'Paper Effigies (Zhizha)', 
               'Traditional Chinese paper offerings including houses, cars, money, and other symbolic items burned during funeral ceremonies',
               8
        WHERE NOT EXISTS (
            SELECT 1 FROM addon_categories WHERE category_name = 'Paper Effigies (Zhizha)'
        );
    END IF;
END $$;

-- ============================================
-- ENHANCEMENT 5: Add Venue Rental Category
-- ============================================
-- Create category for parlour/hall rentals (replaces binary location_type)

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'addon_categories' AND column_name = 'is_active'
    ) THEN
        INSERT INTO addon_categories (category_name, description, display_order, is_active)
        SELECT 'Venue Rental',
               'Funeral parlours, halls, and venue spaces for wake and ceremony services',
               10,
               TRUE
        WHERE NOT EXISTS (
            SELECT 1 FROM addon_categories WHERE category_name = 'Venue Rental'
        );
    ELSE
        INSERT INTO addon_categories (category_name, description, display_order)
        SELECT 'Venue Rental',
               'Funeral parlours, halls, and venue spaces for wake and ceremony services',
               10
        WHERE NOT EXISTS (
            SELECT 1 FROM addon_categories WHERE category_name = 'Venue Rental'
        );
    END IF;
END $$;

-- ============================================
-- ENHANCEMENT 6: Add Quantity to Booking Addons
-- ============================================
-- Allow customers to book multiple quantities of the same addon

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'booking_addons' AND column_name = 'quantity'
    ) THEN
        ALTER TABLE booking_addons 
        ADD COLUMN quantity INTEGER DEFAULT 1;
    END IF;
END $$;

-- Update existing records to have quantity = 1
UPDATE booking_addons SET quantity = 1 WHERE quantity IS NULL;

-- ============================================
-- ENHANCEMENT 7: Add Stock Tracking History
-- ============================================
-- Track stock changes for audit purposes

CREATE TABLE IF NOT EXISTS addon_stock_history (
    history_id SERIAL PRIMARY KEY,
    addon_id INTEGER NOT NULL,
    booking_id INTEGER NULL,
    change_type VARCHAR(20) NOT NULL CHECK (change_type IN ('purchase', 'sale', 'adjustment', 'return')),
    quantity_change INTEGER NOT NULL,
    previous_stock INTEGER,
    new_stock INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_stock_history_addon 
        FOREIGN KEY (addon_id) REFERENCES provider_addons(addon_id) ON DELETE CASCADE,
    CONSTRAINT fk_stock_history_booking 
        FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_stock_history_addon ON addon_stock_history(addon_id);
CREATE INDEX IF NOT EXISTS idx_stock_history_booking ON addon_stock_history(booking_id);
CREATE INDEX IF NOT EXISTS idx_stock_history_date ON addon_stock_history(created_at);

-- ============================================
-- ENHANCEMENT 8: Addon Bundles/Packages
-- ============================================
-- Allow providers to create pre-configured addon bundles

CREATE TABLE IF NOT EXISTS addon_bundles (
    bundle_id SERIAL PRIMARY KEY,
    provider_id INTEGER NOT NULL,
    bundle_name VARCHAR(255) NOT NULL,
    description TEXT,
    bundle_price DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_addon_bundles_provider 
        FOREIGN KEY (provider_id) REFERENCES service_provider(provider_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_addon_bundles_provider ON addon_bundles(provider_id);

CREATE TABLE IF NOT EXISTS addon_bundle_items (
    bundle_item_id SERIAL PRIMARY KEY,
    bundle_id INTEGER NOT NULL,
    addon_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    CONSTRAINT fk_bundle_items_bundle 
        FOREIGN KEY (bundle_id) REFERENCES addon_bundles(bundle_id) ON DELETE CASCADE,
    CONSTRAINT fk_bundle_items_addon 
        FOREIGN KEY (addon_id) REFERENCES provider_addons(addon_id) ON DELETE CASCADE,
    CONSTRAINT unique_bundle_addon UNIQUE (bundle_id, addon_id)
);

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
-- ROLLBACK (if needed) - Use with CAUTION
-- ============================================
-- Uncomment to rollback changes

/*
-- Remove columns from provider_addons
ALTER TABLE provider_addons 
DROP COLUMN IF EXISTS addon_type,
DROP COLUMN IF EXISTS stock_quantity,
DROP COLUMN IF EXISTS min_quantity,
DROP COLUMN IF EXISTS max_quantity,
DROP COLUMN IF EXISTS capacity;

-- Remove quantity from booking_addons
ALTER TABLE booking_addons DROP COLUMN IF EXISTS quantity;

-- Drop tables
DROP TABLE IF EXISTS addon_stock_history CASCADE;
DROP TABLE IF EXISTS addon_bundle_items CASCADE;
DROP TABLE IF EXISTS addon_bundles CASCADE;
DROP TABLE IF EXISTS resource_availability CASCADE;
DROP TABLE IF EXISTS booking_dates CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_resource_availability_updated_at() CASCADE;
*/

-- ============================================
-- END OF ENHANCEMENTS
-- ============================================

