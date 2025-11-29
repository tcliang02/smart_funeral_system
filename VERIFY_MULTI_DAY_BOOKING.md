# How to Verify Multi-Day Booking

## 📋 The Problem

You're only looking at the `bookings` table, but **multi-day dates are stored separately** in the `booking_dates` table!

---

## ✅ How Multi-Day Booking Works

### **Database Structure:**

1. **`bookings` table** - Stores the main booking record (1 row)
   - Contains: booking_id, customer info, total_amount, etc.
   - `service_date` field is for backward compatibility

2. **`booking_dates` table** - Stores each service date (multiple rows per booking)
   - Contains: date, start_time, end_time, event_type for EACH day

### **Example:**
```
Booking ID: 123
├── bookings table: 1 row (main booking)
└── booking_dates table: 3 rows (one for each day)
    ├── Row 1: 2024-12-20 (wake_day_1)
    ├── Row 2: 2024-12-21 (wake_day_2)
    └── Row 3: 2024-12-22 (cremation)
```

---

## 🔍 Verify Multi-Day Booking

### **Query 1: Check booking_dates Table**

Run this SQL query in Supabase:

```sql
SELECT 
  booking_date_id,
  booking_id,
  date,
  start_time,
  end_time,
  event_type,
  location
FROM booking_dates
WHERE booking_id = 123
ORDER BY date;
```

**Expected Result (for multi-day booking):**
```
booking_date_id | booking_id | date       | start_time | end_time | event_type
----------------|------------|------------|------------|----------|------------
1               | 123        | 2024-12-20 | 09:00:00   | 18:00:00 | wake_day_1
2               | 123        | 2024-12-21 | 09:00:00   | 18:00:00 | wake_day_2
3               | 123        | 2024-12-22 | 10:00:00   | 12:00:00 | cremation
```

**If you see multiple rows** → ✅ Multi-day booking worked!

**If you see only 1 row** → ❌ Multi-day dates weren't saved

---

### **Query 2: Join Both Tables**

See the complete picture:

```sql
SELECT 
  b.booking_id,
  b.booking_reference,
  b.customer_name,
  b.service_date as main_service_date,
  COUNT(bd.booking_date_id) as total_dates,
  json_agg(
    json_build_object(
      'date', bd.date,
      'start_time', bd.start_time,
      'end_time', bd.end_time,
      'event_type', bd.event_type
    ) ORDER BY bd.date
  ) as all_dates
FROM bookings b
LEFT JOIN booking_dates bd ON b.booking_id = bd.booking_id
WHERE b.booking_id = 123
GROUP BY b.booking_id, b.booking_reference, b.customer_name, b.service_date;
```

**Expected Result:**
```json
{
  "booking_id": 123,
  "booking_reference": "BK000123",
  "customer_name": "Test User",
  "main_service_date": "2024-12-20",
  "total_dates": 3,  // ✅ Should be 3 if multi-day worked
  "all_dates": [
    {
      "date": "2024-12-20",
      "start_time": "09:00:00",
      "end_time": "18:00:00",
      "event_type": "wake_day_1"
    },
    {
      "date": "2024-12-21",
      "start_time": "09:00:00",
      "end_time": "18:00:00",
      "event_type": "wake_day_2"
    },
    {
      "date": "2024-12-22",
      "start_time": "10:00:00",
      "end_time": "12:00:00",
      "event_type": "cremation"
    }
  ]
}
```

---

## 🧪 Quick Test

### **Run this query to check:**

```sql
-- Check if booking 123 has multiple dates
SELECT 
  booking_id,
  COUNT(*) as number_of_dates,
  STRING_AGG(date::text || ' (' || event_type || ')', ', ' ORDER BY date) as dates_list
FROM booking_dates
WHERE booking_id = 123
GROUP BY booking_id;
```

**If it returns:**
- `number_of_dates = 3` → ✅ Multi-day booking worked!
- `number_of_dates = 1` → ❌ Only single date saved (need to check why)

---

## 📊 What You Should See

### **For Single-Day Booking:**
```sql
SELECT * FROM booking_dates WHERE booking_id = 123;
-- Returns: 1 row with event_type = 'main_service'
```

### **For Multi-Day Booking:**
```sql
SELECT * FROM booking_dates WHERE booking_id = 123;
-- Returns: 3 rows (or however many dates you specified)
```

---

## 🐛 If Multi-Day Dates Are Missing

If `booking_dates` table only has 1 row, check:

1. **Did service_dates array reach the API?**
   - Check browser Network tab when creating booking
   - Look at request payload

2. **Did the API receive service_dates?**
   - Check server logs
   - Verify the createBooking route processed the array

3. **Did the INSERT query run?**
   - Check if there were any errors
   - Verify the code path for multi-day booking

---

## ✅ Proof Checklist

- [ ] `bookings` table has 1 row (main booking)
- [ ] `booking_dates` table has **3 rows** (for 3-day booking)
- [ ] Each row in `booking_dates` has different dates
- [ ] Event types are correct (wake_day_1, wake_day_2, cremation)
- [ ] Times are saved correctly (start_time, end_time)

---

## 🎯 Bottom Line

**To prove multi-day booking, you need to check the `booking_dates` table, not just `bookings` table!**

Run this query:
```sql
SELECT * FROM booking_dates WHERE booking_id = 123 ORDER BY date;
```

**If you see multiple rows** = Multi-day booking worked! ✅  
**If you see only 1 row** = Need to debug why dates weren't saved ❌

