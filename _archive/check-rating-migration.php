<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once './backend/db_connect.php';

$results = [
    'bookings_columns' => false,
    'provider_reviews_table' => false,
    'trigger_exists' => false,
    'messages' => []
];

try {
    // Check bookings table columns
    $columns = ['completed_at', 'rating_deadline', 'customer_rating_submitted', 'provider_rating_submitted'];
    $columnsExist = 0;
    
    foreach ($columns as $column) {
        $query = "SHOW COLUMNS FROM bookings LIKE '$column'";
        $result = mysqli_query($conn, $query);
        if (mysqli_num_rows($result) > 0) {
            $columnsExist++;
        }
    }
    
    if ($columnsExist === 4) {
        $results['bookings_columns'] = true;
        $results['messages'][] = "✅ All 4 rating columns exist in bookings table";
    } else {
        $results['messages'][] = "❌ Only $columnsExist/4 rating columns found in bookings table";
    }

    // Check provider_reviews table
    $query = "SHOW TABLES LIKE 'provider_reviews'";
    $result = mysqli_query($conn, $query);
    
    if (mysqli_num_rows($result) > 0) {
        $results['provider_reviews_table'] = true;
        $results['messages'][] = "✅ provider_reviews table exists";
        
        // Check table structure
        $query = "DESCRIBE provider_reviews";
        $columns = mysqli_query($conn, $query);
        $columnCount = mysqli_num_rows($columns);
        $results['messages'][] = "ℹ️ provider_reviews has $columnCount columns";
    } else {
        $results['messages'][] = "❌ provider_reviews table does not exist";
    }

    // Check trigger (optional)
    $query = "SHOW TRIGGERS WHERE `Table` = 'bookings'";
    $result = mysqli_query($conn, $query);
    
    if (mysqli_num_rows($result) > 0) {
        $results['trigger_exists'] = true;
        $results['messages'][] = "✅ Trigger found for bookings table";
    } else {
        $results['messages'][] = "⚠️ No trigger found (optional feature)";
    }

    // Overall success - trigger is not required
    $results['success'] = $results['bookings_columns'] && $results['provider_reviews_table'];
    
    if ($results['success']) {
        $results['messages'][] = "🎉 Migration successful! Rating system is ready.";
    } else {
        $results['messages'][] = "❌ Migration incomplete. Some components are missing.";
    }

} catch (Exception $e) {
    $results['success'] = false;
    $results['messages'][] = "❌ Error: " . $e->getMessage();
}

echo json_encode($results, JSON_PRETTY_PRINT);
mysqli_close($conn);
?>