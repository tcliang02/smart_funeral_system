<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once './backend/db_connect.php';

try {
    // Check if review_category column exists in provider_reviews table
    $query = "SHOW COLUMNS FROM provider_reviews LIKE 'review_category'";
    $result = mysqli_query($conn, $query);
    
    if (mysqli_num_rows($result) == 0) {
        // Column doesn't exist, add it
        $addColumnQuery = "ALTER TABLE provider_reviews ADD COLUMN review_category VARCHAR(50) DEFAULT 'quality'";
        $addResult = mysqli_query($conn, $addColumnQuery);
        
        if ($addResult) {
            echo json_encode([
                'success' => true,
                'message' => '✅ Added missing review_category column to provider_reviews table',
                'action' => 'column_added'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => '❌ Failed to add review_category column: ' . mysqli_error($conn),
                'action' => 'column_add_failed'
            ]);
        }
    } else {
        echo json_encode([
            'success' => true,
            'message' => '✅ review_category column already exists',
            'action' => 'no_action_needed'
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => '❌ Error: ' . $e->getMessage(),
        'action' => 'error'
    ]);
}

mysqli_close($conn);
?>