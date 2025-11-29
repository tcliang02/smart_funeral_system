# Profile Management System - Complete Guide

## 📋 Overview

This feature allows **family members** and **service providers** to manage their profile information, update details, and delete/deactivate their accounts.

---

## 🎯 Features Implemented

### For Family & Attendee Accounts:
- ✅ View profile details
- ✅ Update personal information (name, email, phone, address)
- ✅ View account statistics (tributes created, bookings made)
- ✅ Soft delete account (deactivation)
- ✅ Password confirmation for account deletion

### For Service Provider Accounts:
- ✅ View comprehensive business profile
- ✅ Update business information (company name, description, contact details)
- ✅ Manage location details (address, city, state, postal code)
- ✅ Update social media links (Facebook, Instagram)
- ✅ Set operating hours and services offered
- ✅ Soft delete account (deactivates provider and all packages)
- ✅ Protection against deletion with active bookings

---

## 📁 Files Created/Modified

### Database Migration:
- **backend/profile_management_migration.sql**
  - Adds new columns to `users` table: `address`, `profile_picture`, `updated_at`, `is_active`
  - Adds new columns to `service_provider` table: `business_registration`, `operating_hours`, `services_offered`, `facebook_url`, `instagram_url`
  - Creates `profile_activity_log` table for audit trail
  - Adds necessary indexes for better performance

### Backend API Endpoints:

**Family Profile Management:**
- **backend/getFamilyProfile.php** - Retrieve family/attendee profile
- **backend/updateFamilyProfile.php** - Update family/attendee profile
- **backend/deleteFamilyAccount.php** - Delete/deactivate family account

**Provider Profile Management:**
- **backend/updateProviderProfile.php** - Enhanced comprehensive provider profile update
- **backend/deleteProviderAccount.php** - Delete/deactivate provider account
- (backend/getProviderProfile.php - Already exists)

### Frontend Components:
- **frontend/my-app/src/pages/ProfileSettings.jsx** - Main profile management page
- **frontend/my-app/src/pages/ProfileSettings.css** - Styling for profile page
- **frontend/my-app/src/App.jsx** - Added route for `/profile-settings`
- **frontend/my-app/src/components/Navbar.jsx** - Added "Profile" button

---

## 🗄️ Database Changes

### 1. Run the Migration Script

Execute this SQL file in phpMyAdmin or HeidiSQL:

```bash
backend/profile_management_migration.sql
```

This will:
- Add new columns to existing tables (non-destructive)
- Create profile_activity_log table
- Add necessary indexes
- Update existing records with default values

### 2. New Database Structure

#### users table (enhanced):
```sql
- user_id (INT, PRIMARY KEY)
- name (VARCHAR 100)
- email (VARCHAR 100, UNIQUE)
- password (VARCHAR 255)
- phone (VARCHAR 20)
- address (TEXT) -- NEW
- profile_picture (VARCHAR 255) -- NEW
- role (ENUM: family, attendee, provider, admin)
- is_active (BOOLEAN) -- NEW
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP) -- NEW
```

#### service_provider table (enhanced):
```sql
- provider_id (INT, PRIMARY KEY)
- user_id (INT, FOREIGN KEY)
- company_name (VARCHAR 200)
- business_type (VARCHAR 100)
- business_registration (VARCHAR 100) -- NEW
- description (TEXT)
- address (TEXT)
- city (VARCHAR 100)
- state (VARCHAR 100)
- postal_code (VARCHAR 20)
- phone (VARCHAR 20)
- email (VARCHAR 100)
- website (VARCHAR 200)
- operating_hours (TEXT) -- NEW
- services_offered (TEXT) -- NEW
- facebook_url (VARCHAR 255) -- NEW
- instagram_url (VARCHAR 255) -- NEW
- logo (VARCHAR 255)
- rating (DECIMAL 3,2)
- total_reviews (INT)
- is_verified (BOOLEAN)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### profile_activity_log table (NEW):
```sql
- log_id (INT, PRIMARY KEY AUTO_INCREMENT)
- user_id (INT, FOREIGN KEY → users)
- action_type (ENUM: profile_update, password_change, account_deactivation, etc.)
- action_details (TEXT - JSON format)
- ip_address (VARCHAR 45)
- user_agent (TEXT)
- created_at (TIMESTAMP)
```

---

## 🔌 API Endpoints

### Family Profile Management

#### 1. Get Family Profile
```
GET /backend/getFamilyProfile.php?user_id=123
```

**Response:**
```json
{
  "success": true,
  "profile": {
    "user_id": 123,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+60123456789",
    "address": "123 Main St, KL",
    "profile_picture": "uploads/profiles/john.jpg",
    "profile_picture_url": "http://localhost/smart_funeral_system/uploads/profiles/john.jpg",
    "role": "family",
    "is_active": true,
    "created_at": "2025-01-15 10:30:00",
    "updated_at": "2025-01-20 14:45:00",
    "tribute_count": 2,
    "booking_count": 3
  }
}
```

#### 2. Update Family Profile
```
POST /backend/updateFamilyProfile.php
Content-Type: application/json
```

**Request Body:**
```json
{
  "user_id": 123,
  "name": "John Doe Updated",
  "email": "john.new@example.com",
  "phone": "+60987654321",
  "address": "456 New Street, Kuala Lumpur"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

#### 3. Delete Family Account
```
POST /backend/deleteFamilyAccount.php
Content-Type: application/json
```

**Request Body:**
```json
{
  "user_id": 123,
  "password": "user_password_here",
  "permanent": false,  // false = soft delete, true = permanent
  "reason": "No longer needed"
}
```

**Response (Soft Delete):**
```json
{
  "success": true,
  "message": "Account deactivated successfully",
  "type": "soft_delete",
  "note": "Account can be reactivated by contacting support"
}
```

### Provider Profile Management

#### 1. Update Provider Profile
```
POST /backend/updateProviderProfile.php
Content-Type: application/json
```

**Request Body:**
```json
{
  "provider_id": 1,
  "company_name": "Updated Funeral Home",
  "business_type": "Full Service Funeral Provider",
  "business_registration": "SSM12345678",
  "description": "Compassionate funeral services...",
  "address": "123 Memorial Ave",
  "city": "Kuala Lumpur",
  "state": "Wilayah Persekutuan",
  "postal_code": "50000",
  "phone": "+60321234567",
  "email": "contact@funeral.com",
  "website": "https://www.funeral.com",
  "operating_hours": "Mon-Fri: 9AM-6PM, Sat: 10AM-4PM",
  "services_offered": "[\"Traditional Burial\", \"Cremation\", \"Memorial Services\"]",
  "facebook_url": "https://facebook.com/funeralhome",
  "instagram_url": "https://instagram.com/funeralhome"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Provider profile updated successfully"
}
```

#### 2. Delete Provider Account
```
POST /backend/deleteProviderAccount.php
Content-Type: application/json
```

**Request Body:**
```json
{
  "provider_id": 1,
  "password": "provider_password",
  "permanent": false,
  "reason": "Closing business"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Provider account deactivated successfully",
  "type": "soft_delete",
  "note": "Account can be reactivated by contacting support"
}
```

**Error (Active Bookings):**
```json
{
  "success": false,
  "message": "Cannot delete account with active bookings. Please complete or cancel all pending bookings first.",
  "active_bookings": 3
}
```

---

## 🎨 Frontend Usage

### Accessing Profile Settings

1. **Login to any account** (family, attendee, or provider)
2. **Click the "⚙️ Profile" button** in the navigation bar
3. **View and edit your profile information**
4. **Click "Save Changes"** to update
5. **Optional:** Use "Delete Account" in the danger zone

### Profile Page Features:

**Left Sidebar:**
- Account statistics (role, member since, tributes, bookings)
- Danger zone with delete button

**Right Form Section:**
- **Family accounts:** Name, email, phone, address
- **Provider accounts:** 
  - Business info (company name, type, registration)
  - Contact details (address, city, state, postal code, phone, email)
  - Online presence (website, Facebook, Instagram)
  - Operating hours and services

**Form Actions:**
- "Save Changes" - Submit updates
- "Reset" - Reload original data

**Delete Modal:**
- Password confirmation required
- Soft delete by default (can be reactivated)
- Warning message shown

---

## 🔒 Security Features

1. **Password Confirmation:** Required for account deletion
2. **Email Uniqueness Validation:** Prevents duplicate emails
3. **Role-Based Access:** Only correct role can access respective endpoints
4. **Soft Delete by Default:** Accounts deactivated, not deleted
5. **Activity Logging:** All profile changes tracked in `profile_activity_log`
6. **Active Booking Protection:** Providers with active bookings cannot delete accounts

---

## 🧪 Testing Checklist

### Family Account Testing:
- [ ] Navigate to http://localhost/smart_funeral_system/frontend/my-app/profile-settings
- [ ] Login as family member
- [ ] View profile statistics (tributes, bookings)
- [ ] Update name, email, phone, address
- [ ] Click "Save Changes" and verify success message
- [ ] Click "Reset" and verify form resets
- [ ] Click "Delete Account" and cancel
- [ ] Click "Delete Account", enter password, confirm deletion
- [ ] Verify account is deactivated (is_active = false in database)
- [ ] Try logging in again (should fail for deactivated account)

### Provider Account Testing:
- [ ] Login as service provider
- [ ] View provider profile
- [ ] Update business information (company name, description)
- [ ] Update contact details (address, city, state, phone, email)
- [ ] Update website and social media links
- [ ] Update operating hours
- [ ] Save changes and verify
- [ ] Create an active booking first
- [ ] Try to delete account → should show error about active bookings
- [ ] Complete/cancel the booking
- [ ] Delete account successfully
- [ ] Verify provider is_active = false
- [ ] Verify all packages are deactivated (is_active = false)

### Database Verification:
```sql
-- Check family profile update
SELECT * FROM users WHERE user_id = 123;

-- Check provider profile update
SELECT * FROM service_provider WHERE provider_id = 1;

-- Check activity log
SELECT * FROM profile_activity_log WHERE user_id = 123 ORDER BY created_at DESC;

-- Check soft-deleted accounts
SELECT user_id, name, email, role, is_active 
FROM users 
WHERE is_active = FALSE;

-- Check deactivated providers
SELECT provider_id, company_name, is_active 
FROM service_provider 
WHERE is_active = FALSE;
```

---

## 📝 Common Issues & Solutions

### Issue 1: "User ID is required"
**Solution:** Ensure user is logged in and localStorage has user data

### Issue 2: "Email address is already in use"
**Solution:** Choose a different email or keep the existing one

### Issue 3: "Cannot delete account with active bookings"
**Solution:** Provider must complete or cancel all pending bookings first

### Issue 4: Profile doesn't load
**Solution:** 
- Check network tab for API errors
- Verify user_id or provider_id exists in database
- Check backend endpoint is accessible

### Issue 5: Changes not saving
**Solution:**
- Check console for JavaScript errors
- Verify API endpoint is working (test in Postman)
- Check database permissions

---

## 🚀 Future Enhancements

Potential improvements for the profile management system:

1. **Profile Picture Upload:**
   - Add file upload functionality
   - Image cropping and resizing
   - Store in `uploads/profiles/` directory

2. **Password Change Feature:**
   - Separate endpoint for password updates
   - Old password verification
   - Password strength validation

3. **Email Verification:**
   - Send verification email on email change
   - Confirm new email before updating

4. **Account Recovery:**
   - Reactivation request form
   - Admin approval for reactivation
   - Email notification on reactivation

5. **Two-Factor Authentication:**
   - Optional 2FA for enhanced security
   - SMS or email OTP

6. **Profile Completeness Indicator:**
   - Show percentage of profile completion
   - Encourage users to fill all fields

7. **Export Profile Data:**
   - Download profile information as JSON/PDF
   - GDPR compliance feature

---

## 📞 Support

If you encounter any issues:
1. Check the console for error messages
2. Verify database migration was run successfully
3. Ensure all backend files are uploaded
4. Check file permissions on server
5. Review API endpoint responses in Network tab

---

## ✅ Summary

The profile management system is now complete with:
- ✅ Database migration script
- ✅ 6 backend API endpoints
- ✅ Comprehensive frontend page
- ✅ Activity logging
- ✅ Soft delete functionality
- ✅ Security features
- ✅ Mobile responsive design

**Next Step:** Run the database migration and test the features!
