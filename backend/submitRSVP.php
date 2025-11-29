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
if (empty($input['tribute_id']) || empty($input['guest_name'])) {
    echo json_encode(['success' => false, 'message' => 'Tribute ID and guest name are required']);
    exit;
}

try {
    // Check if tribute has RSVP enabled
    $sql = "SELECT enable_rsvp FROM tributes WHERE tribute_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $input['tribute_id']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Tribute not found']);
        exit;
    }
    
    $tribute = $result->fetch_assoc();
    
    if (!$tribute['enable_rsvp']) {
        echo json_encode(['success' => false, 'message' => 'This tribute does not have RSVP enabled']);
        exit;
    }
    
    // No max guest limit check (removed rsvp_max_guests dependency)
    
    // Insert RSVP
    // tribute_rsvp actual columns: rsvp_id, tribute_id, attendee_name, attendee_email, attendee_phone, will_attend, number_of_guests, message, created_at
    $sql = "INSERT INTO tribute_rsvp (
        tribute_id,
        attendee_name,
        attendee_phone,
        attendee_email,
        number_of_guests,
        will_attend,
        attendance_type,
        message
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    
    // Map frontend fields to database columns
    $attendee_name = $input['guest_name'] ?? $input['attendee_name'] ?? 'Anonymous';
    $attendee_phone = $input['guest_phone'] ?? $input['attendee_phone'] ?? '';
    $attendee_email = $input['guest_email'] ?? $input['attendee_email'] ?? '';
    $number_of_guests = $input['number_of_guests'] ?? 1;
    $attendance_type = $input['attendance_type'] ?? 'physical'; // 'physical', 'virtual', or 'not-attending'
    $will_attend = ($attendance_type === 'physical' || $attendance_type === 'virtual') ? 1 : 0;
    $message = $input['message'] ?? '';
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param(
        "isssiiss",
        $input['tribute_id'],
        $attendee_name,
        $attendee_phone,
        $attendee_email,
        $number_of_guests,
        $will_attend,
        $attendance_type,
        $message
    );
    
    if ($stmt->execute()) {
        $rsvp_id = $conn->insert_id;
        
        echo json_encode([
            'success' => true,
            'message' => 'RSVP submitted successfully',
            'rsvp_id' => $rsvp_id
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to submit RSVP: ' . $stmt->error
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

