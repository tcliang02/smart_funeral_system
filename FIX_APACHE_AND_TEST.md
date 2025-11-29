# 🔧 Fix: Apache Not Running + Test Security

## ❌ Problem
Apache/XAMPP is not running, so we can't test the `.htaccess` file.

---

## ✅ Solution: Start Apache

### **Step 1: Start XAMPP Control Panel**

1. Open **XAMPP Control Panel**
   - Usually at: `C:\xampp\xampp-control.exe`
   - Or search "XAMPP" in Windows Start menu

2. **Start Apache:**
   - Click **"Start"** button next to Apache
   - Wait for it to turn green ✅
   - Should show "Running" status

3. **Verify Apache is running:**
   - Open browser: `http://localhost`
   - Should see XAMPP welcome page ✅

---

## ✅ Step 2: Test with Correct URL

Based on your setup, the correct URL is:
```
http://localhost/smart_funeral_system/backend/createBooking.php
```

### **Test in Browser:**

1. Open browser
2. Go to: `http://localhost/smart_funeral_system/backend/createBooking.php`
3. **Expected:** 403 Forbidden ✅ (security working!)

### **Test in PowerShell:**

```powershell
# Test with correct path
curl http://localhost/smart_funeral_system/backend/createBooking.php
```

**Expected Result:**
- Status: `403 Forbidden`
- Or: HTML page saying "Access Denied"

---

## ✅ Step 3: Verify Your App Still Works

1. **Start Next.js app:**
   ```bash
   cd frontend/my-app
   npm run dev
   ```

2. **Test your app:**
   - Login
   - Create booking
   - View dashboard
   - Everything should work ✅

---

## 🔍 Quick Check Commands

### **Check if Apache is running:**
```powershell
# Check if port 80 is listening
Test-NetConnection -ComputerName localhost -Port 80
```

**Should show:** `TcpTestSucceeded : True`

### **Test PHP file access:**
```powershell
# Test direct access (should fail with 403)
Invoke-WebRequest -Uri "http://localhost/smart_funeral_system/backend/createBooking.php" -UseBasicParsing
```

**Expected:** Status code `403`

---

## ❓ Troubleshooting

### **Issue: XAMPP Control Panel won't start Apache**

**Possible causes:**
1. Port 80 already in use (Skype, IIS, etc.)
2. Apache service already running
3. Permission issues

**Solutions:**

**1. Check if port 80 is in use:**
```powershell
netstat -ano | findstr :80
```

**2. Stop conflicting services:**
- Close Skype
- Stop IIS (if running): `iisreset /stop`
- Check Windows Services for "World Wide Web Publishing Service"

**3. Run XAMPP as Administrator:**
- Right-click XAMPP Control Panel
- Select "Run as administrator"

**4. Change Apache port:**
- In XAMPP Control Panel → Apache → Config → httpd.conf
- Change `Listen 80` to `Listen 8080`
- Update URLs to use port 8080

---

### **Issue: Still can access PHP files (no 403)**

**Check:**
1. `.htaccess` file exists at: `backend/.htaccess`
2. Apache `mod_rewrite` is enabled
3. `AllowOverride All` is set in httpd.conf

**Verify mod_rewrite:**
- Open: `C:\xampp\apache\conf\httpd.conf`
- Search for: `LoadModule rewrite_module`
- Should NOT be commented (no `#` in front)

**Verify AllowOverride:**
- In `httpd.conf`, find: `<Directory "C:/xampp/htdocs">`
- Should have: `AllowOverride All`

**Restart Apache** after changes.

---

## ✅ Success Checklist

- [ ] Apache is running (green in XAMPP Control Panel)
- [ ] Can access `http://localhost` (XAMPP welcome page)
- [ ] Direct PHP access returns 403 ✅
- [ ] App works normally ✅
- [ ] Ready for next step!

---

**Start Apache first, then test!** 🚀

