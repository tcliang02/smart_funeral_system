-- ========================================
-- CHECK LOCATION_TYPE CONSTRAINT IN SUPABASE
-- Run this first to see what values are allowed
-- ========================================

-- Check the constraint definition
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'packages'::regclass
AND conname LIKE '%location_type%';

-- Alternative: Check the column definition
SELECT 
    column_name,
    data_type,
    udt_name,
    column_default
FROM information_schema.columns
WHERE table_name = 'packages'
AND column_name = 'location_type';

-- Check existing values in the table
SELECT DISTINCT location_type
FROM packages
ORDER BY location_type;

