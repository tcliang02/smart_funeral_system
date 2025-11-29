# 🧪 Quick Test Script - Three Major Fixes

## 🔍 Test #1: Smart Search (2 minutes)

### Steps:
1. **Navigate:** Go to http://localhost:5173/order-services
2. **Select Date:** Click "Continue" with any date
3. **Type in Search:** Type "funeral" or "basic"
   - ✅ **Check:** Dropdown appears instantly with suggestions
   - ✅ **Check:** Suggestions show icons (📦 Package, 🏢 Provider, 📍 Location)
4. **Click Suggestion:** Click any suggestion
   - ✅ **Check:** Search box fills with selected value
   - ✅ **Check:** Results filter immediately
5. **Try Filter Tabs:** Click "Package Name", "Provider", "Description" buttons
   - ✅ **Check:** Active tab highlighted in blue
   - ✅ **Check:** Results filter based on selected type
6. **Add Filters:** Select location "Kuala Lumpur" and price range
   - ✅ **Check:** Shows "2 filters active" or similar
7. **Clear Filters:** Click "Clear All Filters"
   - ✅ **Check:** All filters reset
   - ✅ **Check:** Counter disappears

**Result:** ✅ PASS if all checks complete

---

## 💾 Test #2: Real Database Integration (5 minutes)

### Steps:
1. **Start Fresh:** Open browser console (F12)
2. **Select Package:** Click any package to view details
3. **Fill Booking Form:**
   - Name: "Test User"
   - Email: "test@example.com"
   - Phone: "0123456789"
   - Requirements: "Test booking"
4. **Select Add-ons:** Choose 2-3 add-ons (check the checkboxes)
5. **Select Parlour:** Choose "I want funeral parlour service"
6. **Continue to Payment**
7. **Select Payment Method:** Choose any (Credit Card, Bank Transfer, or E-Wallet)
8. **Submit Payment**

### Console Checks:
**During submission, console should show:**
```
Submitting booking to database: {
  package_id: 1,
  customer_name: "Test User",
  customer_email: "test@example.com",
  ...
}
```

**After API call:**
```
Booking API response: {
  success: true,
  booking_id: 5,
  booking_reference: "BK000005",
  package_name: "..."
}
```

### ThankYou Page Check:
- ✅ **Check:** Page shows "Booking Reference: BK000005" (or similar)
- ✅ **Check:** NOT showing timestamp like "1760776599178"
- ✅ **Check:** Shows customer details correctly
- ✅ **Check:** Shows selected add-ons
- ✅ **Check:** Shows total price

### Database Check (HeidiSQL):
1. **Open HeidiSQL**
2. **Run Query:**
   ```sql
   SELECT 
     booking_id,
     booking_reference,
     customer_name,
     customer_email,
     customer_phone,
     service_date,
     total_amount,
     created_at
   FROM bookings 
   ORDER BY booking_id DESC 
   LIMIT 1;
   ```

3. **Expected Result:**
   ```
   booking_id: 5
   booking_reference: BK000005
   customer_name: Test User
   customer_email: test@example.com
   customer_phone: 0123456789
   service_date: 2024-06-15
   total_amount: 5800.00
   created_at: [current timestamp]
   ```

4. **Check Add-ons:**
   ```sql
   SELECT * FROM booking_addons 
   WHERE booking_id = 5;  -- Use the booking_id from step 3
   ```

5. **Expected Result:**
   ```
   booking_id | addon_name | addon_price
   5          | Casket     | 1500.00
   5          | Flowers    | 300.00
   ...
   ```

**Result:** ✅ PASS if:
- Console shows API call and response
- ThankYou page shows "BK000005" format (not timestamp)
- Database has new booking record
- booking_addons table has all selected add-ons

---

## 🗃️ Test #3: Variable Cleanup (1 minute)

### Quick Verification:
1. **Check Console:** No errors during booking
2. **Check ThankYou Page:** All data displays correctly:
   - Customer name: ✅
   - Email: ✅
   - Phone: ✅
   - Service date: ✅
   - Package name: ✅
   - Add-ons list: ✅
   - Total price: ✅
   - Parlour info (if selected): ✅

3. **Database Check:**
   ```sql
   SELECT * FROM bookings 
   ORDER BY booking_id DESC 
   LIMIT 1;
   ```
   - ✅ All fields populated correctly
   - ✅ service_address contains parlour info if selected
   - ✅ special_requirements has customer notes

**Result:** ✅ PASS if all data matches between frontend and database

---

## 🚨 Common Issues & Solutions

### Issue: Suggestions not showing
**Solution:** 
- Check if packages loaded: Open console, type `console.log(packages)`
- Refresh page
- Type at least 2 characters

### Issue: API call fails
**Solution:**
- Check if XAMPP is running
- Check if backend/createBooking.php exists
- Check browser console for error message
- Verify database connection in backend/db_connect.php

### Issue: Booking not in database
**Solution:**
- Check console for API response
- If `success: false`, check error message
- Verify package_id is valid: `SELECT * FROM packages;`
- Check database user permissions

### Issue: Add-ons not saving
**Solution:**
- Check console: `selected_addons` should be array of objects
- Each object needs `name` and `price` properties
- Verify booking_addons table exists

---

## ✅ Final Verification Checklist

### Smart Search:
- [ ] Suggestions appear instantly
- [ ] Icons display correctly (📦 🏢 📍)
- [ ] Filter tabs work
- [ ] Clear all filters works
- [ ] Result count updates

### Database Integration:
- [ ] createBooking.php API called
- [ ] API returns success response
- [ ] booking_id is a number (not timestamp)
- [ ] booking_reference format is "BK000###"
- [ ] Record appears in bookings table
- [ ] Add-ons saved to booking_addons table

### ThankYou Page:
- [ ] Shows "Booking Reference" (not "Order ID")
- [ ] Shows "BK000###" format (not timestamp)
- [ ] Customer details correct
- [ ] Package name correct
- [ ] Add-ons list correct
- [ ] Total price correct
- [ ] Service date formatted nicely

### Data Mapping:
- [ ] customer_name = booking.name ✅
- [ ] customer_email = booking.email ✅
- [ ] customer_phone = booking.phone ✅
- [ ] service_date = selected date ✅
- [ ] service_address = parlour info (if selected) ✅
- [ ] special_requirements = customer notes ✅
- [ ] total_amount = correct total ✅
- [ ] selected_addons = array of add-ons ✅

---

## 📊 Test Results Template

```
Date: [Date]
Tester: [Your Name]
Browser: [Chrome/Firefox/Edge]

Test #1: Smart Search
- Suggestions: ✅ PASS / ❌ FAIL
- Filter tabs: ✅ PASS / ❌ FAIL
- Clear filters: ✅ PASS / ❌ FAIL
Notes: _______________________

Test #2: Database Integration
- API call: ✅ PASS / ❌ FAIL
- Booking ID format: ✅ PASS / ❌ FAIL (Expected: BK000###, Got: _______)
- Database record: ✅ PASS / ❌ FAIL
- Add-ons saved: ✅ PASS / ❌ FAIL
Notes: _______________________

Test #3: Variable Cleanup
- Data mapping: ✅ PASS / ❌ FAIL
- All fields correct: ✅ PASS / ❌ FAIL
Notes: _______________________

Overall Result: ✅ ALL PASS / ⚠️ SOME ISSUES / ❌ FAILED
```

---

## 🎯 Success Criteria

**All Tests Pass If:**
1. ✅ Smart search shows suggestions instantly
2. ✅ Booking saves to database with real ID
3. ✅ ThankYou page shows "BK000###" format
4. ✅ All data matches between frontend and database
5. ✅ No console errors
6. ✅ Add-ons saved correctly

**If ANY test fails:** Check console for errors and refer to "Common Issues & Solutions" section above.

