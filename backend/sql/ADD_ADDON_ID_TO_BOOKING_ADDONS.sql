-- Add addon_id column to booking_addons table (required for inventory tracking)
-- Run this in Supabase SQL Editor

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'booking_addons' AND column_name = 'addon_id'
    ) THEN
        ALTER TABLE booking_addons 
        ADD COLUMN addon_id INTEGER NULL,
        ADD CONSTRAINT fk_booking_addons_addon 
            FOREIGN KEY (addon_id) REFERENCES provider_addons(addon_id) ON DELETE SET NULL;
        
        CREATE INDEX IF NOT EXISTS idx_booking_addons_addon_id ON booking_addons(addon_id);
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'booking_addons' 
ORDER BY ordinal_position;

