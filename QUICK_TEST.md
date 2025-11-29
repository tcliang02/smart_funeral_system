# ⚡ Quick Test - Copy & Paste

## 🚀 Fastest Way to Test

### **1. Start Your App**

```bash
cd frontend/my-app
npm run dev
```

---

### **2. Open Browser Console** (F12)

**Copy and paste this entire script:**

```javascript
// ============================================
// QUICK MIDDLEWARE TEST
// ============================================

async function testMiddleware() {
  console.log('🧪 Testing API Route Authentication...\n');
  
  // Test 1: Public endpoint (should work)
  console.log('Test 1: Public endpoint (getAllProviders)...');
  try {
    const publicRes = await fetch('/api/backend/getAllProviders');
    const publicData = await publicRes.json();
    if (publicRes.ok) {
      console.log('✅ Test 1 PASSED: Public endpoint works\n');
    } else {
      console.log('❌ Test 1 FAILED:', publicData);
      return;
    }
  } catch (err) {
    console.log('❌ Test 1 ERROR:', err);
    return;
  }
  
  // Test 2: Protected endpoint without token (should fail)
  console.log('Test 2: Protected endpoint WITHOUT token...');
  try {
    const protectedRes = await fetch('/api/backend/createBooking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ package_id: 1 })
    });
    const protectedData = await protectedRes.json();
    
    if (protectedRes.status === 401 && protectedData.error === 'MISSING_TOKEN') {
      console.log('✅ Test 2 PASSED: Correctly rejected (no token)\n');
    } else {
      console.log('❌ Test 2 FAILED: Should return 401, got:', protectedRes.status);
      console.log('Response:', protectedData);
      return;
    }
  } catch (err) {
    console.log('❌ Test 2 ERROR:', err);
    return;
  }
  
  // Test 3: Login to get token
  console.log('Test 3: Login to get token...');
  console.log('⚠️ Replace username/password with real credentials!');
  
  const loginRes = await fetch('/api/backend/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'YOUR_USERNAME_HERE',  // ← Replace this
      password: 'YOUR_PASSWORD_HERE'   // ← Replace this
    })
  });
  
  const loginData = await loginRes.json();
  
  if (!loginData.success || !loginData.token) {
    console.log('❌ Test 3 FAILED: Login failed');
    console.log('Response:', loginData);
    console.log('\n⚠️ Update username/password in the script above!');
    return;
  }
  
  console.log('✅ Test 3 PASSED: Got token\n');
  const token = loginData.token;
  
  // Test 4: Protected endpoint with token (should work)
  console.log('Test 4: Protected endpoint WITH token...');
  try {
    const authRes = await fetch('/api/backend/createBooking', {
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
    });
    
    const authData = await authRes.json();
    
    if (authRes.status !== 401) {
      console.log('✅ Test 4 PASSED: Token accepted (status:', authRes.status + ')');
      console.log('Response:', authData);
    } else {
      console.log('❌ Test 4 FAILED: Token rejected');
      console.log('Response:', authData);
    }
  } catch (err) {
    console.log('❌ Test 4 ERROR:', err);
  }
  
  console.log('\n🎉 Testing complete!');
}

// Run the test
testMiddleware();
```

---

### **3. Update Credentials**

**Before running, replace:**
- `YOUR_USERNAME_HERE` → Your actual username
- `YOUR_PASSWORD_HERE` → Your actual password

---

### **4. Run the Test**

**Press Enter** in the console after pasting.

---

## ✅ Expected Results

1. **Test 1:** ✅ Public endpoint works
2. **Test 2:** ✅ Protected endpoint returns 401 (no token)
3. **Test 3:** ✅ Login succeeds, gets token
4. **Test 4:** ✅ Protected endpoint accepts token (not 401)

---

## 🎯 What Each Test Checks

- **Test 1:** Public endpoints still work (middleware doesn't break them)
- **Test 2:** Protected endpoints are blocked without token
- **Test 3:** Login works (gets token)
- **Test 4:** Protected endpoints work with valid token

---

**That's it! Just copy, paste, update credentials, and run!** 🚀

