-- Add rsvp_max_guests column to tributes table in Supabase PostgreSQL
-- Run this in Supabase SQL Editor

-- Check if column exists first, then add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'tributes' 
        AND column_name = 'rsvp_max_guests'
    ) THEN
        ALTER TABLE tributes 
        ADD COLUMN rsvp_max_guests INTEGER NULL;
        
        RAISE NOTICE 'Column rsvp_max_guests added successfully';
    ELSE
        RAISE NOTICE 'Column rsvp_max_guests already exists';
    END IF;
END $$;

