<?php
require_once 'backend/db_connect.php';

try {
    // Drop allow_candles column (no longer used - candles feature removed)
    $sql = "ALTER TABLE tributes DROP COLUMN allow_candles";
    
    if ($conn->query($sql)) {
        echo json_encode([
            'success' => true,
            'message' => 'Successfully removed allow_candles column from tributes table'
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
