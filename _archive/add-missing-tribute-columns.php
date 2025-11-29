<?php
require_once 'backend/db_connect.php';

$sql_statements = [
    "ALTER TABLE tributes ADD COLUMN location_of_birth TEXT NULL",
    "ALTER TABLE tributes ADD COLUMN grave_invite_message TEXT NULL",
    "ALTER TABLE tributes ADD COLUMN grave_datetime DATETIME NULL",
    "ALTER TABLE tributes ADD COLUMN map_link VARCHAR(500) NULL",
    "ALTER TABLE tributes ADD COLUMN virtual_link VARCHAR(500) NULL",
    "ALTER TABLE tributes ADD COLUMN allow_photos TINYINT(1) DEFAULT 1",
    "ALTER TABLE tributes ADD COLUMN allow_candles TINYINT(1) DEFAULT 1"
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

echo "\n✅ All missing columns added!\n";
echo "The edit tribute form should now work properly.\n";
?>