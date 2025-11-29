# How to Run Supabase Migration - Step by Step

## ⚠️ IMPORTANT: Copy ONLY the SQL file, NOT the documentation!

The error you got happened because you copied markdown documentation text instead of SQL code.

---

## ✅ Correct Steps:

### Step 1: Open the Correct File

Open this file in your code editor:
```
backend/sql/SUPABASE_MIGRATION_CLEAN.sql
```

**OR**

```
backend/sql/RECOMMENDED_SCHEMA_ENHANCEMENTS_POSTGRESQL.sql
```

### Step 2: Copy ONLY the SQL Code

1. **Select ALL** the content in the SQL file (Ctrl+A or Cmd+A)
2. **Copy** it (Ctrl+C or Cmd+C)
3. **DO NOT** copy from any `.md` (markdown) files - those are documentation only!

### Step 3: Paste into Supabase

1. Go to **Supabase Dashboard**: https://app.supabase.com
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"**
5. **Paste** the SQL code (Ctrl+V or Cmd+V)
6. Click **"Run"** button (or press Ctrl+Enter)

---

## 🎯 Quick Checklist:

- [ ] Opened `.sql` file (NOT `.md` file)
- [ ] Selected ALL content in the SQL file
- [ ] Copied the SQL code
- [ ] Pasted into Supabase SQL Editor
- [ ] Clicked "Run"

---

## 📝 What the SQL File Should Look Like:

The SQL file should start with:
```sql
-- ZENLINK: Supabase Migration - Copy this entire file into Supabase SQL Editor
-- This file contains ONLY SQL statements - no markdown or documentation

-- ============================================
-- ENHANCEMENT 1: Inventory Tracking for Addons
-- ============================================

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'provider_addons' AND column_name = 'addon_type'
    ) THEN
        ALTER TABLE provider_addons 
        ADD COLUMN addon_type VARCHAR(20) DEFAULT 'service' CHECK (addon_type IN ('service', 'item'));
    END IF;
...
```

**If you see markdown like "This is a massive leap forward..." - you're in the wrong file!**

---

## 🚨 Common Mistakes:

❌ **WRONG:** Copying from `FUNERAL_SERVICES_AND_ADDONS_DOCUMENTATION.md`  
❌ **WRONG:** Copying from `IMPLEMENTATION_SUMMARY.md`  
❌ **WRONG:** Copying from `NEXT_STEPS_SUPABASE.md`  
✅ **CORRECT:** Copying from `SUPABASE_MIGRATION_CLEAN.sql` or `RECOMMENDED_SCHEMA_ENHANCEMENTS_POSTGRESQL.sql`

---

## ✅ After Running Successfully:

You should see:
- ✅ "Success. No rows returned" (or similar success message)
- ✅ No error messages

Then verify by running this in Supabase SQL Editor:
```sql
-- Check if tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('booking_dates', 'resource_availability', 'addon_stock_history');
```

You should see 3 rows returned (one for each table).

---

*If you still get errors, share the exact error message and I'll help fix it!*

