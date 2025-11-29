<?php
/**
 * Upload Family Photo
 * Family-only endpoint for uploading photos to family gallery
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

// Get JSON data
$input = json_decode(file_get_contents('php://input'), true);

// Debug logging
error_log("Upload Family Photo - Received data: " . json_encode($input));

// Validate required fields
if (empty($input['tribute_id']) || empty($input['user_id']) || empty($input['photo_url'])) {
    error_log("Upload Family Photo - Missing fields. tribute_id: " . ($input['tribute_id'] ?? 'missing') . ", user_id: " . ($input['user_id'] ?? 'missing') . ", photo_url: " . ($input['photo_url'] ?? 'missing'));
    echo json_encode([
        'success' => false, 
        'message' => 'Missing required fields',
        'received' => [
            'tribute_id' => $input['tribute_id'] ?? null,
            'user_id' => $input['user_id'] ?? null,
            'photo_url' => $input['photo_url'] ?? null
        ]
    ]);
    exit;
}

try {
    // Verify user is tribute creator (family member)
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
        echo json_encode(['success' => false, 'message' => 'Only family members can upload to gallery']);
        exit;
    }
    
    // Insert photo into family gallery (tribute_photos table)
    // Table columns: photo_id, tribute_id, photo_url, caption, uploaded_by, created_at
    $sql = "INSERT INTO tribute_photos (
        tribute_id,
        photo_url,
        caption,
        uploaded_by
    ) VALUES (?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $caption = isset($input['photo_description']) ? $input['photo_description'] : '';
    
    // Get uploader name from user_id
    $user_sql = "SELECT name FROM users WHERE user_id = ?";
    $user_stmt = $conn->prepare($user_sql);
    $user_stmt->bind_param("i", $input['user_id']);
    $user_stmt->execute();
    $user_result = $user_stmt->get_result();
    $uploaded_by = 'Family Member';
    if ($user_result->num_rows > 0) {
        $user_data = $user_result->fetch_assoc();
        $uploaded_by = $user_data['name'];
    }
    $user_stmt->close();
    
    $stmt->bind_param(
        "isss",
        $input['tribute_id'],
        $input['photo_url'],
        $caption,
        $uploaded_by
    );
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Photo added to family gallery',
            'photo_id' => $conn->insert_id
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to upload photo: ' . $stmt->error
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

