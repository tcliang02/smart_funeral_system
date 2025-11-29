<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type"), ngrok-skip-browser-warning;
header("Content-Type: application/json");

include "db_connect.php";

$data = json_decode(file_get_contents("php://input"), true);

// ===  DEBUGGING: Log received data ===
error_log("=== CREATE BOOKING DEBUG ===");
error_log("Received data: " . json_encode($data));
error_log("selected_addons: " . json_encode($data['selected_addons'] ?? 'NULL'));
error_log("selected_addons count: " . (is_array($data['selected_addons'] ?? null) ? count($data['selected_addons']) : 0));

// Validate required fields
$required_fields = ['package_id', 'customer_name', 'customer_email', 'customer_phone', 'service_date'];
foreach ($required_fields as $field) {
    if (empty($data[$field])) {
        echo json_encode(["success" => false, "message" => "Missing required field: $field"]);
        exit;
    }
}

$package_id = $data['package_id'];
$customer_name = $data['customer_name'];
$customer_email = $data['customer_email'];
$customer_phone = $data['customer_phone'];
$service_date = $data['service_date'];
$service_address = $data['service_address'] ?? '';
$special_requirements = $data['special_requirements'] ?? '';
$selected_addons = $data['selected_addons'] ?? [];
$uploaded_files = $data['uploaded_files'] ?? null; // File paths from upload
$total_amount = floatval($data['total_amount']);
$user_id = $data['user_id'] ?? null; // Optional: links booking to logged-in user
$payment_method = $data['payment_method'] ?? null; // Optional: store payment method

try {
    $conn->begin_transaction();
    
    // Verify package exists
    $package_sql = "SELECT provider_id, name, price FROM packages WHERE package_id = ?";
    $package_stmt = $conn->prepare($package_sql);
    $package_stmt->bind_param("i", $package_id);
    $package_stmt->execute();
    $package_result = $package_stmt->get_result();
    
    if ($package_result->num_rows === 0) {
        echo json_encode(["success" => false, "message" => "Package not found"]);
        exit;
    }
    
    $package = $package_result->fetch_assoc();
    $provider_id = $package['provider_id'];
    
    error_log("Package found: ID={$package_id}, Provider ID={$provider_id}, Name={$package['name']}");
    
    // Prepare uploaded files JSON
    $uploaded_files_json = null;
    if (!empty($uploaded_files) && is_array($uploaded_files)) {
        $uploaded_files_json = json_encode($uploaded_files);
    }
    
    // Create booking (including provider_id, payment_method and uploaded_files)
    $booking_sql = "INSERT INTO bookings 
                    (package_id, provider_id, user_id, customer_name, customer_email, customer_phone, 
                     service_date, service_address, special_requirements, total_amount, payment_method, uploaded_files, status) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')";
    $booking_stmt = $conn->prepare($booking_sql);
    $booking_stmt->bind_param("iiissssssdss", $package_id, $provider_id, $user_id, $customer_name, $customer_email, 
                             $customer_phone, $service_date, $service_address, 
                             $special_requirements, $total_amount, $payment_method, $uploaded_files_json);
    
    if ($booking_stmt->execute()) {
        $booking_id = $conn->insert_id;
        error_log("✅ Booking created with ID: $booking_id");
        
        // CRITICAL: Verify booking was inserted
        $verify_sql = "SELECT booking_id FROM bookings WHERE booking_id = ?";
        $verify_stmt = $conn->prepare($verify_sql);
        $verify_stmt->bind_param("i", $booking_id);
        $verify_stmt->execute();
        $verify_result = $verify_stmt->get_result();
        
        if ($verify_result->num_rows === 0) {
            error_log("❌ CRITICAL: Booking ID $booking_id NOT FOUND after insertion!");
            throw new Exception("Booking was not created properly");
        }
        error_log("✅ Booking ID $booking_id verified in database");
        
        // Add selected add-ons if any
        error_log("Checking add-ons for booking_id: $booking_id");
        error_log("selected_addons empty check: " . (empty($selected_addons) ? 'YES-EMPTY' : 'NO-HAS-DATA'));
        error_log("selected_addons is_array: " . (is_array($selected_addons) ? 'YES' : 'NO'));
        error_log("selected_addons data: " . json_encode($selected_addons));
        
        if (!empty($selected_addons) && is_array($selected_addons)) {
            error_log("✅ Processing " . count($selected_addons) . " add-ons for booking_id: $booking_id");
            
            $addon_count = 0;
            foreach ($selected_addons as $addon) {
                // Support both 'addon_name' and 'name' keys
                $addon_name = $addon['addon_name'] ?? $addon['name'] ?? '';
                $addon_price = $addon['price'] ?? 0;
                $addon_id = $addon['addon_id'] ?? null;
                
                if (!empty($addon_name) && isset($addon_price)) {
                    if ($addon_id !== null) {
                        // Insert with addon_id if available
                        $addon_sql = "INSERT INTO booking_addons (booking_id, addon_id, addon_name, addon_price) VALUES (?, ?, ?, ?)";
                        $addon_stmt = $conn->prepare($addon_sql);
                        $addon_stmt->bind_param("iisd", $booking_id, $addon_id, $addon_name, $addon_price);
                    } else {
                        // Insert without addon_id for custom add-ons
                        $addon_sql = "INSERT INTO booking_addons (booking_id, addon_name, addon_price) VALUES (?, ?, ?)";
                        $addon_stmt = $conn->prepare($addon_sql);
                        $addon_stmt->bind_param("isd", $booking_id, $addon_name, $addon_price);
                    }
                    
                    error_log("Inserting addon: " . $addon_name . " - RM" . $addon_price . " (ID: " . ($addon_id ?? 'NULL') . ") for booking_id: $booking_id");
                    $result = $addon_stmt->execute();
                    if (!$result) {
                        error_log("❌ Addon insertion failed: " . $addon_stmt->error);
                        throw new Exception("Failed to insert addon: " . $addon_stmt->error);
                    }
                    $addon_count++;
                }
            }
            error_log("✅ Inserted $addon_count add-ons into database");
        } else {
            error_log("❌ NO ADD-ONS TO INSERT - array is empty or not an array");
        }
        
        // Generate booking reference
        $booking_ref = "BK" . str_pad($booking_id, 6, "0", STR_PAD_LEFT);
        $update_ref_sql = "UPDATE bookings SET booking_reference = ? WHERE booking_id = ?";
        $update_ref_stmt = $conn->prepare($update_ref_sql);
        $update_ref_stmt->bind_param("si", $booking_ref, $booking_id);
        $update_ref_stmt->execute();
        
        $conn->commit();
        
        echo json_encode([
            "success" => true,
            "message" => "Booking created successfully",
            "booking_id" => $booking_id,
            "booking_reference" => $booking_ref,
            "package_name" => $package['name']
        ]);
        
    } else {
        throw new Exception("Failed to create booking");
    }
    
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}

$conn->close();
?>
