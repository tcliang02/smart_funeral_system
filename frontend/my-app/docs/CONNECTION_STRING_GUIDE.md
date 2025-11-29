# 🔗 How to Construct Supabase Connection String

Since you can't find the connection string in the dashboard, here's how to construct it manually:

## Your Current Configuration

Based on your Supabase project:
- **Project Reference:** `wtfngwbynkkmtjcsdqnw`
- **Host:** `wtfngwbynkkmtjcsdqnw.supabase.co`
- **User:** `postgres`
- **Password:** `9K5XOne9Fwq7Q71o` (your new password)
- **Database:** `postgres`
- **Port:** `5432` (direct) or `6543` (pooler)

## Connection String Format

### Direct Connection (Port 5432)
```
postgresql://postgres:9K5XOne9Fwq7Q71o@wtfngwbynkkmtjcsdqnw.supabase.co:5432/postgres
```

### Connection Pooler (Port 6543)
The pooler host format is usually:
```
postgresql://postgres.wtfngwbynkkmtjcsdqnw:9K5XOne9Fwq7Q71o@aws-0-[region].pooler.supabase.com:6543/postgres
```

**Note:** The `[region]` part depends on where your Supabase project is hosted. Common regions:
- `us-east-1` (US East)
- `us-west-1` (US West)
- `ap-southeast-1` (Asia Pacific)
- `eu-west-1` (Europe)

## How to Find Your Region

1. Go to Supabase Dashboard
2. Settings → General
3. Look for "Region" or "Location"
4. Or check your project URL - it might indicate the region

## Alternative: Use Full Connection String in .env.local

You can add this to your `.env.local`:

```env
# Full connection string (replace [region] with your actual region)
DATABASE_URL=postgresql://postgres.wtfngwbynkkmtjcsdqnw:9K5XOne9Fwq7Q71o@aws-0-[region].pooler.supabase.com:6543/postgres
```

Or for direct connection:
```env
DATABASE_URL=postgresql://postgres:9K5XOne9Fwq7Q71o@wtfngwbynkkmtjcsdqnw.supabase.co:5432/postgres
```

## Current Setup (Individual Variables)

Your current `.env.local` uses individual variables, which should work:

```env
DB_HOST=wtfngwbynkkmtjcsdqnw.supabase.co
DB_USER=postgres
DB_PASSWORD=9K5XOne9Fwq7Q71o
DB_NAME=postgres
DB_PORT=5432
```

## Testing the Connection

After updating, restart your dev server and try logging in. If it still times out:

1. **Check if port 5432 is accessible:**
   ```powershell
   Test-NetConnection -ComputerName wtfngwbynkkmtjcsdqnw.supabase.co -Port 5432
   ```

2. **Try the connection pooler** (port 6543) - but you'll need the correct pooler host format

3. **Check Supabase Dashboard** → Settings → Database → Network Restrictions
   - Make sure your IP isn't blocked
   - The dashboard shows "Your database can be accessed by all IP addresses" - that's good!

## Next Steps

1. ✅ Password updated to: `9K5XOne9Fwq7Q71o`
2. ✅ Port set to: `5432` (direct connection)
3. 🔄 **Restart your dev server** and try logging in again

If it still doesn't work, we might need to:
- Find your Supabase region for the pooler
- Or use Supabase's REST API instead of direct PostgreSQL

