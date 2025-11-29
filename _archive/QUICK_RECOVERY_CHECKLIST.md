# ✅ QUICK RECOVERY CHECKLIST

## 🚨 Situation
- [x] XAMPP deleted accidentally
- [x] htdocs backup exists
- [ ] Need to restore everything

---

## 📝 Recovery Steps

### 1️⃣ Reinstall XAMPP (15 minutes)
- [ ] Download from: https://www.apachefriends.org/download.html
- [ ] Install to `C:\xampp`
- [ ] Start Apache
- [ ] Start MySQL

### 2️⃣ Restore Project Files (5 minutes)
- [ ] Copy backup htdocs to: `C:\xampp\htdocs\`
- [ ] Verify project at: `C:\xampp\htdocs\smart_funeral_system\`
- [ ] Check files exist: `backend/`, `frontend/`

### 3️⃣ Restore Database - Choose ONE method:

#### 🅰️ Method A: phpMyAdmin (EASIEST - Recommended)
- [ ] Open: http://localhost/phpmyadmin
- [ ] Click "SQL" tab
- [ ] Copy entire content from: `backend/MASTER_DATABASE_RESTORATION.sql`
- [ ] Paste and click "Go"
- [ ] Wait for "✅ Database restoration completed successfully!"

#### 🅱️ Method B: HeidiSQL (Alternative)
- [ ] Download: https://www.heidisql.com/download.php
- [ ] Install and open
- [ ] Connection settings:
  - Hostname: `127.0.0.1`
  - User: `root`
  - Password: (empty)
  - Port: `3306`
- [ ] Click "Open"
- [ ] File → Load SQL file → Select `backend/MASTER_DATABASE_RESTORATION.sql`
- [ ] Click "Execute"

### 4️⃣ Verify Database (2 minutes)
Open phpMyAdmin and check:
- [ ] Database `smart_funeral_system` exists
- [ ] Run this query to verify:
```sql
SHOW TABLES;
```
Expected: **15 tables** including:
- users
- service_provider
- packages
- bookings
- addon_categories
- addon_templates
- provider_addons
- provider_availability
- provider_reviews
- tributes
- (and 5 more tribute tables)

- [ ] Run this to check data:
```sql
SELECT COUNT(*) FROM addon_templates;
```
Expected: **49 rows**

- [ ] Run this to check categories:
```sql
SELECT COUNT(*) FROM addon_categories;
```
Expected: **9 rows**

### 5️⃣ Test Frontend (5 minutes)
```powershell
cd C:\xampp\htdocs\smart_funeral_system\frontend\my-app
npm install
npm run dev
```
- [ ] Frontend starts successfully
- [ ] Open: http://localhost:5173
- [ ] Check homepage loads
- [ ] Try browsing packages

### 6️⃣ Test Backend Connection (2 minutes)
- [ ] Open: http://localhost/smart_funeral_system/backend/getPackages.php
- [ ] Should return JSON (even if empty array is fine)
- [ ] No connection errors

---

## 🎯 Total Time: ~30 minutes

---

## ❌ Common Issues & Quick Fixes

### Issue 1: MySQL won't start
**Check port 3306:**
```powershell
netstat -ano | findstr :3306
```
**Fix:** Stop any MySQL service or change XAMPP port

### Issue 2: "Access denied for user 'root'"
**Fix:** Reset password:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY '';
FLUSH PRIVILEGES;
```

### Issue 3: "Database doesn't exist"
**Fix:** Run in phpMyAdmin:
```sql
CREATE DATABASE smart_funeral_system;
```
Then run the master SQL file again.

### Issue 4: Foreign key errors
**Fix:** Disable then re-enable:
```sql
SET FOREIGN_KEY_CHECKS=0;
-- Run your SQL
SET FOREIGN_KEY_CHECKS=1;
```

### Issue 5: Frontend can't connect
**Check:**
- [ ] Apache is running
- [ ] MySQL is running
- [ ] Database exists
- [ ] File: `backend/db_connect.php` has correct settings:
  - Host: `localhost`
  - User: `root`
  - Password: (empty)
  - Database: `smart_funeral_system`

---

## 📞 Need More Help?

1. **Database connection test:**
   ```
   http://localhost/smart_funeral_system/backend/db_connect.php
   ```

2. **Check XAMPP logs:**
   ```
   C:\xampp\mysql\data\mysql_error.log
   ```

3. **Frontend issues:**
   - Check browser console (F12)
   - Check terminal for npm errors

---

## ✅ Success Criteria

You're DONE when:
- [x] XAMPP Apache & MySQL are running (green in control panel)
- [x] Database `smart_funeral_system` exists with 15 tables
- [x] Add-on templates show 49 rows
- [x] Frontend loads at http://localhost:5173
- [x] Backend responds at http://localhost/smart_funeral_system/backend/
- [x] No connection errors in browser console

---

## 🎉 CONGRATULATIONS!
Your Smart Funeral System is fully restored and ready to use!
