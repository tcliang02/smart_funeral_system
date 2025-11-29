-- Add default templates for Venue Rental and Paper Effigies (Zhizha) categories
-- Run this in Supabase SQL Editor

-- First, get the category IDs
DO $$
DECLARE
    venue_category_id INTEGER;
    paper_category_id INTEGER;
BEGIN
    -- Get Venue Rental category ID
    SELECT category_id INTO venue_category_id
    FROM addon_categories
    WHERE category_name ILIKE '%venue%rental%' OR category_name ILIKE '%rental%'
    LIMIT 1;

    -- Get Paper Effigies category ID
    SELECT category_id INTO paper_category_id
    FROM addon_categories
    WHERE category_name ILIKE '%paper%' OR category_name ILIKE '%zhizha%'
    LIMIT 1;

    -- Insert Venue Rental Templates
    IF venue_category_id IS NOT NULL THEN
        -- Hall A (Small)
        INSERT INTO addon_templates (category_id, template_name, description, suggested_price, is_popular)
        SELECT venue_category_id, 'Hall A (Small)', 'Small funeral hall suitable for intimate gatherings (up to 50 guests). Air-conditioned with basic facilities.', 500.00, false
        WHERE NOT EXISTS (
            SELECT 1 FROM addon_templates 
            WHERE category_id = venue_category_id AND template_name = 'Hall A (Small)'
        );

        -- Hall B (Medium)
        INSERT INTO addon_templates (category_id, template_name, description, suggested_price, is_popular)
        SELECT venue_category_id, 'Hall B (Medium)', 'Medium-sized funeral hall suitable for standard services (up to 100 guests). Fully air-conditioned with comfortable seating.', 800.00, true
        WHERE NOT EXISTS (
            SELECT 1 FROM addon_templates 
            WHERE category_id = venue_category_id AND template_name = 'Hall B (Medium)'
        );

        -- Hall C (VIP/Large)
        INSERT INTO addon_templates (category_id, template_name, description, suggested_price, is_popular)
        SELECT venue_category_id, 'Hall C (VIP/Large)', 'Large VIP funeral hall for grand ceremonies (up to 200 guests). Premium facilities with VIP lounge area.', 1500.00, false
        WHERE NOT EXISTS (
            SELECT 1 FROM addon_templates 
            WHERE category_id = venue_category_id AND template_name = 'Hall C (VIP/Large)'
        );

        -- Main Parlour
        INSERT INTO addon_templates (category_id, template_name, description, suggested_price, is_popular)
        SELECT venue_category_id, 'Main Parlour', 'Main funeral parlour with all standard facilities. Suitable for most funeral services.', 1000.00, true
        WHERE NOT EXISTS (
            SELECT 1 FROM addon_templates 
            WHERE category_id = venue_category_id AND template_name = 'Main Parlour'
        );
    END IF;

    -- Insert Paper Effigies (Zhizha) Templates
    IF paper_category_id IS NOT NULL THEN
        -- Paper House
        INSERT INTO addon_templates (category_id, template_name, description, suggested_price, is_popular)
        SELECT paper_category_id, 'Paper House (Villa)', 'Traditional Chinese paper house/villa for the deceased. Symbolizes providing a home in the afterlife.', 200.00, true
        WHERE NOT EXISTS (
            SELECT 1 FROM addon_templates 
            WHERE category_id = paper_category_id AND template_name = 'Paper House (Villa)'
        );

        -- Paper Car
        INSERT INTO addon_templates (category_id, template_name, description, suggested_price, is_popular)
        SELECT paper_category_id, 'Paper Car (Luxury)', 'Luxury paper car for transportation in the afterlife. Available in various models.', 150.00, true
        WHERE NOT EXISTS (
            SELECT 1 FROM addon_templates 
            WHERE category_id = paper_category_id AND template_name = 'Paper Car (Luxury)'
        );

        -- Paper Money Set
        INSERT INTO addon_templates (category_id, template_name, description, suggested_price, is_popular)
        SELECT paper_category_id, 'Paper Money Set (Gold/Silver)', 'Traditional gold and silver paper money bundles. Standard offering for the deceased.', 50.00, true
        WHERE NOT EXISTS (
            SELECT 1 FROM addon_templates 
            WHERE category_id = paper_category_id AND template_name = 'Paper Money Set (Gold/Silver)'
        );

        -- Paper Clothes Set
        INSERT INTO addon_templates (category_id, template_name, description, suggested_price, is_popular)
        SELECT paper_category_id, 'Paper Clothes Set', 'Complete set of paper clothing including traditional garments for the deceased.', 80.00, false
        WHERE NOT EXISTS (
            SELECT 1 FROM addon_templates 
            WHERE category_id = paper_category_id AND template_name = 'Paper Clothes Set'
        );

        -- Paper Electronics Set
        INSERT INTO addon_templates (category_id, template_name, description, suggested_price, is_popular)
        SELECT paper_category_id, 'Paper Electronics Set', 'Modern paper offerings including phone, TV, and other electronics for the afterlife.', 100.00, false
        WHERE NOT EXISTS (
            SELECT 1 FROM addon_templates 
            WHERE category_id = paper_category_id AND template_name = 'Paper Electronics Set'
        );

        -- Paper Servant Set
        INSERT INTO addon_templates (category_id, template_name, description, suggested_price, is_popular)
        SELECT paper_category_id, 'Paper Servant Set', 'Paper servants to assist the deceased in the afterlife. Traditional offering.', 120.00, false
        WHERE NOT EXISTS (
            SELECT 1 FROM addon_templates 
            WHERE category_id = paper_category_id AND template_name = 'Paper Servant Set'
        );

        -- Complete Paper Offering Package
        INSERT INTO addon_templates (category_id, template_name, description, suggested_price, is_popular)
        SELECT paper_category_id, 'Complete Paper Offering Package', 'Comprehensive package including house, car, money, clothes, and electronics. Best value for complete offerings.', 500.00, true
        WHERE NOT EXISTS (
            SELECT 1 FROM addon_templates 
            WHERE category_id = paper_category_id AND template_name = 'Complete Paper Offering Package'
        );
    END IF;

    -- Display results
    RAISE NOTICE 'Venue Rental category ID: %', venue_category_id;
    RAISE NOTICE 'Paper Effigies category ID: %', paper_category_id;
END $$;

-- Verify templates were added
SELECT 
    c.category_name,
    COUNT(t.template_id) as template_count,
    STRING_AGG(t.template_name, ', ' ORDER BY t.template_name) as templates
FROM addon_categories c
LEFT JOIN addon_templates t ON c.category_id = t.category_id
WHERE c.category_name ILIKE '%venue%' 
   OR c.category_name ILIKE '%rental%'
   OR c.category_name ILIKE '%paper%'
   OR c.category_name ILIKE '%zhizha%'
GROUP BY c.category_id, c.category_name
ORDER BY c.category_name;


