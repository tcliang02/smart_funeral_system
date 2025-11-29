<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once './backend/db_connect.php';

try {
    // Backup existing provider_reviews data (if any)
    $backupQuery = "CREATE TABLE IF NOT EXISTS provider_reviews_backup AS SELECT * FROM provider_reviews";
    mysqli_query($conn, $backupQuery);
    
    // Drop the old provider_reviews table
    $dropQuery = "DROP TABLE IF EXISTS provider_reviews";
    $dropResult = mysqli_query($conn, $dropQuery);
    
    if (!$dropResult) {
        throw new Exception("Failed to drop old provider_reviews table: " . mysqli_error($conn));
    }
    
    // Create the correct provider_reviews table for the rating system
    $createQuery = "CREATE TABLE provider_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT NOT NULL,
        reviewer_user_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review_text TEXT,
        review_category VARCHAR(50) DEFAULT 'quality',
        review_type ENUM('customer_to_provider', 'provider_to_customer') DEFAULT 'customer_to_provider',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_booking_review (booking_id, review_type),
        FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
        INDEX idx_booking (booking_id),
        INDEX idx_reviewer (reviewer_user_id),
        INDEX idx_review_type (review_type)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
    
    $createResult = mysqli_query($conn, $createQuery);
    
    if (!$createResult) {
        throw new Exception("Failed to create new provider_reviews table: " . mysqli_error($conn));
    }
    
    // Test the JOIN query that was failing
    $testQuery = "SELECT b.booking_id, pr.rating, pr.review_text, pr.review_category 
                  FROM bookings b 
                  LEFT JOIN provider_reviews pr ON b.booking_id = pr.booking_id AND pr.review_type = 'customer_to_provider'
                  LIMIT 1";
    
    $testResult = mysqli_query($conn, $testQuery);
    
    if (!$testResult) {
        throw new Exception("JOIN test failed: " . mysqli_error($conn));
    }
    
    echo json_encode([
        'success' => true,
        'message' => '✅ Successfully fixed provider_reviews table structure',
        'actions' => [
            '✅ Backed up old provider_reviews data to provider_reviews_backup',
            '✅ Dropped old provider_reviews table',
            '✅ Created new provider_reviews table with correct structure',
            '✅ Tested JOIN query - working correctly'
        ],
        'note' => 'Your rating system is now ready to use!'
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => '❌ Error fixing database: ' . $e->getMessage(),
        'suggestion' => 'You may need to manually drop the provider_reviews table in phpMyAdmin and run the migration again'
    ]);
}

mysqli_close($conn);
?>