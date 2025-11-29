<?php
include 'backend/db_connect.php';

// Check column definition
$result = $conn->query("SHOW COLUMNS FROM packages WHERE Field = 'location_type'");
$row = $result->fetch_assoc();
echo "Column Definition:\n";
echo json_encode($row, JSON_PRETTY_PRINT);
echo "\n\n";

// Check current values
$result = $conn->query("SELECT package_id, name, location_type FROM packages WHERE provider_id = 19 LIMIT 5");
echo "Current Package Values:\n";
while ($pkg = $result->fetch_assoc()) {
    echo "Package {$pkg['package_id']}: {$pkg['name']} => location_type = '{$pkg['location_type']}'\n";
}
?>
