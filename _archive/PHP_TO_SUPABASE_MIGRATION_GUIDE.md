# 🚀 PHP to Supabase Migration Guide

## ✅ What's Ready

### 1. **Authentication** (Still uses PHP for bcrypt passwords)
- Login: `loginWithSupabase()` from `supabaseAuth.js`
- Logout: `logoutWithSupabase()` from `supabaseAuth.js`
- **Why PHP?** Your existing users have bcrypt-hashed passwords that need PHP to verify

### 2. **Data Queries** (Pure Supabase - no PHP needed!)
- All CRUD operations available in `supabaseData.js`
- Works with your migrated PostgreSQL database

---

## 📦 Available Supabase Functions

### **Packages**
```javascript
import { getPackages, getPackageDetails, addPackage } from './supabaseData';

// Get all packages
const result = await getPackages();
// Returns: { success: true, packages: [...] }

// Get package with features
const details = await getPackageDetails(100);
// Returns: { success: true, package: {...}, features: [...] }

// Add new package (provider only)
const newPkg = await addPackage({ 
  provider_id: 19, 
  name: "Premium Package", 
  price: 5000.00 
});
```

### **Bookings**
```javascript
import { getBookings, createBooking } from './supabaseData';

// Get user's bookings (includes packages & add-ons)
const result = await getBookings(15);
// Returns: { success: true, bookings: [...] }

// Create new booking
const booking = await createBooking({
  user_id: 15,
  package_id: 100,
  customer_name: "John Doe",
  customer_email: "john@example.com",
  total_amount: 8500.00,
  status: "pending"
});
```

### **Service Providers**
```javascript
import { getServiceProviders, getProviderDetails } from './supabaseData';

// Get all providers
const result = await getServiceProviders();
// Returns: { success: true, providers: [...] }

// Get provider details
const provider = await getProviderDetails(19);
// Returns: { success: true, provider: {...} }
```

### **Add-ons**
```javascript
import { getAddonTemplates, getAddonCategories } from './supabaseData';

// Get all addon templates
const addons = await getAddonTemplates();

// Get addons by category
const florals = await getAddonTemplates(1); // category_id=1

// Get categories
const categories = await getAddonCategories();
```

### **Tributes**
```javascript
import { getTributes, getTributeDetails } from './supabaseData';

// Get all tributes
const result = await getTributes();

// Get tribute by ID
const tribute = await getTributeDetails(1);
```

---

## 🔄 How to Convert Each Page

### **Example 1: ServiceProvider.jsx**
**Before (PHP):**
```javascript
const response = await fetch('/backend/getProviders.php');
const data = await response.json();
setProviders(data.providers);
```

**After (Supabase):**
```javascript
import { getServiceProviders } from '../supabaseData';

const result = await getServiceProviders();
if (result.success) {
  setProviders(result.providers);
}
```

---

### **Example 2: PackageSelectionPage.jsx**
**Before (PHP):**
```javascript
const response = await fetch(\`/backend/getPackageDetails.php?id=\${id}\`);
const data = await response.json();
setPackage(data.package);
setFeatures(data.features);
```

**After (Supabase):**
```javascript
import { getPackageDetails } from '../supabaseData';

const result = await getPackageDetails(id);
if (result.success) {
  setPackage(result.package);
  setFeatures(result.features);
}
```

---

### **Example 3: Orders.jsx (Bookings)**
**Before (PHP):**
```javascript
const response = await fetch(\`/backend/getBookings.php?user_id=\${userId}\`);
const data = await response.json();
setBookings(data.bookings);
```

**After (Supabase):**
```javascript
import { getBookings } from '../supabaseData';

const result = await getBookings(userId);
if (result.success) {
  setBookings(result.bookings);
}
```

---

## 🎯 Migration Priority Order

### **Phase 1: Read-Only Pages** (Start here - easiest)
1. ✅ **ServiceProvider.jsx** - Just displays providers
2. ✅ **PackageSelectionPage.jsx** - Shows packages
3. ✅ **ProviderDetails.jsx** - Provider details
4. ✅ **Orders.jsx** - View bookings
5. ✅ **TributeHome.jsx** - Browse tributes

### **Phase 2: Forms with Data Submission**
6. **Checkout.jsx** - Create bookings
7. **ManagePackages.jsx** - Add/edit packages
8. **ManageAddons.jsx** - Add/edit add-ons
9. **TributeCreate.jsx** - Create tributes

### **Phase 3: Complex Features**
10. **Payment.jsx** - Handle payments
11. **ProviderBookings.jsx** - Provider dashboard
12. **CustomerRatings.jsx** - Reviews

---

## 🛠️ Quick Find & Replace Patterns

### Pattern 1: Simple GET requests
```javascript
// FIND:
fetch('/backend/getXxx.php')

// REPLACE WITH:
import { getXxx } from '../supabaseData';
// Then use: const result = await getXxx();
```

### Pattern 2: GET with parameters
```javascript
// FIND:
fetch(\`/backend/getXxx.php?id=\${id}\`)

// REPLACE WITH:
import { getXxx } from '../supabaseData';
// Then use: const result = await getXxx(id);
```

### Pattern 3: POST requests
```javascript
// FIND:
fetch('/backend/addXxx.php', {
  method: 'POST',
  body: JSON.stringify(data)
})

// REPLACE WITH:
import { addXxx } from '../supabaseData';
// Then use: const result = await addXxx(data);
```

---

## ⚠️ Important Notes

### **1. Authentication Still Uses PHP**
- Login/Register still call PHP backend for password hashing
- This is **intentional** - bcrypt passwords need PHP
- All other data queries use Supabase directly

### **2. Response Format**
All Supabase functions return consistent format:
```javascript
{
  success: true,    // or false
  data: {...},      // or error message
  message: "..."    // optional error message
}
```

### **3. Error Handling**
Always check `result.success` before using data:
```javascript
const result = await getPackages();
if (!result.success) {
  console.error(result.message);
  return;
}
// Use result.packages safely
```

### **4. Relationships**
Supabase handles joins automatically:
```javascript
// This gets bookings WITH packages and add-ons in one query!
const result = await getBookings(userId);
// result.bookings[0].packages = {...}
// result.bookings[0].booking_addons = [...]
```

---

## 🎯 Next Steps

1. **Pick ONE simple page** (e.g., ServiceProvider.jsx)
2. **Convert it** using the patterns above
3. **Test it** - verify data loads correctly
4. **Move to next page**

**Start with read-only pages** - they're easiest and safest to test!

---

## 🆘 Need Help?

**Common Issues:**
- "Cannot read properties of undefined" → Check `result.success` first
- "No data returned" → Check table name matches database exactly
- "Foreign key constraint" → Make sure related records exist

**Where to Get Help:**
- Check `VERIFY_SUPABASE_DATA.sql` - shows what data exists
- Use Supabase Table Editor - view actual database
- Console log the `result` object to see what's returned

---

**🚀 Ready to convert your first page!**
