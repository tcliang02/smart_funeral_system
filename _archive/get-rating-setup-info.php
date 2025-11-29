<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once './backend/db_connect.php';

$results = [
    'users' => [],
    'bookings' => [],
    'solution' => []
];

try {
    // Get all users to see available accounts
    $users_query = "SELECT id, username, email, role FROM users ORDER BY id";
    $users_result = mysqli_query($conn, $users_query);
    
    while ($user = mysqli_fetch_assoc($users_result)) {
        $results['users'][] = $user;
    }
    
    // Get all bookings to see which ones exist
    $bookings_query = "SELECT booking_id, user_id, customer_name, customer_email, status, 
                      customer_rating_submitted, created_at 
                      FROM bookings 
                      ORDER BY booking_id LIMIT 10";
    $bookings_result = mysqli_query($conn, $bookings_query);
    
    while ($booking = mysqli_fetch_assoc($bookings_result)) {
        $results['bookings'][] = $booking;
    }
    
    // Find customer users
    $customer_users = array_filter($results['users'], function($user) {
        return $user['role'] === 'customer';
    });
    
    // Find completed bookings with linked customers
    $completed_bookings = array_filter($results['bookings'], function($booking) {
        return $booking['status'] === 'completed' && $booking['user_id'] !== null;
    });
    
    $results['solution'] = [
        'customer_accounts_available' => array_values($customer_users),
        'completed_bookings_available' => array_values($completed_bookings),
        'recommendations' => []
    ];
    
    if (empty($customer_users)) {
        $results['solution']['recommendations'][] = "❌ No customer accounts found. You need to create a customer account or change an existing user's role to 'customer'";
    } else {
        $results['solution']['recommendations'][] = "✅ Found " . count($customer_users) . " customer account(s). Login with one of these.";
    }
    
    if (empty($completed_bookings)) {
        $results['solution']['recommendations'][] = "❌ No completed bookings found. You need to complete a booking first or manually change a booking status to 'completed'";
        
        // Suggest quick fix - make a booking completed with proper user_id
        $sample_booking = $results['bookings'][0] ?? null;
        $sample_customer = $customer_users[0] ?? null;
        
        if ($sample_booking && $sample_customer) {
            $results['solution']['quick_fix'] = [
                'sql_command' => "UPDATE bookings SET status = 'completed', user_id = {$sample_customer['id']}, completed_at = NOW() WHERE booking_id = {$sample_booking['booking_id']}",
                'description' => "This will make booking {$sample_booking['booking_id']} completed and link it to customer '{$sample_customer['username']}'"
            ];
        }
    } else {
        $results['solution']['recommendations'][] = "✅ Found " . count($completed_bookings) . " completed booking(s) that can be rated.";
    }
    
} catch (Exception $e) {
    $results['error'] = $e->getMessage();
}

echo json_encode($results, JSON_PRETTY_PRINT);
mysqli_close($conn);
?>