# Complete .env.local Configuration

## Your Complete .env.local File

Create a file named `.env.local` in `frontend/my-app/` with this content:

```env
# ============================================
# Supabase Database Configuration
# ============================================
# Connection String (CORRECTED - password without "your-" prefix)
DATABASE_URL=postgres://postgres:CE2EWeU3yOTJhMJH@db.wtfngwbynkkmtjcsdqnw.supabase.co:5432/postgres

# ============================================
# Authentication
# ============================================
# JWT Secret - Generate a random string (see instructions below)
JWT_SECRET=CHANGE_THIS_TO_A_RANDOM_SECRET_KEY

# ============================================
# Supabase Client Configuration
# ============================================
# Supabase Project URL
NEXT_PUBLIC_SUPABASE_URL=https://wtfngwbynkkmtjcsdqnw.supabase.co

# Supabase Anonymous Key (your actual key)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0Zm5nd2J5bmtrbXRqY3NkcW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NjcwODcsImV4cCI6MjA3ODI0MzA4N30.8J-bES2J8VYbuFOb_urIK2cK0qb9QcdYqetVSE02qzE
```

## Generate JWT_SECRET

You need to generate a random secret for `JWT_SECRET`. Here are options:

### Option 1: PowerShell (Windows)
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### Option 2: Online Generator
- Visit: https://randomkeygen.com/
- Use a "CodeIgniter Encryption Keys" or any 64-character random string

### Option 3: Manual
Just create a long random string like:
```
JWT_SECRET=MySuperSecretKey1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ
```

## Quick Setup Steps

1. **Create the file:**
   ```bash
   cd frontend/my-app
   # Create .env.local file (use your editor or PowerShell)
   ```

2. **Copy the template above** and paste into `.env.local`

3. **Replace `CHANGE_THIS_TO_A_RANDOM_SECRET_KEY`** with your generated JWT_SECRET

4. **Save the file**

5. **Test the connection:**
   ```bash
   npm run dev
   ```
   Then visit: http://localhost:3000/api/backend/test-db

## Security Note

✅ `.env.local` is already in `.gitignore` - your credentials are safe and won't be committed to git.

## Verification

After setting up, test:
- Database connection: http://localhost:3000/api/backend/test-db
- Should return: `{"success":true,"message":"Database connection successful",...}`

---

**Ready to test!** 🚀

