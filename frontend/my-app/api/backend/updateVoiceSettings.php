<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type'), ngrok-skip-browser-warning;

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db_connect.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['success' => false, 'error' => 'Invalid request method']);
        exit();
    }

    $input = json_decode(file_get_contents('php://input'), true);
    
    $tribute_id = isset($input['tribute_id']) ? intval($input['tribute_id']) : 0;
    $is_enabled = isset($input['is_enabled']) ? (bool)$input['is_enabled'] : false;
    $access_level = isset($input['access_level']) ? $input['access_level'] : 'family';
    
    if ($tribute_id <= 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid tribute ID']);
        exit();
    }

    // Validate access level
    $validAccessLevels = ['family', 'all_visitors', 'invited'];
    if (!in_array($access_level, $validAccessLevels)) {
        $access_level = 'family';
    }

    // Check if settings exist
    $checkStmt = $conn->prepare("SELECT id FROM voice_chat_settings WHERE tribute_id = ?");
    $checkStmt->bind_param("i", $tribute_id);
    $checkStmt->execute();
    $result = $checkStmt->get_result();
    
    if ($result->num_rows > 0) {
        // Update existing settings
        $stmt = $conn->prepare("UPDATE voice_chat_settings SET is_enabled = ?, access_level = ?, updated_at = NOW() WHERE tribute_id = ?");
        $stmt->bind_param("isi", $is_enabled, $access_level, $tribute_id);
    } else {
        // Insert new settings
        $stmt = $conn->prepare("INSERT INTO voice_chat_settings (tribute_id, is_enabled, access_level) VALUES (?, ?, ?)");
        $stmt->bind_param("iis", $tribute_id, $is_enabled, $access_level);
    }

    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Voice chat settings updated successfully',
            'is_enabled' => $is_enabled,
            'access_level' => $access_level
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'Failed to update settings'
        ]);
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>

