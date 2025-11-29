-- ============================================
-- FIX BOOKINGS TABLE - ADD ALL MISSING COLUMNS
-- Match database to what backend queries expect
-- ============================================

USE smart_funeral_system;

-- Show current structure
SELECT 'Current bookings table structure:' as info;
SHOW COLUMNS FROM bookings;

-- Add all missing columns that backend/frontend expect
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS booking_reference VARCHAR(50) NULL AFTER booking_id,
ADD COLUMN IF NOT EXISTS service_address TEXT NULL AFTER service_time,
ADD COLUMN IF NOT EXISTS special_requirements TEXT NULL AFTER special_requests,
ADD COLUMN IF NOT EXISTS provider_notes TEXT NULL AFTER special_requirements,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT NULL AFTER provider_notes,
ADD COLUMN IF NOT EXISTS cancelled_by VARCHAR(50) NULL AFTER cancellation_reason,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP NULL AFTER cancelled_by,
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP NULL AFTER cancelled_at,
ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10,2) NULL AFTER confirmed_at;

-- Show updated structure
SELECT 'Updated bookings table structure:' as info;
SHOW COLUMNS FROM bookings;

SELECT 'SUCCESS: All missing booking columns added!' as status;
SELECT 'Your database now matches your frontend and backend!' as result;
