-- ========================================
-- FIX LOCATION_TYPE CONSTRAINT IN SUPABASE
-- If you want to allow 'venue' as a valid value
-- ========================================

-- First, check the current constraint
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'packages'::regclass
AND conname LIKE '%location_type%';

-- Drop the existing constraint (replace 'packages_location_type_check' with actual name from above)
-- ALTER TABLE packages DROP CONSTRAINT packages_location_type_check;

-- Add new constraint that allows 'home', 'venue', and 'both'
-- ALTER TABLE packages ADD CONSTRAINT packages_location_type_check 
--     CHECK (location_type IN ('home', 'venue', 'both'));

-- OR if it's an ENUM type, you might need to:
-- ALTER TYPE location_type_enum ADD VALUE 'venue';

-- Note: Run CHECK_LOCATION_TYPE_CONSTRAINT.sql first to see the actual constraint name

