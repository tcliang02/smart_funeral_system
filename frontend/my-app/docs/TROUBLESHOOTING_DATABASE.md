# 🔧 Database Connection Troubleshooting

## Current Issue: Connection Timeout

Your Supabase database connection is timing out. Here are the solutions:

## ✅ Solution 1: Use Connection Pooler (Recommended)

Supabase provides a connection pooler on port **6543** that's more reliable for serverless functions.

**Update `.env.local`:**
```env
DB_PORT=6543  # Changed from 5432
```

**Why?** The connection pooler is designed for serverless/Next.js API routes and handles connections better.

---

## ✅ Solution 2: Check IP Whitelist

Supabase might be blocking your IP address.

1. Go to: https://supabase.com/dashboard/project/wtfngwbynkkmtjcsdqnw
2. Navigate to: **Settings → Database → Connection Pooling**
3. Check if there are IP restrictions
4. If needed, add your IP address to the whitelist

---

## ✅ Solution 3: Use Supabase Client Instead

Instead of direct PostgreSQL connection, use Supabase's JavaScript client (already configured):

**Current:** Direct PostgreSQL via `pg` library  
**Alternative:** Use `@supabase/supabase-js` client

The Supabase client handles connections automatically and doesn't require direct database access.

---

## ✅ Solution 4: Test Connection Manually

Test if you can connect to Supabase:

```powershell
# Test port 5432 (direct)
Test-NetConnection -ComputerName wtfngwbynkkmtjcsdqnw.supabase.co -Port 5432

# Test port 6543 (pooler)
Test-NetConnection -ComputerName wtfngwbynkkmtjcsdqnw.supabase.co -Port 6543
```

---

## 🔍 Check Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/wtfngwbynkkmtjcsdqnw
2. Check **Settings → Database → Connection String**
3. Verify your connection string format
4. Check if there are any connection limits or restrictions

---

## 📝 Current Configuration

Your `.env.local` should have:
```env
DB_HOST=wtfngwbynkkmtjcsdqnw.supabase.co
DB_USER=postgres
DB_PASSWORD=UlkpHJtRe7X06uV5
DB_NAME=postgres
DB_PORT=6543  # Try pooler port
```

---

## 🚀 Next Steps

1. **Try port 6543 first** (connection pooler) - Already updated in your `.env.local`
2. **Restart your dev server** after changing the port
3. **Check Supabase dashboard** for IP restrictions
4. **If still failing**, consider using Supabase client library instead of direct PostgreSQL

---

## 💡 Why This Happens

- Supabase blocks direct connections from untrusted IPs
- Connection pooler (6543) is designed for serverless functions
- Some networks/firewalls block port 5432
- SSL/TLS handshake might be failing

Try the connection pooler port (6543) first - it's the most common solution!

