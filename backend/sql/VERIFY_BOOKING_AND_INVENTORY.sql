-- Verification Queries for Booking Creation
-- Run these in Supabase SQL Editor after creating a booking

-- ============================================
-- 1. Check Latest Booking
-- ============================================
SELECT 
    b.booking_id,
    b.booking_reference,
    b.customer_name,
    b.status,
    b.total_amount,
    b.service_date,
    b.created_at
FROM bookings b
ORDER BY b.created_at DESC
LIMIT 1;

-- ============================================
-- 2. Check Multi-Day Booking Dates
-- ============================================
SELECT 
    bd.booking_date_id,
    bd.booking_id,
    bd.date,
    bd.event_type,
    bd.start_time,
    bd.end_time
FROM booking_dates bd
WHERE bd.booking_id = (SELECT booking_id FROM bookings ORDER BY created_at DESC LIMIT 1)
ORDER BY bd.date;

-- ============================================
-- 3. Check Addons with Inventory Info
-- ============================================
SELECT 
    ba.booking_addon_id,
    ba.addon_id,
    ba.addon_name,
    ba.quantity,
    ba.addon_price,
    pa.addon_type,
    pa.stock_quantity as current_stock,
    pa.addon_name as provider_addon_name
FROM booking_addons ba
LEFT JOIN provider_addons pa ON ba.addon_id = pa.addon_id
WHERE ba.booking_id = (SELECT booking_id FROM bookings ORDER BY created_at DESC LIMIT 1)
ORDER BY ba.booking_addon_id;

-- ============================================
-- 4. Check Inventory Reservation Status
-- ============================================
-- For physical items, check if stock was reserved
SELECT 
    pa.addon_id,
    pa.addon_name,
    pa.addon_type,
    pa.stock_quantity as total_stock,
    COALESCE(SUM(CASE 
        WHEN b.status IN ('pending', 'confirmed') 
        THEN ba.quantity 
        ELSE 0 
    END), 0) as reserved_quantity,
    (pa.stock_quantity - COALESCE(SUM(CASE 
        WHEN b.status IN ('pending', 'confirmed') 
        THEN ba.quantity 
        ELSE 0 
    END), 0)) as available_stock
FROM provider_addons pa
LEFT JOIN booking_addons ba ON pa.addon_id = ba.addon_id
LEFT JOIN bookings b ON ba.booking_id = b.booking_id
WHERE pa.addon_id = 10  -- Premium Urn (Test)
GROUP BY pa.addon_id, pa.addon_name, pa.addon_type, pa.stock_quantity;

-- ============================================
-- 5. Check Stock History (if addon_stock_history exists)
-- ============================================
SELECT 
    history_id,
    addon_id,
    booking_id,
    change_type,
    quantity_change,
    previous_stock,
    new_stock,
    notes,
    created_at
FROM addon_stock_history
WHERE addon_id = 10  -- Premium Urn (Test)
ORDER BY created_at DESC
LIMIT 5;

