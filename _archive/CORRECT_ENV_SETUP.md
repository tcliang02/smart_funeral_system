# ✅ Correct Environment Variable Setup

## Your Connection String (CORRECTED)

**❌ WRONG:**
```env
DATABASE_URL=postgres://postgres:your-CE2EWeU3yOTJhMJH@db.wtfngwbynkkmtjcsdqnw.supabase.co:5432/postgres
```

**✅ CORRECT:**
```env
DATABASE_URL=postgres://postgres:CE2EWeU3yOTJhMJH@db.wtfngwbynkkmtjcsdqnw.supabase.co:5432/postgres
```

**The password should be just `CE2EWeU3yOTJhMJH` (remove the "your-" prefix)**

## Complete .env.local Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend/my-app
   ```

2. **Create .env.local file:**
   ```bash
   # Windows PowerShell
   New-Item -Path .env.local -ItemType File
   
   # Or just create it manually in your editor
   ```

3. **Add these variables:**
   ```env
   # Database Connection (CORRECTED)
   DATABASE_URL=postgres://postgres:CE2EWeU3yOTJhMJH@db.wtfngwbynkkmtjcsdqnw.supabase.co:5432/postgres
   
   # JWT Secret (generate a random string)
   JWT_SECRET=your-random-secret-key-here
   
   # Supabase Client (get from Supabase Dashboard → Settings → API)
   NEXT_PUBLIC_SUPABASE_URL=https://wtfngwbynkkmtjcsdqnw.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Get Missing Values

### 1. JWT_SECRET
Generate a random secret:
```bash
# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Or use an online generator, or just create a long random string.

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
1. Go to: https://supabase.com/dashboard/project/wtfngwbynkkmtjcsdqnw
2. Navigate to: **Settings → API**
3. Copy the **anon public** key (long JWT token)

## Test Your Connection

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Test the connection:**
   - Visit: http://localhost:3000/api/backend/test-db
   - Should return: `{"success":true,"message":"Database connection successful",...}`

3. **If you see errors:**
   - Check the password is correct (no "your-" prefix)
   - Verify Supabase project is active
   - Check connection string format

## Connection String Format

```
postgres://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]
```

Your values:
- **USER**: `postgres`
- **PASSWORD**: `CE2EWeU3yOTJhMJH` (no "your-" prefix!)
- **HOST**: `db.wtfngwbynkkmtjcsdqnw.supabase.co`
- **PORT**: `5432`
- **DATABASE**: `postgres`

## Quick Checklist

- [ ] `.env.local` file created in `frontend/my-app/`
- [ ] `DATABASE_URL` has correct password (no "your-" prefix)
- [ ] `JWT_SECRET` is set (random string)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` is set
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set
- [ ] Test connection: `/api/backend/test-db` returns success

---

**Once corrected, test the connection!** 🚀

