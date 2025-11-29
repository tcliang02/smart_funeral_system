-- ============================================
-- Multi-Day Booking Test & Verification Queries
-- ============================================

-- 1. View all bookings with multi-day dates
SELECT 
  b.booking_id,
  b.booking_reference,
  b.customer_name,
  b.service_date as main_service_date,
  COUNT(bd.booking_date_id) as total_dates,
  MIN(bd.date) as first_date,
  MAX(bd.date) as last_date,
  b.status,
  b.total_amount
FROM bookings b
LEFT JOIN booking_dates bd ON b.booking_id = bd.booking_id
GROUP BY b.booking_id, b.booking_reference, b.customer_name, b.service_date, b.status, b.total_amount
ORDER BY b.booking_id DESC
LIMIT 10;

-- 2. Get detailed multi-day booking information
-- Replace 123 with your booking_id
SELECT 
  b.booking_id,
  b.booking_reference,
  b.customer_name,
  b.customer_email,
  b.customer_phone,
  b.service_date as main_date,
  b.status,
  bd.date,
  bd.start_time,
  bd.end_time,
  bd.event_type,
  bd.location
FROM bookings b
JOIN booking_dates bd ON b.booking_id = bd.booking_id
WHERE b.booking_id = 123  -- ⚠️ Change this to your booking ID
ORDER BY bd.date, bd.start_time;

-- 3. Find all multi-day bookings (more than 1 date)
SELECT 
  b.booking_id,
  b.booking_reference,
  b.customer_name,
  COUNT(bd.booking_date_id) as total_dates,
  STRING_AGG(bd.date::text, ', ' ORDER BY bd.date) as all_dates,
  STRING_AGG(bd.event_type, ', ' ORDER BY bd.date) as event_types
FROM bookings b
JOIN booking_dates bd ON b.booking_id = bd.booking_id
GROUP BY b.booking_id, b.booking_reference, b.customer_name
HAVING COUNT(bd.booking_date_id) > 1
ORDER BY b.booking_id DESC;

-- 4. Get package IDs for testing (to use in API calls)
SELECT 
  package_id,
  name,
  price,
  provider_id
FROM packages
WHERE provider_id IS NOT NULL
ORDER BY package_id
LIMIT 5;

-- 5. Check for date conflicts (overlapping dates)
SELECT 
  b1.booking_id as booking_1,
  b2.booking_id as booking_2,
  bd1.date,
  bd1.start_time,
  bd1.end_time,
  bd1.event_type,
  bd2.date as conflict_date,
  bd2.start_time as conflict_start,
  bd2.end_time as conflict_end
FROM booking_dates bd1
JOIN booking_dates bd2 ON bd1.date = bd2.date
JOIN bookings b1 ON bd1.booking_id = b1.booking_id
JOIN bookings b2 ON bd2.booking_id = b2.booking_id
WHERE bd1.booking_id != bd2.booking_id
  AND bd1.date = bd2.date
  AND (
    (bd1.start_time <= bd2.end_time AND bd1.end_time >= bd2.start_time)
  )
  AND b1.status != 'cancelled'
  AND b2.status != 'cancelled'
ORDER BY bd1.date;

-- 6. Count bookings by number of days
SELECT 
  CASE 
    WHEN COUNT(bd.booking_date_id) = 1 THEN 'Single Day'
    WHEN COUNT(bd.booking_date_id) = 2 THEN '2 Days'
    WHEN COUNT(bd.booking_date_id) = 3 THEN '3 Days'
    WHEN COUNT(bd.booking_date_id) = 4 THEN '4 Days'
    ELSE '5+ Days'
  END as booking_duration,
  COUNT(DISTINCT b.booking_id) as booking_count
FROM bookings b
LEFT JOIN booking_dates bd ON b.booking_id = bd.booking_id
GROUP BY b.booking_id
ORDER BY booking_duration;

-- 7. Get latest multi-day booking details
SELECT 
  b.booking_id,
  b.booking_reference,
  b.customer_name,
  b.service_date,
  json_agg(
    json_build_object(
      'date', bd.date,
      'start_time', bd.start_time,
      'end_time', bd.end_time,
      'event_type', bd.event_type
    ) ORDER BY bd.date
  ) as all_dates
FROM bookings b
JOIN booking_dates bd ON b.booking_id = bd.booking_id
WHERE b.booking_id = (
  SELECT booking_id 
  FROM bookings 
  ORDER BY booking_id DESC 
  LIMIT 1
)
GROUP BY b.booking_id, b.booking_reference, b.customer_name, b.service_date;

-- 8. Delete test booking (use with caution!)
-- DELETE FROM booking_dates WHERE booking_id = 123;
-- DELETE FROM bookings WHERE booking_id = 123;

