# 🚀 Major Feature Implementation Plan

## Features to Implement:

### ✅ **Feature 1: Combined Tribute Wall + Light Candle**
**Current**: Separate tribute wall and candle lighting
**New**: When contributing to tribute wall:
- User uploads photo (optional)
- User writes message (required)
- User enters name
- **Automatically lights a candle** when submitted
- Display shows: photo, message, name, date, candle icon

**Changes Needed**:
- Merge message form with photo upload
- Update `addMessage.php` to accept photo upload
- Automatically call `lightCandle.php` after message submission
- Update UI to show candle icon with each message
- Database: `tribute_messages` table already has photo capability

---

### ✅ **Feature 2: Family Gallery Section**
**Purpose**: Family-only photo gallery (separate from public photos)
**Requirements**:
- Only family members can upload
- Only family members can delete
- Shows in separate "Family Gallery" section
- Uses existing `tribute_photos` table with `uploader_type='family'` flag

**Changes Needed**:
- Add family photo upload form (family view only)
- Filter gallery by uploader type
- Add delete button for family photos (family only)
- New backend: `uploadFamilyPhoto.php`, `deleteFamilyPhoto.php`

---

### ✅ **Feature 3: Bank Details Not Displaying**
**Issue**: "I want to donate" button clicked but bank info doesn't show
**Debug needed**:
- Check if `tribute.bank_account_number` exists
- Check if `showBank` state toggles
- Verify AnimatePresence works

---

### ✅ **Feature 4: Portrait Photo Still Not Displaying**
**Issue**: Uploaded photos not showing
**Need to check**:
- Verify `getImageUrl()` function is being called
- Check if portrait_photo field has value in database
- Console log the photo URL
- Check file upload path

---

### ✅ **Feature 5: View RSVP Submissions (Family Only)**
**Purpose**: Family can see who RSVP'd
**Requirements**:
- New section "RSVP Attendees" (family view only)
- Shows list of all RSVPs with:
  - Name, phone, email, guests, attendance type, date
- Ability to export/download list
- Shows total count

**Changes Needed**:
- Get all RSVPs from `tribute_rsvp` table
- New API endpoint: `getRSVPList.php`
- Family-only UI section
- Export functionality (CSV/Excel)

---

### ✅ **Feature 6: Family Moderation Controls**
**Purpose**: Family can manage tribute content
**Features**:
- **Delete messages** (if harmful/inappropriate)
- **Approve/reject messages** (if moderation enabled)
- **Delete photos** (family gallery and user photos)
- **Edit tribute details** (name, dates, story, etc.)
- **Moderate candles** (optional - delete spam candles)

**Changes Needed**:
- Add "Edit Tribute" button (family only)
- Add delete button on each message (family only)
- Add delete button on photos (family only)
- New APIs: `deleteMessage.php`, `deletePhoto.php`, `updateTribute.php`
- Confirmation dialogs for deletions

---

## Implementation Priority:

**Phase 1 - Critical Fixes** (Do First):
1. ✅ Fix bank details display (Feature 3)
2. ✅ Fix portrait photo display (Feature 4)

**Phase 2 - Core Features**:
3. ✅ Combined Tribute Wall + Candle (Feature 1)
4. ✅ Family Gallery Section (Feature 2)

**Phase 3 - Management Features**:
5. ✅ View RSVP List (Feature 5)
6. ✅ Family Moderation (Feature 6)

---

## Database Changes Needed:

### `tribute_messages` table:
```sql
-- Already has photo support, verify columns exist:
ALTER TABLE tribute_messages 
ADD COLUMN IF NOT EXISTS photo_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS lights_candle TINYINT(1) DEFAULT 1;
```

### `tribute_photos` table:
```sql
-- Add uploader type to distinguish family vs public photos
ALTER TABLE tribute_photos 
ADD COLUMN IF NOT EXISTS uploader_type ENUM('guest', 'family') DEFAULT 'guest',
ADD COLUMN IF NOT EXISTS uploader_user_id INT,
ADD FOREIGN KEY (uploader_user_id) REFERENCES users(id);
```

### `tribute_candles` table:
```sql
-- Link candles to messages (optional)
ALTER TABLE tribute_candles
ADD COLUMN IF NOT EXISTS message_id INT,
ADD FOREIGN KEY (message_id) REFERENCES tribute_messages(id);
```

---

## API Endpoints to Create:

1. `uploadFamilyPhoto.php` - Family photo upload
2. `deleteFamilyPhoto.php` - Delete family photo
3. `getRSVPList.php` - Get all RSVP submissions
4. `deleteMessage.php` - Delete tribute message
5. `deletePhoto.php` - Delete public photo
6. `updateTribute.php` - Update tribute details
7. `moderateMessage.php` - Approve/reject message

---

## UI Components to Create/Update:

1. **TributeWallWithPhoto.jsx** - Combined form (photo + message)
2. **FamilyGallery.jsx** - Family-only photo gallery
3. **RSVPList.jsx** - RSVP attendees list (family view)
4. **ModerationPanel.jsx** - Family controls panel
5. **EditTributeModal.jsx** - Edit tribute form

---

Let's start implementation now! 🚀
