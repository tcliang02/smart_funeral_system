# ✅ Test Supabase Database Connection

Since you've successfully deployed your database to Supabase, let's verify everything is working!

## Step 1: Configure Environment Variables

### Get Your Supabase Credentials

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Get the following:

**From Settings → Database:**
- Connection String (looks like: `postgres://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres`)
- OR individual values:
  - Host: `db.[PROJECT-REF].supabase.co`
  - Port: `5432`
  - User: `postgres`
  - Password: (your database password)
  - Database: `postgres`

**From Settings → API:**
- Project URL: `https://[PROJECT-REF].supabase.co`
- anon public key: (long JWT token)

### Set Up Local Environment

1. Navigate to your frontend directory:
   ```bash
   cd frontend/my-app
   ```

2. Create `.env.local` file:
   ```bash
   cp env.example .env.local
   ```

3. Edit `.env.local` and add your Supabase credentials:

   **Option 1: Using Connection String (Recommended)**
   ```env
   DATABASE_URL=postgres://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres
   JWT_SECRET=your-random-secret-key-here
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

   **Option 2: Using Individual Variables**
   ```env
   DB_HOST=db.YOUR_PROJECT.supabase.co
   DB_USER=postgres
   DB_PASSWORD=YOUR_PASSWORD
   DB_NAME=postgres
   DB_PORT=5432
   JWT_SECRET=your-random-secret-key-here
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 2: Test Database Connection Locally

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Test the connection**:
   - Open your browser
   - Visit: http://localhost:3000/api/backend/test-db
   - You should see a JSON response like:
     ```json
     {
       "success": true,
       "message": "Database connection successful",
       "tests": {
         "connection": {
           "current_time": "2024-01-01T12:00:00.000Z"
         },
         "tables": [
           { "table_name": "users" },
           { "table_name": "packages" },
           ...
         ],
         "userCount": 5
       }
     }
     ```

## Step 3: Verify Your Data

If the connection test is successful, verify your data:

1. **Check tables exist**: The test-db endpoint will list all your tables
2. **Check user count**: Should show the number of users in your database
3. **Test a specific query**: You can test other endpoints like:
   - `/api/backend/getAllPackages` - Should return your packages
   - `/api/backend/getAllProviders` - Should return your providers

## Step 4: Test Authentication (Optional)

If you have users in your database:

1. Test login endpoint:
   ```bash
   curl -X POST http://localhost:3000/api/backend/login \
     -H "Content-Type: application/json" \
     -d '{"username":"your-username","password":"your-password"}'
   ```

2. Should return:
   ```json
   {
     "success": true,
     "message": "Login successful",
     "token": "...",
     "user": { ... }
   }
   ```

## Common Issues & Solutions

### ❌ Error: "Connection refused"
**Solution:**
- Check `DB_HOST` format: Should be `db.[project-ref].supabase.co` (not just `[project-ref].supabase.co`)
- Verify your Supabase project is active
- Check if you're using the correct port (5432 for direct, 6543 for pooler)

### ❌ Error: "Authentication failed"
**Solution:**
- Verify `DB_PASSWORD` is correct
- If password has special characters, use `DATABASE_URL` connection string instead
- Make sure you're using the database password, not the Supabase account password

### ❌ Error: "Environment variable not found"
**Solution:**
- Make sure `.env.local` exists in `frontend/my-app/` directory
- Restart the dev server after changing `.env.local`
- Check variable names match exactly (case-sensitive)

### ❌ Error: "Table does not exist"
**Solution:**
- Verify you imported your database schema to Supabase
- Check table names match (PostgreSQL is case-sensitive)
- Use Supabase SQL Editor to verify tables exist

## Step 5: Prepare for Vercel Deployment

Once local testing is successful:

1. **Verify all environment variables** are in `.env.local`
2. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Database connected to Supabase"
   git push
   ```

3. **Deploy to Vercel** (see `DEPLOYMENT_CHECKLIST_VERCEL_SUPABASE.md`)

## Next Steps

✅ Database deployed to Supabase  
⏳ Test connection locally  
⏳ Configure environment variables  
⏳ Deploy to Vercel  

---

**Need help?** Check:
- `VERCEL_SUPABASE_ARCHITECTURE.md` - Full architecture guide
- `DEPLOYMENT_CHECKLIST_VERCEL_SUPABASE.md` - Deployment steps
- `QUICK_START_VERCEL_SUPABASE.md` - Quick setup guide

