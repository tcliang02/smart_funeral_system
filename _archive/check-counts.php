<?php
header('Content-Type: application/json');
require_once 'backend/db_connect.php';

try {
    // Get tribute data with view_count and flower_count
    $query = "SELECT tribute_id, deceased_name, view_count, flower_count, created_at FROM tributes ORDER BY tribute_id";
    $result = $conn->query($query);
    
    $tributes = [];
    while ($row = $result->fetch_assoc()) {
        $tributes[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'tributes' => $tributes,
        'total' => count($tributes)
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>
