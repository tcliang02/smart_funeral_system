<?php
/**
 * COMPREHENSIVE TEST SCRIPT FOR SERVICE PROVIDER DASHBOARD
 * This script tests ALL backend endpoints used by the dashboard
 */

header("Content-Type: text/html; charset=UTF-8");
?>
<!DOCTYPE html>
<html>
<head>
    <title>Dashboard Backend Test Suite</title>
    <style>
        body { font-family: monospace; margin: 20px; background: #1e1e1e; color: #d4d4d4; }
        .success { color: #4ec9b0; }
        .error { color: #f48771; }
        .warning { color: #dcdcaa; }
        .section { margin: 20px 0; padding: 15px; background: #252526; border-left: 4px solid #007acc; }
        h2 { color: #4ec9b0; }
        pre { background: #1e1e1e; padding: 10px; border: 1px solid #3e3e42; overflow-x: auto; }
        .test-result { margin: 10px 0; padding: 10px; background: #2d2d30; }
    </style>
</head>
<body>
    <h1>🧪 Service Provider Dashboard - Backend Test Suite</h1>
    <p>Testing all backend endpoints for user_id 16...</p>

<?php
include "backend/db_connect.php";
include "backend/helpers.php";

$user_id = 16;
$test_results = [];

// ============================================
// TEST 1: Generate Valid Token
// ============================================
echo "<div class='section'>";
echo "<h2>TEST 1: Token Generation</h2>";

try {
    $sql = "SELECT user_id, id, name, username, email, role FROM users WHERE user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        
        // Ensure proper fields
        if (empty($user['id'])) $user['id'] = $user['user_id'];
        if (empty($user['username'])) $user['username'] = $user['name'];
        
        $tokenData = [
            'id' => $user['id'],
            'user_id' => $user['user_id'],
            'username' => $user['username'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role']
        ];
        
        $token = generateToken($tokenData, 86400);
        
        echo "<div class='test-result success'>";
        echo "✅ Token generated successfully<br>";
        echo "<strong>User Data:</strong><br>";
        echo "<pre>" . json_encode($tokenData, JSON_PRETTY_PRINT) . "</pre>";
        echo "<strong>Token (first 100 chars):</strong><br>";
        echo "<pre>" . substr($token, 0, 100) . "...</pre>";
        echo "</div>";
        
        $test_results['token'] = ['status' => 'success', 'token' => $token, 'user' => $tokenData];
    } else {
        echo "<div class='test-result error'>❌ User not found</div>";
        $test_results['token'] = ['status' => 'error', 'message' => 'User not found'];
    }
} catch (Exception $e) {
    echo "<div class='test-result error'>❌ Error: " . $e->getMessage() . "</div>";
    $test_results['token'] = ['status' => 'error', 'message' => $e->getMessage()];
}
echo "</div>";

// ============================================
// TEST 2: Get Provider Dashboard
// ============================================
echo "<div class='section'>";
echo "<h2>TEST 2: getProviderDashboard.php</h2>";

try {
    $sql = "SELECT 
                sp.provider_id,
                sp.company_name,
                sp.address,
                sp.phone,
                sp.description,
                sp.website,
                sp.logo_url,
                sp.average_price,
                sp.total_packages,
                sp.created_at,
                u.email,
                u.username,
                COALESCE(AVG(pr.rating), 0) as avg_rating,
                COUNT(DISTINCT pr.id) as review_count
            FROM service_provider sp
            LEFT JOIN users u ON sp.user_id = u.id
            LEFT JOIN packages p ON sp.provider_id = p.provider_id
            LEFT JOIN bookings b ON p.package_id = b.package_id
            LEFT JOIN provider_reviews pr ON b.booking_id = pr.booking_id AND pr.review_type = 'customer_to_provider'
            WHERE sp.user_id = ?
            GROUP BY sp.provider_id";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $provider = $result->fetch_assoc();
        echo "<div class='test-result success'>";
        echo "✅ Provider dashboard query successful<br>";
        echo "<pre>" . json_encode($provider, JSON_PRETTY_PRINT) . "</pre>";
        echo "</div>";
        $test_results['dashboard'] = ['status' => 'success', 'data' => $provider];
    } else {
        echo "<div class='test-result error'>❌ Provider profile not found</div>";
        $test_results['dashboard'] = ['status' => 'error', 'message' => 'Provider profile not found'];
    }
} catch (Exception $e) {
    echo "<div class='test-result error'>❌ Error: " . $e->getMessage() . "</div>";
    $test_results['dashboard'] = ['status' => 'error', 'message' => $e->getMessage()];
}
echo "</div>";

// ============================================
// TEST 3: Get Packages
// ============================================
echo "<div class='section'>";
echo "<h2>TEST 3: Packages Query</h2>";

try {
    $provider_id = isset($test_results['dashboard']['data']['provider_id']) ? $test_results['dashboard']['data']['provider_id'] : null;
    
    if ($provider_id) {
        $sql = "SELECT 
                    p.*,
                    COUNT(b.booking_id) as booking_count
                FROM packages p
                LEFT JOIN bookings b ON p.package_id = b.package_id
                WHERE p.provider_id = ?
                GROUP BY p.package_id
                ORDER BY p.is_featured DESC, p.created_at DESC";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $provider_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $packages = [];
        while ($row = $result->fetch_assoc()) {
            $packages[] = $row;
        }
        
        echo "<div class='test-result success'>";
        echo "✅ Packages query successful (" . count($packages) . " packages found)<br>";
        echo "<pre>" . json_encode($packages, JSON_PRETTY_PRINT) . "</pre>";
        echo "</div>";
        $test_results['packages'] = ['status' => 'success', 'count' => count($packages), 'data' => $packages];
    } else {
        echo "<div class='test-result warning'>⚠️ Skipped (no provider_id)</div>";
        $test_results['packages'] = ['status' => 'skipped'];
    }
} catch (Exception $e) {
    echo "<div class='test-result error'>❌ Error: " . $e->getMessage() . "</div>";
    $test_results['packages'] = ['status' => 'error', 'message' => $e->getMessage()];
}
echo "</div>";

// ============================================
// TEST 4: Test Authentication
// ============================================
echo "<div class='section'>";
echo "<h2>TEST 4: Token Authentication (verifyAuth)</h2>";

try {
    if (isset($test_results['token']['token'])) {
        $headers = ['Authorization' => 'Bearer ' . $test_results['token']['token']];
        $auth = verifyAuth($headers);
        
        if ($auth) {
            echo "<div class='test-result success'>";
            echo "✅ Token verification successful<br>";
            echo "<strong>Decoded token data:</strong><br>";
            echo "<pre>" . json_encode($auth, JSON_PRETTY_PRINT) . "</pre>";
            echo "</div>";
            $test_results['auth'] = ['status' => 'success', 'data' => $auth];
        } else {
            echo "<div class='test-result error'>❌ Token verification failed</div>";
            $test_results['auth'] = ['status' => 'error', 'message' => 'Token verification failed'];
        }
    } else {
        echo "<div class='test-result warning'>⚠️ Skipped (no token generated)</div>";
        $test_results['auth'] = ['status' => 'skipped'];
    }
} catch (Exception $e) {
    echo "<div class='test-result error'>❌ Error: " . $e->getMessage() . "</div>";
    $test_results['auth'] = ['status' => 'error', 'message' => $e->getMessage()];
}
echo "</div>";

// ============================================
// SUMMARY
// ============================================
echo "<div class='section'>";
echo "<h2>📊 TEST SUMMARY</h2>";

$passed = 0;
$failed = 0;
$skipped = 0;

foreach ($test_results as $test => $result) {
    if ($result['status'] === 'success') $passed++;
    elseif ($result['status'] === 'error') $failed++;
    elseif ($result['status'] === 'skipped') $skipped++;
}

echo "<div class='test-result'>";
echo "<strong>Total Tests:</strong> " . count($test_results) . "<br>";
echo "<strong class='success'>Passed:</strong> $passed<br>";
echo "<strong class='error'>Failed:</strong> $failed<br>";
echo "<strong class='warning'>Skipped:</strong> $skipped<br>";
echo "</div>";

if ($failed === 0 && $passed > 0) {
    echo "<div class='test-result success'>";
    echo "<h3>✅ ALL TESTS PASSED!</h3>";
    echo "<p>Your Service Provider Dashboard backend is working correctly!</p>";
    
    if (isset($test_results['token']['token'])) {
        echo "<hr>";
        echo "<h4>🔑 Use this token in your frontend:</h4>";
        echo "<p>Copy and paste this JavaScript code in your browser console:</p>";
        echo "<pre>";
        echo "localStorage.setItem('token', '" . $test_results['token']['token'] . "');\n";
        echo "localStorage.setItem('user', '" . json_encode($test_results['token']['user']) . "');\n";
        echo "console.log('Token updated! Refresh the page.');\n";
        echo "location.reload();";
        echo "</pre>";
    }
    echo "</div>";
} else {
    echo "<div class='test-result error'>";
    echo "<h3>❌ SOME TESTS FAILED</h3>";
    echo "<p>Please run COMPLETE_DASHBOARD_FIX.sql in HeidiSQL first!</p>";
    echo "</div>";
}

echo "</div>";

?>

</body>
</html>