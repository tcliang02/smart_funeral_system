# ZENLINK: Next Steps for Supabase (PostgreSQL)

## 🎯 What to Do Now - Supabase Edition

Since you're using **Supabase (PostgreSQL)**, follow these PostgreSQL-specific steps.

---

## Step 1: Run Database Migrations in Supabase ⚠️ CRITICAL

**What this does:** Creates the necessary database tables and columns for the new features.

### Method 1: Using Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard:**
   - Go to: `https://app.supabase.com`
   - Select your project

2. **Open SQL Editor:**
   - Click **"SQL Editor"** in the left sidebar
   - Click **"New query"**

3. **Run the Migration:**
   - Open the file: `backend/sql/RECOMMENDED_SCHEMA_ENHANCEMENTS_POSTGRESQL.sql`
   - Copy **ALL** the SQL content
   - Paste into Supabase SQL Editor
   - Click **"Run"** (or press `Ctrl+Enter`)

### Method 2: Using Supabase CLI (Advanced)

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migration
supabase db push
```

### What Gets Created:

✅ `booking_dates` table (multi-day bookings)  
✅ `resource_availability` table (resource tracking)  
✅ `addon_stock_history` table (stock audit trail)  
✅ New columns in `provider_addons` (inventory tracking)  
✅ New column `quantity` in `booking_addons`  
✅ New categories: "Paper Effigies" and "Venue Rental"  
✅ Indexes for performance  
✅ Triggers for auto-updating timestamps

**✅ Verification:** After running, check in Supabase SQL Editor:
```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('booking_dates', 'resource_availability', 'addon_stock_history');

-- Check if columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'provider_addons' 
  AND column_name IN ('addon_type', 'stock_quantity', 'capacity');
```

---

## Step 2: Update Helper Functions for PostgreSQL

The helper functions in `backend/availability_helpers.php` have been updated to support both PostgreSQL and MySQL. However, you may need to verify the database connection.

### Check Your Database Connection

In `backend/db_connect.php`, ensure it's detecting PostgreSQL correctly. The code should already handle this, but verify:

```php
// Should detect PostgreSQL automatically
$isProduction = getenv('VERCEL') === '1' || getenv('DB_HOST') !== false;
```

---

## Step 3: Set Up Background Job (Supabase Edge Functions)

**For Supabase, you have two options:**

### Option A: Supabase Edge Function (Recommended for Supabase)

1. **Create Edge Function:**
   ```bash
   supabase functions new release-expired-reservations
   ```

2. **Create the function code** in `supabase/functions/release-expired-reservations/index.ts`:
   ```typescript
   import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
   import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

   serve(async (req) => {
     const supabase = createClient(
       Deno.env.get('SUPABASE_URL') ?? '',
       Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
     )

     const { data, error } = await supabase.rpc('release_expired_reservations')
     
     return new Response(
       JSON.stringify({ success: !error, data, error }),
       { headers: { "Content-Type": "application/json" } }
     )
   })
   ```

3. **Deploy:**
   ```bash
   supabase functions deploy release-expired-reservations
   ```

4. **Set up Cron Job in Supabase:**
   - Go to Database → Cron Jobs
   - Create new cron job to call the Edge Function every 5 minutes

### Option B: External Cron Job (Simpler)

Use a service like **cron-job.org** or **EasyCron** to call your PHP script:

1. **Deploy PHP script** to a server that can access your Supabase database
2. **Set up external cron** to call: `https://your-domain.com/backend/ReleaseExpiredReservations.php`

### Option C: Manual Testing (For Development)

You can test the script manually by calling it via HTTP or running it locally if you have PostgreSQL access.

---

## Step 4: Test the Implementation 🧪

### Test 1: Check if Tables Exist (Supabase SQL Editor)

```sql
-- Check tables
SELECT 
    table_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = table_name
        ) THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM (VALUES 
    ('booking_dates'),
    ('resource_availability'),
    ('addon_stock_history')
) AS tables(table_name);

-- Check columns
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'provider_addons'
  AND column_name IN ('addon_type', 'stock_quantity', 'capacity', 'min_quantity', 'max_quantity')
ORDER BY column_name;
```

### Test 2: Test Availability Check API

Make sure your backend API is accessible and test:

```javascript
// Test Resource Availability
fetch('https://your-api-domain.com/api/backend/check-availability', {
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
.then(console.log);
```

### Test 3: Create a Test Booking

```javascript
fetch('https://your-api-domain.com/api/backend/createBooking', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    package_id: 1,
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
        addon_id: 1,
        quantity: 1,
        addon_name: "Test Addon",
        price: 100.00
      }
    ],
    total_amount: 2100.00
  })
})
.then(r => r.json())
.then(console.log);
```

---

## Step 5: Update Your Addons (Mark Physical Items)

### In Supabase SQL Editor:

```sql
-- Mark physical items
UPDATE provider_addons 
SET addon_type = 'item', 
    stock_quantity = 10  -- Set your actual stock
WHERE addon_name ILIKE '%urn%' 
   OR addon_name ILIKE '%casket%'
   OR addon_name ILIKE '%item%';

-- Mark services (unlimited)
UPDATE provider_addons 
SET addon_type = 'service', 
    stock_quantity = NULL
WHERE addon_name ILIKE '%monk%' 
   OR addon_name ILIKE '%prayer%'
   OR addon_name ILIKE '%service%';
```

**Note:** PostgreSQL uses `ILIKE` (case-insensitive) instead of MySQL's `LIKE`.

---

## Step 6: PostgreSQL-Specific Queries

### Check Current Stock vs Reserved (PostgreSQL)

```sql
-- Check current stock vs reserved
SELECT 
    pa.addon_name,
    pa.stock_quantity as total_stock,
    COALESCE(SUM(COALESCE(ba.quantity, 1)), 0) as reserved,
    pa.stock_quantity - COALESCE(SUM(COALESCE(ba.quantity, 1)), 0) as available
FROM provider_addons pa
LEFT JOIN booking_addons ba ON pa.addon_id = ba.addon_id
LEFT JOIN bookings b ON ba.booking_id = b.booking_id
WHERE pa.addon_type = 'item'
  AND b.status IN ('pending', 'confirmed')
  AND EXTRACT(EPOCH FROM (NOW() - b.created_at))/60 < 15  -- 15 minute TTL
GROUP BY pa.addon_id, pa.addon_name, pa.stock_quantity;
```

### Check Expired Reservations (PostgreSQL)

```sql
-- Check expired reservations
SELECT 
    COUNT(*) as expired_count,
    COUNT(*) * 100.0 / NULLIF(
        (SELECT COUNT(*) FROM bookings WHERE status IN ('pending', 'expired')), 
        0
    ) as expired_percentage
FROM bookings
WHERE status = 'expired'
  AND DATE(created_at) = CURRENT_DATE;
```

---

## Step 7: Supabase-Specific Considerations

### Row Level Security (RLS)

If you have RLS enabled, you may need to add policies:

```sql
-- Allow service providers to manage their own resources
CREATE POLICY "Providers can manage their resources"
ON resource_availability
FOR ALL
USING (
    provider_id IN (
        SELECT provider_id FROM service_provider 
        WHERE user_id = auth.uid()
    )
);

-- Allow reading booking dates
CREATE POLICY "Users can read their booking dates"
ON booking_dates
FOR SELECT
USING (
    booking_id IN (
        SELECT booking_id FROM bookings WHERE user_id = auth.uid()
    )
);
```

### Connection Pooling

Supabase uses connection pooling. Make sure your `db_connect.php` uses the correct connection string:

- **Direct connection:** For migrations and admin tasks
- **Pooled connection:** For application queries (recommended)

---

## 🚨 Troubleshooting for Supabase

### Issue: "Column does not exist" error

**Solution:** 
- Check if you ran the PostgreSQL migration (not the MySQL one)
- Verify column names match (PostgreSQL is case-sensitive for quoted identifiers)

### Issue: "Function does not exist"

**Solution:**
- The migration creates functions automatically
- If missing, check the migration ran completely
- Verify you're using the PostgreSQL version of the migration

### Issue: Connection timeout

**Solution:**
- Use Supabase connection pooling
- Check your connection string in `db_connect.php`
- Verify environment variables are set correctly

### Issue: RLS blocking queries

**Solution:**
- Temporarily disable RLS for testing: `ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;`
- Or add appropriate policies (see Step 7)

---

## ✅ Supabase Completion Checklist

- [ ] PostgreSQL migration run successfully in Supabase SQL Editor
- [ ] All new tables exist (`booking_dates`, `resource_availability`, `addon_stock_history`)
- [ ] New columns added to existing tables
- [ ] Indexes created (check in Supabase Table Editor)
- [ ] Triggers created (check in Supabase Database → Triggers)
- [ ] Availability check API tested
- [ ] Booking creation with validation tested
- [ ] Inventory reservation tested
- [ ] Background job set up (Edge Function or external cron)
- [ ] RLS policies added (if using RLS)
- [ ] Frontend updated (if needed)

---

## 📚 Supabase Resources

- **SQL Editor:** https://app.supabase.com/project/_/sql
- **Table Editor:** https://app.supabase.com/project/_/editor
- **Database Docs:** https://supabase.com/docs/guides/database
- **Edge Functions:** https://supabase.com/docs/guides/functions

---

## 🎉 You're Done When:

✅ All PostgreSQL tables exist in Supabase  
✅ You can check availability via API  
✅ Bookings validate before creation  
✅ Inventory reserves and releases correctly  
✅ Stock decrements when booking is confirmed  
✅ Background job runs (Edge Function or external)  

**Once all checkboxes are ticked, your Supabase system is production-ready!** 🚀

---

*Last Updated: 2024*
*System: ZENLINK Funeral Management System - Supabase Edition*

