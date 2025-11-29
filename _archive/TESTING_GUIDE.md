# Testing Guide for System Improvements

This guide helps you test the recent backend architecture improvements.

## Prerequisites

1. **Local Development Setup**:
   - XAMPP running (Apache + MySQL)
   - Database: `smart_funeral_system`
   - PHP 7.4+ with PDO extensions enabled

2. **Access Backend**:
   - Backend URL: `http://localhost/smart_funeral_system/backend/`

## Test 1: Unified Database Connection

### Step 1: Run Database Test Script

```bash
# Via browser
http://localhost/smart_funeral_system/backend/test-unified-db.php

# Via command line (if PHP CLI is available)
cd backend
php test-unified-db.php
```

### Expected Results:
- ✅ Connection is PDO
- ✅ Database Type: `mysql` (local) or `pgsql` (production)
- ✅ Basic queries work
- ✅ Parameterized queries work
- ✅ Helper functions work
- ✅ Transactions work

### What to Check:
1. Connection type should be PDO (not mysqli)
2. Queries should execute without errors
3. Helper functions should return correct data

---

## Test 2: Login Endpoint (Updated Code)

### Step 1: Test Login via Browser/Postman

**URL**: `http://localhost/smart_funeral_system/backend/login.php`

**Method**: POST

**Headers**:
```
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "username": "your_username",
  "password": "your_password"
}
```

### Expected Response:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "user_id": 1,
    "name": "username",
    "role": "customer",
    "email": "email@example.com"
  }
}
```

### What to Check:
1. ✅ Login should work with existing credentials
2. ✅ Response should include token
3. ✅ No errors about mysqli/PDO mismatch
4. ✅ Works for both customer and provider roles

---

## Test 3: Central Router

### Step 1: Test Router File Exists

```bash
# Check if router exists
http://localhost/smart_funeral_system/backend/test-router.php
```

### Step 2: Test Router Endpoints

**Option A: Via Browser (GET requests)**
```
http://localhost/smart_funeral_system/backend/api/providers
http://localhost/smart_funeral_system/backend/api/tributes
```

**Option B: Via cURL (POST requests)**
```bash
# Test login via router
curl -X POST http://localhost/smart_funeral_system/backend/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'

# Test providers
curl http://localhost/smart_funeral_system/backend/api/providers
```

**Option C: Via Postman/Thunder Client**
- Create new request
- URL: `http://localhost/smart_funeral_system/backend/api/login`
- Method: POST
- Body: JSON with username/password

### Expected Results:
- ✅ Router should handle requests
- ✅ CORS headers should be present
- ✅ Endpoints should route to correct files
- ✅ 404 for non-existent routes

### What to Check:
1. Router responds (not 404)
2. CORS headers in response
3. Correct endpoint behavior
4. Error handling for invalid routes

---

## Test 4: Backward Compatibility

### Test Direct File Access Still Works

**Old way (should still work)**:
```
http://localhost/smart_funeral_system/backend/login.php
http://localhost/smart_funeral_system/backend/getAllProviders.php
```

**New way (router)**:
```
http://localhost/smart_funeral_system/backend/api/login
http://localhost/smart_funeral_system/backend/api/providers
```

### Expected Results:
- ✅ Both methods should work
- ✅ Same response format
- ✅ No breaking changes

---

## Test 5: Helper Functions

### Test executeQuery Function

Create a test file `backend/test-helpers.php`:

```php
<?php
include "db_connect.php";
include "helpers.php";

// Test executeQuery
$users = executeQuery($conn, "SELECT * FROM users LIMIT 5");
echo "Users found: " . count($users) . "\n";

// Test executeQuerySingle
$user = executeQuerySingle($conn, "SELECT * FROM users WHERE user_id = ?", [1]);
echo "User found: " . ($user ? $user['name'] : 'None') . "\n";

// Test getUserById
$user = getUserById($conn, 1);
echo "getUserById result: " . ($user ? $user['username'] : 'None') . "\n";
?>
```

### Expected Results:
- ✅ All helper functions work
- ✅ No mysqli-related errors
- ✅ Correct data returned

---

## Test 6: Frontend Integration

### Test Login from Frontend

1. **Start Next.js dev server**:
   ```bash
   cd frontend/my-app
   npm run dev
   ```

2. **Test login in browser**:
   - Go to `http://localhost:3000/login`
   - Enter credentials
   - Should successfully login

3. **Check Network Tab**:
   - Request should go to backend
   - Response should include token
   - No CORS errors

### Expected Results:
- ✅ Frontend can communicate with backend
- ✅ Login works end-to-end
- ✅ Token is stored correctly
- ✅ User redirected after login

---

## Troubleshooting

### Issue: "Connection is not PDO"
**Solution**: Check `db_connect.php` - it should use PDO for both MySQL and PostgreSQL

### Issue: "Call to undefined method mysqli::prepare()"
**Solution**: This means code is still trying to use mysqli. Check that `db_connect.php` uses PDO.

### Issue: Router returns 404
**Solution**: 
- Check that `backend/index.php` exists
- Verify route is defined in `$routes` array
- Check file permissions

### Issue: CORS errors
**Solution**: 
- Check that CORS headers are set in router
- Verify frontend URL is allowed
- Check browser console for specific error

### Issue: Database connection fails
**Solution**:
- Check MySQL is running (XAMPP)
- Verify database credentials in `db_connect.php`
- Check PHP PDO extensions are enabled

---

## Quick Test Checklist

- [ ] Database connection test passes
- [ ] Login endpoint works (direct access)
- [ ] Login endpoint works (via router)
- [ ] Helper functions work
- [ ] Frontend can login
- [ ] No mysqli errors in logs
- [ ] CORS headers present
- [ ] Backward compatibility maintained

---

## Production Testing

When deploying to production (Vercel + Supabase):

1. **Set environment variables**:
   - `DB_HOST`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
   - `DB_PORT`

2. **Test database connection**:
   - Should connect to PostgreSQL
   - Should use PDO
   - Queries should work

3. **Test endpoints**:
   - All endpoints should work
   - CORS should allow Vercel domain

---

## Need Help?

If tests fail:
1. Check PHP error logs
2. Check browser console (for frontend)
3. Verify database is running
4. Check file permissions
5. Review `docs/BACKEND_IMPROVEMENTS.md` for details

