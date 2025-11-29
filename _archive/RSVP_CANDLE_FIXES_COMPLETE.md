# 🎯 RSVP & CANDLE LIGHTING FIXES - COMPLETE

## Issues Fixed

### ❌ Issue 1: RSVP Viewing Permission Error
**Error:** "Only family members can view RSVP list" even though user IS the family member

**Root Cause:** 
- Frontend was using `user.id` instead of `user.user_id || user.id`
- The user object in localStorage has `user_id` field, not `id`
- Other parts of the code already use the compatibility pattern `user.user_id || user.id`

**Solution:**
Updated **frontend/my-app/src/pages/TributePage.jsx**:
- Fixed `fetchRSVPList()` function to use `user.user_id || user.id`
- Fixed `fetchRSVPListSilently()` function to use `user.user_id || user.id`

---

### ❌ Issue 2: Candle Lighting Column Mismatch
**Error:** "Unknown column 'lighter_user_id' in 'field list'"

**Root Cause:**
Column name mismatch between code and actual database:

**Code Expected:**
```php
INSERT INTO tribute_candles (
    tribute_id,
    lighter_user_id,    // ❌ Doesn't exist
    lighter_name,       // ❌ Doesn't exist
    candle_message      // ❌ Doesn't exist
)
```

**Actual Table Structure:**
```sql
tribute_candles columns:
- candle_id (int, PK, auto_increment)
- tribute_id (int, FK)
- lit_by (varchar(100), NOT NULL)        ✅ Store name here
- message (text, nullable)                ✅ Store message here
- created_at (timestamp)
```

**Solution:**
Updated **backend/lightCandle.php**:
- Changed INSERT to use actual columns: `lit_by`, `message`
- Removed references to `lighter_user_id`, `lighter_name`, `candle_message`
- Added field mapping: `lighter_name` → `lit_by`, `candle_message` → `message`
- Set default value "Anonymous" for `lit_by` if not provided

---

## Files Modified

### 1. backend/lightCandle.php
**Changed:**
```php
// OLD (wrong columns)
INSERT INTO tribute_candles (
    tribute_id, lighter_user_id, lighter_name, candle_message
) VALUES (?, ?, ?, ?)

// NEW (correct columns)
INSERT INTO tribute_candles (
    tribute_id, lit_by, message
) VALUES (?, ?, ?)
```

**Field Mapping Added:**
```php
$lighter_name = $input['lighter_name'] ?? 'Anonymous';
$candle_message = $input['candle_message'] ?? $input['message'] ?? '';
```

### 2. frontend/my-app/src/pages/TributePage.jsx
**Changed in `fetchRSVPList()`:**
```jsx
// OLD
const response = await fetch(
  `...getRSVPList.php?tribute_id=${id}&user_id=${user.id}`
);

// NEW
const userId = user.user_id || user.id; // Support both field names
const response = await fetch(
  `...getRSVPList.php?tribute_id=${id}&user_id=${userId}`
);
```

**Changed in `fetchRSVPListSilently()`:**
```jsx
// OLD
console.log("🔍 Fetching RSVP List:", { tribute_id: id, user_id: user.id });
const response = await fetch(
  `...getRSVPList.php?tribute_id=${id}&user_id=${user.id}`
);

// NEW
const userId = user.user_id || user.id; // Support both field names
console.log("🔍 Fetching RSVP List:", { tribute_id: id, user_id: userId });
const response = await fetch(
  `...getRSVPList.php?tribute_id=${id}&user_id=${userId}`
);
```

---

## Database Schema Reference

### tribute_candles (Verified)
```sql
CREATE TABLE tribute_candles (
    candle_id INT(11) PRIMARY KEY AUTO_INCREMENT,
    tribute_id INT(11) NOT NULL,
    lit_by VARCHAR(100) NOT NULL,          -- Name of person lighting candle
    message TEXT,                           -- Optional candle message
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tribute_id) REFERENCES tributes(tribute_id)
);
```

### tribute_rsvp (Verified)
```sql
CREATE TABLE tribute_rsvp (
    rsvp_id INT(11) PRIMARY KEY AUTO_INCREMENT,
    tribute_id INT(11) NOT NULL,
    attendee_name VARCHAR(100) NOT NULL,
    attendee_email VARCHAR(100),
    attendee_phone VARCHAR(20),
    will_attend TINYINT(1) DEFAULT 1,
    number_of_guests INT(11) DEFAULT 1,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tribute_id) REFERENCES tributes(tribute_id)
);
```

---

## Testing Instructions

### Test 1: RSVP Viewing ✅
1. Log in as user_id=15 (user1)
2. Navigate to tribute ID 2 (created by user 15)
3. Scroll to RSVP section
4. Click "View RSVP List" button
5. **Expected:** RSVP list should display (no permission error)
6. **Expected:** Console should show: "✅ RSVP List set: [...]"

### Test 2: Candle Lighting ✅
1. Stay on tribute page
2. Scroll to tribute wall section
3. Fill in message form with name and message
4. Check the "Light a virtual candle" checkbox
5. Click "Post Message & Light Candle"
6. **Expected:** Success message appears
7. **Expected:** Candle count increases
8. **Expected:** No "Unknown column 'lighter_user_id'" error

### Test 3: Message Only (without candle) ✅
1. Fill in message form
2. DO NOT check the candle checkbox
3. Click "Post Message"
4. **Expected:** Message posts successfully
5. **Expected:** Candle count stays the same

---

## Pattern Summary

This fix follows the established pattern from previous fixes:

1. **Check actual table structure** using DESCRIBE query
2. **Compare with code expectations** to find mismatches
3. **Update INSERT/SELECT statements** to use actual column names
4. **Add field mapping** for backward compatibility
5. **Test feature** to verify fix

### Consistent Field Mapping Pattern
Throughout the system, we now have:
- `user.user_id || user.id` for user identification
- Database column names → Frontend field names in getTribute.php
- Frontend field names → Database column names in write operations
- Default values for optional fields

---

## Status: ✅ COMPLETE

Both RSVP viewing and candle lighting should now work correctly!

**RSVP Fix:** User ID compatibility resolved ✅  
**Candle Fix:** Column names aligned with actual database ✅  
**Testing:** Ready for user verification ✅
