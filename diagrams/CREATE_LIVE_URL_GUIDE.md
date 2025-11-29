# How to Create a Live URL for SUS Testing

## Your Current Situation
- **Local URL:** http://localhost:5173 (only works on your computer)
- **Local IP:** 192.168.68.59 (your computer's address on the network)
- **Backend:** XAMPP running on http://localhost/smart_funeral_system/backend

---

## Quick Solutions (Ranked by Speed & Ease)

### 🏆 Option 1: Local Network Access (FASTEST - 2 minutes)
**Best for:** Testing with people at your location (same WiFi)

#### Steps:
1. **Allow Vite to accept external connections**

Open a new terminal and run:
```bash
cd C:\xampp\htdocs\smart_funeral_system\frontend\my-app
npm run dev -- --host
```

2. **Share this URL with testers on your WiFi:**
```
http://192.168.68.59:5173
```

3. **Make sure Windows Firewall allows it:**
   - Open Windows Firewall
   - Click "Allow an app through firewall"
   - Find "Node.js" and check both Private and Public
   - Click OK

#### Pros:
✅ Works immediately  
✅ No deployment needed  
✅ Free  

#### Cons:
❌ Only works on your local network  
❌ Computer must stay on during testing  
❌ Testers must be connected to your WiFi  

---

### 🌐 Option 2: Ngrok Tunnel (FAST - 5 minutes)
**Best for:** Quick remote testing, temporary URL

#### Steps:

1. **Download ngrok:**
   - Go to https://ngrok.com/download
   - Download Windows version
   - Extract to a folder (e.g., `C:\ngrok\`)

2. **Sign up (free account):**
   - Go to https://dashboard.ngrok.com/signup
   - Get your authtoken

3. **Authenticate ngrok:**
```bash
cd C:\ngrok
ngrok config add-authtoken YOUR_TOKEN_HERE
```

4. **Start your Vite dev server:**
```bash
cd C:\xampp\htdocs\smart_funeral_system\frontend\my-app
npm run dev
```

5. **In a NEW terminal, start ngrok tunnel:**
```bash
cd C:\ngrok
ngrok http 5173
```

6. **You'll get a public URL like:**
```
https://abc123.ngrok-free.app
```

7. **Share this URL with your testers!**

#### Pros:
✅ Works from anywhere in the world  
✅ HTTPS enabled (secure)  
✅ Free tier available  
✅ Quick setup  

#### Cons:
❌ Free tier: URL changes every 8 hours  
❌ Computer must stay on  
❌ Backend still needs separate solution  

---

### ☁️ Option 3: Full Cloud Deployment (BEST for FYP - 30-60 minutes)

This gives you a permanent URL that stays forever.

#### A. Deploy Frontend to Vercel

**Step 1: Prepare your code**

Create `frontend/my-app/vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

**Step 2: Push to GitHub** (if not already)
```bash
cd C:\xampp\htdocs\smart_funeral_system
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/smart-funeral-system.git
git push -u origin main
```

**Step 3: Deploy to Vercel**
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New Project"
4. Import your repository
5. Configure:
   - **Root Directory:** `frontend/my-app`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Click "Deploy"
7. Your frontend URL: `https://smart-funeral-system.vercel.app`

---

#### B. Deploy Backend to InfinityFree

**Step 1: Sign up**
1. Go to https://infinityfree.net
2. Create free account
3. Click "Create Account" → Choose subdomain (e.g., `smartfuneral`)
4. You'll get: `https://smartfuneral.infinityfreeapp.com`

**Step 2: Upload backend**
1. Login to control panel
2. Click "File Manager" or use FTP
3. Upload entire `backend/` folder to `htdocs/`
4. Your backend will be at: `https://smartfuneral.infinityfreeapp.com/backend/`

**Step 3: Setup database**
1. In control panel, click "MySQL Databases"
2. Create new database
3. Note the credentials:
   - Host: (usually `sqlXXX.infinityfree.net`)
   - Database name
   - Username
   - Password

**Step 4: Update db_connect.php**

Edit `backend/db_connect.php` on the server:
```php
<?php
// InfinityFree Database Connection
$servername = "sqlXXX.infinityfree.net";  // From control panel
$username = "your_username";               // From control panel
$password = "your_password";               // From control panel
$dbname = "your_dbname";                   // From control panel

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
```

**Step 5: Import database**
1. Go to phpMyAdmin in InfinityFree control panel
2. Select your database
3. Click "Import"
4. Upload your SQL file (export from XAMPP phpMyAdmin first)

**Step 6: Update frontend API URLs**

In your React app, update all API calls from:
```javascript
// OLD
fetch('http://localhost/smart_funeral_system/backend/getPackages.php')

// NEW
fetch('https://smartfuneral.infinityfreeapp.com/backend/getPackages.php')
```

Search for all API calls in your frontend:
```bash
cd frontend/my-app/src
grep -r "localhost" .
```

**Step 7: Re-deploy frontend to Vercel**
```bash
git add .
git commit -m "Update API URLs to production"
git push
```
Vercel will auto-deploy.

---

#### Final Result:
- **Frontend:** `https://smart-funeral-system.vercel.app`
- **Backend:** `https://smartfuneral.infinityfreeapp.com/backend/`
- **Database:** Hosted on InfinityFree MySQL

✅ This is a **permanent, professional URL** perfect for FYP submission!

---

### 📱 Option 4: Render.com (All-in-One Alternative)

Render can host both frontend and backend together.

**Steps:**
1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your repository
5. Configure:
   - **Name:** smart-funeral-frontend
   - **Environment:** Node
   - **Build Command:** `cd frontend/my-app && npm install && npm run build`
   - **Start Command:** `cd frontend/my-app && npm run preview`
6. Click "Create Web Service"
7. Your URL: `https://smart-funeral-frontend.onrender.com`

**For backend:**
1. Create another Web Service
2. **Environment:** Node (or PHP if you set up a custom Docker container)
3. Set up environment variables for database

---

## 🎯 Recommended Approach for Your FYP

### **For Quick Testing (This Week):**
Use **Option 2 (Ngrok)**
- Takes 5 minutes
- Get a public URL immediately
- Perfect for gathering your 20 SUS responses

**Commands:**
```bash
# Terminal 1: Start Vite
cd C:\xampp\htdocs\smart_funeral_system\frontend\my-app
npm run dev

# Terminal 2: Start ngrok
cd C:\ngrok
ngrok http 5173
```

Share the ngrok URL (e.g., `https://abc123.ngrok-free.app`) in your SUS Google Form.

---

### **For Final FYP Submission:**
Use **Option 3 (Vercel + InfinityFree)**
- Permanent URL
- Professional appearance
- Can include in your FYP report
- Examiners can access it during presentation

---

## 📝 Updating Your SUS Form

After you have your live URL, update the Google Form description:

**Instead of:**
```
2. Access the system at: http://localhost:5173
```

**Change to ONE of these:**

**If using ngrok:**
```
2. Access the system at: https://abc123.ngrok-free.app
```

**If using local network:**
```
2. Access the system at: http://192.168.68.59:5173
(You must be connected to [Your WiFi Name])
```

**If using Vercel:**
```
2. Access the system at: https://smart-funeral-system.vercel.app
```

---

## 🆘 Troubleshooting

### "Can't access the URL"
- **Local network:** Check Windows Firewall, ensure both devices on same WiFi
- **Ngrok:** Make sure Vite dev server is running first
- **Cloud:** Check if build was successful in deployment logs

### "Backend not working"
- Update CORS settings in PHP files to allow your new frontend URL
- Check database connection credentials
- Verify all API endpoints are accessible

### "Ngrok URL keeps changing"
- Free tier changes URL every 8 hours
- Upgrade to paid plan ($8/month) for permanent subdomain
- Or use Option 3 for permanent free hosting

---

## 🎯 My Recommendation

**Do this now (5 minutes):**
1. Download ngrok
2. Run `npm run dev` in frontend
3. Run `ngrok http 5173`
4. Get public URL
5. Update your Google Form with this URL
6. Distribute to your 20 testers

**Do this later (for final submission):**
1. Deploy to Vercel (frontend) + InfinityFree (backend)
2. Get permanent URLs
3. Include in FYP report
4. Update documentation

This way you can start collecting SUS responses TODAY while working on permanent deployment later! 🚀

---

## Need Help?

If you get stuck:
1. Check ngrok dashboard: https://dashboard.ngrok.com
2. Check Vercel deployment logs
3. Check InfinityFree error logs in control panel
4. Let me know which option you chose and where you're stuck!
