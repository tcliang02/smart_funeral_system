# 🚀 Fresh Start - Complete Setup Guide

## Step 1: Verify Your Supabase Connection String

1. Go to: https://supabase.com/dashboard/project/wtfngwbynkkmtjcsdqnw
2. Click **Settings** → **Database**
3. Find **"Connection string"** section
4. Copy the **URI** connection string (should look like):
   ```
   postgres://postgres:[YOUR-PASSWORD]@db.wtfngwbynkkmtjcsdqnw.supabase.co:5432/postgres
   ```

**Write down:**
- Host: `db.wtfngwbynkkmtjcsdqnw.supabase.co` (with `db.` prefix)
- Port: `5432`
- User: `postgres`
- Password: `[YOUR-PASSWORD]`
- Database: `postgres`

---

## Step 2: Update .env.local File

Open: `C:\xampp\htdocs\smart_funeral_system\frontend\my-app\.env.local`

**Replace everything with this (use YOUR actual password):**

```env
# Supabase Database Connection
# Use the connection string from Supabase Dashboard
DATABASE_URL=postgres://postgres:9K5XOne9Fwq7Q71o@db.wtfngwbynkkmtjcsdqnw.supabase.co:5432/postgres

# OR use individual variables (alternative method)
DB_HOST=db.wtfngwbynkkmtjcsdqnw.supabase.co
DB_USER=postgres
DB_PASSWORD=9K5XOne9Fwq7Q71o
DB_NAME=postgres
DB_PORT=5432

# JWT Secret
JWT_SECRET=cNOruspUQwSJWt7ld2GKXqBe9vV5RoEkMz0C1gifPy8hZaIHFTnxmj4YDLb6A3

# Supabase Client (for frontend)
NEXT_PUBLIC_SUPABASE_URL=https://wtfngwbynkkmtjcsdqnw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0Zm5nd2J5bmtrbXRqY3NkcW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NjcwODcsImV4cCI6MjA3ODI0MzA4N30.8J-bES2J8VYbuFOb_urIK2cK0qb9QcdYqetVSE02qzE
```

**⚠️ IMPORTANT:** Replace `9K5XOne9Fwq7Q71o` with your actual Supabase password!

---

## Step 3: Verify Database Connection Code

The database connection file should be at: `lib/db.ts`

It should:
- ✅ Support `DATABASE_URL` connection string
- ✅ Support individual `DB_*` variables
- ✅ Use SSL (required for Supabase)
- ✅ Have proper error handling

---

## Step 4: Test Database Connection

1. **Start the dev server:**
   ```powershell
   cd C:\xampp\htdocs\smart_funeral_system\frontend\my-app
   npm run dev
   ```

2. **Wait for "✓ Ready" message**

3. **Test the connection:**
   - Open browser: http://localhost:3000/api/backend/test-db
   - Should return: `{"success":true,"message":"Database test successful",...}`

4. **If error:**
   - Check terminal for connection details
   - Verify `.env.local` has correct values
   - Check Supabase dashboard for connection string

---

## Step 5: Import Database Tables

Your Supabase database needs your tables!

1. Go to: https://supabase.com/dashboard/project/wtfngwbynkkmtjcsdqnw
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Open: `C:\xampp\htdocs\smart_funeral_system\SUPABASE_COMPLETE_IMPORT.sql`
5. Copy **ALL** contents
6. Paste into Supabase SQL Editor
7. Click **Run** (or Ctrl+Enter)
8. Wait for "Success" message

---

## Step 6: Test Login

1. Go to: http://localhost:3000
2. Try logging in with existing user credentials
3. Should work if:
   - ✅ Database connection successful
   - ✅ Tables imported
   - ✅ User exists in database

---

## Step 7: Deploy to Vercel (For Online Access)

Once local testing works:

1. **Deploy:**
   ```powershell
   cd C:\xampp\htdocs\smart_funeral_system\frontend\my-app
   vercel --prod
   ```

2. **Add Environment Variables in Vercel:**
   - Go to: https://vercel.com/dashboard
   - Select your project
   - Settings → Environment Variables
   - Add ALL variables from `.env.local`
   - Enable for: Production, Preview, Development

3. **Redeploy** after adding env vars

---

## 🔧 Troubleshooting

### Connection Error: "ENOTFOUND"
- ✅ Check `.env.local` has correct hostname (with `db.` prefix)
- ✅ Verify password is correct
- ✅ Try connection pooler (port 6543) instead

### Connection Error: "Tenant or user not found"
- ✅ Check username is `postgres` (not `postgres.wtfngwbynkkmtjcsdqnw`)
- ✅ Verify password is correct
- ✅ Check Supabase dashboard for correct credentials

### Database Test Returns 500
- ✅ Check Vercel/terminal logs for error details
- ✅ Verify `.env.local` is in correct location
- ✅ Restart dev server after changing `.env.local`

---

## ✅ Success Checklist

- [ ] `.env.local` has correct Supabase connection string
- [ ] Database test endpoint returns success
- [ ] Tables imported to Supabase
- [ ] Login works locally
- [ ] Deployed to Vercel
- [ ] Environment variables added to Vercel
- [ ] Website works online

---

**Ready? Let's start with Step 1!**

