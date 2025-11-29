<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Simulate the exact request that the frontend will send
$test_data = [
    'booking_id' => 22,
    'rating' => 5,
    'review_text' => 'Test rating from automated setup',
    'review_category' => 'quality',
    'reviewer_user_id' => 7,
    'review_type' => 'customer_to_provider'
];

$ch = curl_init('http://localhost/smart_funeral_system/backend/submitRating.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($test_data));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $http_code\n\n";
echo "Response:\n";
echo $response;
echo "\n";
?>