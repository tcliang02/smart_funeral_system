<?php
// Debug script for provider 16
header("Content-Type: text/plain");
include "backend/db_connect.php";

echo "TESTING JOIN CONDITIONS FOR USER_ID 16\n";
echo "=====================================\n\n";

// Test JOIN with u.id
echo "TEST 1: Using sp.user_id = u.id\n";
$sql1 = "SELECT 
    sp.provider_id, 
    sp.user_id as sp_user_id,
    sp.company_name,
    u.id as u_id,
    u.user_id as u_user_id,
    u.name as u_name,
    u.username as u_username
FROM service_provider sp
LEFT JOIN users u ON sp.user_id = u.id
WHERE sp.user_id = 16";

$result1 = $conn->query($sql1);
if ($result1->num_rows > 0) {
    echo "FOUND WITH u.id JOIN (" . $result1->num_rows . " rows)\n";
    print_r($result1->fetch_assoc());
} else {
    echo "NOT FOUND WITH u.id JOIN\n";
}

echo "\n\n";

// Test JOIN with u.user_id
echo "TEST 2: Using sp.user_id = u.user_id\n";
$sql2 = "SELECT 
    sp.provider_id, 
    sp.user_id as sp_user_id,
    sp.company_name,
    u.id as u_id,
    u.user_id as u_user_id,
    u.name as u_name,
    u.username as u_username
FROM service_provider sp
LEFT JOIN users u ON sp.user_id = u.user_id
WHERE sp.user_id = 16";

$result2 = $conn->query($sql2);
if ($result2->num_rows > 0) {
    echo "FOUND WITH u.user_id JOIN (" . $result2->num_rows . " rows)\n";
    print_r($result2->fetch_assoc());
} else {
    echo "NOT FOUND WITH u.user_id JOIN\n";
}

echo "\n\n";

// Direct check of both tables
echo "TEST 3: Direct check of tables\n";
echo "User record for user_id=16:\n";
$sql3a = "SELECT user_id, id, name, username, role FROM users WHERE user_id = 16";
$result3a = $conn->query($sql3a);
if ($result3a->num_rows > 0) {
    print_r($result3a->fetch_assoc());
} else {
    echo "NO USER RECORD FOUND\n";
}

echo "\nService Provider record for user_id=16:\n";
$sql3b = "SELECT provider_id, user_id, company_name FROM service_provider WHERE user_id = 16";
$result3b = $conn->query($sql3b);
if ($result3b->num_rows > 0) {
    print_r($result3b->fetch_assoc());
} else {
    echo "NO SERVICE PROVIDER RECORD FOUND\n";
}

echo "\n\n";

// Test full backend query
echo "TEST 4: Full backend query\n";
$sql4 = "SELECT 
    sp.provider_id,
    sp.company_name,
    sp.address,
    sp.phone,
    sp.description,
    sp.website,
    sp.logo_url,
    sp.average_price,
    sp.total_packages,
    sp.created_at,
    u.email,
    u.username,
    COALESCE(AVG(pr.rating), 0) as avg_rating,
    COUNT(DISTINCT pr.id) as review_count
FROM service_provider sp
LEFT JOIN users u ON sp.user_id = u.id
LEFT JOIN packages p ON sp.provider_id = p.provider_id
LEFT JOIN bookings b ON p.package_id = b.package_id
LEFT JOIN provider_reviews pr ON b.booking_id = pr.booking_id AND pr.review_type = 'customer_to_provider'
WHERE sp.user_id = 16
GROUP BY sp.provider_id";

$result4 = $conn->query($sql4);
if ($result4->num_rows > 0) {
    echo "FULL QUERY SUCCESSFUL (" . $result4->num_rows . " rows)\n";
    print_r($result4->fetch_assoc());
} else {
    echo "FULL QUERY RETURNS NO RESULTS\n";
}

echo "\n\n";
echo "DONE WITH TESTS";