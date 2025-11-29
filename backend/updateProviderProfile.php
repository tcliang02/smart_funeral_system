<?php
/**
 * Update Provider Profile
 * Comprehensive update for service provider profile information
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
if (!isset($input['provider_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Provider ID is required'
    ]);
    exit;
}

$provider_id = intval($input['provider_id']);

// Optional fields for update
$company_name = isset($input['company_name']) ? trim($input['company_name']) : null;
$business_type = isset($input['business_type']) ? trim($input['business_type']) : null;
$business_registration = isset($input['business_registration']) ? trim($input['business_registration']) : null;
$description = isset($input['description']) ? trim($input['description']) : null;
$address = isset($input['address']) ? trim($input['address']) : null;
$city = isset($input['city']) ? trim($input['city']) : null;
$state = isset($input['state']) ? trim($input['state']) : null;
$postal_code = isset($input['postal_code']) ? trim($input['postal_code']) : null;
$phone = isset($input['phone']) ? trim($input['phone']) : null;
$email = isset($input['email']) ? trim($input['email']) : null;
$website = isset($input['website']) ? trim($input['website']) : null;
$logo = isset($input['logo']) ? trim($input['logo']) : null;
$operating_hours = isset($input['operating_hours']) ? trim($input['operating_hours']) : null;
$services_offered = isset($input['services_offered']) ? json_encode($input['services_offered']) : null;
$facebook_url = isset($input['facebook_url']) ? trim($input['facebook_url']) : null;
$instagram_url = isset($input['instagram_url']) ? trim($input['instagram_url']) : null;

try {
    // Verify provider exists
    $check_sql = "SELECT provider_id, user_id FROM service_provider WHERE provider_id = ?";
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
    
    // Check if email is being changed and if it's already taken
    if ($email) {
        $email_check = "SELECT provider_id FROM service_provider WHERE email = ? AND provider_id != ?";
        $email_stmt = $conn->prepare($email_check);
        $email_stmt->bind_param("si", $email, $provider_id);
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
    
    if ($company_name !== null) {
        $update_fields[] = "company_name = ?";
        $param_types .= "s";
        $param_values[] = $company_name;
    }
    
    if ($business_type !== null) {
        $update_fields[] = "business_type = ?";
        $param_types .= "s";
        $param_values[] = $business_type;
    }
    
    if ($business_registration !== null) {
        $update_fields[] = "business_registration = ?";
        $param_types .= "s";
        $param_values[] = $business_registration;
    }
    
    if ($description !== null) {
        $update_fields[] = "description = ?";
        $param_types .= "s";
        $param_values[] = $description;
    }
    
    if ($address !== null) {
        $update_fields[] = "address = ?";
        $param_types .= "s";
        $param_values[] = $address;
    }
    
    if ($city !== null) {
        $update_fields[] = "city = ?";
        $param_types .= "s";
        $param_values[] = $city;
    }
    
    if ($state !== null) {
        $update_fields[] = "state = ?";
        $param_types .= "s";
        $param_values[] = $state;
    }
    
    if ($postal_code !== null) {
        $update_fields[] = "postal_code = ?";
        $param_types .= "s";
        $param_values[] = $postal_code;
    }
    
    if ($phone !== null) {
        $update_fields[] = "phone = ?";
        $param_types .= "s";
        $param_values[] = $phone;
    }
    
    if ($email !== null) {
        $update_fields[] = "email = ?";
        $param_types .= "s";
        $param_values[] = $email;
    }
    
    if ($website !== null) {
        $update_fields[] = "website = ?";
        $param_types .= "s";
        $param_values[] = $website;
    }
    
    if ($logo !== null) {
        $update_fields[] = "logo = ?";
        $param_types .= "s";
        $param_values[] = $logo;
    }
    
    if ($operating_hours !== null) {
        $update_fields[] = "operating_hours = ?";
        $param_types .= "s";
        $param_values[] = $operating_hours;
    }
    
    if ($services_offered !== null) {
        $update_fields[] = "services_offered = ?";
        $param_types .= "s";
        $param_values[] = $services_offered;
    }
    
    if ($facebook_url !== null) {
        $update_fields[] = "facebook_url = ?";
        $param_types .= "s";
        $param_values[] = $facebook_url;
    }
    
    if ($instagram_url !== null) {
        $update_fields[] = "instagram_url = ?";
        $param_types .= "s";
        $param_values[] = $instagram_url;
    }
    
    if (empty($update_fields)) {
        echo json_encode([
            'success' => false,
            'message' => 'No fields to update'
        ]);
        exit;
    }
    
    // Add provider_id to parameters
    $param_types .= "i";
    $param_values[] = $provider_id;
    
    // Execute update
    $sql = "UPDATE service_provider SET " . implode(", ", $update_fields) . " WHERE provider_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($param_types, ...$param_values);
    
    if ($stmt->execute()) {
        // Log the activity if user_id exists
        if ($user_id) {
            $log_sql = "INSERT INTO profile_activity_log (user_id, action_type, action_details) VALUES (?, 'profile_update', ?)";
            $log_stmt = $conn->prepare($log_sql);
            $log_details = json_encode([
                'provider_id' => $provider_id,
                'updated_fields' => array_keys($input),
                'timestamp' => date('Y-m-d H:i:s')
            ]);
            $log_stmt->bind_param("is", $user_id, $log_details);
            $log_stmt->execute();
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Provider profile updated successfully'
        ]);
    } else {
        throw new Exception('Failed to update provider profile: ' . $stmt->error);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error updating provider profile: ' . $e->getMessage()
    ]);
}

$conn->close();
?>

