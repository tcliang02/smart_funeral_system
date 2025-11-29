-- ZENLINK: Query All Packages and Addons
-- Use this script to view all packages and addons in your database
-- Run these queries to verify your data with the live agent

-- ============================================
-- 1. ALL PACKAGES WITH THEIR FEATURES
-- ============================================
SELECT 
    p.package_id,
    p.provider_id,
    sp.company_name AS provider_name,
    p.name AS package_name,
    p.description,
    p.price AS base_price,
    p.capacity,
    p.duration_hours,
    p.location_type,
    p.is_featured,
    p.is_active,
    GROUP_CONCAT(pf.feature_name SEPARATOR ', ') AS features,
    p.created_at
FROM packages p
LEFT JOIN service_provider sp ON p.provider_id = sp.provider_id
LEFT JOIN package_features pf ON p.package_id = pf.package_id
GROUP BY p.package_id
ORDER BY sp.company_name, p.name;

-- ============================================
-- 2. ALL ADDON CATEGORIES
-- ============================================
SELECT 
    category_id,
    category_name,
    description,
    is_active,
    display_order,
    created_at
FROM addon_categories
ORDER BY display_order, category_name;

-- ============================================
-- 3. ALL ADDONS GROUPED BY CATEGORY
-- ============================================
SELECT 
    c.category_id,
    c.category_name,
    c.display_order AS category_order,
    pa.addon_id,
    pa.provider_id,
    sp.company_name AS provider_name,
    pa.addon_name,
    pa.description,
    pa.price,
    pa.is_active,
    pa.is_custom,
    pa.template_id,
    pa.created_at
FROM addon_categories c
JOIN provider_addons pa ON c.category_id = pa.category_id
LEFT JOIN service_provider sp ON pa.provider_id = sp.provider_id
ORDER BY c.display_order, c.category_name, sp.company_name, pa.addon_name;

-- ============================================
-- 4. ADDONS BY PROVIDER (for specific provider)
-- ============================================
-- Replace ? with provider_id
SELECT 
    c.category_name,
    pa.addon_name,
    pa.description,
    pa.price,
    pa.is_active,
    pa.is_custom
FROM provider_addons pa
JOIN addon_categories c ON pa.category_id = c.category_id
WHERE pa.provider_id = ?  -- Replace ? with actual provider_id
  AND pa.is_active = 1
ORDER BY c.display_order, pa.addon_name;

-- ============================================
-- 5. PACKAGES BY PROVIDER
-- ============================================
-- Replace ? with provider_id
SELECT 
    p.package_id,
    p.name AS package_name,
    p.description,
    p.price,
    p.capacity,
    p.duration_hours,
    p.location_type,
    p.is_featured,
    p.is_active,
    GROUP_CONCAT(pf.feature_name SEPARATOR ', ') AS features
FROM packages p
LEFT JOIN package_features pf ON p.package_id = pf.package_id
WHERE p.provider_id = ?  -- Replace ? with actual provider_id
GROUP BY p.package_id
ORDER BY p.is_featured DESC, p.name;

-- ============================================
-- 6. RECENT BOOKINGS WITH ADDONS
-- ============================================
SELECT 
    b.booking_id,
    b.booking_reference,
    b.customer_name,
    p.name AS package_name,
    p.price AS package_price,
    b.total_amount,
    b.status,
    b.service_date,
    GROUP_CONCAT(
        CONCAT(ba.addon_name, ' (RM', ba.addon_price, ')') 
        SEPARATOR ', '
    ) AS selected_addons,
    b.created_at
FROM bookings b
JOIN packages p ON b.package_id = p.package_id
LEFT JOIN booking_addons ba ON b.booking_id = ba.booking_id
GROUP BY b.booking_id
ORDER BY b.created_at DESC
LIMIT 20;

-- ============================================
-- 7. BOOKING DETAIL WITH ALL ADDONS (for specific booking)
-- ============================================
-- Replace ? with booking_id
SELECT 
    b.booking_id,
    b.booking_reference,
    b.customer_name,
    b.customer_email,
    b.customer_phone,
    p.name AS package_name,
    p.price AS package_base_price,
    b.total_amount,
    b.service_date,
    b.service_address,
    b.status,
    b.payment_status,
    b.payment_method
FROM bookings b
JOIN packages p ON b.package_id = p.package_id
WHERE b.booking_id = ?;  -- Replace ? with actual booking_id

-- Get addons for this booking
SELECT 
    ba.addon_id,
    ba.addon_name,
    ba.addon_price
FROM booking_addons ba
WHERE ba.booking_id = ?  -- Replace ? with actual booking_id
ORDER BY ba.addon_name;

-- ============================================
-- 8. PROVIDER STATISTICS
-- ============================================
SELECT 
    sp.provider_id,
    sp.company_name,
    sp.total_packages,
    sp.average_price,
    COUNT(DISTINCT p.package_id) AS actual_package_count,
    COUNT(DISTINCT pa.addon_id) AS total_addons,
    COUNT(DISTINCT CASE WHEN pa.is_active = 1 THEN pa.addon_id END) AS active_addons
FROM service_provider sp
LEFT JOIN packages p ON sp.provider_id = p.provider_id
LEFT JOIN provider_addons pa ON sp.provider_id = pa.provider_id
GROUP BY sp.provider_id
ORDER BY sp.company_name;

-- ============================================
-- 9. ADDON TEMPLATES (if using templates)
-- ============================================
SELECT 
    t.template_id,
    c.category_name,
    t.template_name,
    t.description,
    t.suggested_price,
    t.is_popular,
    COUNT(pa.addon_id) AS times_used_by_providers
FROM addon_templates t
JOIN addon_categories c ON t.category_id = c.category_id
LEFT JOIN provider_addons pa ON t.template_id = pa.template_id
GROUP BY t.template_id
ORDER BY c.display_order, t.is_popular DESC, t.template_name;

-- ============================================
-- 10. VERIFICATION QUERIES
-- ============================================

-- Check for packages without features
SELECT 
    p.package_id,
    p.name,
    sp.company_name
FROM packages p
LEFT JOIN service_provider sp ON p.provider_id = sp.provider_id
LEFT JOIN package_features pf ON p.package_id = pf.package_id
WHERE pf.feature_id IS NULL
  AND p.is_active = 1;

-- Check for addons without category
SELECT 
    pa.addon_id,
    pa.addon_name,
    pa.provider_id
FROM provider_addons pa
LEFT JOIN addon_categories c ON pa.category_id = c.category_id
WHERE c.category_id IS NULL;

-- Check for inactive packages still being used
SELECT 
    b.booking_id,
    b.booking_reference,
    p.name AS package_name,
    p.is_active AS package_active,
    b.status AS booking_status
FROM bookings b
JOIN packages p ON b.package_id = p.package_id
WHERE p.is_active = 0
  AND b.status IN ('pending', 'confirmed');

-- Check for inactive addons in bookings
SELECT 
    ba.booking_id,
    ba.addon_name,
    ba.addon_price,
    pa.is_active AS addon_currently_active
FROM booking_addons ba
LEFT JOIN provider_addons pa ON ba.addon_id = pa.addon_id
WHERE pa.is_active = 0 OR pa.addon_id IS NULL;

-- ============================================
-- 11. ANALYTICS: Most Popular Buddhist Addons
-- ============================================
-- Smart Insight: Which Buddhist Rituals are trending?
SELECT 
    pa.addon_name, 
    c.category_name,
    COUNT(ba.booking_addon_id) as total_bookings,
    SUM(ba.addon_price) as total_revenue,
    AVG(ba.addon_price) as average_price,
    COUNT(DISTINCT ba.booking_id) as unique_bookings
FROM booking_addons ba
JOIN provider_addons pa ON ba.addon_id = pa.addon_id
JOIN addon_categories c ON pa.category_id = c.category_id
WHERE c.category_name LIKE '%Buddhist%' 
   OR c.category_name LIKE '%Ritual%'
   OR c.category_name LIKE '%Ceremony%'
GROUP BY pa.addon_id, pa.addon_name, c.category_name
ORDER BY total_bookings DESC, total_revenue DESC;

-- ============================================
-- 12. ANALYTICS: Revenue by Category
-- ============================================
SELECT 
    c.category_name,
    COUNT(DISTINCT ba.booking_id) as bookings_count,
    COUNT(ba.booking_addon_id) as addons_sold,
    SUM(ba.addon_price) as total_revenue,
    AVG(ba.addon_price) as average_addon_price
FROM booking_addons ba
JOIN provider_addons pa ON ba.addon_id = pa.addon_id
JOIN addon_categories c ON pa.category_id = c.category_id
GROUP BY c.category_id, c.category_name
ORDER BY total_revenue DESC;

-- ============================================
-- 13. ANALYTICS: Package Performance
-- ============================================
-- Which packages generate the most revenue?
SELECT 
    p.name AS package_name,
    sp.company_name AS provider_name,
    COUNT(b.booking_id) as total_bookings,
    SUM(b.total_amount) as total_revenue,
    AVG(b.total_amount) as average_booking_value,
    AVG(
        (SELECT COUNT(*) FROM booking_addons ba WHERE ba.booking_id = b.booking_id)
    ) as avg_addons_per_booking
FROM packages p
JOIN service_provider sp ON p.provider_id = sp.provider_id
JOIN bookings b ON p.package_id = b.package_id
WHERE b.status IN ('confirmed', 'completed')
GROUP BY p.package_id, p.name, sp.company_name
ORDER BY total_revenue DESC;

-- ============================================
-- 14. ANALYTICS: Provider Performance
-- ============================================
-- Compare providers by addon sales
SELECT 
    sp.company_name,
    COUNT(DISTINCT b.booking_id) as total_bookings,
    COUNT(ba.booking_addon_id) as total_addons_sold,
    SUM(ba.addon_price) as addon_revenue,
    AVG(ba.addon_price) as avg_addon_price,
    SUM(b.total_amount) as total_booking_revenue
FROM service_provider sp
JOIN bookings b ON sp.provider_id = b.provider_id
LEFT JOIN booking_addons ba ON b.booking_id = ba.booking_id
WHERE b.status IN ('confirmed', 'completed')
GROUP BY sp.provider_id, sp.company_name
ORDER BY addon_revenue DESC;

-- ============================================
-- 15. ANALYTICS: Addon Popularity by Provider
-- ============================================
SELECT 
    sp.company_name,
    pa.addon_name,
    c.category_name,
    COUNT(ba.booking_addon_id) as times_booked,
    SUM(ba.addon_price) as revenue_generated
FROM provider_addons pa
JOIN service_provider sp ON pa.provider_id = sp.provider_id
JOIN addon_categories c ON pa.category_id = c.category_id
LEFT JOIN booking_addons ba ON pa.addon_id = ba.addon_id
GROUP BY sp.provider_id, sp.company_name, pa.addon_id, pa.addon_name, c.category_name
ORDER BY sp.company_name, times_booked DESC;

-- ============================================
-- 16. RECOMMENDED: Check for Inventory Issues
-- ============================================
-- Find addons that might need inventory tracking
-- (Physical items that are frequently booked)
SELECT 
    pa.addon_name,
    c.category_name,
    COUNT(ba.booking_addon_id) as booking_count,
    CASE 
        WHEN c.category_name LIKE '%Urn%' OR c.category_name LIKE '%Casket%' 
             OR c.category_name LIKE '%Item%' THEN 'PHYSICAL ITEM - Needs Stock Tracking'
        ELSE 'SERVICE - Unlimited'
    END as recommendation
FROM provider_addons pa
JOIN addon_categories c ON pa.category_id = c.category_id
LEFT JOIN booking_addons ba ON pa.addon_id = ba.addon_id
GROUP BY pa.addon_id, pa.addon_name, c.category_name
HAVING booking_count > 0
ORDER BY booking_count DESC;

-- ============================================
-- END OF QUERIES
-- ============================================

