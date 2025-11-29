<?php
error_reporting(0);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type'), ngrok-skip-browser-warning;

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

ob_start();

require_once 'db_connect.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        ob_clean();
        echo json_encode(['success' => false, 'error' => 'Invalid request method']);
        exit();
    }

    $input = json_decode(file_get_contents('php://input'), true);
    
    $tribute_id = isset($input['tribute_id']) ? intval($input['tribute_id']) : 0;
    $memories = isset($input['memories']) ? $input['memories'] : [];
    $traits = isset($input['traits']) ? $input['traits'] : [];
    
    if ($tribute_id <= 0) {
        ob_clean();
        echo json_encode(['success' => false, 'error' => 'Invalid tribute ID']);
        exit();
    }

    // Begin transaction
    $conn->begin_transaction();

    // Save memories
    $memoryCount = 0;
    if (!empty($memories)) {
        $stmt = $conn->prepare("INSERT INTO memories_database (tribute_id, memory_text, memory_type, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)");
        
        foreach ($memories as $memory) {
            $memory_text = $memory['text'] ?? $memory['content'] ?? '';
            $memory_type = $memory['type'] ?? 'general';
            
            if (!empty($memory_text)) {
                $stmt->bind_param("iss", $tribute_id, $memory_text, $memory_type);
                $stmt->execute();
                $memoryCount++;
            }
        }
        $stmt->close();
    }

    // Save personality traits
    $traitCount = 0;
    if (!empty($traits)) {
        $stmt = $conn->prepare("INSERT INTO personality_traits (tribute_id, trait_category, trait_value, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)");
        
        foreach ($traits as $trait) {
            $category = $trait['category'] ?? 'general';
            $trait_value = $trait['value'] ?? '';
            
            if (!empty($trait_value)) {
                $stmt->bind_param("iss", $tribute_id, $category, $trait_value);
                $stmt->execute();
                $traitCount++;
            }
        }
        $stmt->close();
    }

    // Commit transaction
    $conn->commit();

    ob_clean();
    echo json_encode([
        'success' => true,
        'message' => 'Memories and traits saved successfully',
        'memories_saved' => $memoryCount,
        'traits_saved' => $traitCount
    ]);

} catch (Exception $e) {
    if ($conn) {
        $conn->rollback();
    }
    ob_clean();
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>

