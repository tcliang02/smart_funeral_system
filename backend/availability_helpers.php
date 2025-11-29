<?php
/**
 * ZENLINK: Availability and Inventory Helper Functions
 * PDO-compatible functions for checking resource availability and inventory
 */

/**
 * Check if a resource (hall, monk, equipment) is available for a date range
 * 
 * @param PDO $conn Database connection
 * @param int $provider_id Provider ID
 * @param string $resource_type Resource type (parlour, monk, equipment)
 * @param string $resource_name Resource name (Hall A, Monk John, etc.)
 * @param string $start_date Start date (Y-m-d)
 * @param string $end_date End date (Y-m-d)
 * @param string|null $start_time Start time (H:i:s) - optional
 * @param string|null $end_time End time (H:i:s) - optional
 * @param int|null $exclude_booking_id Booking ID to exclude from check (for updates)
 * @return array ['is_available' => bool, 'conflict_count' => int, 'message' => string]
 */
function checkResourceAvailability($conn, $provider_id, $resource_type, $resource_name, 
                                    $start_date, $end_date, $start_time = null, $end_time = null, 
                                    $exclude_booking_id = null) {
    try {
        // Check for overlapping bookings
        $sql = "SELECT COUNT(*) as conflict_count
                FROM booking_dates bd
                JOIN bookings b ON bd.booking_id = b.booking_id
                JOIN resource_availability ra ON bd.booking_id = ra.booking_id
                WHERE ra.provider_id = :provider_id
                  AND ra.resource_type = :resource_type
                  AND ra.resource_name = :resource_name
                  AND b.status IN ('pending', 'confirmed', 'in_progress')
                  AND (:exclude_booking_id IS NULL OR b.booking_id != :exclude_booking_id)
                  AND (
                      -- Overlap scenario 1: Requested start falls within existing booking
                      (:start_date BETWEEN bd.date AND COALESCE(
                          (SELECT MAX(date) FROM booking_dates WHERE booking_id = bd.booking_id),
                          bd.date
                      ))
                      -- Overlap scenario 2: Requested end falls within existing booking
                      OR (:end_date BETWEEN bd.date AND COALESCE(
                          (SELECT MAX(date) FROM booking_dates WHERE booking_id = bd.booking_id),
                          bd.date
                      ))
                      -- Overlap scenario 3: Requested range contains existing booking
                      OR (bd.date >= :start_date AND bd.date <= :end_date)
                      -- Overlap scenario 4: Existing booking contains requested range
                      OR (:start_date >= bd.date AND :end_date <= COALESCE(
                          (SELECT MAX(date) FROM booking_dates WHERE booking_id = bd.booking_id),
                          bd.date
                      ))
                  )";
        
        // Add time overlap check if times are provided
        if ($start_time && $end_time) {
            $sql .= " AND (
                bd.start_time IS NULL OR bd.end_time IS NULL OR
                (:start_time < COALESCE(bd.end_time, '23:59:59') 
                 AND :end_time > COALESCE(bd.start_time, '00:00:00'))
            )";
        }
        
        $stmt = $conn->prepare($sql);
        $stmt->bindValue(':provider_id', $provider_id, PDO::PARAM_INT);
        $stmt->bindValue(':resource_type', $resource_type, PDO::PARAM_STR);
        $stmt->bindValue(':resource_name', $resource_name, PDO::PARAM_STR);
        $stmt->bindValue(':start_date', $start_date, PDO::PARAM_STR);
        $stmt->bindValue(':end_date', $end_date, PDO::PARAM_STR);
        $stmt->bindValue(':exclude_booking_id', $exclude_booking_id, PDO::PARAM_INT);
        
        if ($start_time && $end_time) {
            $stmt->bindValue(':start_time', $start_time, PDO::PARAM_STR);
            $stmt->bindValue(':end_time', $end_time, PDO::PARAM_STR);
        }
        
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $conflict_count = (int)$result['conflict_count'];
        
        $is_available = ($conflict_count === 0);
        $message = $is_available 
            ? 'Resource is available.' 
            : "Resource is booked. Found {$conflict_count} conflicting booking(s).";
        
        return [
            'is_available' => $is_available,
            'conflict_count' => $conflict_count,
            'message' => $message
        ];
        
    } catch (PDOException $e) {
        error_log("Error checking resource availability: " . $e->getMessage());
        return [
            'is_available' => false,
            'conflict_count' => 0,
            'message' => 'Error checking availability: ' . $e->getMessage()
        ];
    }
}

/**
 * Check if inventory (physical item) has sufficient stock
 * Accounts for reserved quantities from pending bookings within TTL
 * 
 * @param PDO $conn Database connection
 * @param int $addon_id Addon ID
 * @param int $requested_quantity Quantity requested
 * @param int|null $exclude_booking_id Booking ID to exclude from reserved count
 * @return array ['is_available' => bool, 'available_stock' => int, 'total_stock' => int, 'reserved_quantity' => int, 'message' => string]
 */
function checkInventoryAvailability($conn, $addon_id, $requested_quantity, $exclude_booking_id = null) {
    try {
        // Get current stock and addon type
        $sql = "SELECT COALESCE(stock_quantity, 0) as stock_quantity, addon_type
                FROM provider_addons
                WHERE addon_id = :addon_id";
        $stmt = $conn->prepare($sql);
        $stmt->bindValue(':addon_id', $addon_id, PDO::PARAM_INT);
        $stmt->execute();
        $addon = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$addon) {
            return [
                'is_available' => false,
                'available_stock' => 0,
                'total_stock' => 0,
                'reserved_quantity' => 0,
                'message' => 'Addon not found'
            ];
        }
        
        // If not an item type, return available (services are unlimited)
        if ($addon['addon_type'] !== 'item' || $addon['stock_quantity'] === null) {
            return [
                'is_available' => true,
                'available_stock' => 999999,
                'total_stock' => 999999,
                'reserved_quantity' => 0,
                'message' => 'Service type - unlimited availability'
            ];
        }
        
        $current_stock = (int)$addon['stock_quantity'];
        
        // Calculate reserved quantity (bookings that are pending/confirmed but not expired)
        $reserved_sql = "SELECT COALESCE(SUM(COALESCE(ba.quantity, 1)), 0) as reserved_quantity
                         FROM booking_addons ba
                         JOIN bookings b ON ba.booking_id = b.booking_id
                         WHERE ba.addon_id = :addon_id
                           AND b.status IN ('pending', 'confirmed')
                           AND (:exclude_booking_id IS NULL OR b.booking_id != :exclude_booking_id)
                           -- Only count reservations that haven't expired (15 minute TTL)
                           -- PostgreSQL: EXTRACT(EPOCH FROM (NOW() - b.created_at))/60 < 15
                           -- MySQL: TIMESTAMPDIFF(MINUTE, b.created_at, NOW()) < 15
                           AND (
                               (EXTRACT(EPOCH FROM (NOW() - b.created_at))/60 < 15)
                               OR (TIMESTAMPDIFF(MINUTE, b.created_at, NOW()) < 15)
                           )";
        
        $reserved_stmt = $conn->prepare($reserved_sql);
        $reserved_stmt->bindValue(':addon_id', $addon_id, PDO::PARAM_INT);
        $reserved_stmt->bindValue(':exclude_booking_id', $exclude_booking_id, PDO::PARAM_INT);
        $reserved_stmt->execute();
        $reserved_result = $reserved_stmt->fetch(PDO::FETCH_ASSOC);
        $reserved_quantity = (int)$reserved_result['reserved_quantity'];
        
        // Calculate available stock
        $available_stock = $current_stock - $reserved_quantity;
        
        // Check if requested quantity is available
        $is_available = ($available_stock >= $requested_quantity);
        
        $message = $is_available 
            ? "Available: {$available_stock} units"
            : "Insufficient stock. Available: {$available_stock}, Requested: {$requested_quantity}";
        
        return [
            'is_available' => $is_available,
            'available_stock' => $available_stock,
            'total_stock' => $current_stock,
            'reserved_quantity' => $reserved_quantity,
            'message' => $message
        ];
        
    } catch (PDOException $e) {
        error_log("Error checking inventory availability: " . $e->getMessage());
        return [
            'is_available' => false,
            'available_stock' => 0,
            'total_stock' => 0,
            'reserved_quantity' => 0,
            'message' => 'Error checking availability: ' . $e->getMessage()
        ];
    }
}

/**
 * Confirm inventory and decrement stock when booking is confirmed/paid
 * 
 * @param PDO $conn Database connection
 * @param int $booking_id Booking ID
 * @return array ['success' => bool, 'message' => string, 'items_decremented' => int]
 */
function confirmInventory($conn, $booking_id) {
    try {
        $conn->beginTransaction();
        
        // Get all physical item addons for this booking
        $sql = "SELECT ba.addon_id, COALESCE(ba.quantity, 1) as quantity, pa.stock_quantity
                FROM booking_addons ba
                JOIN provider_addons pa ON ba.addon_id = pa.addon_id
                WHERE ba.booking_id = :booking_id
                  AND pa.addon_type = 'item'
                  AND pa.stock_quantity IS NOT NULL";
        
        $stmt = $conn->prepare($sql);
        $stmt->bindValue(':booking_id', $booking_id, PDO::PARAM_INT);
        $stmt->execute();
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $items_decremented = 0;
        
        foreach ($items as $item) {
            $addon_id = $item['addon_id'];
            $quantity = (int)$item['quantity'];
            $current_stock = (int)$item['stock_quantity'];
            
            // Safety check: ensure stock is sufficient
            if ($current_stock < $quantity) {
                throw new Exception("Insufficient stock for addon ID {$addon_id}. Available: {$current_stock}, Required: {$quantity}");
            }
            
            // Decrement stock
            $update_sql = "UPDATE provider_addons
                          SET stock_quantity = stock_quantity - :quantity
                          WHERE addon_id = :addon_id
                            AND stock_quantity >= :quantity";
            
            $update_stmt = $conn->prepare($update_sql);
            $update_stmt->bindValue(':quantity', $quantity, PDO::PARAM_INT);
            $update_stmt->bindValue(':addon_id', $addon_id, PDO::PARAM_INT);
            
            if (!$update_stmt->execute()) {
                throw new Exception("Failed to decrement stock for addon ID {$addon_id}");
            }
            
            // Log stock change (if addon_stock_history table exists)
            try {
                $history_sql = "INSERT INTO addon_stock_history 
                               (addon_id, booking_id, change_type, quantity_change, previous_stock, new_stock, notes)
                               VALUES (:addon_id, :booking_id, 'sale', :quantity_change, :previous_stock, :new_stock, :notes)";
                
                $history_stmt = $conn->prepare($history_sql);
                $history_stmt->bindValue(':addon_id', $addon_id, PDO::PARAM_INT);
                $history_stmt->bindValue(':booking_id', $booking_id, PDO::PARAM_INT);
                $history_stmt->bindValue(':quantity_change', -$quantity, PDO::PARAM_INT);
                $history_stmt->bindValue(':previous_stock', $current_stock, PDO::PARAM_INT);
                $history_stmt->bindValue(':new_stock', $current_stock - $quantity, PDO::PARAM_INT);
                $history_stmt->bindValue(':notes', "Stock decremented for booking #{$booking_id}", PDO::PARAM_STR);
                $history_stmt->execute();
            } catch (PDOException $e) {
                // Table might not exist yet, just log and continue
                error_log("Note: addon_stock_history table not found, skipping history log: " . $e->getMessage());
            }
            
            $items_decremented++;
        }
        
        $conn->commit();
        
        return [
            'success' => true,
            'message' => "Inventory confirmed and stock decremented for {$items_decremented} item(s)",
            'items_decremented' => $items_decremented
        ];
        
    } catch (Exception $e) {
        $conn->rollBack();
        error_log("Error confirming inventory: " . $e->getMessage());
        return [
            'success' => false,
            'message' => 'Error confirming inventory: ' . $e->getMessage(),
            'items_decremented' => 0
        ];
    }
}

/**
 * Validate booking before creation
 * Checks package, inventory, and resources
 * 
 * @param PDO $conn Database connection
 * @param int $provider_id Provider ID
 * @param int $package_id Package ID
 * @param array $selected_addons Array of ['addon_id' => int, 'quantity' => int]
 * @param array $service_dates Array of ['date' => string, 'start_time' => string, 'end_time' => string, 'event_type' => string]
 * @param array $resources Array of ['resource_type' => string, 'resource_name' => string]
 * @return array ['is_valid' => bool, 'error_messages' => string, 'message' => string]
 */
function validateBooking($conn, $provider_id, $package_id, $selected_addons = [], $service_dates = [], $resources = []) {
    $errors = [];
    
    try {
        // 1. Validate package exists and is active
        $package_sql = "SELECT package_id, name, is_active, provider_id
                       FROM packages
                       WHERE package_id = :package_id";
        $package_stmt = $conn->prepare($package_sql);
        $package_stmt->bindValue(':package_id', $package_id, PDO::PARAM_INT);
        $package_stmt->execute();
        $package = $package_stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$package) {
            $errors[] = 'Invalid or inactive package.';
        } elseif ($package['provider_id'] != $provider_id) {
            $errors[] = 'Package does not belong to this provider.';
        } elseif (!$package['is_active']) {
            $errors[] = 'Package is not active.';
        }
        
        // 2. Validate each addon (inventory check)
        foreach ($selected_addons as $addon) {
            $addon_id = $addon['addon_id'] ?? null;
            $quantity = $addon['quantity'] ?? 1;
            
            if (!$addon_id) {
                continue; // Custom addon, skip inventory check
            }
            
            $inventory_check = checkInventoryAvailability($conn, $addon_id, $quantity);
            
            if (!$inventory_check['is_available']) {
                $errors[] = "Insufficient stock for addon ID {$addon_id}. {$inventory_check['message']}";
            }
        }
        
        // 3. Validate each resource (availability check)
        if (!empty($service_dates) && !empty($resources)) {
            // Get date range from service_dates
            $dates = array_column($service_dates, 'date');
            $start_date = min($dates);
            $end_date = max($dates);
            
            foreach ($resources as $resource) {
                $resource_type = $resource['resource_type'] ?? null;
                $resource_name = $resource['resource_name'] ?? null;
                
                if (!$resource_type || !$resource_name) {
                    continue;
                }
                
                // Get times from first service date if available
                $first_date = $service_dates[0] ?? [];
                $start_time = $first_date['start_time'] ?? null;
                $end_time = $first_date['end_time'] ?? null;
                
                $availability_check = checkResourceAvailability(
                    $conn, 
                    $provider_id, 
                    $resource_type, 
                    $resource_name,
                    $start_date, 
                    $end_date,
                    $start_time,
                    $end_time
                );
                
                if (!$availability_check['is_available']) {
                    $errors[] = "Resource '{$resource_name}' is not available. {$availability_check['message']}";
                }
            }
        }
        
        $is_valid = empty($errors);
        $error_messages = implode(' ', $errors);
        $message = $is_valid 
            ? 'Booking validation passed'
            : "Validation failed: {$error_messages}";
        
        return [
            'is_valid' => $is_valid,
            'error_messages' => $error_messages,
            'message' => $message
        ];
        
    } catch (PDOException $e) {
        error_log("Error validating booking: " . $e->getMessage());
        return [
            'is_valid' => false,
            'error_messages' => 'Error during validation: ' . $e->getMessage(),
            'message' => 'Validation error occurred'
        ];
    }
}

?>

