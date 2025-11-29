<?php
// Clean output buffer to prevent any extra output
ob_start();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, PUT");
header("Access-Control-Allow-Headers: Content-Type, Authorization"), ngrok-skip-browser-warning;
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Suppress error output that might interfere with JSON
error_reporting(0);
ini_set('display_errors', 0);

include "db_connect.php";

$data = json_decode(file_get_contents("php://input"), true);

// Get provider_id dynamically from the token/session
// For now, we'll get it from user_id 8 which should map to provider_id 3
$user_id = 8; // This should come from authenticated session

$provider_query = "SELECT provider_id FROM service_provider WHERE user_id = ?";
$provider_stmt = $conn->prepare($provider_query);
$provider_stmt->bind_param("i", $user_id);
$provider_stmt->execute();
$provider_result = $provider_stmt->get_result();

if ($provider_result->num_rows === 0) {
    ob_clean();
    echo json_encode(["success" => false, "message" => "Provider profile not found for user_id: $user_id"]);
    exit;
}

$provider_row = $provider_result->fetch_assoc();
$provider_id = $provider_row['provider_id'];
$provider_stmt->close();

// Log for debugging
error_log("Creating package for provider_id: $provider_id (user_id: $user_id)");

// Validate required fields
$required_fields = ['name', 'description', 'price'];
foreach ($required_fields as $field) {
    if (empty($data[$field])) {
        echo json_encode(["success" => false, "message" => "Missing required field: $field"]);
        exit;
    }
}

$name = $data['name'];
$description = $data['description'];
$price = floatval($data['price']);
$image_url = $data['image_url'] ?? '';
$is_featured = isset($data['is_featured']) ? intval($data['is_featured']) : 0;

$action = $data['action'] ?? 'create';
$package_id = $data['package_id'] ?? null;

try {
    $conn->begin_transaction();
    
    // Handle different actions (create or update)
    if ($action === 'create') {
        // Create new package
        $sql = "INSERT INTO packages (provider_id, name, description, price, image_url, is_featured) 
                VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("issdsi", $provider_id, $name, $description, $price, $image_url, $is_featured);
        
        if ($stmt->execute()) {
            $new_package_id = $conn->insert_id;
            
            // Add package features if provided
            if (!empty($data['features']) && is_array($data['features'])) {
                $feature_sql = "INSERT INTO package_features (package_id, feature_name) VALUES (?, ?)";
                $feature_stmt = $conn->prepare($feature_sql);
                
                foreach ($data['features'] as $feature) {
                    if (!empty(trim($feature))) {
                        $feature_stmt->bind_param("is", $new_package_id, trim($feature));
                        $feature_stmt->execute();
                    }
                }
                $feature_stmt->close();
            }
            
            $conn->commit();
            
            // Clean any output buffer content before sending JSON
            ob_clean();
            echo json_encode([
                "success" => true, 
                "message" => "Package created successfully",
                "package_id" => $new_package_id
            ]);
            exit;
        } else {
            $conn->rollback();
            
            // Clean any output buffer content before sending JSON
            ob_clean();
            echo json_encode(["success" => false, "message" => "Failed to create package: " . $stmt->error]);
            exit;
        }
    } else if ($action === 'update' && $package_id) {
        // Verify package belongs to this provider
        $verify_sql = "SELECT package_id FROM packages WHERE package_id = ? AND provider_id = ?";
        $verify_stmt = $conn->prepare($verify_sql);
        $verify_stmt->bind_param("ii", $package_id, $provider_id);
        $verify_stmt->execute();
        $verify_result = $verify_stmt->get_result();
        
        if ($verify_result->num_rows === 0) {
            $conn->rollback();
            ob_clean();
            echo json_encode(["success" => false, "message" => "Package not found or does not belong to this provider"]);
            exit;
        }
        
        // Update existing package
        $sql = "UPDATE packages SET 
                name = ?, 
                description = ?, 
                price = ?, 
                image_url = ?, 
                is_featured = ? 
                WHERE package_id = ? AND provider_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssdsiii", $name, $description, $price, $image_url, $is_featured, $package_id, $provider_id);
        
        if ($stmt->execute()) {
            // Delete existing features and add new ones
            $delete_features_sql = "DELETE FROM package_features WHERE package_id = ?";
            $delete_stmt = $conn->prepare($delete_features_sql);
            $delete_stmt->bind_param("i", $package_id);
            $delete_stmt->execute();
            
            // Add updated features
            if (!empty($data['features']) && is_array($data['features'])) {
                $feature_sql = "INSERT INTO package_features (package_id, feature_name) VALUES (?, ?)";
                $feature_stmt = $conn->prepare($feature_sql);
                
                foreach ($data['features'] as $feature) {
                    if (!empty(trim($feature))) {
                        $feature_stmt->bind_param("is", $package_id, trim($feature));
                        $feature_stmt->execute();
                    }
                }
                $feature_stmt->close();
            }
            
            $conn->commit();
            
            // Clean any output buffer content before sending JSON
            ob_clean();
            echo json_encode([
                "success" => true, 
                "message" => "Package updated successfully",
                "package_id" => $package_id
            ]);
            exit;
        } else {
            $conn->rollback();
            
            // Clean any output buffer content before sending JSON
            ob_clean();
            echo json_encode(["success" => false, "message" => "Failed to update package: " . $stmt->error]);
            exit;
        }
    } else {
        $conn->rollback();
        ob_clean();
        echo json_encode(["success" => false, "message" => "Invalid action or missing package_id for update"]);
        exit;
    }
    
    $stmt->close();
    
} catch (Exception $e) {
    $conn->rollback();
    
    // Clean any output buffer content before sending JSON
    ob_clean();
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
    exit;
}

$conn->close();
exit;
?>
