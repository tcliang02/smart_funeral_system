# 🧪 Complete Testing & Debug Guide

## ✅ All Features Implemented!

### What's Been Built:

1. ✅ **Feature 1: Combined Tribute Wall + Candle Lighting with Photos**
2. ✅ **Feature 2: Family Gallery Section** 
3. ✅ **Feature 3: Bank Details Display** (needs debugging)
4. ✅ **Feature 4: Portrait Photo Display** (needs debugging)
5. ✅ **Feature 5: RSVP Management Dashboard**
6. ✅ **Feature 6: Family Moderation Controls**
7. ✅ **All Backend APIs Created**
8. ✅ **Database Schema Update Script**

---

## 🚀 Quick Start Testing

### Step 1: Database Setup (IMPORTANT - DO THIS FIRST!)

**Run this URL in browser:**
```
http://localhost/smart_funeral_system/backend/update_schema.php
```

**What it does:**
- Adds `photo_url` column to `tribute_messages`
- Adds `uploader_type`, `uploader_user_id`, `uploader_name` to `tribute_photos`
- Adds `guest_email` to `tribute_rsvp`
- Verifies all table structures

**Expected Result:**
✓ Green success message: "Database Schema Update Complete!"

---

### Step 2: Access Frontend

**Dev Server is Running:**
```
http://localhost:5175
```

**Main Test Pages:**
- Home: `http://localhost:5175`
- Tribute Home: `http://localhost:5175/tribute`
- Specific Tribute: `http://localhost:5175/tribute/1`
- Create Tribute: `http://localhost:5175/tribute/create`

---

## 📋 Feature-by-Feature Testing

### ✅ **Feature 1: Tribute Wall with Photos + Auto Candle Lighting**

**Test Steps:**
1. Navigate to any tribute page
2. Scroll to "Tribute Wall" section
3. Fill in form:
   - Name: "John Doe"
   - Message: "Beautiful memories"
   - Photo: Upload an image (max 5MB)
4. Click "Post Message & Light Candle 🕯️"

**Expected Results:**
- ✓ Loading spinner shows
- ✓ Success message: "Your tribute message has been posted and a candle has been lit! 🕯️"
- ✓ New message appears with photo
- ✓ Orange "Candle Lit" badge shows
- ✓ Candle count increases by 1 in statistics
- ✓ Photo displays full-width in message card

**If Family Member:**
- ✓ "Remove message" button appears on each message
- ✓ Clicking delete shows confirmation
- ✓ Message disappears after deletion

**Debug if failing:**
```javascript
// Check browser console (F12):
console.log("Message submitted:", messageData);
console.log("Photo uploaded:", uploadData.file_url);

// Check Network tab:
- POST to uploadFile.php (if photo selected)
- POST to addMessage.php
- POST to lightCandle.php
- All should return: {"success": true}
```

---

### ✅ **Feature 2: Family Gallery**

**Test Steps (Family Member Only):**
1. Log in as tribute creator
2. Navigate to your tribute page
3. Scroll to "Family Gallery" section (purple gradient box)
4. Fill upload form:
   - Select Photo: Choose an image
   - Caption: "Family reunion 2020"
5. Click "Upload to Family Gallery"

**Expected Results:**
- ✓ Purple gradient section appears
- ✓ "Family Only" badge shows
- ✓ Upload form visible (family only)
- ✓ Photo appears in grid after upload
- ✓ Caption shows below photo
- ✓ "By [Your Name]" displays
- ✓ Trash icon appears on hover (family only)
- ✓ Click trash to delete photo

**Test as Guest:**
- ✓ Family Gallery section shows existing photos
- ✓ Upload form does NOT appear
- ✓ Trash icons do NOT appear

**Debug if failing:**
```javascript
// Check userRole state:
console.log("User role:", userRole); // Should be "family" or "guest"

// Check API response:
console.log("Family photos:", familyPhotos);
console.log("Guest photos:", photos);

// Check separation logic in fetchTribute():
const allPhotos = data.photos || [];
const family = allPhotos.filter(p => p.uploader_type === 'family');
const guests = allPhotos.filter(p => p.uploader_type !== 'family');
```

---

### ✅ **Feature 3: Bank Details Display (NEEDS DEBUGGING)**

**Test Steps:**
1. Navigate to any tribute with donation items
2. Scroll to "Donations" section
3. Click "I Want to Donate 💝" button
4. Bank details should expand below

**Expected Results:**
- ✓ Button text toggles: "Hide Donation Info ❌"
- ✓ Bank account holder name shows
- ✓ Bank name shows
- ✓ Account number shows
- ✓ QR code image displays (if uploaded)

**Debug Steps:**
```javascript
// Add this to TributePage.jsx after fetchTribute():
useEffect(() => {
  if (tribute) {
    console.log("🏦 Bank Details Debug:", {
      account_number: tribute.bank_account_number,
      account_name: tribute.bank_account_name,
      bank_name: tribute.bank_name,
      qr_code: tribute.donation_qr_code,
      showBank: showBank
    });
  }
}, [tribute, showBank]);

// Click the button and check:
console.log("showBank state:", showBank); // Should toggle true/false

// Check database:
SELECT bank_account_number, bank_name, bank_account_name, donation_qr_code 
FROM tributes WHERE id = 1;
// Make sure values are not NULL
```

**Possible Issues:**
1. **Fields are NULL in database** → User didn't fill them during tribute creation
2. **showBank not toggling** → Check button onClick handler
3. **AnimatePresence not showing** → Check conditional rendering
4. **QR code path wrong** → Check getImageUrl() function

**Fix if NULL:**
```sql
-- Update database with test data:
UPDATE tributes SET 
  bank_account_number = '1234567890',
  bank_account_name = 'John Doe',
  bank_name = 'Test Bank',
  donation_qr_code = 'uploads/tributes/qr_test.png'
WHERE id = 1;
```

---

### ✅ **Feature 4: Portrait Photo Display (NEEDS DEBUGGING)**

**Test Steps:**
1. Create a new tribute with portrait photo
2. Submit and view tribute page
3. Check hero section (top) for portrait

**Expected Results:**
- ✓ Portrait displays in circular frame (256x256px)
- ✓ Portrait also shows as hero background (blurred)
- ✓ Default placeholder shows if no photo

**Debug Steps:**
```javascript
// Add to TributePage.jsx:
useEffect(() => {
  if (tribute) {
    console.log("📸 Portrait Photo Debug:", {
      original_path: tribute.portrait_photo,
      computed_url: getImageUrl(tribute.portrait_photo),
      expected: "http://localhost/smart_funeral_system/uploads/tributes/portrait_xxxxx.jpg"
    });
  }
}, [tribute]);

// Check the actual URL being generated:
// Should NOT be: http://localhost/.../http://localhost/...
// Should BE: http://localhost/smart_funeral_system/uploads/tributes/portrait_xxxxx.jpg
```

**Check Database:**
```sql
SELECT id, deceased_name, portrait_photo FROM tributes;
-- Check what's stored in portrait_photo column
-- Should be: 'http://localhost/smart_funeral_system/uploads/tributes/portrait_xxxxx.jpg'
-- OR: 'uploads/tributes/portrait_xxxxx.jpg'
```

**Fix getImageUrl() if needed:**
```javascript
const getImageUrl = (path) => {
  if (!path) return '/images/default-portrait.png';
  
  // Already full URL
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Relative path from uploads
  if (path.startsWith('uploads/')) {
    return `http://localhost/smart_funeral_system/${path}`;
  }
  
  // Assume relative from backend
  return `http://localhost/smart_funeral_system/${path}`;
};
```

---

### ✅ **Feature 5: RSVP Management Dashboard**

**Test Steps (Family Member Only):**
1. Log in as tribute creator
2. Navigate to your tribute with RSVPs enabled
3. Scroll to "Memorial Service & RSVP" section
4. Click "View All RSVPs (X)" button

**Expected Results:**
- ✓ Modal opens with purple gradient header
- ✓ Shows list of all RSVP submissions
- ✓ Each card shows: Name, Phone, Email, Guests, Type, Date
- ✓ Attendance type badge: Green (In Person) or Blue (Virtual)
- ✓ Footer shows total guests count
- ✓ "Export CSV" button downloads CSV file
- ✓ Close button (X) closes modal

**Test Export:**
1. Click "Export CSV"
2. File downloads: `rsvp-list-[name].csv`
3. Open in Excel/Numbers
4. Should show all columns and data

**Test as Guest:**
- ✓ "View All RSVPs" button does NOT appear

**Debug if failing:**
```javascript
// Check API call:
const response = await fetch(
  `http://localhost/.../getRSVPList.php?tribute_id=${id}&user_id=${user.id}`
);
console.log("RSVP List Response:", await response.json());

// Check backend verification:
// getRSVPList.php should check: tribute.creator_user_id === user_id

// Check showRSVPList state:
console.log("Show modal:", showRSVPList); // Should be true when modal open
```

---

### ✅ **Feature 6: Family Moderation**

**What's Included:**
1. ✅ Delete messages (Feature 1)
2. ✅ Delete family photos (Feature 2)
3. ✅ View RSVP list (Feature 5)
4. ✅ Update tribute endpoint created (not yet UI)

**Test Delete Message:**
1. As family member, view any message
2. Click "Remove message" button
3. Confirm deletion
4. Message disappears

**Test Delete Photo:**
1. As family member, hover over family photo
2. Trash icon appears top-right
3. Click trash icon
4. Confirm deletion
5. Photo disappears

**All moderation actions:**
- ✓ Check user is tribute creator
- ✓ Show confirmation dialog
- ✓ Optimistic UI update
- ✓ Backend verification

---

## 🔧 Common Issues & Solutions

### Issue 1: "Method not allowed"
**Cause:** OPTIONS request not handled
**Fix:** Backend already handles this - check CORS headers

### Issue 2: "Only family members can..."
**Cause:** userRole not set correctly
**Fix:**
```javascript
// Check localStorage:
console.log("User:", JSON.parse(localStorage.getItem("user")));
// Should have: {id: 1, name: "...", email: "..."}

// Check role detection:
console.log("Tribute creator:", tribute.creator_user_id);
console.log("Current user:", user.id);
console.log("User role:", userRole); // Should be "family" if IDs match
```

### Issue 3: Photos not uploading
**Cause:** File size > 5MB or wrong file type
**Fix:**
- Use JPG/PNG under 5MB
- Check uploadFile.php response
- Check uploads/tributes/ folder permissions

### Issue 4: Database errors
**Cause:** Columns missing
**Fix:**
```
1. Run: http://localhost/.../backend/update_schema.php
2. Check output for green checkmarks
3. Verify in phpMyAdmin: Database > tributes > Structure
```

### Issue 5: Page not loading
**Cause:** Frontend not running
**Fix:**
```powershell
cd C:\xampp\htdocs\smart_funeral_system\frontend\my-app
npm run dev
# Visit: http://localhost:5175
```

---

## 📊 Database Verification

**Check Tables:**
```sql
-- tribute_messages should have:
DESCRIBE tribute_messages;
-- Look for: photo_url, user_id, guest_name, message, is_approved

-- tribute_photos should have:
DESCRIBE tribute_photos;
-- Look for: uploader_type, uploader_user_id, uploader_name

-- tribute_rsvp should have:
DESCRIBE tribute_rsvp;
-- Look for: guest_email, guest_phone, number_of_guests, attendance_type
```

**Test Data:**
```sql
-- Insert test message with photo:
INSERT INTO tribute_messages (tribute_id, guest_name, message, photo_url, is_approved)
VALUES (1, 'Test User', 'Test message', 'http://localhost/.../test.jpg', 1);

-- Insert test family photo:
INSERT INTO tribute_photos (tribute_id, photo_url, photo_description, uploader_type, uploader_user_id, uploader_name, is_approved)
VALUES (1, 'http://localhost/.../test.jpg', 'Test family photo', 'family', 1, 'John Doe', 1);

-- Insert test RSVP:
INSERT INTO tribute_rsvp (tribute_id, guest_name, guest_phone, guest_email, number_of_guests, attendance_type)
VALUES (1, 'Jane Smith', '555-1234', 'jane@example.com', 2, 'in-person');
```

---

## 🎯 Complete Test Checklist

### Setup:
- [ ] Database schema updated (run update_schema.php)
- [ ] XAMPP Apache & MySQL running
- [ ] Frontend dev server running (port 5175)
- [ ] Logged in as tribute creator

### Feature 1: Tribute Wall + Candles
- [ ] Upload message without photo
- [ ] Upload message with photo
- [ ] See photo displayed in message card
- [ ] See "Candle Lit" badge
- [ ] Verify candle count increased
- [ ] Delete message (family only)

### Feature 2: Family Gallery
- [ ] See "Family Gallery" section
- [ ] Upload form visible (family only)
- [ ] Upload photo with caption
- [ ] Photo appears in grid
- [ ] Caption and uploader name show
- [ ] Delete photo (family only)
- [ ] Verify guests don't see upload form

### Feature 3: Bank Details
- [ ] Click "I Want to Donate"
- [ ] Bank details expand
- [ ] Account info shows
- [ ] QR code displays
- [ ] Click again to hide

### Feature 4: Portrait Photo
- [ ] Create tribute with portrait
- [ ] Portrait displays in hero circle
- [ ] Portrait shows as background
- [ ] Default shows if no photo

### Feature 5: RSVP Management
- [ ] Submit RSVP as guest
- [ ] See RSVP count in statistics
- [ ] Click "View All RSVPs" (family only)
- [ ] Modal opens with list
- [ ] Export CSV downloads
- [ ] CSV contains all data

### Feature 6: Family Moderation
- [ ] Delete message button visible (family only)
- [ ] Delete photo button visible (family only)
- [ ] RSVP list access (family only)
- [ ] All confirmation dialogs work
- [ ] All deletions persist after refresh

---

## 🚨 Emergency Debug Commands

**Check if backend is working:**
```
http://localhost/smart_funeral_system/backend/getTribute.php?id=1
```
Should return JSON with tribute data.

**Check if file uploads work:**
Test upload manually in Postman:
```
POST http://localhost/smart_funeral_system/backend/uploadFile.php
Body: form-data
Key: photo (file)
Value: [select image]
```

**Check database connection:**
```
http://localhost/phpmyadmin
Database: smart_funeral_system
```

**Check frontend console:**
```
F12 → Console tab
Look for red errors
Common: "Failed to fetch", "404 Not Found", "CORS error"
```

**Clear browser cache:**
```
Ctrl+Shift+Delete → Clear all
Or Ctrl+Shift+R to hard refresh
```

---

## 📞 Support Checklist

If something doesn't work:

1. **Check Console** (F12)
   - Look for red errors
   - Check Network tab for failed requests

2. **Check Database**
   - Run update_schema.php
   - Verify columns exist
   - Check data is being inserted

3. **Check Backend**
   - Visit API URLs directly
   - Check Apache error logs
   - Verify PHP files have no syntax errors

4. **Check Frontend**
   - Dev server running?
   - Correct port (5175)?
   - No build errors?

5. **Check Permissions**
   - Is user logged in?
   - Is userRole set correctly?
   - Does user.id match tribute.creator_user_id?

---

## ✅ Success Criteria

All features working when:

✓ Can post messages with photos
✓ Photos display in tribute wall
✓ Candle count increases automatically
✓ Family can upload to family gallery
✓ Family can delete photos and messages
✓ Family can view RSVP list
✓ Can export RSVP list to CSV
✓ Bank details toggle works
✓ Portrait photo displays correctly
✓ All permissions enforced (family vs guest)

---

**Ready to test! 🚀**

Start with: http://localhost:5175/tribute/1

