<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once './backend/db_connect.php';

$results = [
    'tables_exist' => [],
    'bookings_columns' => [],
    'provider_reviews_columns' => [],
    'errors' => [],
    'sql_to_fix' => []
];

try {
    // Check if tables exist
    $query = "SHOW TABLES";
    $result = mysqli_query($conn, $query);
    $tables = [];
    while ($row = mysqli_fetch_array($result)) {
        $tables[] = $row[0];
    }
    
    $results['tables_exist']['bookings'] = in_array('bookings', $tables);
    $results['tables_exist']['provider_reviews'] = in_array('provider_reviews', $tables);
    
    // Check bookings table structure
    if ($results['tables_exist']['bookings']) {
        $query = "DESCRIBE bookings";
        $result = mysqli_query($conn, $query);
        while ($row = mysqli_fetch_assoc($result)) {
            $results['bookings_columns'][] = [
                'Field' => $row['Field'],
                'Type' => $row['Type'],
                'Null' => $row['Null'],
                'Default' => $row['Default']
            ];
        }
        
        // Check for required rating columns
        $bookingFields = array_column($results['bookings_columns'], 'Field');
        $requiredCols = ['completed_at', 'rating_deadline', 'customer_rating_submitted', 'provider_rating_submitted'];
        $missingCols = array_diff($requiredCols, $bookingFields);
        
        if (!empty($missingCols)) {
            $results['errors'][] = "Missing columns in bookings table: " . implode(', ', $missingCols);
            $results['sql_to_fix'][] = "ALTER TABLE bookings ADD COLUMN " . implode(' TIMESTAMP NULL, ADD COLUMN ', $missingCols) . " BOOLEAN DEFAULT FALSE;";
        }
    } else {
        $results['errors'][] = "bookings table does not exist!";
    }
    
    // Check provider_reviews table structure
    if ($results['tables_exist']['provider_reviews']) {
        $query = "DESCRIBE provider_reviews";
        $result = mysqli_query($conn, $query);
        while ($row = mysqli_fetch_assoc($result)) {
            $results['provider_reviews_columns'][] = [
                'Field' => $row['Field'],
                'Type' => $row['Type'],
                'Null' => $row['Null'],
                'Default' => $row['Default']
            ];
        }
        
        // Check for required columns
        $reviewFields = array_column($results['provider_reviews_columns'], 'Field');
        $requiredReviewCols = ['id', 'booking_id', 'reviewer_user_id', 'rating', 'review_text', 'review_category', 'review_type', 'created_at'];
        $missingReviewCols = array_diff($requiredReviewCols, $reviewFields);
        
        if (!empty($missingReviewCols)) {
            $results['errors'][] = "Missing columns in provider_reviews table: " . implode(', ', $missingReviewCols);
        }
    } else {
        $results['errors'][] = "provider_reviews table does not exist!";
        $results['sql_to_fix'][] = "CREATE TABLE provider_reviews (
            id INT AUTO_INCREMENT PRIMARY KEY,
            booking_id INT NOT NULL,
            reviewer_user_id INT NOT NULL,
            rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
            review_text TEXT,
            review_category VARCHAR(50) DEFAULT 'quality',
            review_type ENUM('customer_to_provider', 'provider_to_customer') DEFAULT 'customer_to_provider',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_booking_review (booking_id, review_type),
            FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
        );";
    }
    
    // Test the actual query that's failing
    if ($results['tables_exist']['bookings'] && $results['tables_exist']['provider_reviews']) {
        $testQuery = "SELECT b.booking_id, pr.rating, pr.review_text, pr.review_category 
                      FROM bookings b 
                      LEFT JOIN provider_reviews pr ON b.booking_id = pr.booking_id 
                      LIMIT 1";
        
        $testResult = mysqli_query($conn, $testQuery);
        if (!$testResult) {
            $results['errors'][] = "Query test failed: " . mysqli_error($conn);
        } else {
            $results['query_test'] = "✅ JOIN query works correctly";
        }
    }
    
    $results['success'] = empty($results['errors']);
    
} catch (Exception $e) {
    $results['errors'][] = "Exception: " . $e->getMessage();
    $results['success'] = false;
}

echo json_encode($results, JSON_PRETTY_PRINT);
mysqli_close($conn);
?>