-- ============================================
-- FIX BOOKINGS TABLE - ADD MISSING COLUMNS
-- Match database to frontend/backend variables
-- ============================================

USE smart_funeral_system;

-- Add missing columns that frontend expects
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS booking_reference VARCHAR(50) NULL AFTER booking_id,
ADD COLUMN IF NOT EXISTS service_address TEXT NULL AFTER service_location;

-- Verify the structure
SHOW COLUMNS FROM bookings;

SELECT 'Bookings table updated with missing columns' as status;
SELECT 'Added: booking_reference, service_address' as columns_added;
