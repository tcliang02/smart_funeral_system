# 🔧 Fix: Connection Pooler Username Format

## Problem

"Tenant or user not found" error means the username format is incorrect for the Connection Pooler.

## Solution: Get Exact Connection String from Supabase

The Connection Pooler requires a **specific username format** that you must get from your Supabase dashboard.

### Step 1: Get Exact Connection String

1. Go to: https://supabase.com/dashboard/project/wtfngwbynkkmtjcsdqnw
2. Navigate to: **Settings → Database**
3. Scroll to **"Connection Pooling"** section
4. Look for **"Connection string"** or **"Session mode"**
5. **Copy the ENTIRE connection string exactly as shown**

It might look like one of these formats:

**Format 1:**
```
postgresql://postgres.wtfngwbynkkmtjcsdqnw:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

**Format 2:**
```
postgresql://postgres:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

**Format 3:**
```
postgresql://postgres.wtfngwbynkkmtjcsdqnw:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Step 2: Try Different Username Formats

If you can't find the exact string, try these in order:

**Option A: With project ref**
```env
DATABASE_URL=postgresql://postgres.wtfngwbynkkmtjcsdqnw:CE2EWeU3yOTJhMJH@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

**Option B: Just postgres**
```env
DATABASE_URL=postgresql://postgres:CE2EWeU3yOTJhMJH@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

**Option C: With pgbouncer parameter**
```env
DATABASE_URL=postgresql://postgres.wtfngwbynkkmtjcsdqnw:CE2EWeU3yOTJhMJH@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Step 3: Alternative - Use Direct Connection for Local Dev

If Connection Pooler continues to fail, you can use direct connection for local development:

```env
DATABASE_URL=postgres://postgres:CE2EWeU3yOTJhMJH@db.wtfngwbynkkmtjcsdqnw.supabase.co:5432/postgres
```

**Note:** This might timeout, but it's worth trying.

### Step 4: Check Connection Pooling Settings

1. In Supabase Dashboard → Settings → Database
2. Check if **Connection Pooling is enabled**
3. Verify the pooler is active for your project
4. Check if there are any IP restrictions

---

**The key is to copy the EXACT connection string from your Supabase dashboard!**

