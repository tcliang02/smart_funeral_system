<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type'), ngrok-skip-browser-warning;

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'db_connect.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$tribute_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($tribute_id === 0) {
    echo json_encode(['success' => false, 'message' => 'Tribute ID is required']);
    exit;
}

try {
    // Get tribute details
    $sql = "SELECT * FROM tributes WHERE tribute_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $tribute_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Tribute not found']);
        exit;
    }
    
    $tribute = $result->fetch_assoc();
    
    // CRITICAL FIX: Map database column names to frontend expectations
    // Database schema uses different names than frontend expects
    
    // Map bank fields
    if (isset($tribute['account_number'])) {
        $tribute['bank_account_number'] = $tribute['account_number'];
    }
    if (isset($tribute['account_holder_name'])) {
        $tribute['bank_account_name'] = $tribute['account_holder_name'];
    }
    if (isset($tribute['bank_qr_code'])) {
        $tribute['donation_qr_code'] = $tribute['bank_qr_code'];
    }
    
    // Ensure all expected fields exist (set to null if missing)
    $requiredFields = ['portrait_photo', 'bank_account_number', 'bank_account_name', 'bank_name', 'donation_qr_code'];
    foreach ($requiredFields as $field) {
        if (!isset($tribute[$field])) {
            $tribute[$field] = null;
        }
    }
    
    // Parse JSON fields
    if ($tribute['donation_items']) {
        $tribute['donation_items'] = json_decode($tribute['donation_items'], true);
    }
    
    // Increment view count
    $conn->query("UPDATE tributes SET view_count = view_count + 1 WHERE tribute_id = $tribute_id");
    
    // Get messages
    $sql = "SELECT * FROM tribute_messages WHERE tribute_id = ? AND is_approved = 1 ORDER BY created_at DESC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $tribute_id);
    $stmt->execute();
    $messages_result = $stmt->get_result();
    $messages = [];
    while ($row = $messages_result->fetch_assoc()) {
        $messages[] = $row;
    }
    
    // Get photos
    $sql = "SELECT * FROM tribute_photos WHERE tribute_id = ? AND is_approved = 1 ORDER BY created_at DESC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $tribute_id);
    $stmt->execute();
    $photos_result = $stmt->get_result();
    $photos = [];
    while ($row = $photos_result->fetch_assoc()) {
        $photos[] = $row;
    }
    
    // Get candles
    $sql = "SELECT * FROM tribute_candles WHERE tribute_id = ? ORDER BY created_at DESC LIMIT 50";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $tribute_id);
    $stmt->execute();
    $candles_result = $stmt->get_result();
    $candles = [];
    while ($row = $candles_result->fetch_assoc()) {
        $candles[] = $row;
    }
    
    // Get RSVP count
    $sql = "SELECT COUNT(*) as rsvp_count, SUM(number_of_guests) as total_guests FROM tribute_rsvp WHERE tribute_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $tribute_id);
    $stmt->execute();
    $rsvp_result = $stmt->get_result();
    $rsvp_stats = $rsvp_result->fetch_assoc();
    
    echo json_encode([
        'success' => true,
        'tribute' => $tribute,
        'messages' => $messages,
        'photos' => $photos,
        'candles' => $candles,
        'rsvp_stats' => $rsvp_stats
    ]);
    
    $stmt->close();
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
