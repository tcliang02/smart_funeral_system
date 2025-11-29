# 🛡️ Start Here: Security Hardening

## ⚠️ Important: Your Architecture

**You're using Next.js + Supabase, NOT PHP backend!**

- ✅ **Frontend:** Next.js (port 3000 or Vercel)
- ✅ **Backend:** Next.js API Routes (`/api/backend/*`)
- ✅ **Database:** Supabase (PostgreSQL)
- ❌ **PHP Backend:** Legacy, not exposed via HTTP

**This means:**
- ❌ **No Apache needed** - Next.js runs its own server
- ❌ **No `.htaccess` needed** - PHP files aren't accessed via HTTP
- ✅ **Focus on:** Next.js API route security instead

**See `SECURITY_FOR_NEXTJS_SUPABASE.md` for the correct security approach!**

---

## 🎯 Goal (Updated for Next.js)
Secure your Next.js API routes with authentication middleware.

---

## ✅ Step 1: Create `.htaccess` File (15 minutes)

### **What This Does:**
- Blocks direct access to PHP files (security)
- Still allows Next.js to access them (your app works)
- Takes 5 seconds to rollback if needed

### **Instructions:**

#### **1. Copy the Template** ⏱️ 2 minutes

```bash
# Navigate to backend folder
cd backend

# Copy the template
cp .htaccess.template .htaccess
```

**Or manually:**
1. Open `backend/.htaccess.template`
2. Copy all contents
3. Create new file: `backend/.htaccess`
4. Paste contents

---

#### **2. Update the Domains** ⏱️ 2 minutes

Open `backend/.htaccess` and update this line:

```apache
# Change this:
<If "%{HTTP_REFERER} =~ /localhost:3000|yourdomain.com|vercel.app/">

# To match your setup:
<If "%{HTTP_REFERER} =~ /localhost:3000|your-actual-domain.com|vercel.app/">
```

**For local development, you can use:**
```apache
<If "%{HTTP_REFERER} =~ /localhost:3000|localhost/">
    Allow from all
</If>
```

---

#### **3. Test It Works** ⏱️ 10 minutes

**Test 1: Direct PHP Access Should Fail**
```bash
# Try accessing PHP file directly in browser:
http://localhost/backend/createBooking.php

# Expected: 403 Forbidden ✅
```

**Test 2: Your App Should Still Work**
1. Start your Next.js app: `npm run dev`
2. Use your app normally (login, create booking, etc.)
3. Everything should work as before ✅

**Test 3: Check Error Logs**
- Check Apache error log: `C:\xampp\apache\logs\error.log`
- Should see 403 errors for direct PHP access (this is good!)
- No errors for normal app usage

---

#### **4. If Something Breaks** ⏱️ 5 seconds

**Quick Rollback:**
```bash
# Delete the .htaccess file
rm backend/.htaccess

# Or rename it
mv backend/.htaccess backend/.htaccess.backup
```

**Your app will work normally again immediately.**

---

## ✅ Step 2: Create Auth Middleware (Next - 30 minutes)

**After `.htaccess` is working, proceed to:**
- Create `backend/auth_middleware.php`
- Test on ONE endpoint first
- See `ARCHITECTURE_GAPS_IMPLEMENTATION.md` for code

---

## 📋 Checklist

- [ ] Copied `.htaccess.template` to `.htaccess`
- [ ] Updated domains in `.htaccess`
- [ ] Tested: Direct PHP access returns 403 ✅
- [ ] Tested: App works normally ✅
- [ ] Checked error logs (no unexpected errors)
- [ ] Ready for Step 2 (Auth Middleware)

---

## ❓ Troubleshooting

### **Issue: App stops working after adding `.htaccess`**
- **Solution:** Check if Next.js routes call PHP via HTTP (they shouldn't)
- **Quick fix:** Remove `.htaccess`, check your Next.js API routes
- **Verify:** Your frontend calls `/api/backend/*` (Next.js routes), not `/backend/*.php`

### **Issue: Still can access PHP files directly**
- **Solution:** Check Apache `mod_rewrite` is enabled
- **Check:** `C:\xampp\apache\conf\httpd.conf` should have `LoadModule rewrite_module`
- **Restart:** Apache after enabling

### **Issue: 403 errors for everything**
- **Solution:** The HTTP_REFERER check might be too strict
- **Quick fix:** Temporarily allow all for testing:
  ```apache
  <FilesMatch "\.php$">
      Order Deny,Allow
      # Allow from all (for testing only - remove in production)
      Allow from all
  </FilesMatch>
  ```

---

## 🎉 Success Criteria

**You're done when:**
- ✅ Direct PHP access returns 403
- ✅ Your app works normally
- ✅ No errors in logs
- ✅ Ready for next step (Auth Middleware)

---

**Ready? Start with Step 1 above!** 🚀

