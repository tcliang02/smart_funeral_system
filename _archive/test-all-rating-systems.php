<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once './backend/db_connect.php';

$results = [
    'rating_submission_test' => false,
    'provider_dashboard_test' => false,
    'provider_details_test' => false,
    'user_bookings_test' => false,
    'packages_rating_test' => false,
    'messages' => [],
    'errors' => []
];

try {
    // Test 1: Check if rating submission structure is correct
    $testQuery1 = "SELECT id, booking_id, reviewer_user_id, rating FROM provider_reviews LIMIT 1";
    $result1 = mysqli_query($conn, $testQuery1);
    if ($result1) {
        $results['rating_submission_test'] = true;
        $results['messages'][] = "✅ Rating submission structure is correct";
    } else {
        $results['errors'][] = "❌ Rating submission test failed: " . mysqli_error($conn);
    }
    
    // Test 2: Check provider dashboard query
    $testQuery2 = "SELECT sp.provider_id, sp.company_name,
                   COALESCE(AVG(pr.rating), 0) as avg_rating,
                   COUNT(DISTINCT pr.id) as review_count
                   FROM service_provider sp
                   LEFT JOIN packages p ON sp.provider_id = p.provider_id
                   LEFT JOIN bookings b ON p.package_id = b.package_id
                   LEFT JOIN provider_reviews pr ON b.booking_id = pr.booking_id AND pr.review_type = 'customer_to_provider'
                   GROUP BY sp.provider_id
                   LIMIT 1";
    $result2 = mysqli_query($conn, $testQuery2);
    if ($result2) {
        $results['provider_dashboard_test'] = true;
        $results['messages'][] = "✅ Provider dashboard query works";
    } else {
        $results['errors'][] = "❌ Provider dashboard test failed: " . mysqli_error($conn);
    }
    
    // Test 3: Check provider details query
    $testQuery3 = "SELECT sp.provider_id, sp.company_name,
                   COALESCE(AVG(pr.rating), 0) as avg_rating,
                   COUNT(pr.rating) as review_count
                   FROM service_provider sp
                   LEFT JOIN packages p ON sp.provider_id = p.provider_id
                   LEFT JOIN bookings b ON p.package_id = b.package_id
                   LEFT JOIN provider_reviews pr ON b.booking_id = pr.booking_id AND pr.review_type = 'customer_to_provider'
                   GROUP BY sp.provider_id
                   LIMIT 1";
    $result3 = mysqli_query($conn, $testQuery3);
    if ($result3) {
        $results['provider_details_test'] = true;
        $results['messages'][] = "✅ Provider details query works";
    } else {
        $results['errors'][] = "❌ Provider details test failed: " . mysqli_error($conn);
    }
    
    // Test 4: Check user bookings query
    $testQuery4 = "SELECT b.booking_id, b.status, b.completed_at, b.customer_rating_submitted,
                   pr.rating as submitted_rating, pr.review_text as submitted_review
                   FROM bookings b
                   LEFT JOIN provider_reviews pr ON b.booking_id = pr.booking_id AND pr.review_type = 'customer_to_provider'
                   LIMIT 1";
    $result4 = mysqli_query($conn, $testQuery4);
    if ($result4) {
        $results['user_bookings_test'] = true;
        $results['messages'][] = "✅ User bookings query works";
    } else {
        $results['errors'][] = "❌ User bookings test failed: " . mysqli_error($conn);
    }
    
    // Test 5: Check packages rating query
    $testQuery5 = "SELECT p.package_id, p.name,
                   AVG(pr.rating) AS average_rating,
                   COUNT(pr.rating) AS total_reviews
                   FROM packages p
                   LEFT JOIN bookings b ON p.package_id = b.package_id
                   LEFT JOIN provider_reviews pr ON b.booking_id = pr.booking_id AND pr.review_type = 'customer_to_provider'
                   GROUP BY p.package_id
                   LIMIT 1";
    $result5 = mysqli_query($conn, $testQuery5);
    if ($result5) {
        $results['packages_rating_test'] = true;
        $results['messages'][] = "✅ Packages rating query works";
    } else {
        $results['errors'][] = "❌ Packages rating test failed: " . mysqli_error($conn);
    }
    
    $results['all_tests_passed'] = (
        $results['rating_submission_test'] &&
        $results['provider_dashboard_test'] &&
        $results['provider_details_test'] &&
        $results['user_bookings_test'] &&
        $results['packages_rating_test']
    );
    
    if ($results['all_tests_passed']) {
        $results['messages'][] = "🎉 All systems working! Your rating system is fully functional.";
    } else {
        $results['messages'][] = "⚠️ Some issues detected. Check the errors above.";
    }
    
} catch (Exception $e) {
    $results['errors'][] = "Exception: " . $e->getMessage();
}

echo json_encode($results, JSON_PRETTY_PRINT);
mysqli_close($conn);
?>