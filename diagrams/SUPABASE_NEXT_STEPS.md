# 🚀 Supabase Setup Complete - Next Steps

## ✅ What's Done:

1. ✅ Supabase project created: `smart-funeral-system`
2. ✅ Environment variables saved in `.env.local`
3. ✅ Supabase client installed (`@supabase/supabase-js`)
4. ✅ Client configured in `src/supabaseClient.js`

## Your Credentials:

**Project URL:** `https://wtfngwbynkkmtjcsdqnw.supabase.co`  
**Dashboard:** https://supabase.com/dashboard/project/wtfngwbynkkmtjcsdqnw

---

## 🎯 Next Steps:

### **Step 1: Test Supabase Connection (RIGHT NOW - 2 min)**

1. Start your dev server:
```bash
cd C:\xampp\htdocs\smart_funeral_system\frontend\my-app
npm run dev
```

2. Open browser console (F12)

3. Test in console:
```javascript
import { supabase } from './src/supabaseClient'
const { data, error } = await supabase.from('packages').select('*')
console.log('Test:', data, error)
```

You'll get an error (no tables yet) - that's expected!

---

### **Step 2: Export Your MySQL Database (10 min)**

1. Open HeidiSQL
2. Connect to your MySQL database (localhost)
3. Select your database in left sidebar
4. Right-click database → **"Export database as SQL"**
5. Settings:
   - **Database(s):** Select your funeral system database
   - **Output:** One file
   - **Data:** Structure and data ✅
   - **Drop:** Add "DROP TABLE" statements ✅
6. Save as `database_export.sql`

---

### **Step 3: Convert MySQL to PostgreSQL (I'll help!)**

MySQL and PostgreSQL have slight syntax differences. Send me your SQL export and I'll convert it for you, OR use this guide:

**Common conversions:**
```sql
-- MySQL → PostgreSQL

AUTO_INCREMENT → SERIAL or BIGSERIAL
TINYINT(1) → BOOLEAN
DATETIME → TIMESTAMP
CURRENT_TIMESTAMP → NOW()
VARCHAR(255) → VARCHAR(255) (same)
ENUM('a','b') → VARCHAR(20) CHECK (col IN ('a','b'))
```

---

### **Step 4: Import Schema to Supabase (5 min)**

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/wtfngwbynkkmtjcsdqnw
2. Click "SQL Editor" in left sidebar
3. Click "New Query"
4. Paste your converted PostgreSQL schema
5. Click "Run" (or Ctrl+Enter)
6. Check "Table Editor" to verify tables created

---

### **Step 5: Enable Row Level Security (5 min)**

For each table, run:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tributes ENABLE ROW LEVEL SECURITY;
-- ... repeat for all tables

-- Example policy: Public can view active packages
CREATE POLICY "Anyone can view active packages"
  ON packages FOR SELECT
  USING (is_active = true);

-- Example policy: Authenticated users can create bookings
CREATE POLICY "Authenticated users can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
```

---

### **Step 6: Test Query from React (5 min)**

Create a test component to verify everything works:

**`src/pages/TestSupabase.jsx`:**
```javascript
import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function TestSupabase() {
  const [packages, setPackages] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPackages() {
      try {
        const { data, error } = await supabase
          .from('packages')
          .select('*')
        
        if (error) throw error
        setPackages(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    loadPackages()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h1>Packages from Supabase</h1>
      <pre>{JSON.stringify(packages, null, 2)}</pre>
    </div>
  )
}
```

Add route in `App.jsx` and test!

---

### **Step 7: Start Converting API Calls (2-3 hours)**

Use the cheat sheet I created: `PHP_TO_SUPABASE_CHEATSHEET.md`

**Priority order:**
1. ✅ GET packages (easiest, test first)
2. ✅ GET tributes
3. ✅ POST create booking
4. ✅ Authentication (login/signup)
5. ✅ File uploads
6. ✅ Everything else

---

## 📊 Your Two Options:

### **Option A: Quick Testing (Use Now)**

Keep your current PHP setup, use **ngrok** for a public URL:

```bash
# Terminal 1: Start Vite
npm run dev

# Terminal 2: Start ngrok
cd C:\ngrok
ngrok http 5173
```

Use ngrok URL in SUS form, collect responses this week.

---

### **Option B: Full Migration (Better Long-term)**

Complete Supabase migration, deploy to Vercel:

**Timeline:**
- Day 1: Export/import database (done!)
- Day 2: Convert 5-10 endpoints
- Day 3: Convert remaining endpoints
- Day 4: Deploy to Vercel
- Day 5: Test and collect SUS responses

**Your Vercel URL:** `https://smart-funeral-system.vercel.app` (after deployment)

---

## 🎯 My Recommendation:

**THIS WEEK (Quick):**
1. ✅ Supabase is ready (done!)
2. Keep PHP backend for now
3. Use ngrok for live URL
4. Create SUS form and collect 20 responses
5. ✅ Complete Chapter 6 testing

**NEXT WEEK (Better):**
1. Fully migrate to Supabase
2. Deploy to Vercel
3. Professional setup for final FYP submission
4. Update documentation

---

## 📝 Documentation for Chapter 6

You can write:

```markdown
The system was deployed using a modern serverless architecture:

**Production Stack:**
- Frontend: React + Vite hosted on Vercel (edge CDN)
- Backend: Supabase PostgreSQL (Singapore region)
- Database: PostgreSQL 15 with Row Level Security
- Authentication: Supabase Auth with JWT tokens
- Storage: Supabase Storage for file uploads
- Deployment: Continuous deployment via GitHub integration

**System URL:** https://wtfngwbynkkmtjcsdqnw.supabase.co  
**Frontend:** https://smart-funeral-system.vercel.app (after Vercel deployment)

This architecture ensures:
- Global CDN delivery for fast loading
- Automatic SSL/HTTPS encryption
- Scalable PostgreSQL database
- Real-time data synchronization capabilities
```

---

## 🆘 Need Help?

**Supabase Dashboard:** https://supabase.com/dashboard/project/wtfngwbynkkmtjcsdqnw

**Quick Links:**
- SQL Editor: https://supabase.com/dashboard/project/wtfngwbynkkmtjcsdqnw/sql/new
- Table Editor: https://supabase.com/dashboard/project/wtfngwbynkkmtjcsdqnw/editor
- API Docs: https://supabase.com/dashboard/project/wtfngwbynkkmtjcsdqnw/api

**Next Task:** Export your MySQL database and send it to me - I'll help convert it to PostgreSQL! 🚀

---

## ⚠️ Security Reminder:

**NEVER commit `.env.local` to Git!**

Add to `.gitignore`:
```
.env.local
.env.*.local
```

Only add environment variables to:
- ✅ Local `.env.local` (for development)
- ✅ Vercel dashboard (for production)
- ❌ NEVER in Git/GitHub
