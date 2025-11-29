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

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Map frontend field name to database column name
if (isset($input['creator_user_id']) && !isset($input['created_by'])) {
    $input['created_by'] = $input['creator_user_id'];
}

// Validate required fields
$required = ['created_by', 'deceased_name', 'date_of_birth', 'date_of_death'];
foreach ($required as $field) {
    if (empty($input[$field])) {
        // Check for alternative field name
        if ($field === 'created_by' && !empty($input['creator_user_id'])) {
            continue;
        }
        echo json_encode(['success' => false, 'message' => "Missing required field: $field"]);
        exit;
    }
}

try {
    // CRITICAL FIX: Map frontend field names to database column names
    // Frontend sends: bank_account_name, bank_account_number, donation_qr_code
    // Database needs: account_holder_name, account_number, bank_qr_code
    if (isset($input['bank_account_name']) && !isset($input['account_holder_name'])) {
        $input['account_holder_name'] = $input['bank_account_name'];
    }
    if (isset($input['bank_account_number']) && !isset($input['account_number'])) {
        $input['account_number'] = $input['bank_account_number'];
    }
    if (isset($input['donation_qr_code']) && !isset($input['bank_qr_code'])) {
        $input['bank_qr_code'] = $input['donation_qr_code'];
    }
    
    // Handle JSON fields
    $donation_items = isset($input['donation_items']) ? json_encode($input['donation_items']) : null;
    
    $sql = "INSERT INTO tributes (
        created_by,
        deceased_name,
        birth_date,
        death_date,
        biography,
        photo_url,
        is_public,
        life_story,
        allow_messages,
        enable_rsvp,
        grave_location_name
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    
    // Set default values for new features
    $default_life_story = isset($input['life_story']) ? $input['life_story'] : $input['biography'];
    $default_grave_location = isset($input['grave_location_name']) ? $input['grave_location_name'] : 'Memorial Garden';
    
    $stmt->bind_param(
        "isssssissis",
        $input['created_by'],
        $input['deceased_name'],
        $input['date_of_birth'],    // maps to birth_date
        $input['date_of_death'],    // maps to death_date  
        $input['life_story'],       // maps to biography
        $input['portrait_photo'],   // maps to photo_url
        $input['is_public'],
        $default_life_story,        // Enable life story section
        1,                          // allow_messages = 1 (enable tribute wall)
        1,                          // enable_rsvp = 1 (enable RSVP section)
        $default_grave_location     // grave_location_name
    );
    
    if ($stmt->execute()) {
        $tribute_id = $conn->insert_id;
        
        echo json_encode([
            'success' => true,
            'message' => 'Tribute created successfully',
            'tribute_id' => $tribute_id
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to create tribute: ' . $stmt->error
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

