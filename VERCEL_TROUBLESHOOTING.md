# Vercel 500 Error Troubleshooting

## ✅ Environment Variables Status
All required environment variables are set:
- ✅ JWT_SECRET
- ✅ DEEPSEEK_API_KEY
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
- ✅ SUPABASE_SERVICE_ROLE_KEY
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ DATABASE_URL

## 🔍 Next Steps to Fix 500 Errors

### Step 1: Redeploy Your Application
**Important**: After setting environment variables, you MUST redeploy for them to take effect.

1. Go to Vercel Dashboard → Your Project
2. Click on **Deployments** tab
3. Find the latest deployment
4. Click the **⋯** (three dots) menu
5. Click **Redeploy**
6. Wait for deployment to complete

### Step 2: Check Vercel Logs
To see the actual error causing the 500:

1. Go to Vercel Dashboard → Your Project
2. Click on **Deployments** tab
3. Click on the latest deployment
4. Click on **Functions** tab
5. Look for errors related to:
   - `/api/backend/getTributes`
   - `/api/backend/login`

Common errors you might see:
- `Database configuration incomplete`
- `Connection timeout`
- `SSL connection required`
- `Authentication failed`

### Step 3: Test Database Connection
After redeploying, test the connection:

Visit: `https://your-vercel-app.vercel.app/api/backend/test-db`

Expected response:
```json
{
  "success": true,
  "message": "Database connection successful"
}
```

If you get an error, it will show what's wrong.

### Step 4: Verify DATABASE_URL Format
Your current DATABASE_URL:
```
postgresql://postgres:4FEk9eJXBil2tyt2@db.wtfngwbynkkmtjcsdqnw.supabase.co:5432/postgres
```

This should work, but if you still get connection errors, try:
1. Using connection pooler (recommended for Vercel):
   ```
   postgresql://postgres:4FEk9eJXBil2tyt2@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
   (Replace `[region]` with your Supabase region)

2. Or use individual variables instead:
   ```
   DB_HOST=db.wtfngwbynkkmtjcsdqnw.supabase.co
   DB_USER=postgres
   DB_PASSWORD=4FEk9eJXBil2tyt2
   DB_NAME=postgres
   DB_PORT=5432
   ```

### Step 5: Check Supabase Connection Settings
1. Go to Supabase Dashboard
2. Settings → Database
3. Check if your database is active
4. Verify the connection string matches what you have in Vercel

### Step 6: Common Issues & Solutions

#### Issue: "Connection timeout"
**Solution**: Use Supabase connection pooler instead of direct connection

#### Issue: "SSL required"
**Solution**: The code already handles SSL, but verify your Supabase project allows connections

#### Issue: "Authentication failed"
**Solution**: Double-check your password in DATABASE_URL matches Supabase

#### Issue: "Database configuration incomplete"
**Solution**: Make sure DATABASE_URL is set correctly, or all DB_* variables are set

## 🚀 Quick Fix Checklist

- [ ] Redeployed after setting environment variables
- [ ] Checked Vercel logs for specific error messages
- [ ] Tested `/api/backend/test-db` endpoint
- [ ] Verified DATABASE_URL format is correct
- [ ] Confirmed Supabase database is active
- [ ] Tried connection pooler if direct connection fails

## 📞 Still Having Issues?

If errors persist after redeploying:
1. Copy the exact error from Vercel logs
2. Check the `/api/backend/test-db` response
3. Verify all environment variables are set for the correct environment (Production/Preview)

