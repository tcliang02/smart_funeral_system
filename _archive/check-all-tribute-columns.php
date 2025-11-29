<?php
require_once 'backend/db_connect.php';

// Get all columns from tributes table
$result = $conn->query("DESCRIBE tributes");
$existing_columns = [];
while ($row = $result->fetch_assoc()) {
    $existing_columns[] = $row['Field'];
}

echo "=== TRIBUTES TABLE COLUMNS ===\n";
echo implode(", ", $existing_columns) . "\n\n";

// Check which columns from frontend/common usage are missing
$commonly_used = [
    'location_of_birth',
    'grave_invite_message', 
    'grave_datetime',
    'map_link',
    'virtual_link',
    'allow_photos',
    'allow_candles',
    'moderate_messages',
    'rsvp_max_guests'
];

echo "=== CHECKING COMMONLY USED COLUMNS ===\n";
$missing = [];
foreach ($commonly_used as $col) {
    if (!in_array($col, $existing_columns)) {
        $missing[] = $col;
        echo "❌ Missing: $col\n";
    } else {
        echo "✅ Found: $col\n";
    }
}

if (!empty($missing)) {
    echo "\n=== RECOMMENDED SQL TO ADD MISSING COLUMNS ===\n";
    foreach ($missing as $col) {
        $type = match($col) {
            'allow_photos', 'allow_candles', 'moderate_messages' => 'TINYINT(1) DEFAULT 1',
            'rsvp_max_guests' => 'INT(11) NULL',
            'grave_datetime' => 'DATETIME NULL',
            'map_link', 'virtual_link' => 'VARCHAR(500) NULL',
            default => 'TEXT NULL'
        };
        echo "ALTER TABLE tributes ADD COLUMN $col $type;\n";
    }
}
?>