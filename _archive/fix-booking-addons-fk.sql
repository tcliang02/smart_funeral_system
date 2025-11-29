-- ===================================================================
-- SQL SCRIPT TO FIX BOOKING_ADDONS FOREIGN KEY ISSUE
-- Run this in HeidiSQL to fix your database structure
-- ===================================================================

-- Step 1: Check current structure
SELECT 'Current booking_addons structure:' as Info;
DESCRIBE booking_addons;

SELECT 'Current foreign keys on booking_addons:' as Info;
SELECT 
    CONSTRAINT_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'smart_funeral_system'
AND TABLE_NAME = 'booking_addons'
AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Step 2: Drop the existing foreign key constraint
ALTER TABLE `booking_addons` DROP FOREIGN KEY `booking_addons_ibfk_1`;

-- Step 3: Recreate the foreign key with proper cascade
ALTER TABLE `booking_addons` 
ADD CONSTRAINT `booking_addons_ibfk_1` 
FOREIGN KEY (`booking_id`) 
REFERENCES `bookings` (`booking_id`) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Step 4: Check if addon_id foreign key exists, if not create it
-- First check if the constraint exists
SELECT 'Checking for addon_id foreign key:' as Info;
SELECT CONSTRAINT_NAME 
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = 'smart_funeral_system' 
AND TABLE_NAME = 'booking_addons' 
AND COLUMN_NAME = 'addon_id'
AND REFERENCED_TABLE_NAME IS NOT NULL;

-- If addon_id has a foreign key, drop and recreate it
-- (Only run if addon_id foreign key exists)
-- ALTER TABLE `booking_addons` DROP FOREIGN KEY `booking_addons_ibfk_2`;

-- Make sure addon_id can be NULL (for custom addons)
ALTER TABLE `booking_addons` 
MODIFY COLUMN `addon_id` INT(11) NULL;

-- Recreate addon_id foreign key if it should reference addons table
-- (Only if you have an addons table)
-- ALTER TABLE `booking_addons` 
-- ADD CONSTRAINT `booking_addons_ibfk_2` 
-- FOREIGN KEY (`addon_id`) 
-- REFERENCES `addons` (`addon_id`) 
-- ON DELETE SET NULL 
-- ON UPDATE CASCADE;

-- Step 5: Verify the changes
SELECT 'Updated foreign keys on booking_addons:' as Info;
SELECT 
    CONSTRAINT_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'smart_funeral_system'
AND TABLE_NAME = 'booking_addons'
AND REFERENCED_TABLE_NAME IS NOT NULL;

SELECT 'booking_addons table structure after fix:' as Info;
DESCRIBE booking_addons;

-- Step 6: Check table engine (should be InnoDB for foreign keys)
SELECT 'Table engines:' as Info;
SELECT TABLE_NAME, ENGINE 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'smart_funeral_system' 
AND TABLE_NAME IN ('bookings', 'booking_addons');

SELECT '=== FIX COMPLETE ===' as Status;
