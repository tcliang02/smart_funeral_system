<?php
/**
 * Delete Family Photo
 * Family-only endpoint for deleting photos from gallery
 */
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
if (empty($input['photo_id']) || empty($input['user_id']) || empty($input['tribute_id'])) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

try {
    // Verify user is tribute creator
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
        echo json_encode(['success' => false, 'message' => 'Only family members can delete photos']);
        exit;
    }
    
    // Delete the photo from tribute_photos table (Family Gallery)
    // tribute_photos uses 'photo_id' as primary key
    $sql = "DELETE FROM tribute_photos WHERE photo_id = ? AND tribute_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $input['photo_id'], $input['tribute_id']);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Photo deleted successfully'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Photo not found or already deleted'
            ]);
        }
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to delete photo: ' . $stmt->error
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

