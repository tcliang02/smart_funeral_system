# 🎯 Quick Start Guide: Testing Feature 1

## ✅ What Was Just Implemented?

**Feature 1: Combined Tribute Wall + Candle Lighting with Photo Upload**

### What's New:
1. **Photo Upload in Tribute Wall** - Visitors can now attach photos to messages
2. **Auto Candle Lighting** - Posting a message automatically lights a candle 🕯️
3. **Enhanced Message Cards** - Display photos, candle badges, and better styling
4. **Family Moderation** - Family members can delete messages
5. **"Candle Lit" Badges** - Every message shows it lit a candle

---

## 🚀 How to Test Right Now

### Step 1: Access a Tribute Page
```
1. Open: http://localhost:5174
2. Click on any existing tribute
   OR
   Go directly to: http://localhost:5174/tribute/1
```

### Step 2: Test Photo Upload + Message
```
1. Scroll down to "Tribute Wall" section
2. You'll see the NEW form design with:
   - Purple gradient background
   - "Light a Candle" header with flame icon
   - Photo upload button

3. Fill in:
   Name: "Test User"
   Message: "Beautiful memories. Rest in peace."
   Photo: Click "Choose File" and select any image

4. Click: "Post Message & Light Candle 🕯️"

5. Watch for:
   ✅ Loading spinner appears
   ✅ Success message: "Your tribute message has been posted and a candle has been lit! 🕯️"
   ✅ New message card appears with your photo
   ✅ "Candle Lit" badge shows (orange badge with flame icon)
   ✅ Candle count increases in statistics section
```

### Step 3: Test Family Moderation
```
If you're logged in as the tribute creator:

1. Look at any message card
2. You should see a "Remove message" button at the bottom (red text)
3. Click it
4. Confirm deletion
5. Message disappears

If you're NOT the creator:
- Delete button won't appear (this is correct!)
```

---

## 🎨 What You'll See

### NEW Form Design:
```
┌─────────────────────────────────────────┐
│ 🔥 Light a Candle: Share a photo and   │
│    message to honor their memory 🕯️     │
├─────────────────────────────────────────┤
│ [Your Name *]      [Email (optional)]  │
│                                         │
│ [Write your message... *]               │
│                                         │
│ 📷 Add a Photo (Optional)              │
│ [Choose File] No file chosen            │
│                                         │
│ [Post Message & Light Candle 🕯️]       │
└─────────────────────────────────────────┘
```

### NEW Message Card Design:
```
┌─────────────────────────────────────────┐
│ [Full-width photo if uploaded]          │
│                                         │
│ "Your message text here in italic..."  │
│                                         │
│ 👤 John Doe  •  📅 Jan 15, 2025        │
│                         🔥 Candle Lit   │
│                                         │
│ ❌ Remove message (family only)         │
└─────────────────────────────────────────┘
```

---

## 📸 Example Messages to Try

### Message 1: With Photo
```
Name: Sarah Johnson
Message: "To live in the hearts we leave behind is not to die."
Photo: [Upload a memorial photo]
```

### Message 2: Without Photo
```
Name: Michael Chen
Message: "Thank you for the wonderful memories. You'll always be in our hearts."
Photo: [Leave empty]
```

### Message 3: Long Message
```
Name: Emily Rodriguez
Message: "I'll never forget the kindness you showed everyone. Your smile could light up any room. We miss you dearly and will honor your memory forever."
Photo: [Upload a candid photo]
```

---

## 🐛 If Something Doesn't Work

### Photos Not Showing?
```javascript
// Check browser console (F12):
console.log("Photo URL:", getImageUrl(tribute.portrait_photo));

// Should see:
// "Photo URL: http://localhost/smart_funeral_system/uploads/tributes/portrait_12345.jpg"

// NOT:
// "Photo URL: http://localhost/smart_funeral_system/http://localhost/..."
```

### Can't Delete Messages?
```
1. Make sure you're logged in
2. Make sure localStorage has user data:
   - Open Console (F12)
   - Type: localStorage.getItem("user")
   - Should see: {"id":1,"name":"..."}

3. Make sure you're the tribute creator:
   - Your user.id must match tribute.creator_user_id
```

### Candle Not Lighting?
```
Check Network tab (F12):
1. Should see 2 requests when posting message:
   - POST to uploadFile.php (if photo selected)
   - POST to addMessage.php
   - POST to lightCandle.php (auto-triggered)

2. All should return: {"success": true}
```

---

## 📊 Database Check (If Needed)

### Verify Message Was Saved:
```sql
-- Open phpMyAdmin: http://localhost/phpmyadmin
-- Run this query:

SELECT 
    id,
    tribute_id,
    guest_name,
    message,
    photo_url,
    created_at
FROM tribute_messages
ORDER BY created_at DESC
LIMIT 5;

-- You should see your test messages with photo_url values
```

### Check Candle Count:
```sql
SELECT COUNT(*) as total_candles 
FROM tribute_candles 
WHERE tribute_id = 1;

-- Should increase by 1 for each message posted
```

---

## ✨ Cool Things to Try

### 1. Multiple Photos Test
```
- Post 3-5 messages with different photos
- See how the wall looks with multiple photo messages
- Mix some with photos, some without
```

### 2. Mobile Test
```
- Open on phone or use Chrome DevTools mobile view
- Form should be responsive
- Photos should resize properly
- Buttons should be easy to tap
```

### 3. Large Photo Test
```
- Try uploading a photo > 5MB
- Should see alert: "Photo size must be less than 5MB"
- File input should be cleared
```

### 4. Moderation Test
```
- Post a test message
- Delete it
- Refresh page
- Message should stay deleted
```

---

## 🎯 Success Criteria

✅ Form has purple gradient background
✅ "Light a Candle" text visible with flame icon
✅ Photo upload input works
✅ Selected photo name appears with green checkmark
✅ Button text says "Post Message & Light Candle 🕯️"
✅ Loading state shows "Posting & Lighting Candle..."
✅ Success message appears after posting
✅ New message appears with photo (if uploaded)
✅ "Candle Lit" badge shows on message
✅ Candle count increases in statistics
✅ Delete button visible to family only
✅ Delete confirmation dialog appears
✅ Message disappears after deletion

---

## 🚀 Next Steps

Once you've tested Feature 1:

**Feature 2**: Family Gallery Section
- Separate gallery for family-only photos
- Album-style grid display
- Family upload + delete controls

**Feature 3**: Fix Bank Details Display
- Debug why bank info isn't showing
- Fix QR code display

**Feature 4**: RSVP Management
- View all RSVP submissions
- Export to CSV
- Family-only dashboard

**Feature 5**: Fix Portrait Photo Upload
- Debug photo path issues
- Ensure photos display correctly

---

## 📞 Need Help?

**Check Console Errors:**
```javascript
// Press F12, go to Console tab
// Look for red errors
// Common ones:
// - "Failed to fetch" = Backend not running
// - "404 Not Found" = Wrong API endpoint
// - "Unexpected token" = JSON parse error
```

**Check Network Requests:**
```javascript
// Press F12, go to Network tab
// Filter: XHR
// Click on each request to see:
// - Request payload (what you sent)
// - Response (what came back)
// - Status (should be 200 OK)
```

**Check Backend Logs:**
```
// Apache error log:
C:\xampp\apache\logs\error.log

// MySQL queries:
Enable in php.ini: log_queries = On
```

---

**Happy Testing! 🎉**

Let me know if you encounter any issues or when you're ready for Feature 2!

