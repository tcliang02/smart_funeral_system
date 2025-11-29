<?php
// Start output buffering to prevent any output before JSON
ob_start();

// CORS headers for both regular responses and preflight OPTIONS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization"), ngrok-skip-browser-warning;
header("Content-Type: application/json");

// Handle preflight OPTIONS request immediately
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include "db_connect.php";
include "helpers.php";

// Enable error logging but disable display to prevent HTML errors in JSON
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', 'c:/xampp/htdocs/smart_funeral_system/php_errors.log');

// Create a detailed error log function
function debug_log($message, $data = null) {
    $log = "[" . date('Y-m-d H:i:s') . "] $message";
    if ($data !== null) {
        $log .= " - Data: " . print_r($data, true);
    }
    error_log($log);
}

// Log request details
debug_log("Request Method: " . $_SERVER['REQUEST_METHOD']);
debug_log("Content-Type: " . ($_SERVER['CONTENT_TYPE'] ?? 'Not set'));

// Log incoming request data
$raw_data = file_get_contents("php://input");
debug_log("Raw request data", $raw_data);

// Only read raw input once and store it
$data = json_decode($raw_data, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    ob_end_clean();
    echo json_encode([
        "success" => false, 
        "message" => "Invalid JSON data: " . json_last_error_msg(),
        "raw_data" => substr($raw_data, 0, 255) // Show beginning of raw data for debugging
    ]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
error_log("Parsed request data: " . print_r($data, true));

// Get authenticated user - more robust header handling
$headers = array();
if (function_exists('getallheaders')) {
    $headers = getallheaders();
} else {
    // Fallback for environments where getallheaders() is not available
    foreach ($_SERVER as $name => $value) {
        if (substr($name, 0, 5) == 'HTTP_') {
            $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
        }
    }
}

debug_log("About to verify auth. Headers", $headers);
$auth = verifyAuth($headers);
debug_log("Auth result", $auth);

if (!$auth) {
    debug_log("Authentication failed - returning Unauthorized");
    ob_end_clean();
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit;
}

// Get provider_id from authenticated user
$provider = getProviderByUserId($conn, $auth['id']);
if (!$provider) {
    ob_end_clean();
    echo json_encode(["success" => false, "message" => "Provider profile not found"]);
    exit;
}

$provider_id = $provider['provider_id'];

// Debug what fields we received
error_log("Received fields: " . implode(", ", array_keys($data)));

// Validate required fields based on method
if ($method === 'POST') {
    // For new packages, require name, description and price
    $required_fields = ['name', 'description', 'price'];
    foreach ($required_fields as $field) {
        if (!isset($data[$field]) || $data[$field] === '') {
            ob_end_clean();
            echo json_encode(["success" => false, "message" => "Missing required field: $field"]);
            exit;
        }
    }
} else if ($method === 'PUT') {
    // For updates, require package_id and at least one field to update
    if (empty($data['package_id'])) {
        ob_end_clean();
        echo json_encode(["success" => false, "message" => "Missing required field: package_id"]);
        exit;
    }
    
    // At least one of these fields must be present
    $update_fields = ['name', 'description', 'price', 'is_featured', 'is_active', 'duration_hours', 'capacity', 'location_type'];
    $has_update = false;
    foreach ($update_fields as $field) {
        if (isset($data[$field])) {
            $has_update = true;
            break;
        }
    }
    
    if (!$has_update) {
        ob_end_clean();
        echo json_encode(["success" => false, "message" => "No fields to update"]);
        exit;
    }
}

// Extract package ID first (especially important for PUT)
$package_id = isset($data['package_id']) ? intval($data['package_id']) : null;

// For POST, these fields must exist and have been validated above
// For PUT, set defaults that will be overridden if provided
$name = isset($data['name']) ? $data['name'] : '';
$description = isset($data['description']) ? $data['description'] : '';
$price = isset($data['price']) ? floatval($data['price']) : 0;
$is_featured = isset($data['is_featured']) ? intval($data['is_featured']) : 0;

try {
    $conn->begin_transaction();
    
    if ($method === 'POST') {
        // Create new package
        $sql = "INSERT INTO packages (provider_id, name, description, price, is_featured, 
                                     duration_hours, capacity, location_type) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                
        // Get optional fields with defaults
        $duration_hours = isset($data['duration_hours']) ? $data['duration_hours'] : null;
        $capacity = isset($data['capacity']) ? $data['capacity'] : null;
        $location_type = isset($data['location_type']) ? $data['location_type'] : 'both';
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("issdiiss", 
            $provider_id, $name, $description, $price, $is_featured,
            $duration_hours, $capacity, $location_type);
        
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
            }
            
            // Update provider's total packages count and average price
            updateProviderStats($conn, $provider_id);
            
            $conn->commit();
            
            // Clean output buffer before sending JSON
            ob_end_clean();
            
            echo json_encode([
                "success" => true, 
                "message" => "Package created successfully",
                "package_id" => $new_package_id
            ]);
        } else {
            throw new Exception("Failed to create package");
        }
        
    } elseif ($method === 'PUT') {
        // Update existing package
        debug_log("Processing PUT request for package update");
        debug_log("Package ID from data", $package_id);
        debug_log("Provider ID", $provider_id);
        
        if (!$package_id) {
            debug_log("Error: Missing package_id for update");
            ob_end_clean();
            echo json_encode(["success" => false, "message" => "Missing package_id for update"]);
            exit;
        }
        
        // Verify package belongs to provider
        $verify_sql = "SELECT package_id FROM packages WHERE package_id = ? AND provider_id = ?";
        debug_log("Verify SQL", $verify_sql);
        debug_log("Params: package_id=$package_id, provider_id=$provider_id");
        
        $verify_stmt = $conn->prepare($verify_sql);
        $verify_stmt->bind_param("ii", $package_id, $provider_id);
        $verify_stmt->execute();
        
        if ($verify_stmt->get_result()->num_rows === 0) {
            ob_end_clean();
            echo json_encode(["success" => false, "message" => "Package not found or unauthorized"]);
            exit;
        }
        
        // Update package
        $sql = "UPDATE packages 
                SET name = ?, description = ?, price = ?, is_featured = ?, is_active = ?,
                    duration_hours = ?, capacity = ?, location_type = ?
                WHERE package_id = ? AND provider_id = ?";
        
        debug_log("Update SQL", $sql);
                
        // Get all fields with defaults for update
        $name = isset($data['name']) ? $data['name'] : '';
        $description = isset($data['description']) ? $data['description'] : '';
        $price = isset($data['price']) ? floatval($data['price']) : 0;
        $is_featured = isset($data['is_featured']) ? intval($data['is_featured']) : 0;
        $is_active = isset($data['is_active']) ? intval($data['is_active']) : 1;
        $duration_hours = isset($data['duration_hours']) ? $data['duration_hours'] : null;
        $capacity = isset($data['capacity']) ? $data['capacity'] : null;
        
        // Debug location_type specifically
        debug_log("RAW location_type from data", [
            'isset' => isset($data['location_type']),
            'value' => isset($data['location_type']) ? $data['location_type'] : 'NOT SET',
            'empty_check' => isset($data['location_type']) ? empty($data['location_type']) : 'N/A'
        ]);
        
        $location_type = isset($data['location_type']) && !empty($data['location_type']) ? $data['location_type'] : 'both';
        
        debug_log("FINAL location_type", $location_type);
        
        debug_log("UPDATE Parameters", [
            'package_id' => $package_id,
            'provider_id' => $provider_id,
            'name' => $name,
            'description' => substr($description, 0, 50) . (strlen($description) > 50 ? '...' : ''),
            'price' => $price,
            'duration_hours' => $duration_hours,
            'capacity' => $capacity,
            'location_type' => $location_type,
            'is_featured' => $is_featured,
            'is_active' => $is_active
        ]);
        
        // Fix possible null value issues for numeric fields
        if ($duration_hours === '') $duration_hours = null;
        if ($capacity === '') $capacity = null;
        
        $stmt = $conn->prepare($sql);
        
        // Debug binding parameters
        debug_log("Binding parameters for UPDATE query");
        
        try {
            $stmt->bind_param("ssdiiiisii", 
                $name, $description, $price, $is_featured, $is_active,
                $duration_hours, $capacity, $location_type, 
                $package_id, $provider_id);
        } catch (Exception $e) {
            debug_log("Parameter binding error", $e->getMessage());
            throw $e;
        }
        
        debug_log("Executing UPDATE query");
        
        if ($stmt->execute()) {
            debug_log("UPDATE query executed successfully - Affected rows: " . $stmt->affected_rows);
            
            // Update package features - handle both adding and removing features
            if (isset($data['features']) && is_array($data['features'])) {
                debug_log("Updating package features", $data['features']);
                
                // Always delete existing features first (whether we're adding new ones or removing all)
                $delete_features_sql = "DELETE FROM package_features WHERE package_id = ?";
                debug_log("Deleting existing features", $delete_features_sql);
                $delete_stmt = $conn->prepare($delete_features_sql);
                $delete_stmt->bind_param("i", $package_id);
                $delete_stmt->execute();
                debug_log("Deleted existing features - Affected rows: " . $delete_stmt->affected_rows);
                
                // Add new features only if the array is not empty
                if (!empty($data['features'])) {
                    debug_log("Adding new features", $data['features']);
                    $feature_sql = "INSERT INTO package_features (package_id, feature_name) VALUES (?, ?)";
                    $feature_stmt = $conn->prepare($feature_sql);
                    
                    foreach ($data['features'] as $feature) {
                        if (!empty(trim($feature))) {
                            $feature_stmt->bind_param("is", $package_id, trim($feature));
                            $feature_stmt->execute();
                            debug_log("Added feature: " . trim($feature));
                        }
                    }
                } else {
                    debug_log("No new features to add - all features removed");
                }
            } else {
                debug_log("No features data provided - skipping feature update");
            }
            
            // Update provider stats
            debug_log("Updating provider stats");
            updateProviderStats($conn, $provider_id);
            
            debug_log("Committing transaction");
            $conn->commit();
            
            // Clean output buffer before sending JSON
            if (ob_get_length()) ob_end_clean();
            
            debug_log("Sending success response");
            echo json_encode(["success" => true, "message" => "Package updated successfully"]);
        } else {
            debug_log("Update statement returned false");
            throw new Exception("Failed to update package: " . $stmt->error);
        }
    }
    
} catch (Exception $e) {
    // Log error details for debugging
    debug_log("EXCEPTION in managePackage: " . $e->getMessage());
    debug_log("Stack trace: " . $e->getTraceAsString());
    
    // Clean output buffer and rollback transaction
    if (ob_get_length()) ob_end_clean();
    
    try {
        $conn->rollback();
        debug_log("Transaction rolled back");
    } catch (Exception $rollbackEx) {
        debug_log("Rollback failed: " . $rollbackEx->getMessage());
    }
    
    // Send detailed error response
    echo json_encode([
        "success" => false, 
        "message" => "Error: " . $e->getMessage(),
        "error_type" => get_class($e),
        "method" => $method
    ]);
}

// Helper function to update provider statistics
function updateProviderStats($conn, $provider_id) {
    $stats_sql = "UPDATE service_provider 
                  SET total_packages = (SELECT COUNT(*) FROM packages WHERE provider_id = ?),
                      average_price = (SELECT AVG(price) FROM packages WHERE provider_id = ?)
                  WHERE provider_id = ?";
    $stats_stmt = $conn->prepare($stats_sql);
    $stats_stmt->bind_param("iii", $provider_id, $provider_id, $provider_id);
    $stats_stmt->execute();
}

$conn->close();
?>
