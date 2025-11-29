<?php
/**
 * Add photo_url column to tribute_messages table
 * This allows tribute wall messages to include photos
 */

header('Content-Type: application/json');
require_once 'backend/db_connect.php';

try {
    // Add photo_url column to tribute_messages
    $sql = "ALTER TABLE tribute_messages 
            ADD COLUMN photo_url VARCHAR(255) NULL AFTER message";
    
    if ($conn->query($sql)) {
        echo json_encode([
            'success' => true,
            'message' => 'Successfully added photo_url column to tribute_messages table',
            'column_added' => 'photo_url VARCHAR(255) NULL'
        ], JSON_PRETTY_PRINT);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to add column: ' . $conn->error
        ], JSON_PRETTY_PRINT);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}

$conn->close();
?>
