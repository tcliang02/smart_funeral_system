# 🎯 QUICK START GUIDE - Testing Buddhist Add-On System

## Before You Start

Make sure:
- ✅ XAMPP Apache & MySQL are running
- ✅ Frontend dev server is running (`npm run dev` in frontend/my-app)
- ✅ Database `smart_funeral_system` exists
- ✅ Buddhist add-on system SQL has been executed

---

## 🔥 Fast Track - 7 Steps to Success

### **STEP 1: Find Your Provider Username**
```
Open: http://localhost/smart_funeral_system/backend/test_provider_setup.php
```
Look for **Provider 3** and note the **Username**

---

### **STEP 2: Login as Provider**
```
URL: http://localhost:5174/login
Role: Service Provider
Username: [from Step 1]
Password: [your password]
```

---

### **STEP 3: Go to Manage Add-ons**
```
Click: "🪷 Manage Buddhist Add-ons" button
OR
Direct: http://localhost:5174/manage-addons
```

---

### **STEP 4: Check Debug Banner**
Look for blue banner at top:
```
Debug: Provider ID = 3 | User Role = provider
```
✅ **If you see a number → Continue!**  
❌ **If you see null → Logout and login again**

---

### **STEP 5: Add a Service**
```
1. Click "Browse Templates" tab
2. Select "Buddhist Rituals & Ceremonies" category
3. Find "7-Day Buddhist Prayer Ceremony"
4. Click "Add Service"
5. Adjust price if needed
6. Click "✅ Add to My Services"
```

---

### **STEP 6: View Your Services**
```
1. Click "My Add-ons" tab
2. See your service listed
3. Try editing, disabling, or deleting
```

---

### **STEP 7: Test Customer View**
```
1. Logout
2. Login as user1 (family role)
3. Go to Order Services
4. Select Provider 3's package
5. Scroll to "Buddhist Ceremony Add-ons"
6. Select add-ons and watch price update
```

---

## 🚨 If Something Goes Wrong

| Problem | Solution |
|---------|----------|
| **Access Denied** | Check you're using correct provider username |
| **Provider ID = null** | Logout and login again |
| **Missing fields error** | Open browser console (F12), check logs |
| **No templates** | Run `buddhist_addon_system.sql` again |
| **Can't see add-ons (customer)** | Make sure provider added and enabled services |

---

## 📞 Get Help

**Full Troubleshooting:** `ADDON_TROUBLESHOOTING.md`  
**Quick Fix:** `QUICK_FIX_ADDON_ERROR.md`  
**Complete Testing:** `ADDON_TESTING_GUIDE.md`

---

🪷 **Most issues fixed by: Logout → Login → Try again** 🪷
