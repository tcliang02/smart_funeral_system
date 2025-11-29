# Database Usage Analysis

## Summary of Database Columns/Tables Status

### 1. **voice_chat_history table**
**Status:** ❌ **NOT BEING USED**

- Only mentioned in `analyze_voice_tables.php` (analysis script)
- No actual INSERT, SELECT, UPDATE queries found in backend
- Frontend does NOT interact with this table
- **Recommendation:** Can be safely dropped if not needed for future chat history feature

---

### 2. **voice_models table - `sample_duration` column**
**Status:** ✅ **BEING USED**

Found in:
- `backend/uploadVoiceSample.php` - Sets sample_duration when uploading voice
- `backend/test_voice_upload.php` - Test script uses it
- **Usage:** Stores the duration of the uploaded voice sample in seconds

**Recommendation:** Keep this column - it's actively used

---

### 3. **voice_models table - `quality_score` column**
**Status:** ❌ **NOT BEING USED**

- NOT found in any SELECT, INSERT, or UPDATE queries
- No backend script sets or reads this value
- Frontend doesn't use it
- **Recommendation:** Can be dropped - unused column

---

### 4. **tribute_rsvp table - `will_attend` column**
**Status:** ✅ **BEING USED (Backend mapping issue)**

**Current Situation:**
- **Database column:** `will_attend` (tinyint: 0 or 1)
- **Frontend uses:** `attendance_type` (values: 'physical', 'virtual', 'yes', 'no')
- **Backend mapping:** `submitRSVP.php` converts `attendance_type` → `will_attend`
  ```php
  $will_attend = ($input['attendance_type'] ?? 'yes') === 'yes' ? 1 : 0;
  ```

**Problem:** Frontend has 3 attendance options but database only stores YES/NO:
- Frontend: "Attending in Person", "Attending Virtually", (implied "Not Attending")
- Database: Just 1 (yes) or 0 (no)

**Current Frontend Options (TributePage.jsx line 1340-1341):**
```jsx
<option value="physical">Attending in Person</option>
<option value="virtual">Attending Virtually</option>
```

**Missing:** "Not Attending" option is NOT shown in the frontend dropdown!

**Recommendation:**
Either:
1. Add "Not Attending" option to frontend:
   ```jsx
   <option value="no">Not Attending</option>
   ```
2. Or change database to store attendance_type directly as VARCHAR:
   - Change `will_attend` (tinyint) → `attendance_type` (varchar)
   - Store: 'physical', 'virtual', 'not-attending'

---

## Detailed File References

### will_attend usage:
- `backend/getRSVPList.php` (line 59, 81-82): Queries will_attend column
- `backend/submitRSVP.php` (line 56, 65, 76): Inserts will_attend value
- Frontend sends: `attendance_type: rsvpForm.type`
- Backend converts: `attendance_type` → `will_attend` (0/1)

### Frontend RSVP Form Issue:
- Shows only 2 options: "Attending in Person" and "Attending Virtually"
- Does NOT show "Not Attending" option
- All "physical" and "virtual" responses are saved as `will_attend = 1`
- No way for users to select "Not Attending" in the current UI

---

## Recommended Actions

1. ✅ **Keep:** `voice_models.sample_duration` - actively used
2. ❌ **Drop:** `voice_chat_history` table - not used
3. ❌ **Drop:** `voice_models.quality_score` - not used
4. ⚠️ **Fix:** Add "Not Attending" option to RSVP frontend dropdown OR change database schema to match frontend options

