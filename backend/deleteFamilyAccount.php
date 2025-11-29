<?php
/**
 * Delete Family Account
 * Allows family/attendee users to delete their account
 * This is a soft delete (sets is_active = FALSE)
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, DELETE');
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
$permanent_delete = isset($input['permanent']) && $input['permanent'] === true;
$password_confirmation = isset($input['password']) ? $input['password'] : null;

try {
    // Verify user exists and get password hash
    $check_sql = "SELECT user_id, role, password, is_active FROM users WHERE user_id = ?";
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
            'message' => 'Only family and attendee accounts can be deleted through this endpoint'
        ]);
        exit;
    }
    
    // Verify password if provided (recommended for security)
    if ($password_confirmation && !password_verify($password_confirmation, $user['password'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid password confirmation'
        ]);
        exit;
    }
    
    if ($permanent_delete) {
        // PERMANENT DELETE (use with caution)
        // This will cascade delete related records
        $delete_sql = "DELETE FROM users WHERE user_id = ?";
        $delete_stmt = $conn->prepare($delete_sql);
        $delete_stmt->bind_param("i", $user_id);
        
        if ($delete_stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Account permanently deleted',
                'type' => 'permanent'
            ]);
        } else {
            throw new Exception('Failed to delete account: ' . $delete_stmt->error);
        }
    } else {
        // SOFT DELETE (recommended)
        // Deactivate account instead of deleting
        $deactivate_sql = "UPDATE users SET is_active = FALSE WHERE user_id = ?";
        $deactivate_stmt = $conn->prepare($deactivate_sql);
        $deactivate_stmt->bind_param("i", $user_id);
        
        if ($deactivate_stmt->execute()) {
            // Log the deactivation
            $log_sql = "INSERT INTO profile_activity_log (user_id, action_type, action_details) VALUES (?, 'account_deactivation', ?)";
            $log_stmt = $conn->prepare($log_sql);
            $log_details = json_encode([
                'deactivated_at' => date('Y-m-d H:i:s'),
                'reason' => $input['reason'] ?? 'User requested deletion'
            ]);
            $log_stmt->bind_param("is", $user_id, $log_details);
            $log_stmt->execute();
            
            echo json_encode([
                'success' => true,
                'message' => 'Account deactivated successfully',
                'type' => 'soft_delete',
                'note' => 'Account can be reactivated by contacting support'
            ]);
        } else {
            throw new Exception('Failed to deactivate account: ' . $deactivate_stmt->error);
        }
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error deleting account: ' . $e->getMessage()
    ]);
}

$conn->close();

