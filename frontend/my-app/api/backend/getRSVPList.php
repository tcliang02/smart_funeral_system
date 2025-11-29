<?php
/**
 * Get RSVP List
 * Family-only endpoint to view all RSVP submissions for a tribute
 */
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

// Validate required parameters
if (empty($_GET['tribute_id']) || empty($_GET['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Missing tribute_id or user_id']);
    exit;
}

$tribute_id = intval($_GET['tribute_id']);
$user_id = intval($_GET['user_id']);

try {
    // Verify user is tribute creator (family member)
    $sql = "SELECT created_by FROM tributes WHERE tribute_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $tribute_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Tribute not found']);
        exit;
    }
    
    $tribute = $result->fetch_assoc();
    
    if ($tribute['created_by'] != $user_id) {
        echo json_encode(['success' => false, 'message' => 'Only family members can view RSVP list']);
        exit;
    }
    
    // Get all RSVPs for this tribute
    // tribute_rsvp actual columns: rsvp_id, tribute_id, attendee_name, attendee_email, attendee_phone, will_attend, attendance_type, number_of_guests, message, created_at
    $sql = "SELECT 
                rsvp_id as id,
                attendee_name as guest_name,
                attendee_phone as guest_phone,
                attendee_email as guest_email,
                number_of_guests,
                will_attend,
                attendance_type,
                message,
                created_at
            FROM tribute_rsvp 
            WHERE tribute_id = ? 
            ORDER BY created_at DESC";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $tribute_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $rsvps = [];
    while ($row = $result->fetch_assoc()) {
        $rsvps[] = $row;
    }
    
    // Get statistics
    // Note: tribute_rsvp uses 'will_attend' (0/1) not 'attendance_type' (varchar)
    $sql = "SELECT 
                COUNT(*) as total_rsvps,
                SUM(number_of_guests) as total_guests,
                SUM(CASE WHEN will_attend = 1 THEN number_of_guests ELSE 0 END) as attending_guests,
                SUM(CASE WHEN will_attend = 0 THEN number_of_guests ELSE 0 END) as not_attending_guests
            FROM tribute_rsvp 
            WHERE tribute_id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $tribute_id);
    $stmt->execute();
    $stats = $stmt->get_result()->fetch_assoc();
    
    echo json_encode([
        'success' => true,
        'rsvps' => $rsvps,
        'statistics' => $stats
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

