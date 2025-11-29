<?php
require_once 'backend/db_connect.php';

try {
    $sql = "CREATE TABLE IF NOT EXISTS chatbot_conversations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        tribute_id INT NULL,
        user_message TEXT NOT NULL,
        bot_response TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (tribute_id) REFERENCES tributes(tribute_id) ON DELETE SET NULL,
        INDEX idx_user_id (user_id),
        INDEX idx_tribute_id (tribute_id),
        INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    $conn->query($sql);
    
    echo json_encode([
        'success' => true,
        'message' => 'Chatbot conversations table created successfully'
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>
