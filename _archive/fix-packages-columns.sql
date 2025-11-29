-- Quick check and fix for packages table
USE smart_funeral_system;

-- Show current structure
SELECT 'Current packages table structure:' as info;
SHOW COLUMNS FROM packages;

-- Check if image_url exists and remove it (if you don't want it)
SET @has_image_url = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                      WHERE TABLE_SCHEMA = DATABASE() 
                      AND TABLE_NAME = 'packages' 
                      AND COLUMN_NAME = 'image_url');

SET @sql_remove_image = IF(@has_image_url > 0,
    'ALTER TABLE packages DROP COLUMN image_url',
    'SELECT "image_url column does not exist" AS message');
PREPARE stmt FROM @sql_remove_image;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT '✅ Removed image_url column (if it existed)' as status;

-- Show updated structure
SELECT 'Updated packages table structure:' as info;
SHOW COLUMNS FROM packages;

-- Check a sample package to see location_type values
SELECT 'Sample package data:' as info;
SELECT package_id, name, location_type, capacity, duration_hours, is_featured 
FROM packages 
WHERE provider_id IN (SELECT provider_id FROM service_provider WHERE user_id = 16)
LIMIT 3;