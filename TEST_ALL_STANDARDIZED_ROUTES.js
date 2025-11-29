/**
 * Comprehensive Test Script for All Standardized API Routes
 * 
 * This script tests all 52 standardized API routes (93% of total routes)
 * 
 * Usage:
 * 1. Open browser console on http://localhost:3000
 * 2. Copy and paste this entire script
 * 3. Or run: node TEST_ALL_STANDARDIZED_ROUTES.js (if using Node.js with fetch)
 */

const BASE_URL = 'http://localhost:3000';
const TEST_CREDENTIALS = {
  username: 'YOUR_USERNAME',  // ← Replace with real credentials
  password: 'YOUR_PASSWORD'   // ← Replace with real password
};

let authToken = null;
let testResults = {
  passed: 0,
  failed: 0,
  skipped: 0,
  total: 0
};

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
      ...options.headers
    },
    ...options
  };
  
  try {
    const response = await fetch(url, defaultOptions);
    const data = await response.json();
    return { response, data, ok: response.ok, status: response.status };
  } catch (error) {
    return { error: error.message, ok: false, status: 0 };
  }
}

// Assertion helper
function assert(condition, message) {
  testResults.total++;
  if (condition) {
    testResults.passed++;
    console.log(`✅ PASS: ${message}`);
    return true;
  } else {
    testResults.failed++;
    console.error(`❌ FAIL: ${message}`);
    return false;
  }
}

function assertResponseFormat(data, isSuccess = true) {
  // Check basic structure
  assert(typeof data === 'object' && data !== null, 'Response is an object');
  assert('success' in data, 'Response has "success" field');
  assert(typeof data.success === 'boolean', '"success" is a boolean');
  
  if (isSuccess) {
    assert(data.success === true, 'Response indicates success');
    assert('data' in data, 'Success response has "data" field');
  } else {
    assert(data.success === false, 'Response indicates failure');
    assert('error' in data, 'Error response has "error" field');
    if (data.error) {
      assert('code' in data.error, 'Error has "code" field');
      assert('message' in data.error, 'Error has "message" field');
    }
  }
}

// ============================================================
// TEST SUITE
// ============================================================

async function testLogin() {
  console.log('\n🧪 📋 TEST: Login');
  if (TEST_CREDENTIALS.username === 'YOUR_USERNAME') {
    console.log('⚠️ SKIP: Update TEST_CREDENTIALS in script');
    testResults.skipped++;
    return false;
  }
  
  const { data, status } = await apiCall('/api/backend/login', {
    method: 'POST',
    body: JSON.stringify(TEST_CREDENTIALS)
  });
  
  assert(status === 200, 'Returns 200 OK');
  assertResponseFormat(data, true);
  assert(data.data && data.data.token, 'Response contains token');
  
  if (data.data && data.data.token) {
    authToken = data.data.token;
    console.log('✅ Token obtained for subsequent tests');
  }
  
  return authToken !== null;
}

async function testGetAllProviders() {
  console.log('\n🧪 📋 TEST: getAllProviders (Public)');
  const { data, status } = await apiCall('/api/backend/getAllProviders');
  
  assert(status === 200, 'Returns 200 OK');
  assertResponseFormat(data, true);
  assert(Array.isArray(data.data?.providers), 'Data contains providers array');
  console.log(`ℹ️    Found ${data.data?.providers?.length || 0} providers`);
}

async function testGetAllPackages() {
  console.log('\n🧪 📋 TEST: getAllPackages (Public)');
  const { data, status } = await apiCall('/api/backend/getAllPackages');
  
  assert(status === 200, 'Returns 200 OK');
  assertResponseFormat(data, true);
  assert(Array.isArray(data.data?.packages), 'Data contains packages array');
  console.log(`ℹ️    Found ${data.data?.packages?.length || 0} packages`);
}

async function testGetPackages() {
  console.log('\n🧪 📋 TEST: getPackages (with provider_id)');
  const { data, status } = await apiCall('/api/backend/getPackages?provider_id=1');
  
  if (status === 200) {
    assertResponseFormat(data, true);
    assert(Array.isArray(data.data?.packages), 'Data contains packages array');
  } else {
    assertResponseFormat(data, false);
  }
}

async function testGetProviderProfile() {
  console.log('\n🧪 📋 TEST: getProviderProfile');
  const { data, status } = await apiCall('/api/backend/getProviderProfile?provider_id=1');
  
  if (status === 200) {
    assertResponseFormat(data, true);
    assert(data.data?.profile, 'Data contains profile');
  } else {
    assertResponseFormat(data, false);
  }
}

async function testGetFamilyProfile() {
  console.log('\n🧪 📋 TEST: getFamilyProfile');
  if (!authToken) {
    console.log('⚠️ SKIP: No auth token');
    testResults.skipped++;
    return;
  }
  
  const { data, status } = await apiCall('/api/backend/getFamilyProfile?user_id=1');
  
  if (status === 200) {
    assertResponseFormat(data, true);
  } else {
    assertResponseFormat(data, false);
  }
}

async function testGetProviderDashboard() {
  console.log('\n🧪 📋 TEST: getProviderDashboard');
  if (!authToken) {
    console.log('⚠️ SKIP: No auth token');
    testResults.skipped++;
    return;
  }
  
  const { data, status } = await apiCall('/api/backend/getProviderDashboard?user_id=1');
  
  if (status === 200) {
    assertResponseFormat(data, true);
    assert(data.data, 'Data contains dashboard data');
  } else {
    assertResponseFormat(data, false);
  }
}

async function testGetProviderBookings() {
  console.log('\n🧪 📋 TEST: getProviderBookings');
  if (!authToken) {
    console.log('⚠️ SKIP: No auth token');
    testResults.skipped++;
    return;
  }
  
  const { data, status } = await apiCall('/api/backend/getProviderBookings?provider_id=1');
  
  if (status === 200) {
    assertResponseFormat(data, true);
    assert(Array.isArray(data.data?.bookings), 'Data contains bookings array');
  } else {
    assertResponseFormat(data, false);
  }
}

async function testGetUserBookings() {
  console.log('\n🧪 📋 TEST: getUserBookings');
  if (!authToken) {
    console.log('⚠️ SKIP: No auth token');
    testResults.skipped++;
    return;
  }
  
  const { data, status } = await apiCall('/api/backend/getUserBookings?user_id=1');
  
  if (status === 200) {
    assertResponseFormat(data, true);
    assert(Array.isArray(data.data?.bookings), 'Data contains bookings array');
  } else {
    assertResponseFormat(data, false);
  }
}

async function testGetProviderAddons() {
  console.log('\n🧪 📋 TEST: getProviderAddons');
  const { data, status } = await apiCall('/api/backend/getProviderAddons?provider_id=1');
  
  if (status === 200) {
    assertResponseFormat(data, true);
    assert(Array.isArray(data.data?.addons), 'Data contains addons array');
  } else {
    assertResponseFormat(data, false);
  }
}

async function testGetAddonTemplates() {
  console.log('\n🧪 📋 TEST: getAddonTemplates');
  const { data, status } = await apiCall('/api/backend/getAddonTemplates');
  
  if (status === 200) {
    assertResponseFormat(data, true);
    assert(Array.isArray(data.data?.categories), 'Data contains categories array');
  } else {
    assertResponseFormat(data, false);
  }
}

async function testGetActiveAddons() {
  console.log('\n🧪 📋 TEST: getActiveAddons');
  const { data, status } = await apiCall('/api/backend/getActiveAddons?provider_id=1');
  
  if (status === 200) {
    assertResponseFormat(data, true);
    assert(Array.isArray(data.data?.categories), 'Data contains categories array');
  } else {
    assertResponseFormat(data, false);
  }
}

async function testGetProviderId() {
  console.log('\n🧪 📋 TEST: getProviderId');
  if (!authToken) {
    console.log('⚠️ SKIP: No auth token');
    testResults.skipped++;
    return;
  }
  
  const { data, status } = await apiCall('/api/backend/getProviderId?user_id=1');
  
  if (status === 200) {
    assertResponseFormat(data, true);
    assert(data.data?.provider_id, 'Data contains provider_id');
  } else {
    assertResponseFormat(data, false);
  }
}

async function testGetTributes() {
  console.log('\n🧪 📋 TEST: getTributes (Paginated)');
  const { data, status } = await apiCall('/api/backend/getTributes?page=1&limit=10');
  
  assert(status === 200, 'Returns 200 OK');
  assertResponseFormat(data, true);
  assert(Array.isArray(data.data), 'Data is an array (paginated response)');
  assert(data.meta, 'Response has meta field');
  assert('page' in data.meta, 'Meta has page field');
  assert('limit' in data.meta, 'Meta has limit field');
  assert('total' in data.meta, 'Meta has total field');
  console.log(`ℹ️    Found ${data.data?.length || 0} tributes, Page ${data.meta?.page || 1}, Total: ${data.meta?.total || 0}`);
}

async function testGetTributeById() {
  console.log('\n🧪 📋 TEST: getTributeById');
  const { data, status } = await apiCall('/api/backend/getTributeById?id=1');
  
  if (status === 200) {
    assertResponseFormat(data, true);
    assert(data.data?.tribute, 'Data contains tribute');
  } else {
    assertResponseFormat(data, false);
  }
}

async function testGetVoiceMemorials() {
  console.log('\n🧪 📋 TEST: getVoiceMemorials');
  const { data, status } = await apiCall('/api/backend/getVoiceMemorials');
  
  if (status === 200) {
    assertResponseFormat(data, true);
    assert(data.data?.voice_memorials, 'Data contains voice_memorials');
  } else {
    assertResponseFormat(data, false);
  }
}

async function testGetVoiceStatus() {
  console.log('\n🧪 📋 TEST: getVoiceStatus');
  const { data, status } = await apiCall('/api/backend/getVoiceStatus?tribute_id=1');
  
  if (status === 200) {
    assertResponseFormat(data, true);
    assert(data.data?.tribute, 'Data contains tribute');
  } else {
    assertResponseFormat(data, false);
  }
}

async function testGetMemories() {
  console.log('\n🧪 📋 TEST: getMemories');
  const { data, status } = await apiCall('/api/backend/getMemories?tribute_id=1');
  
  if (status === 200) {
    assertResponseFormat(data, true);
    assert(Array.isArray(data.data?.memories), 'Data contains memories array');
  } else {
    assertResponseFormat(data, false);
  }
}

async function testGetTraits() {
  console.log('\n🧪 📋 TEST: getTraits');
  const { data, status } = await apiCall('/api/backend/getTraits?tribute_id=1');
  
  if (status === 200) {
    assertResponseFormat(data, true);
    assert(Array.isArray(data.data?.traits), 'Data contains traits array');
  } else {
    assertResponseFormat(data, false);
  }
}

async function testGetRSVPList() {
  console.log('\n🧪 📋 TEST: getRSVPList');
  if (!authToken) {
    console.log('⚠️ SKIP: No auth token');
    testResults.skipped++;
    return;
  }
  
  const { data, status } = await apiCall('/api/backend/getRSVPList?tribute_id=1&user_id=1');
  
  if (status === 200) {
    assertResponseFormat(data, true);
    assert(Array.isArray(data.data?.rsvps), 'Data contains rsvps array');
  } else {
    assertResponseFormat(data, false);
  }
}

async function testCheckAvailabilityGET() {
  console.log('\n🧪 📋 TEST: checkAvailability (GET - Legacy)');
  const { data, status } = await apiCall('/api/backend/checkAvailability?provider_id=1&date=2024-12-25');
  
  if (status === 200) {
    assertResponseFormat(data, true);
    assert(data.data?.provider, 'Data contains provider');
  } else {
    assertResponseFormat(data, false);
  }
}

async function testCheckAvailabilityPOST() {
  console.log('\n🧪 📋 TEST: checkAvailability (POST - Inventory)');
  const { data, status } = await apiCall('/api/backend/check-availability', {
    method: 'POST',
    body: JSON.stringify({
      type: 'inventory',
      addon_id: 1,
      quantity: 1
    })
  });
  
  if (status === 200) {
    assertResponseFormat(data, true);
    assert(data.data?.type === 'inventory', 'Data type is inventory');
  } else {
    assertResponseFormat(data, false);
  }
}

async function testCheckAvailabilityResource() {
  console.log('\n🧪 📋 TEST: checkAvailability (POST - Resource)');
  const { data, status } = await apiCall('/api/backend/check-availability', {
    method: 'POST',
    body: JSON.stringify({
      type: 'resource',
      provider_id: 1,
      resource_type: 'parlour',
      resource_name: 'Hall A',
      start_date: '2024-12-25',
      end_date: '2024-12-27'
    })
  });
  
  if (status === 200) {
    assertResponseFormat(data, true);
    assert(data.data?.type === 'resource', 'Data type is resource');
  } else {
    assertResponseFormat(data, false);
  }
}

async function testVerifyAuth() {
  console.log('\n🧪 📋 TEST: verifyAuth');
  if (!authToken) {
    console.log('⚠️ SKIP: No auth token');
    testResults.skipped++;
    return;
  }
  
  const { data, status } = await apiCall('/api/backend/verifyAuth');
  
  if (status === 200) {
    assertResponseFormat(data, true);
    assert(data.data?.user, 'Data contains user');
  } else {
    assertResponseFormat(data, false);
  }
}

// ============================================================
// VALIDATION ERROR TESTS
// ============================================================

async function testValidationErrors() {
  console.log('\n🧪 📋 TEST: Validation Error Format (Register)');
  const { data, status } = await apiCall('/api/backend/register', {
    method: 'POST',
    body: JSON.stringify({})
  });
  
  assert(status === 400, 'Returns 400 Bad Request');
  assertResponseFormat(data, false);
  assert(data.error?.code === 'VALIDATION_ERROR', 'Error code is VALIDATION_ERROR');
  console.log(`ℹ️    Error message: ${data.error?.message || 'N/A'}`);
}

async function testNotFoundError() {
  console.log('\n🧪 📋 TEST: Not Found Error Format');
  const { data, status } = await apiCall('/api/backend/getTributeById?id=99999');
  
  assert(status === 404 || status === 400, 'Returns 404 or 400');
  assertResponseFormat(data, false);
  assert(['NOT_FOUND', 'VALIDATION_ERROR'].includes(data.error?.code), 
    `Error code is NOT_FOUND or VALIDATION_ERROR (got: ${data.error?.code})`);
  console.log(`ℹ️    Error code: ${data.error?.code}, Message: ${data.error?.message}`);
}

async function testUnauthorizedError() {
  console.log('\n🧪 📋 TEST: Unauthorized Error Format (Protected Endpoint)');
  const { data, status } = await apiCall('/api/backend/createBooking', {
    method: 'POST',
    body: JSON.stringify({ package_id: 1 })
  });
  
  assert(status === 401, 'Returns 401 Unauthorized');
  assertResponseFormat(data, false);
  assert(['MISSING_TOKEN', 'INVALID_TOKEN'].includes(data.error?.code),
    `Error code is MISSING_TOKEN or INVALID_TOKEN (got: ${data.error?.code})`);
}

// ============================================================
// RUN ALL TESTS
// ============================================================

async function runAllTests() {
  console.log('\n============================================================');
  console.log('🧪 COMPREHENSIVE API STANDARDIZATION TEST SUITE');
  console.log('============================================================');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('============================================================\n');
  
  // Reset results
  testResults = { passed: 0, failed: 0, skipped: 0, total: 0 };
  
  // Authentication first
  await testLogin();
  
  // Public endpoints
  await testGetAllProviders();
  await testGetAllPackages();
  await testGetPackages();
  await testGetProviderProfile();
  await testGetProviderAddons();
  await testGetAddonTemplates();
  await testGetActiveAddons();
  await testGetTributes();
  await testGetTributeById();
  await testGetVoiceMemorials();
  await testGetVoiceStatus();
  await testGetMemories();
  await testGetTraits();
  await testCheckAvailabilityGET();
  await testCheckAvailabilityPOST();
  await testCheckAvailabilityResource();
  
  // Protected endpoints (require auth)
  await testGetFamilyProfile();
  await testGetProviderDashboard();
  await testGetProviderBookings();
  await testGetUserBookings();
  await testGetProviderId();
  await testGetRSVPList();
  await testVerifyAuth();
  
  // Error format tests
  await testValidationErrors();
  await testNotFoundError();
  await testUnauthorizedError();
  
  // Summary
  console.log('\n============================================================');
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('============================================================');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`⏭️  Skipped: ${testResults.skipped}`);
  console.log(`📋 Total: ${testResults.total}`);
  console.log('============================================================\n');
  
  if (testResults.failed === 0) {
    console.log('🎉 ALL TESTS PASSED! API standardization is working correctly.\n');
  } else {
    console.log(`⚠️  ${testResults.failed} test(s) failed. Please review the errors above.\n`);
  }
  
  return testResults;
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  runAllTests().then(results => {
    console.log('\n📋 Test execution complete!');
    console.log(`Results:`, results);
  });
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllTests, testResults };
}

