# Buddhist Add-On System - Troubleshooting Guide

## 🐛 Common Issues & Solutions

---

## Issue 1: "Access Denied - You must be logged in as a service provider"

### Symptoms:
- Can't access `/manage-addons` page
- See red error message about access denied
- Debug info shows: `Provider ID: Not found`

### Root Causes:
1. **Not logged in with provider account**
2. **Logged in but provider data not in localStorage**
3. **User account not linked to any provider profile**

### Solutions:

#### Solution A: Logout and Login Again
```
1. Click Logout
2. Go to Login page
3. Select "Service Provider" role
4. Login with provider credentials
5. Try accessing manage-addons again
```

#### Solution B: Check Which User is Linked to Provider 3
```
Open in browser: http://localhost/smart_funeral_system/backend/test_provider_setup.php

This will show:
- Provider 3 details
- Which username is linked to provider_id 3
- All providers and their user accounts
```

#### Solution C: Verify localStorage Data
```javascript
// Open browser console (F12), run:
console.log("User:", JSON.parse(localStorage.getItem("user")));
console.log("Provider:", JSON.parse(localStorage.getItem("provider")));

// Should see:
// User: {id: 8, username: "user8", role: "provider", email: "..."}
// Provider: {provider_id: 3, company_name: "...", user_id: 8}
```

---

## Issue 2: "❌ Error: Missing required fields: provider_id, addon_name, price, category_id"

### Symptoms:
- Can access manage-addons page
- Can see templates
- Get error when clicking "Add Service" button
- Error shows missing required fields

### Root Causes:
1. **provider_id is null/undefined**
2. **localStorage provider data is corrupted**
3. **Session expired**

### Solutions:

#### Step 1: Check Debug Banner
At the top of the Manage Add-ons page, you should see a blue debug banner:
```
Debug: Provider ID = 3 | User Role = provider
```

If `Provider ID = null` or `Provider ID = undefined`:
- ❌ **Problem:** Provider data not loaded correctly
- ✅ **Fix:** Logout and login again

#### Step 2: Check Browser Console
```javascript
// Open console (F12), look for these logs when clicking "Add Service":

Adding addon with payload: {
  provider_id: 3,           // Should be a number, not null
  template_id: 1,
  addon_name: "7-Day Buddhist Prayer Ceremony",
  description: "...",
  price: 2500,              // Should be a number
  category_id: 1,           // Should be a number
  is_custom: 0
}

Backend response: {
  success: false,
  message: "Missing required fields..."
}
```

If `provider_id: null` or `provider_id: undefined`:
- ❌ **Problem:** Provider ID not retrieved from localStorage
- ✅ **Fix:** Clear localStorage and re-login

#### Step 3: Clear localStorage and Re-login
```javascript
// In browser console:
localStorage.clear();
// Then logout and login again
```

---

## Issue 3: "Add-on with this name already exists for this provider"

### Symptoms:
- Trying to add a service that was already added before

### Solution:
✅ **This is working correctly!** The system prevents duplicate add-ons.

To add the same service again:
1. Go to "My Add-ons" tab
2. Delete the existing service
3. Or edit the existing service to update its price

---

## Issue 4: Templates Not Loading (0 categories shown)

### Symptoms:
- Browse Templates tab shows empty sidebar
- No categories displayed

### Root Causes:
1. **Database not set up**
2. **Tables missing**

### Solutions:

#### Check Database Tables
```sql
-- Run in HeidiSQL/phpMyAdmin:
SELECT COUNT(*) as category_count FROM addon_categories;
-- Should return: 9

SELECT COUNT(*) as template_count FROM addon_templates;
-- Should return: 49
```

If counts are 0:
- ❌ **Problem:** Database not set up
- ✅ **Fix:** Run `buddhist_addon_system.sql` again

```sql
-- In HeidiSQL:
-- 1. Open SQL tab
-- 2. Copy-paste content from buddhist_addon_system.sql
-- 3. Click Execute (F9)
```

---

## Issue 5: "My Add-ons" Tab Shows Empty

### Symptoms:
- "My Add-ons" tab badge shows 0
- No services listed
- Message: "No add-ons available yet"

### This is Normal!
✅ **This is expected behavior** if you haven't added any services yet.

To add services:
1. Click "Browse Templates" tab
2. Select a category
3. Click "Add Service" on any template
4. Customize price if needed
5. Click "✅ Add to My Services"

---

## Issue 6: Customer Can't See Add-ons on Package Details

### Symptoms:
- Customer selects package
- Scrolls to add-ons section
- Sees: "No add-ons available from this provider yet"

### Root Causes:
1. **Provider hasn't added any add-ons**
2. **All add-ons are disabled (inactive)**
3. **Different provider selected**

### Solutions:

#### Check 1: Provider Must Add Services First
```
1. Login as provider
2. Go to Manage Add-ons
3. Add at least one service
4. Make sure it's ENABLED (green toggle)
```

#### Check 2: Verify Add-on Status
In "My Add-ons" tab, check:
- ✅ **Active badge** (amber background) = Customers can see it
- ❌ **Inactive badge** (gray background) = Hidden from customers

To enable:
- Click "🟢 Enable" button

#### Check 3: Verify Correct Provider
Make sure the customer is viewing a package from the provider who added add-ons.

Example:
- Provider 3 added add-ons ✅
- Customer viewing Provider 1's package ❌
- Customer should view Provider 3's package ✅

---

## Debugging Checklist

### For Provider Dashboard:

- [ ] Can login as service provider
- [ ] Can access http://localhost:5174/manage-addons
- [ ] Debug banner shows: `Provider ID = [number]`
- [ ] Debug banner shows: `User Role = provider`
- [ ] Browse Templates tab loads 9 categories
- [ ] Can see template cards with prices
- [ ] Browser console shows no errors

### For Adding Services:

- [ ] Click "Add Service" button
- [ ] Modal appears with template details
- [ ] Can adjust price
- [ ] Console shows: `Adding addon with payload: {...}`
- [ ] `provider_id` in payload is a number (not null)
- [ ] `price` in payload is a number
- [ ] `category_id` in payload is a number
- [ ] Backend response: `{success: true, addon_id: X}`
- [ ] Alert: "✅ Add-on service added successfully!"
- [ ] Service appears in "My Add-ons" tab

### For Customer View:

- [ ] Login as family member
- [ ] Select package from provider who added add-ons
- [ ] Scroll to "Buddhist Ceremony Add-ons" section
- [ ] See categories with services
- [ ] Can click "Add Service" button
- [ ] Total price updates correctly

---

## Quick Fixes

### Fix 1: Clear Everything and Start Fresh
```javascript
// Browser console:
localStorage.clear();

// Then:
1. Refresh page
2. Login as provider
3. Check debug_provider_3.php for correct username
4. Try managing add-ons again
```

### Fix 2: Verify Database Setup
```
Open: http://localhost/backend/debug_provider_3.php

Should show:
- Provider 3 details ✅
- User associated with Provider 3 ✅
- Table of all providers with usernames ✅
```

### Fix 3: Check API Endpoints
```
Test in browser:

http://localhost/backend/getAddonTemplates.php
Should return: {"success":true,"categories":[...]}

Must show 9 categories with templates array
```

### Fix 4: Re-run Database Setup
```sql
-- If templates are missing, run this in HeidiSQL:

-- First, check if tables exist:
SHOW TABLES LIKE 'addon%';

-- Should show:
-- addon_categories
-- addon_templates  
-- provider_addons

-- If missing, copy-paste buddhist_addon_system.sql and execute
```

---

## Still Having Issues?

### Step-by-Step Diagnosis:

**Step 1: Verify Login**
```javascript
// Console:
const user = JSON.parse(localStorage.getItem("user"));
const provider = JSON.parse(localStorage.getItem("provider"));

console.log("User Role:", user?.role);
console.log("Provider ID:", provider?.provider_id);

// Expected:
// User Role: "provider"
// Provider ID: 3 (or any number)
```

**Step 2: Test Backend API**
```
Open these URLs in browser:

1. http://localhost/backend/getAddonTemplates.php
   ✅ Should return JSON with 9 categories

2. http://localhost/backend/debug_provider_3.php
   ✅ Should show provider and user details
```

**Step 3: Check Network Tab**
```
1. Open DevTools (F12)
2. Go to Network tab
3. Click "Add Service" button
4. Look for "addProviderAddon.php" request
5. Click it, check:
   - Request Payload (should have provider_id)
   - Response (should show error details)
```

**Step 4: Check Backend Logs**
```
If using XAMPP:
C:\xampp\apache\logs\error.log

Look for PHP errors related to:
- Missing fields
- Database connection
- SQL errors
```

---

## Contact Points for Help

If issue persists, provide these details:

1. **Browser Console Logs** (F12 → Console tab)
2. **Network Request Details** (F12 → Network → addProviderAddon.php)
3. **Debug Banner Info** (Provider ID and User Role)
4. **Database Check Results** (SELECT COUNT(*) from addon_categories)
5. **localStorage Contents** (console.log both user and provider)

---

🪷 **Most issues are fixed by logging out and logging in again!**

The system stores provider data during login. If you logged in before the system was set up, the provider data might not have been saved correctly.

Always logout and login again after:
- Setting up the database
- Making changes to backend code
- Experiencing any authentication issues
