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
if (empty($data['booking_id']) || empty($data['rating']) || empty($data['reviewer_user_id'])) {
    echo json_encode(["success" => false, "message" => "Missing required fields: booking_id, rating, reviewer_user_id"]);
    exit;
}

$booking_id = intval($data['booking_id']);
$rating = intval($data['rating']);
$reviewer_user_id = intval($data['reviewer_user_id']);
$review_text = trim($data['review_text'] ?? '');
$review_type = $data['review_type'] ?? 'customer_to_provider'; // or 'provider_to_customer'

// Validate rating range
if ($rating < 1 || $rating > 5) {
    echo json_encode(["success" => false, "message" => "Rating must be between 1 and 5 stars"]);
    exit;
}

try {
    // Start transaction
    $conn->begin_transaction();
    
    // First, verify the booking exists and is completed
    $booking_check_sql = "SELECT booking_id, status, user_id, package_id 
                          FROM bookings 
                          WHERE booking_id = ? AND status = 'completed'";
    $booking_stmt = $conn->prepare($booking_check_sql);
    $booking_stmt->bind_param("i", $booking_id);
    $booking_stmt->execute();
    $booking_result = $booking_stmt->get_result();
    
    if ($booking_result->num_rows === 0) {
        throw new Exception("Booking not found or not completed yet. Ratings can only be submitted for completed services.");
    }
    
    $booking = $booking_result->fetch_assoc();
    
    // Get provider information for this booking
    $provider_sql = "SELECT sp.provider_id, sp.user_id as provider_user_id 
                     FROM packages p 
                     JOIN service_provider sp ON p.provider_id = sp.provider_id 
                     WHERE p.package_id = ?";
    $provider_stmt = $conn->prepare($provider_sql);
    $provider_stmt->bind_param("i", $booking['package_id']);
    $provider_stmt->execute();
    $provider_result = $provider_stmt->get_result();
    
    if ($provider_result->num_rows === 0) {
        throw new Exception("Provider information not found for this booking");
    }
    
    $provider = $provider_result->fetch_assoc();
    
    // Get reviewer information
    $reviewer_sql = "SELECT username, email, role FROM users WHERE id = ?";
    $reviewer_stmt = $conn->prepare($reviewer_sql);
    $reviewer_stmt->bind_param("i", $reviewer_user_id);
    $reviewer_stmt->execute();
    $reviewer_result = $reviewer_stmt->get_result();
    
    if ($reviewer_result->num_rows === 0) {
        throw new Exception("Reviewer not found");
    }
    
    $reviewer = $reviewer_result->fetch_assoc();
    
    // Determine review type and validate permissions
    if ($review_type === 'customer_to_provider') {
        // Customer rating provider ('family' role is used for customers)
        if ($reviewer['role'] !== 'family' || $booking['user_id'] != $reviewer_user_id) {
            throw new Exception("Only the customer who made this booking can rate the provider");
        }
        
        // Check if rating already exists
        $existing_check = "SELECT review_id FROM provider_reviews WHERE booking_id = ? AND reviewer_user_id = ? AND review_type = 'customer_to_provider'";
        $existing_stmt = $conn->prepare($existing_check);
        $existing_stmt->bind_param("ii", $booking_id, $reviewer_user_id);
        $existing_stmt->execute();
        
        if ($existing_stmt->get_result()->num_rows > 0) {
            throw new Exception("You have already rated this service provider");
        }
        
        // Insert provider review (using new table structure with provider_id)
        $review_sql = "INSERT INTO provider_reviews 
                       (booking_id, provider_id, reviewer_user_id, rating, review_text, review_category, review_type) 
                       VALUES (?, ?, ?, ?, ?, ?, ?)";
        $review_stmt = $conn->prepare($review_sql);
        $review_category = $data['review_category'] ?? 'quality';
        $review_stmt->bind_param("iiiisss", 
            $booking_id,
            $provider['provider_id'],
            $reviewer_user_id, 
            $rating, 
            $review_text, 
            $review_category,
            $review_type
        );
        
        if (!$review_stmt->execute()) {
            throw new Exception("Failed to submit provider rating");
        }
        
        $message = "Thank you! Your rating for the service provider has been submitted successfully.";
        
    } else if ($review_type === 'provider_to_customer') {
        // Provider rating customer
        if ($reviewer['role'] !== 'provider' || $provider['provider_user_id'] != $reviewer_user_id) {
            throw new Exception("Only the service provider for this booking can rate the customer");
        }
        
        // Check if rating already exists
        $existing_check = "SELECT review_id FROM customer_reviews WHERE booking_id = ? AND provider_id = ?";
        $existing_stmt = $conn->prepare($existing_check);
        $existing_stmt->bind_param("ii", $booking_id, $provider['provider_id']);
        $existing_stmt->execute();
        
        if ($existing_stmt->get_result()->num_rows > 0) {
            throw new Exception("You have already rated this customer");
        }
        
        // Insert customer review
        $review_category = $data['review_category'] ?? 'overall';
        $customer_review_sql = "INSERT INTO customer_reviews 
                                (booking_id, customer_user_id, provider_id, rating, review_text, review_category) 
                                VALUES (?, ?, ?, ?, ?, ?)";
        $customer_review_stmt = $conn->prepare($customer_review_sql);
        $customer_review_stmt->bind_param("iiisiss", 
            $booking_id, 
            $booking['user_id'], 
            $provider['provider_id'], 
            $rating, 
            $review_text, 
            $review_category
        );
        
        if (!$customer_review_stmt->execute()) {
            throw new Exception("Failed to submit customer rating");
        }
        
        $message = "Thank you! Your rating for the customer has been submitted successfully.";
        
    } else {
        throw new Exception("Invalid review type");
    }
    
    // Commit transaction
    $conn->commit();
    
    echo json_encode([
        "success" => true,
        "message" => $message,
        "rating" => $rating,
        "review_type" => $review_type,
        "booking_id" => $booking_id
    ]);
    
} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}

$conn->close();
?>
