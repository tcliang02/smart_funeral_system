<?php
/**
 * ZENLINK: Check Availability API Endpoint
 * 
 * Endpoints:
 * - POST /checkAvailability - Check resource or inventory availability
 * 
 * Request body:
 * {
 *   "type": "resource" | "inventory",
 *   "provider_id": 1,
 *   "resource_type": "parlour", (for resource)
 *   "resource_name": "Hall A", (for resource)
 *   "start_date": "2024-12-15", (for resource)
 *   "end_date": "2024-12-17", (for resource)
 *   "start_time": "09:00:00", (optional, for resource)
 *   "end_time": "18:00:00", (optional, for resource)
 *   "addon_id": 10, (for inventory)
 *   "quantity": 2, (for inventory)
 *   "exclude_booking_id": 123 (optional, for updates)
 * }
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type"), ngrok-skip-browser-warning;
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include "db_connect.php";
include "availability_helpers.php";

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['type'])) {
    echo json_encode([
        "success" => false,
        "message" => "Missing required field: type (must be 'resource' or 'inventory')"
    ]);
    exit;
}

try {
    $pdo = $conn->getPDO();
    $type = $data['type'];
    
    if ($type === 'resource') {
        // Check resource availability
        $required_fields = ['provider_id', 'resource_type', 'resource_name', 'start_date', 'end_date'];
        foreach ($required_fields as $field) {
            if (empty($data[$field])) {
                echo json_encode([
                    "success" => false,
                    "message" => "Missing required field for resource check: $field"
                ]);
                exit;
            }
        }
        
        $result = checkResourceAvailability(
            $pdo,
            $data['provider_id'],
            $data['resource_type'],
            $data['resource_name'],
            $data['start_date'],
            $data['end_date'],
            $data['start_time'] ?? null,
            $data['end_time'] ?? null,
            $data['exclude_booking_id'] ?? null
        );
        
        echo json_encode([
            "success" => true,
            "type" => "resource",
            "data" => $result
        ]);
        
    } else if ($type === 'inventory') {
        // Check inventory availability
        if (empty($data['addon_id'])) {
            echo json_encode([
                "success" => false,
                "message" => "Missing required field for inventory check: addon_id"
            ]);
            exit;
        }
        
        $result = checkInventoryAvailability(
            $pdo,
            $data['addon_id'],
            $data['quantity'] ?? 1,
            $data['exclude_booking_id'] ?? null
        );
        
        echo json_encode([
            "success" => true,
            "type" => "inventory",
            "data" => $result
        ]);
        
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Invalid type: $type (must be 'resource' or 'inventory')"
        ]);
    }
    
} catch (Exception $e) {
    error_log("Error checking availability: " . $e->getMessage());
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
    http_response_code(500);
}

$conn->close();
?>

