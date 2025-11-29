# ⚠️ Common Checkout Error - How to Fix

## Problem: "No Package Selected" Error

### What You're Seeing:
```
No Package Selected
Please select a package to proceed with booking.
```

### Why This Happens:
You're trying to access the checkout page **directly by typing the URL** (e.g., `http://localhost:5173/checkout`).

The checkout page **requires data** (package, provider, add-ons) to be passed from the previous page. When you type the URL directly, there's no data, so it shows an error.

---

## ✅ Correct Way to Access Checkout

### Step-by-Step:

**1. Go to Order Services Page**
```
URL: http://localhost:5173/order-services
```

**2. Browse Providers**
- Scroll through available funeral service providers
- Click on a provider card to see their packages

**3. Select a Package**
- Click "View Details" on any package
- You'll be taken to the Package Details page

**4. Package Details Page**
- Review package information
- **Optional:** Select Buddhist add-ons from the "🪷 Buddhist Ceremony Add-ons" tab
- Click "Add Service" to add services
- See the total price update in real-time

**5. Click "Book This Package"**
- This button is at the bottom of the Order Summary sidebar
- It will navigate to checkout WITH all your selected data
- ✅ Now checkout will work correctly!

---

## 🔍 Visual Flow

```
┌──────────────────┐
│  Order Services  │ ← START HERE
│  /order-services │
└────────┬─────────┘
         │ Click package
         ▼
┌──────────────────────┐
│  Package Details     │
│  /package/{id}       │
│  - Review package    │
│  - Select add-ons    │
└────────┬─────────────┘
         │ Click "Book This Package"
         ▼
┌──────────────────────┐
│  Checkout ✅         │
│  /checkout           │
│  - Personal info     │
│  - Service details   │
│  - Documents         │
└──────────────────────┘
```

---

## ❌ Wrong Way

**DON'T:** Type `http://localhost:5173/checkout` in the browser

This won't work because there's no package data.

---

## 🧪 Quick Test

**Test the Correct Flow:**

1. Open: http://localhost:5173/order-services
2. You should see providers and packages
3. Click on any package's "View Details" button
4. On Package Details, click "Book This Package"
5. ✅ You should now see the checkout form with your order summary

**If it still doesn't work:**
- Check browser console (F12) for errors
- Verify your React dev server is running (port 5173)
- Make sure XAMPP Apache is running (backend API)
- Clear browser cache and try again

---

## 🐛 Troubleshooting

### Issue: Port is 5175 instead of 5173
**Fix:** Your Vite dev server is running on the wrong port.
```bash
# Stop the current server (Ctrl+C)
# Navigate to frontend folder
cd frontend/my-app

# Start the dev server (should use port 5173)
npm run dev
```

### Issue: "Cannot GET /package/1"
**Fix:** React Router might not be configured. Make sure you're using the dev server, not opening files directly.

### Issue: Package details loads but checkout doesn't
**Reason:** Check if the "Book This Package" button has `onClick={handleGoToCheckout}` attached.

---

## 📝 Summary

**THE ONLY WAY TO ACCESS CHECKOUT:**
Go through the normal booking flow starting from Order Services page.

**URL to start:** http://localhost:5173/order-services

**Then follow:** Select Provider → View Package → Select Add-ons (optional) → Book This Package → Checkout ✅

---

## 💡 Why React Navigation Works This Way

React Router uses **state** to pass data between pages. When you click a link/button with `navigate()`, it can pass data:

```javascript
navigate("/checkout", {
  state: {
    package: packageData,
    provider: providerData,
    total: totalPrice
  }
});
```

When you type the URL directly, there's no state, so the checkout page receives empty data.

This is **by design** - it's a security and UX feature. You shouldn't be able to skip steps in a booking flow!

---

**Quick Fix:** Just go to http://localhost:5173/order-services and start from there! 🎯
