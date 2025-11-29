<?php
include "backend/db_connect.php";

echo "<h2>Database Structure Check</h2>";

// Check bookings table
echo "<h3>1. Bookings Table Structure</h3>";
$sql = "DESCRIBE bookings";
$result = $conn->query($sql);
if ($result) {
    echo "<table border='1' cellpadding='5'>";
    echo "<tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th></tr>";
    while ($row = $result->fetch_assoc()) {
        echo "<tr><td>{$row['Field']}</td><td>{$row['Type']}</td><td>{$row['Null']}</td><td>{$row['Key']}</td><td>" . ($row['Default'] ?? 'NULL') . "</td></tr>";
    }
    echo "</table>";
}

// Check booking_addons table
echo "<h3>2. Booking Addons Table Structure</h3>";
$sql = "DESCRIBE booking_addons";
$result = $conn->query($sql);
if ($result) {
    echo "<table border='1' cellpadding='5'>";
    echo "<tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th></tr>";
    while ($row = $result->fetch_assoc()) {
        echo "<tr><td>{$row['Field']}</td><td>{$row['Type']}</td><td>{$row['Null']}</td><td>{$row['Key']}</td><td>" . ($row['Default'] ?? 'NULL') . "</td></tr>";
    }
    echo "</table>";
}

// Check foreign key constraints
echo "<h3>3. Foreign Key Constraints on booking_addons</h3>";
$sql = "SELECT 
    CONSTRAINT_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'smart_funeral_system'
AND TABLE_NAME = 'booking_addons'
AND REFERENCED_TABLE_NAME IS NOT NULL";

$result = $conn->query($sql);
if ($result) {
    echo "<table border='1' cellpadding='5'>";
    echo "<tr><th>Constraint</th><th>Column</th><th>References Table</th><th>References Column</th></tr>";
    while ($row = $result->fetch_assoc()) {
        echo "<tr><td>{$row['CONSTRAINT_NAME']}</td><td>{$row['COLUMN_NAME']}</td><td>{$row['REFERENCED_TABLE_NAME']}</td><td>{$row['REFERENCED_COLUMN_NAME']}</td></tr>";
    }
    echo "</table>";
}

// Check if there are any bookings
echo "<h3>4. Recent Bookings (Last 5)</h3>";
$sql = "SELECT booking_id, booking_reference, customer_name, status, created_at FROM bookings ORDER BY booking_id DESC LIMIT 5";
$result = $conn->query($sql);
if ($result && $result->num_rows > 0) {
    echo "<table border='1' cellpadding='5'>";
    echo "<tr><th>Booking ID</th><th>Reference</th><th>Customer</th><th>Status</th><th>Created</th></tr>";
    while ($row = $result->fetch_assoc()) {
        echo "<tr><td>{$row['booking_id']}</td><td>{$row['booking_reference']}</td><td>{$row['customer_name']}</td><td>{$row['status']}</td><td>{$row['created_at']}</td></tr>";
    }
    echo "</table>";
} else {
    echo "<p>No bookings found.</p>";
}

$conn->close();
?>
