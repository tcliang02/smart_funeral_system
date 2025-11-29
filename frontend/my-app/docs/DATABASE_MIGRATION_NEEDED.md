# 🚨 Database Migration Required

## The Issue

You're getting "Tenant or user not found" error because:
- ✅ Connection to Supabase works
- ❌ But your database tables don't exist yet in Supabase

Your data is still in MySQL (XAMPP), not in Supabase PostgreSQL.

---

## Test Your Database

Visit this URL in your browser while the dev server is running:
```
http://localhost:3000/api/backend/test-db
```

This will show:
- ✅ If connection works
- 📋 What tables exist in Supabase
- 👥 If users table exists

---

## Solution: Migrate Your Database

You have 2 options:

### Option 1: Export from MySQL and Import to Supabase (Recommended)

#### Step 1: Export from MySQL (HeidiSQL)
1. Open HeidiSQL
2. Connect to localhost MySQL
3. Select your database: `smart_funeral_system`
4. Right-click database → **Export database as SQL**
5. Settings:
   - Output: One file
   - Data: Structure and data ✓
   - Database: smart_funeral_system
6. Save as: `database_export.sql`

#### Step 2: Convert MySQL to PostgreSQL

MySQL and PostgreSQL have syntax differences. Common changes:

```sql
-- Change these in your SQL file:
AUTO_INCREMENT → SERIAL
TINYINT(1) → BOOLEAN
DATETIME → TIMESTAMP
ENGINE=InnoDB → (remove this line)
`` (backticks) → "" (double quotes) or remove
```

Or use an online converter:
- https://www.convert-in.com/mysql-to-postgres-sql-converter.htm
- https://www.sqlines.com/online

#### Step 3: Import to Supabase

1. Go to: https://supabase.com/dashboard/project/wtfngwbynkkmtjcsdqnw
2. Click **SQL Editor** (in left sidebar)
3. Click **New Query**
4. Paste your converted SQL
5. Click **Run** (or Ctrl+Enter)

---

### Option 2: Use Supabase Migration Tool (Easier)

Supabase has a migration tool that can help:

1. Go to: https://supabase.com/dashboard/project/wtfngwbynkkmtjcsdqnw
2. Settings → Database → Connection String
3. Copy the connection string
4. Use pgAdmin or a migration tool to transfer data

---

## Quick Check: Do You Have Tables?

Run this test:
1. Make sure dev server is running (`npm run dev`)
2. Open browser: `http://localhost:3000/api/backend/test-db`
3. Look at the response:
   - If `tables` array is empty → You need to migrate
   - If `userCount` is "Table does not exist" → You need to migrate
   - If `userCount` is a number → Your database is ready!

---

## Alternative: Start Fresh in Supabase

If you want to start fresh (lose existing data):

1. Go to Supabase Dashboard → SQL Editor
2. Run this to create users table:

```sql
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create a test user (password: "password123")
INSERT INTO users (name, email, password, role)
VALUES (
  'testuser',
  'test@example.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'family'
);
```

3. Then try logging in with:
   - Username: `testuser`
   - Password: `password123`

---

## Need Help?

1. First, test the database: `http://localhost:3000/api/backend/test-db`
2. Share the result with me
3. I'll help you migrate or set up the database

The connection is working, we just need to get your data into Supabase!

