/**
 * API Standardization Test Script
 * 
 * This script tests the standardized API routes to ensure:
 * 1. Consistent response format: { success: true, data: {...} }
 * 2. Proper error handling with error codes
 * 3. Correct HTTP status codes
 * 
 * Usage:
 * - Browser: Copy and paste into browser console (on http://localhost:3000)
 * - Node.js: node TEST_API_STANDARDIZATION.js (requires fetch polyfill)
 */

// ============================================
// CONFIGURATION
// ============================================
const BASE_URL = 'http://localhost:3000';
const TEST_CREDENTIALS = {
  username: 'YOUR_USERNAME',  // ← Replace with real username
  password: 'YOUR_PASSWORD'    // ← Replace with real password
};

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  skipped: 0,
  details: []
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function log(message, type = 'info') {
  const emoji = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    test: '🧪'
  };
  console.log(`${emoji[type]} ${message}`);
}

function assert(condition, message) {
  if (condition) {
    testResults.passed++;
    log(`PASS: ${message}`, 'success');
    return true;
  } else {
    testResults.failed++;
    log(`FAIL: ${message}`, 'error');
    return false;
  }
}

function assertResponseFormat(response, expectedDataKeys = []) {
  const checks = [];
  
  // Check basic structure
  checks.push(assert(typeof response === 'object', 'Response is an object'));
  checks.push(assert('success' in response, 'Response has "success" field'));
  
  if (response.success) {
    // Success response should have "data" field
    checks.push(assert('data' in response, 'Success response has "data" field'));
    
    // Check expected data keys (only if data is an object, not an array)
    if (expectedDataKeys.length > 0 && response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
      expectedDataKeys.forEach(key => {
        checks.push(assert(key in response.data, `Data has "${key}" field`));
      });
    }
    // If data is an array (paginated response), we don't check for nested keys
  } else {
    // Error response should have "error" field
    checks.push(assert('error' in response, 'Error response has "error" field'));
    if (response.error) {
      checks.push(assert('code' in response.error, 'Error has "code" field'));
      checks.push(assert('message' in response.error, 'Error has "message" field'));
    }
  }
  
  return checks.every(check => check);
}

// ============================================
// TEST FUNCTIONS
// ============================================

async function testPublicEndpoint() {
  log('\n📋 TEST 1: Public Endpoint (getAllProviders)', 'test');
  
  try {
    const response = await fetch(`${BASE_URL}/api/backend/getAllProviders`);
    const data = await response.json();
    
    assert(response.ok, 'HTTP status is OK (200)');
    assert(data.success === true, 'Response indicates success');
    assertResponseFormat(data, ['providers']);
    
    if (data.data?.providers) {
      assert(Array.isArray(data.data.providers), 'Providers is an array');
      log(`   Found ${data.data.providers.length} providers`);
    }
    
    return { success: data.success, token: null };
  } catch (error) {
    log(`Error: ${error.message}`, 'error');
    testResults.failed++;
    return { success: false, token: null };
  }
}

async function testProtectedEndpointWithoutToken() {
  log('\n📋 TEST 2: Protected Endpoint WITHOUT Token', 'test');
  
  try {
    const response = await fetch(`${BASE_URL}/api/backend/createBooking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ package_id: 1 })
    });
    const data = await response.json();
    
    assert(response.status === 401, 'Returns 401 Unauthorized');
    assert(data.success === false, 'Response indicates failure');
    assertResponseFormat(data);
    
    if (data.error) {
      assert(data.error.code === 'MISSING_TOKEN' || data.error.code === 'INVALID_TOKEN', 
        `Error code is MISSING_TOKEN or INVALID_TOKEN (got: ${data.error.code})`);
    }
    
    return { success: false, token: null };
  } catch (error) {
    log(`Error: ${error.message}`, 'error');
    testResults.failed++;
    return { success: false, token: null };
  }
}

async function testLogin() {
  log('\n📋 TEST 3: Login to Get Token', 'test');
  
  if (TEST_CREDENTIALS.username === 'YOUR_USERNAME') {
    log('SKIP: Update TEST_CREDENTIALS in script', 'warning');
    testResults.skipped++;
    return { success: false, token: null };
  }
  
  try {
    const response = await fetch(`${BASE_URL}/api/backend/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_CREDENTIALS)
    });
    const data = await response.json();
    
    if (data.success && data.data?.token) {
      assert(data.success === true, 'Login successful');
      assertResponseFormat(data, ['token', 'user']);
      log(`   Got token: ${data.data.token.substring(0, 20)}...`);
      return { success: true, token: data.data.token };
    } else {
      log(`Login failed: ${data.error?.message || data.message}`, 'error');
      testResults.failed++;
      return { success: false, token: null };
    }
  } catch (error) {
    log(`Error: ${error.message}`, 'error');
    testResults.failed++;
    return { success: false, token: null };
  }
}

async function testProtectedEndpointWithToken(token) {
  log('\n📋 TEST 4: Protected Endpoint WITH Token', 'test');
  
  if (!token) {
    log('SKIP: No token available', 'warning');
    testResults.skipped++;
    return;
  }
  
  try {
    const response = await fetch(`${BASE_URL}/api/backend/getUserBookings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    
    // Should not be 401
    assert(response.status !== 401, 'Not blocked (not 401)');
    
    if (data.success) {
      assertResponseFormat(data, ['bookings']);
      log('   Protected endpoint accessible with token');
    } else {
      // Might be 400/404 if user has no bookings, which is OK
      assertResponseFormat(data);
      log(`   Response: ${data.error?.message || data.message}`);
    }
  } catch (error) {
    log(`Error: ${error.message}`, 'error');
    testResults.failed++;
  }
}

async function testValidationError() {
  log('\n📋 TEST 5: Validation Error Format', 'test');
  
  try {
    const response = await fetch(`${BASE_URL}/api/backend/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'test' }) // Missing password
    });
    const data = await response.json();
    
    assert(response.status === 400, 'Returns 400 Bad Request');
    assert(data.success === false, 'Response indicates failure');
    assertResponseFormat(data);
    
    if (data.error) {
      assert(data.error.code === 'VALIDATION_ERROR', 
        `Error code is VALIDATION_ERROR (got: ${data.error.code})`);
      log(`   Error message: ${data.error.message}`);
    }
  } catch (error) {
    log(`Error: ${error.message}`, 'error');
    testResults.failed++;
  }
}

async function testNotFoundError() {
  log('\n📋 TEST 6: Not Found Error Format', 'test');
  
  try {
    // Use getTributeById with invalid ID (public route, can return 404)
    const response = await fetch(`${BASE_URL}/api/backend/getTributeById?id=99999`);
    const data = await response.json();
    
    // This route might return 404 if tribute not found, or 400 if ID is invalid
    // Both are acceptable error responses
    assert(response.status === 404 || response.status === 400, 
      `Returns 404 or 400 error (got: ${response.status})`);
    assert(data.success === false, 'Response indicates failure');
    assertResponseFormat(data);
    
    if (data.error) {
      assert(data.error.code === 'NOT_FOUND' || data.error.code === 'VALIDATION_ERROR', 
        `Error code is NOT_FOUND or VALIDATION_ERROR (got: ${data.error.code})`);
      log(`   Error code: ${data.error.code}, Message: ${data.error.message}`);
    }
  } catch (error) {
    log(`Error: ${error.message}`, 'error');
    testResults.failed++;
  }
}

async function testGetAllPackages() {
  log('\n📋 TEST 7: getAllPackages Response Format', 'test');
  
  try {
    const response = await fetch(`${BASE_URL}/api/backend/getAllPackages`);
    const data = await response.json();
    
    assert(response.ok, 'HTTP status is OK');
    assert(data.success === true, 'Response indicates success');
    assertResponseFormat(data, ['packages']);
    
    if (data.data?.packages) {
      assert(Array.isArray(data.data.packages), 'Packages is an array');
      log(`   Found ${data.data.packages.length} packages`);
    }
  } catch (error) {
    log(`Error: ${error.message}`, 'error');
    testResults.failed++;
  }
}

async function testGetTributes() {
  log('\n📋 TEST 8: getTributes Response Format', 'test');
  
  try {
    const response = await fetch(`${BASE_URL}/api/backend/getTributes?page=1&limit=5`);
    const data = await response.json();
    
    assert(response.ok, 'HTTP status is OK');
    assert(data.success === true, 'Response indicates success');
    
    // For paginated responses, data is the array directly, not data.tributes
    // So we check that data exists and is an array
    assert('data' in data, 'Response has "data" field');
    
    if (data.data) {
      assert(Array.isArray(data.data), 'Data is an array (paginated response)');
      log(`   Found ${data.data.length} tributes`);
    }
    
    // Check pagination meta
    if (data.meta) {
      assert('page' in data.meta, 'Meta has "page" field');
      assert('limit' in data.meta, 'Meta has "limit" field');
      assert('total' in data.meta, 'Meta has "total" field');
      log(`   Pagination: Page ${data.meta.page}, Total: ${data.meta.total}`);
    }
  } catch (error) {
    log(`Error: ${error.message}`, 'error');
    testResults.failed++;
  }
}

// ============================================
// MAIN TEST RUNNER
// ============================================

async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 API STANDARDIZATION TEST SUITE');
  console.log('='.repeat(60));
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('='.repeat(60) + '\n');
  
  // Test 1: Public endpoint
  await testPublicEndpoint();
  
  // Test 2: Protected endpoint without token
  await testProtectedEndpointWithoutToken();
  
  // Test 3: Login
  const loginResult = await testLogin();
  const token = loginResult.token;
  
  // Test 4: Protected endpoint with token
  if (token) {
    await testProtectedEndpointWithToken(token);
  }
  
  // Test 5: Validation error
  await testValidationError();
  
  // Test 6: Not found error
  await testNotFoundError();
  
  // Test 7: getAllPackages
  await testGetAllPackages();
  
  // Test 8: getTributes (with pagination)
  await testGetTributes();
  
  // ============================================
  // FINAL RESULTS
  // ============================================
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`⏭️  Skipped: ${testResults.skipped}`);
  console.log(`📋 Total: ${testResults.passed + testResults.failed + testResults.skipped}`);
  console.log('='.repeat(60));
  
  if (testResults.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! API standardization is working correctly.');
  } else {
    console.log(`\n⚠️  ${testResults.failed} test(s) failed. Review the errors above.`);
  }
  
  console.log('\n');
  
  return {
    passed: testResults.passed,
    failed: testResults.failed,
    skipped: testResults.skipped
  };
}

// ============================================
// EXPORT FOR NODE.JS / RUN IMMEDIATELY FOR BROWSER
// ============================================

// If running in browser, execute immediately
if (typeof window !== 'undefined') {
  // Browser environment - run tests
  runAllTests().then(results => {
    console.log('\n📋 Test execution complete!');
    console.log('Results:', results);
  });
}

// If running in Node.js, export the function
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllTests, testPublicEndpoint, testLogin };
}

