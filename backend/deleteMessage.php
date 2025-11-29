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
if (empty($input['message_id']) || empty($input['user_id']) || empty($input['tribute_id'])) {
    echo json_encode(['success' => false, 'message' => 'Message ID, User ID, and Tribute ID are required']);
    exit;
}

try {
    // Verify user is the tribute creator (family member)
    $sql = "SELECT created_by FROM tributes WHERE tribute_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $input['tribute_id']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Tribute not found']);
        exit;
    }
    
    $tribute = $result->fetch_assoc();
    
    if ($tribute['created_by'] != $input['user_id']) {
        echo json_encode(['success' => false, 'message' => 'Only the tribute creator can delete messages']);
        exit;
    }
    
    // Delete the message
    // tribute_messages table uses 'message_id' as primary key, not 'id'
    $sql = "DELETE FROM tribute_messages WHERE message_id = ? AND tribute_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $input['message_id'], $input['tribute_id']);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Message deleted successfully'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Message not found or already deleted'
            ]);
        }
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to delete message: ' . $stmt->error
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

