<?php
include "backend/db_connect.php";

echo "<h2>Booking Flow Diagnostic</h2>";

// Check if bookings table exists and has data
echo "<h3>1. Last 5 Bookings</h3>";
$sql = "SELECT booking_id, booking_reference, package_id, provider_id, customer_name, status, created_at 
        FROM bookings 
        ORDER BY booking_id DESC 
        LIMIT 5";
$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    echo "<table border='1' cellpadding='5'>";
    echo "<tr><th>Booking ID</th><th>Reference</th><th>Package ID</th><th>Provider ID</th><th>Customer</th><th>Status</th><th>Created</th></tr>";
    while ($row = $result->fetch_assoc()) {
        echo "<tr>";
        echo "<td>{$row['booking_id']}</td>";
        echo "<td>{$row['booking_reference']}</td>";
        echo "<td>{$row['package_id']}</td>";
        echo "<td>{$row['provider_id']}</td>";
        echo "<td>{$row['customer_name']}</td>";
        echo "<td>{$row['status']}</td>";
        echo "<td>{$row['created_at']}</td>";
        echo "</tr>";
    }
    echo "</table>";
} else {
    echo "<p style='color:red'>No bookings found in database!</p>";
}

// Check booking_addons
echo "<h3>2. Last 5 Booking Addons</h3>";
$sql = "SELECT ba.*, b.booking_reference 
        FROM booking_addons ba
        LEFT JOIN bookings b ON ba.booking_id = b.booking_id
        ORDER BY ba.booking_addon_id DESC 
        LIMIT 5";
$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    echo "<table border='1' cellpadding='5'>";
    echo "<tr><th>Addon ID</th><th>Booking ID</th><th>Booking Ref</th><th>Addon Name</th><th>Price</th></tr>";
    while ($row = $result->fetch_assoc()) {
        echo "<tr>";
        echo "<td>{$row['booking_addon_id']}</td>";
        echo "<td>{$row['booking_id']}</td>";
        echo "<td>" . ($row['booking_reference'] ?? 'NOT FOUND') . "</td>";
        echo "<td>{$row['addon_name']}</td>";
        echo "<td>{$row['addon_price']}</td>";
        echo "</tr>";
    }
    echo "</table>";
} else {
    echo "<p>No booking addons found.</p>";
}

// Check packages and providers
echo "<h3>3. Packages with Provider Info</h3>";
$sql = "SELECT p.package_id, p.name, p.provider_id, sp.business_name 
        FROM packages p
        LEFT JOIN service_provider sp ON p.provider_id = sp.provider_id
        LIMIT 5";
$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    echo "<table border='1' cellpadding='5'>";
    echo "<tr><th>Package ID</th><th>Package Name</th><th>Provider ID</th><th>Provider Name</th></tr>";
    while ($row = $result->fetch_assoc()) {
        echo "<tr>";
        echo "<td>{$row['package_id']}</td>";
        echo "<td>{$row['name']}</td>";
        echo "<td>" . ($row['provider_id'] ?? 'NULL') . "</td>";
        echo "<td>" . ($row['business_name'] ?? 'NOT FOUND') . "</td>";
        echo "</tr>";
    }
    echo "</table>";
} else {
    echo "<p style='color:red'>No packages found!</p>";
}

// Check transaction isolation level
echo "<h3>4. Transaction Settings</h3>";
$sql = "SELECT @@transaction_isolation as isolation_level";
$result = $conn->query($sql);
if ($result) {
    $row = $result->fetch_assoc();
    echo "<p>Transaction Isolation Level: <strong>{$row['isolation_level']}</strong></p>";
}

$sql = "SELECT @@autocommit as autocommit";
$result = $conn->query($sql);
if ($result) {
    $row = $result->fetch_assoc();
    echo "<p>Autocommit: <strong>" . ($row['autocommit'] ? 'ON' : 'OFF') . "</strong></p>";
}

$conn->close();
?>
