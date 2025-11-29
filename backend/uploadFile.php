<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type'), ngrok-skip-browser-warning;

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// CRITICAL FIX: Check for both 'file' and 'photo' field names
$file_field = null;
if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
    $file_field = 'file';
} elseif (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
    $file_field = 'photo';
}

if ($file_field === null) {
    echo json_encode([
        'success' => false, 
        'message' => 'No file uploaded or upload error',
        'debug' => [
            'FILES' => array_keys($_FILES),
            'POST' => $_POST
        ]
    ]);
    exit;
}

try {
    // Validate file type
    $allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    $file_type = $_FILES[$file_field]['type'];
    
    if (!in_array($file_type, $allowed_types)) {
        echo json_encode(['success' => false, 'message' => 'Invalid file type. Only images are allowed.']);
        exit;
    }
    
    // Validate file size (max 5MB)
    if ($_FILES[$file_field]['size'] > 5 * 1024 * 1024) {
        echo json_encode(['success' => false, 'message' => 'File size too large. Maximum 5MB allowed.']);
        exit;
    }
    
    // Get upload type (portrait, qr, gallery)
    $type = isset($_POST['type']) ? $_POST['type'] : 'general';
    
    // Create upload directory if it doesn't exist
    $upload_dir = __DIR__ . '/../uploads/tributes/';
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }
    
    // Generate unique filename
    $extension = pathinfo($_FILES[$file_field]['name'], PATHINFO_EXTENSION);
    $filename = $type . '_' . uniqid() . '_' . time() . '.' . $extension;
    $filepath = $upload_dir . $filename;
    
    // Move uploaded file
    if (!move_uploaded_file($_FILES[$file_field]['tmp_name'], $filepath)) {
        echo json_encode(['success' => false, 'message' => 'Failed to save uploaded file']);
        exit;
    }
    
    // Return success with RELATIVE path (not full URL)
    $relative_path = 'uploads/tributes/' . $filename;
    
    echo json_encode([
        'success' => true,
        'message' => 'File uploaded successfully',
        'file_url' => $relative_path,  // Return relative path for database
        'filename' => $filename
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>

