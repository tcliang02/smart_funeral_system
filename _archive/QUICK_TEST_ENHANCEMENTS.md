# 🧪 Quick Test Script - Booking Details Enhancements

## Pre-Test Checklist

### ✅ **Step 1: Run Database Migration**
```sql
-- Open HeidiSQL and execute:
C:\xampp\htdocs\smart_funeral_system\backend\addon_category_enhancement.sql

-- Verify:
SHOW COLUMNS FROM booking_addons;
-- Should show: addon_category VARCHAR(100)
```

### ✅ **Step 2: Start Development Server**
```powershell
cd C:\xampp\htdocs\smart_funeral_system\frontend\my-app
npm run dev
```

---

## Test Scenarios

### 🧪 **Test 1: Customer View - Existing Booking**
**Goal**: Verify existing bookings show enhanced display

1. **Login as Customer**:
   - Email: (use any existing customer account)
   - Password: (your test password)

2. **Navigate to My Bookings**:
   - URL: `http://localhost:5174/orders`
   - Or click "My Bookings" in navigation

3. **View Booking Details**:
   - Click "View Details" on any booking

4. **✅ Expected Results**:
   - [ ] **Add-ons Section**:
     - Header shows "Buddhist Ceremony Add-ons (X Services)"
     - Add-ons grouped under "Other Services" (default for old bookings)
     - Amber/orange gradient header
     - Each add-on shows name and price (e.g., "RM 5,000.00")
     - "Add-ons Subtotal" shows total in indigo gradient box
     - Service count shows below subtotal
   
   - [ ] **Uploaded Files Section**:
     - Header shows "Uploaded Documents (X files)"
     - First file labeled: **"Photo of the Deceased *"**
     - Second file labeled: **"Death Certificate *"**
     - Additional files labeled: "Additional Document 1", etc.
     - Each file has blue gradient background
     - Colored header with document type
     - Click to download link works
   
   - [ ] **Professional Styling**:
     - Gradients and colors look professional
     - Icons display correctly
     - Hover effects work
     - Mobile responsive

---

### 🧪 **Test 2: Provider View - Booking Details**
**Goal**: Verify providers see same enhanced display

1. **Login as Service Provider**:
   - Email: (use provider account)
   - Password: (your test password)

2. **Navigate to Provider Bookings**:
   - **Option A**: Click "Manage Bookings 🔔" in top tabs
   - **Option B**: Click green "Manage Bookings" card in quick actions
   - Both should go to: `http://localhost:5174/provider-bookings`

3. **View Booking Details**:
   - Find a booking with add-ons
   - Details should auto-expand or click to expand

4. **✅ Expected Results**:
   - [ ] **Navigation Works**:
     - Both "Manage Bookings" buttons go to `/provider-bookings`
     - No random tab switching
   
   - [ ] **Add-ons Display**:
     - Same categorized format as customer view
     - Categories shown with amber headers
     - Add-ons Subtotal displayed
   
   - [ ] **Uploaded Files**:
     - "Customer Uploaded Documents" header
     - Files labeled: "Photo of Deceased *", "Death Certificate *"
     - Same blue gradient professional styling

---

### 🧪 **Test 3: New Booking with Categories** (After Migration)
**Goal**: Verify new bookings save and display categories correctly

1. **Create New Booking**:
   - Select a package (e.g., Provider 1's package)
   - Add multiple add-ons from **different categories**:
     - Example: "49-Day Memorial Service" (Memorial Services category)
     - Example: "Incense Package" (Buddhist Rituals category)
   - Complete checkout with uploaded files
   - Complete payment

2. **View in My Bookings**:
   - Go to Orders page
   - View the new booking details

3. **✅ Expected Results**:
   - [ ] **Categorized Add-ons**:
     - Add-ons grouped by actual category names (not "Other Services")
     - Example:
       ```
       Memorial Services
       └─ 49-Day Memorial Service RM 5,000.00
       
       Buddhist Rituals & Ceremonies
       └─ Incense Package RM 500.00
       ```
   
   - [ ] **Files Labeled Correctly**:
     - Photo shows as "Photo of the Deceased *"
     - Certificate shows as "Death Certificate *"

4. **Provider View**:
   - Login as the provider
   - Check "Provider Bookings"
   - View the same booking

5. **✅ Expected Results**:
   - [ ] Same categorized display as customer view
   - [ ] Same file labels

---

### 🧪 **Test 4: Provider Dashboard Navigation**
**Goal**: Confirm both "Manage Bookings" buttons work correctly

1. **Go to Provider Dashboard**:
   - URL: `http://localhost:5174/service-provider-dashboard`

2. **Test Top Navigation Button**:
   - Click "Manage Bookings 🔔" in top tabs
   - Should navigate to: `http://localhost:5174/provider-bookings`
   - ✅ **Pass**: Goes to provider-bookings
   - ❌ **Fail**: Goes to different page or shows tab

3. **Go Back to Dashboard**:
   - Use browser back button or navigate back

4. **Test Quick Action Button**:
   - In overview, find green "Manage Bookings" card
   - Click it
   - Should navigate to: `http://localhost:5174/provider-bookings`
   - ✅ **Pass**: Goes to provider-bookings
   - ❌ **Fail**: Shows bookings tab on dashboard

---

## Visual Verification Checklist

### Add-ons Section
- [ ] ➕ Icon before "Buddhist Ceremony Add-ons"
- [ ] Service count badge (e.g., "(4 Services)")
- [ ] Amber/orange gradient headers for categories
- [ ] White background for add-on items
- [ ] Indigo text for prices (e.g., "RM 5,000.00")
- [ ] Hover effect on add-on items (light gray background)
- [ ] Indigo gradient box for "Add-ons Subtotal"
- [ ] Service count text below subtotal

### Uploaded Files Section
- [ ] 📄 Icon before "Uploaded Documents"
- [ ] File count badge (e.g., "(2 files)")
- [ ] Blue gradient background for each file card
- [ ] Indigo header bar with document type label
- [ ] Document icon in header
- [ ] File name displayed clearly
- [ ] "Click to view/download →" text in indigo
- [ ] External link icon on right
- [ ] Hover effect (lighter blue background)

### Overall Styling
- [ ] Consistent spacing between sections
- [ ] Professional color scheme (indigo, amber, blue)
- [ ] Icons render correctly
- [ ] Text is readable and well-formatted
- [ ] Responsive on mobile (test by resizing browser)

---

## Common Issues & Solutions

### Issue: Add-ons show "Other Services" for new bookings
**Solution**: 
- Check that database migration ran successfully
- Verify add-ons in checkout have `category_name` field
- Check browser console for errors

### Issue: Files don't have labels
**Solution**:
- Verify files were uploaded during checkout
- Check `uploaded_files` field in database (should be JSON array)
- First file should be photo, second should be certificate

### Issue: "Manage Bookings" button doesn't navigate
**Solution**:
- Clear browser cache and refresh
- Check browser console for navigation errors
- Verify route exists in App.jsx

### Issue: Categories not showing
**Solution**:
- Run database migration again
- Check `addon_category` column exists in `booking_addons` table
- Verify backend APIs return category data (check Network tab in DevTools)

---

## Database Verification Queries

### Check if migration ran:
```sql
SHOW COLUMNS FROM booking_addons;
-- Should show addon_category column
```

### Check existing add-ons data:
```sql
SELECT booking_id, addon_name, addon_price, addon_category 
FROM booking_addons 
ORDER BY booking_id DESC 
LIMIT 10;
```

### Check uploaded files format:
```sql
SELECT booking_id, uploaded_files 
FROM bookings 
WHERE uploaded_files IS NOT NULL 
LIMIT 5;
```

---

## Success Criteria

✅ **All tests pass if**:
1. Add-ons are grouped by category with professional styling
2. Files show with proper labels (Photo of Deceased *, Death Certificate *)
3. Both "Manage Bookings" buttons navigate to `/provider-bookings`
4. Customer and provider views match in styling and organization
5. New bookings save category data correctly
6. UI looks professional with gradients, icons, and hover effects

---

## Report Issues

If you encounter any issues during testing:

1. **Take screenshots** showing the problem
2. **Check browser console** (F12 → Console tab) for errors
3. **Verify database** using queries above
4. **Check network requests** (F12 → Network tab) for API errors

---

## Next Steps After Testing

Once all tests pass:

1. ✅ Merge changes to main branch
2. ✅ Document the new feature in user manual
3. ✅ Train providers on new booking details view
4. ✅ Optional: Implement provider dashboard polish (Issue 4)

---

**Happy Testing! 🎉**
