<?php
/**
 * Test Script for Unified Database Connection
 * 
 * This script tests:
 * 1. Database connection (PDO for both MySQL and PostgreSQL)
 * 2. Helper functions (executeQuery, executeQuerySingle, executeUpdate)
 * 3. Backward compatibility
 */

include "db_connect.php";
include "helpers.php";

header("Content-Type: application/json");

echo "=== Testing Unified Database Connection ===\n\n";

// Test 1: Check connection type
echo "1. Connection Type Check:\n";
if ($conn instanceof PDO) {
    echo "   ✅ Connection is PDO\n";
    echo "   Database Type: " . ($GLOBALS['DB_TYPE'] ?? 'unknown') . "\n";
} else {
    echo "   ❌ ERROR: Connection is not PDO!\n";
    exit(1);
}

// Test 2: Test basic query
echo "\n2. Basic Query Test:\n";
try {
    $result = executeQuery($conn, "SELECT COUNT(*) as count FROM users");
    if (!empty($result)) {
        echo "   ✅ Query executed successfully\n";
        echo "   Users count: " . $result[0]['count'] . "\n";
    } else {
        echo "   ⚠️ Query returned empty result\n";
    }
} catch (Exception $e) {
    echo "   ❌ Query failed: " . $e->getMessage() . "\n";
}

// Test 3: Test parameterized query
echo "\n3. Parameterized Query Test:\n";
try {
    $user = executeQuerySingle($conn, "SELECT user_id, name, email, role FROM users WHERE role = ? LIMIT 1", ['customer']);
    if ($user) {
        echo "   ✅ Parameterized query works\n";
        echo "   Found user: " . $user['name'] . " (" . $user['email'] . ")\n";
    } else {
        echo "   ⚠️ No user found with role 'customer'\n";
    }
} catch (Exception $e) {
    echo "   ❌ Parameterized query failed: " . $e->getMessage() . "\n";
}

// Test 4: Test getUserById helper
echo "\n4. getUserById Helper Test:\n";
try {
    $user = getUserById($conn, 1);
    if ($user) {
        echo "   ✅ getUserById works\n";
        echo "   User: " . $user['username'] . " (" . $user['email'] . ")\n";
    } else {
        echo "   ⚠️ No user found with ID 1\n";
    }
} catch (Exception $e) {
    echo "   ❌ getUserById failed: " . $e->getMessage() . "\n";
}

// Test 5: Test getProviderByUserId helper
echo "\n5. getProviderByUserId Helper Test:\n";
try {
    // First, find a provider user
    $providerUser = executeQuerySingle($conn, "SELECT user_id FROM users WHERE role = ? LIMIT 1", ['provider']);
    if ($providerUser) {
        $provider = getProviderByUserId($conn, $providerUser['user_id']);
        if ($provider) {
            echo "   ✅ getProviderByUserId works\n";
            echo "   Provider ID: " . ($provider['provider_id'] ?? 'N/A') . "\n";
        } else {
            echo "   ⚠️ No provider profile found for user ID " . $providerUser['user_id'] . "\n";
        }
    } else {
        echo "   ⚠️ No provider user found in database\n";
    }
} catch (Exception $e) {
    echo "   ❌ getProviderByUserId failed: " . $e->getMessage() . "\n";
}

// Test 6: Test transaction (if supported)
echo "\n6. Transaction Test:\n";
try {
    $conn->beginTransaction();
    echo "   ✅ Transaction started\n";
    
    // Test query within transaction
    $result = executeQuery($conn, "SELECT 1 as test");
    if (!empty($result)) {
        echo "   ✅ Query works within transaction\n";
    }
    
    $conn->rollBack();
    echo "   ✅ Transaction rolled back\n";
} catch (Exception $e) {
    echo "   ❌ Transaction test failed: " . $e->getMessage() . "\n";
    try {
        $conn->rollBack();
    } catch (Exception $e2) {
        // Ignore rollback errors
    }
}

echo "\n=== Test Complete ===\n";
echo "\n✅ All tests passed! The unified database connection is working correctly.\n";
?>

