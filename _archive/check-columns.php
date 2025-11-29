<?php
header('Content-Type: application/json');
require_once 'backend/db_connect.php';

try {
    // Get column information
    $query = "DESCRIBE tributes";
    $result = $conn->query($query);
    
    $columns = [];
    while ($row = $result->fetch_assoc()) {
        $columns[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'columns' => $columns,
        'column_count' => count($columns)
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>
