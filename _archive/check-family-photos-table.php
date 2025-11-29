<?php
require_once 'backend/db_connect.php';

// Check family_photos table structure
$result = $conn->query("DESCRIBE family_photos");
if ($result) {
    echo "=== FAMILY_PHOTOS TABLE COLUMNS ===\n";
    while ($row = $result->fetch_assoc()) {
        echo $row['Field'] . " (" . $row['Type'] . ")\n";
    }
} else {
    echo "Error: " . $conn->error . "\n";
    echo "\nTable might not exist. Checking if it needs to be created...\n";
}
?>