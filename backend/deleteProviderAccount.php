<?php
/**
 * Delete Provider Account
 * Allows service providers to delete/deactivate their account
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
if (!isset($input['provider_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Provider ID is required'
    ]);
    exit;
}

$provider_id = intval($input['provider_id']);
$permanent_delete = isset($input['permanent']) && $input['permanent'] === true;
$password_confirmation = isset($input['password']) ? $input['password'] : null;

try {
    // Get provider and user information
    $check_sql = "SELECT sp.provider_id, sp.user_id, sp.is_active, u.password 
                  FROM service_provider sp
                  LEFT JOIN users u ON sp.user_id = u.user_id
                  WHERE sp.provider_id = ?";
    $check_stmt = $conn->prepare($check_sql);
    $check_stmt->bind_param("i", $provider_id);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();
    
    if ($check_result->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Provider not found'
        ]);
        exit;
    }
    
    $provider = $check_result->fetch_assoc();
    $user_id = $provider['user_id'];
    
    // Verify password if provided and user exists
    if ($password_confirmation && $user_id && $provider['password']) {
        if (!password_verify($password_confirmation, $provider['password'])) {
            echo json_encode([
                'success' => false,
                'message' => 'Invalid password confirmation'
            ]);
            exit;
        }
    }
    
    // Check for active bookings
    $active_bookings_sql = "SELECT COUNT(*) as count FROM bookings 
                            WHERE provider_id = ? 
                            AND status IN ('pending', 'confirmed')";
    $active_stmt = $conn->prepare($active_bookings_sql);
    $active_stmt->bind_param("i", $provider_id);
    $active_stmt->execute();
    $active_result = $active_stmt->get_result();
    $active_data = $active_result->fetch_assoc();
    
    if ($active_data['count'] > 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Cannot delete account with active bookings. Please complete or cancel all pending bookings first.',
            'active_bookings' => $active_data['count']
        ]);
        exit;
    }
    
    if ($permanent_delete) {
        // PERMANENT DELETE (use with caution)
        // This will cascade delete packages and related records
        $delete_sql = "DELETE FROM service_provider WHERE provider_id = ?";
        $delete_stmt = $conn->prepare($delete_sql);
        $delete_stmt->bind_param("i", $provider_id);
        
        if ($delete_stmt->execute()) {
            // Also deactivate the user account if exists
            if ($user_id) {
                $user_deactivate = "UPDATE users SET is_active = FALSE WHERE user_id = ?";
                $user_stmt = $conn->prepare($user_deactivate);
                $user_stmt->bind_param("i", $user_id);
                $user_stmt->execute();
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Provider account permanently deleted',
                'type' => 'permanent'
            ]);
        } else {
            throw new Exception('Failed to delete provider account: ' . $delete_stmt->error);
        }
    } else {
        // SOFT DELETE (recommended)
        // Deactivate provider account and all packages
        $deactivate_sql = "UPDATE service_provider SET is_active = FALSE WHERE provider_id = ?";
        $deactivate_stmt = $conn->prepare($deactivate_sql);
        $deactivate_stmt->bind_param("i", $provider_id);
        
        if ($deactivate_stmt->execute()) {
            // Deactivate all packages
            $deactivate_packages = "UPDATE packages SET is_active = FALSE WHERE provider_id = ?";
            $packages_stmt = $conn->prepare($deactivate_packages);
            $packages_stmt->bind_param("i", $provider_id);
            $packages_stmt->execute();
            
            // Deactivate user account if exists
            if ($user_id) {
                $user_deactivate = "UPDATE users SET is_active = FALSE WHERE user_id = ?";
                $user_stmt = $conn->prepare($user_deactivate);
                $user_stmt->bind_param("i", $user_id);
                $user_stmt->execute();
                
                // Log the deactivation
                $log_sql = "INSERT INTO profile_activity_log (user_id, action_type, action_details) VALUES (?, 'account_deactivation', ?)";
                $log_stmt = $conn->prepare($log_sql);
                $log_details = json_encode([
                    'provider_id' => $provider_id,
                    'deactivated_at' => date('Y-m-d H:i:s'),
                    'reason' => $input['reason'] ?? 'Provider requested deletion'
                ]);
                $log_stmt->bind_param("is", $user_id, $log_details);
                $log_stmt->execute();
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Provider account deactivated successfully',
                'type' => 'soft_delete',
                'note' => 'Account can be reactivated by contacting support'
            ]);
        } else {
            throw new Exception('Failed to deactivate provider account: ' . $deactivate_stmt->error);
        }
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error deleting provider account: ' . $e->getMessage()
    ]);
}

$conn->close();

