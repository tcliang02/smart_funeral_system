# 🔍 Package ID Debugging Guide

## ⚠️ CRITICAL: Start Fresh Booking Flow

**You MUST start a completely new booking** because you're using cached data from before the fix!

## 📋 Step-by-Step Testing with Debug Console

### 1. **Close Current Payment Page**
   - Close the tab or navigate away
   - Clear any cached booking data

### 2. **Start Fresh Booking Flow**
   ```
   http://localhost:5173/order-services
   ```

### 3. **Follow Complete Flow & Watch Console**

#### **Step A: Select Package (PackageDetails Page)**
When you click "Proceed to Checkout", console should show:
```javascript
🔍 DEBUG - pkg object: { package_id: 1, name: "happy", price: 2000, ... }
🔍 DEBUG - pkg.package_id: 1  // ✅ Should be a number!
🔍 DEBUG - pkg.id: 1  // ✅ Fallback value
✅ Navigating to checkout with data: { package: { package_id: 1, ... } }
✅ Package ID being sent: 1  // ✅ MUST be a number, not undefined!
```

❌ **If you see `undefined` here, the problem is in PackageDetails.jsx**

---

#### **Step B: Checkout Page**
When checkout page loads, console should show:
```javascript
=== CHECKOUT PAGE LOADED ===
🔍 PACKAGE_ID in location.state?.package: 1  // ✅ Must be present!
Extracted packageData: { package_id: 1, name: "happy", ... }
🔍 packageData.package_id: 1  // ✅ Should still be a number!
```

❌ **If you see `undefined` here, the data wasn't passed from PackageDetails**

---

#### **Step C: Payment Page**
When payment page loads, console should show:
```javascript
=== PAYMENT PAGE LOADED ===
🔍 location.state?.packageData: { package_id: 1, name: "happy", ... }
🔍 location.state?.packageData?.package_id: 1  // ✅ MUST be present!
🔍 Extracted packageData: { package_id: 1, ... }
🔍 packageData.package_id: 1  // ✅ Should STILL be a number!
```

❌ **If you see `undefined` here, the data wasn't passed from Checkout**

---

#### **Step D: Submit Payment**
When you click "Confirm Payment", console should show:
```javascript
Submitting booking to database: {
  package_id: 1,  // ✅ MUST BE A NUMBER, NOT UNDEFINED!
  user_id: 7,
  customer_name: "...",
  ...
}
```

✅ **If package_id is a number, booking will be created successfully!**
❌ **If package_id is undefined, check previous steps**

---

## 🎯 What to Look For

### ✅ SUCCESS Signs:
- `package_id: 1` (or any number)
- Console shows package_id at EVERY step
- No "Missing required field: package_id" error
- Booking created successfully message

### ❌ FAILURE Signs:
- `package_id: undefined` at ANY step
- "Missing required field: package_id" error
- Alert popup about missing package_id

---

## 🔧 Troubleshooting

### If package_id is undefined in PackageDetails:
1. Check if `pkg` object has `package_id` or `id` field
2. Check database - does packages table have `package_id` column?
3. Check backend API - is `getAllPackages.php` returning package_id?

### If package_id is lost between pages:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+F5)
3. Check React Router state passing

### If package_id is still undefined after fresh start:
1. Check if hot reload is working (change some text, see if it updates)
2. Restart Vite dev server (`npm run dev` again)
3. Check browser console for any React errors

---

## 🚀 Quick Test Command

Open browser console (F12) and paste this before starting:
```javascript
// Watch for package_id in console
console.log("🎯 Monitoring package_id flow...");
```

Then follow the booking flow and watch for 🔍 DEBUG messages!

---

## 📌 Expected Full Console Output

```
=== When selecting package ===
🔍 DEBUG - pkg object: { package_id: 1, ... }
🔍 DEBUG - pkg.package_id: 1
✅ Package ID being sent: 1

=== When entering checkout ===
🔍 PACKAGE_ID in location.state?.package: 1
🔍 packageData.package_id: 1

=== When entering payment ===
🔍 location.state?.packageData?.package_id: 1
🔍 packageData.package_id: 1

=== When submitting payment ===
Submitting booking to database: { package_id: 1, ... }
Booking API response: { success: true, ... }
Booking created successfully!
```

If you see this full flow with numbers (not undefined), it's working! 🎉
