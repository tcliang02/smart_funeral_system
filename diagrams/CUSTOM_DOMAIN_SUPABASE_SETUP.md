# Professional Setup: Custom Domain + Supabase Backend

## 🎯 Overview

This guide shows you how to set up a professional production environment:
- **Custom Domain:** yourname.com (RM 40-50/year)
- **Frontend:** Vercel (Free) with custom domain
- **Backend/Database:** Supabase (Free tier, PostgreSQL)
- **PHP Replacement:** Convert PHP to serverless functions or use Supabase REST API

**Final Result:** `https://smartfuneral.com` (or whatever domain you buy)

---

## Part 1: Buy a Custom Domain

### Option A: Namecheap (Recommended - International)

**Steps:**
1. Go to https://www.namecheap.com
2. Search for your desired domain (e.g., `smartfuneral.com`)
3. **Popular TLDs:**
   - `.com` - USD 13.98/year (~RM 60)
   - `.online` - USD 1.88/year (~RM 8) - **CHEAPEST**
   - `.tech` - USD 4.98/year (~RM 21)
   - `.site` - USD 2.98/year (~RM 13)
4. Add to cart and checkout
5. You'll receive domain management dashboard

**Payment:** Credit/Debit card, PayPal

---

### Option B: Exabytes (Local Malaysian Registrar)

**Steps:**
1. Go to https://www.exabytes.my
2. Search domain
3. **Prices:**
   - `.com.my` - RM 90/year
   - `.my` - RM 150/year
   - `.com` - RM 50-60/year
4. Purchase
5. Access domain control panel

**Payment:** Malaysian credit card, online banking

---

### Option C: Cloudflare (Best Value)

**Steps:**
1. Go to https://www.cloudflare.com/products/registrar/
2. Transfer existing domain OR register new one
3. **Price:** At-cost pricing (usually cheapest)
   - `.com` - ~USD 8.57/year (~RM 37)
4. No markup, just registry fee

**Payment:** Credit card

---

## Part 2: Setup Supabase Backend

### Why Supabase?
✅ Free tier (generous limits)  
✅ PostgreSQL database (better than MySQL)  
✅ REST API auto-generated  
✅ Real-time subscriptions  
✅ Authentication built-in  
✅ Storage for file uploads  
✅ No PHP needed - use JavaScript/TypeScript  

---

### Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub
4. Click "New Project"
5. Fill in:
   - **Name:** Smart Funeral System
   - **Database Password:** (Generate strong password, SAVE IT!)
   - **Region:** Singapore (closest to Malaysia)
   - **Plan:** Free tier
6. Click "Create new project"
7. Wait 2-3 minutes for setup

---

### Step 2: Migrate Your Database Schema

#### Get Your Current Schema

In XAMPP phpMyAdmin:
1. Select your database
2. Click "Export"
3. Format: SQL
4. Click "Go"
5. Save the `.sql` file

#### Convert MySQL to PostgreSQL

Your SQL file has MySQL syntax. Here's how to convert:

**Common conversions:**
```sql
-- MySQL
AUTO_INCREMENT
TINYINT(1)
VARCHAR(255)
DATETIME

-- PostgreSQL equivalent
SERIAL
BOOLEAN
VARCHAR(255)  -- Same
TIMESTAMP
```

**Example conversion:**

**MySQL (your current schema):**
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('family', 'provider') NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**PostgreSQL (for Supabase):**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) CHECK (role IN ('family', 'provider')) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Import to Supabase

1. In Supabase dashboard, click "SQL Editor"
2. Click "New Query"
3. Paste your **converted** PostgreSQL schema
4. Click "Run"
5. Check "Table Editor" to verify tables created

---

### Step 3: Get Supabase Credentials

In your Supabase project dashboard:

1. Click "Settings" (gear icon)
2. Click "API"
3. Copy these values:

```
Project URL: https://abcdefg.supabase.co
anon public key: eyJhbGc...long-string...
service_role key: eyJhbGc...different-long-string...
```

⚠️ **Save these securely!** You'll use them in your frontend.

---

### Step 4: Setup Row Level Security (RLS)

Supabase requires RLS for security. In SQL Editor:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
-- ... repeat for all tables

-- Allow public read access to packages (example)
CREATE POLICY "Public can view packages"
  ON packages FOR SELECT
  USING (is_active = true);

-- Allow authenticated users to create bookings
CREATE POLICY "Users can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Providers can update their own packages
CREATE POLICY "Providers can update their packages"
  ON packages FOR UPDATE
  USING (auth.uid() = provider_id);
```

**Note:** You'll need to create specific policies for each table based on your access control requirements.

---

## Part 3: Convert PHP Backend to Supabase API

You have two options:

### Option A: Use Supabase REST API Directly (Recommended)

Instead of PHP files like `getPackages.php`, use Supabase's auto-generated REST API.

#### Install Supabase Client in Your React App

```bash
cd C:\xampp\htdocs\smart_funeral_system\frontend\my-app
npm install @supabase/supabase-js
```

#### Create Supabase Client

Create `frontend/my-app/src/supabaseClient.js`:
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://abcdefg.supabase.co'
const supabaseAnonKey = 'your-anon-key-here'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

#### Replace PHP API Calls

**OLD (PHP):**
```javascript
// getPackages.php
fetch('http://localhost/smart_funeral_system/backend/getPackages.php')
  .then(res => res.json())
  .then(data => console.log(data))
```

**NEW (Supabase):**
```javascript
import { supabase } from './supabaseClient'

// Get all active packages
const { data, error } = await supabase
  .from('packages')
  .select('*')
  .eq('is_active', true)

if (error) console.error(error)
else console.log(data)
```

**More examples:**

```javascript
// Insert booking (addBooking.php replacement)
const { data, error } = await supabase
  .from('bookings')
  .insert([
    {
      user_id: userId,
      package_id: packageId,
      service_date: date,
      total_price: price
    }
  ])

// Update package (updatePackage.php replacement)
const { data, error } = await supabase
  .from('packages')
  .update({ price: newPrice })
  .eq('id', packageId)

// Delete package (deletePackage.php replacement)
const { data, error } = await supabase
  .from('packages')
  .delete()
  .eq('id', packageId)

// Search packages
const { data, error } = await supabase
  .from('packages')
  .select('*')
  .textSearch('name', 'buddhist')
  .eq('is_active', true)
  .order('price', { ascending: true })
```

---

### Option B: Keep PHP, Use Supabase as Database Only

If you want to keep your PHP backend logic:

**Install Supabase PHP Client:**
```bash
composer require supabase/supabase-php
```

**Update `db_connect.php`:**
```php
<?php
require 'vendor/autoload.php';

use Supabase\CreateClient;

$supabase = CreateClient::create(
    'https://abcdefg.supabase.co',
    'your-anon-key-here'
);

// Query example
$response = $supabase->from('packages')->select('*')->execute();
$packages = $response->data;
?>
```

But honestly, **Option A is better** - you eliminate PHP entirely and use modern JavaScript.

---

## Part 4: Deploy Frontend to Vercel with Custom Domain

### Step 1: Update Environment Variables

Create `frontend/my-app/.env.production`:
```env
VITE_SUPABASE_URL=https://abcdefg.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Update `supabaseClient.js`:
```javascript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Step 2: Push to GitHub

```bash
cd C:\xampp\htdocs\smart_funeral_system
git add .
git commit -m "Migrate to Supabase backend"
git push origin main
```

### Step 3: Deploy to Vercel

1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Root Directory:** `frontend/my-app`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Click "Environment Variables"
6. Add:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
7. Click "Deploy"
8. Wait 2-3 minutes
9. You'll get: `https://smart-funeral-system.vercel.app`

---

### Step 4: Connect Custom Domain to Vercel

#### If you bought domain from Namecheap:

1. **In Vercel:**
   - Go to your project
   - Click "Settings" → "Domains"
   - Enter your domain (e.g., `smartfuneral.com`)
   - Click "Add"
   - Vercel will show DNS records you need

2. **In Namecheap:**
   - Login to Namecheap
   - Go to Domain List → Manage
   - Click "Advanced DNS"
   - Add these records:
     ```
     Type: A Record
     Host: @
     Value: 76.76.21.21
     TTL: Automatic

     Type: CNAME Record
     Host: www
     Value: cname.vercel-dns.com
     TTL: Automatic
     ```
   - Click "Save All Changes"

3. **Wait 24-48 hours** for DNS propagation

4. **Your site will be live at:**
   - `https://smartfuneral.com`
   - `https://www.smartfuneral.com`

#### If you bought domain from Cloudflare:

1. **In Vercel:**
   - Add domain as above
   - Note the DNS records

2. **In Cloudflare:**
   - Go to DNS settings
   - Add A record pointing to Vercel IP
   - Add CNAME record
   - **Disable** Cloudflare Proxy (orange cloud) temporarily
   - After Vercel verifies, you can re-enable it

---

## Part 5: Setup Supabase Authentication (Bonus)

Replace your custom login system with Supabase Auth:

### Enable Email Authentication

1. In Supabase dashboard, go to "Authentication"
2. Click "Providers"
3. Enable "Email"
4. Save

### Update Your React Login Component

**OLD (PHP login):**
```javascript
fetch('/backend/login.php', {
  method: 'POST',
  body: JSON.stringify({ email, password })
})
```

**NEW (Supabase Auth):**
```javascript
import { supabase } from './supabaseClient'

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: email,
  password: password,
  options: {
    data: {
      role: 'family', // or 'provider'
      name: name
    }
  }
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: email,
  password: password
})

// Get current user
const { data: { user } } = await supabase.auth.getUser()

// Sign out
await supabase.auth.signOut()
```

---

## Part 6: File Storage (For Photo Uploads)

Use Supabase Storage instead of local file system:

### Create Storage Bucket

1. In Supabase dashboard, click "Storage"
2. Click "New bucket"
3. Name: `photos`
4. Public: ✅ (if photos should be publicly accessible)
5. Create

### Upload Files from React

```javascript
import { supabase } from './supabaseClient'

// Upload deceased photo
const file = event.target.files[0]
const fileExt = file.name.split('.').pop()
const fileName = `${Math.random()}.${fileExt}`
const filePath = `deceased-photos/${fileName}`

const { data, error } = await supabase.storage
  .from('photos')
  .upload(filePath, file)

// Get public URL
const { data: urlData } = supabase.storage
  .from('photos')
  .getPublicUrl(filePath)

console.log(urlData.publicUrl)
// Save this URL to database
```

---

## Cost Breakdown

### Domain
- **Namecheap .online:** USD 1.88/year (~RM 8)
- **Namecheap .com:** USD 13.98/year (~RM 60)
- **Cloudflare .com:** USD 8.57/year (~RM 37)

### Hosting
- **Vercel:** FREE
- **Supabase:** FREE (up to 500MB database, 1GB storage)

### Total Annual Cost: **RM 8 - RM 60** (just the domain!)

---

## Free Tier Limits (Supabase)

✅ 500MB database  
✅ 1GB file storage  
✅ 2GB bandwidth  
✅ 50,000 monthly active users  
✅ Unlimited API requests  

**This is MORE than enough for your FYP project and even a real production system!**

---

## Migration Checklist

- [ ] Buy domain from Namecheap/Cloudflare
- [ ] Create Supabase project
- [ ] Export current MySQL database
- [ ] Convert MySQL schema to PostgreSQL
- [ ] Import schema to Supabase
- [ ] Setup Row Level Security policies
- [ ] Install `@supabase/supabase-js` in React app
- [ ] Create `supabaseClient.js`
- [ ] Replace all PHP API calls with Supabase queries
- [ ] Test locally with Supabase
- [ ] Create `.env.production` with Supabase credentials
- [ ] Push code to GitHub
- [ ] Deploy to Vercel
- [ ] Add environment variables in Vercel
- [ ] Connect custom domain to Vercel
- [ ] Update DNS records in domain registrar
- [ ] Wait for DNS propagation (24-48 hours)
- [ ] Update SUS Google Form with new domain
- [ ] Test production site thoroughly

---

## Sample Timeline

**Day 1 (Today):**
- [ ] Buy domain (15 minutes)
- [ ] Create Supabase project (10 minutes)
- [ ] Migrate database schema (1-2 hours)

**Day 2:**
- [ ] Install Supabase client (5 minutes)
- [ ] Convert 5-10 critical API endpoints (2-3 hours)
- [ ] Test locally (30 minutes)

**Day 3:**
- [ ] Convert remaining endpoints (2-3 hours)
- [ ] Deploy to Vercel (30 minutes)
- [ ] Connect custom domain (15 minutes)

**Day 4-5:**
- [ ] Wait for DNS propagation
- [ ] Test production site
- [ ] Create SUS Google Form with new domain

**Day 6-10:**
- [ ] Distribute SUS questionnaire
- [ ] Collect 20 responses

---

## Example Domain Names for Your Project

Good options:
- `smartfuneral.online` (RM 8/year)
- `smartfuneral.site` (RM 13/year)
- `funeralcare.online`
- `memorialcare.tech`
- `tributecare.online`

Premium (if available):
- `smartfuneral.com` (RM 60/year)
- `smartfuneral.my` (RM 150/year)

---

## Benefits of This Setup vs. Free Hosting

### Your Setup (Domain + Supabase + Vercel):
✅ Professional custom domain  
✅ Fast global CDN (Vercel)  
✅ Modern PostgreSQL database  
✅ Automatic SSL/HTTPS  
✅ Auto-scaling  
✅ Real-time capabilities  
✅ Built-in authentication  
✅99.9% uptime  
✅ Easy to maintain  

### Free Hosting (InfinityFree):
❌ Subdomain (unprofessional)  
❌ Slow performance  
❌ Old MySQL version  
❌ Limited bandwidth  
❌ No HTTPS on subdomain  
❌ Frequent downtime  
❌ PHP version restrictions  

**For an extra RM 8-60/year, you get a MUCH better setup!**

---

## Need Help?

### Supabase Resources:
- **Documentation:** https://supabase.com/docs
- **JavaScript Guide:** https://supabase.com/docs/reference/javascript/introduction
- **SQL Editor:** https://supabase.com/docs/guides/database/overview

### Vercel Resources:
- **Documentation:** https://vercel.com/docs
- **Custom Domains:** https://vercel.com/docs/concepts/projects/domains

### Common Issues:

**"DNS not propagating"**
- Wait 24-48 hours
- Check: https://www.whatsmydns.net
- Clear browser cache

**"Supabase query not working"**
- Check RLS policies
- Check table/column names match
- Use `.select('*')` for debugging

**"Environment variables not working"**
- Redeploy in Vercel after adding env vars
- Check variable names match exactly

---

## Final Recommendation

**Do this:**
1. Buy `smartfuneral.online` from Namecheap (RM 8/year) - CHEAPEST
2. Migrate to Supabase (takes 1-2 days of work)
3. Deploy to Vercel with custom domain
4. **Result:** Professional URL like `https://smartfuneral.online`

This setup is:
- ✅ More professional than free hosting
- ✅ Better technology stack (PostgreSQL > MySQL)
- ✅ Modern (no PHP, pure JavaScript)
- ✅ Scalable (can handle real traffic)
- ✅ Perfect for FYP presentation
- ✅ Looks great on your resume

**Total cost: RM 8/year** (less than one meal at a restaurant!)

Worth it? **Absolutely!** 🚀
