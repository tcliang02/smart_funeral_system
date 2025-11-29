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

// Validate required fields
if (empty($input['tribute_id'])) {
    echo json_encode(['success' => false, 'message' => 'Tribute ID is required']);
    exit;
}

try {
    // Check if tribute allows candles
    $sql = "SELECT allow_candles FROM tributes WHERE tribute_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $input['tribute_id']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Tribute not found']);
        exit;
    }
    
    $tribute = $result->fetch_assoc();
    
    if (!$tribute['allow_candles']) {
        echo json_encode(['success' => false, 'message' => 'This tribute does not allow candles']);
        exit;
    }
    
    // Insert candle
    // Actual table columns: candle_id, tribute_id, lit_by (varchar), message, created_at
    $sql = "INSERT INTO tribute_candles (
        tribute_id,
        lit_by,
        message
    ) VALUES (?, ?, ?)";
    
    $lighter_name = $input['lighter_name'] ?? 'Anonymous';
    $candle_message = $input['candle_message'] ?? $input['message'] ?? '';
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param(
        "iss",
        $input['tribute_id'],
        $lighter_name,
        $candle_message
    );
    
    if ($stmt->execute()) {
        $candle_id = $conn->insert_id;
        
        echo json_encode([
            'success' => true,
            'message' => 'Virtual candle lit successfully',
            'candle_id' => $candle_id
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to light candle: ' . $stmt->error
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

