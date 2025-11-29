# 🧪 How to Test API Route Authentication

## 🎯 Quick Test Guide

Follow these steps to verify your middleware is working correctly.

---

## ✅ Step 1: Start Your Next.js App

```bash
cd frontend/my-app
npm run dev
```

**Wait for:** Server to start on `http://localhost:3000`

---

## ✅ Step 2: Test Public Endpoint (Should Work)

### **Option A: Browser Console**

1. Open your app: `http://localhost:3000`
2. Open browser console (F12)
3. Run this:

```javascript
// Test login (public endpoint - should work)
fetch('/api/backend/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'your_username',
    password: 'your_password'
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Login Result:', data);
  if (data.success) {
    console.log('✅ Token:', data.token);
    // Save token for next test
    localStorage.setItem('token', data.token);
  }
});
```

**Expected:** Should return `{ success: true, token: "...", user: {...} }` ✅

---

### **Option B: PowerShell/Command Line**

```powershell
# Test login endpoint
curl http://localhost:3000/api/backend/login `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"username":"your_username","password":"your_password"}'
```

**Expected:** Should return JSON with `success: true` ✅

---

## ✅ Step 3: Test Protected Endpoint WITHOUT Token (Should Fail)

### **Option A: Browser Console**

```javascript
// Test createBooking without token (should fail)
fetch('/api/backend/createBooking', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    package_id: 1,
    customer_name: 'Test User'
  })
})
.then(r => r.json())
.then(data => {
  console.log('❌ Result (should be 401):', data);
  console.log('Status:', data.success === false && data.error === 'MISSING_TOKEN' ? '✅ CORRECT' : '❌ WRONG');
});
```

**Expected Result:**
```json
{
  "success": false,
  "message": "Unauthorized. Please login first.",
  "error": "MISSING_TOKEN"
}
```
**Status:** `401 Unauthorized` ✅

**If you see this, middleware is working!** 🎉

---

### **Option B: PowerShell/Command Line**

```powershell
# Test protected endpoint without token
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/backend/createBooking" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"package_id":1}' `
  -ErrorAction SilentlyContinue

if ($response.StatusCode -eq 401) {
  Write-Host "✅ CORRECT: Got 401 Unauthorized" -ForegroundColor Green
  $response.Content | ConvertFrom-Json | ConvertTo-Json
} else {
  Write-Host "❌ WRONG: Expected 401, got $($response.StatusCode)" -ForegroundColor Red
}
```

**Expected:** Status code `401` with error message ✅

---

## ✅ Step 4: Test Protected Endpoint WITH Token (Should Work)

### **Option A: Browser Console**

```javascript
// Get token from localStorage (from Step 2)
const token = localStorage.getItem('token');

if (!token) {
  console.log('❌ No token found. Please login first (Step 2)');
} else {
  // Test createBooking with token
  fetch('/api/backend/createBooking', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      package_id: 1,
      customer_name: 'Test User',
      customer_email: 'test@example.com',
      customer_phone: '1234567890',
      service_date: '2024-12-25',
      total_amount: 1000
    })
  })
  .then(r => r.json())
  .then(data => {
    console.log('✅ Result with token:', data);
    if (data.success) {
      console.log('✅ SUCCESS: Booking created or validated!');
    } else {
      console.log('⚠️ Note: Might fail due to missing fields, but should NOT be 401');
    }
  });
}
```

**Expected:** Should NOT return 401. Might return validation errors (which is fine - means auth passed) ✅

---

### **Option B: PowerShell/Command Line**

```powershell
# First, login to get token
$loginBody = @{
  username = "your_username"
  password = "your_password"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/backend/login" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $loginBody

$token = $loginResponse.token
Write-Host "Token: $token" -ForegroundColor Cyan

# Now test protected endpoint with token
$bookingBody = @{
  package_id = 1
  customer_name = "Test User"
  customer_email = "test@example.com"
  customer_phone = "1234567890"
  service_date = "2024-12-25"
  total_amount = 1000
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/backend/createBooking" `
  -Method POST `
  -Headers @{
    "Content-Type"="application/json"
    "Authorization"="Bearer $token"
  } `
  -Body $bookingBody

Write-Host "✅ Result:" -ForegroundColor Green
$response | ConvertTo-Json
```

**Expected:** Should NOT return 401. Should process the request ✅

---

## ✅ Step 5: Test Your App Normally

1. **Open your app:** `http://localhost:3000`
2. **Login** with your credentials
3. **Use your app normally:**
   - Create a booking
   - View dashboard
   - Manage packages
   - All features should work ✅

**If everything works, middleware is correctly configured!** 🎉

---

## ✅ Step 6: Test Invalid Token (Should Fail)

### **Browser Console:**

```javascript
// Test with invalid token
fetch('/api/backend/createBooking', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': 'Bearer invalid_token_12345'
  },
  body: JSON.stringify({ package_id: 1 })
})
.then(r => r.json())
.then(data => {
  console.log('Result:', data);
  if (data.error === 'INVALID_TOKEN') {
    console.log('✅ CORRECT: Invalid token rejected');
  }
});
```

**Expected:**
```json
{
  "success": false,
  "message": "Invalid or expired token. Please login again.",
  "error": "INVALID_TOKEN"
}
```
**Status:** `401 Unauthorized` ✅

---

## 📋 Test Checklist

### **Public Endpoints (Should Work Without Token):**
- [ ] `/api/backend/login` - ✅ Works
- [ ] `/api/backend/getAllProviders` - ✅ Works
- [ ] `/api/backend/getAllPackages` - ✅ Works
- [ ] `/api/backend/getTributes` - ✅ Works

### **Protected Endpoints (Should Require Token):**
- [ ] `/api/backend/createBooking` - ❌ Fails without token, ✅ Works with token
- [ ] `/api/backend/updateBookingStatus` - ❌ Fails without token, ✅ Works with token
- [ ] `/api/backend/getProviderDashboard` - ❌ Fails without token, ✅ Works with token
- [ ] `/api/backend/managePackage` - ❌ Fails without token, ✅ Works with token

---

## 🎯 Quick Test Script (Copy-Paste Ready)

### **Browser Console - Complete Test:**

```javascript
// ============================================
// COMPLETE MIDDLEWARE TEST
// ============================================

console.log('🧪 Starting Middleware Tests...\n');

// Test 1: Public endpoint (should work)
console.log('Test 1: Public endpoint (login)...');
fetch('/api/backend/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'your_username', password: 'your_password' })
})
.then(r => r.json())
.then(data => {
  if (data.success) {
    console.log('✅ Test 1 PASSED: Public endpoint works');
    const token = data.token;
    localStorage.setItem('token', token);
    
    // Test 2: Protected endpoint without token
    console.log('\nTest 2: Protected endpoint WITHOUT token...');
    return fetch('/api/backend/createBooking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ package_id: 1 })
    });
  } else {
    console.log('❌ Test 1 FAILED: Login failed');
  }
})
.then(r => {
  if (r) {
    return r.json();
  }
})
.then(data => {
  if (data && data.error === 'MISSING_TOKEN') {
    console.log('✅ Test 2 PASSED: Protected endpoint correctly rejected (no token)');
    
    // Test 3: Protected endpoint with token
    console.log('\nTest 3: Protected endpoint WITH token...');
    const token = localStorage.getItem('token');
    return fetch('/api/backend/createBooking', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        package_id: 1,
        customer_name: 'Test',
        customer_email: 'test@test.com',
        customer_phone: '123',
        service_date: '2024-12-25',
        total_amount: 1000
      })
    });
  } else {
    console.log('❌ Test 2 FAILED: Should have rejected request');
  }
})
.then(r => {
  if (r) {
    return r.json();
  }
})
.then(data => {
  if (data && data.error !== 'MISSING_TOKEN' && data.error !== 'INVALID_TOKEN') {
    console.log('✅ Test 3 PASSED: Protected endpoint accepted token');
    console.log('\n🎉 All tests passed! Middleware is working correctly!');
  } else {
    console.log('⚠️ Test 3: Might have validation errors (which is fine - auth passed)');
  }
})
.catch(err => {
  console.error('❌ Test error:', err);
});
```

**Just replace `'your_username'` and `'your_password'` with real credentials!**

---

## ❓ Troubleshooting

### **Issue: All endpoints return 401 (even public ones)**

**Check:**
1. Is middleware running? Check Next.js console for errors
2. Is the endpoint in `publicApiEndpoints` array?
3. Check `middleware.ts` - is the path matching correct?

**Fix:** Add the endpoint to `publicApiEndpoints` in `middleware.ts`

---

### **Issue: Protected endpoints work without token**

**Check:**
1. Is middleware actually running? Check Next.js console
2. Is the matcher config correct? Should include `/api/backend/*`
3. Check browser Network tab - is the request going through middleware?

**Fix:** Verify middleware is being called (add console.log in middleware)

---

### **Issue: "Cannot find module '@/lib/helpers'"**

**Check:**
1. Does `frontend/my-app/lib/helpers.ts` exist?
2. Is `tsconfig.json` configured correctly?

**Fix:** Verify the file exists and import path is correct

---

## ✅ Success Criteria

**You're done when:**
- ✅ Public endpoints work without token
- ✅ Protected endpoints return 401 without token
- ✅ Protected endpoints work with valid token
- ✅ Invalid tokens are rejected
- ✅ Your app works normally when logged in

---

**Start with Step 1 - test a public endpoint first!** 🚀

