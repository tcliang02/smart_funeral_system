<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type"), ngrok-skip-browser-warning;
header("Content-Type: application/json");

include "db_connect.php";

// Get user_id and role from query parameters
$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
$user_role = $_GET['role'] ?? '';

if (!$user_id || !$user_role) {
    echo json_encode(["success" => false, "message" => "Missing user_id or role parameter"]);
    exit;
}

try {
    if ($user_role === 'customer') {
        // Get completed bookings where customer can rate the provider
        $sql = "SELECT DISTINCT
                    b.booking_id,
                    b.booking_reference,
                    b.service_date,
                    b.completed_at,
                    b.rating_deadline,
                    b.customer_rating_submitted,
                    p.package_name,
                    sp.company_name as provider_name,
                    sp.provider_id,
                    CASE 
                        WHEN b.customer_rating_submitted = 1 THEN 'completed'
                        WHEN CURRENT_TIMESTAMP > b.rating_deadline THEN 'expired'
                        ELSE 'pending'
                    END as rating_status,
                    pr.rating as submitted_rating,
                    pr.review_text as submitted_review
                FROM bookings b
                JOIN packages p ON b.package_id = p.package_id
                JOIN service_provider sp ON p.provider_id = sp.provider_id
                LEFT JOIN provider_reviews pr ON b.booking_id = pr.booking_id AND pr.reviewer_user_id = ?
                WHERE b.user_id = ? 
                AND b.status = 'completed'
                ORDER BY b.completed_at DESC";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ii", $user_id, $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $ratings = [];
        while ($row = $result->fetch_assoc()) {
            $ratings[] = [
                'booking_id' => $row['booking_id'],
                'booking_reference' => $row['booking_reference'],
                'service_date' => $row['service_date'],
                'completed_at' => $row['completed_at'],
                'rating_deadline' => $row['rating_deadline'],
                'package_name' => $row['package_name'],
                'provider_name' => $row['provider_name'],
                'provider_id' => $row['provider_id'],
                'rating_status' => $row['rating_status'],
                'submitted_rating' => $row['submitted_rating'],
                'submitted_review' => $row['submitted_review'],
                'can_rate' => $row['rating_status'] === 'pending',
                'days_until_deadline' => $row['rating_deadline'] ? 
                    max(0, ceil((strtotime($row['rating_deadline']) - time()) / (60 * 60 * 24))) : 0
            ];
        }
        
        echo json_encode([
            "success" => true,
            "ratings" => $ratings,
            "total_count" => count($ratings),
            "pending_ratings" => count(array_filter($ratings, function($r) { return $r['rating_status'] === 'pending'; }))
        ]);
        
    } else if ($user_role === 'provider') {
        // Get provider's completed bookings where they can rate customers
        $provider_sql = "SELECT provider_id FROM service_provider WHERE user_id = ?";
        $provider_stmt = $conn->prepare($provider_sql);
        $provider_stmt->bind_param("i", $user_id);
        $provider_stmt->execute();
        $provider_result = $provider_stmt->get_result();
        
        if ($provider_result->num_rows === 0) {
            echo json_encode(["success" => false, "message" => "Provider not found"]);
            exit;
        }
        
        $provider = $provider_result->fetch_assoc();
        $provider_id = $provider['provider_id'];
        
        $sql = "SELECT DISTINCT
                    b.booking_id,
                    b.booking_reference,
                    b.service_date,
                    b.completed_at,
                    b.rating_deadline,
                    b.provider_rating_submitted,
                    b.customer_name,
                    b.customer_email,
                    u.username as customer_username,
                    u.id as customer_user_id,
                    p.package_name,
                    CASE 
                        WHEN b.provider_rating_submitted = 1 THEN 'completed'
                        WHEN CURRENT_TIMESTAMP > b.rating_deadline THEN 'expired'
                        ELSE 'pending'
                    END as rating_status,
                    cr.rating as submitted_rating,
                    cr.review_text as submitted_review,
                    cr.review_category as submitted_category
                FROM bookings b
                JOIN packages p ON b.package_id = p.package_id
                JOIN users u ON b.user_id = u.id
                LEFT JOIN customer_reviews cr ON b.booking_id = cr.booking_id AND cr.provider_id = ?
                WHERE p.provider_id = ? 
                AND b.status = 'completed'
                ORDER BY b.completed_at DESC";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ii", $provider_id, $provider_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $ratings = [];
        while ($row = $result->fetch_assoc()) {
            $ratings[] = [
                'booking_id' => $row['booking_id'],
                'booking_reference' => $row['booking_reference'],
                'service_date' => $row['service_date'],
                'completed_at' => $row['completed_at'],
                'rating_deadline' => $row['rating_deadline'],
                'package_name' => $row['package_name'],
                'customer_name' => $row['customer_name'],
                'customer_email' => $row['customer_email'],
                'customer_username' => $row['customer_username'],
                'customer_user_id' => $row['customer_user_id'],
                'rating_status' => $row['rating_status'],
                'submitted_rating' => $row['submitted_rating'],
                'submitted_review' => $row['submitted_review'],
                'submitted_category' => $row['submitted_category'],
                'can_rate' => $row['rating_status'] === 'pending',
                'days_until_deadline' => $row['rating_deadline'] ? 
                    max(0, ceil((strtotime($row['rating_deadline']) - time()) / (60 * 60 * 24))) : 0
            ];
        }
        
        echo json_encode([
            "success" => true,
            "ratings" => $ratings,
            "total_count" => count($ratings),
            "pending_ratings" => count(array_filter($ratings, function($r) { return $r['rating_status'] === 'pending'; })),
            "provider_id" => $provider_id
        ]);
        
    } else {
        echo json_encode(["success" => false, "message" => "Invalid user role"]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error fetching ratings: " . $e->getMessage()
    ]);
}

$conn->close();
?>
