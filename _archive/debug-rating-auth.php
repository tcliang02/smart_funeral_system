<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once './backend/db_connect.php';

// Get debugging info for user authentication issue
$user_input = $_GET['user_id'] ?? null;
$booking_input = $_GET['booking_id'] ?? null;

if (!$user_input || !$booking_input) {
    echo json_encode([
        'error' => 'Please provide user_id and booking_id as URL parameters',
        'example' => 'debug-rating-auth.php?user_id=1&booking_id=123'
    ]);
    exit;
}

$results = [
    'input' => [
        'user_id' => $user_input,
        'booking_id' => $booking_input
    ],
    'user_info' => null,
    'booking_info' => null,
    'auth_check' => null
];

try {
    // Get user info
    $user_query = "SELECT id, username, email, role FROM users WHERE id = ?";
    $user_stmt = $conn->prepare($user_query);
    $user_stmt->bind_param("i", $user_input);
    $user_stmt->execute();
    $user_result = $user_stmt->get_result();
    
    if ($user_result->num_rows > 0) {
        $results['user_info'] = $user_result->fetch_assoc();
    } else {
        $results['user_info'] = 'User not found';
    }
    
    // Get booking info
    $booking_query = "SELECT booking_id, user_id, customer_name, customer_email, status, 
                      customer_rating_submitted, provider_rating_submitted 
                      FROM bookings WHERE booking_id = ?";
    $booking_stmt = $conn->prepare($booking_query);
    $booking_stmt->bind_param("i", $booking_input);
    $booking_stmt->execute();
    $booking_result = $booking_stmt->get_result();
    
    if ($booking_result->num_rows > 0) {
        $results['booking_info'] = $booking_result->fetch_assoc();
    } else {
        $results['booking_info'] = 'Booking not found';
    }
    
    // Check authentication logic
    if (is_array($results['user_info']) && is_array($results['booking_info'])) {
        $user_role = $results['user_info']['role'];
        $user_id = $results['user_info']['id'];
        $booking_user_id = $results['booking_info']['user_id'];
        $booking_status = $results['booking_info']['status'];
        
        $results['auth_check'] = [
            'user_role' => $user_role,
            'user_id' => $user_id,
            'booking_user_id' => $booking_user_id,
            'booking_status' => $booking_status,
            'role_is_customer' => ($user_role === 'customer'),
            'user_ids_match' => ($user_id == $booking_user_id),
            'booking_completed' => ($booking_status === 'completed'),
            'can_rate' => (
                $user_role === 'customer' && 
                $user_id == $booking_user_id && 
                $booking_status === 'completed'
            ),
            'already_rated' => $results['booking_info']['customer_rating_submitted']
        ];
        
        if (!$results['auth_check']['can_rate']) {
            $reasons = [];
            if ($user_role !== 'customer') $reasons[] = "User role is '$user_role', not 'customer'";
            if ($user_id != $booking_user_id) $reasons[] = "User ID $user_id doesn't match booking user ID $booking_user_id";
            if ($booking_status !== 'completed') $reasons[] = "Booking status is '$booking_status', not 'completed'";
            
            $results['auth_check']['failure_reasons'] = $reasons;
        }
    }
    
} catch (Exception $e) {
    $results['error'] = $e->getMessage();
}

echo json_encode($results, JSON_PRETTY_PRINT);
mysqli_close($conn);
?>