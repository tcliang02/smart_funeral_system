<?php
/**
 * COMPREHENSIVE SYSTEM TEST WITH SAMPLE DATA
 * This script will:
 * 1. Check database compatibility
 * 2. Create sample test data
 * 3. Test all major features
 * 4. Verify frontend-backend integration
 */

header("Content-Type: text/html; charset=UTF-8");
include "backend/db_connect.php";

?>
<!DOCTYPE html>
<html>
<head>
    <title>Complete System Test</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        h1 { color: #667eea; margin-bottom: 10px; }
        h2 { color: #764ba2; margin: 25px 0 15px 0; padding: 10px; background: #f0f0f0; border-radius: 8px; }
        h3 { color: #333; margin: 15px 0 10px 0; }
        .success { color: #28a745; font-weight: bold; }
        .error { color: #dc3545; font-weight: bold; }
        .warning { color: #ffc107; font-weight: bold; }
        .info { color: #17a2b8; font-weight: bold; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            background: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        th {
            background: #667eea;
            color: white;
            padding: 12px;
            text-align: left;
        }
        td {
            padding: 10px;
            border-bottom: 1px solid #e0e0e0;
        }
        tr:hover { background: #f5f5f5; }
        .code {
            background: #2d2d2d;
            color: #f8f8f2;
            padding: 12px;
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            margin: 10px 0;
            overflow-x: auto;
        }
        .test-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin: 15px 0;
            border-left: 5px solid #667eea;
        }
        .badge {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: bold;
            margin: 0 5px;
        }
        .badge-success { background: #d4edda; color: #155724; }
        .badge-error { background: #f8d7da; color: #721c24; }
        .badge-warning { background: #fff3cd; color: #856404; }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .summary-card {
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            color: white;
        }
        .summary-card h3 { color: white; font-size: 36px; margin-bottom: 5px; }
        .summary-card p { opacity: 0.9; }
        .card-users { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .card-providers { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
        .card-packages { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
        .card-addons { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
        .btn {
            display: inline-block;
            padding: 10px 20px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin: 5px;
            font-weight: bold;
        }
        .btn:hover { background: #5568d3; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧪 Complete System Test with Sample Data</h1>
        <p style="color: #666; margin-bottom: 20px;">Testing all components and creating realistic test data</p>

<?php

$results = [];
$test_users = [];
$test_providers = [];
$test_packages = [];

// ============================================================
// TEST 1: Database Structure Check
// ============================================================
echo '<h2>📊 Test 1: Database Structure</h2>';
echo '<div class="test-section">';

$tables_to_check = [
    'users' => ['user_id', 'name', 'email', 'password', 'role'],
    'service_provider' => ['provider_id', 'user_id', 'company_name', 'phone', 'email'],
    'packages' => ['package_id', 'provider_id', 'package_name', 'price'],
    'bookings' => ['booking_id', 'user_id', 'provider_id', 'package_id', 'customer_name'],
    'addon_categories' => ['category_id', 'category_name'],
    'addon_templates' => ['template_id', 'category_id', 'template_name', 'suggested_price'],
    'provider_addons' => ['addon_id', 'provider_id', 'addon_name', 'price']
];

echo '<table>';
echo '<tr><th>Table</th><th>Status</th><th>Required Columns</th></tr>';

foreach ($tables_to_check as $table => $columns) {
    $check = $conn->query("SHOW TABLES LIKE '$table'");
    if ($check && $check->num_rows > 0) {
        $col_check = $conn->query("DESCRIBE $table");
        $existing_cols = [];
        while ($col = $col_check->fetch_assoc()) {
            $existing_cols[] = $col['Field'];
        }
        
        $missing = array_diff($columns, $existing_cols);
        
        if (empty($missing)) {
            echo "<tr><td>$table</td><td><span class='success'>✅ PERFECT</span></td><td>All " . count($columns) . " columns exist</td></tr>";
            $results[$table] = 'pass';
        } else {
            echo "<tr><td>$table</td><td><span class='warning'>⚠️ INCOMPLETE</span></td><td>Missing: " . implode(', ', $missing) . "</td></tr>";
            $results[$table] = 'warning';
        }
    } else {
        echo "<tr><td>$table</td><td><span class='error'>❌ MISSING</span></td><td>Table doesn't exist!</td></tr>";
        $results[$table] = 'fail';
    }
}

echo '</table>';
echo '</div>';

// ============================================================
// TEST 2: Create Sample Users
// ============================================================
echo '<h2>👥 Test 2: Creating Sample Users</h2>';
echo '<div class="test-section">';

// Clean up old test data
$conn->query("DELETE FROM users WHERE email LIKE '%@test.example%'");

$sample_users = [
    ['name' => 'John Customer', 'email' => 'john@test.example', 'password' => password_hash('password123', PASSWORD_DEFAULT), 'role' => 'customer'],
    ['name' => 'Mary Customer', 'email' => 'mary@test.example', 'password' => password_hash('password123', PASSWORD_DEFAULT), 'role' => 'customer'],
    ['name' => 'Peaceful Rest Funeral', 'email' => 'peaceful@test.example', 'password' => password_hash('password123', PASSWORD_DEFAULT), 'role' => 'provider'],
    ['name' => 'Eternal Memory Services', 'email' => 'eternal@test.example', 'password' => password_hash('password123', PASSWORD_DEFAULT), 'role' => 'provider'],
    ['name' => 'Lotus Buddhist Funeral', 'email' => 'lotus@test.example', 'password' => password_hash('password123', PASSWORD_DEFAULT), 'role' => 'provider'],
];

echo '<table>';
echo '<tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr>';

foreach ($sample_users as $user) {
    $stmt = $conn->prepare("INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)");
    $phone = '+60' . rand(100000000, 199999999);
    $stmt->bind_param("sssss", $user['name'], $user['email'], $user['password'], $user['role'], $phone);
    
    if ($stmt->execute()) {
        $user_id = $stmt->insert_id;
        $test_users[] = ['id' => $user_id, 'name' => $user['name'], 'email' => $user['email'], 'role' => $user['role']];
        echo "<tr><td>{$user['name']}</td><td>{$user['email']}</td><td>{$user['role']}</td><td><span class='success'>✅ Created (ID: $user_id)</span></td></tr>";
        
        // If provider, create service_provider record
        if ($user['role'] === 'provider') {
            $sp_stmt = $conn->prepare("INSERT INTO service_provider (user_id, company_name, phone, email, description, city, state, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)");
            $description = "Professional funeral services with compassion and dignity";
            $city = "Kuala Lumpur";
            $state = "Federal Territory";
            $sp_stmt->bind_param("issssss", $user_id, $user['name'], $phone, $user['email'], $description, $city, $state);
            if ($sp_stmt->execute()) {
                $provider_id = $sp_stmt->insert_id;
                $test_providers[] = ['id' => $provider_id, 'user_id' => $user_id, 'name' => $user['name']];
            }
        }
    } else {
        echo "<tr><td>{$user['name']}</td><td>{$user['email']}</td><td>{$user['role']}</td><td><span class='error'>❌ Failed</span></td></tr>";
    }
}

echo '</table>';

echo '<div class="code">';
echo "Test Login Credentials:<br>";
echo "Customer: john@test.example / password123<br>";
echo "Provider: peaceful@test.example / password123";
echo '</div>';

echo '</div>';

// ============================================================
// TEST 3: Create Sample Packages
// ============================================================
echo '<h2>📦 Test 3: Creating Sample Packages</h2>';
echo '<div class="test-section">';

if (count($test_providers) > 0) {
    $sample_packages = [
        ['name' => 'Basic Funeral Package', 'price' => 2500.00, 'description' => 'Essential funeral services with basic arrangements'],
        ['name' => 'Standard Funeral Package', 'price' => 5000.00, 'description' => 'Comprehensive funeral services with Buddhist rituals'],
        ['name' => 'Premium Funeral Package', 'price' => 8500.00, 'description' => 'Deluxe services with traditional ceremonies'],
        ['name' => 'Buddhist Complete Package', 'price' => 12000.00, 'description' => '49-day memorial service included'],
    ];
    
    echo '<table>';
    echo '<tr><th>Package Name</th><th>Provider</th><th>Price</th><th>Status</th></tr>';
    
    foreach ($test_providers as $provider) {
        foreach ($sample_packages as $pkg) {
            $features = json_encode(['Professional service', 'Transportation', 'Documentation assistance', 'Family support']);
            $image = 'uploads/default-package.jpg';
            $stmt = $conn->prepare("INSERT INTO packages (provider_id, package_name, description, price, features, image, category, is_active, is_popular) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1)");
            $category = 'Buddhist Funeral';
            $stmt->bind_param("issdsss", $provider['id'], $pkg['name'], $pkg['description'], $pkg['price'], $features, $image, $category);
            
            if ($stmt->execute()) {
                $package_id = $stmt->insert_id;
                $test_packages[] = ['id' => $package_id, 'provider_id' => $provider['id'], 'name' => $pkg['name'], 'price' => $pkg['price']];
                echo "<tr><td>{$pkg['name']}</td><td>{$provider['name']}</td><td>RM " . number_format($pkg['price'], 2) . "</td><td><span class='success'>✅ Created</span></td></tr>";
            }
        }
    }
    
    echo '</table>';
} else {
    echo '<p class="error">❌ No providers available to create packages</p>';
}

echo '</div>';

// ============================================================
// TEST 4: Test Add-on System
// ============================================================
echo '<h2>🎨 Test 4: Buddhist Add-on System</h2>';
echo '<div class="test-section">';

$category_count = $conn->query("SELECT COUNT(*) as count FROM addon_categories")->fetch_assoc()['count'];
$template_count = $conn->query("SELECT COUNT(*) as count FROM addon_templates")->fetch_assoc()['count'];

echo '<table>';
echo '<tr><th>Component</th><th>Count</th><th>Status</th></tr>';
echo "<tr><td>Add-on Categories</td><td>$category_count</td><td>";
if ($category_count >= 9) {
    echo "<span class='success'>✅ Complete (Expected: 9)</span>";
} else {
    echo "<span class='warning'>⚠️ Incomplete (Expected: 9, Got: $category_count)</span>";
}
echo "</td></tr>";

echo "<tr><td>Add-on Templates</td><td>$template_count</td><td>";
if ($template_count >= 49) {
    echo "<span class='success'>✅ Complete (Expected: 49)</span>";
} else {
    echo "<span class='warning'>⚠️ Incomplete (Expected: 49, Got: $template_count)</span>";
}
echo "</td></tr>";
echo '</table>';

// Show sample add-ons
echo '<h3>Sample Add-ons by Category:</h3>';
$addons = $conn->query("
    SELECT c.category_name, t.template_name, t.suggested_price 
    FROM addon_templates t
    JOIN addon_categories c ON t.category_id = c.category_id
    ORDER BY c.display_order, t.is_popular DESC
    LIMIT 10
");

echo '<table>';
echo '<tr><th>Category</th><th>Service Name</th><th>Price</th></tr>';
while ($addon = $addons->fetch_assoc()) {
    echo "<tr><td>{$addon['category_name']}</td><td>{$addon['template_name']}</td><td>RM " . number_format($addon['suggested_price'], 2) . "</td></tr>";
}
echo '</table>';

echo '</div>';

// ============================================================
// TEST 5: Create Sample Booking
// ============================================================
echo '<h2>📝 Test 5: Creating Sample Booking</h2>';
echo '<div class="test-section">';

if (count($test_users) > 0 && count($test_packages) > 0) {
    // Get a customer and a package
    $customer = $test_users[0]; // John Customer
    $package = $test_packages[0];
    
    $booking_id = 'BK' . date('Ymd') . rand(1000, 9999);
    $service_date = date('Y-m-d', strtotime('+7 days'));
    $total_amount = $package['price'] + 1700.00; // Package + some add-ons
    
    $stmt = $conn->prepare("
        INSERT INTO bookings (
            booking_id, user_id, provider_id, package_id, 
            booking_date, service_date, service_time, service_location,
            total_amount, status, customer_name, customer_email, customer_phone,
            deceased_name, deceased_age, deceased_religion, payment_status
        ) VALUES (?, ?, ?, ?, CURDATE(), ?, '10:00 AM', 'Funeral Home, KL', ?, 'confirmed', ?, ?, '+60123456789', 'Mr. Wong', 75, 'Buddhist', 'paid')
    ");
    
    $stmt->bind_param("siiisd ss", 
        $booking_id, 
        $customer['id'], 
        $package['provider_id'], 
        $package['id'],
        $service_date,
        $total_amount,
        $customer['name'],
        $customer['email']
    );
    
    if ($stmt->execute()) {
        echo "<p class='success'>✅ Sample booking created: $booking_id</p>";
        
        // Add some add-ons to the booking
        $sample_addons = [
            ['name' => '7-Day Buddhist Prayer Ceremony', 'price' => 2500.00, 'category' => 'Buddhist Rituals & Ceremonies'],
            ['name' => 'White Lotus Arrangement', 'price' => 450.00, 'category' => 'Flowers & Offerings'],
        ];
        
        foreach ($sample_addons as $addon) {
            $addon_stmt = $conn->prepare("INSERT INTO booking_addons (booking_id, addon_id, addon_name, addon_price, quantity) VALUES (?, 0, ?, ?, 1)");
            $addon_stmt->bind_param("ssd", $booking_id, $addon['name'], $addon['price']);
            $addon_stmt->execute();
        }
        
        echo '<table>';
        echo '<tr><th>Booking ID</th><th>Customer</th><th>Package</th><th>Service Date</th><th>Total</th><th>Status</th></tr>';
        echo "<tr><td>$booking_id</td><td>{$customer['name']}</td><td>{$package['name']}</td><td>$service_date</td><td>RM " . number_format($total_amount, 2) . "</td><td><span class='badge badge-success'>CONFIRMED</span></td></tr>";
        echo '</table>';
    } else {
        echo "<p class='error'>❌ Failed to create booking: " . $stmt->error . "</p>";
    }
} else {
    echo '<p class="warning">⚠️ Cannot create booking - missing users or packages</p>';
}

echo '</div>';

// ============================================================
// TEST 6: Frontend-Backend Integration Check
// ============================================================
echo '<h2>🔗 Test 6: Frontend-Backend Integration</h2>';
echo '<div class="test-section">';

echo '<h3>Testing API Endpoints:</h3>';
echo '<table>';
echo '<tr><th>Endpoint</th><th>Test</th><th>Status</th></tr>';

// Test 1: Get Packages
$test_url = 'backend/getPackages.php';
if (file_exists($test_url)) {
    echo "<tr><td>getPackages.php</td><td>File exists</td><td><span class='success'>✅</span></td></tr>";
} else {
    echo "<tr><td>getPackages.php</td><td>File exists</td><td><span class='error'>❌</span></td></tr>";
}

// Test 2: Login endpoint
$test_url = 'backend/login.php';
$login_content = file_get_contents($test_url);
if (strpos($login_content, 'name = ?') !== false || strpos($login_content, 'user_id') !== false) {
    echo "<tr><td>login.php</td><td>Uses correct columns</td><td><span class='success'>✅</span></td></tr>";
} else {
    echo "<tr><td>login.php</td><td>Uses correct columns</td><td><span class='warning'>⚠️ May have issues</span></td></tr>";
}

// Test 3: Register endpoint
$test_url = 'backend/register.php';
$register_content = file_get_contents($test_url);
if (strpos($register_content, 'INSERT INTO users (name,') !== false) {
    echo "<tr><td>register.php</td><td>Uses correct columns</td><td><span class='success'>✅</span></td></tr>";
} else {
    echo "<tr><td>register.php</td><td>Uses correct columns</td><td><span class='warning'>⚠️ May have issues</span></td></tr>";
}

echo '</table>';
echo '</div>';

// ============================================================
// SUMMARY
// ============================================================
$user_count = $conn->query("SELECT COUNT(*) as count FROM users")->fetch_assoc()['count'];
$provider_count = $conn->query("SELECT COUNT(*) as count FROM service_provider")->fetch_assoc()['count'];
$package_count = $conn->query("SELECT COUNT(*) as count FROM packages")->fetch_assoc()['count'];
$booking_count = $conn->query("SELECT COUNT(*) as count FROM bookings")->fetch_assoc()['count'];

echo '<h2>📊 System Summary</h2>';
echo '<div class="summary-grid">';
echo '<div class="summary-card card-users"><h3>' . $user_count . '</h3><p>Total Users</p></div>';
echo '<div class="summary-card card-providers"><h3>' . $provider_count . '</h3><p>Service Providers</p></div>';
echo '<div class="summary-card card-packages"><h3>' . $package_count . '</h3><p>Packages</p></div>';
echo '<div class="summary-card card-addons"><h3>' . $template_count . '</h3><p>Add-on Templates</p></div>';
echo '</div>';

// ============================================================
// QUICK LINKS
// ============================================================
echo '<h2>🔗 Quick Test Links</h2>';
echo '<div class="test-section">';
echo '<a href="http://localhost/smart_funeral_system/database-compatibility-check.php" class="btn">🔍 Database Compatibility Check</a>';
echo '<a href="http://localhost:5173" class="btn">🌐 Frontend (React App)</a>';
echo '<a href="http://localhost:5173/login" class="btn">🔐 Test Login</a>';
echo '<a href="http://localhost:5173/register" class="btn">📝 Test Registration</a>';
echo '<a href="http://localhost/phpmyadmin" class="btn">🗄️ phpMyAdmin</a>';
echo '</div>';

echo '<h2>✅ Next Steps</h2>';
echo '<div class="test-section">';
echo '<ol style="margin-left: 20px;">';
echo '<li><strong>Test Login:</strong> Go to <a href="http://localhost:5173/login">http://localhost:5173/login</a></li>';
echo '<li>Use credentials: <code>peaceful@test.example</code> / <code>password123</code></li>';
echo '<li><strong>Browse Packages:</strong> View the sample packages created</li>';
echo '<li><strong>Test Booking:</strong> Try creating a new booking</li>';
echo '<li><strong>Test Add-ons:</strong> Add Buddhist services to a package</li>';
echo '</ol>';
echo '</div>';

$conn->close();
?>

        <div style="margin-top: 30px; padding: 20px; background: #d4edda; border-radius: 10px; border-left: 5px solid #28a745;">
            <h3 style="color: #155724;">🎉 Test Complete!</h3>
            <p style="color: #155724; margin-top: 10px;">
                Your database has been populated with sample data. You can now test all features of the system.
            </p>
        </div>
    </div>
</body>
</html>
