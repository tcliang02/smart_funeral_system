<?php
error_reporting(0);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type'), ngrok-skip-browser-warning;

ob_start();

require_once 'db_connect.php';

// Get tribute ID from query parameter
$tribute_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($tribute_id <= 0) {
    ob_clean();
    echo json_encode([
        'success' => false,
        'error' => 'Invalid tribute ID'
    ]);
    exit;
}

try {
    // Fetch tribute details
    $query = "SELECT 
                tribute_id,
                deceased_name,
                birth_date,
                death_date,
                biography,
                photo_url,
                created_by,
                created_at
              FROM tributes 
              WHERE tribute_id = ?";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $tribute_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        ob_clean();
        echo json_encode([
            'success' => false,
            'error' => 'Tribute not found'
        ]);
        exit;
    }
    
    $tribute = $result->fetch_assoc();
    
    // Build full photo URL if photo_url exists
    $photoUrl = null;
    if (!empty($tribute['photo_url'])) {
        // If it's already a full URL (starts with http), use it as is
        if (strpos($tribute['photo_url'], 'http') === 0) {
            $photoUrl = $tribute['photo_url'];
        } else {
            // The photos are stored in the root uploads folder
            $photoUrl = 'http://localhost/smart_funeral_system/' . $tribute['photo_url'];
        }
    }
    
    // Map fields for frontend compatibility
    $response = [
        'id' => $tribute['tribute_id'],
        'name' => $tribute['deceased_name'],
        'birth_date' => $tribute['birth_date'],
        'death_date' => $tribute['death_date'],
        'biography' => $tribute['biography'],
        'photo' => $photoUrl,
        'photo_url' => $photoUrl,
        'created_by' => $tribute['created_by'],
        'created_at' => $tribute['created_at']
    ];
    
    // Clean output buffer and send response
    ob_clean();
    echo json_encode($response);
    
} catch (Exception $e) {
    ob_clean();
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>

