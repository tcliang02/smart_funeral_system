# ✅ USER ROLES UPDATED - 3 TYPES ONLY

## 🎯 Your 3 User Types

### 1. 👪 Family Member (Main User)
**Role in Database**: `family`  
**Purpose**: Primary user who needs funeral services  
**Permissions**:
- ✅ Order funeral services
- ✅ Browse and book packages
- ✅ Create and manage tributes
- ✅ Use AI chatbot for assistance
- ✅ View and track orders
- ✅ Access all features

**Navbar Shows**:
- Home
- Order Services
- Tribute
- AI Chatbot
- My Orders
- FAQs

---

### 2. 🙏 Funeral Attendee (Guest)
**Role in Database**: `attendee`  
**Purpose**: Friends/relatives attending funerals  
**Permissions**:
- ✅ View tributes/memorial pages
- ✅ Send condolence messages
- ✅ RSVP to funeral events
- ✅ Light virtual candles
- ✅ Upload tribute photos
- ❌ Cannot order services
- ❌ Cannot book packages

**Navbar Shows**:
- Home
- Tributes
- FAQs

---

### 3. ⚙️ Service Provider
**Role in Database**: `provider`  
**Purpose**: Funeral service businesses  
**Permissions**:
- ✅ Manage funeral packages
- ✅ View and manage bookings
- ✅ Update availability
- ✅ Access provider dashboard
- ❌ Cannot order services (they provide them)

**Navbar Shows**:
- Dashboard
- Packages
- FAQs

---

### 4. 👑 Admin (System Only)
**Role in Database**: `admin`  
**Purpose**: System administrators  
**Permissions**: Full system access

---

## 📊 Database Changes

### Updated Users Table
```sql
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('family', 'attendee', 'provider', 'admin') DEFAULT 'family',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Valid Roles
✅ **family** - Family Member (main user)  
✅ **attendee** - Funeral Attendee (guest)  
✅ **provider** - Service Provider  
✅ **admin** - Administrator

❌ ~~customer~~ - REMOVED  
❌ ~~guest~~ - REMOVED (now called "attendee")

---

## 🔄 Migration Steps for Existing Database

### Step 1: Update Database Schema
Run this SQL in HeidiSQL or phpMyAdmin:

```sql
-- Update the users table to use new roles
ALTER TABLE users MODIFY COLUMN role ENUM('family', 'attendee', 'provider', 'admin') DEFAULT 'family';

-- Convert existing 'customer' roles to 'family'
UPDATE users SET role = 'family' WHERE role = 'customer';

-- If you have any 'guest' roles, convert to 'attendee'
UPDATE users SET role = 'attendee' WHERE role = 'guest';
```

### Step 2: Verify Changes
```sql
-- Check current roles in database
SELECT user_id, name, email, role FROM users;

-- Count users by role
SELECT role, COUNT(*) as count FROM users GROUP BY role;
```

---

## 📝 Updated Files

### 1. ✅ MASTER_DATABASE_RESTORATION.sql
**Changed**: Line 23
```sql
role ENUM('family', 'attendee', 'provider', 'admin') DEFAULT 'family',
```

### 2. ✅ backend/register.php
**Changed**: Role validation
```php
// Valid roles
$validRoles = ["family", "attendee", "provider", "admin"];
$role = in_array($requestedRole, $validRoles) ? $requestedRole : "family";
```

### 3. ✅ frontend/my-app/src/components/Navbar.jsx
**Changed**: Role cases
```javascript
case "family":      // Family Member - Full access
case "attendee":    // Funeral Attendee - Limited to tributes
case "provider":    // Service Provider - Dashboard
```

### 4. ✅ frontend/my-app/src/pages/Register.jsx
**Changed**: Role selector buttons
```javascript
["family", "attendee", "provider"]
// Shows as: "Family Member", "Funeral Attendee", "Provider"
```

---

## 🧪 Testing Guide

### Test 1: Register Family Member
1. Go to: http://localhost:5174/register
2. Click **"Family Member"**
3. Fill in details and register
4. Login and check navbar
5. **Expected**: See all links (Home, Order Services, Tribute, AI Chatbot, Orders, FAQs)

### Test 2: Register Funeral Attendee
1. Go to: http://localhost:5174/register
2. Click **"Funeral Attendee"**
3. Fill in details and register
4. Login and check navbar
5. **Expected**: See limited links (Home, Tributes, FAQs)

### Test 3: Register Service Provider
1. Go to: http://localhost:5174/register
2. Click **"Provider"**
3. Fill in business details and register
4. Login and check navbar
5. **Expected**: See provider links (Dashboard, Packages, FAQs)

---

## 🎨 Frontend Display

### Registration Page
Users will see **3 buttons**:
- 👪 **Family Member** (default)
- 🙏 **Funeral Attendee**
- ⚙️ **Provider**

### User Experience
| User Registers As | What They See | What They Can Do |
|-------------------|---------------|------------------|
| Family Member | Full navigation | Order services, create tributes, use chatbot |
| Funeral Attendee | Limited navigation | View tributes, RSVP, send condolences |
| Service Provider | Provider navigation | Manage packages, view bookings |

---

## 📋 API Response Format

### Login Response for Family Member
```json
{
  "success": true,
  "token": "jwt_token",
  "user": {
    "user_id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "family"  // ✅ New role name
  }
}
```

### Login Response for Funeral Attendee
```json
{
  "success": true,
  "token": "jwt_token",
  "user": {
    "user_id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "attendee"  // ✅ New role name
  }
}
```

---

## ⚠️ Important Notes

### For Existing Users
If you have existing users in your database with `role = 'customer'`:
- You MUST run the migration SQL to convert them to `family`
- Otherwise, they won't be able to login (ENUM mismatch)

### Frontend-Backend Alignment
✅ **Frontend sends**: `family`, `attendee`, `provider`  
✅ **Backend stores**: `family`, `attendee`, `provider`  
✅ **Database accepts**: `family`, `attendee`, `provider`, `admin`  

**Perfect alignment - no role mapping needed!**

---

## 🚀 Quick Start

### If you have a fresh database:
1. Run the updated `MASTER_DATABASE_RESTORATION.sql`
2. Register new users - they'll work immediately

### If you have existing users:
1. **First**, run the migration SQL (see Step 1 above)
2. **Then**, your existing users can login with new system

---

## 📊 Database Migration SQL (COPY THIS)

```sql
-- ============================================
-- MIGRATE TO NEW 3-ROLE SYSTEM
-- ============================================

-- Step 1: Add new roles to ENUM
ALTER TABLE users MODIFY COLUMN role 
ENUM('family', 'attendee', 'provider', 'admin', 'customer', 'guest') DEFAULT 'family';

-- Step 2: Convert old roles to new roles
UPDATE users SET role = 'family' WHERE role = 'customer';
UPDATE users SET role = 'attendee' WHERE role = 'guest';

-- Step 3: Remove old role values from ENUM
ALTER TABLE users MODIFY COLUMN role 
ENUM('family', 'attendee', 'provider', 'admin') DEFAULT 'family';

-- Step 4: Verify migration
SELECT role, COUNT(*) as user_count FROM users GROUP BY role;
SELECT 'Migration complete!' as status;
```

---

## ✅ Summary

### What Changed:
1. ❌ Removed: `customer` role → ✅ Replaced with: `family`
2. ❌ Removed: `guest` role → ✅ Replaced with: `attendee`
3. ✅ Kept: `provider` role (unchanged)
4. ✅ Kept: `admin` role (unchanged)

### Why These Names:
- **"Family Member"** is clearer than "Customer" for funeral context
- **"Funeral Attendee"** is more descriptive than "Guest"
- **"Service Provider"** remains clear for businesses

### User-Friendly Terms:
Instead of technical terms like "customer", your system now uses:
- 👪 **Family Member** - empathetic, respectful
- 🙏 **Funeral Attendee** - clear purpose
- ⚙️ **Service Provider** - professional

---

**Last Updated**: October 23, 2025  
**Status**: ✅ 3-role system implemented  
**Database**: Updated to use `family`, `attendee`, `provider`, `admin`  
**Frontend**: Updated to match database roles exactly
