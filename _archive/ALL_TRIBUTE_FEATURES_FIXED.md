# 🔧 FINAL FIXES - Candle Count & RSVP Column Alignment

## Issues Fixed

### ❌ Issue 1: Unknown column 'candle_count' in 'field list'
**Error:** When lighting a candle, the system tried to increment a non-existent `candle_count` column

**Root Cause:**
- `lightCandle.php` was executing: `UPDATE tributes SET candle_count = candle_count + 1`
- The `tributes` table does NOT have a `candle_count` column
- This feature is not being used (frontend just displays count, doesn't need database tracking)

**Solution:**
Removed the unnecessary candle count update from **backend/lightCandle.php**

---

### ❌ Issue 2: Unknown column 'guest_name' in 'field list'
**Error:** RSVP operations failed because code used wrong column names

**Root Cause:**
Column name mismatch between code and actual `tribute_rsvp` table:

**Code Expected:**
- `guest_name`
- `guest_phone`
- `guest_email`
- `attendance_type`
- `id`

**Actual Table Has:**
- `attendee_name` ✅
- `attendee_phone` ✅
- `attendee_email` ✅
- `will_attend` (tinyint 0/1) ✅
- `rsvp_id` ✅

**Solution:**
Fixed both **submitRSVP.php** and **getRSVPList.php** to use actual column names with field mapping

---

## Files Modified

### 1. backend/lightCandle.php ✅
**Removed unnecessary candle count update:**
```php
// REMOVED THIS LINE:
$conn->query("UPDATE tributes SET candle_count = candle_count + 1 WHERE tribute_id = " . $input['tribute_id']);

// Now just returns success without updating non-existent column
echo json_encode([
    'success' => true,
    'message' => 'Virtual candle lit successfully',
    'candle_id' => $candle_id
]);
```

### 2. backend/submitRSVP.php ✅
**Updated to use actual table columns:**
```php
// OLD (wrong columns)
INSERT INTO tribute_rsvp (
    tribute_id, guest_name, guest_phone, guest_email, 
    number_of_guests, attendance_type
) VALUES (?, ?, ?, ?, ?, ?)

// NEW (correct columns)
INSERT INTO tribute_rsvp (
    tribute_id, attendee_name, attendee_phone, attendee_email, 
    number_of_guests, will_attend, message
) VALUES (?, ?, ?, ?, ?, ?, ?)
```

**Added field mapping for compatibility:**
```php
$attendee_name = $input['guest_name'] ?? $input['attendee_name'] ?? 'Anonymous';
$attendee_phone = $input['guest_phone'] ?? $input['attendee_phone'] ?? '';
$attendee_email = $input['guest_email'] ?? $input['attendee_email'] ?? '';
$will_attend = ($input['attendance_type'] ?? 'yes') === 'yes' ? 1 : 0;
```

### 3. backend/getRSVPList.php ✅
**Updated SELECT to map database columns to frontend expectations:**
```php
// OLD (wrong columns)
SELECT id, guest_name, guest_phone, guest_email, 
       number_of_guests, attendance_type, created_at
FROM tribute_rsvp

// NEW (correct columns with mapping)
SELECT rsvp_id as id, 
       attendee_name as guest_name,
       attendee_phone as guest_phone,
       attendee_email as guest_email,
       number_of_guests, will_attend, message, created_at
FROM tribute_rsvp
```

---

## Database Schema Reference

### tribute_rsvp (Verified Structure)
```sql
CREATE TABLE tribute_rsvp (
    rsvp_id INT(11) PRIMARY KEY AUTO_INCREMENT,
    tribute_id INT(11) NOT NULL,
    attendee_name VARCHAR(100) NOT NULL,      -- NOT guest_name
    attendee_email VARCHAR(100),              -- NOT guest_email  
    attendee_phone VARCHAR(20),               -- NOT guest_phone
    will_attend TINYINT(1) DEFAULT 1,         -- NOT attendance_type (varchar)
    number_of_guests INT(11) DEFAULT 1,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tribute_id) REFERENCES tributes(tribute_id)
);
```

### tributes table (Candle Feature)
- ❌ Does NOT have `candle_count` column
- ✅ Has `allow_candles` column (to enable/disable feature)
- ✅ Candles are stored in `tribute_candles` table
- ℹ️ Frontend can count candles from `tribute_candles` if needed (no database counter required)

---

## Testing Instructions

### Test 1: Light a Candle ✅
1. Go to tribute page
2. Check "Light a virtual candle" checkbox
3. Fill in name and message
4. Click submit
5. **Expected:** Success message, no column errors
6. **Expected:** Candle saved to `tribute_candles` table

### Test 2: Submit RSVP ✅
1. Scroll to RSVP section
2. Fill in name, phone, email, number of guests
3. Select attendance type (yes/no)
4. Click submit
5. **Expected:** RSVP saved successfully
6. **Expected:** No "Unknown column 'guest_name'" error

### Test 3: View RSVP List ✅
1. As family member, click "View RSVP List"
2. **Expected:** List displays with all attendee information
3. **Expected:** Names, phones, emails display correctly

---

## Complete Fix Summary

All column name mismatches have been resolved:

| Feature | Code Used | Actual Column | Status |
|---------|-----------|---------------|--------|
| Candles - lighter name | `lighter_user_id`, `lighter_name` | `lit_by` | ✅ Fixed |
| Candles - message | `candle_message` | `message` | ✅ Fixed |
| Candles - count | `candle_count` | (doesn't exist) | ✅ Removed |
| RSVP - name | `guest_name` | `attendee_name` | ✅ Fixed |
| RSVP - phone | `guest_phone` | `attendee_phone` | ✅ Fixed |
| RSVP - email | `guest_email` | `attendee_email` | ✅ Fixed |
| RSVP - attendance | `attendance_type` | `will_attend` | ✅ Fixed |
| RSVP - ID | `id` | `rsvp_id` | ✅ Fixed |
| Messages - name | `guest_name` | `sender_name` | ✅ Fixed |
| Messages - email | `guest_email` | `sender_email` | ✅ Fixed |
| User permission | `user.id` | `user.user_id \|\| user.id` | ✅ Fixed |

---

## Status: ✅ ALL FIXES COMPLETE

**Candle Lighting:** Works without column errors ✅  
**RSVP Submission:** Uses correct columns ✅  
**RSVP Viewing:** Maps columns correctly ✅  
**No Unnecessary Updates:** Removed candle_count update ✅

All tribute page features should now work correctly! 🎉
