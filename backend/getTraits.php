<?php
error_reporting(0);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type'), ngrok-skip-browser-warning;

ob_start();

require_once 'db_connect.php';

// Get tribute ID from query parameter
$tribute_id = isset($_GET['tribute_id']) ? intval($_GET['tribute_id']) : 0;

if ($tribute_id <= 0) {
    ob_clean();
    echo json_encode([
        'success' => false,
        'error' => 'Invalid tribute ID'
    ]);
    exit;
}

try {
    // Fetch personality traits for this tribute
    $query = "SELECT 
                id,
                tribute_id,
                trait_category,
                trait_value,
                created_at
              FROM personality_traits 
              WHERE tribute_id = ?
              ORDER BY trait_category, created_at DESC";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $tribute_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $traits = [];
    while ($row = $result->fetch_assoc()) {
        $traits[] = [
            'id' => $row['id'],
            'tribute_id' => $row['tribute_id'],
            'category' => $row['trait_category'],
            'trait_key' => $row['trait_category'], // Map to trait_key for frontend
            'trait_value' => $row['trait_value'],
            'created_at' => $row['created_at']
        ];
    }
    
    // Clean output buffer and send response
    ob_clean();
    echo json_encode([
        'success' => true,
        'traits' => $traits
    ]);
    
} catch (Exception $e) {
    ob_clean();
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>

