<?php
require_once 'backend/db_connect.php';

// Check tribute_photos table structure
$result = $conn->query("DESCRIBE tribute_photos");
if ($result) {
    echo "=== TRIBUTE_PHOTOS TABLE COLUMNS ===\n";
    while ($row = $result->fetch_assoc()) {
        echo $row['Field'] . " (" . $row['Type'] . ")\n";
    }
} else {
    echo "Error: " . $conn->error . "\n";
}
?>