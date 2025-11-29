<?php
/**
 * ZENLINK: Background Job to Release Expired Reservations
 * 
 * This script should be run periodically (every 5 minutes) via cron job
 * to release inventory held by bookings that haven't been paid within TTL
 * 
 * Usage: php ReleaseExpiredReservations.php
 * Cron: */5 * * * * cd /path/to/backend && php ReleaseExpiredReservations.php
 */

header("Content-Type: application/json");

include "db_connect.php";

// Configuration
$TTL_MINUTES = 15; // Time-to-live for pending bookings
$LOG_FILE = __DIR__ . '/../logs/reservation_release.log';

// Ensure log directory exists
$log_dir = dirname($LOG_FILE);
if (!is_dir($log_dir)) {
    mkdir($log_dir, 0755, true);
}

function log_message($message) {
    global $LOG_FILE;
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($LOG_FILE, "[$timestamp] $message\n", FILE_APPEND);
    echo "[$timestamp] $message\n";
}

try {
    log_message("Starting expired reservation release job...");
    
    // Get PDO connection
    $pdo = $conn->getPDO();
    $isPostgreSQL = ($pdo->getAttribute(PDO::ATTR_DRIVER_NAME) === 'pgsql');
    
    // Find bookings that are pending and older than TTL
    if ($isPostgreSQL) {
        $sql = "SELECT DISTINCT b.booking_id, b.booking_reference, b.customer_name, b.created_at
                FROM bookings b
                JOIN booking_addons ba ON b.booking_id = ba.booking_id
                JOIN provider_addons pa ON ba.addon_id = pa.addon_id
                WHERE b.status = 'pending'
                  AND pa.addon_type = 'item'
                  AND pa.stock_quantity IS NOT NULL
                  AND EXTRACT(EPOCH FROM (NOW() - b.created_at))/60 >= :ttl_minutes";
    } else {
        $sql = "SELECT DISTINCT b.booking_id, b.booking_reference, b.customer_name, b.created_at
                FROM bookings b
                JOIN booking_addons ba ON b.booking_id = ba.booking_id
                JOIN provider_addons pa ON ba.addon_id = pa.addon_id
                WHERE b.status = 'pending'
                  AND pa.addon_type = 'item'
                  AND pa.stock_quantity IS NOT NULL
                  AND TIMESTAMPDIFF(MINUTE, b.created_at, NOW()) >= :ttl_minutes";
    }
    
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':ttl_minutes', $TTL_MINUTES, PDO::PARAM_INT);
    $stmt->execute();
    $expired_bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $released_count = 0;
    
    if (count($expired_bookings) > 0) {
        log_message("Found " . count($expired_bookings) . " expired booking(s)");
        
        $conn->begin_transaction();
        
        foreach ($expired_bookings as $booking) {
            $booking_id = $booking['booking_id'];
            $booking_ref = $booking['booking_reference'];
            
            // Update booking status to expired
            $update_sql = "UPDATE bookings 
                          SET status = 'expired',
                              cancellation_reason = :reason
                          WHERE booking_id = :booking_id AND status = 'pending'";
            
            $reason = "Payment not received within {$TTL_MINUTES} minutes. Reservation expired.";
            $update_stmt = $pdo->prepare($update_sql);
            $update_stmt->bindValue(':reason', $reason, PDO::PARAM_STR);
            $update_stmt->bindValue(':booking_id', $booking_id, PDO::PARAM_INT);
            
            if ($update_stmt->execute()) {
                $released_count++;
                log_message("Released booking #{$booking_id} ({$booking_ref}) - {$booking['customer_name']}");
            } else {
                $error = $update_stmt->errorInfo();
                log_message("ERROR: Failed to release booking #{$booking_id}: " . ($error[2] ?? 'Unknown error'));
            }
        }
        
        $conn->commit();
        log_message("Successfully released {$released_count} expired reservation(s)");
    } else {
        log_message("No expired reservations found");
    }
    
    // Return JSON response (for API calls)
    echo json_encode([
        "success" => true,
        "released_count" => $released_count,
        "message" => "Released {$released_count} expired reservation(s)"
    ]);
    
} catch (Exception $e) {
    log_message("ERROR: " . $e->getMessage());
    
    if ($conn->inTransaction()) {
        $conn->rollback();
    }
    
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
    
    http_response_code(500);
}

    // Connection cleanup handled by PDO
?>

