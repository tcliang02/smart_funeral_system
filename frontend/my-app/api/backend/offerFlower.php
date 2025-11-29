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

$input = json_decode(file_get_contents('php://input'), true);
$tribute_id = isset($input['tribute_id']) ? intval($input['tribute_id']) : 0;

if (!$tribute_id) {
    echo json_encode(['success' => false, 'message' => 'Missing tribute_id']);
    exit;
}

try {
    // Increment flower count
    $sql = "UPDATE tributes SET flower_count = flower_count + 1 WHERE tribute_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $tribute_id);
    
    if ($stmt->execute()) {
        // Get updated count
        $sql = "SELECT flower_count FROM tributes WHERE tribute_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $tribute_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        
        echo json_encode([
            'success' => true,
            'message' => 'Flower offered successfully',
            'flower_count' => $row['flower_count']
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to offer flower']);
    }
    
    $stmt->close();
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}

$conn->close();
?>

