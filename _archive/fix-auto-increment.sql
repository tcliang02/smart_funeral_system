-- ===================================================================
-- FIX BOOKINGS TABLE - AUTO_INCREMENT MISSING
-- Run this in HeidiSQL to fix the booking_id AUTO_INCREMENT issue
-- ===================================================================

-- Step 1: Check current bookings table structure
SELECT 'Current bookings table structure:' as Info;
DESCRIBE bookings;

-- Step 2: Check if booking_id has AUTO_INCREMENT
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    COLUMN_KEY, 
    EXTRA 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'smart_funeral_system' 
AND TABLE_NAME = 'bookings' 
AND COLUMN_NAME = 'booking_id';

-- Step 3: Fix booking_id to be AUTO_INCREMENT PRIMARY KEY
-- CRITICAL: provider_reviews and tributes have booking_id as VARCHAR(20), 
-- but bookings.booking_id is INT(11). We need to fix the data type mismatch!

-- Drop foreign key constraints ONLY if they exist (using conditional statements)
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
               WHERE CONSTRAINT_SCHEMA = 'smart_funeral_system' 
               AND TABLE_NAME = 'provider_reviews' 
               AND CONSTRAINT_NAME = 'provider_reviews_ibfk_3');
SET @sqlstmt := IF(@exist > 0, 'ALTER TABLE `provider_reviews` DROP FOREIGN KEY `provider_reviews_ibfk_3`', 'SELECT "FK provider_reviews_ibfk_3 does not exist"');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
               WHERE CONSTRAINT_SCHEMA = 'smart_funeral_system' 
               AND TABLE_NAME = 'tributes' 
               AND CONSTRAINT_NAME = 'tributes_ibfk_1');
SET @sqlstmt := IF(@exist > 0, 'ALTER TABLE `tributes` DROP FOREIGN KEY `tributes_ibfk_1`', 'SELECT "FK tributes_ibfk_1 does not exist"');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Change booking_id data type in provider_reviews from VARCHAR to INT
ALTER TABLE `provider_reviews` 
MODIFY COLUMN `booking_id` INT(11) NULL;

-- Change booking_id data type in tributes from VARCHAR to INT
ALTER TABLE `tributes` 
MODIFY COLUMN `booking_id` INT(11) NULL;

-- Now modify the booking_id column in bookings to add AUTO_INCREMENT
ALTER TABLE `bookings` 
MODIFY COLUMN `booking_id` INT(11) NOT NULL AUTO_INCREMENT;

-- Recreate the foreign key constraints (now with matching data types)
ALTER TABLE `provider_reviews` 
ADD CONSTRAINT `provider_reviews_ibfk_3` 
FOREIGN KEY (`booking_id`) 
REFERENCES `bookings` (`booking_id`) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

ALTER TABLE `tributes` 
ADD CONSTRAINT `tributes_ibfk_1` 
FOREIGN KEY (`booking_id`) 
REFERENCES `bookings` (`booking_id`) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Step 4: Verify the fix
SELECT 'Updated bookings table structure:' as Info;
DESCRIBE bookings;

SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    COLUMN_KEY, 
    EXTRA 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'smart_funeral_system' 
AND TABLE_NAME = 'bookings' 
AND COLUMN_NAME = 'booking_id';

-- Step 5: Also check and fix booking_addons table
SELECT 'booking_addons table structure:' as Info;
DESCRIBE booking_addons;

-- Just modify the column to add AUTO_INCREMENT (keep existing primary key)
ALTER TABLE `booking_addons` 
MODIFY COLUMN `booking_addon_id` INT(11) NOT NULL AUTO_INCREMENT;

SELECT '=== FIX COMPLETE - AUTO_INCREMENT ADDED ===' as Status;
