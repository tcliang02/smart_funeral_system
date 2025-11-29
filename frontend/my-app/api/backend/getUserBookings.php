<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type"), ngrok-skip-browser-warning;
header("Content-Type: application/json");

include "db_connect.php";

// Get user_id from query parameter
$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : null;

if (!$user_id) {
    echo json_encode([
        "success" => false, 
        "message" => "User ID is required"
    ]);
    exit;
}

try {
    // Fetch user's bookings with package and provider details
    $sql = "SELECT 
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
                p.provider_id,
                sp.company_name as provider_name,
                sp.phone as provider_phone,
                sp.address as provider_address,
                pr.rating as submitted_rating,
                pr.review_text as submitted_review,
                pr.review_category as submitted_category
            FROM bookings b
            LEFT JOIN packages p ON b.package_id = p.package_id
            LEFT JOIN service_provider sp ON p.provider_id = sp.provider_id
            LEFT JOIN provider_reviews pr ON b.booking_id = pr.booking_id AND pr.review_type = 'customer_to_provider'
            WHERE b.user_id = ?
            ORDER BY b.created_at DESC";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $bookings = [];
    while ($row = $result->fetch_assoc()) {
        // Fetch add-ons for this booking
        $addon_sql = "SELECT addon_name, addon_price FROM booking_addons WHERE booking_id = ?";
        $addon_stmt = $conn->prepare($addon_sql);
        $addon_stmt->bind_param("i", $row['booking_id']);
        $addon_stmt->execute();
        $addon_result = $addon_stmt->get_result();
        
        $addons = [];
        while ($addon = $addon_result->fetch_assoc()) {
            $addons[] = [
                'name' => $addon['addon_name'],
                'price' => floatval($addon['addon_price']),
                'category' => 'Other Services' // Default category since column doesn't exist
            ];
        }
        
        $row['addons'] = $addons;
        $bookings[] = $row;
    }
    
    echo json_encode([
        "success" => true,
        "bookings" => $bookings,
        "count" => count($bookings)
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error fetching bookings: " . $e->getMessage()
    ]);
}

$conn->close();
?>

