<?php
require_once 'backend/db_connect.php';

// Check tributes table structure
$result = $conn->query("DESCRIBE tributes");

echo "Current tributes table columns:\n";
$existing_columns = [];
while ($row = $result->fetch_assoc()) {
    $existing_columns[] = $row['Field'];
    echo $row['Field'] . "\n";
}

echo "\nChecking required columns for tribute features:\n";
$required_columns = [
    'life_story' => 'TEXT',
    'allow_messages' => 'TINYINT(1) DEFAULT 1', 
    'enable_rsvp' => 'TINYINT(1) DEFAULT 1',
    'grave_location_name' => 'VARCHAR(255)',
    'grave_address' => 'TEXT'
];

$missing = [];
foreach ($required_columns as $col => $type) {
    if (!in_array($col, $existing_columns)) {
        $missing[] = "ALTER TABLE tributes ADD COLUMN $col $type;";
        echo "❌ Missing: $col\n";
    } else {
        echo "✅ Found: $col\n";
    }
}

if (!empty($missing)) {
    echo "\nSQL to add missing columns:\n";
    foreach ($missing as $sql) {
        echo $sql . "\n";
    }
}
?>