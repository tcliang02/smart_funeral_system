# 📸 Tribute Photo Columns in Database

## Current Database Structure

Based on your database schema, here are the photo-related columns:

### 1. `tributes` Table - Main Photo

**Column:** `photo_url` (VARCHAR 255)
- **Purpose:** Stores the main/portrait photo URL for the tribute
- **Location:** `tributes.photo_url`
- **Used for:** Main portrait photo displayed on tribute page

**Note:** Some setup scripts mention `portrait_photo` column, but the actual database uses `photo_url`.

### 2. `tribute_photos` Table - Photo Gallery

**Table:** `tribute_photos`
- **Purpose:** Stores multiple photos in a gallery for each tribute
- **Columns:**
  - `photo_id` - Primary key
  - `tribute_id` - Links to tributes table
  - `photo_url` - Path to uploaded image
  - `caption` - Optional photo description
  - `uploaded_by` - User who uploaded
  - `created_at` - Upload timestamp

## How Photos Are Stored

### Currently (Local Storage):
- **Path format:** `uploads/tributes/portrait_xxx.jpg`
- **Database value:** `uploads/tributes/portrait_xxx.jpg` (relative path)
- **Served via:** `/api/uploads/tributes/portrait_xxx.jpg` (Next.js API route)

### Future (Supabase Storage - Recommended):
- **Path format:** Supabase Storage URL
- **Database value:** Full Supabase Storage URL
- **Example:** `https://[project].supabase.co/storage/v1/object/public/tribute-images/tributes/portrait_xxx.jpg`

## Current API Routes

✅ **getTributeById** - Returns `photo_url` as `portrait_photo` for frontend compatibility
✅ **createTribute** - Accepts `portrait_photo` input, saves to `photo_url` column
✅ **updateTribute** - Updates `photo_url` column

## Frontend Usage

The frontend uses `portrait_photo` but the database column is `photo_url`. The API routes handle this mapping:

```typescript
// API returns both for compatibility
{
  photo_url: "...",      // Database column name
  portrait_photo: "...", // Frontend expects this
}
```

## Summary

✅ **Yes, there IS a column for photos:**
- **Main photo:** `tributes.photo_url` (stores portrait/main photo)
- **Gallery photos:** `tribute_photos.photo_url` (stores multiple gallery photos)

✅ **Photos are currently stored:**
- **Locally:** In `uploads/tributes/` directory
- **Database:** Path stored in `photo_url` column
- **Served via:** Next.js API route `/api/uploads/...`

## Next Steps for Production

For Vercel deployment, you should migrate images to Supabase Storage:

1. **Upload new images** → Supabase Storage
2. **Update database** → Store Supabase URLs in `photo_url` column
3. **Migrate existing images** → Use migration script to move from local to Supabase

---

**Your photos ARE saved in the database - the `photo_url` column stores the path/URL!** ✅

