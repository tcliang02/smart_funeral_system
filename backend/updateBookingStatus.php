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
include "availability_helpers.php";

$data = json_decode(file_get_contents("php://input"), true);

// Add logging
error_log("=== UPDATE BOOKING STATUS ===");
error_log("Received data: " . json_encode($data));

// Validate required fields
if (empty($data['booking_id']) || empty($data['provider_id']) || empty($data['new_status'])) {
    echo json_encode(["success" => false, "message" => "Missing required fields: booking_id, provider_id, new_status"]);
    exit;
}

$booking_id = intval($data['booking_id']);
$provider_id = intval($data['provider_id']);
$new_status = $data['new_status'];
$provider_notes = $data['provider_notes'] ?? '';
$cancellation_reason = $data['cancellation_reason'] ?? '';

// Validate status
$valid_statuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
if (!in_array($new_status, $valid_statuses)) {
    echo json_encode(["success" => false, "message" => "Invalid status: $new_status"]);
    exit;
}

try {
    // Get PDO connection for helper functions
    $pdo = $conn->getPDO();
    
    // Verify booking exists and belongs to this provider's package
    $verify_sql = "SELECT b.booking_id, b.status, b.total_amount, p.provider_id 
                   FROM bookings b
                   INNER JOIN packages p ON b.package_id = p.package_id
                   WHERE b.booking_id = :booking_id";
    $verify_stmt = $pdo->prepare($verify_sql);
    $verify_stmt->execute(['booking_id' => $booking_id]);
    $booking = $verify_stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$booking) {
        echo json_encode(["success" => false, "message" => "Booking not found"]);
        exit;
    }
    
    // Verify ownership
    if ($booking['provider_id'] != $provider_id) {
        echo json_encode(["success" => false, "message" => "You don't have permission to update this booking"]);
        exit;
    }
    
    $conn->begin_transaction();
    
    // Prepare update query based on new status
    if ($new_status === 'confirmed') {
        $note = $provider_notes ?: 'Booking confirmed by provider';
        $update_sql = "UPDATE bookings 
                       SET status = 'confirmed', 
                           confirmed_at = NOW(),
                           provider_notes = CONCAT(COALESCE(provider_notes, ''), '\n', :note)
                       WHERE booking_id = :booking_id";
        $update_stmt = $pdo->prepare($update_sql);
        $update_stmt->execute(['note' => $note, 'booking_id' => $booking_id]);
        
        // ============================================
        // CONFIRM INVENTORY: Decrement stock when booking is confirmed
        // ============================================
        $inventory_result = confirmInventory($pdo, $booking_id);
        if (!$inventory_result['success']) {
            throw new Exception("Failed to confirm inventory: " . $inventory_result['message']);
        }
        error_log("✅ Inventory confirmed: " . $inventory_result['message']);
        
    } else if ($new_status === 'cancelled') {
        // Provider cancelling - calculate refund (100% for provider cancellation)
        $refund_amount = $booking['total_amount'];
        $reason = $cancellation_reason ?: 'Cancelled by service provider';
        
        $update_sql = "UPDATE bookings 
                       SET status = 'cancelled', 
                           cancellation_reason = :reason,
                           cancelled_by = 'provider',
                           cancelled_at = NOW(),
                           refund_amount = :refund_amount,
                           provider_notes = CONCAT(COALESCE(provider_notes, ''), '\n', :provider_notes)
                       WHERE booking_id = :booking_id";
        $update_stmt = $pdo->prepare($update_sql);
        $update_stmt->execute([
            'reason' => $reason,
            'refund_amount' => $refund_amount,
            'provider_notes' => $provider_notes,
            'booking_id' => $booking_id
        ]);
        
    } else {
        // For other statuses (in_progress, completed)
        $update_sql = "UPDATE bookings 
                       SET status = :status,
                           provider_notes = CONCAT(COALESCE(provider_notes, ''), '\n', :provider_notes)
                       WHERE booking_id = :booking_id";
        $update_stmt = $pdo->prepare($update_sql);
        $update_stmt->execute([
            'status' => $new_status,
            'provider_notes' => $provider_notes,
            'booking_id' => $booking_id
        ]);
    }
    
    $conn->commit();
    
    $response = [
        "success" => true,
        "message" => "Booking status updated to: $new_status",
        "booking_id" => $booking_id,
        "new_status" => $new_status
    ];
    
    if ($new_status === 'confirmed') {
        $response['inventory_confirmed'] = true;
        $response['inventory_message'] = $inventory_result['message'] ?? 'Inventory confirmed';
    }
    
    if ($new_status === 'cancelled' && isset($refund_amount)) {
        $response['refund_amount'] = $refund_amount;
        $response['refund_percentage'] = 100;
        $response['note'] = "100% refund will be issued as this was cancelled by the provider";
    }
    
    echo json_encode($response);
    
} catch (Exception $e) {
    $conn->rollback();
    error_log("❌ UPDATE BOOKING STATUS ERROR: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}

$conn->close();
?>

