<?php
// Test Script for Critical Fixes

include 'backend/db_connect.php';
include 'backend/helpers.php';

echo "<h1>System Critical Fixes Verification</h1>";

// 1. Test Database Connection (PDOAdapter)
echo "<h2>1. Database Connection (PDOAdapter)</h2>";
try {
    if (isset($conn) && $conn instanceof PDOAdapter) {
        echo "<p style='color:green'>✅ Connection is PDOAdapter instance (Compatible with Supabase!)</p>";
        $stmt = $conn->query("SELECT 1");
        echo "<p style='color:green'>✅ Database query successful</p>";
    } else {
        echo "<p style='color:red'>❌ Connection is NOT PDOAdapter instance</p>";
        echo "<p>Type: " . (is_object($conn) ? get_class($conn) : gettype($conn)) . "</p>";
    }
} catch (Exception $e) {
    echo "<p style='color:orange'>⚠️ Database check skipped/failed: " . $e->getMessage() . "</p>";
}

// 2. Test JWT Security
echo "<h2>2. JWT Security</h2>";

// Create a mock user
$user = [
    'user_id' => 123,
    'name' => 'Test User',
    'role' => 'admin'
];

// Generate Token
$token = generateToken($user);
echo "<p>Generated Token: " . substr($token, 0, 50) . "...</p>";

// Verify Token
$headers = ['Authorization' => 'Bearer ' . $token];
$verifiedUser = verifyAuth($headers);

if ($verifiedUser && $verifiedUser['user_id'] == 123) {
    echo "<p style='color:green'>✅ Token verification successful</p>";
} else {
    echo "<p style='color:red'>❌ Token verification failed</p>";
}

// Test Tampered Token
echo "<h3>Tamper Test</h3>";
$parts = explode('.', $token);
$payload = json_decode(base64_decode($parts[1]), true);
$payload['role'] = 'superadmin'; // Tamper
$tamperedToken = $parts[0] . '.' . str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(json_encode($payload))) . '.' . $parts[2];

$headersTampered = ['Authorization' => 'Bearer ' . $tamperedToken];
$verifiedTampered = verifyAuth($headersTampered);

if ($verifiedTampered === false) {
    echo "<p style='color:green'>✅ Tampered token correctly rejected</p>";
} else {
    echo "<p style='color:red'>❌ SECURITY FAIL: Tampered token was accepted!</p>";
}
?>
