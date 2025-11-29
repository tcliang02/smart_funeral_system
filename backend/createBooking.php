<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type"), ngrok-skip-browser-warning;
header("Content-Type: application/json");

include "db_connect.php";
include "availability_helpers.php";

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
$service_dates = $data['service_dates'] ?? []; // Multi-day support: array of {date, start_time, end_time, event_type}
$resources = $data['resources'] ?? []; // Resources: array of {resource_type, resource_name}
$uploaded_files = $data['uploaded_files'] ?? null; // File paths from upload
$total_amount = floatval($data['total_amount']);
$user_id = $data['user_id'] ?? null; // Optional: links booking to logged-in user
$payment_method = $data['payment_method'] ?? null; // Optional: store payment method

try {
    // Get PDO connection for helper functions
    $pdo = $conn->getPDO();
    
    // Verify package exists first to get provider_id
    $package_sql = "SELECT provider_id, name, price FROM packages WHERE package_id = :package_id";
    $package_stmt = $pdo->prepare($package_sql);
    $package_stmt->execute(['package_id' => $package_id]);
    $package = $package_stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$package) {
        echo json_encode(["success" => false, "message" => "Package not found"]);
        exit;
    }
    
    $provider_id = $package['provider_id'];
    
    error_log("Package found: ID={$package_id}, Provider ID={$provider_id}, Name={$package['name']}");
    
    // ============================================
    // VALIDATE BOOKING BEFORE CREATION
    // ============================================
    // Prepare addons array for validation
    $addons_for_validation = [];
    foreach ($selected_addons as $addon) {
        if (isset($addon['addon_id'])) {
            $addons_for_validation[] = [
                'addon_id' => $addon['addon_id'],
                'quantity' => $addon['quantity'] ?? 1
            ];
        }
    }
    
    // Validate booking (package, inventory, resources)
    $validation = validateBooking($pdo, $provider_id, $package_id, $addons_for_validation, $service_dates, $resources);
    
    if (!$validation['is_valid']) {
        echo json_encode([
            "success" => false, 
            "message" => $validation['message'],
            "validation_errors" => $validation['error_messages']
        ]);
        exit;
    }
    
    error_log("✅ Booking validation passed");
    
    // Start transaction
    $conn->begin_transaction();
    
    // Prepare uploaded files JSON
    $uploaded_files_json = null;
    if (!empty($uploaded_files) && is_array($uploaded_files)) {
        $uploaded_files_json = json_encode($uploaded_files);
    }
    
    // Create booking (including provider_id, payment_method and uploaded_files)
    $booking_sql = "INSERT INTO bookings 
                    (package_id, provider_id, user_id, customer_name, customer_email, customer_phone, 
                     service_date, service_address, special_requirements, total_amount, payment_method, uploaded_files, status) 
                    VALUES (:package_id, :provider_id, :user_id, :customer_name, :customer_email, :customer_phone, 
                            :service_date, :service_address, :special_requirements, :total_amount, :payment_method, :uploaded_files, 'pending')";
    
    $booking_stmt = $conn->prepare($booking_sql);
    $booking_result = $booking_stmt->execute([
        'package_id' => $package_id,
        'provider_id' => $provider_id,
        'user_id' => $user_id,
        'customer_name' => $customer_name,
        'customer_email' => $customer_email,
        'customer_phone' => $customer_phone,
        'service_date' => $service_date,
        'service_address' => $service_address,
        'special_requirements' => $special_requirements,
        'total_amount' => $total_amount,
        'payment_method' => $payment_method,
        'uploaded_files' => $uploaded_files_json
    ]);
    
    if ($booking_result) {
        $booking_id = $conn->lastInsertId();
        error_log("✅ Booking created with ID: $booking_id");
        
        // CRITICAL: Verify booking was inserted
        $verify_sql = "SELECT booking_id FROM bookings WHERE booking_id = :booking_id";
        $verify_stmt = $conn->prepare($verify_sql);
        $verify_stmt->execute(['booking_id' => $booking_id]);
        $verify_row = $verify_stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$verify_row) {
            error_log("❌ CRITICAL: Booking ID $booking_id NOT FOUND after insertion!");
            throw new Exception("Booking was not created properly");
        }
        error_log("✅ Booking ID $booking_id verified in database");
        
        // Add selected add-ons if any
        error_log("Checking add-ons for booking_id: $booking_id");
        
        if (!empty($selected_addons) && is_array($selected_addons)) {
            error_log("✅ Processing " . count($selected_addons) . " add-ons for booking_id: $booking_id");
            
            $addon_count = 0;
            foreach ($selected_addons as $addon) {
                // Support both 'addon_name' and 'name' keys
                $addon_name = $addon['addon_name'] ?? $addon['name'] ?? '';
                $addon_price = $addon['price'] ?? 0;
                $addon_id = $addon['addon_id'] ?? null;
                
                if (!empty($addon_name) && isset($addon_price)) {
                    $quantity = isset($addon['quantity']) ? (int)$addon['quantity'] : 1;
                    
                    if ($addon_id !== null) {
                        // Insert with addon_id if available (with quantity support)
                        $addon_sql = "INSERT INTO booking_addons (booking_id, addon_id, addon_name, addon_price, quantity) VALUES (:booking_id, :addon_id, :addon_name, :addon_price, :quantity)";
                        $addon_stmt = $conn->prepare($addon_sql);
                        $addon_stmt->execute([
                            'booking_id' => $booking_id,
                            'addon_id' => $addon_id,
                            'addon_name' => $addon_name,
                            'addon_price' => $addon_price,
                            'quantity' => $quantity
                        ]);
                    } else {
                        // Insert without addon_id for custom add-ons (with quantity support)
                        $addon_sql = "INSERT INTO booking_addons (booking_id, addon_name, addon_price, quantity) VALUES (:booking_id, :addon_name, :addon_price, :quantity)";
                        $addon_stmt = $conn->prepare($addon_sql);
                        $addon_stmt->execute([
                            'booking_id' => $booking_id,
                            'addon_name' => $addon_name,
                            'addon_price' => $addon_price,
                            'quantity' => $quantity
                        ]);
                    }
                    
                    $addon_count++;
                }
            }
            error_log("✅ Inserted $addon_count add-ons into database");
        }
        
        // ============================================
        // ADD MULTI-DAY BOOKING DATES
        // ============================================
        if (!empty($service_dates) && is_array($service_dates)) {
            $pdo = $conn->getPDO();
            $date_sql = "INSERT INTO booking_dates (booking_id, date, start_time, end_time, event_type, location) 
                        VALUES (:booking_id, :date, :start_time, :end_time, :event_type, :location)";
            $date_stmt = $pdo->prepare($date_sql);
            
            $date_count = 0;
            foreach ($service_dates as $date_info) {
                $date_stmt->execute([
                    'booking_id' => $booking_id,
                    'date' => $date_info['date'] ?? $service_date, // Fallback to single service_date
                    'start_time' => $date_info['start_time'] ?? null,
                    'end_time' => $date_info['end_time'] ?? null,
                    'event_type' => $date_info['event_type'] ?? 'main_service',
                    'location' => $date_info['location'] ?? $service_address
                ]);
                $date_count++;
            }
            error_log("✅ Inserted $date_count booking date(s)");
            
            // ============================================
            // ADD RESOURCE AVAILABILITY RECORDS
            // ============================================
            if (!empty($resources) && is_array($resources)) {
                // Get date range from service_dates
                $dates = array_column($service_dates, 'date');
                $min_date = min($dates);
                $max_date = max($dates);
                
                $resource_sql = "INSERT INTO resource_availability 
                                (provider_id, resource_type, resource_name, date, start_time, end_time, booking_id, is_available) 
                                VALUES (:provider_id, :resource_type, :resource_name, :date, :start_time, :end_time, :booking_id, FALSE)";
                $resource_stmt = $pdo->prepare($resource_sql);
                
                // Create a record for each date in the range for each resource
                $resource_count = 0;
                foreach ($resources as $resource) {
                    $current_date = new DateTime($min_date);
                    $end_date_obj = new DateTime($max_date);
                    
                    while ($current_date <= $end_date_obj) {
                        $date_str = $current_date->format('Y-m-d');
                        $first_date_info = $service_dates[0] ?? [];
                        
                        $resource_stmt->execute([
                            'provider_id' => $provider_id,
                            'resource_type' => $resource['resource_type'],
                            'resource_name' => $resource['resource_name'],
                            'date' => $date_str,
                            'start_time' => $first_date_info['start_time'] ?? null,
                            'end_time' => $first_date_info['end_time'] ?? null,
                            'booking_id' => $booking_id,
                        ]);
                        $resource_count++;
                        $current_date->modify('+1 day');
                    }
                }
                error_log("✅ Inserted $resource_count resource availability record(s)");
            }
        } else {
            // Fallback: Create single booking_date from service_date (backward compatibility)
            try {
                $pdo = $conn->getPDO();
                $date_sql = "INSERT INTO booking_dates (booking_id, date, start_time, event_type) 
                            VALUES (:booking_id, :date, NULL, 'main_service')";
                $date_stmt = $pdo->prepare($date_sql);
                $date_stmt->execute([
                    'booking_id' => $booking_id,
                    'date' => $service_date
                ]);
                error_log("✅ Created single booking_date (backward compatibility)");
            } catch (PDOException $e) {
                // Table might not exist yet, just log
                error_log("Note: booking_dates table not found, skipping: " . $e->getMessage());
            }
        }
        
        // Generate booking reference
        $booking_ref = "BK" . str_pad($booking_id, 6, "0", STR_PAD_LEFT);
        $update_ref_sql = "UPDATE bookings SET booking_reference = :booking_ref WHERE booking_id = :booking_id";
        $update_ref_stmt = $conn->prepare($update_ref_sql);
        $update_ref_stmt->execute(['booking_ref' => $booking_ref, 'booking_id' => $booking_id]);
        
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
