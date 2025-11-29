# 🔧 Fix: "Tenant or user not found" Error

## Problem

The Connection Pooler username format is incorrect. The error "Tenant or user not found" means the username `postgres.wtfngwbynkkmtjcsdqnw` is not recognized.

## Solution: Try Different Username Formats

The Connection Pooler can use different username formats depending on your Supabase setup.

### Option 1: Just `postgres` (Most Common)

Try using just `postgres` as the username:

```env
DATABASE_URL=postgresql://postgres:CE2EWeU3yOTJhMJH@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

### Option 2: Get Exact Format from Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/wtfngwbynkkmtjcsdqnw
2. Navigate to: **Settings → Database**
3. Scroll to **"Connection Pooling"** section
4. Look for **"Connection string"** - copy it EXACTLY as shown
5. It might show one of these formats:
   - `postgresql://postgres:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`
   - `postgresql://postgres.wtfngwbynkkmtjcsdqnw:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`
   - `postgresql://postgres.wtfngwbynkkmtjcsdqnw:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true`

### Option 3: Check Session vs Transaction Mode

Supabase has two pooler modes:
- **Session mode** (port 6543) - Full PostgreSQL features
- **Transaction mode** (port 6543) - Limited features, better for serverless

Make sure you're using the correct connection string for your chosen mode.

## Quick Fix: Try Option 1 First

Update your `.env.local`:

```env
DATABASE_URL=postgresql://postgres:CE2EWeU3yOTJhMJH@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

Then restart your server and test again.

---

**Try Option 1 first - it's the most common format!**

