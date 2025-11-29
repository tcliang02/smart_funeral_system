<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, PUT");
header("Access-Control-Allow-Headers: Content-Type"), ngrok-skip-browser-warning;
header("Content-Type: application/json");

include "db_connect.php";

$data = json_decode(file_get_contents("php://input"), true);
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    // Update booking status
    $booking_id = $data['booking_id'] ?? null;
    $status = $data['status'] ?? null;
    $provider_notes = $data['provider_notes'] ?? '';
    
    if (!$booking_id || !$status) {
        echo json_encode(["success" => false, "message" => "Missing booking_id or status"]);
        exit;
    }
    
    $valid_statuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
    if (!in_array($status, $valid_statuses)) {
        echo json_encode(["success" => false, "message" => "Invalid status"]);
        exit;
    }
    
    try {
        $sql = "UPDATE bookings 
                SET status = ?, provider_notes = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE booking_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssi", $status, $provider_notes, $booking_id);
        
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Booking status updated successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to update booking status"]);
        }
        
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
    }
    
} elseif ($method === 'PUT') {
    // Get bookings for provider
    $provider_id = $data['provider_id'] ?? null;
    $status_filter = $data['status'] ?? '';
    $page = max(1, intval($data['page'] ?? 1));
    $limit = min(50, max(1, intval($data['limit'] ?? 10)));
    $offset = ($page - 1) * $limit;
    
    if (!$provider_id) {
        echo json_encode(["success" => false, "message" => "Missing provider_id"]);
        exit;
    }
    
    try {
        $sql = "SELECT 
                    b.booking_id,
                    b.booking_reference,
                    b.customer_name,
                    b.customer_email,
                    b.customer_phone,
                    b.service_date,
                    b.service_address,
                    b.special_requirements,
                    b.total_amount,
                    b.status,
                    b.provider_notes,
                    b.created_at,
                    b.updated_at,
                    p.name as package_name,
                    p.price as package_price
                FROM bookings b
                JOIN packages p ON b.package_id = p.package_id
                WHERE p.provider_id = ?";
        
        $params = [$provider_id];
        $types = "i";
        
        if (!empty($status_filter)) {
            $sql .= " AND b.status = ?";
            $params[] = $status_filter;
            $types .= "s";
        }
        
        $sql .= " ORDER BY b.created_at DESC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;
        $types .= "ii";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $bookings = [];
        while ($row = $result->fetch_assoc()) {
            // Get add-ons for this booking
            $addon_sql = "SELECT addon_name, addon_price FROM booking_addons WHERE booking_id = ?";
            $addon_stmt = $conn->prepare($addon_sql);
            $addon_stmt->bind_param("i", $row['booking_id']);
            $addon_stmt->execute();
            $addon_result = $addon_stmt->get_result();
            
            $addons = [];
            while ($addon_row = $addon_result->fetch_assoc()) {
                $addons[] = $addon_row;
            }
            
            $row['addons'] = $addons;
            $bookings[] = $row;
        }
        
        // Get total count
        $count_sql = "SELECT COUNT(*) as total 
                      FROM bookings b 
                      JOIN packages p ON b.package_id = p.package_id 
                      WHERE p.provider_id = ?";
        $count_params = [$provider_id];
        $count_types = "i";
        
        if (!empty($status_filter)) {
            $count_sql .= " AND b.status = ?";
            $count_params[] = $status_filter;
            $count_types .= "s";
        }
        
        $count_stmt = $conn->prepare($count_sql);
        $count_stmt->bind_param($count_types, ...$count_params);
        $count_stmt->execute();
        $count_result = $count_stmt->get_result();
        $total_count = $count_result->fetch_assoc()['total'];
        
        echo json_encode([
            "success" => true,
            "bookings" => $bookings,
            "pagination" => [
                "current_page" => $page,
                "total_pages" => ceil($total_count / $limit),
                "total_count" => $total_count,
                "per_page" => $limit
            ]
        ]);
        
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
    }
}

$conn->close();
?>
