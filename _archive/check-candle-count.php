<?php
header('Content-Type: application/json');
require_once 'backend/db_connect.php';

try {
    // Check if there are any candles in the database
    $sql = "SELECT COUNT(*) as count FROM tribute_candles";
    $result = $conn->query($sql);
    $row = $result->fetch_assoc();
    
    echo json_encode([
        'success' => true,
        'candle_count' => $row['count'],
        'message' => $row['count'] > 0 
            ? "You have {$row['count']} candles in the database" 
            : "No candles in database - safe to drop table"
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>
