<?php
require_once 'backend/db_connect.php';

try {
    $sql = "SHOW COLUMNS FROM tributes";
    $result = $conn->query($sql);
    
    $columns = [];
    while ($row = $result->fetch_assoc()) {
        $columns[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'columns' => $columns
    ], JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
