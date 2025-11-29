<?php
require_once 'backend/db_connect.php';

// Check tribute_messages table structure
$result = $conn->query("DESCRIBE tribute_messages");
if ($result) {
    echo "=== TRIBUTE_MESSAGES TABLE COLUMNS ===\n";
    while ($row = $result->fetch_assoc()) {
        echo $row['Field'] . " (" . $row['Type'] . ")\n";
    }
} else {
    echo "Error: " . $conn->error . "\n";
}
?>