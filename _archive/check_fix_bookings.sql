-- Check if bookings table has booking_reference column
USE smart_funeral_system;

-- Show bookings table structure
SHOW COLUMNS FROM bookings;

-- If booking_reference column is missing, this will add it
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS booking_reference VARCHAR(50) NULL AFTER booking_id;

-- Show updated structure
SHOW COLUMNS FROM bookings;

SELECT 'Bookings table structure checked and fixed if needed' as status;
