<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once './backend/db_connect.php';

$results = [
    'steps' => [],
    'errors' => [],
    'success' => false
];

try {
    $conn->begin_transaction();
    
    // Step 1: Check user ID 7
    $user_query = "SELECT id, username, email, role FROM users WHERE id = 7";
    $user_result = mysqli_query($conn, $user_query);
    
    if (mysqli_num_rows($user_result) == 0) {
        throw new Exception("User ID 7 not found in database");
    }
    
    $user = mysqli_fetch_assoc($user_result);
    $results['steps'][] = "✅ Found user ID 7: {$user['username']} ({$user['email']}) - Role: {$user['role']}";
    
    // Step 2: Update user role to 'customer' if not already
    if ($user['role'] !== 'customer') {
        $update_role = "UPDATE users SET role = 'customer' WHERE id = 7";
        mysqli_query($conn, $update_role);
        $results['steps'][] = "✅ Updated user ID 7 role from '{$user['role']}' to 'customer'";
    } else {
        $results['steps'][] = "✅ User ID 7 already has 'customer' role";
    }
    
    // Step 3: Find or create a booking for user 7
    $booking_query = "SELECT booking_id, status, user_id FROM bookings WHERE user_id = 7 LIMIT 1";
    $booking_result = mysqli_query($conn, $booking_query);
    
    if (mysqli_num_rows($booking_result) == 0) {
        // Check if there are any bookings we can assign to this user
        $any_booking = "SELECT booking_id FROM bookings ORDER BY booking_id DESC LIMIT 1";
        $any_result = mysqli_query($conn, $any_booking);
        
        if (mysqli_num_rows($any_result) > 0) {
            $booking = mysqli_fetch_assoc($any_result);
            $booking_id = $booking['booking_id'];
            
            // Update this booking to belong to user 7
            $update_booking = "UPDATE bookings SET 
                user_id = 7,
                status = 'completed',
                completed_at = NOW(),
                customer_rating_submitted = 0,
                provider_rating_submitted = 0,
                rating_deadline = DATE_ADD(NOW(), INTERVAL 30 DAY)
                WHERE booking_id = ?";
            $stmt = $conn->prepare($update_booking);
            $stmt->bind_param("i", $booking_id);
            $stmt->execute();
            
            $results['steps'][] = "✅ Assigned booking ID {$booking_id} to user 7";
            $results['steps'][] = "✅ Set booking status to 'completed'";
        } else {
            throw new Exception("No bookings found in database to assign");
        }
    } else {
        $booking = mysqli_fetch_assoc($booking_result);
        $booking_id = $booking['booking_id'];
        
        // Update to completed status
        $update_status = "UPDATE bookings SET 
            status = 'completed',
            completed_at = NOW(),
            customer_rating_submitted = 0,
            provider_rating_submitted = 0,
            rating_deadline = DATE_ADD(NOW(), INTERVAL 30 DAY)
            WHERE booking_id = ?";
        $stmt = $conn->prepare($update_status);
        $stmt->bind_param("i", $booking_id);
        $stmt->execute();
        
        $results['steps'][] = "✅ Found existing booking ID {$booking_id} for user 7";
        $results['steps'][] = "✅ Updated booking to 'completed' status";
    }
    
    // Step 4: Delete any existing ratings for this booking (for testing)
    $delete_ratings = "DELETE FROM provider_reviews WHERE booking_id = ?";
    $stmt = $conn->prepare($delete_ratings);
    $stmt->bind_param("i", $booking_id);
    $stmt->execute();
    $deleted_count = $stmt->affected_rows;
    
    if ($deleted_count > 0) {
        $results['steps'][] = "✅ Deleted {$deleted_count} existing rating(s) to allow fresh test";
    }
    
    // Step 5: Verify the setup
    $verify_query = "SELECT b.booking_id, b.user_id, b.status, b.completed_at, 
                     b.customer_rating_submitted, u.username, u.role
                     FROM bookings b
                     JOIN users u ON b.user_id = u.id
                     WHERE b.booking_id = ?";
    $stmt = $conn->prepare($verify_query);
    $stmt->bind_param("i", $booking_id);
    $stmt->execute();
    $verify_result = $stmt->get_result();
    $verification = $verify_result->fetch_assoc();
    
    $results['verification'] = [
        'booking_id' => $verification['booking_id'],
        'user_id' => $verification['user_id'],
        'username' => $verification['username'],
        'role' => $verification['role'],
        'status' => $verification['status'],
        'completed_at' => $verification['completed_at'],
        'already_rated' => $verification['customer_rating_submitted'],
        'ready_to_rate' => (
            $verification['user_id'] == 7 &&
            $verification['role'] == 'customer' &&
            $verification['status'] == 'completed' &&
            $verification['customer_rating_submitted'] == 0
        )
    ];
    
    if ($results['verification']['ready_to_rate']) {
        $results['steps'][] = "✅ Verification passed: User 7 can rate booking {$booking_id}";
        $results['success'] = true;
    } else {
        throw new Exception("Verification failed - setup incomplete");
    }
    
    $conn->commit();
    
    $results['message'] = "🎉 SUCCESS! User ID 7 (username: '{$user['username']}') is now ready to rate booking {$booking_id}";
    $results['instructions'] = [
        "1. User is already set up as 'customer' role",
        "2. Booking {$booking_id} is marked as 'completed'",
        "3. Booking is linked to user ID 7",
        "4. Rating button should appear in Orders page",
        "5. User 7 can now submit a rating"
    ];
    
} catch (Exception $e) {
    $conn->rollback();
    $results['success'] = false;
    $results['errors'][] = $e->getMessage();
    $results['message'] = "❌ Setup failed: " . $e->getMessage();
}

mysqli_close($conn);
echo json_encode($results, JSON_PRETTY_PRINT);
?>