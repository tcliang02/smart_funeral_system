<?php
require_once './backend/db_connect.php';

// Reset the rating for booking 22 so user can test again
$reset = "DELETE FROM provider_reviews WHERE booking_id = 22";
mysqli_query($conn, $reset);

$update = "UPDATE bookings SET customer_rating_submitted = 0 WHERE booking_id = 22";
mysqli_query($conn, $update);

echo "✅ Reset complete! User 7 can now test rating booking 22\n\n";

echo "=== FINAL SETUP SUMMARY ===\n";
echo "User ID: 7\n";
echo "Username: user1\n";
echo "Email: tcliang2002@gmail.com\n";
echo "Role: family (correct for customers)\n";
echo "Booking ID: 22\n";
echo "Booking Status: completed\n";
echo "Can Rate: YES ✅\n\n";

echo "=== TESTING INSTRUCTIONS ===\n";
echo "1. Login as user1 (email: tcliang2002@gmail.com)\n";
echo "2. Go to 'My Orders' page\n";
echo "3. Find booking ID 22\n";
echo "4. Click the yellow 'Rate Service' button\n";
echo "5. Select stars and submit\n";
echo "6. Should see success message!\n";

mysqli_close($conn);
?>