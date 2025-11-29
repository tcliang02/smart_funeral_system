# 🔧 Fix: Connection Timeout - Use Connection Pooler

## Problem

Connection timeout on port 5432. Supabase often blocks direct connections from local development.

## Solution: Use Connection Pooler

The **Connection Pooler** (port 6543) is designed for serverless/Next.js and works better.

## Step 1: Get Pooler Connection String from Supabase

1. Go to: https://supabase.com/dashboard/project/wtfngwbynkkmtjcsdqnw
2. Navigate to: **Settings → Database**
3. Scroll to **"Connection Pooling"** section
4. Find **"Connection string"** or **"Session mode"** connection string
5. It will look like:
   ```
   postgresql://postgres.wtfngwbynkkmtjcsdqnw:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
   OR
   ```
   postgresql://postgres:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```

## Step 2: Update .env.local

Replace your `DATABASE_URL` with the pooler connection string:

```env
# Connection Pooler (port 6543) - RECOMMENDED
DATABASE_URL=postgresql://postgres.wtfngwbynkkmtjcsdqnw:CE2EWeU3yOTJhMJH@aws-0-[YOUR-REGION].pooler.supabase.com:6543/postgres
```

**Important:** Replace `[YOUR-REGION]` with your actual region (e.g., `us-east-1`, `ap-southeast-1`, etc.)

## Step 3: Find Your Region

If you can't find the region in the connection string:

1. Go to: **Settings → General**
2. Look for "Region" field
3. Common regions:
   - `us-east-1` (US East)
   - `us-west-1` (US West)  
   - `ap-southeast-1` (Asia Pacific)
   - `eu-west-1` (Europe)

## Step 4: Alternative - Use Individual Variables

If you prefer individual variables:

```env
DB_HOST=aws-0-[YOUR-REGION].pooler.supabase.com
DB_PORT=6543
DB_USER=postgres.wtfngwbynkkmtjcsdqnw
DB_PASSWORD=CE2EWeU3yOTJhMJH
DB_NAME=postgres
```

**Note:** The username for pooler is usually `postgres.[project-ref]` not just `postgres`

## Step 5: Restart and Test

1. Restart dev server: `npm run dev`
2. Test: http://localhost:3000/api/backend/test-db
3. Should connect successfully! ✅

---

**The Connection Pooler is more reliable for Next.js/serverless applications!** 🚀

