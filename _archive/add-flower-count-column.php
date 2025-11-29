<?php
require_once 'backend/db_connect.php';

try {
    // Add flower_count column to tributes table
    $sql = "ALTER TABLE tributes ADD COLUMN flower_count INT DEFAULT 0 AFTER view_count";
    
    if ($conn->query($sql)) {
        echo json_encode([
            'success' => true,
            'message' => 'Successfully added flower_count column to tributes table'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Error: ' . $conn->error
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
