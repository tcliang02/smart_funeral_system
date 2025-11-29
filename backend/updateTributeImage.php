<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, ngrok-skip-browser-warning');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'db_connect.php';

try {
    // Get JSON input
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!isset($data['tribute_id']) || !isset($data['image_url'])) {
        throw new Exception('Missing required fields: tribute_id and image_url');
    }

    $tribute_id = intval($data['tribute_id']);
    $image_url = $data['image_url'];
    $field_name = isset($data['field_name']) ? $data['field_name'] : 'portrait_photo';
    
    // Validate field name to prevent SQL injection
    $allowed_fields = ['portrait_photo', 'photo_url'];
    if (!in_array($field_name, $allowed_fields)) {
        throw new Exception('Invalid field name');
    }

    // Update tribute with new Supabase URL
    $stmt = $conn->prepare("UPDATE tributes SET $field_name = ? WHERE id = ?");
    $stmt->bind_param("si", $image_url, $tribute_id);
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to update tribute image');
    }

    echo json_encode([
        'success' => true,
        'message' => 'Image URL updated successfully',
        'tribute_id' => $tribute_id,
        'field_name' => $field_name,
        'new_url' => $image_url
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>
