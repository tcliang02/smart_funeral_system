<?php
/**
 * Migrate Candles to Messages
 * This will move all candle entries into tribute_messages table
 * Then drop the tribute_candles table
 */

header('Content-Type: application/json');
require_once 'backend/db_connect.php';

try {
    // Start transaction
    $conn->begin_transaction();
    
    // 1. Get all candles
    $sql = "SELECT * FROM tribute_candles ORDER BY created_at ASC";
    $result = $conn->query($sql);
    $candles = [];
    while ($row = $result->fetch_assoc()) {
        $candles[] = $row;
    }
    
    $migrated = 0;
    
    // 2. Insert each candle as a message
    foreach ($candles as $candle) {
        $sql = "INSERT INTO tribute_messages (
            tribute_id,
            sender_name,
            sender_email,
            message,
            photo_url,
            is_approved,
            created_at
        ) VALUES (?, ?, ?, ?, NULL, 1, ?)";
        
        $stmt = $conn->prepare($sql);
        $email = ''; // Candles don't have emails
        $message_text = $candle['message'] ?? '🕯️ Lit a candle in memory';
        
        $stmt->bind_param(
            "issss",
            $candle['tribute_id'],
            $candle['lit_by'],
            $email,
            $message_text,
            $candle['created_at']
        );
        
        if ($stmt->execute()) {
            $migrated++;
        }
    }
    
    // 3. Drop the tribute_candles table
    $sql = "DROP TABLE tribute_candles";
    $conn->query($sql);
    
    // Commit transaction
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Successfully migrated candles to messages and dropped tribute_candles table',
        'candles_found' => count($candles),
        'candles_migrated' => $migrated,
        'table_dropped' => true
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}

$conn->close();
?>
