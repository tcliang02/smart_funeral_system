# 🚀 Quick Deployment Steps - DO THIS NOW!

## ✅ Prerequisites Check
- [x] Supabase database ready
- [x] React app works locally
- [ ] XAMPP Apache running
- [ ] Vercel account created

---

## 📝 Step-by-Step Deployment (30 minutes)

### **STEP 1: Install Vercel CLI** (2 minutes)
Open PowerShell in your project root:
```powershell
npm install -g vercel
```

### **STEP 2: Login to Vercel** (2 minutes)
```powershell
vercel login
```
Choose your login method (GitHub recommended) and authenticate.

---

### **STEP 3: Deploy Frontend** (5 minutes)

```powershell
cd frontend/my-app
vercel
```

**Answer Vercel's questions:**
- "Set up and deploy?" → Type `Y` and press Enter
- "Which scope?" → Select your account
- "Link to existing project?" → Type `N` (new project)
- "What's your project name?" → Type `smart-funeral-system` or press Enter
- "In which directory is your code located?" → Press Enter (use current)
- "Want to override settings?" → Type `N`

**Vercel will deploy and show:**
```
✅ Deployed to https://smart-funeral-system-abc123.vercel.app
```

**COPY THIS URL!** You'll need it.

---

### **STEP 4: Add Environment Variables** (3 minutes)

1. Go to https://vercel.com/dashboard
2. Click your project: `smart-funeral-system`
3. Click **Settings** → **Environment Variables**
4. Add these 2 variables:

**Variable 1:**
- Name: `VITE_SUPABASE_URL`
- Value: `https://wtfngwbynkkmtjcsdqnw.supabase.co`
- Click **Add**

**Variable 2:**
- Name: `VITE_SUPABASE_ANON_KEY`
- Value: (Open `frontend/my-app/.env.local` and copy the key)
- Click **Add**

---

### **STEP 5: Redeploy with Environment Variables** (2 minutes)

```powershell
# Still in frontend/my-app directory
vercel --prod
```

This deploys to production with environment variables.

**COPY THE NEW URL!** (might be same as before)

---

### **STEP 6: Download & Setup Ngrok** (5 minutes)

1. **Download Ngrok:**
   - Go to https://ngrok.com/download
   - Click **Download for Windows**
   - Extract `ngrok.exe` to `C:\ngrok\`

2. **Create Account:**
   - Go to https://dashboard.ngrok.com/signup
   - Sign up (free)
   - Copy your **Authtoken** from dashboard

3. **Setup Ngrok:**
```powershell
cd C:\ngrok
.\ngrok config add-authtoken YOUR_TOKEN_HERE
```

---

### **STEP 7: Start Ngrok Tunnel** (Keep this running!)

**Open NEW PowerShell window:**
```powershell
cd C:\ngrok
.\ngrok http 80
```

If XAMPP uses port 8080:
```powershell
.\ngrok http 8080
```

**You'll see:**
```
Forwarding: https://abc123-xyz.ngrok-free.app -> http://localhost:80
```

**COPY THE HTTPS URL!** (e.g., `https://abc123-xyz.ngrok-free.app`)

---

### **STEP 8: Update Config with Ngrok URL** (3 minutes)

Open `frontend/my-app/src/config.js` and update:

```javascript
export const API_BASE_URL = import.meta.env.PROD 
  ? 'https://abc123-xyz.ngrok-free.app/backend'  // ⚠️ PASTE YOUR NGROK URL
  : '/backend';
```

---

### **STEP 9: Update CORS with Vercel URL** (2 minutes)

Open `backend/cors.php` and update line 8:

```php
$allowed_origins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://smart-funeral-system-abc123.vercel.app',  // ⚠️ PASTE YOUR VERCEL URL
];
```

---

### **STEP 10: Final Deploy** (2 minutes)

```powershell
cd frontend/my-app
vercel --prod
```

---

### **STEP 11: Test Your Deployment** (5 minutes)

1. **Visit your Vercel URL:**
   ```
   https://smart-funeral-system-abc123.vercel.app
   ```

2. **Try login:**
   - Username: `user1`
   - Password: (your password)

3. **Check if data loads:**
   - Browse packages
   - View service providers
   - Check tributes

4. **Check browser console** (F12 → Console):
   - Should see no errors
   - Should see successful API calls

---

## ✅ Deployment Complete!

### **Your URLs:**
- **Frontend (Share this!):** `https://smart-funeral-system.vercel.app`
- **Backend (Keep private):** `https://abc123.ngrok-free.app`

### **Share with SUS Respondents:**
Send them this link:
```
https://smart-funeral-system.vercel.app
```

With test credentials:
- **Family User:** username: `user1`, password: [your password]
- **Provider User:** username: `provider1`, password: [your password]

---

## ⚠️ IMPORTANT - During Testing

### **Keep These Running:**
1. ✅ XAMPP Apache (check XAMPP Control Panel)
2. ✅ Ngrok tunnel (PowerShell window must stay open!)
3. ✅ Your computer turned ON

### **If Ngrok Stops:**
1. Restart ngrok: `.\ngrok http 80`
2. Get NEW ngrok URL
3. Update `src/config.js` with new URL
4. Redeploy: `vercel --prod`
5. **Vercel URL stays the same!** No need to notify users.

### **Ngrok Free Tier Limits:**
- ✅ 40 requests/minute (plenty for 20 users)
- ✅ HTTPS included
- ⚠️ 8-hour session limit (restart if needed)
- ⚠️ URL changes when restarted

---

## 🐛 Troubleshooting

### **"Failed to fetch" errors**
→ Check ngrok is running
→ Check XAMPP Apache is running
→ Verify config.js has correct ngrok URL

### **Login doesn't work**
→ Check browser console for CORS errors
→ Verify backend/cors.php has your Vercel URL
→ Check XAMPP Apache is running

### **Data doesn't load**
→ Check Vercel environment variables are set
→ Check Supabase URL is correct
→ Open browser console (F12) for errors

### **Page not found (404)**
→ Check you're using the correct Vercel URL
→ Verify deployment finished: run `vercel --prod` again

---

## 📊 Ready for SUS Testing!

Once everything works:

1. **Create SUS Google Form** (use `SUS_FORM_CREATION_CHECKLIST.md`)
2. **Share links with respondents:**
   - System URL: `https://smart-funeral-system.vercel.app`
   - SUS Form: [Your Google Form link]
3. **Collect 20 responses** (8 family, 7 providers, 5 attendees)
4. **Calculate SUS scores** (use formula in Chapter 6)

---

## 🎯 START NOW!

Run this command to begin:
```powershell
npm install -g vercel
vercel login
```

**Then follow steps 3-11 above!** 🚀
