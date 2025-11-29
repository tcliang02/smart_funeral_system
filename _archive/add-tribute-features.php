<?php
require_once 'backend/db_connect.php';

// SQL to add missing columns for tribute features
$sql_statements = [
    "ALTER TABLE tributes ADD COLUMN life_story TEXT",
    "ALTER TABLE tributes ADD COLUMN allow_messages TINYINT(1) DEFAULT 1",
    "ALTER TABLE tributes ADD COLUMN enable_rsvp TINYINT(1) DEFAULT 1", 
    "ALTER TABLE tributes ADD COLUMN grave_location_name VARCHAR(255)",
    "ALTER TABLE tributes ADD COLUMN grave_address TEXT"
];

echo "Adding missing columns to tributes table...\n\n";

foreach ($sql_statements as $sql) {
    echo "Executing: $sql\n";
    if ($conn->query($sql)) {
        echo "✅ Success\n";
    } else {
        echo "❌ Error: " . $conn->error . "\n";
    }
    echo "\n";
}

// Now update existing tribute to enable all features
echo "Updating existing tribute (ID 2) to enable all features...\n";
$update_sql = "UPDATE tributes SET 
    life_story = 'Johnny was a beloved member of our community who touched many lives with his kindness and generosity.',
    allow_messages = 1,
    enable_rsvp = 1,
    grave_location_name = 'Peaceful Rest Cemetery',
    grave_address = '123 Memorial Drive, Peaceful Rest Cemetery, City, State 12345'
    WHERE tribute_id = 2";

if ($conn->query($update_sql)) {
    echo "✅ Tribute updated successfully!\n";
} else {
    echo "❌ Error updating tribute: " . $conn->error . "\n";
}

echo "\nAll tribute sections should now be visible!\n";
?>