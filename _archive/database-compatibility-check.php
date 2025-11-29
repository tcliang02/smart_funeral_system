<?php
/**
 * COMPREHENSIVE DATABASE-FRONTEND COMPATIBILITY CHECKER
 * This script checks if your database structure matches what the frontend expects
 */

header("Content-Type: text/html; charset=UTF-8");
include "backend/db_connect.php";

?>
<!DOCTYPE html>
<html>
<head>
    <title>Database-Frontend Compatibility Check</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 36px;
        }
        .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 18px;
        }
        .section {
            margin-bottom: 40px;
            padding: 25px;
            background: #f8f9fa;
            border-radius: 12px;
            border-left: 5px solid #667eea;
        }
        .section h2 {
            color: #667eea;
            margin-bottom: 20px;
            font-size: 24px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        th {
            background: #667eea;
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
        }
        td {
            padding: 12px 15px;
            border-bottom: 1px solid #e0e0e0;
        }
        tr:hover {
            background: #f5f5f5;
        }
        .status {
            padding: 6px 12px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 14px;
            display: inline-block;
        }
        .success { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
        .warning { background: #fff3cd; color: #856404; }
        .info { background: #d1ecf1; color: #0c5460; }
        .code {
            background: #2d2d2d;
            color: #f8f8f2;
            padding: 15px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            margin: 10px 0;
            overflow-x: auto;
        }
        .fix-section {
            background: #fff3cd;
            padding: 20px;
            border-radius: 8px;
            border-left: 5px solid #ffc107;
            margin: 15px 0;
        }
        .fix-section h3 {
            color: #856404;
            margin-bottom: 10px;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .summary-card {
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            color: white;
        }
        .summary-card h3 {
            font-size: 48px;
            margin-bottom: 10px;
        }
        .summary-card p {
            font-size: 16px;
            opacity: 0.9;
        }
        .card-success { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
        .card-error { background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%); }
        .card-warning { background: linear-gradient(135deg, #f09819 0%, #edde5d 100%); }
        .card-info { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 Database-Frontend Compatibility Report</h1>
        <p class="subtitle">Comprehensive analysis of your Smart Funeral System</p>

<?php

// Initialize counters
$total_checks = 0;
$passed_checks = 0;
$failed_checks = 0;
$warnings = 0;
$issues = [];

// ============================================================
// CHECK 1: Users Table Structure
// ============================================================
echo '<div class="section">';
echo '<h2>👤 Check 1: Users Table</h2>';

$users_check = $conn->query("DESCRIBE users");
if ($users_check) {
    $columns = [];
    while ($col = $users_check->fetch_assoc()) {
        $columns[] = $col['Field'];
    }
    
    echo '<table>';
    echo '<tr><th>Expected Column</th><th>Status</th><th>Issue</th><th>Impact</th></tr>';
    
    // Check user_id
    $total_checks++;
    if (in_array('user_id', $columns)) {
        echo '<tr><td>user_id</td><td><span class="status success">✅ EXISTS</span></td><td>-</td><td>-</td></tr>';
        $passed_checks++;
    } else {
        echo '<tr><td>user_id</td><td><span class="status error">❌ MISSING</span></td><td>Database needs user_id</td><td>Critical</td></tr>';
        $failed_checks++;
        $issues[] = "Users table missing 'user_id' column";
    }
    
    // Check name
    $total_checks++;
    if (in_array('name', $columns)) {
        echo '<tr><td>name</td><td><span class="status success">✅ EXISTS</span></td><td>-</td><td>-</td></tr>';
        $passed_checks++;
    } else {
        echo '<tr><td>name</td><td><span class="status error">❌ MISSING</span></td><td>Frontend expects "name"</td><td>Critical</td></tr>';
        $failed_checks++;
        $issues[] = "Users table missing 'name' column";
    }
    
    // Check if using wrong column names
    $total_checks++;
    if (in_array('id', $columns) || in_array('username', $columns)) {
        $wrong_cols = [];
        if (in_array('id', $columns)) $wrong_cols[] = 'id';
        if (in_array('username', $columns)) $wrong_cols[] = 'username';
        echo '<tr><td>OLD COLUMNS</td><td><span class="status warning">⚠️ FOUND</span></td><td>Found: ' . implode(', ', $wrong_cols) . '</td><td>Backend compatibility issue</td></tr>';
        $warnings++;
        $issues[] = "Users table has old column names: " . implode(', ', $wrong_cols);
    } else {
        echo '<tr><td>OLD COLUMNS</td><td><span class="status success">✅ CLEAN</span></td><td>No old columns</td><td>-</td></tr>';
        $passed_checks++;
    }
    
    // Check email
    $total_checks++;
    if (in_array('email', $columns)) {
        echo '<tr><td>email</td><td><span class="status success">✅ EXISTS</span></td><td>-</td><td>-</td></tr>';
        $passed_checks++;
    } else {
        echo '<tr><td>email</td><td><span class="status error">❌ MISSING</span></td><td>Required for authentication</td><td>Critical</td></tr>';
        $failed_checks++;
    }
    
    // Check role
    $total_checks++;
    if (in_array('role', $columns)) {
        echo '<tr><td>role</td><td><span class="status success">✅ EXISTS</span></td><td>-</td><td>-</td></tr>';
        $passed_checks++;
    } else {
        echo '<tr><td>role</td><td><span class="status error">❌ MISSING</span></td><td>Required for access control</td><td>Critical</td></tr>';
        $failed_checks++;
    }
    
    echo '</table>';
    
    // Show actual columns
    echo '<h3 style="margin-top: 20px;">Actual Columns in Database:</h3>';
    echo '<div class="code">' . implode(', ', $columns) . '</div>';
} else {
    echo '<span class="status error">❌ Users table NOT FOUND!</span>';
    $issues[] = "Users table doesn't exist!";
}

echo '</div>';

// ============================================================
// CHECK 2: Login Backend Compatibility
// ============================================================
echo '<div class="section">';
echo '<h2>🔐 Check 2: Login System Compatibility</h2>';

$login_check = file_get_contents('backend/login.php');

echo '<table>';
echo '<tr><th>Check</th><th>Status</th><th>Details</th></tr>';

// Check if using 'id' or 'user_id'
$total_checks++;
if (strpos($login_check, '"id"') !== false && strpos($login_check, '"user_id"') === false) {
    echo '<tr><td>User ID Field</td><td><span class="status error">❌ MISMATCH</span></td><td>login.php uses "id" but database has "user_id"</td></tr>';
    $failed_checks++;
    $issues[] = "login.php uses 'id' instead of 'user_id'";
} else if (strpos($login_check, '"user_id"') !== false) {
    echo '<tr><td>User ID Field</td><td><span class="status success">✅ CORRECT</span></td><td>Uses "user_id"</td></tr>';
    $passed_checks++;
} else {
    echo '<tr><td>User ID Field</td><td><span class="status warning">⚠️ UNCLEAR</span></td><td>Cannot determine</td></tr>';
    $warnings++;
}

// Check if using 'username' or 'name'
$total_checks++;
if (strpos($login_check, 'username = ?') !== false && strpos($login_check, 'name = ?') === false) {
    echo '<tr><td>Name Field Query</td><td><span class="status error">❌ MISMATCH</span></td><td>login.php queries "username" but database has "name"</td></tr>';
    $failed_checks++;
    $issues[] = "login.php queries 'username' but database has 'name'";
} else if (strpos($login_check, 'name = ?') !== false) {
    echo '<tr><td>Name Field Query</td><td><span class="status success">✅ CORRECT</span></td><td>Queries "name"</td></tr>';
    $passed_checks++;
} else {
    echo '<tr><td>Name Field Query</td><td><span class="status warning">⚠️ UNCLEAR</span></td><td>Cannot determine</td></tr>';
    $warnings++;
}

echo '</table>';
echo '</div>';

// ============================================================
// CHECK 3: Registration Backend Compatibility
// ============================================================
echo '<div class="section">';
echo '<h2>📝 Check 3: Registration System Compatibility</h2>';

$register_check = file_get_contents('backend/register.php');

echo '<table>';
echo '<tr><th>Check</th><th>Status</th><th>Details</th></tr>';

$total_checks++;
if (strpos($register_check, 'INSERT INTO users (name,') !== false || strpos($register_check, 'INSERT INTO users (name ') !== false) {
    echo '<tr><td>Insert Statement</td><td><span class="status success">✅ CORRECT</span></td><td>Inserts into "name" column</td></tr>';
    $passed_checks++;
} else if (strpos($register_check, 'INSERT INTO users (username,') !== false) {
    echo '<tr><td>Insert Statement</td><td><span class="status error">❌ MISMATCH</span></td><td>Tries to insert into "username" but database has "name"</td></tr>';
    $failed_checks++;
    $issues[] = "register.php tries to insert into 'username' column";
} else {
    echo '<tr><td>Insert Statement</td><td><span class="status warning">⚠️ UNCLEAR</span></td><td>Cannot determine</td></tr>';
    $warnings++;
}

echo '</table>';
echo '</div>';

// ============================================================
// CHECK 4: Service Provider Table
// ============================================================
echo '<div class="section">';
echo '<h2>🏢 Check 4: Service Provider Table</h2>';

$sp_check = $conn->query("DESCRIBE service_provider");
if ($sp_check) {
    $sp_columns = [];
    while ($col = $sp_check->fetch_assoc()) {
        $sp_columns[] = $col['Field'];
    }
    
    echo '<table>';
    echo '<tr><th>Expected Column</th><th>Status</th></tr>';
    
    $sp_required = ['provider_id', 'user_id', 'company_name', 'phone', 'email', 'is_active'];
    foreach ($sp_required as $req) {
        $total_checks++;
        if (in_array($req, $sp_columns)) {
            echo '<tr><td>' . $req . '</td><td><span class="status success">✅ EXISTS</span></td></tr>';
            $passed_checks++;
        } else {
            echo '<tr><td>' . $req . '</td><td><span class="status error">❌ MISSING</span></td></tr>';
            $failed_checks++;
            $issues[] = "service_provider table missing '$req' column";
        }
    }
    
    echo '</table>';
    
    echo '<h3 style="margin-top: 20px;">Actual Columns:</h3>';
    echo '<div class="code">' . implode(', ', $sp_columns) . '</div>';
} else {
    echo '<span class="status error">❌ service_provider table NOT FOUND!</span>';
    $failed_checks++;
    $issues[] = "service_provider table doesn't exist!";
}

echo '</div>';

// ============================================================
// CHECK 5: Bookings Table
// ============================================================
echo '<div class="section">';
echo '<h2>📋 Check 5: Bookings Table</h2>';

$booking_check = $conn->query("DESCRIBE bookings");
if ($booking_check) {
    $booking_columns = [];
    while ($col = $booking_check->fetch_assoc()) {
        $booking_columns[] = $col['Field'];
    }
    
    echo '<table>';
    echo '<tr><th>Expected Column</th><th>Status</th></tr>';
    
    $booking_required = ['booking_id', 'user_id', 'provider_id', 'package_id', 'customer_name', 'customer_email', 'customer_phone', 'service_date', 'total_amount', 'status'];
    foreach ($booking_required as $req) {
        $total_checks++;
        if (in_array($req, $booking_columns)) {
            echo '<tr><td>' . $req . '</td><td><span class="status success">✅ EXISTS</span></td></tr>';
            $passed_checks++;
        } else {
            echo '<tr><td>' . $req . '</td><td><span class="status error">❌ MISSING</span></td></tr>';
            $failed_checks++;
            $issues[] = "bookings table missing '$req' column";
        }
    }
    
    echo '</table>';
} else {
    echo '<span class="status error">❌ bookings table NOT FOUND!</span>';
    $failed_checks++;
}

echo '</div>';

// ============================================================
// CHECK 6: Add-on System
// ============================================================
echo '<div class="section">';
echo '<h2>🎨 Check 6: Buddhist Add-on System</h2>';

$tables_to_check = ['addon_categories', 'addon_templates', 'provider_addons'];
echo '<table>';
echo '<tr><th>Table</th><th>Status</th><th>Row Count</th></tr>';

foreach ($tables_to_check as $table) {
    $total_checks++;
    $check = $conn->query("SELECT COUNT(*) as count FROM $table");
    if ($check) {
        $row = $check->fetch_assoc();
        echo '<tr><td>' . $table . '</td><td><span class="status success">✅ EXISTS</span></td><td>' . $row['count'] . ' rows</td></tr>';
        $passed_checks++;
    } else {
        echo '<tr><td>' . $table . '</td><td><span class="status error">❌ MISSING</span></td><td>-</td></tr>';
        $failed_checks++;
        $issues[] = "$table table doesn't exist!";
    }
}

echo '</table>';
echo '</div>';

// ============================================================
// SUMMARY
// ============================================================
$success_rate = ($total_checks > 0) ? round(($passed_checks / $total_checks) * 100, 1) : 0;

echo '<div class="summary">';
echo '<div class="summary-card card-info">';
echo '<h3>' . $total_checks . '</h3>';
echo '<p>Total Checks</p>';
echo '</div>';

echo '<div class="summary-card card-success">';
echo '<h3>' . $passed_checks . '</h3>';
echo '<p>Passed</p>';
echo '</div>';

echo '<div class="summary-card card-error">';
echo '<h3>' . $failed_checks . '</h3>';
echo '<p>Failed</p>';
echo '</div>';

echo '<div class="summary-card card-warning">';
echo '<h3>' . $warnings . '</h3>';
echo '<p>Warnings</p>';
echo '</div>';
echo '</div>';

// ============================================================
// ISSUES AND FIXES
// ============================================================
if (count($issues) > 0) {
    echo '<div class="fix-section">';
    echo '<h3>🔧 Issues Found - Action Required:</h3>';
    echo '<ol style="margin-left: 20px; margin-top: 10px;">';
    foreach ($issues as $issue) {
        echo '<li style="margin-bottom: 8px;">' . $issue . '</li>';
    }
    echo '</ol>';
    echo '</div>';
}

// ============================================================
// FINAL VERDICT
// ============================================================
echo '<div class="section" style="border-left-color: ';
if ($failed_checks == 0 && $warnings == 0) {
    echo '#28a745';
} else if ($failed_checks > 0) {
    echo '#dc3545';
} else {
    echo '#ffc107';
}
echo ';">';

echo '<h2>📊 Final Verdict</h2>';
echo '<p style="font-size: 24px; margin-bottom: 10px;">Success Rate: <strong>' . $success_rate . '%</strong></p>';

if ($failed_checks == 0 && $warnings == 0) {
    echo '<p style="color: #28a745; font-size: 20px; font-weight: bold;">✅ Your database is fully compatible with the frontend!</p>';
    echo '<p style="margin-top: 10px;">All systems are working correctly. You can start using your application.</p>';
} else if ($failed_checks > 0) {
    echo '<p style="color: #dc3545; font-size: 20px; font-weight: bold;">❌ Critical issues found!</p>';
    echo '<p style="margin-top: 10px;">Your database has compatibility issues that need to be fixed before the system will work properly.</p>';
} else {
    echo '<p style="color: #ffc107; font-size: 20px; font-weight: bold;">⚠️ Minor warnings detected</p>';
    echo '<p style="margin-top: 10px;">Your system should work, but there are some optimization recommendations.</p>';
}

echo '</div>';

$conn->close();
?>

    </div>
</body>
</html>
