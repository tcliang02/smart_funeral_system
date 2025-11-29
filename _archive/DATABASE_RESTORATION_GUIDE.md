# 🔧 Database Restoration Guide - Smart Funeral System

## 🚨 Situation
- XAMPP was accidentally deleted
- htdocs backup exists
- Need to restore database: `smart_funeral_system`

---

## 📋 Step-by-Step Recovery

### Step 1: Reinstall XAMPP
1. **Download XAMPP**: https://www.apachefriends.org/download.html
2. **Install** to `C:\xampp` (same location as before)
3. **Start** Apache and MySQL from XAMPP Control Panel

### Step 2: Restore htdocs
1. Copy your backup htdocs folder to: `C:\xampp\htdocs\`
2. Your project should be at: `C:\xampp\htdocs\smart_funeral_system\`

### Step 3: Restore Database

#### Option A: If you have a `.sql` backup file
1. Open **phpMyAdmin**: http://localhost/phpmyadmin
2. Click **"New"** → Create database: `smart_funeral_system`
3. Select the database
4. Click **"Import"** tab
5. Click **"Choose File"** → Select your backup `.sql` file
6. Click **"Go"** at the bottom
7. ✅ Done!

#### Option B: If you DON'T have a backup (Recreate from scratch)
Follow the steps below to recreate all tables.

---

## 🗄️ Database Recreation Script

### Method 1: Using phpMyAdmin (Easiest)
1. Open **phpMyAdmin**: http://localhost/phpmyadmin
2. Click **"New"** → Database name: `smart_funeral_system`
3. Click **"SQL"** tab
4. Copy and paste the complete SQL script below
5. Click **"Go"**

### Method 2: Using HeidiSQL
1. **Download HeidiSQL**: https://www.heidisql.com/download.php
2. **Install and Open**
3. Click **"New"** → Session settings:
   - Network type: MySQL (TCP/IP)
   - Hostname: 127.0.0.1
   - User: root
   - Password: (leave empty unless you set one)
   - Port: 3306
4. Click **"Open"**
5. Right-click on left panel → **"Create new"** → **"Database"**
6. Name: `smart_funeral_system`
7. Right-click on the new database → **"Load SQL file..."**
8. Select the SQL scripts in order (see below)

---

## 📦 SQL Files to Run (In Order)

Run these SQL files from your `backend` folder in this order:

```sql
-- Location: backend/buddhist_addon_system.sql
-- Creates: addon_categories, addon_templates, provider_addons
```

```sql
-- Location: backend/add_provider_availability.sql
-- Creates: provider_availability
```

```sql
-- Location: backend/rating_system_enhancement.sql
-- Creates/Updates: provider_reviews table
```

```sql
-- Location: backend/booking_enhancements.sql
-- Creates/Updates: bookings table
```

---

## 🔍 Core Tables Needed

Your system requires these main tables:

### 1. **Users Table**
```sql
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('customer', 'provider', 'admin') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. **Providers Table**
```sql
CREATE TABLE IF NOT EXISTS providers (
    provider_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    business_name VARCHAR(200) NOT NULL,
    description TEXT,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    website VARCHAR(200),
    logo_url VARCHAR(255),
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

### 3. **Packages Table**
```sql
CREATE TABLE IF NOT EXISTS packages (
    package_id INT AUTO_INCREMENT PRIMARY KEY,
    provider_id INT NOT NULL,
    package_name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    image_url VARCHAR(255),
    features TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES providers(provider_id) ON DELETE CASCADE
);
```

### 4. **Bookings Table**
```sql
CREATE TABLE IF NOT EXISTS bookings (
    booking_id VARCHAR(20) PRIMARY KEY,
    user_id INT,
    provider_id INT NOT NULL,
    package_id INT NOT NULL,
    booking_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    service_date DATE NOT NULL,
    service_location TEXT,
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (provider_id) REFERENCES providers(provider_id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES packages(package_id) ON DELETE CASCADE
);
```

### 5. **Buddhist Add-on System** (Run the SQL file)
```bash
backend/buddhist_addon_system.sql
```

### 6. **Provider Availability** (Run the SQL file)
```bash
backend/add_provider_availability.sql
```

### 7. **Rating System** (Run the SQL file)
```bash
backend/rating_system_enhancement.sql
```

---

## 🎯 Quick Setup Script

**Create a master setup file:**

1. Create: `backend/RESTORE_DATABASE.sql`
2. Copy all SQL from the files mentioned above
3. Run this single file in phpMyAdmin

---

## ✅ Verification Steps

After restoring, verify your database:

### 1. Check Tables Exist
```sql
SHOW TABLES;
```

Expected tables:
- users
- providers
- packages
- bookings
- addon_categories
- addon_templates
- provider_addons
- provider_availability
- provider_reviews
- tributes (if using tribute feature)
- tribute_messages
- tribute_photos
- tribute_candles
- tribute_rsvp

### 2. Check Data
```sql
SELECT COUNT(*) FROM addon_templates; -- Should be 49
SELECT COUNT(*) FROM addon_categories; -- Should be 9
SELECT * FROM users WHERE role = 'provider';
SELECT * FROM providers;
```

### 3. Test Connection
1. Start your frontend: 
```bash
cd frontend/my-app
npm install
npm run dev
```

2. Test login at: http://localhost:5173

---

## 🆘 Troubleshooting

### Issue: "Can't connect to MySQL server"
**Solution:**
1. Open XAMPP Control Panel
2. Click **"Start"** next to MySQL
3. If it fails, check if port 3306 is in use:
```powershell
netstat -ano | findstr :3306
```

### Issue: "Access denied for user 'root'@'localhost'"
**Solution:**
1. Reset MySQL password in XAMPP:
2. Open XAMPP Shell
3. Run:
```bash
mysqladmin -u root password ""
```

### Issue: "Database 'smart_funeral_system' doesn't exist"
**Solution:**
1. Create it first:
```sql
CREATE DATABASE smart_funeral_system;
```

### Issue: HeidiSQL won't connect
**Solution:**
- Hostname: `127.0.0.1` (not localhost)
- Port: `3306`
- User: `root`
- Password: (empty)
- Make sure MySQL is running in XAMPP

---

## 📞 Need Help?

If you encounter any issues:
1. Check XAMPP error logs: `C:\xampp\mysql\data\mysql_error.log`
2. Verify MySQL is running in XAMPP Control Panel
3. Test phpMyAdmin: http://localhost/phpmyadmin

---

## 🎯 Summary Checklist

- [ ] XAMPP reinstalled
- [ ] Apache started
- [ ] MySQL started
- [ ] htdocs folder restored
- [ ] Database `smart_funeral_system` created
- [ ] All SQL scripts executed
- [ ] Tables verified (SHOW TABLES)
- [ ] Test users exist
- [ ] Frontend connects successfully

---

**✅ Once all steps are complete, your system should be fully operational!**
