<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type'), ngrok-skip-browser-warning;

require_once 'db_connect.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$tribute_id = isset($data['tribute_id']) ? intval($data['tribute_id']) : 0;
$question_category = isset($data['question_category']) ? trim($data['question_category']) : '';
$user_message = isset($data['user_message']) ? trim($data['user_message']) : '';
$ai_response = isset($data['ai_response']) ? trim($data['ai_response']) : '';

if (!$tribute_id || !$question_category || !$user_message || !$ai_response) {
    echo json_encode([
        'success' => false,
        'error' => 'Missing required fields'
    ]);
    exit;
}

try {
    // Log the learning interaction
    $stmt = $conn->prepare("
        INSERT INTO voice_learning_log 
        (tribute_id, question_category, user_message, ai_response, created_at) 
        VALUES (?, ?, ?, ?, NOW())
    ");
    
    $stmt->bind_param("isss", 
        $tribute_id, 
        $question_category, 
        $user_message, 
        $ai_response
    );
    
    $success = $stmt->execute();
    
    if ($success) {
        echo json_encode([
            'success' => true,
            'message' => 'Learning interaction logged',
            'log_id' => $conn->insert_id
        ]);
    } else {
        throw new Exception('Failed to log learning interaction');
    }
    
    $stmt->close();
    
} catch (Exception $e) {
    error_log("Error logging learning interaction: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>

