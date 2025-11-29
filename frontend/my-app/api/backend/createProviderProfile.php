<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type"), ngrok-skip-browser-warning;
header("Content-Type: application/json");

include "db_connect.php";
include "helpers.php";

// Get input data
$data = json_decode(file_get_contents("php://input"), true);

// Validate required fields
$required_fields = ['user_id', 'company_name', 'address', 'phone'];
foreach ($required_fields as $field) {
    if (empty($data[$field])) {
        echo json_encode(["success" => false, "message" => "Missing required field: $field"]);
        exit;
    }
}

$user_id = $data['user_id'];
$company_name = $data['company_name'];
$address = $data['address'];
$phone = $data['phone'];
$description = $data['description'] ?? '';
$website = $data['website'] ?? '';
$logo_url = $data['logo_url'] ?? '';

try {
    // Start transaction
    $conn->begin_transaction();
    
    // Check if provider already exists
    $check_sql = "SELECT provider_id FROM service_provider WHERE user_id = ?";
    $check_stmt = $conn->prepare($check_sql);
    $check_stmt->bind_param("i", $user_id);
    $check_stmt->execute();
    $result = $check_stmt->get_result();
    
    if ($result->num_rows > 0) {
        echo json_encode(["success" => false, "message" => "Provider profile already exists"]);
        exit;
    }
    
    // Insert new provider
    $sql = "INSERT INTO service_provider (user_id, company_name, address, phone, description, website, logo_url) 
            VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("issssss", $user_id, $company_name, $address, $phone, $description, $website, $logo_url);
    
    if ($stmt->execute()) {
        $provider_id = $conn->insert_id;
        
        // Update user role to provider if not already
        $update_role_sql = "UPDATE users SET role = 'provider' WHERE id = ? AND role != 'provider'";
        $update_stmt = $conn->prepare($update_role_sql);
        $update_stmt->bind_param("i", $user_id);
        $update_stmt->execute();
        
        // Commit transaction
        $conn->commit();
        
        echo json_encode([
            "success" => true, 
            "message" => "Provider profile created successfully",
            "provider_id" => $provider_id
        ]);
    } else {
        throw new Exception("Failed to create provider profile");
    }
    
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}

$conn->close();
?>
