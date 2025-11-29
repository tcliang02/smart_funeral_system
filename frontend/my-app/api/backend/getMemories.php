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
    // Fetch memories for this tribute
    $query = "SELECT 
                id,
                tribute_id,
                memory_text,
                memory_type,
                created_at
              FROM memories_database 
              WHERE tribute_id = ?
              ORDER BY created_at DESC";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $tribute_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $memories = [];
    while ($row = $result->fetch_assoc()) {
        $memories[] = [
            'id' => $row['id'],
            'tribute_id' => $row['tribute_id'],
            'title' => $row['memory_type'], // Use type as title
            'content' => $row['memory_text'],
            'type' => $row['memory_type'],
            'importance' => 'medium', // Default importance
            'created_at' => $row['created_at']
        ];
    }
    
    // Clean output buffer and send response
    ob_clean();
    echo json_encode([
        'success' => true,
        'memories' => $memories
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

