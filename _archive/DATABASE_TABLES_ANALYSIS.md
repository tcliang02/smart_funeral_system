# Database Tables Analysis

## 1. tribute_photos Table

**Status:** ✅ **BEING USED**

**Used in:**
- `getTribute.php` - Fetches photos for tribute gallery
- `uploadTributePhoto.php` - Uploads new photos to tribute
- Frontend tribute pages display photo galleries

**Purpose:** Stores family/memorial photos uploaded by users to tribute pages (photo gallery feature)

**Columns:**
- `photo_id` - Primary key
- `tribute_id` - Links to tributes table
- `photo_url` - Path to uploaded image
- `caption` - Optional photo description
- `uploaded_by` - User who uploaded
- `created_at` - Upload timestamp

**Recommendation:** ✅ **KEEP** - Active feature being used

---

## 2. tributes.booking_id Column

**Status:** ⚠️ **OPTIONAL/LEGACY**

**Current Usage:**
- `createTribute.php` - INSERTS booking_id when creating tribute
- Only used if tribute is created FROM a booking (funeral service booking)

**Two Ways to Create Tribute:**
1. **With Booking:** User books funeral service → creates tribute → `booking_id` is set
2. **Without Booking:** User directly creates tribute (free memorial page) → `booking_id` is NULL

**Finding:** 
- Column exists but is **NULLABLE**
- You can create tributes WITHOUT booking
- It's an **optional link** to the bookings system

**Recommendation:** ✅ **KEEP** - Allows linking tributes to funeral service bookings when applicable

---

## 3. tributes.slug Column

**Status:** ✅ **BEING USED**

**Purpose:** URL-friendly identifier for accessing tribute pages

**Example:**
- Deceased Name: "John Doe"
- Slug: `john-doe-1234`
- URL: `yoursite.com/tribute/john-doe-1234`

**How it works:**
```php
// From createTribute.php and updateTribute.php
$slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $deceased_name)));
$slug = $slug . '-' . uniqid();
```

**Benefits:**
1. **SEO-friendly URLs:** `/tribute/john-doe-1234` instead of `/tribute?id=123`
2. **Shareable links:** Easy to remember and share
3. **Unique:** Each tribute has unique slug even with same name

**Used in:**
- `updateTribute.php` - Generates and stores slug
- Frontend routing - Access tributes by slug in URL
- Sharing links on social media

**Recommendation:** ✅ **KEEP** - Essential for clean URLs and sharing

---

## Summary

| Item | Status | Reason | Action |
|------|--------|--------|--------|
| `tribute_photos` table | ✅ Used | Photo gallery feature | KEEP |
| `tributes.booking_id` | ⚠️ Optional | Links to funeral booking (when applicable) | KEEP (nullable) |
| `tributes.slug` | ✅ Used | SEO-friendly URLs | KEEP |

## Booking Flow Example:

**Scenario 1 - With Booking:**
```
User books funeral → Creates tribute → booking_id = 27
Tribute created for deceased person
booking_id links to the funeral service booking
```

**Scenario 2 - Without Booking:**
```
User creates tribute directly → No booking → booking_id = NULL
Free memorial page with no funeral service
```

Both scenarios work! The `booking_id` is optional.

