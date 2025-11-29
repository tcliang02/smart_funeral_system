<?php
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

$data = json_decode(file_get_contents("php://input"), true);

// Validate required fields
if (empty($data['booking_id']) || empty($data['user_id'])) {
    echo json_encode(["success" => false, "message" => "Missing required fields: booking_id and user_id"]);
    exit;
}

$booking_id = intval($data['booking_id']);
$user_id = intval($data['user_id']);
$cancellation_reason = $data['cancellation_reason'] ?? 'Customer requested cancellation';

try {
    $conn->begin_transaction();
    
    // Verify booking exists and belongs to this user
    $verify_sql = "SELECT booking_id, total_amount, status, user_id FROM bookings WHERE booking_id = ?";
    $verify_stmt = $conn->prepare($verify_sql);
    $verify_stmt->bind_param("i", $booking_id);
    $verify_stmt->execute();
    $result = $verify_stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode(["success" => false, "message" => "Booking not found"]);
        exit;
    }
    
    $booking = $result->fetch_assoc();
    
    // Verify ownership
    if ($booking['user_id'] != $user_id) {
        echo json_encode(["success" => false, "message" => "You don't have permission to cancel this booking"]);
        exit;
    }
    
    // Check if already cancelled
    if ($booking['status'] === 'cancelled') {
        echo json_encode(["success" => false, "message" => "Booking is already cancelled"]);
        exit;
    }
    
    // Check if already completed
    if ($booking['status'] === 'completed') {
        echo json_encode(["success" => false, "message" => "Cannot cancel completed booking. Please contact the service provider."]);
        exit;
    }
    
    // Calculate refund amount (95% of total)
    $refund_amount = $booking['total_amount'] * 0.95;
    
    // Update booking status to cancelled
    $cancel_sql = "UPDATE bookings 
                   SET status = 'cancelled', 
                       cancellation_reason = ?, 
                       cancelled_by = 'customer',
                       cancelled_at = NOW(),
                       refund_amount = ?
                   WHERE booking_id = ?";
    $cancel_stmt = $conn->prepare($cancel_sql);
    $cancel_stmt->bind_param("sdi", $cancellation_reason, $refund_amount, $booking_id);
    
    if ($cancel_stmt->execute()) {
        $conn->commit();
        
        echo json_encode([
            "success" => true,
            "message" => "Booking cancelled successfully",
            "booking_id" => $booking_id,
            "refund_amount" => $refund_amount,
            "refund_percentage" => 95,
            "note" => "95% of the total amount will be refunded. The service provider has been notified."
        ]);
    } else {
        throw new Exception("Failed to cancel booking");
    }
    
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}

$conn->close();
?>

