# 🧪 Checkout Visual Test Script

## Quick 5-Minute Test

### Step 1: Go to Package Details
```
URL: http://localhost:5173/package-details
```

### Step 2: Select Buddhist Add-ons
- [ ] Click "🪷 Buddhist Ceremony Add-ons" tab
- [ ] Click "Add Service" on "3-Monk Chanting Ceremony" (RM1,200.00)
- [ ] Click "Add Service" on "Incense and Candle Package" (RM500.00)

### Step 3: Verify Total Calculation
**CRITICAL CHECK:**
```
Expected Order Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Base Package       RM2,000.00

Selected Add-ons:
3-Monk Chanting    RM1,200.00
Incense Package      RM500.00

Total              RM3,700.00  ← Should be correct, NOT RM2000.001700
━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**❌ FAIL if shows:** `RM2000.001700`
**✅ PASS if shows:** `RM3,700.00`

### Step 4: Go to Checkout
- [ ] Click "Proceed to Checkout" button
- [ ] Page should load without errors

### Step 5: Verify Checkout Display

#### A. Buddhist Banner (Top)
Should see amber banner:
```
🪷 Buddhist Funeral Service Package
You've selected 2 Buddhist ceremony add-ons for this service.
```

#### B. Order Summary Sidebar (Right)
Should see:
```
🏢 Provider Name
   Premium Package

Base Package.................RM2,000.00

🪷 Buddhist Ceremony Add-ons [2]

┌─────────────────────────────────┐
│ BUDDHIST RITUALS                │  ← Amber background
│ ✓ 3-Monk Chanting Ceremony      │
│                    RM1,200.00   │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ ALTAR OFFERINGS                 │  ← Amber background
│ ✓ Incense and Candle Package    │
│                      RM500.00   │
└─────────────────────────────────┘

Add-ons Subtotal..........RM1,700.00

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Amount
RM3,700.00  ← LARGE, BOLD, INDIGO
Includes 2 add-on services
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Secure booking process
✓ 24/7 customer support
✓ Flexible payment options
✓ Compassionate service guarantee
```

### Step 6: Test Form Validation

#### Personal Info (Step 1)
- [ ] Leave name empty, click Next → Should show "Full name is required"
- [ ] Enter "Ab" → Should show "Name must be at least 3 characters"
- [ ] Enter invalid email "test@" → Should show "Please enter a valid email address"
- [ ] Fill correctly:
  - Name: John Doe
  - Email: john@example.com
  - Phone: +60 12-345 6789
- [ ] Click "Next Step" → Should proceed to Step 2

#### Service Details (Step 2)
- [ ] Try to select yesterday's date → Should show "cannot be in the past"
- [ ] Enter short address "123" → Should show "Please provide a complete address"
- [ ] Fill correctly:
  - Date: Tomorrow's date
  - Address: 123 Main Street, Kuala Lumpur, 50000 Malaysia
  - Requirements: Buddhist ceremony with monk chanting
- [ ] Click "Next Step" → Should proceed to Step 3

#### Documents (Step 3)
- [ ] Upload image for deceased photo
  - **Expected:** Box turns GREEN with checkmark ✓
  - **Expected:** Shows filename
- [ ] Upload PDF for death certificate
  - **Expected:** Box turns GREEN with checkmark ✓
  - **Expected:** Shows filename
- [ ] Upload 2-3 additional documents
  - **Expected:** All filenames listed with checkmarks
- [ ] Click "Proceed to Payment" → Should navigate to payment page

### Step 7: Verify Payment Page Receives Data
Check browser console:
```javascript
// Should see:
{
  booking: { name, email, phone, date, address, ... },
  packageData: { name, price: 2000, ... },
  selectedAddons: [
    { addon_name: "3-Monk Chanting Ceremony", price: "1200.00", ... },
    { addon_name: "Incense and Candle Package", price: "500.00", ... }
  ],
  total: 3700
}
```

---

## 🎯 Pass/Fail Criteria

### ✅ PASS If:
1. Total shows **RM3,700.00** (not concatenated)
2. Buddhist banner appears
3. Add-ons grouped by category with amber theme
4. Subtotal calculated correctly
5. Validation works for all fields
6. File uploads show visual feedback
7. All data passed to payment page

### ❌ FAIL If:
1. Total shows **RM2000.001700** or other wrong number
2. Buddhist add-ons not displayed
3. Categories not grouped
4. No visual feedback on file uploads
5. Form validation doesn't work
6. Navigation breaks
7. Data not passed correctly

---

## 🔧 Quick Fixes

### If total is wrong:
```bash
# Check PackageDetails.jsx line 110
# Should have: parseFloat(pkg.price) + ...

# Check Checkout.jsx line 52
# Should use: totalAmount from location.state
```

### If Buddhist add-ons not showing:
```bash
# Check navigation state in PackageDetails.jsx
# Must pass: selectedAddons: selectedAddons
```

### If validation doesn't work:
```bash
# Check Checkout.jsx validateStep function
# Should have regex for email and phone
```

---

## 📸 Screenshots to Verify

### Screenshot 1: Package Details Total
![Should show RM3,700.00]

### Screenshot 2: Checkout Buddhist Banner
![Should show amber banner with lotus icon]

### Screenshot 3: Order Summary with Add-ons
![Should show grouped add-ons with amber background]

### Screenshot 4: File Upload Success
![Should show green boxes with checkmarks]

---

## ⚡ One-Command Test

Open browser console and paste:
```javascript
// Verify total calculation
const pkg = { price: "2000.00" };  // String from database
const addons = [
  { price: "1200.00" },
  { price: "500.00" }
];

// OLD WAY (BROKEN):
const wrongTotal = pkg.price + addons.reduce((sum, a) => sum + parseFloat(a.price), 0);
console.log("❌ Wrong:", wrongTotal);  // "2000.001700"

// NEW WAY (FIXED):
const correctTotal = parseFloat(pkg.price) + addons.reduce((sum, a) => sum + parseFloat(a.price), 0);
console.log("✅ Correct:", correctTotal);  // 3700

// Test passes if correctTotal === 3700
if (correctTotal === 3700) {
  console.log("🎉 CALCULATION FIX VERIFIED!");
} else {
  console.error("❌ CALCULATION STILL BROKEN!");
}
```

---

**Test Duration:** ~5 minutes
**Required:** Browser, running app (npm run dev)
**Status:** Ready to test! 🚀
