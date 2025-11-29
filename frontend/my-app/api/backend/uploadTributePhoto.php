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

// Check if file was uploaded
if (!isset($_FILES['photo']) || $_FILES['photo']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['success' => false, 'message' => 'No file uploaded or upload error']);
    exit;
}

// Validate tribute_id
$tribute_id = isset($_POST['tribute_id']) ? intval($_POST['tribute_id']) : 0;
if ($tribute_id === 0) {
    echo json_encode(['success' => false, 'message' => 'Tribute ID is required']);
    exit;
}

try {
    // Check if tribute allows photos  
    $sql = "SELECT allow_photos FROM tributes WHERE tribute_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $tribute_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Tribute not found']);
        exit;
    }
    
    $tribute = $result->fetch_assoc();
    
    if (!$tribute['allow_photos']) {
        echo json_encode(['success' => false, 'message' => 'This tribute does not allow guest photos']);
        exit;
    }
        exit;
    }
    
    $tribute = $result->fetch_assoc();
    
    if (!$tribute['allow_photos']) {
        echo json_encode(['success' => false, 'message' => 'This tribute does not allow photo uploads']);
        exit;
    }
    
    // Validate file type
    $allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    $file_type = $_FILES['photo']['type'];
    
    if (!in_array($file_type, $allowed_types)) {
        echo json_encode(['success' => false, 'message' => 'Invalid file type. Only images are allowed.']);
        exit;
    }
    
    // Validate file size (max 5MB)
    if ($_FILES['photo']['size'] > 5 * 1024 * 1024) {
        echo json_encode(['success' => false, 'message' => 'File size too large. Maximum 5MB allowed.']);
        exit;
    }
    
    // Create upload directory if it doesn't exist
    $upload_dir = __DIR__ . '/../uploads/tributes/';
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }
    
    // Generate unique filename
    $extension = pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION);
    $filename = 'tribute_' . $tribute_id . '_' . uniqid() . '.' . $extension;
    $filepath = $upload_dir . $filename;
    
    // Move uploaded file
    if (!move_uploaded_file($_FILES['photo']['tmp_name'], $filepath)) {
        echo json_encode(['success' => false, 'message' => 'Failed to save uploaded file']);
        exit;
    }
    
    // Save to database
    $photo_url = '/smart_funeral_system/uploads/tributes/' . $filename;
    
    // tribute_photos table columns: photo_id, tribute_id, photo_url, caption, uploaded_by, created_at
    $sql = "INSERT INTO tribute_photos (
        tribute_id,
        photo_url,
        caption,
        uploaded_by
    ) VALUES (?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $caption = isset($_POST['photo_description']) ? $_POST['photo_description'] : '';
    $uploaded_by = isset($_POST['uploader_name']) ? $_POST['uploader_name'] : 'Guest';
    
    $stmt->bind_param(
        "isss",
        $tribute_id,
        $photo_url,
        $caption,
        $uploaded_by
    );
    
    if ($stmt->execute()) {
        $photo_id = $conn->insert_id;
        
        echo json_encode([
            'success' => true,
            'message' => $is_approved ? 'Photo uploaded successfully' : 'Photo submitted for approval',
            'photo_id' => $photo_id,
            'photo_url' => $photo_url,
            'is_approved' => $is_approved
        ]);
    } else {
        // Delete uploaded file if database insert fails
        unlink($filepath);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to save photo to database: ' . $stmt->error
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

