# 🔧 Update Your Vercel Environment Variables

## ❌ What's Wrong:

1. **DB_HOST** = `wtfngwbynkkmtjcsdqnw.supabase.co` 
   - ❌ Missing `db.` prefix
   - ✅ Should be: `db.wtfngwbynkkmtjcsdqnw.supabase.co`

2. **VITE_SUPABASE_URL** and **VITE_SUPABASE_ANON_KEY**
   - ❌ Using `VITE_` prefix (for Vite, not Next.js)
   - ✅ Should use `NEXT_PUBLIC_` prefix

3. **JWT_SECRET** - Missing!

---

## ✅ What to Do:

### Option 1: UPDATE Existing Variables (Recommended)

1. **Click on `DB_HOST`** → Edit
   - Change from: `wtfngwbynkkmtjcsdqnw.supabase.co`
   - Change to: `db.wtfngwbynkkmtjcsdqnw.supabase.co`
   - Save

2. **Click on `VITE_SUPABASE_URL`** → Edit
   - Change name from: `VITE_SUPABASE_URL`
   - Change to: `NEXT_PUBLIC_SUPABASE_URL`
   - Keep the value the same
   - Save

3. **Click on `VITE_SUPABASE_ANON_KEY`** → Edit
   - Change name from: `VITE_SUPABASE_ANON_KEY`
   - Change to: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Keep the value the same
   - Save

4. **Add NEW variable: `JWT_SECRET`**
   - Value: `cNOruspUQwSJWt7ld2GKXqBe9vV5RoEkMz0C1gifPy8hZaIHFTnxmj4YDLb6A3`
   - Enable for: All Environments

---

### Option 2: Delete Old, Add New (If Option 1 doesn't work)

1. **Delete** `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
2. **Add** `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` with same values
3. **Update** `DB_HOST` to add `db.` prefix
4. **Add** `JWT_SECRET`

---

## ✅ Final Variables Should Be:

1. ✅ `DB_HOST` = `db.wtfngwbynkkmtjcsdqnw.supabase.co` (with `db.`)
2. ✅ `DB_USER` = `postgres` (keep as is)
3. ✅ `DB_PASSWORD` = `PZNKtuFpEugR4Gwh` (keep as is - your current password)
4. ✅ `DB_NAME` = `postgres` (keep as is)
5. ✅ `DB_PORT` = `5432` (keep as is)
6. ✅ `JWT_SECRET` = `cNOruspUQwSJWt7ld2GKXqBe9vV5RoEkMz0C1gifPy8hZaIHFTnxmj4YDLb6A3` (ADD THIS)
7. ✅ `NEXT_PUBLIC_SUPABASE_URL` = `https://wtfngwbynkkmtjcsdqnw.supabase.co` (rename from VITE_)
8. ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (your current value) (rename from VITE_)

---

## 🚀 After Updating:

1. **Redeploy** on Vercel
2. **Test**: `https://your-url.vercel.app/api/backend/test-db`
3. Should work! ✅

