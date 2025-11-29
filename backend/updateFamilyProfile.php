<?php
/**
 * Update Family Profile
 * Allows family/attendee users to update their profile information
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, PUT');
header('Access-Control-Allow-Headers: Content-Type'), ngrok-skip-browser-warning;

require_once 'db_connect.php';
require_once 'helpers.php';

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($input['user_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'User ID is required'
    ]);
    exit;
}

$user_id = intval($input['user_id']);

// Optional fields for update
$name = isset($input['name']) ? trim($input['name']) : null;
$email = isset($input['email']) ? trim($input['email']) : null;
$phone = isset($input['phone']) ? trim($input['phone']) : null;
$address = isset($input['address']) ? trim($input['address']) : null;
$profile_picture = isset($input['profile_picture']) ? trim($input['profile_picture']) : null;

try {
    // Verify user exists and is family/attendee
    $check_sql = "SELECT user_id, role FROM users WHERE user_id = ?";
    $check_stmt = $conn->prepare($check_sql);
    $check_stmt->bind_param("i", $user_id);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();
    
    if ($check_result->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'User not found'
        ]);
        exit;
    }
    
    $user = $check_result->fetch_assoc();
    
    if (!in_array($user['role'], ['family', 'attendee'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Only family and attendee accounts can use this endpoint'
        ]);
        exit;
    }
    
    // Check if email is being changed and if it's already taken
    if ($email) {
        $email_check = "SELECT user_id FROM users WHERE email = ? AND user_id != ?";
        $email_stmt = $conn->prepare($email_check);
        $email_stmt->bind_param("si", $email, $user_id);
        $email_stmt->execute();
        $email_result = $email_stmt->get_result();
        
        if ($email_result->num_rows > 0) {
            echo json_encode([
                'success' => false,
                'message' => 'Email address is already in use'
            ]);
            exit;
        }
    }
    
    // Build dynamic update query
    $update_fields = [];
    $param_types = "";
    $param_values = [];
    
    if ($name !== null) {
        $update_fields[] = "name = ?";
        $param_types .= "s";
        $param_values[] = $name;
    }
    
    if ($email !== null) {
        $update_fields[] = "email = ?";
        $param_types .= "s";
        $param_values[] = $email;
    }
    
    if ($phone !== null) {
        $update_fields[] = "phone = ?";
        $param_types .= "s";
        $param_values[] = $phone;
    }
    
    if ($address !== null) {
        $update_fields[] = "address = ?";
        $param_types .= "s";
        $param_values[] = $address;
    }
    
    if ($profile_picture !== null) {
        $update_fields[] = "profile_picture = ?";
        $param_types .= "s";
        $param_values[] = $profile_picture;
    }
    
    if (empty($update_fields)) {
        echo json_encode([
            'success' => false,
            'message' => 'No fields to update'
        ]);
        exit;
    }
    
    // Add user_id to parameters
    $param_types .= "i";
    $param_values[] = $user_id;
    
    // Execute update
    $sql = "UPDATE users SET " . implode(", ", $update_fields) . " WHERE user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($param_types, ...$param_values);
    
    if ($stmt->execute()) {
        // Log the activity
        $log_sql = "INSERT INTO profile_activity_log (user_id, action_type, action_details) VALUES (?, 'profile_update', ?)";
        $log_stmt = $conn->prepare($log_sql);
        $log_details = json_encode([
            'updated_fields' => array_keys($input),
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        $log_stmt->bind_param("is", $user_id, $log_details);
        $log_stmt->execute();
        
        echo json_encode([
            'success' => true,
            'message' => 'Profile updated successfully'
        ]);
    } else {
        throw new Exception('Failed to update profile: ' . $stmt->error);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error updating profile: ' . $e->getMessage()
    ]);
}

$conn->close();

