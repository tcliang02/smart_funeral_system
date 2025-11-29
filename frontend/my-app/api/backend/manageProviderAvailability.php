<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization"), ngrok-skip-browser-warning;
header("Content-Type: application/json");

include "db_connect.php";

// Handle pre-flight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get the request method
$method = $_SERVER['REQUEST_METHOD'];

// Handle request based on method
switch ($method) {
    case 'GET':
        getProviderAvailability();
        break;
    case 'POST':
        addUnavailableDate();
        break;
    case 'DELETE':
        removeUnavailableDate();
        break;
    default:
        http_response_code(405); // Method Not Allowed
        echo json_encode(["success" => false, "message" => "Method not allowed"]);
}

// Function to get a provider's unavailable dates
function getProviderAvailability() {
    global $conn;
    
    // Get provider ID from query parameter
    $provider_id = $_GET['provider_id'] ?? null;
    $start_date = $_GET['start_date'] ?? date('Y-m-d'); // Default to today
    $end_date = $_GET['end_date'] ?? date('Y-m-d', strtotime('+3 months')); // Default to 3 months ahead
    
    // Validate required parameters
    if (!$provider_id) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Provider ID is required"]);
        exit;
    }
    
    try {
        // Check if provider exists
        $provider_check_sql = "SELECT provider_id FROM service_provider WHERE provider_id = ?";
        $provider_check_stmt = $conn->prepare($provider_check_sql);
        $provider_check_stmt->bind_param("i", $provider_id);
        $provider_check_stmt->execute();
        $provider_result = $provider_check_stmt->get_result();
        
        if ($provider_result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Provider not found"]);
            exit;
        }
        
        // Query to get unavailable dates
        $sql = "SELECT date_unavailable, reason FROM provider_availability 
                WHERE provider_id = ? 
                AND date_unavailable BETWEEN ? AND ?
                ORDER BY date_unavailable ASC";
                
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("iss", $provider_id, $start_date, $end_date);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $unavailable_dates = [];
        while ($row = $result->fetch_assoc()) {
            $unavailable_dates[] = [
                'date' => $row['date_unavailable'],
                'reason' => $row['reason']
            ];
        }
        
        // Return the data
        echo json_encode([
            "success" => true,
            "provider_id" => $provider_id,
            "start_date" => $start_date,
            "end_date" => $end_date,
            "unavailable_dates" => $unavailable_dates
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
    }
}

// Function to add an unavailable date
function addUnavailableDate() {
    global $conn;
    
    // Get request body
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Validate required fields
    $required_fields = ['provider_id', 'dates'];
    foreach ($required_fields as $field) {
        if (empty($data[$field])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Missing required field: $field"]);
            exit;
        }
    }
    
    $provider_id = $data['provider_id'];
    $dates = $data['dates']; // This should be an array of dates or date ranges
    $reason = $data['reason'] ?? '';
    
    // Validate dates array
    if (!is_array($dates) || empty($dates)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Dates must be a non-empty array"]);
        exit;
    }
    
    try {
        // Check if provider exists
        $provider_check_sql = "SELECT provider_id FROM service_provider WHERE provider_id = ?";
        $provider_check_stmt = $conn->prepare($provider_check_sql);
        $provider_check_stmt->bind_param("i", $provider_id);
        $provider_check_stmt->execute();
        $provider_result = $provider_check_stmt->get_result();
        
        if ($provider_result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Provider not found"]);
            exit;
        }
        
        // Start transaction
        $conn->begin_transaction();
        
        // Insert statement
        $insert_sql = "INSERT INTO provider_availability (provider_id, date_unavailable, reason) 
                      VALUES (?, ?, ?)
                      ON DUPLICATE KEY UPDATE reason = ?";
        $insert_stmt = $conn->prepare($insert_sql);
        
        $added_count = 0;
        
        // Process each date or date range
        foreach ($dates as $date_item) {
            // Handle date ranges
            if (isset($date_item['start']) && isset($date_item['end'])) {
                // Get all dates in the range
                $start_date = new DateTime($date_item['start']);
                $end_date = new DateTime($date_item['end']);
                $interval = new DateInterval('P1D'); // 1 day interval
                $date_range = new DatePeriod($start_date, $interval, $end_date->modify('+1 day'));
                
                // Insert each date in the range
                foreach ($date_range as $date) {
                    $date_string = $date->format('Y-m-d');
                    $insert_stmt->bind_param("isss", $provider_id, $date_string, $reason, $reason);
                    
                    if ($insert_stmt->execute()) {
                        $added_count++;
                    }
                }
            } 
            // Handle single dates
            else if (isset($date_item['date'])) {
                $date_string = $date_item['date'];
                $specific_reason = $date_item['reason'] ?? $reason; // Use specific reason if provided
                
                $insert_stmt->bind_param("isss", $provider_id, $date_string, $specific_reason, $specific_reason);
                
                if ($insert_stmt->execute()) {
                    $added_count++;
                }
            }
            // Simple date string without metadata
            else if (is_string($date_item)) {
                $insert_stmt->bind_param("isss", $provider_id, $date_item, $reason, $reason);
                
                if ($insert_stmt->execute()) {
                    $added_count++;
                }
            }
        }
        
        // Commit transaction
        $conn->commit();
        
        // Return success response
        echo json_encode([
            "success" => true,
            "message" => "$added_count unavailable date(s) added successfully",
            "added_count" => $added_count
        ]);
        
    } catch (Exception $e) {
        // Rollback on error
        if ($conn->inTransaction()) {
            $conn->rollback();
        }
        
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
    }
}

// Function to remove an unavailable date
function removeUnavailableDate() {
    global $conn;
    
    // Get request body
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Validate required fields
    $required_fields = ['provider_id', 'dates'];
    foreach ($required_fields as $field) {
        if (empty($data[$field])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Missing required field: $field"]);
            exit;
        }
    }
    
    $provider_id = $data['provider_id'];
    $dates = $data['dates']; // This should be an array of dates or date ranges
    
    // Validate dates array
    if (!is_array($dates) || empty($dates)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Dates must be a non-empty array"]);
        exit;
    }
    
    try {
        // Check if provider exists
        $provider_check_sql = "SELECT provider_id FROM service_provider WHERE provider_id = ?";
        $provider_check_stmt = $conn->prepare($provider_check_sql);
        $provider_check_stmt->bind_param("i", $provider_id);
        $provider_check_stmt->execute();
        $provider_result = $provider_check_stmt->get_result();
        
        if ($provider_result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Provider not found"]);
            exit;
        }
        
        // Start transaction
        $conn->begin_transaction();
        
        // Delete statement
        $delete_sql = "DELETE FROM provider_availability WHERE provider_id = ? AND date_unavailable = ?";
        $delete_stmt = $conn->prepare($delete_sql);
        
        $removed_count = 0;
        
        // Process each date or date range
        foreach ($dates as $date_item) {
            // Handle date ranges
            if (isset($date_item['start']) && isset($date_item['end'])) {
                // Get all dates in the range
                $start_date = new DateTime($date_item['start']);
                $end_date = new DateTime($date_item['end']);
                $interval = new DateInterval('P1D'); // 1 day interval
                $date_range = new DatePeriod($start_date, $interval, $end_date->modify('+1 day'));
                
                // Delete each date in the range
                foreach ($date_range as $date) {
                    $date_string = $date->format('Y-m-d');
                    $delete_stmt->bind_param("is", $provider_id, $date_string);
                    
                    $delete_stmt->execute();
                    $removed_count += $delete_stmt->affected_rows;
                }
            } 
            // Handle single dates
            else if (isset($date_item['date'])) {
                $date_string = $date_item['date'];
                
                $delete_stmt->bind_param("is", $provider_id, $date_string);
                
                $delete_stmt->execute();
                $removed_count += $delete_stmt->affected_rows;
            }
            // Simple date string without metadata
            else if (is_string($date_item)) {
                $delete_stmt->bind_param("is", $provider_id, $date_item);
                
                $delete_stmt->execute();
                $removed_count += $delete_stmt->affected_rows;
            }
        }
        
        // Commit transaction
        $conn->commit();
        
        // Return success response
        echo json_encode([
            "success" => true,
            "message" => "$removed_count unavailable date(s) removed successfully",
            "removed_count" => $removed_count
        ]);
        
    } catch (Exception $e) {
        // Rollback on error
        if ($conn->inTransaction()) {
            $conn->rollback();
        }
        
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
    }
}

$conn->close();
?>
