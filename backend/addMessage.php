<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type'), ngrok-skip-browser-warning;

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'db_connect.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (empty($input['tribute_id']) || empty($input['message'])) {
    echo json_encode(['success' => false, 'message' => 'Tribute ID and message are required']);
    exit;
}

try {
    // Check if tribute allows messages
    $sql = "SELECT allow_messages FROM tributes WHERE tribute_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $input['tribute_id']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Tribute not found']);
        exit;
    }
    
    $tribute = $result->fetch_assoc();
    
    if (!$tribute['allow_messages']) {
        echo json_encode(['success' => false, 'message' => 'This tribute does not allow messages']);
        exit;
    }
    
    // Auto-approve all messages
    $is_approved = 1;
    
    // Insert message
    // tribute_messages columns: message_id, tribute_id, sender_name, sender_email, message, photo_url, is_approved, created_at
    $sql = "INSERT INTO tribute_messages (
        tribute_id,
        sender_name,
        sender_email,
        message,
        photo_url,
        is_approved
    ) VALUES (?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $sender_name = isset($input['guest_name']) ? $input['guest_name'] : (isset($input['sender_name']) ? $input['sender_name'] : 'Anonymous');
    $sender_email = isset($input['guest_email']) ? $input['guest_email'] : (isset($input['sender_email']) ? $input['sender_email'] : '');
    $photo_url = isset($input['photo_url']) ? $input['photo_url'] : null;
    
    $stmt->bind_param(
        "issssi",
        $input['tribute_id'],
        $sender_name,
        $sender_email,
        $input['message'],
        $photo_url,
        $is_approved
    );
    
    if ($stmt->execute()) {
        $message_id = $conn->insert_id;
        
        echo json_encode([
            'success' => true,
            'message' => 'Message posted successfully',
            'message_id' => $message_id,
            'is_approved' => $is_approved
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to post message: ' . $stmt->error
        ]);
    }
    
    $stmt->close();
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>

