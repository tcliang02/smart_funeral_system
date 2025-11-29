# Multi-Day Booking Testing Guide

## 🚀 Quick Start

**Fastest way to test multi-day booking:**

1. **Get a Package ID:**
   ```sql
   SELECT package_id, name FROM packages LIMIT 1;
   ```

2. **Run this in Browser Console:**
   ```javascript
   fetch('/api/backend/createBooking', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       package_id: 1,  // Use your package ID
       customer_name: "Test User",
       customer_email: "test@example.com",
       customer_phone: "0123456789",
       service_date: "2024-12-20",
       service_dates: [
         { date: "2024-12-20", start_time: "09:00:00", end_time: "18:00:00", event_type: "wake_day_1" },
         { date: "2024-12-21", start_time: "09:00:00", end_time: "18:00:00", event_type: "wake_day_2" }
       ],
       total_amount: 5000.00
     })
   }).then(r => r.json()).then(console.log);
   ```

3. **Verify in Database:**
   ```sql
   SELECT * FROM booking_dates WHERE booking_id = [YOUR_BOOKING_ID];
   ```

---

## 📋 Overview

Multi-day booking allows users to book funeral services across multiple days (e.g., wake day 1, wake day 2, cremation day, prayer day). This guide shows you how to test this feature.

---

## 🎯 What is Multi-Day Booking?

Multi-day booking supports:
- **Multiple service dates** for one booking
- **Different event types** per date (wake_day_1, wake_day_2, cremation, prayer, etc.)
- **Time ranges** (start_time, end_time) for each date
- **Resource tracking** to prevent double-booking

---

## 🧪 Testing Methods

### **Method 1: API Testing (Recommended for Development)**

Test the multi-day booking directly via API call.

#### **Step 1: Prepare Test Data**

```javascript
// Example multi-day booking request
const bookingData = {
  package_id: 1,  // Replace with actual package ID
  customer_name: "Test User",
  customer_email: "test@example.com",
  customer_phone: "0123456789",
  service_date: "2024-12-20",  // Main service date (required for backward compatibility)
  service_dates: [
    {
      date: "2024-12-20",
      start_time: "09:00:00",
      end_time: "18:00:00",
      event_type: "wake_day_1"
    },
    {
      date: "2024-12-21",
      start_time: "09:00:00",
      end_time: "18:00:00",
      event_type: "wake_day_2"
    },
    {
      date: "2024-12-22",
      start_time: "10:00:00",
      end_time: "12:00:00",
      event_type: "cremation"
    },
    {
      date: "2024-12-23",
      start_time: "14:00:00",
      end_time: "16:00:00",
      event_type: "prayer"
    }
  ],
  selected_addons: [
    {
      addon_id: 10,
      addon_name: "Premium Urn",
      price: 1000.00,
      quantity: 1
    }
  ],
  total_amount: 5000.00
};
```

#### **Step 2: Send API Request**

**Using Browser Console:**
```javascript
fetch('/api/backend/createBooking', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(bookingData)
})
.then(res => res.json())
.then(data => {
  console.log('✅ Booking created:', data);
  console.log('📋 Booking ID:', data.data?.booking_id);
  console.log('📋 Booking Reference:', data.data?.booking_reference);
})
.catch(error => console.error('❌ Error:', error));
```

**Using cURL:**
```bash
curl -X POST http://localhost:3000/api/backend/createBooking \
  -H "Content-Type: application/json" \
  -d '{
    "package_id": 1,
    "customer_name": "Test User",
    "customer_email": "test@example.com",
    "customer_phone": "0123456789",
    "service_date": "2024-12-20",
    "service_dates": [
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
      }
    ],
    "total_amount": 5000.00
  }'
```

#### **Step 3: Verify Response**

Expected successful response:
```json
{
  "success": true,
  "data": {
    "booking_id": 123,
    "booking_reference": "BK000123",
    "package_name": "Premium Package",
    "provider_name": "ABC Funeral Services"
  },
  "message": "Booking created successfully"
}
```

---

### **Method 2: Database Verification**

After creating a booking, verify the data in the database.

#### **Step 1: Check Booking Record**

```sql
SELECT * FROM bookings WHERE booking_id = 123;
```

Expected fields:
- `booking_id` - Unique booking ID
- `service_date` - Main service date (for backward compatibility)
- `status` - Booking status (pending/confirmed/completed)

#### **Step 2: Check Multi-Day Dates**

```sql
SELECT * FROM booking_dates WHERE booking_id = 123 ORDER BY date;
```

Expected result:
```
booking_date_id | booking_id | date       | start_time | end_time | event_type
----------------|------------|------------|------------|----------|------------
1               | 123        | 2024-12-20 | 09:00:00   | 18:00:00 | wake_day_1
2               | 123        | 2024-12-21 | 09:00:00   | 18:00:00 | wake_day_2
3               | 123        | 2024-12-22 | 10:00:00   | 12:00:00 | cremation
4               | 123        | 2024-12-23 | 14:00:00   | 16:00:00 | prayer
```

#### **Step 3: View All Multi-Day Bookings**

```sql
SELECT 
  b.booking_id,
  b.booking_reference,
  b.customer_name,
  b.service_date as main_date,
  COUNT(bd.booking_date_id) as total_dates,
  MIN(bd.date) as first_date,
  MAX(bd.date) as last_date
FROM bookings b
LEFT JOIN booking_dates bd ON b.booking_id = bd.booking_id
GROUP BY b.booking_id, b.booking_reference, b.customer_name, b.service_date
HAVING COUNT(bd.booking_date_id) > 1
ORDER BY b.booking_id DESC;
```

This query shows all bookings with multiple dates.

---

### **Method 3: UI Testing (If UI Supports It)**

Currently, the UI may not have a multi-date picker. You can test by:

#### **Option A: Manual Session Storage Injection**

1. Open browser console on Checkout page
2. Inject test data:

```javascript
// Get current booking from sessionStorage
const checkoutData = JSON.parse(sessionStorage.getItem('checkoutData') || '{}');

// Add service_dates array
checkoutData.booking = checkoutData.booking || {};
checkoutData.booking.service_dates = [
  {
    date: "2024-12-20",
    start_time: "09:00:00",
    end_time: "18:00:00",
    event_type: "wake_day_1"
  },
  {
    date: "2024-12-21",
    start_time: "09:00:00",
    end_time: "18:00:00",
    event_type: "wake_day_2"
  }
];

// Update sessionStorage
sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));
console.log('✅ Multi-day dates added to checkout data');
```

3. Continue with checkout normally

#### **Option B: Modify Payment.jsx Temporarily**

Add test dates in `Payment.jsx` before the booking submission:

```javascript
// In Payment.jsx, before line 315
const service_dates = [
  {
    date: "2024-12-20",
    start_time: "09:00:00",
    end_time: "18:00:00",
    event_type: "wake_day_1"
  },
  {
    date: "2024-12-21",
    start_time: "09:00:00",
    end_time: "18:00:00",
    event_type: "wake_day_2"
  }
];
```

---

## ✅ Test Cases

### **Test Case 1: Single Date Booking (Backward Compatibility)**

**Input:**
```json
{
  "package_id": 1,
  "customer_name": "Single Date User",
  "customer_email": "single@test.com",
  "customer_phone": "0123456789",
  "service_date": "2024-12-20",
  "service_dates": [],  // Empty array
  "total_amount": 3000.00
}
```

**Expected:**
- ✅ Booking created successfully
- ✅ Single entry in `booking_dates` table
- ✅ `event_type` = "main_service"

---

### **Test Case 2: Multi-Day Booking (3 Days)**

**Input:**
```json
{
  "package_id": 1,
  "customer_name": "Multi-Day User",
  "customer_email": "multiday@test.com",
  "customer_phone": "0123456789",
  "service_date": "2024-12-20",
  "service_dates": [
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
  ],
  "total_amount": 5000.00
}
```

**Expected:**
- ✅ Booking created successfully
- ✅ 3 entries in `booking_dates` table
- ✅ All dates properly formatted
- ✅ Event types correctly stored

---

### **Test Case 3: Multi-Day with Resources**

**Input:**
```json
{
  "package_id": 1,
  "customer_name": "Resource User",
  "customer_email": "resource@test.com",
  "customer_phone": "0123456789",
  "service_date": "2024-12-20",
  "service_dates": [
    {
      "date": "2024-12-20",
      "start_time": "09:00:00",
      "end_time": "18:00:00",
      "event_type": "wake_day_1",
      "location": "Hall A"
    }
  ],
  "resources": [
    {
      "resource_type": "parlour",
      "resource_name": "Hall A"
    }
  ],
  "total_amount": 5000.00
}
```

**Expected:**
- ✅ Booking created successfully
- ✅ Resource conflicts checked
- ✅ Resource availability validated

---

### **Test Case 4: Date Range Validation**

**Test overlapping dates:**

**Booking 1:**
```json
{
  "service_dates": [
    {
      "date": "2024-12-20",
      "start_time": "09:00:00",
      "end_time": "18:00:00",
      "event_type": "wake_day_1"
    }
  ]
}
```

**Booking 2 (Same date/time - should conflict):**
```json
{
  "service_dates": [
    {
      "date": "2024-12-20",
      "start_time": "10:00:00",
      "end_time": "16:00:00",
      "event_type": "wake_day_1"
    }
  ]
}
```

**Expected:**
- ✅ Validation should detect overlap
- ✅ Error message returned
- ✅ Second booking rejected

---

## 🔍 How to Verify Multi-Day Booking

### **1. Check Booking in Provider Dashboard**

1. Login as provider
2. Go to Provider Dashboard
3. View bookings list
4. Click on booking details
5. Verify all dates are displayed

### **2. Check via API**

```javascript
// Get booking details
fetch('/api/backend/getUserBookings?user_id=1')
  .then(res => res.json())
  .then(data => {
    console.log('Bookings:', data);
    // Check if booking_dates array exists
  });
```

### **3. Check Database Directly**

```sql
-- Get booking with all dates
SELECT 
  b.booking_id,
  b.booking_reference,
  b.customer_name,
  bd.date,
  bd.start_time,
  bd.end_time,
  bd.event_type,
  bd.location
FROM bookings b
JOIN booking_dates bd ON b.booking_id = bd.booking_id
WHERE b.booking_id = 123
ORDER BY bd.date;
```

---

## 🐛 Common Issues & Solutions

### **Issue 1: service_dates Not Saved**

**Symptoms:**
- Booking created but only one date in `booking_dates` table

**Solution:**
- Check that `service_dates` is an array
- Verify array is not empty
- Check API route logs for errors

---

### **Issue 2: Date Format Error**

**Symptoms:**
- Error: "Invalid date format"

**Solution:**
- Ensure dates are in `YYYY-MM-DD` format
- Times should be in `HH:MM:SS` format (24-hour)

**Correct Format:**
```javascript
{
  date: "2024-12-20",        // ✅ YYYY-MM-DD
  start_time: "09:00:00",    // ✅ HH:MM:SS
  end_time: "18:00:00"       // ✅ HH:MM:SS
}
```

---

### **Issue 3: Missing Event Types**

**Symptoms:**
- Dates saved but `event_type` is NULL

**Solution:**
- Always include `event_type` in each date entry
- Common values: `wake_day_1`, `wake_day_2`, `cremation`, `prayer`, `main_service`

---

## 📝 Quick Test Script

Copy-paste this into browser console on your app:

```javascript
// Quick Multi-Day Booking Test
async function testMultiDayBooking() {
  const bookingData = {
    package_id: 1,  // ⚠️ Change to your actual package ID
    customer_name: "Multi-Day Test",
    customer_email: "test@example.com",
    customer_phone: "0123456789",
    service_date: "2024-12-20",
    service_dates: [
      {
        date: "2024-12-20",
        start_time: "09:00:00",
        end_time: "18:00:00",
        event_type: "wake_day_1"
      },
      {
        date: "2024-12-21",
        start_time: "09:00:00",
        end_time: "18:00:00",
        event_type: "wake_day_2"
      }
    ],
    total_amount: 5000.00
  };

  try {
    const response = await fetch('/api/backend/createBooking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Multi-day booking created!');
      console.log('📋 Booking ID:', result.data.booking_id);
      console.log('📋 Reference:', result.data.booking_reference);
      
      // Verify in database (run this SQL query)
      console.log('\n🔍 Verify with SQL:');
      console.log(`SELECT * FROM booking_dates WHERE booking_id = ${result.data.booking_id};`);
    } else {
      console.error('❌ Error:', result.message);
    }
  } catch (error) {
    console.error('❌ Request failed:', error);
  }
}

// Run test
testMultiDayBooking();
```

---

## ✅ Checklist

- [ ] Test single date booking (backward compatibility)
- [ ] Test multi-day booking (2+ dates)
- [ ] Verify all dates saved in `booking_dates` table
- [ ] Check event types are correct
- [ ] Verify date format (YYYY-MM-DD)
- [ ] Test time ranges (start_time, end_time)
- [ ] Test resource conflict detection
- [ ] Verify booking shows in provider dashboard
- [ ] Check API response includes all dates

---

**Last Updated:** 2024  
**API Endpoint:** `/api/backend/createBooking`  
**Database Table:** `booking_dates`

