# Testing Multi-Day Booking with Authentication

## 🔐 Problem
The `/api/backend/createBooking` endpoint requires authentication. You need a valid JWT token to test it.

---

## ✅ Solution: Login First, Then Test

### **Step 1: Login to Get Token**

Run this in browser console **FIRST**:

```javascript
// 1. Login to get authentication token
async function loginAndGetToken() {
  const loginResponse = await fetch('/api/backend/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'your_username',  // ⚠️ Replace with your username
      password: 'your_password'   // ⚠️ Replace with your password
    })
  });
  
  const loginData = await loginResponse.json();
  
  if (loginData.success && loginData.data?.token) {
    console.log('✅ Login successful!');
    console.log('🔑 Token:', loginData.data.token);
    
    // Save token to localStorage
    localStorage.setItem('token', loginData.data.token);
    localStorage.setItem('user', JSON.stringify(loginData.data.user));
    
    return loginData.data.token;
  } else {
    console.error('❌ Login failed:', loginData.message);
    return null;
  }
}

// Run login
const token = await loginAndGetToken();
```

### **Step 2: Test Multi-Day Booking with Token**

After getting the token, run this:

```javascript
// 2. Test multi-day booking with authentication token
async function testMultiDayBooking() {
  // Get token from localStorage
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.error('❌ No token found. Please login first!');
    return;
  }
  
  const bookingData = {
    package_id: 1,  // ⚠️ Replace with your actual package ID
    customer_name: "Test User",
    customer_email: "test@example.com",
    customer_phone: "0123456789",
    service_date: "2024-12-20",
    service_dates: [
      { date: "2024-12-20", start_time: "09:00:00", end_time: "18:00:00", event_type: "wake_day_1" },
      { date: "2024-12-21", start_time: "09:00:00", end_time: "18:00:00", event_type: "wake_day_2" },
      { date: "2024-12-22", start_time: "10:00:00", end_time: "12:00:00", event_type: "cremation" }
    ],
    total_amount: 5000.00
  };

  try {
    const response = await fetch('/api/backend/createBooking', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`  // ✅ Add token here
      },
      body: JSON.stringify(bookingData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Multi-day booking created!');
      console.log('📋 Booking ID:', result.data.booking_id);
      console.log('📋 Reference:', result.data.booking_reference);
      
      // Verify in database
      console.log('\n🔍 Verify with SQL:');
      console.log(`SELECT * FROM booking_dates WHERE booking_id = ${result.data.booking_id};`);
    } else {
      console.error('❌ Error:', result.message);
    }
  } catch (error) {
    console.error('❌ Request failed:', error);
  }
}

// Run test
testMultiDayBooking();
```

---

## 🚀 Complete Test Script (All-in-One)

Copy-paste this **complete script** into browser console:

```javascript
// ============================================
// COMPLETE MULTI-DAY BOOKING TEST WITH AUTH
// ============================================

(async function testMultiDayBookingWithAuth() {
  // Step 1: Login (replace with your credentials)
  console.log('🔐 Step 1: Logging in...');
  const loginResponse = await fetch('/api/backend/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'your_username',  // ⚠️ CHANGE THIS
      password: 'your_password'   // ⚠️ CHANGE THIS
    })
  });
  
  const loginData = await loginResponse.json();
  
  if (!loginData.success || !loginData.data?.token) {
    console.error('❌ Login failed:', loginData.message);
    console.log('💡 Make sure you have a user account. You can register at /register');
    return;
  }
  
  const token = loginData.data.token;
  console.log('✅ Login successful! Token received.');
  
  // Step 2: Create multi-day booking
  console.log('\n📅 Step 2: Creating multi-day booking...');
  
  const bookingData = {
    package_id: 1,  // ⚠️ CHANGE THIS to a real package ID
    customer_name: "Multi-Day Test User",
    customer_email: "multiday@test.com",
    customer_phone: "0123456789",
    service_date: "2024-12-20",
    service_dates: [
      { date: "2024-12-20", start_time: "09:00:00", end_time: "18:00:00", event_type: "wake_day_1" },
      { date: "2024-12-21", start_time: "09:00:00", end_time: "18:00:00", event_type: "wake_day_2" },
      { date: "2024-12-22", start_time: "10:00:00", end_time: "12:00:00", event_type: "cremation" }
    ],
    total_amount: 5000.00
  };
  
  const bookingResponse = await fetch('/api/backend/createBooking', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(bookingData)
  });
  
  const bookingResult = await bookingResponse.json();
  
  if (bookingResult.success) {
    console.log('✅ Multi-day booking created successfully!');
    console.log('📋 Booking ID:', bookingResult.data.booking_id);
    console.log('📋 Booking Reference:', bookingResult.data.booking_reference);
    console.log('📋 Package:', bookingResult.data.package_name);
    
    console.log('\n🔍 To verify in database, run this SQL:');
    console.log(`SELECT * FROM booking_dates WHERE booking_id = ${bookingResult.data.booking_id} ORDER BY date;`);
  } else {
    console.error('❌ Booking failed:', bookingResult.message);
    if (bookingResult.error) {
      console.error('Error details:', bookingResult.error);
    }
  }
})();
```

---

## 🔧 Option 2: Make Endpoint Public for Testing (NOT RECOMMENDED)

If you want to test without authentication (only for development), add this to your middleware:

**File:** `frontend/my-app/src/middleware.ts`

Find the `publicApiEndpoints` array (around line 109) and add:

```typescript
const publicApiEndpoints = [
  // ... existing endpoints ...
  '/api/backend/createBooking', // ⚠️ ONLY FOR TESTING - REMOVE IN PRODUCTION
];
```

⚠️ **WARNING:** Only do this for local development testing. Remove it before deploying to production!

---

## 📋 Quick Steps Summary

1. **Get a user account:**
   - Login at `/login` if you have one
   - Or register at `/register` first

2. **Get package ID:**
   ```sql
   SELECT package_id, name FROM packages LIMIT 1;
   ```

3. **Run the complete test script** (replace username, password, package_id)

4. **Verify in database:**
   ```sql
   SELECT * FROM booking_dates WHERE booking_id = [YOUR_BOOKING_ID];
   ```

---

## 🐛 Troubleshooting

### Error: "Unauthorized. Please login first."
- **Solution:** Make sure you login first and get a valid token
- Check that token is in localStorage: `localStorage.getItem('token')`

### Error: "Invalid or expired token"
- **Solution:** Login again to get a fresh token
- Tokens expire after some time

### Error: "Package not found"
- **Solution:** Check that package_id exists in database
- Run: `SELECT package_id, name FROM packages;`

---

**Good luck with testing!** 🚀

