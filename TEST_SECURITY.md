# 🧪 Test Your Security Implementation

## ✅ Step 1: Verify `.htaccess` File Created

**Check:**
- File exists at: `backend/.htaccess`
- File contains security rules

**If file doesn't exist:**
- It was just created for you
- Check `backend/.htaccess` now

---

## ✅ Step 2: Test Direct PHP Access (Should FAIL)

### **Test 1: Browser Test**

1. Open your browser
2. Go to: `http://localhost/backend/createBooking.php`
   - Or: `http://localhost/smart_funeral_system/backend/createBooking.php`
   - (Adjust path based on your XAMPP setup)

**Expected Result:**
- ❌ **403 Forbidden** or **Access Denied**
- ✅ This means security is working!

**If you see PHP code or JSON response:**
- ⚠️ `.htaccess` might not be working
- Check Apache `mod_rewrite` is enabled
- See troubleshooting below

---

### **Test 2: Command Line Test**

Open PowerShell and run:

```powershell
# Test if PHP file is blocked
curl http://localhost/backend/createBooking.php
```

**Expected Result:**
- Status: `403 Forbidden`
- Or: `Access Denied`

---

## ✅ Step 3: Test Your App (Should WORK)

1. **Start your Next.js app:**
   ```bash
   cd frontend/my-app
   npm run dev
   ```

2. **Use your app normally:**
   - Login
   - Create a booking
   - View dashboard
   - All features should work ✅

**If your app breaks:**
- ⚠️ Check if Next.js routes call PHP directly
- They shouldn't - they should use database queries
- See troubleshooting below

---

## ✅ Step 4: Check Apache Error Log

**Location:** `C:\xampp\apache\logs\error.log`

**What to look for:**
- ✅ 403 errors for direct PHP access (this is good!)
- ❌ No errors for normal app usage

**If you see errors:**
- Note the error message
- Check if it's related to `.htaccess`
- See troubleshooting below

---

## ❓ Troubleshooting

### **Issue: Still can access PHP files directly (no 403)**

**Possible causes:**
1. Apache `mod_rewrite` not enabled
2. `.htaccess` not in correct location
3. Apache not reading `.htaccess` files

**Solutions:**

**1. Check mod_rewrite:**
- Open: `C:\xampp\apache\conf\httpd.conf`
- Search for: `LoadModule rewrite_module`
- Should NOT be commented out (no `#` in front)
- If commented, remove `#` and restart Apache

**2. Check AllowOverride:**
- In `httpd.conf`, find: `<Directory "C:/xampp/htdocs">`
- Should have: `AllowOverride All`
- If it says `AllowOverride None`, change to `All`
- Restart Apache

**3. Restart Apache:**
- XAMPP Control Panel → Stop Apache → Start Apache

---

### **Issue: App stops working after adding `.htaccess`**

**Possible causes:**
1. Next.js routes calling PHP via HTTP
2. HTTP_REFERER check too strict

**Solutions:**

**1. Check Next.js routes:**
- Your routes should use database queries, not HTTP calls to PHP
- Check: `frontend/my-app/src/app/api/backend/*/route.ts`
- They should use `@/lib/db`, not `fetch('backend/...')`

**2. Relax HTTP_REFERER check:**
- Edit `backend/.htaccess`
- Change line 16 to allow more:
  ```apache
  <If "%{HTTP_REFERER} =~ /localhost|127.0.0.1/">
      Allow from all
  </If>
  ```

**3. Quick rollback:**
- Delete `backend/.htaccess`
- App will work again immediately
- Then investigate the issue

---

### **Issue: 403 errors for everything (even your app)**

**Solution:**
- HTTP_REFERER might not be sent
- Use IP-based allow instead:

```apache
# Comment out HTTP_REFERER check
# <If "%{HTTP_REFERER} =~ /localhost:3000|localhost|127.0.0.1/">
#     Allow from all
# </If>

# Use IP-based allow for development
<If "%{REMOTE_ADDR} =~ /127.0.0.1|::1/">
    Allow from all
</If>
```

---

## ✅ Success Checklist

- [ ] `.htaccess` file exists at `backend/.htaccess`
- [ ] Direct PHP access returns 403 ✅
- [ ] App works normally ✅
- [ ] No errors in Apache log (except expected 403s)
- [ ] Ready for next step (Auth Middleware)

---

## 🎉 Next Steps

Once all tests pass:
1. ✅ Security is working!
2. 📋 Proceed to create `auth_middleware.php`
3. 📋 See `ARCHITECTURE_GAPS_IMPLEMENTATION.md` for next steps

---

**Run these tests now and let me know the results!** 🚀

