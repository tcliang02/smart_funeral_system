<?php
header('Content-Type: application/json');
require_once 'backend/db_connect.php';

try {
    // Check tribute_candles table structure
    $query = "DESCRIBE tribute_candles";
    $result = $conn->query($query);
    
    $columns = [];
    while ($row = $result->fetch_assoc()) {
        $columns[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'table' => 'tribute_candles',
        'columns' => $columns
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>
