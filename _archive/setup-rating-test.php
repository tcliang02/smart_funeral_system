<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once './backend/db_connect.php';

try {
    $conn->begin_transaction();
    
    // 1. Create a customer user if none exists
    $check_customer = "SELECT id FROM users WHERE role = 'customer' LIMIT 1";
    $customer_result = mysqli_query($conn, $check_customer);
    
    if (mysqli_num_rows($customer_result) == 0) {
        $create_customer = "INSERT INTO users (username, email, password, role) VALUES ('testcustomer', 'customer@test.com', 'password123', 'customer')";
        mysqli_query($conn, $create_customer);
        $customer_id = mysqli_insert_id($conn);
        $created_customer = true;
    } else {
        $customer = mysqli_fetch_assoc($customer_result);
        $customer_id = $customer['id'];
        $created_customer = false;
    }
    
    // 2. Create or update a booking to be completed and linked to customer
    $check_booking = "SELECT booking_id FROM bookings LIMIT 1";
    $booking_result = mysqli_query($conn, $check_booking);
    
    if (mysqli_num_rows($booking_result) == 0) {
        // Create a test booking
        $create_booking = "INSERT INTO bookings 
            (booking_reference, user_id, package_id, customer_name, customer_email, customer_phone, 
             service_date, total_amount, status, completed_at) 
            VALUES 
            ('TEST001', ?, 1, 'Test Customer', 'customer@test.com', '123-456-7890', 
             '2024-12-01', 1500.00, 'completed', NOW())";
        $stmt = $conn->prepare($create_booking);
        $stmt->bind_param("i", $customer_id);
        $stmt->execute();
        $booking_id = mysqli_insert_id($conn);
        $created_booking = true;
    } else {
        // Update existing booking
        $booking = mysqli_fetch_assoc($booking_result);
        $booking_id = $booking['booking_id'];
        
        $update_booking = "UPDATE bookings SET 
            user_id = ?, 
            status = 'completed', 
            completed_at = NOW(),
            customer_rating_submitted = 0,
            provider_rating_submitted = 0
            WHERE booking_id = ?";
        $stmt = $conn->prepare($update_booking);
        $stmt->bind_param("ii", $customer_id, $booking_id);
        $stmt->execute();
        $created_booking = false;
    }
    
    $conn->commit();
    
    // Get customer info for login
    $get_customer = "SELECT id, username, email, role FROM users WHERE id = ?";
    $stmt = $conn->prepare($get_customer);
    $stmt->bind_param("i", $customer_id);
    $stmt->execute();
    $customer_info = $stmt->get_result()->fetch_assoc();
    
    echo json_encode([
        'success' => true,
        'message' => '✅ Test setup completed successfully!',
        'actions' => [
            $created_customer ? "✅ Created customer account: testcustomer" : "✅ Using existing customer account",
            $created_booking ? "✅ Created test booking" : "✅ Updated existing booking to completed status",
            "✅ Linked booking to customer account",
            "✅ Set booking status to 'completed'",
            "✅ Ready for rating!"
        ],
        'next_steps' => [
            "1. Logout from admin account",
            "2. Login with these credentials:",
            "   - Username: {$customer_info['username']}",
            "   - Email: {$customer_info['email']}",
            "   - Password: password123",
            "3. Go to Orders page",
            "4. Find booking ID {$booking_id}",
            "5. Click 'Rate Service' button",
            "6. Submit rating!"
        ],
        'login_info' => [
            'user_id' => $customer_info['id'],
            'username' => $customer_info['username'],
            'email' => $customer_info['email'],
            'booking_id' => $booking_id
        ]
    ]);
    
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

mysqli_close($conn);
?>