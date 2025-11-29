<?php
// TEST USER CREATION SCRIPT
// Run this to test if user registration works
// Access: http://localhost/smart_funeral_system/test-user-creation.php

header("Content-Type: application/json");
include "backend/db_connect.php";

echo "<h1>User Creation Test</h1>";
echo "<pre>";

// Check if users table exists
echo "1. Checking if 'users' table exists...\n";
$check_table = $conn->query("SHOW TABLES LIKE 'users'");
if ($check_table->num_rows > 0) {
    echo "   ✅ Users table exists!\n\n";
} else {
    echo "   ❌ Users table NOT found! Run the database restoration SQL first.\n\n";
    exit;
}

// Check users table structure
echo "2. Checking 'users' table structure...\n";
$columns = $conn->query("DESCRIBE users");
while ($col = $columns->fetch_assoc()) {
    echo "   - " . $col['Field'] . " (" . $col['Type'] . ")\n";
}
echo "\n";

// Check if service_provider table exists
echo "3. Checking if 'service_provider' table exists...\n";
$check_sp = $conn->query("SHOW TABLES LIKE 'service_provider'");
if ($check_sp->num_rows > 0) {
    echo "   ✅ Service provider table exists!\n\n";
} else {
    echo "   ❌ Service provider table NOT found!\n\n";
}

// Test user creation (customer)
echo "4. Testing customer user creation...\n";
$test_name = "Test Customer " . time();
$test_email = "customer" . time() . "@test.com";
$test_password = password_hash("password123", PASSWORD_DEFAULT);
$test_role = "customer";

$stmt = $conn->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $test_name, $test_email, $test_password, $test_role);

if ($stmt->execute()) {
    echo "   ✅ Customer user created successfully!\n";
    echo "   - User ID: " . $stmt->insert_id . "\n";
    echo "   - Name: $test_name\n";
    echo "   - Email: $test_email\n\n";
    
    // Delete test user
    $conn->query("DELETE FROM users WHERE email = '$test_email'");
    echo "   ✅ Test user cleaned up.\n\n";
} else {
    echo "   ❌ Failed to create customer user!\n";
    echo "   Error: " . $stmt->error . "\n\n";
}

// Test provider creation
echo "5. Testing provider user creation...\n";
$test_provider_name = "Test Provider " . time();
$test_provider_email = "provider" . time() . "@test.com";
$test_provider_password = password_hash("password123", PASSWORD_DEFAULT);
$test_provider_role = "provider";

$stmt2 = $conn->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)");
$stmt2->bind_param("ssss", $test_provider_name, $test_provider_email, $test_provider_password, $test_provider_role);

if ($stmt2->execute()) {
    $provider_user_id = $stmt2->insert_id;
    echo "   ✅ Provider user created successfully!\n";
    echo "   - User ID: $provider_user_id\n";
    echo "   - Name: $test_provider_name\n";
    echo "   - Email: $test_provider_email\n\n";
    
    // Test service_provider table insertion
    echo "6. Testing service_provider table insertion...\n";
    $sp_stmt = $conn->prepare("INSERT INTO service_provider (user_id, company_name, phone, email, is_active) VALUES (?, ?, '', ?, 1)");
    $sp_stmt->bind_param("iss", $provider_user_id, $test_provider_name, $test_provider_email);
    
    if ($sp_stmt->execute()) {
        echo "   ✅ Service provider record created!\n";
        echo "   - Provider ID: " . $sp_stmt->insert_id . "\n\n";
        
        // Clean up
        $conn->query("DELETE FROM service_provider WHERE user_id = $provider_user_id");
        $conn->query("DELETE FROM users WHERE email = '$test_provider_email'");
        echo "   ✅ Test provider cleaned up.\n\n";
    } else {
        echo "   ❌ Failed to create service provider record!\n";
        echo "   Error: " . $sp_stmt->error . "\n\n";
        
        // Clean up user even if provider failed
        $conn->query("DELETE FROM users WHERE email = '$test_provider_email'");
    }
} else {
    echo "   ❌ Failed to create provider user!\n";
    echo "   Error: " . $stmt2->error . "\n\n";
}

// Check existing users
echo "7. Current users in database:\n";
$users = $conn->query("SELECT user_id, name, email, role FROM users");
if ($users->num_rows > 0) {
    while ($user = $users->fetch_assoc()) {
        echo "   - ID: {$user['user_id']}, Name: {$user['name']}, Email: {$user['email']}, Role: {$user['role']}\n";
    }
} else {
    echo "   No users found.\n";
}

echo "\n";
echo "========================================\n";
echo "TEST COMPLETE!\n";
echo "========================================\n";
echo "\nIf all tests passed, your registration system is working correctly.\n";
echo "You can now use the frontend registration form.\n";

$conn->close();
?>
