# 🎯 Quick Manual Test Script - Service Provider Dashboard

**Duration**: ~10 minutes  
**Purpose**: Verify all features work end-to-end  
**Date**: October 16, 2025

---

## 🚀 Pre-Test Setup

### 1. Start Services:
```powershell
# Open XAMPP Control Panel
# Click "Start" on Apache
# Click "Start" on MySQL

# In PowerShell:
cd C:\xampp\htdocs\smart_funeral_system\frontend\my-app
npm run dev
```

### 2. Open Browser:
- Navigate to: **http://localhost:5174**
- Open DevTools (F12) → Console tab
- Keep it open to watch for errors

---

## ✅ Test 1: Login & Authentication (2 min)

### Steps:
1. Go to http://localhost:5174/login
2. Select role: **Service Provider**
3. Enter test credentials
4. Click **Login**

### ✅ Verify:
- [ ] No console errors
- [ ] Redirected to `/service-provider-dashboard`
- [ ] Dashboard loads without errors
- [ ] Open DevTools → Application → Local Storage
- [ ] Check 3 keys exist: `token`, `user`, `provider`
- [ ] User object has `role: "provider"`

### 🔴 If Failed:
- Check Apache is running (http://localhost)
- Check Vite is running (port 5174)
- Check credentials are correct
- Look at console errors

---

## ✅ Test 2: Dashboard Overview (1 min)

### Steps:
1. Verify you're on "Overview" tab
2. Observe the statistics cards

### ✅ Verify:
- [ ] Statistics load (numbers appear, not 0/0/0/0)
- [ ] Recent bookings table shows data
- [ ] Charts render (2 bar charts visible)
- [ ] All icons display properly
- [ ] No console errors

### Visual Check:
```
Expected:
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ 📊 Total: 8     │  │ 💰 Revenue:     │  │ ⭐ Rating: 0.0  │
│ ⏳ Pending: 3   │  │    RM 23,276    │  │   (0 reviews)   │
│ ✅ Complete: 3  │  │                 │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## ✅ Test 3: Bookings Tab (1 min)

### Steps:
1. Click **"Bookings"** tab
2. Find any booking with status "pending"
3. Click **"Update Status"** dropdown
4. Select **"confirmed"**
5. Click **"Update"**

### ✅ Verify:
- [ ] Bookings list loads
- [ ] All booking cards display properly
- [ ] Status dropdown opens
- [ ] Status updates successfully
- [ ] Success message appears
- [ ] Badge color changes (yellow → blue)
- [ ] No page reload

### 🔴 If Failed:
- Check console for errors
- Verify backend endpoint: `/backend/manageBookings.php`
- Check booking_id is valid

---

## ✅ Test 4: Packages Display (2 min)

### Steps:
1. Click **"Packages"** tab
2. Observe the package cards

### ✅ Verify:
- [ ] Packages display in **grid layout** (3 columns on desktop)
- [ ] Each card has:
  - [ ] **Gradient header** (purple/indigo)
  - [ ] **Package icon** in circle
  - [ ] **Price** display (RM format)
  - [ ] **Statistics row** (👥 capacity, ⏰ duration, 📊 bookings)
  - [ ] **Features list** with ✓ checkmarks
  - [ ] **Location badge** (Indoor/Outdoor/Both)
  - [ ] **Edit/Delete buttons**
- [ ] **Featured badge** shows (yellow ribbon) if package is featured

### Visual Check:
```
Expected Package Card:
┌─────────────────────────────────────┐
│  🏆 FEATURED                        │
│  ╭─────────────────────────────╮    │
│  │     📦 Package Icon         │    │
│  │   Traditional Funeral       │    │
│  │      RM 5,000              │    │
│  │  👥 50  ⏰ 4h  📊 15       │    │
│  ╰─────────────────────────────╯    │
│  Comprehensive traditional...       │
│  ✓ Feature 1                        │
│  ✓ Feature 2                        │
│  📍 Indoor & Outdoor                │
│  [ ✏️ Edit ] [ 🗑️ Delete ]         │
└─────────────────────────────────────┘
```

### Hover Test:
- [ ] Hover over card → **Lifts up** with shadow
- [ ] Border changes to **indigo/blue**
- [ ] Smooth transition (300ms)

---

## ✅ Test 5: Create Package (2 min)

### Steps:
1. Click **"Create Package"** button (top right)
2. Fill in form:
   - **Name**: "Test Package"
   - **Description**: "This is a test package"
   - **Price**: 1000
   - **Capacity**: 50
   - **Duration**: 2
   - **Location**: "Both"
3. Add features:
   - Type "Test Feature 1" → Click **"Add Feature"**
   - Type "Test Feature 2" → Click **"Add Feature"**
4. Click **"Add Package"**

### ✅ Verify:
- [ ] Modal opens smoothly
- [ ] All form fields work
- [ ] Features add to list with ✓ icon
- [ ] Can remove features with X button
- [ ] "Add Package" button shows loading state
- [ ] Success message appears
- [ ] Modal closes automatically
- [ ] **New package appears in grid immediately**
- [ ] No console errors

### 🔴 If Failed:
- Check console errors
- Verify provider_id in payload
- Check backend response format

---

## ✅ Test 6: Edit Package (1 min)

### Steps:
1. Find the package you just created
2. Click **"Edit"** button
3. Change name to "Updated Test Package"
4. Change price to 1500
5. Remove one feature
6. Add new feature "Test Feature 3"
7. Click **"Update Package"**

### ✅ Verify:
- [ ] Modal opens with **pre-filled data**
- [ ] All fields show existing values
- [ ] Existing features loaded in list
- [ ] Changes save successfully
- [ ] Success message appears
- [ ] Modal closes
- [ ] Card updates **immediately** (no refresh needed)
- [ ] New values displayed correctly

---

## ✅ Test 7: Delete Package (30 sec)

### Steps:
1. Find your test package
2. Click **"Delete"** button
3. Click **"Confirm"** in dialog
4. Observe result

### ✅ Verify:
- [ ] Confirmation dialog appears
- [ ] Package removes from display immediately
- [ ] Success message shows
- [ ] Grid re-arranges smoothly
- [ ] No console errors

---

## ✅ Test 8: Calendar Availability (3 min)

### Steps:
1. Click **"Availability"** tab
2. Wait for calendar to load
3. Observe current month

### ✅ Verify:
- [ ] Calendar displays current month
- [ ] Today's date has **green border**
- [ ] Unavailable dates show in **red**
- [ ] Statistics dashboard shows at top:
  - Total unavailable dates
  - This month count
  - Next month count

### Test Quick Actions:
1. Click **"Mark Weekends Unavailable"**
   - [ ] All Saturdays & Sundays get selected (blue)
   - [ ] Count matches expected

2. Click **"Mark Next 7 Days Unavailable"**
   - [ ] Next 7 days from today selected
   - [ ] Dates across month boundary work

### Test Date Selection:
1. Click on **October 29, 30, 31**
   - [ ] Dates turn blue (selected)
   - [ ] Can click again to deselect

2. Click **"Save Unavailable Dates"**
   - [ ] Button shows loading state
   - [ ] Success message appears with ✓ icon
   - [ ] Dates turn **red** in calendar
   - [ ] Statistics update immediately
   - [ ] **No ERR_CONNECTION_REFUSED error**

3. Check Console:
   ```javascript
   // Should see:
   Date clicked: 29 Month: 10 Year: 2025 DateStr: 2025-10-29
   Starting saveUnavailableDates with providerId: 3
   Saving unavailable dates with payload: {provider_id: 3, dates: [...]}
   ```

### Test CSV Export:
1. Click **"Export to CSV"**
   - [ ] File downloads immediately
   - [ ] Filename: `unavailable_dates_2025-10-16.csv`
   - [ ] Opens in Excel correctly
   - [ ] Contains date and status columns

### Test Remove Dates:
1. Click on a **red (unavailable) date**
   - [ ] Date turns blue (selected for removal)
2. Click **"Remove Selected Dates"**
   - [ ] Confirmation dialog appears
3. Click **"Confirm"**
   - [ ] Dates turn white/gray (available)
   - [ ] Statistics update

---

## ✅ Test 9: Responsive Design (1 min)

### Steps:
1. Open DevTools (F12)
2. Click **"Toggle Device Toolbar"** (Ctrl+Shift+M)
3. Select different devices:
   - **iPhone SE** (375px)
   - **iPad** (768px)
   - **Laptop** (1024px)

### ✅ Verify:
- [ ] **Mobile (375px)**:
  - Package cards: 1 column
  - Calendar fits screen
  - All buttons tappable
  - No horizontal scroll

- [ ] **Tablet (768px)**:
  - Package cards: 2 columns
  - Stats cards stack properly
  - Forms are usable

- [ ] **Desktop (1024px+)**:
  - Package cards: 3 columns
  - Full width utilized
  - Everything readable

---

## ✅ Test 10: Error Handling (30 sec)

### Steps:
1. Turn off Apache (XAMPP → Stop Apache)
2. Try to save a package or update availability
3. Observe behavior

### ✅ Verify:
- [ ] User-friendly error message appears
- [ ] Console shows network error
- [ ] App doesn't crash
- [ ] Can recover when Apache restarts

### Steps:
4. Restart Apache
5. Refresh page
6. Try operation again

### ✅ Verify:
- [ ] Operation succeeds after restart
- [ ] No lingering errors

---

## 📊 Test Results

### Summary:
- **Total Tests**: 10
- **Passed**: ____
- **Failed**: ____
- **Blocked**: ____

### Issues Found:
```
1. Issue: _______________________________
   Severity: [ ] Critical [ ] Major [ ] Minor
   Steps to reproduce: _________________
   Expected: ___________________________
   Actual: _____________________________
   
2. Issue: _______________________________
   Severity: [ ] Critical [ ] Major [ ] Minor
   Steps to reproduce: _________________
   Expected: ___________________________
   Actual: _____________________________
```

---

## 🎯 Final Checklist

### Visual Quality:
- [ ] All icons render properly
- [ ] Colors are consistent
- [ ] Text is readable
- [ ] Spacing looks good
- [ ] Animations are smooth
- [ ] No layout shifts

### Functionality:
- [ ] All CRUD operations work
- [ ] Data saves to database
- [ ] UI updates immediately
- [ ] No console errors
- [ ] Loading states show
- [ ] Error messages clear

### Performance:
- [ ] Page loads < 2 seconds
- [ ] Interactions feel instant
- [ ] No lag or freezing
- [ ] Smooth scrolling

---

## ✅ Test Complete!

**Status**: [ ] PASS [ ] FAIL [ ] NEEDS WORK

**Tester Name**: _________________  
**Date**: _________________  
**Time Taken**: ______ minutes  

**Overall Assessment**:
```
Excellent    [ ]
Good         [ ]
Fair         [ ]
Poor         [ ]
```

**Comments**:
_____________________________________________
_____________________________________________
_____________________________________________

---

**Next Steps**:
- [ ] Fix any critical issues
- [ ] Re-test failed items
- [ ] Deploy to production
- [ ] Monitor for bugs

---

**END OF TEST**
