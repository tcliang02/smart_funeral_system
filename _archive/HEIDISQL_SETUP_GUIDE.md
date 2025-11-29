# 🔌 HeidiSQL Setup Guide for Smart Funeral System

## What is HeidiSQL?
HeidiSQL is a free, powerful database management tool for MySQL. It's an alternative to phpMyAdmin with a more desktop-like interface.

---

## 📥 Download & Install

1. **Download HeidiSQL:**
   - Official site: https://www.heidisql.com/download.php
   - Choose: "Installer" (recommended)
   - Latest stable version

2. **Install:**
   - Run the installer
   - Accept defaults
   - Click "Install"

---

## 🔗 Connect to Your MySQL Database

### Step 1: Launch HeidiSQL
- Open HeidiSQL from Start Menu or Desktop

### Step 2: Create New Session
- Click **"New"** button (bottom left)
- Or: File → Session Manager → New

### Step 3: Connection Settings
Fill in these details EXACTLY:

```
Session name: Smart Funeral System (or any name you like)
Network type: MySQL (TCP/IP)
Library: libmysql.dll
Hostname / IP: 127.0.0.1
User: root
Password: (leave EMPTY - no password by default)
Port: 3306
```

**Important Notes:**
- Use `127.0.0.1` NOT `localhost` (works better)
- Password is EMPTY by default in XAMPP
- Port is `3306` (default MySQL port)

### Step 4: Test Connection
- Click **"Open"** button
- Should connect successfully
- You'll see databases in left panel

### Step 5: Find Your Database
Look in the left panel for: `smart_funeral_system`

**If you DON'T see it:**
- Right-click in left panel → "Create new" → "Database"
- Name: `smart_funeral_system`
- Collation: `utf8mb4_general_ci`
- Click OK

---

## 📂 Import Your Database

### Method 1: Load SQL File (Recommended)
1. **Select database:**
   - Click on `smart_funeral_system` in left panel

2. **Load SQL file:**
   - File → Load SQL file...
   - Navigate to: `C:\xampp\htdocs\smart_funeral_system\backend\`
   - Select: `MASTER_DATABASE_RESTORATION.sql`
   - Click "Open"

3. **Execute:**
   - Press **F9** or click **"Execute"** (blue play button)
   - Watch the log at bottom
   - Should see: "✅ Database restoration completed successfully!"

### Method 2: Copy-Paste SQL
1. **Open SQL file** in notepad:
   - `backend/MASTER_DATABASE_RESTORATION.sql`

2. **Copy entire content** (Ctrl+A, Ctrl+C)

3. **In HeidiSQL:**
   - Click on `smart_funeral_system` database
   - Go to "Query" tab
   - Paste SQL (Ctrl+V)
   - Click "Execute" (F9)

---

## ✅ Verify Database is Working

### Check 1: See All Tables
```sql
SHOW TABLES;
```
**Expected:** 15 tables

### Check 2: Count Add-on Templates
```sql
SELECT COUNT(*) as total FROM addon_templates;
```
**Expected:** 49

### Check 3: View Categories
```sql
SELECT * FROM addon_categories;
```
**Expected:** 9 rows (Buddhist funeral categories)

### Check 4: Check Users
```sql
SELECT * FROM users;
```
**Expected:** At least 1 admin user

---

## 🎯 Common Tasks in HeidiSQL

### View Table Data
1. Expand `smart_funeral_system` in left panel
2. Click on any table (e.g., `addon_templates`)
3. See data in main panel
4. Can edit directly in cells

### Run Custom Queries
1. Click "Query" tab at top
2. Type SQL query
3. Press F9 to execute
4. Results appear below

### Export Database Backup
1. Right-click `smart_funeral_system` database
2. Select "Export database as SQL"
3. Choose location to save
4. Click "Export"
5. **Save this file as backup!**

### Import Data from CSV
1. Select table
2. Tools → Import CSV file
3. Choose your CSV file
4. Map columns
5. Click "Import"

---

## 🔧 Troubleshooting

### ❌ "Can't connect to MySQL server"
**Causes:**
- MySQL not running in XAMPP
- Wrong port number
- Firewall blocking

**Fix:**
1. Open XAMPP Control Panel
2. Make sure MySQL is "Running" (green)
3. If not, click "Start" next to MySQL
4. Try connecting again

### ❌ "Access denied for user 'root'@'localhost'"
**Cause:** Password is set but you're trying empty password

**Fix:**
- Try password: (empty)
- Try password: `admin`
- Try password: `root`

**Or reset password:**
```sql
-- In XAMPP shell:
mysqladmin -u root password ""
```

### ❌ "Unknown database 'smart_funeral_system'"
**Fix:**
```sql
CREATE DATABASE smart_funeral_system;
```

### ❌ Port 3306 already in use
**Check what's using it:**
```powershell
netstat -ano | findstr :3306
```

**Fix:**
- Stop other MySQL instances
- Or change XAMPP MySQL port in `my.ini`

---

## 💡 Pro Tips

### Tip 1: Save Your Session
- After connecting successfully
- Session Manager → Save
- Next time just click "Open"

### Tip 2: Auto-Refresh
- Tools → Preferences → Data
- Enable "Auto-refresh after data change"

### Tip 3: Keyboard Shortcuts
- **F9** = Execute query
- **F5** = Refresh
- **Ctrl+T** = New query tab
- **Ctrl+D** = Duplicate current row

### Tip 4: Export Before Making Changes
- Always export backup before major changes
- Right-click database → Export as SQL
- Save with date: `backup_2025-10-23.sql`

---

## 📊 HeidiSQL Interface Overview

```
┌─────────────────────────────────────────────────────────────┐
│  File  Edit  Tools  Help                          [- □ X]   │
├──────────┬──────────────────────────────────────────────────┤
│          │  Query   Data   Info                             │
│ Sessions │                                                   │
│          │  ┌────────────────────────────────────────────┐  │
│ ├─📊 Local│  │ SELECT * FROM addon_templates;            │  │
│ │ ├─📊 DB  │  │ -- Your SQL queries here                  │  │
│ │   ├─📁 users│ └────────────────────────────────────────┤  │
│ │   ├─📁 packages                                          │
│ │   ├─📁 bookings       [Execute F9]                       │
│ │   ├─📁 addons                                            │
│ │   └─ ...    ┌────────────────────────────────────────┐  │
│ │             │  Results (49 rows, 0.025 sec)          │  │
│ │             │  template_id | template_name | price   │  │
│ │             │  1          | 7-Day Prayer  | 2500.00 │  │
│ │             │  ...                                    │  │
│ └─────────────└─────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎉 You're All Set!

You can now:
- ✅ Connect to MySQL database
- ✅ View and edit tables
- ✅ Run SQL queries
- ✅ Import/Export data
- ✅ Create backups

**Next Step:** Go to your project and test the application!
```
http://localhost:5173 (Frontend)
http://localhost/smart_funeral_system/backend/ (Backend)
```

---

## 📚 Learn More

**Official Documentation:**
https://www.heidisql.com/help.php

**Video Tutorials:**
- YouTube: "HeidiSQL tutorial for beginners"
- YouTube: "How to use HeidiSQL with XAMPP"

**Alternative Tools:**
- phpMyAdmin (web-based, included with XAMPP)
- MySQL Workbench (official MySQL tool)
- DBeaver (free, supports multiple databases)

---

**Happy Database Management! 🚀**
