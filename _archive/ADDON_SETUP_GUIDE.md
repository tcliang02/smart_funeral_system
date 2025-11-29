# Quick Setup Guide - Buddhist Add-On System

## Step-by-Step Database Setup

### Option 1: HeidiSQL (Recommended)
1. Open **HeidiSQL**
2. Connect to your MySQL database
3. Select the `smart_funeral_system` database
4. Click **File** → **Load SQL file**
5. Navigate to: `C:\xampp\htdocs\smart_funeral_system\backend\buddhist_addon_system.sql`
6. Click **Execute** (▶️ button or F9)
7. You should see: "Query executed successfully"

### Option 2: phpMyAdmin
1. Open **phpMyAdmin** (http://localhost/phpmyadmin)
2. Select the `smart_funeral_system` database
3. Click the **SQL** tab
4. Click **Browse** button
5. Select: `C:\xampp\htdocs\smart_funeral_system\backend\buddhist_addon_system.sql`
6. Click **Go**
7. You should see green success messages

### Option 3: Copy-Paste (If file upload doesn't work)
1. Open `backend/buddhist_addon_system.sql` in VS Code
2. **Select All** (Ctrl+A) and **Copy** (Ctrl+C)
3. Open phpMyAdmin → SQL tab
4. **Paste** the entire SQL script
5. Click **Go**

## Verify Installation

Run these queries in HeidiSQL or phpMyAdmin SQL tab:

```sql
-- Check tables created
SHOW TABLES LIKE 'addon%';
-- Should show: addon_categories, addon_templates, provider_addons

-- Check categories (should return 9)
SELECT COUNT(*) as total FROM addon_categories;

-- Check templates (should return 49)
SELECT COUNT(*) as total FROM addon_templates;

-- View categories
SELECT * FROM addon_categories ORDER BY display_order;

-- View templates by category
SELECT 
  c.category_name,
  COUNT(t.template_id) as template_count
FROM addon_categories c
LEFT JOIN addon_templates t ON c.category_id = t.category_id
GROUP BY c.category_id, c.category_name
ORDER BY c.display_order;
```

## Expected Results

After successful setup, you should have:
- ✅ **3 new tables:** addon_categories, addon_templates, provider_addons
- ✅ **9 categories:** Buddhist Rituals, Altars, Flowers, Urns, Monks, Memorial Items, Transportation, Cremation, Food
- ✅ **49 template add-ons:** Ready for providers to use

## Test the System

### 1. Test Template API
Open in browser:
```
http://localhost/smart_funeral_system/backend/getAddonTemplates.php
```
You should see JSON with 9 categories and their templates.

### 2. Test Active Add-ons API
Open in browser:
```
http://localhost/smart_funeral_system/backend/getActiveAddons.php?provider_id=1
```
You should see JSON with empty categories (provider hasn't added any yet).

### 3. Test Customer View
1. Open: http://localhost:5174/order-services
2. Login as family member (user1)
3. Click any package
4. Scroll to "Buddhist Ceremony Add-ons" section
5. You should see: "No add-ons available from this provider yet."

## Common Issues & Solutions

### Issue 1: "Table already exists" error
**Solution:** The tables were already created. This is fine! The script uses `CREATE TABLE IF NOT EXISTS` so it won't duplicate.

### Issue 2: Foreign key constraint fails
**Solution:** Make sure your `packages` and `service_provider` tables exist first. Run the main database setup first if needed.

### Issue 3: "Unknown database" error
**Solution:** Make sure you selected the `smart_funeral_system` database first.

### Issue 4: Character encoding issues
**Solution:** Make sure your database uses `utf8mb4` charset. Run:
```sql
ALTER DATABASE smart_funeral_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Next Steps

After successful database setup:

1. ✅ **Customer View is Ready** - Customers can browse packages (no add-ons yet)
2. ⏳ **Provider Dashboard Needed** - Create "Manage Add-ons" page for providers
3. 🎯 **Providers Add Services** - Providers enable Buddhist services
4. 🎉 **System Complete** - Customers can select add-ons during checkout

---

**Need Help?**
- Check `BUDDHIST_ADDON_SYSTEM.md` for complete documentation
- View sample data: Open HeidiSQL → Browse `addon_templates` table
- Test APIs using the URLs above

🪷 **All set? Let's create the Provider Dashboard next!** 🪷
