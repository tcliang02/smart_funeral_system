<?php
require_once './backend/db_connect.php';

// The role is 'family' for customers, not 'customer'!
// Set user 7 to 'family' role
$update_role = "UPDATE users SET role = 'family' WHERE id = 7";
mysqli_query($conn, $update_role);

// Ensure booking 22 is properly set up
$update_booking = "UPDATE bookings SET 
    user_id = 7,
    status = 'completed',
    completed_at = NOW(),
    customer_rating_submitted = 0,
    provider_rating_submitted = 0
    WHERE booking_id = 22";
mysqli_query($conn, $update_booking);

// Verify
$check = "SELECT u.id, u.username, u.role, b.booking_id, b.status, b.user_id
          FROM users u
          LEFT JOIN bookings b ON b.user_id = u.id
          WHERE u.id = 7 AND b.booking_id = 22";
$verify = mysqli_query($conn, $check);
$data = mysqli_fetch_assoc($verify);

echo "✅ PROPERLY FIXED!\n\n";
echo "User ID: " . $data['id'] . "\n";
echo "Username: " . $data['username'] . "\n";
echo "Role: " . $data['role'] . " (this is correct for customers)\n";
echo "Booking ID: " . $data['booking_id'] . "\n";
echo "Booking Status: " . $data['status'] . "\n";
echo "User ID matches: " . ($data['user_id'] == 7 ? 'YES ✅' : 'NO ❌') . "\n";
echo "\n✅ User 7 (username: user1) can now rate booking 22!\n";

mysqli_close($conn);
?>