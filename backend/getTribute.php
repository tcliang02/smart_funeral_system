<?php
// COMPLETELY REWRITTEN VERSION - NO MAPPER
// THIS IS THE FINAL VERSION THAT ACTUALLY WORKS

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

// Get tribute ID from request
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
    
    // CRITICAL FIX: Convert database fields to match expected frontend fields
    // THIS NEEDS TO HAPPEN ON EVERY REQUEST
    $tribute['id'] = $tribute['tribute_id']; // Map tribute_id to id for frontend
    $tribute['name'] = $tribute['deceased_name']; // Map deceased_name to name for frontend
    $tribute['date_of_birth'] = $tribute['birth_date']; // Map birth_date to date_of_birth for frontend
    $tribute['date_of_death'] = $tribute['death_date']; // Map death_date to date_of_death for frontend
    $tribute['portrait_photo'] = $tribute['photo_url']; // Map photo_url to portrait_photo for frontend
    
    // Bank account fields are already in correct format in database
    // No mapping needed - just ensure they exist
    if (!isset($tribute['bank_account_number'])) $tribute['bank_account_number'] = null;
    if (!isset($tribute['bank_account_name'])) $tribute['bank_account_name'] = null;
    if (!isset($tribute['bank_name'])) $tribute['bank_name'] = null;
    if (!isset($tribute['donation_qr_code'])) $tribute['donation_qr_code'] = null;
    
    // Convert donation_items from JSON string to array
    if (!empty($tribute['donation_items'])) {
        $tribute['donation_items'] = json_decode($tribute['donation_items'], true);
    } else {
        $tribute['donation_items'] = [];
    }
    
    // Get messages for this tribute
    // Map database columns to frontend expectations
    $messages = [];
    $sql = "SELECT 
                message_id as id,
                tribute_id,
                sender_name as guest_name,
                sender_email as guest_email,
                message,
                photo_url,
                is_approved,
                created_at
            FROM tribute_messages 
            WHERE tribute_id = ? 
            ORDER BY created_at DESC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $tribute_id);
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        $messages[] = $row;
    }
    
    // Get family photos from tribute_photos table (Family Gallery only - no guest gallery)
    $family_photos = [];
    $sql = "SELECT * FROM tribute_photos WHERE tribute_id = ? ORDER BY created_at DESC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $tribute_id);
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        // Map photo_id to id for frontend compatibility
        $row['id'] = $row['photo_id'];
        // Map database column names to frontend expected names
        $row['photo_description'] = $row['caption'];
        // Build full URL for photo
        if (!empty($row['photo_url'])) {
            // If it's already a full URL, keep it; otherwise build the full URL
            if (strpos($row['photo_url'], 'http') !== 0) {
                $row['photo_url'] = 'http://localhost/smart_funeral_system/' . ltrim($row['photo_url'], '/');
            }
        }
        $family_photos[] = $row;
    }
    
    // Candles feature removed - all candles migrated to tribute_messages
    
    // Get RSVP stats (FIXED: column is 'number_of_guests' not 'num_guests')
    $rsvpCount = 0;
    $totalGuests = 0;
    $sql = "SELECT COUNT(*) as count, SUM(number_of_guests) as total_guests FROM tribute_rsvp WHERE tribute_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $tribute_id);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($row = $result->fetch_assoc()) {
        $rsvpCount = $row['count'];
        $totalGuests = $row['total_guests'];
    }
    
    // Update view count
    $sql = "UPDATE tributes SET view_count = view_count + 1 WHERE tribute_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $tribute_id);
    $stmt->execute();
    
    // Return formatted response
    echo json_encode([
        'success' => true,
        'tribute' => $tribute,
        'messages' => $messages,
        'photos' => [], // Guest photo gallery removed - only family gallery exists
        'family_photos' => $family_photos,
        'candles' => [], // Candles removed - migrated to messages
        'rsvp_stats' => [
            'rsvp_count' => $rsvpCount,
            'total_guests' => $totalGuests
        ]
    ]);
    
} catch (Exception $e) {
    // Log error for debugging
    error_log("Error in getTribute.php: " . $e->getMessage());
    
    echo json_encode([
        'success' => false,
        'message' => 'Server error occurred: ' . $e->getMessage()
    ]);
}
?>
