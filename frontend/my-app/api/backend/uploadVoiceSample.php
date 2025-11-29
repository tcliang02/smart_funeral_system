<?php
// Suppress all PHP errors and warnings to prevent HTML output
error_reporting(0);
ini_set('display_errors', 0);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization"), ngrok-skip-browser-warning;
header("Content-Type: application/json");

// Start output buffering to catch any stray output
ob_start();

include "db_connect.php";

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Invalid request method']);
    exit;
}

try {
    // Get tribute_id from POST
    $tribute_id = isset($_POST['tribute_id']) ? intval($_POST['tribute_id']) : 0;
    
    if ($tribute_id <= 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid tribute ID']);
        exit;
    }

    // Validate file upload
    if (!isset($_FILES['voice_sample']) || $_FILES['voice_sample']['error'] !== UPLOAD_ERR_OK) {
        $error = isset($_FILES['voice_sample']) ? $_FILES['voice_sample']['error'] : 'No file uploaded';
        echo json_encode(['success' => false, 'error' => 'File upload error: ' . $error]);
        exit;
    }

    $file = $_FILES['voice_sample'];
    $allowed_types = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm', 'audio/ogg', 'audio/x-m4a', 'audio/mp4'];
    $max_size = 50 * 1024 * 1024; // 50MB

    // Validate file type
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime_type = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mime_type, $allowed_types) && !in_array($file['type'], $allowed_types)) {
        echo json_encode(['success' => false, 'error' => 'Invalid file type. Please upload an audio file.']);
        exit;
    }

    // Validate file size
    if ($file['size'] > $max_size) {
        echo json_encode(['success' => false, 'error' => 'File too large. Maximum size is 50MB.']);
        exit;
    }

    // Create uploads directory if it doesn't exist
    $upload_dir = '../uploads/voice_samples/';
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }

    // Generate unique filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    if (empty($extension)) {
        // Try to determine extension from mime type
        $mime_extensions = [
            'audio/mpeg' => 'mp3',
            'audio/mp3' => 'mp3',
            'audio/wav' => 'wav',
            'audio/webm' => 'webm',
            'audio/ogg' => 'ogg',
            'audio/x-m4a' => 'm4a',
            'audio/mp4' => 'm4a'
        ];
        $extension = $mime_extensions[$mime_type] ?? 'mp3';
    }
    
    $filename = 'voice_' . $tribute_id . '_' . time() . '.' . $extension;
    $filepath = $upload_dir . $filename;

    // Move uploaded file
    if (!move_uploaded_file($file['tmp_name'], $filepath)) {
        echo json_encode(['success' => false, 'error' => 'Failed to save file']);
        exit;
    }

    // Get file duration (optional, requires getID3 library or ffmpeg)
    $duration = null; // We'll set this later if available

    // Check if voice model record exists
    $check_query = "SELECT voice_id FROM voice_models WHERE tribute_id = ?";
    $check_stmt = $conn->prepare($check_query);
    $check_stmt->bind_param("i", $tribute_id);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();

    if ($check_result->num_rows > 0) {
        // Update existing record
        $row = $check_result->fetch_assoc();
        $voice_model_id = $row['voice_id'];
        
        $update_query = "UPDATE voice_models 
                        SET audio_sample_path = ?, 
                            sample_duration = ?,
                            status = 'processing'
                        WHERE voice_id = ?";
        $update_stmt = $conn->prepare($update_query);
        $duration_int = $duration ? intval($duration) : null;
        $update_stmt->bind_param("sii", $filename, $duration_int, $voice_model_id);
        $update_stmt->execute();
        $update_stmt->close();
    } else {
        // Get user ID from session or request
        $user = json_decode(file_get_contents('php://input'), true);
        $created_by = isset($_POST['user_id']) ? intval($_POST['user_id']) : 1; // Default to 1 if not provided
        
        // Insert new record
        $insert_query = "INSERT INTO voice_models 
                        (tribute_id, audio_sample_path, sample_duration, status, created_by, created_at) 
                        VALUES (?, ?, ?, 'processing', ?, CURRENT_TIMESTAMP)";
        $insert_stmt = $conn->prepare($insert_query);
        $duration_int = $duration ? intval($duration) : null;
        $insert_stmt->bind_param("isii", $tribute_id, $filename, $duration_int, $created_by);
        $insert_stmt->execute();
        $voice_model_id = $conn->insert_id;
        $insert_stmt->close();
    }

    $check_stmt->close();

    // Clean output buffer and send JSON
    ob_clean();
    echo json_encode([
        'success' => true,
        'message' => 'Voice sample uploaded successfully',
        'voice_model_id' => $voice_model_id,
        'filename' => $filename,
        'file_size' => $file['size'],
        'duration' => $duration
    ]);

} catch (Exception $e) {
    error_log("Voice upload error: " . $e->getMessage());
    ob_clean();
    echo json_encode([
        'success' => false,
        'error' => 'Server error occurred. Please try again.'
    ]);
}

$conn->close();
ob_end_flush();
?>

