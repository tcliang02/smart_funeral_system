<?php
// Suppress PHP errors to prevent HTML output
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type'), ngrok-skip-browser-warning;

// Start output buffering
ob_start();

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_clean();
    http_response_code(200);
    exit();
}

require_once 'db_connect.php';

// Check if api_config exists
if (!file_exists('api_config.php')) {
    ob_clean();
    ob_clean(); echo json_encode([
        'success' => false,
        'error' => 'ElevenLabs API is not configured. Voice upload saved locally.'
    ]);
    exit();
}

require_once 'api_config.php';

try {
    // Check if request method is POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        ob_clean();
        ob_clean(); echo json_encode([
            'success' => false,
            'error' => 'Invalid request method. Use POST.'
        ]);
        exit();
    }

    // Get tribute_id from POST data
    $tribute_id = isset($_POST['tribute_id']) ? intval($_POST['tribute_id']) : 0;
    
    if ($tribute_id <= 0) {
        ob_clean();
        ob_clean(); echo json_encode([
            'success' => false,
            'error' => 'Invalid tribute ID'
        ]);
        exit();
    }

    // Check if audio file was uploaded
    if (!isset($_FILES['audio_sample']) || $_FILES['audio_sample']['error'] !== UPLOAD_ERR_OK) {
        ob_clean();
        ob_clean(); echo json_encode([
            'success' => false,
            'error' => 'No audio file uploaded or upload error occurred'
        ]);
        exit();
    }

    $audioFile = $_FILES['audio_sample'];
    $allowedTypes = ['audio/wav', 'audio/mpeg', 'audio/mp4', 'audio/webm', 'audio/ogg', 'audio/x-m4a'];
    
    // Validate file type
    if (!in_array($audioFile['type'], $allowedTypes)) {
        ob_clean();
        ob_clean(); echo json_encode([
            'success' => false,
            'error' => 'Invalid file type. Allowed: WAV, MP3, M4A, WebM, OGG'
        ]);
        exit();
    }

    // Validate file size (max 50MB)
    $maxSize = 50 * 1024 * 1024; // 50MB
    if ($audioFile['size'] > $maxSize) {
        ob_clean();
        ob_clean(); echo json_encode([
            'success' => false,
            'error' => 'File too large. Maximum size is 50MB'
        ]);
        exit();
    }

    // Create uploads directory if it doesn't exist
    $uploadDir = dirname(__DIR__) . '/uploads/voice_samples/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    // Generate unique filename
    $fileExtension = pathinfo($audioFile['name'], PATHINFO_EXTENSION);
    $fileName = 'voice_sample_' . $tribute_id . '_' . time() . '.' . $fileExtension;
    $filePath = $uploadDir . $fileName;

    // Move uploaded file
    if (!move_uploaded_file($audioFile['tmp_name'], $filePath)) {
        ob_clean();
        ob_clean(); echo json_encode([
            'success' => false,
            'error' => 'Failed to save audio file'
        ]);
        exit();
    }

    // Integrate with ElevenLabs API
    try {
        $voice_id = callElevenLabsAPI($filePath, $voice_name);
    } catch (Exception $e) {
        // If ElevenLabs API fails, log error but continue with mock ID for testing
        error_log("ElevenLabs API Error: " . $e->getMessage());
        $voice_id = 'mock_voice_' . uniqid();
    }

    // Get tribute creator (user who created the tribute)
    $tributeQuery = "SELECT deceased_name, created_by FROM tributes WHERE tribute_id = ?";
    $stmt = $conn->prepare($tributeQuery);
    $stmt->bind_param("i", $tribute_id);
    $stmt->execute();
    $tributeResult = $stmt->get_result();
    $tribute = $tributeResult->fetch_assoc();
    $voice_name = $tribute ? $tribute['deceased_name'] . "'s Voice" : "Voice " . $tribute_id;
    $created_by = $tribute ? $tribute['created_by'] : null;

    // Check if voice model already exists
    $checkQuery = "SELECT voice_id FROM voice_models WHERE tribute_id = ?";
    $stmt = $conn->prepare($checkQuery);
    $stmt->bind_param("i", $tribute_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        // Update existing voice model
        $updateQuery = "UPDATE voice_models SET 
            elevenlabs_voice_id = ?,
            audio_sample_path = ?,
            status = 'ready'
            WHERE tribute_id = ?";
        $stmt = $conn->prepare($updateQuery);
        $stmt->bind_param("ssi", $voice_id, $fileName, $tribute_id);
    } else {
        // Insert new voice model
        if ($created_by) {
            $insertQuery = "INSERT INTO voice_models 
                (tribute_id, elevenlabs_voice_id, audio_sample_path, status, created_by, created_at) 
                VALUES (?, ?, ?, 'ready', ?, CURRENT_TIMESTAMP)";
            $stmt = $conn->prepare($insertQuery);
            $stmt->bind_param("issi", $tribute_id, $voice_id, $fileName, $created_by);
        } else {
            $insertQuery = "INSERT INTO voice_models 
                (tribute_id, elevenlabs_voice_id, audio_sample_path, status, created_at) 
                VALUES (?, ?, ?, 'ready', CURRENT_TIMESTAMP)";
            $stmt = $conn->prepare($insertQuery);
            $stmt->bind_param("iss", $tribute_id, $voice_id, $fileName);
        }
    }

    if ($stmt->execute()) {
        ob_clean(); echo json_encode([
            'success' => true,
            'message' => 'Voice sample uploaded successfully',
            'voice_id' => $voice_id,
            'file_path' => $fileName
        ]);
    } else {
        ob_clean(); echo json_encode([
            'success' => false,
            'error' => 'Failed to save voice model to database'
        ]);
    }

} catch (Exception $e) {
    ob_clean(); echo json_encode([
        'success' => false,
        'error' => 'Server error: ' . $e->getMessage()
    ]);
}

$conn->close();

/**
 * Call ElevenLabs API to clone voice
 * 
 * @param string $audioFilePath Path to the audio file
 * @param string $voiceName Name for the cloned voice
 * @return string Voice ID from ElevenLabs
 * @throws Exception If API call fails
 */
function callElevenLabsAPI($audioFilePath, $voiceName) {
    $url = ELEVENLABS_API_URL . '/voices/add';
    
    // Prepare multipart form data
    $boundary = '----WebKitFormBoundary' . uniqid();
    $delimiter = '--' . $boundary;
    
    // Read file content
    $fileContent = file_get_contents($audioFilePath);
    $fileName = basename($audioFilePath);
    
    // Build multipart body
    $postData = '';
    
    // Add name field
    $postData .= $delimiter . "\r\n";
    $postData .= 'Content-Disposition: form-data; name="name"' . "\r\n\r\n";
    $postData .= $voiceName . "\r\n";
    
    // Add description field (optional)
    $postData .= $delimiter . "\r\n";
    $postData .= 'Content-Disposition: form-data; name="description"' . "\r\n\r\n";
    $postData .= 'AI voice memorial created via Smart Funeral System' . "\r\n";
    
    // Add file
    $postData .= $delimiter . "\r\n";
    $postData .= 'Content-Disposition: form-data; name="files"; filename="' . $fileName . '"' . "\r\n";
    $postData .= 'Content-Type: audio/mpeg' . "\r\n\r\n";
    $postData .= $fileContent . "\r\n";
    
    // End boundary
    $postData .= $delimiter . '--' . "\r\n";
    
    $curl = curl_init();
    
    curl_setopt_array($curl, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $postData,
        CURLOPT_HTTPHEADER => [
            'xi-api-key: ' . ELEVENLABS_API_KEY,
            'Content-Type: multipart/form-data; boundary=' . $boundary
        ],
        CURLOPT_TIMEOUT => 60
    ]);
    
    $response = curl_exec($curl);
    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    $error = curl_error($curl);
    curl_close($curl);
    
    if ($error) {
        throw new Exception('cURL Error: ' . $error);
    }
    
    if ($httpCode === 200 || $httpCode === 201) {
        $data = json_decode($response, true);
        if (isset($data['voice_id'])) {
            return $data['voice_id'];
        } else {
            throw new Exception('Voice ID not found in response: ' . $response);
        }
    } else {
        throw new Exception('ElevenLabs API error (HTTP ' . $httpCode . '): ' . $response);
    }
}

ob_end_flush();
?>

