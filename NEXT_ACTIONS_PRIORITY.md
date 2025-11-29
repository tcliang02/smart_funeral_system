# ZENLINK: Next Actions - Priority Order

## ✅ What's Done
- ✅ Database migration completed
- ✅ `addon_id` column added to `booking_addons`
- ✅ Booking creation with multi-day support working
- ✅ Quantity support implemented
- ✅ Test booking created successfully

---

## 🎯 Priority 1: Mark Addons as Items or Services (CRITICAL)

**Why:** Without this, inventory tracking won't work properly. The system needs to know which addons are physical items (with stock) vs services (unlimited).

### Run this in Supabase SQL Editor:

```sql
-- First, see what addons you have
SELECT addon_id, addon_name, addon_type, stock_quantity, category_id
FROM provider_addons
ORDER BY addon_name;

-- Then mark them based on your business logic:

-- Example: Mark physical items (urns, caskets, paper products)
UPDATE provider_addons 
SET addon_type = 'item', 
    stock_quantity = 10  -- Set your actual stock number
WHERE addon_name ILIKE '%urn%' 
   OR addon_name ILIKE '%casket%'
   OR addon_name ILIKE '%paper%'
   OR addon_name ILIKE '%zhizha%'
   OR category_id = (SELECT category_id FROM addon_categories WHERE category_name = 'Paper Effigies (Zhizha)')
   OR category_id = (SELECT category_id FROM addon_categories WHERE category_name = 'Urns & Caskets');

-- Example: Mark services (monks, prayers, ceremonies)
UPDATE provider_addons 
SET addon_type = 'service', 
    stock_quantity = NULL  -- Services are unlimited
WHERE addon_name ILIKE '%monk%' 
   OR addon_name ILIKE '%prayer%'
   OR addon_name ILIKE '%chanting%'
   OR addon_name ILIKE '%ceremony%'
   OR addon_name ILIKE '%ritual%'
   OR category_id = (SELECT category_id FROM addon_categories WHERE category_name = 'Buddhist Rituals & Ceremonies')
   OR category_id = (SELECT category_id FROM addon_categories WHERE category_name = 'Monks & Chanting Services');

-- Verify the updates
SELECT addon_id, addon_name, addon_type, stock_quantity, 
       (SELECT category_name FROM addon_categories WHERE category_id = provider_addons.category_id) as category
FROM provider_addons
ORDER BY addon_type, addon_name;
```

**Action:** Run this SQL and adjust the patterns to match your actual addon names.

---

## 🎯 Priority 2: Verify Inventory Reservation is Working

**Why:** Check if the `ReserveInventory` stored procedure exists and is being called correctly.

### Check if stored procedures exist:

```sql
-- Check if ReserveInventory procedure exists
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('ReserveInventory', 'CheckInventoryAvailability', 'ValidateBooking')
ORDER BY routine_name;
```

### If procedures don't exist, you have two options:

**Option A:** Use the PHP helper functions (already implemented in `backend/availability_helpers.php`)
- ✅ Already working
- ✅ No SQL procedures needed
- ✅ Code handles inventory reservation

**Option B:** Create SQL stored procedures (from `backend/sql/AVAILABILITY_AND_INVENTORY_LOGIC.sql`)
- More database-centric
- Better performance for complex queries
- Requires running the SQL migration

**For now, Option A is fine** - the PHP code handles everything.

---

## 🎯 Priority 3: Test Inventory Availability API

**Why:** Verify the availability check endpoint works correctly.

### Test in browser console:

```javascript
// Test inventory check for Premium Urn (addon_id: 10)
fetch('/api/backend/check-availability', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'inventory',
    addon_id: 10,  // Premium Urn (Test)
    quantity: 2
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Inventory Check:', data);
  // Expected: available_stock should be 3 (5 total - 2 reserved = 3)
});
```

**Expected Result:**
```json
{
  "success": true,
  "type": "inventory",
  "data": {
    "is_available": true,
    "available_stock": 3,
    "total_stock": 5,
    "reserved_quantity": 2,
    "message": "Available: 3 units"
  }
}
```

---

## 🎯 Priority 4: Test Inventory Confirmation (Stock Decrement)

**Why:** When a booking is confirmed/paid, stock should decrease.

### Step 1: Check current stock

```sql
-- Check stock before confirmation
SELECT addon_id, addon_name, addon_type, stock_quantity
FROM provider_addons
WHERE addon_id = 10;  -- Premium Urn (Test)
```

### Step 2: Confirm the booking

Update booking status to 'confirmed' via your admin panel or API:

```sql
-- Manually confirm the test booking
UPDATE bookings
SET status = 'confirmed'
WHERE booking_id = (SELECT booking_id FROM bookings ORDER BY created_at DESC LIMIT 1);
```

### Step 3: Check stock after confirmation

```sql
-- Check stock after confirmation
SELECT addon_id, addon_name, addon_type, stock_quantity
FROM provider_addons
WHERE addon_id = 10;
```

**Expected:** Stock should decrease from 5 to 3 (5 - 2 reserved = 3)

**Note:** If stock doesn't decrease, check if `updateBookingStatus.php` is calling `confirmInventory()`.

---

## 🎯 Priority 5: Set Up Background Job (Release Expired Reservations)

**Why:** Automatically release inventory reservations after 15 minutes if payment isn't received.

### Option A: Supabase Edge Function (Recommended)

1. Go to Supabase Dashboard → Edge Functions
2. Create a new function called `release-expired-reservations`
3. Use the code from `backend/php/ReleaseExpiredReservations.php` (adapt to Edge Function format)
4. Set up a cron trigger to run every 5 minutes

### Option B: External Cron Service (Easier for now)

1. Use **cron-job.org** or **EasyCron**
2. Set URL: `https://your-domain.com/backend/ReleaseExpiredReservations.php`
3. Frequency: Every 5 minutes

### Option C: Manual Testing (For Development)

```bash
# Test manually via HTTP
curl https://your-domain.com/backend/ReleaseExpiredReservations.php

# Or if running locally
php backend/ReleaseExpiredReservations.php
```

**For now, manual testing is fine** - set up automation later.

---

## 🎯 Priority 6: Verify Multi-Day Booking Dates

**Why:** Confirm that `booking_dates` table is being populated correctly.

### Check in Supabase:

```sql
-- Check if booking_dates were created for your test booking
SELECT 
    bd.booking_date_id,
    bd.booking_id,
    bd.date,
    bd.event_type,
    bd.start_time,
    bd.end_time,
    b.booking_reference,
    b.customer_name
FROM booking_dates bd
JOIN bookings b ON bd.booking_id = b.booking_id
WHERE bd.booking_id = (SELECT booking_id FROM bookings ORDER BY created_at DESC LIMIT 1)
ORDER BY bd.date;
```

**Expected:** Should see 2 rows (one for each day in `service_dates`)

---

## 🎯 Priority 7: Update Frontend (If Needed)

**Why:** Your booking form may need updates to send new fields.

### Check your booking form component:

1. **Does it send `service_dates[]`?** (for multi-day bookings)
2. **Does it send `quantity` in each addon?** (for quantity support)
3. **Does it send `resources[]`?** (for resource selection - optional for now)

### Example frontend payload:

```javascript
{
  package_id: 103,
  customer_name: "Test User",
  customer_email: "test@example.com",
  customer_phone: "1234567890",
  service_date: "2024-12-15",
  service_dates: [  // ✅ Multi-day support
    { date: "2024-12-15", start_time: "09:00:00", end_time: "18:00:00", event_type: "wake_day_1" },
    { date: "2024-12-16", start_time: "09:00:00", end_time: "18:00:00", event_type: "wake_day_2" }
  ],
  selected_addons: [
    {
      addon_id: 10,  // ✅ Link to provider_addons
      quantity: 2,     // ✅ Quantity support
      addon_name: "Premium Urn",
      price: 1000.00
    }
  ],
  total_amount: 7600.00
}
```

**Note:** Backend is backward compatible - old bookings without these fields will still work!

---

## 📋 Quick Checklist

- [ ] **Priority 1:** Mark addons as items/services
- [ ] **Priority 2:** Verify inventory reservation (check if procedures exist)
- [ ] **Priority 3:** Test inventory availability API
- [ ] **Priority 4:** Test inventory confirmation (stock decrement)
- [ ] **Priority 5:** Set up background job (or test manually)
- [ ] **Priority 6:** Verify multi-day booking dates
- [ ] **Priority 7:** Update frontend (if needed)

---

## 🚀 Recommended Order

1. **Start with Priority 1** (mark addons) - This is critical for inventory tracking
2. **Then Priority 3** (test availability API) - Quick verification
3. **Then Priority 4** (test stock decrement) - Verify full flow
4. **Then Priority 6** (verify multi-day dates) - Confirm feature works
5. **Finally Priority 5 & 7** (background job & frontend) - Polish and automation

---

## 💡 Tips

- **Test incrementally** - Don't try to do everything at once
- **Use the test booking** you already created to verify each step
- **Check Supabase logs** if something doesn't work
- **The system is backward compatible** - old bookings will still work

---

*You're doing great! The core functionality is working. Now it's about fine-tuning and verification.* 🎉

