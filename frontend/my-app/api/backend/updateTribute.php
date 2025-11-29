<?php
/**
 * Update Tribute
 * Family-only endpoint for editing tribute details
 */
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

// Debug logging
error_log("Update Tribute Request - tribute_id: " . ($input['tribute_id'] ?? 'missing'));
error_log("Update Tribute Request - user_id: " . ($input['user_id'] ?? 'missing'));
error_log("Update Tribute Request - fields: " . json_encode(array_keys($input)));

// Validate required fields
if (empty($input['tribute_id']) || empty($input['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Missing tribute_id or user_id', 'received' => $input]);
    exit;
}

try {
    // Verify user is tribute creator
    $sql = "SELECT created_by FROM tributes WHERE tribute_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $input['tribute_id']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Tribute not found']);
        exit;
    }
    
    $tribute = $result->fetch_assoc();
    
    if ($tribute['created_by'] != $input['user_id']) {
        echo json_encode(['success' => false, 'message' => 'Only the tribute creator can edit']);
        exit;
    }
    
    // CRITICAL: Map frontend field names to database column names
    if (isset($input['date_of_birth'])) {
        $input['birth_date'] = $input['date_of_birth'];
        unset($input['date_of_birth']);
    }
    if (isset($input['date_of_death'])) {
        $input['death_date'] = $input['date_of_death'];
        unset($input['date_of_death']);
    }
    if (isset($input['portrait_photo'])) {
        $input['photo_url'] = $input['portrait_photo'];
        unset($input['portrait_photo']);
    }
    
    // Build dynamic UPDATE query based on provided fields
    $updates = [];
    $types = "";
    $values = [];
    
    // ALL COLUMNS THAT EXIST IN DATABASE (after adding missing ones)
    // Core fields: tribute_id, booking_id, deceased_name, birth_date, death_date, biography, 
    // photo_url, is_public, view_count, slug, created_by, created_at, updated_at
    // Feature fields: life_story, allow_messages, enable_rsvp, grave_location_name, grave_address
    // Donation fields: donation_items, bank_account_number, bank_account_name, bank_name, donation_qr_code
    // New fields: location_of_birth, grave_invite_message, grave_datetime, map_link, virtual_link, allow_photos, allow_candles
    $allowed_fields = [
        'deceased_name', 'birth_date', 'death_date', 'biography', 'location_of_birth',
        'life_story', 'photo_url', 
        'grave_invite_message', 'grave_location_name', 'grave_address', 'grave_datetime',
        'map_link', 'virtual_link',
        'bank_account_name', 'bank_name', 'bank_account_number', 'donation_qr_code', 'donation_items', 
        'enable_rsvp', 'is_public', 'allow_messages', 'allow_photos', 'allow_candles'
    ];
    
    foreach ($allowed_fields as $field) {
        if (isset($input[$field])) {
            $updates[] = "$field = ?";
            
            // Determine type for bind_param
            if (in_array($field, ['is_public', 'allow_messages', 'enable_rsvp', 'allow_photos', 'allow_candles'])) {
                $types .= "i";
                $values[] = intval($input[$field]);
            } else {
                $types .= "s";
                $values[] = $input[$field];
            }
        }
    }
    
    if (empty($updates)) {
        echo json_encode(['success' => false, 'message' => 'No fields to update']);
        exit;
    }
    
    // Add tribute_id to the end
    $types .= "i";
    $values[] = $input['tribute_id'];
    
    $sql = "UPDATE tributes SET " . implode(", ", $updates) . " WHERE tribute_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$values);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Tribute updated successfully',
            'updated_fields' => count($updates)
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to update tribute: ' . $stmt->error
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

