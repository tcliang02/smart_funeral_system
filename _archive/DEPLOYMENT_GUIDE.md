# 🚀 Deploy Your System for Remote Access

## 🎯 Goal
Let remote users access your system via a link for SUS testing (20 respondents).

---

## 📋 Deployment Strategy

### **Architecture:**
```
Remote Users → Vercel (Frontend) → Supabase (Database)
                    ↓
              Your PHP Backend (Login only)
```

### **What Goes Where:**
- ✅ **Frontend (React)** → Vercel (FREE)
- ✅ **Database** → Supabase (DONE!)
- ⚠️ **Backend (PHP)** → Keep on your computer OR deploy to hosting

---

## 🚀 OPTION 1: Quick Deploy (Recommended for Testing)

### **Step 1: Deploy Frontend to Vercel**

#### **1.1 Install Vercel CLI**
```bash
npm install -g vercel
```

#### **1.2 Login to Vercel**
```bash
vercel login
```
- Choose GitHub, email, or other method
- Complete authentication in browser

#### **1.3 Deploy Frontend**
```bash
cd frontend/my-app
vercel
```

**Vercel will ask:**
- "Set up and deploy?" → **YES**
- "Which scope?" → Choose your account
- "Link to existing project?" → **NO**
- "What's your project name?" → `smart-funeral-system` (or any name)
- "In which directory is your code located?" → `./` (press Enter)
- "Want to modify settings?" → **NO**

**Result:** You'll get a URL like:
```
https://smart-funeral-system-abc123.vercel.app
```

#### **1.4 Add Environment Variables**
Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these:
- **Name:** `VITE_SUPABASE_URL`
  **Value:** `https://wtfngwbynkkmtjcsdqnw.supabase.co`

- **Name:** `VITE_SUPABASE_ANON_KEY`
  **Value:** (Copy from your `.env.local` file)

Then **redeploy**:
```bash
vercel --prod
```

---

### **Step 2: Deploy PHP Backend (Login)**

You have 3 options:

#### **Option A: Use Ngrok (Easiest, Temporary)**
This tunnels your local XAMPP to the internet.

**1. Download Ngrok:**
- Go to https://ngrok.com/download
- Create free account
- Download ngrok.exe

**2. Run XAMPP:**
Make sure Apache is running on port 80 or 8080

**3. Start Ngrok Tunnel:**
```bash
ngrok http 80
```
Or if XAMPP uses port 8080:
```bash
ngrok http 8080
```

**4. Copy the HTTPS URL:**
Ngrok will show:
```
Forwarding: https://abc123.ngrok.io -> http://localhost:80
```

**5. Update Frontend to Use Ngrok URL:**
Create `frontend/my-app/src/config.js`:
```javascript
export const API_BASE_URL = 'https://abc123.ngrok.io/backend';
```

Update `src/supabaseAuth.js`:
```javascript
import { API_BASE_URL } from './config';

// In loginWithSupabase function, change:
const response = await fetch('/backend/login.php', ...);

// To:
const response = await fetch(`${API_BASE_URL}/login.php`, ...);
```

**Pros:** 
- ✅ Free
- ✅ 5 minutes setup
- ✅ Works immediately

**Cons:**
- ⚠️ URL changes every time you restart ngrok (free plan)
- ⚠️ Your computer must stay on during testing

---

#### **Option B: Deploy PHP to Free Hosting**
Deploy backend to InfinityFree or 000webhost (free PHP hosting).

**1. Sign up for InfinityFree:**
- Go to https://infinityfree.com
- Create free account
- Create new website

**2. Upload PHP Files via FTP:**
- Use FileZilla (download from https://filezilla-project.org)
- Connect using FTP credentials from InfinityFree
- Upload entire `backend/` folder

**3. Update Database Connection:**
Create `backend/db_connect_remote.php`:
```php
<?php
// Use Supabase PostgreSQL connection
$host = 'db.wtfngwbynkkmtjcsdqnw.supabase.co';
$port = '5432';
$dbname = 'postgres';
$user = 'postgres';
$password = '[your Supabase database password]';

try {
    $pdo = new PDO("pgsql:host=$host;port=$port;dbname=$dbname", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}
?>
```

**4. Update login.php:**
```php
<?php
require_once 'db_connect_remote.php'; // Use remote DB
// ... rest of login code
?>
```

**5. Get Your Backend URL:**
```
https://yoursite.infinityfree.com/backend/login.php
```

**Pros:**
- ✅ Free
- ✅ Always online
- ✅ Fixed URL

**Cons:**
- ⚠️ Takes 1-2 hours setup
- ⚠️ Free hosting has limitations

---

#### **Option C: Keep PHP Local + Use Ngrok (Best for Short Testing)**
Same as Option A above.

---

### **Step 3: Update Frontend to Use Remote Backend**

#### **3.1 Create Config File**
Create `frontend/my-app/src/config.js`:
```javascript
// Change this based on your deployment method
export const API_BASE_URL = import.meta.env.PROD 
  ? 'https://your-ngrok-url.ngrok.io/backend'  // Production (Ngrok or hosting)
  : '/backend';  // Local development
```

#### **3.2 Update supabaseAuth.js**
```javascript
import { API_BASE_URL } from './config';

export async function loginWithSupabase(credentials) {
  try {
    const { username, password } = credentials;
    
    // Use remote backend URL
    const response = await fetch(`${API_BASE_URL}/login.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    // ... rest of code
  }
}
```

#### **3.3 Update api.js (if used)**
Find all `fetch('/backend/` and replace with `fetch(\`${API_BASE_URL}/`:
```javascript
import { API_BASE_URL } from './config';

export async function post(endpoint, body, auth = false) {
  const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return response.json();
}
```

#### **3.4 Redeploy Frontend**
```bash
cd frontend/my-app
vercel --prod
```

---

## 🎯 Recommended Quick Start (30 Minutes)

### **For Your SUS Testing:**

1. **Deploy Frontend** (10 min)
   ```bash
   cd frontend/my-app
   vercel --prod
   ```
   Add environment variables in Vercel dashboard.

2. **Use Ngrok for Backend** (10 min)
   - Download ngrok
   - Run `ngrok http 80`
   - Copy HTTPS URL

3. **Update Config** (5 min)
   - Create `src/config.js` with ngrok URL
   - Update `src/supabaseAuth.js` to use `API_BASE_URL`
   - Redeploy: `vercel --prod`

4. **Test** (5 min)
   - Visit your Vercel URL
   - Try login with test credentials
   - Verify data loads from Supabase

5. **Share Link** 🎉
   ```
   https://smart-funeral-system.vercel.app
   ```
   Send this to your 20 SUS respondents!

---

## ⚠️ Important Notes

### **During SUS Testing:**
- ✅ Keep your computer ON if using ngrok
- ✅ Keep XAMPP Apache running
- ✅ Keep ngrok tunnel running
- ✅ Monitor ngrok dashboard for requests

### **If Ngrok URL Changes:**
1. Get new ngrok URL
2. Update `src/config.js`
3. Redeploy: `vercel --prod`
4. Send new Vercel URL to users (Vercel URL stays the same!)

### **Ngrok Free Limits:**
- ✅ 40 requests/minute (enough for 20 users)
- ✅ HTTPS enabled
- ⚠️ URL changes on restart
- ⚠️ 8-hour session limit (restart ngrok if needed)

---

## 🔒 Enable CORS for Backend

Add this to **ALL** your PHP files (at the top):

```php
<?php
header('Access-Control-Allow-Origin: https://smart-funeral-system.vercel.app');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Your existing PHP code...
?>
```

Or create `backend/cors.php`:
```php
<?php
header('Access-Control-Allow-Origin: https://smart-funeral-system.vercel.app');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
?>
```

Then include in all PHP files:
```php
<?php
require_once 'cors.php';
// Your code...
?>
```

---

## 🧪 Testing Checklist

Before sharing with SUS respondents:

- [ ] Can access via Vercel URL (https://yourapp.vercel.app)
- [ ] Login works (test with user1 and provider1)
- [ ] Data loads from Supabase (packages, bookings visible)
- [ ] No console errors in browser (F12 → Console)
- [ ] Test on mobile device
- [ ] Test on different browser (Chrome, Firefox)
- [ ] Ngrok tunnel is active (if using ngrok)
- [ ] XAMPP Apache is running

---

## 🎓 SUS Testing Workflow

### **For Respondents:**
1. Send them Vercel URL: `https://smart-funeral-system.vercel.app`
2. Provide test credentials:
   - Family: `user1` / password
   - Provider: `provider1` / password
3. Ask them to explore for 15-30 minutes
4. Send SUS Google Form link
5. Collect 20 responses (8 family, 7 providers, 5 attendees)

---

## 🆘 Troubleshooting

### **"Network Error" / "Failed to fetch"**
→ Check CORS headers in PHP files
→ Verify ngrok is running
→ Check XAMPP Apache is running

### **Login works locally but not on Vercel**
→ Update `config.js` with correct backend URL
→ Redeploy: `vercel --prod`

### **Data doesn't load**
→ Check Supabase environment variables in Vercel
→ Check browser console for errors

### **Ngrok URL expired**
→ Restart ngrok: `ngrok http 80`
→ Update `config.js` with new URL
→ Redeploy: `vercel --prod`

---

## 🚀 Ready to Deploy?

Run these commands now:

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy frontend
cd frontend/my-app
vercel --prod

# 3. In another terminal, start ngrok (keep running!)
ngrok http 80
```

**Then follow the steps above to update config and redeploy!**

---

**Need help with any step? Let me know which deployment method you want to use!** 🎯
