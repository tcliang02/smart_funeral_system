<?php
require_once './backend/db_connect.php';

// Fix user 7 role
$update_role = "UPDATE users SET role = 'customer' WHERE id = 7";
$result1 = mysqli_query($conn, $update_role);

// Fix booking 22 
$update_booking = "UPDATE bookings SET 
    user_id = 7,
    status = 'completed',
    completed_at = NOW(),
    customer_rating_submitted = 0,
    provider_rating_submitted = 0
    WHERE booking_id = 22";
$result2 = mysqli_query($conn, $update_booking);

// Verify
$check = "SELECT u.id, u.username, u.role, b.booking_id, b.status, b.user_id, b.completed_at
          FROM users u
          LEFT JOIN bookings b ON b.user_id = u.id
          WHERE u.id = 7";
$verify = mysqli_query($conn, $check);
$data = mysqli_fetch_assoc($verify);

echo "✅ FIXED!\n\n";
echo "User ID: " . $data['id'] . "\n";
echo "Username: " . $data['username'] . "\n";
echo "Role: " . $data['role'] . "\n";
echo "Booking ID: " . $data['booking_id'] . "\n";
echo "Booking Status: " . $data['status'] . "\n";
echo "Completed At: " . $data['completed_at'] . "\n";
echo "\nUser 7 can now rate booking 22!\n";

mysqli_close($conn);
?>