# 🚀 Quick Start: Start Apache and Test Security

## ✅ Step 1: Start Apache

### **Option A: XAMPP Control Panel (Easiest)**

1. **Open XAMPP Control Panel:**
   - Press `Windows Key` + `R`
   - Type: `C:\xampp\xampp-control.exe`
   - Press Enter

2. **Start Apache:**
   - Click the **"Start"** button next to Apache
   - Wait for it to turn **green** ✅
   - Status should show "Running"

3. **Verify:**
   - Open browser: `http://localhost`
   - Should see XAMPP welcome page ✅

---

### **Option B: Command Line (Alternative)**

```powershell
# Start Apache service
Start-Service -Name "Apache2.4" -ErrorAction SilentlyContinue

# Or if service name is different:
& "C:\xampp\apache\bin\httpd.exe" -k start
```

---

## ✅ Step 2: Test Security

### **Test 1: Verify Apache is Running**

```powershell
# Check if port 80 is open
Test-NetConnection -ComputerName localhost -Port 80
```

**Expected:** `TcpTestSucceeded : True` ✅

---

### **Test 2: Test Direct PHP Access (Should FAIL with 403)**

**In Browser:**
```
http://localhost/smart_funeral_system/backend/createBooking.php
```

**In PowerShell:**
```powershell
# Test direct access
Invoke-WebRequest -Uri "http://localhost/smart_funeral_system/backend/createBooking.php" -UseBasicParsing
```

**Expected Result:**
- Status Code: `403 Forbidden` ✅
- This means `.htaccess` security is working!

---

### **Test 3: Verify Your App Works**

1. **Start Next.js:**
   ```bash
   cd frontend/my-app
   npm run dev
   ```

2. **Use your app:**
   - Login
   - Create booking
   - Should work normally ✅

---

## 🎯 Quick Test Script

Run this in PowerShell after starting Apache:

```powershell
# Test Apache is running
Write-Host "Testing Apache..." -ForegroundColor Cyan
$result = Test-NetConnection -ComputerName localhost -Port 80 -WarningAction SilentlyContinue
if ($result.TcpTestSucceeded) {
    Write-Host "✅ Apache is running!" -ForegroundColor Green
    
    # Test PHP file access
    Write-Host "`nTesting PHP file access..." -ForegroundColor Cyan
    try {
        $response = Invoke-WebRequest -Uri "http://localhost/smart_funeral_system/backend/createBooking.php" -UseBasicParsing -ErrorAction Stop
        Write-Host "⚠️ WARNING: PHP file is accessible (Status: $($response.StatusCode))" -ForegroundColor Yellow
        Write-Host "   .htaccess might not be working" -ForegroundColor Yellow
    } catch {
        if ($_.Exception.Response.StatusCode -eq 403) {
            Write-Host "✅ Security working! PHP file blocked (403 Forbidden)" -ForegroundColor Green
        } else {
            Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
} else {
    Write-Host "❌ Apache is NOT running!" -ForegroundColor Red
    Write-Host "   Please start Apache from XAMPP Control Panel" -ForegroundColor Yellow
}
```

---

## ❓ Troubleshooting

### **Can't start Apache?**

**Common issues:**
1. **Port 80 in use:**
   - Close Skype
   - Stop IIS: `iisreset /stop`
   - Check: `netstat -ano | findstr :80`

2. **Permission issues:**
   - Run XAMPP Control Panel as Administrator
   - Right-click → "Run as administrator"

3. **Apache service not installed:**
   - Use XAMPP Control Panel (not Windows Services)
   - XAMPP runs Apache as a process, not a service

---

**Start Apache first, then run the tests!** 🚀

