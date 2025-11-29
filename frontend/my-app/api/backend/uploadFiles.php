<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type"), ngrok-skip-browser-warning;
header("Content-Type: application/json");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Create uploads directory if it doesn't exist
$upload_dir = __DIR__ . '/uploads/';
if (!file_exists($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

try {
    // Validate that files were uploaded
    if (empty($_FILES)) {
        echo json_encode([
            "success" => false,
            "message" => "No files uploaded"
        ]);
        exit;
    }

    $uploaded_files = [];
    $errors = [];

    // Get booking reference for file naming (optional)
    $booking_ref = $_POST['booking_reference'] ?? 'TEMP_' . time();

    // Define allowed file types
    $allowed_image_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    $allowed_doc_types = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    $allowed_types = array_merge($allowed_image_types, $allowed_doc_types);

    // Maximum file size (10MB)
    $max_file_size = 10 * 1024 * 1024;

    // Process each uploaded file
    foreach ($_FILES as $field_name => $file) {
        // Handle multiple files in one field
        if (is_array($file['name'])) {
            $file_count = count($file['name']);
            for ($i = 0; $i < $file_count; $i++) {
                $result = processFile(
                    $file['name'][$i],
                    $file['type'][$i],
                    $file['tmp_name'][$i],
                    $file['error'][$i],
                    $file['size'][$i],
                    $booking_ref,
                    $upload_dir,
                    $allowed_types,
                    $max_file_size
                );
                
                if ($result['success']) {
                    $uploaded_files[] = $result['path'];
                } else {
                    $errors[] = $result['error'];
                }
            }
        } else {
            // Single file
            $result = processFile(
                $file['name'],
                $file['type'],
                $file['tmp_name'],
                $file['error'],
                $file['size'],
                $booking_ref,
                $upload_dir,
                $allowed_types,
                $max_file_size
            );
            
            if ($result['success']) {
                $uploaded_files[] = $result['path'];
            } else {
                $errors[] = $result['error'];
            }
        }
    }

    // Check if any files were uploaded successfully
    if (empty($uploaded_files)) {
        echo json_encode([
            "success" => false,
            "message" => "No files uploaded successfully",
            "errors" => $errors
        ]);
        exit;
    }

    // Return success with file paths
    echo json_encode([
        "success" => true,
        "message" => count($uploaded_files) . " file(s) uploaded successfully",
        "files" => $uploaded_files,
        "errors" => $errors // Include any partial errors
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}

/**
 * Process a single file upload
 */
function processFile($name, $type, $tmp_name, $error, $size, $booking_ref, $upload_dir, $allowed_types, $max_file_size) {
    // Check for upload errors
    if ($error !== UPLOAD_ERR_OK) {
        return [
            'success' => false,
            'error' => "Upload error for {$name}: " . getUploadErrorMessage($error)
        ];
    }

    // Validate file type
    if (!in_array($type, $allowed_types)) {
        return [
            'success' => false,
            'error' => "Invalid file type for {$name}. Only images (JPG, PNG, GIF) and documents (PDF, DOC, DOCX) are allowed."
        ];
    }

    // Validate file size
    if ($size > $max_file_size) {
        return [
            'success' => false,
            'error' => "File {$name} exceeds maximum size of 10MB."
        ];
    }

    // Generate unique filename
    $file_extension = strtolower(pathinfo($name, PATHINFO_EXTENSION));
    $safe_filename = preg_replace('/[^a-zA-Z0-9_-]/', '_', pathinfo($name, PATHINFO_FILENAME));
    $unique_filename = $booking_ref . '_' . $safe_filename . '_' . time() . '.' . $file_extension;
    $target_path = $upload_dir . $unique_filename;

    // Move uploaded file
    if (move_uploaded_file($tmp_name, $target_path)) {
        // Return relative path for database storage
        return [
            'success' => true,
            'path' => 'uploads/' . $unique_filename
        ];
    } else {
        return [
            'success' => false,
            'error' => "Failed to save file {$name}."
        ];
    }
}

/**
 * Get human-readable upload error message
 */
function getUploadErrorMessage($error_code) {
    switch ($error_code) {
        case UPLOAD_ERR_INI_SIZE:
        case UPLOAD_ERR_FORM_SIZE:
            return "File too large";
        case UPLOAD_ERR_PARTIAL:
            return "File partially uploaded";
        case UPLOAD_ERR_NO_FILE:
            return "No file uploaded";
        case UPLOAD_ERR_NO_TMP_DIR:
            return "Missing temporary folder";
        case UPLOAD_ERR_CANT_WRITE:
            return "Failed to write file to disk";
        case UPLOAD_ERR_EXTENSION:
            return "Upload blocked by extension";
        default:
            return "Unknown upload error";
    }
}
?>

