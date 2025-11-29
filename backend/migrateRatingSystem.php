<?php
/**
 * Database Migration Script
 * Adds rating system columns to bookings table
 * Run this once to set up the rating system
 */

header("Content-Type: application/json");
include "db_connect.php";

// Check if already migrated
$check_sql = "SHOW COLUMNS FROM bookings LIKE 'completed_at'";
$result = $conn->query($check_sql);

if ($result->num_rows > 0) {
    echo json_encode([
        "success" => true,
        "message" => "Rating columns already exist. Migration not needed.",
        "already_migrated" => true
    ]);
    exit;
}

try {
    // Start transaction
    $conn->begin_transaction();

    // Add columns to bookings table
    $sql1 = "ALTER TABLE bookings 
             ADD COLUMN completed_at TIMESTAMP NULL DEFAULT NULL,
             ADD COLUMN rating_deadline TIMESTAMP NULL DEFAULT NULL,
             ADD COLUMN customer_rating_submitted BOOLEAN DEFAULT FALSE,
             ADD COLUMN provider_rating_submitted BOOLEAN DEFAULT FALSE";
    
    if (!$conn->query($sql1)) {
        throw new Exception("Error adding columns: " . $conn->error);
    }

    // Create provider_reviews table
    $sql2 = "CREATE TABLE IF NOT EXISTS provider_reviews (
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
        FOREIGN KEY (reviewer_user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_booking (booking_id),
        INDEX idx_reviewer (reviewer_user_id),
        INDEX idx_review_type (review_type)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
    
    if (!$conn->query($sql2)) {
        throw new Exception("Error creating provider_reviews table: " . $conn->error);
    }

    // Create trigger
    $sql3 = "DROP TRIGGER IF EXISTS set_rating_deadline";
    $conn->query($sql3);

    $sql4 = "CREATE TRIGGER set_rating_deadline
             BEFORE UPDATE ON bookings
             FOR EACH ROW
             BEGIN
                 IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
                     SET NEW.completed_at = CURRENT_TIMESTAMP;
                     SET NEW.rating_deadline = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 DAY);
                 END IF;
             END";
    
    if (!$conn->query($sql4)) {
        throw new Exception("Error creating trigger: " . $conn->error);
    }

    // Update existing completed bookings
    $sql5 = "UPDATE bookings 
             SET completed_at = updated_at,
                 rating_deadline = DATE_ADD(updated_at, INTERVAL 30 DAY)
             WHERE status = 'completed' AND completed_at IS NULL";
    
    $conn->query($sql5); // Don't fail if no rows to update

    // Commit transaction
    $conn->commit();

    echo json_encode([
        "success" => true,
        "message" => "Rating system migration completed successfully!",
        "changes" => [
            "bookings_columns_added" => 4,
            "provider_reviews_table" => "created",
            "trigger_created" => "set_rating_deadline",
            "existing_bookings_updated" => $conn->affected_rows
        ]
    ]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode([
        "success" => false,
        "message" => "Migration failed: " . $e->getMessage()
    ]);
}

$conn->close();
?>
