# 🔗 How to Get Your Supabase Connection String

## Step 1: Go to Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/wtfngwbynkkmtjcsdqnw
2. Click on **"Settings"** in the left sidebar (under CONFIGURATION)
3. Click on **"Database"** in the settings menu

## Step 2: Get Connection String

On the Database Settings page, you'll see:

### Option A: Connection Pooling (Recommended for Next.js)

1. Look for **"Connection Pooling"** section
2. Find the **"Connection string"** or **"Connection pooler"** section
3. Copy the connection string that looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
   OR
   ```
   postgresql://postgres.wtfngwbynkkmtjcsdqnw:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```

### Option B: Direct Connection

1. Look for **"Connection string"** section
2. Copy the connection string that looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@wtfngwbynkkmtjcsdqnw.supabase.co:5432/postgres
   ```

## Step 3: Update .env.local

Add the connection string to your `.env.local`:

```env
# Option 1: Use full connection string (easiest)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres

# Option 2: Or use individual variables (current method)
DB_HOST=aws-0-[region].pooler.supabase.com  # For pooler
# OR
DB_HOST=wtfngwbynkkmtjcsdqnw.supabase.co     # For direct
DB_PORT=6543  # For pooler
# OR
DB_PORT=5432  # For direct
DB_USER=postgres
DB_PASSWORD=[YOUR-PASSWORD]
DB_NAME=postgres
```

## Step 4: Important Notes

- **Connection Pooler (port 6543)**: Better for serverless/Next.js, more reliable
- **Direct Connection (port 5432)**: Might be blocked by firewall
- **Password**: The password shown in the dashboard (you can reset it if needed)
- **SSL**: Always required for Supabase connections

## Step 5: Test Connection

After updating `.env.local`, restart your dev server:

```powershell
npm run dev
```

Then try logging in again.

---

## 🔍 If You Can't Find Connection String

1. In Supabase Dashboard → Settings → Database
2. Look for **"Connection string"** or **"Connection info"** section
3. You might need to click **"Show connection string"** or similar button
4. The connection string should include: host, port, user, password, database

---

## 💡 Quick Fix: Use Connection Pooler Host

If you see the pooler connection info, the host might be:
- `aws-0-[region].pooler.supabase.com` (for pooler)
- `wtfngwbynkkmtjcsdqnw.supabase.co` (for direct)

Try updating your `.env.local` with the pooler host format!

