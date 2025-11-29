<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type"), ngrok-skip-browser-warning;
header("Content-Type: application/json");

include "db_connect.php";

// Get provider_id from query parameter
$provider_id = isset($_GET['provider_id']) ? intval($_GET['provider_id']) : 0;

if ($provider_id === 0) {
    echo json_encode(["success" => false, "message" => "Provider ID is required"]);
    exit;
}

try {
    // Get all bookings for this provider's packages with full details
    $bookings_sql = "SELECT 
        b.booking_id,
        b.booking_reference,
        b.user_id,
        b.customer_name,
        b.customer_email,
        b.customer_phone,
        b.service_date,
        b.service_address,
        b.special_requirements,
        b.total_amount,
        b.payment_method,
        b.uploaded_files,
        b.status,
        b.provider_notes,
        b.cancellation_reason,
        b.cancelled_by,
        b.cancelled_at,
        b.confirmed_at,
        b.refund_amount,
        b.created_at,
        b.updated_at,
        p.package_id,
        p.name as package_name,
        p.description as package_description,
        p.price as package_price,
        sp.company_name as provider_name,
        sp.phone as provider_phone
    FROM bookings b
    INNER JOIN packages p ON b.package_id = p.package_id
    INNER JOIN service_provider sp ON p.provider_id = sp.provider_id
    WHERE sp.provider_id = ?
    ORDER BY b.created_at DESC";
    
    $stmt = $conn->prepare($bookings_sql);
    $stmt->bind_param("i", $provider_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $bookings = [];
    
    while ($row = $result->fetch_assoc()) {
        $booking_id = $row['booking_id'];
        
        // Get add-ons for this booking
        $addons_sql = "SELECT addon_name as name, addon_price as price 
                       FROM booking_addons 
                       WHERE booking_id = ?";
        $addons_stmt = $conn->prepare($addons_sql);
        $addons_stmt->bind_param("i", $booking_id);
        $addons_stmt->execute();
        $addons_result = $addons_stmt->get_result();
        
        $addons = [];
        while ($addon = $addons_result->fetch_assoc()) {
            $addon['category'] = 'Other Services'; // Default category since column doesn't exist
            $addons[] = $addon;
        }
        
        $row['addons'] = $addons;
        $bookings[] = $row;
    }
    
    echo json_encode([
        "success" => true,
        "bookings" => $bookings,
        "total_bookings" => count($bookings)
    ]);
    
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}

$conn->close();
?>

