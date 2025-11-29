# ZENLINK: Post-Migration Steps - What to Do Next

## ✅ Step 1: Verify Migration Worked

Run this in Supabase SQL Editor to verify everything was created:

```sql
-- Check if new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('booking_dates', 'resource_availability', 'addon_stock_history', 'addon_bundles', 'addon_bundle_items')
ORDER BY table_name;

-- Check if new columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'provider_addons'
  AND column_name IN ('addon_type', 'stock_quantity', 'capacity', 'min_quantity', 'max_quantity')
ORDER BY column_name;

-- Check if quantity column was added to booking_addons
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'booking_addons'
  AND column_name = 'quantity';
```

**Expected Results:**
- ✅ 5 new tables should exist
- ✅ 5 new columns in `provider_addons`
- ✅ 1 new column `quantity` in `booking_addons`

---

## ✅ Step 2: Mark Your Addons as Items or Services

This is important! You need to tell the system which addons are physical items (with stock) vs services (unlimited).

### In Supabase SQL Editor:

```sql
-- Mark physical items (urns, caskets, etc.)
UPDATE provider_addons 
SET addon_type = 'item', 
    stock_quantity = 10  -- Set your actual stock number
WHERE addon_name ILIKE '%urn%' 
   OR addon_name ILIKE '%casket%'
   OR addon_name ILIKE '%item%'
   OR addon_name ILIKE '%paper%';

-- Mark services (monks, prayers, etc.) - unlimited
UPDATE provider_addons 
SET addon_type = 'service', 
    stock_quantity = NULL
WHERE addon_name ILIKE '%monk%' 
   OR addon_name ILIKE '%prayer%'
   OR addon_name ILIKE '%service%'
   OR addon_name ILIKE '%chanting%';

-- Verify the updates
SELECT addon_id, addon_name, addon_type, stock_quantity
FROM provider_addons
ORDER BY addon_type, addon_name;
```

**Note:** Adjust the `ILIKE` patterns to match your actual addon names.

---

## ✅ Step 3: Test the Availability Check API

Test if the new availability checking works:

### Option A: Using Browser Console

1. Open your website
2. Open browser console (F12)
3. Run this:

```javascript
// Test Inventory Availability
fetch('/api/backend/check-availability', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'inventory',
    addon_id: 1,  // Replace with an actual addon_id that has addon_type = 'item'
    quantity: 2
  })
})
.then(r => r.json())
.then(data => console.log('Inventory Check:', data));

// Test Resource Availability
fetch('/api/backend/check-availability', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'resource',
    provider_id: 1,
    resource_type: 'parlour',
    resource_name: 'Hall A',
    start_date: '2024-12-15',
    end_date: '2024-12-17'
  })
})
.then(r => r.json())
.then(data => console.log('Resource Check:', data));
```

### Option B: Using Postman or curl

```bash
# Test inventory check
curl -X POST http://your-domain.com/api/backend/check-availability \
  -H "Content-Type: application/json" \
  -d '{
    "type": "inventory",
    "addon_id": 1,
    "quantity": 2
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "type": "inventory",
  "data": {
    "is_available": true,
    "available_stock": 10,
    "total_stock": 10,
    "reserved_quantity": 0,
    "message": "Available: 10 units"
  }
}
```

---

## ✅ Step 4: Test Booking Creation with Validation

Create a test booking to verify validation works:

```javascript
fetch('/api/backend/createBooking', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    package_id: 1,  // Replace with actual package_id
    customer_name: "Test User",
    customer_email: "test@example.com",
    customer_phone: "1234567890",
    service_date: "2024-12-15",
    service_dates: [
      {
        date: "2024-12-15",
        start_time: "09:00:00",
        end_time: "18:00:00",
        event_type: "wake_day_1"
      }
    ],
    selected_addons: [
      {
        addon_id: 1,  // Replace with actual addon_id
        quantity: 1,
        addon_name: "Test Addon",
        price: 100.00
      }
    ],
    total_amount: 2100.00
  })
})
.then(r => r.json())
.then(data => {
  console.log('Booking Created:', data);
  if (data.success) {
    console.log('✅ Booking ID:', data.booking_id);
    console.log('✅ Booking Reference:', data.booking_reference);
  } else {
    console.error('❌ Error:', data.message);
  }
});
```

**Expected:** Booking created successfully with validation passed.

---

## ✅ Step 5: Set Up Background Job (Release Expired Reservations)

This automatically releases inventory reservations after 15 minutes if payment isn't received.

### Option A: Supabase Edge Function (Recommended for Supabase)

1. **Create Edge Function:**
   ```bash
   supabase functions new release-expired-reservations
   ```

2. **Or use External Cron Service:**
   - Use **cron-job.org** or **EasyCron**
   - Set to call: `https://your-domain.com/backend/ReleaseExpiredReservations.php`
   - Frequency: Every 5 minutes

### Option B: Manual Testing (For Now)

You can test it manually by calling:
```bash
# Via HTTP
curl https://your-domain.com/backend/ReleaseExpiredReservations.php

# Or if running locally
php backend/ReleaseExpiredReservations.php
```

**For production, you'll want this automated.** But for testing, manual is fine.

---

## ✅ Step 6: Test Inventory Confirmation

When a booking status changes to 'confirmed', inventory should be decremented:

1. **Create a booking** with a physical item (addon_type = 'item')
2. **Check stock before:**
   ```sql
   SELECT addon_id, addon_name, stock_quantity
   FROM provider_addons
   WHERE addon_id = 1;  -- Replace with your addon_id
   ```

3. **Confirm the booking** (change status to 'confirmed' via your admin panel or API)

4. **Check stock after:**
   ```sql
   SELECT addon_id, addon_name, stock_quantity
   FROM provider_addons
   WHERE addon_id = 1;
   ```

**Expected:** Stock should decrease by the quantity booked.

---

## ✅ Step 7: Update Frontend (If Needed)

Your frontend may need updates to send the new fields. Check your booking form:

### New Fields to Send:

1. **`service_dates[]`** - Array for multi-day bookings:
   ```javascript
   service_dates: [
     { date: "2024-12-15", start_time: "09:00", end_time: "18:00", event_type: "wake_day_1" },
     { date: "2024-12-16", start_time: "09:00", end_time: "18:00", event_type: "wake_day_2" }
   ]
   ```

2. **`resources[]`** - Array for resource selection:
   ```javascript
   resources: [
     { resource_type: "parlour", resource_name: "Hall A" }
   ]
   ```

3. **`quantity`** - In each addon:
   ```javascript
   selected_addons: [
     { addon_id: 1, quantity: 2, addon_name: "Premium Urn", price: 1000 }
   ]
   ```

**Note:** The backend is backward compatible - old bookings without these fields will still work!

---

## ✅ Step 8: Monitor and Verify

### Check Booking Dates Created

```sql
-- See multi-day bookings
SELECT 
    bd.booking_date_id,
    bd.booking_id,
    bd.date,
    bd.event_type,
    b.booking_reference,
    b.customer_name
FROM booking_dates bd
JOIN bookings b ON bd.booking_id = b.booking_id
ORDER BY bd.created_at DESC
LIMIT 10;
```

### Check Resource Availability

```sql
-- See resource bookings
SELECT 
    ra.resource_name,
    ra.date,
    ra.is_available,
    b.booking_reference
FROM resource_availability ra
LEFT JOIN bookings b ON ra.booking_id = b.booking_id
ORDER BY ra.date DESC
LIMIT 10;
```

### Check Stock History

```sql
-- See stock changes
SELECT 
    ash.addon_id,
    pa.addon_name,
    ash.change_type,
    ash.quantity_change,
    ash.previous_stock,
    ash.new_stock,
    ash.created_at
FROM addon_stock_history ash
JOIN provider_addons pa ON ash.addon_id = pa.addon_id
ORDER BY ash.created_at DESC
LIMIT 10;
```

---

## 🎉 Completion Checklist

- [ ] Migration verified (tables and columns exist)
- [ ] Addons marked as items/services
- [ ] Availability check API tested
- [ ] Booking creation with validation tested
- [ ] Inventory confirmation tested (stock decrements)
- [ ] Background job set up (or tested manually)
- [ ] Frontend updated (if needed)
- [ ] Monitoring queries tested

---

## 🚨 Troubleshooting

### Issue: Availability check returns errors

**Solution:** 
- Check if `booking_dates` and `resource_availability` tables exist
- Verify your database connection
- Check PHP error logs

### Issue: Inventory not decrementing

**Solution:**
- Verify `addon_type = 'item'` and `stock_quantity` is set
- Check booking status is 'confirmed' (not just 'pending')
- Verify `confirmInventory()` is being called

### Issue: Validation errors on booking

**Solution:**
- Check if package exists and is active
- Verify addon has sufficient stock
- Check resource availability for date range

---

## 📚 Next Steps

Once everything is working:

1. **Train your team** on the new features
2. **Set up monitoring** for low stock alerts
3. **Configure background job** for production
4. **Update documentation** with new workflows

---

*You're all set! The system is now a full Funeral ERP with inventory management, multi-day scheduling, and resource tracking.* 🚀

