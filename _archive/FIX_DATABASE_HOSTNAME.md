# 🔧 Fix: Database Hostname DNS Error

## Problem

Error: `getaddrinfo ENOTFOUND db.wtfngwbynkkmtjcsdqnw.supabase.co`

The hostname `db.wtfngwbynkkmtjcsdqnw.supabase.co` cannot be resolved.

## Solution

The correct Supabase hostname format depends on the connection type:

### Option 1: Direct Connection (Port 5432)
**Hostname:** `wtfngwbynkkmtjcsdqnw.supabase.co` (NO `db.` prefix)
**OR:** `db.wtfngwbynkkmtjcsdqnw.supabase.co` (WITH `db.` prefix - depends on Supabase version)

### Option 2: Connection Pooler (Port 6543) - RECOMMENDED
**Hostname:** `aws-0-[region].pooler.supabase.com`
- More reliable for serverless/Next.js
- Better connection handling

## Quick Fix

Update your `.env.local`:

**Option A: Try without `db.` prefix**
```env
DATABASE_URL=postgres://postgres:CE2EWeU3yOTJhMJH@wtfngwbynkkmtjcsdqnw.supabase.co:5432/postgres
```

**Option B: Use Connection Pooler (BEST)**
```env
# First, get your region from Supabase Dashboard → Settings → General
# Common regions: us-east-1, us-west-1, ap-southeast-1, eu-west-1
DATABASE_URL=postgres://postgres.wtfngwbynkkmtjcsdqnw:CE2EWeU3yOTJhMJH@aws-0-[YOUR-REGION].pooler.supabase.com:6543/postgres
```

## How to Get Your Region

1. Go to: https://supabase.com/dashboard/project/wtfngwbynkkmtjcsdqnw
2. Settings → General
3. Look for "Region" or check the connection string in Settings → Database

## Test Connection

After updating, restart dev server and test:
- http://localhost:3000/api/backend/test-db

---

**Try Option A first (remove `db.` prefix), then try Option B (pooler) if that doesn't work.**

