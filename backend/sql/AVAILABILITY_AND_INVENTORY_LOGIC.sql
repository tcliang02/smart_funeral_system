-- ZENLINK: Availability Checking & Inventory Management Logic
-- Critical operational procedures for preventing double bookings and managing stock

-- ============================================
-- 1. RESOURCE AVAILABILITY CHECK (Date Range Overlap Detection)
-- ============================================
-- This procedure checks if a resource (hall, monk, equipment) is available
-- for a given date range, preventing double bookings

DELIMITER //

CREATE PROCEDURE IF NOT EXISTS CheckResourceAvailability(
    IN p_provider_id INT,
    IN p_resource_type VARCHAR(50),
    IN p_resource_name VARCHAR(255),
    IN p_start_date DATE,
    IN p_end_date DATE,
    IN p_start_time TIME,
    IN p_end_time TIME,
    IN p_exclude_booking_id INT -- For updates: exclude current booking from check
)
BEGIN
    DECLARE v_is_available BOOLEAN DEFAULT TRUE;
    DECLARE v_conflict_count INT DEFAULT 0;
    
    -- Check for any overlapping bookings
    SELECT COUNT(*) INTO v_conflict_count
    FROM booking_dates bd
    JOIN bookings b ON bd.booking_id = b.booking_id
    JOIN resource_availability ra ON bd.booking_id = ra.booking_id
    WHERE ra.provider_id = p_provider_id
      AND ra.resource_type = p_resource_type
      AND ra.resource_name = p_resource_name
      AND b.status IN ('pending', 'confirmed', 'in_progress')
      AND (p_exclude_booking_id IS NULL OR b.booking_id != p_exclude_booking_id)
      AND (
          -- Overlap scenarios:
          -- 1. Requested start date falls within existing booking
          (p_start_date BETWEEN bd.date AND COALESCE(
              (SELECT MAX(date) FROM booking_dates WHERE booking_id = bd.booking_id),
              bd.date
          ))
          -- 2. Requested end date falls within existing booking
          OR (p_end_date BETWEEN bd.date AND COALESCE(
              (SELECT MAX(date) FROM booking_dates WHERE booking_id = bd.booking_id),
              bd.date
          ))
          -- 3. Requested range completely contains existing booking
          OR (bd.date >= p_start_date AND bd.date <= p_end_date)
          -- 4. Existing booking completely contains requested range
          OR (p_start_date >= bd.date AND p_end_date <= COALESCE(
              (SELECT MAX(date) FROM booking_dates WHERE booking_id = bd.booking_id),
              bd.date
          ))
      )
      -- Time overlap check (if times are specified)
      AND (
          p_start_time IS NULL 
          OR p_end_time IS NULL
          OR bd.start_time IS NULL
          OR bd.end_time IS NULL
          OR (
              -- Time overlap: requested start is before existing end AND requested end is after existing start
              (p_start_time < COALESCE(bd.end_time, '23:59:59') 
               AND p_end_time > COALESCE(bd.start_time, '00:00:00'))
          )
      );
    
    -- If conflicts found, resource is not available
    IF v_conflict_count > 0 THEN
        SET v_is_available = FALSE;
    END IF;
    
    -- Return result
    SELECT v_is_available AS is_available,
           v_conflict_count AS conflict_count,
           CASE 
               WHEN v_conflict_count > 0 THEN CONCAT('Resource is booked. Found ', v_conflict_count, ' conflicting booking(s).')
               ELSE 'Resource is available.'
           END AS message;
END //

DELIMITER ;

-- ============================================
-- 2. INVENTORY AVAILABILITY CHECK
-- ============================================
-- Checks if a physical item has sufficient stock, accounting for reserved quantities

DELIMITER //

CREATE PROCEDURE IF NOT EXISTS CheckInventoryAvailability(
    IN p_addon_id INT,
    IN p_requested_quantity INT,
    IN p_exclude_booking_id INT -- For updates: exclude current booking from reserved count
)
BEGIN
    DECLARE v_current_stock INT;
    DECLARE v_reserved_quantity INT DEFAULT 0;
    DECLARE v_available_stock INT;
    DECLARE v_is_available BOOLEAN DEFAULT FALSE;
    
    -- Get current stock
    SELECT COALESCE(stock_quantity, 0) INTO v_current_stock
    FROM provider_addons
    WHERE addon_id = p_addon_id
      AND addon_type = 'item';
    
    -- If not an item type, return available (services are unlimited)
    IF v_current_stock IS NULL THEN
        SELECT TRUE AS is_available,
               999999 AS available_stock,
               'Service type - unlimited availability' AS message;
        LEAVE sp;
    END IF;
    
    -- Calculate reserved quantity (bookings that are pending/confirmed but not expired)
    SELECT COALESCE(SUM(ba.quantity), 0) INTO v_reserved_quantity
    FROM booking_addons ba
    JOIN bookings b ON ba.booking_id = b.booking_id
    WHERE ba.addon_id = p_addon_id
      AND b.status IN ('pending', 'confirmed')
      AND (p_exclude_booking_id IS NULL OR b.booking_id != p_exclude_booking_id)
      -- Only count reservations that haven't expired (TTL check)
      AND TIMESTAMPDIFF(MINUTE, b.created_at, NOW()) < 15; -- 15 minute TTL
    
    -- Calculate available stock
    SET v_available_stock = v_current_stock - v_reserved_quantity;
    
    -- Check if requested quantity is available
    IF v_available_stock >= p_requested_quantity THEN
        SET v_is_available = TRUE;
    END IF;
    
    -- Return result
    SELECT v_is_available AS is_available,
           v_available_stock AS available_stock,
           v_current_stock AS total_stock,
           v_reserved_quantity AS reserved_quantity,
           CASE 
               WHEN v_is_available THEN CONCAT('Available: ', v_available_stock, ' units')
               ELSE CONCAT('Insufficient stock. Available: ', v_available_stock, ', Requested: ', p_requested_quantity)
           END AS message;
END //

DELIMITER ;

-- ============================================
-- 3. RESERVE INVENTORY (With TTL)
-- ============================================
-- Reserves inventory when booking is created, with automatic release after TTL

DELIMITER //

CREATE PROCEDURE IF NOT EXISTS ReserveInventory(
    IN p_booking_id INT,
    IN p_addon_id INT,
    IN p_quantity INT
)
BEGIN
    DECLARE v_is_available BOOLEAN;
    DECLARE v_available_stock INT;
    
    -- Check availability first
    CALL CheckInventoryAvailability(p_addon_id, p_quantity, NULL);
    SELECT is_available, available_stock INTO v_is_available, v_available_stock;
    
    IF NOT v_is_available THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = CONCAT('Insufficient stock. Available: ', v_available_stock, ', Requested: ', p_quantity);
    END IF;
    
    -- Inventory is reserved by the booking status and TTL logic
    -- No separate reservation table needed - the booking itself is the reservation
    -- Stock will be decremented when booking is confirmed/paid
    SELECT TRUE AS reserved,
           p_booking_id AS booking_id,
           'Inventory reserved. Will be confirmed upon payment.' AS message;
END //

DELIMITER ;

-- ============================================
-- 4. CONFIRM INVENTORY (Decrement Stock)
-- ============================================
-- Decrements stock when booking is confirmed/paid

DELIMITER //

CREATE PROCEDURE IF NOT EXISTS ConfirmInventory(
    IN p_booking_id INT
)
BEGIN
    DECLARE v_addon_id INT;
    DECLARE v_quantity INT;
    DECLARE v_done INT DEFAULT FALSE;
    
    -- Cursor to iterate through all addons in booking
    DECLARE addon_cursor CURSOR FOR
        SELECT ba.addon_id, ba.quantity
        FROM booking_addons ba
        JOIN provider_addons pa ON ba.addon_id = pa.addon_id
        WHERE ba.booking_id = p_booking_id
          AND pa.addon_type = 'item'
          AND pa.stock_quantity IS NOT NULL;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;
    
    START TRANSACTION;
    
    OPEN addon_cursor;
    
    addon_loop: LOOP
        FETCH addon_cursor INTO v_addon_id, v_quantity;
        
        IF v_done THEN
            LEAVE addon_loop;
        END IF;
        
        -- Decrement stock
        UPDATE provider_addons
        SET stock_quantity = stock_quantity - v_quantity
        WHERE addon_id = v_addon_id
          AND stock_quantity >= v_quantity; -- Safety check
        
        -- Log stock change
        INSERT INTO addon_stock_history (
            addon_id, 
            booking_id, 
            change_type, 
            quantity_change,
            previous_stock,
            new_stock,
            notes
        )
        SELECT 
            v_addon_id,
            p_booking_id,
            'sale',
            -v_quantity,
            stock_quantity + v_quantity,
            stock_quantity,
            CONCAT('Stock decremented for booking #', p_booking_id)
        FROM provider_addons
        WHERE addon_id = v_addon_id;
        
    END LOOP;
    
    CLOSE addon_cursor;
    
    COMMIT;
    
    SELECT TRUE AS confirmed, 'Inventory confirmed and stock decremented' AS message;
END //

DELIMITER ;

-- ============================================
-- 5. RELEASE EXPIRED RESERVATIONS (Background Job)
-- ============================================
-- This should be run periodically (every 5 minutes) to release inventory
-- held by bookings that haven't been paid within the TTL period

DELIMITER //

CREATE PROCEDURE IF NOT EXISTS ReleaseExpiredReservations()
BEGIN
    DECLARE v_released_count INT DEFAULT 0;
    DECLARE v_booking_id INT;
    DECLARE v_done INT DEFAULT FALSE;
    
    -- Find bookings that are pending and older than 15 minutes
    DECLARE expired_cursor CURSOR FOR
        SELECT DISTINCT b.booking_id
        FROM bookings b
        JOIN booking_addons ba ON b.booking_id = ba.booking_id
        JOIN provider_addons pa ON ba.addon_id = pa.addon_id
        WHERE b.status = 'pending'
          AND pa.addon_type = 'item'
          AND pa.stock_quantity IS NOT NULL
          AND TIMESTAMPDIFF(MINUTE, b.created_at, NOW()) >= 15;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;
    
    START TRANSACTION;
    
    OPEN expired_cursor;
    
    expired_loop: LOOP
        FETCH expired_cursor INTO v_booking_id;
        
        IF v_done THEN
            LEAVE expired_loop;
        END IF;
        
        -- Cancel the booking (or mark as expired)
        UPDATE bookings
        SET status = 'expired',
            cancellation_reason = 'Payment not received within 15 minutes. Reservation expired.'
        WHERE booking_id = v_booking_id
          AND status = 'pending';
        
        SET v_released_count = v_released_count + 1;
        
    END LOOP;
    
    CLOSE expired_cursor;
    
    COMMIT;
    
    SELECT v_released_count AS released_count,
           CONCAT('Released ', v_released_count, ' expired reservation(s)') AS message;
END //

DELIMITER ;

-- ============================================
-- 6. COMPREHENSIVE BOOKING VALIDATION
-- ============================================
-- Validates entire booking before creation (resources + inventory)

DELIMITER //

CREATE PROCEDURE IF NOT EXISTS ValidateBooking(
    IN p_provider_id INT,
    IN p_package_id INT,
    IN p_service_dates JSON, -- Array of {date, start_time, end_time, event_type}
    IN p_selected_addons JSON, -- Array of {addon_id, quantity}
    IN p_resources JSON -- Array of {resource_type, resource_name}
)
BEGIN
    DECLARE v_validation_passed BOOLEAN DEFAULT TRUE;
    DECLARE v_error_messages TEXT DEFAULT '';
    DECLARE v_addon_item JSON;
    DECLARE v_resource_item JSON;
    DECLARE v_date_item JSON;
    DECLARE v_i INT DEFAULT 0;
    DECLARE v_count INT;
    DECLARE v_is_available BOOLEAN;
    DECLARE v_available_stock INT;
    
    -- Validate package exists and is active
    SELECT COUNT(*) INTO v_count
    FROM packages
    WHERE package_id = p_package_id
      AND provider_id = p_provider_id
      AND is_active = 1;
    
    IF v_count = 0 THEN
        SET v_validation_passed = FALSE;
        SET v_error_messages = CONCAT(v_error_messages, 'Invalid or inactive package. ');
    END IF;
    
    -- Validate each addon (inventory check)
    SET v_i = 0;
    WHILE v_i < JSON_LENGTH(p_selected_addons) DO
        SET v_addon_item = JSON_EXTRACT(p_selected_addons, CONCAT('$[', v_i, ']'));
        
        CALL CheckInventoryAvailability(
            JSON_UNQUOTE(JSON_EXTRACT(v_addon_item, '$.addon_id')),
            JSON_UNQUOTE(JSON_EXTRACT(v_addon_item, '$.quantity')),
            NULL
        );
        
        SELECT is_available, available_stock INTO v_is_available, v_available_stock;
        
        IF NOT v_is_available THEN
            SET v_validation_passed = FALSE;
            SET v_error_messages = CONCAT(v_error_messages, 
                'Insufficient stock for addon ID ', 
                JSON_UNQUOTE(JSON_EXTRACT(v_addon_item, '$.addon_id')), 
                '. Available: ', v_available_stock, '. ');
        END IF;
        
        SET v_i = v_i + 1;
    END WHILE;
    
    -- Validate each resource (availability check)
    SET v_i = 0;
    WHILE v_i < JSON_LENGTH(p_resources) DO
        SET v_resource_item = JSON_EXTRACT(p_resources, CONCAT('$[', v_i, ']'));
        
        -- Get date range from service_dates
        SET v_date_item = JSON_EXTRACT(p_service_dates, '$[0]');
        
        CALL CheckResourceAvailability(
            p_provider_id,
            JSON_UNQUOTE(JSON_EXTRACT(v_resource_item, '$.resource_type')),
            JSON_UNQUOTE(JSON_EXTRACT(v_resource_item, '$.resource_name')),
            JSON_UNQUOTE(JSON_EXTRACT(v_date_item, '$.date')),
            JSON_UNQUOTE(JSON_EXTRACT(v_date_item, '$.date')), -- Single date for now, extend for ranges
            JSON_UNQUOTE(JSON_EXTRACT(v_date_item, '$.start_time')),
            JSON_UNQUOTE(JSON_EXTRACT(v_date_item, '$.end_time')),
            NULL
        );
        
        SELECT is_available INTO v_is_available;
        
        IF NOT v_is_available THEN
            SET v_validation_passed = FALSE;
            SET v_error_messages = CONCAT(v_error_messages,
                'Resource ', JSON_UNQUOTE(JSON_EXTRACT(v_resource_item, '$.resource_name')),
                ' is not available. ');
        END IF;
        
        SET v_i = v_i + 1;
    END WHILE;
    
    -- Return validation result
    SELECT v_validation_passed AS is_valid,
           v_error_messages AS error_messages,
           CASE 
               WHEN v_validation_passed THEN 'Booking validation passed'
               ELSE CONCAT('Validation failed: ', v_error_messages)
           END AS message;
END //

DELIMITER ;

-- ============================================
-- 7. HELPER: Get Available Resources for Date Range
-- ============================================
-- Returns list of available resources for a given date range

DELIMITER //

CREATE PROCEDURE IF NOT EXISTS GetAvailableResources(
    IN p_provider_id INT,
    IN p_resource_type VARCHAR(50),
    IN p_start_date DATE,
    IN p_end_date DATE
)
BEGIN
    SELECT 
        ra.resource_name,
        ra.capacity,
        ra.is_available,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM booking_dates bd
                JOIN bookings b ON bd.booking_id = b.booking_id
                WHERE bd.date BETWEEN p_start_date AND p_end_date
                  AND b.status IN ('pending', 'confirmed', 'in_progress')
                  AND ra.resource_name = (
                      SELECT resource_name FROM resource_availability 
                      WHERE booking_id = b.booking_id 
                      AND resource_type = p_resource_type
                      LIMIT 1
                  )
            ) THEN FALSE
            ELSE TRUE
        END AS is_available_for_range
    FROM resource_availability ra
    WHERE ra.provider_id = p_provider_id
      AND ra.resource_type = p_resource_type
      AND ra.date BETWEEN p_start_date AND p_end_date
    GROUP BY ra.resource_name, ra.capacity, ra.is_available
    HAVING is_available_for_range = TRUE;
END //

DELIMITER ;

-- ============================================
-- USAGE EXAMPLES
-- ============================================

-- Example 1: Check if Hall A is available for Dec 15-17
-- CALL CheckResourceAvailability(1, 'parlour', 'Hall A', '2024-12-15', '2024-12-17', '09:00:00', '18:00:00', NULL);

-- Example 2: Check if Premium Urn has stock
-- CALL CheckInventoryAvailability(5, 2, NULL); -- Check if 2 units of addon_id 5 are available

-- Example 3: Release expired reservations (run as cron job every 5 minutes)
-- CALL ReleaseExpiredReservations();

-- Example 4: Confirm inventory when booking is paid
-- CALL ConfirmInventory(123); -- Decrement stock for booking_id 123

-- ============================================
-- SETUP CRON JOB (Linux/Unix)
-- ============================================
-- Add to crontab (crontab -e):
-- */5 * * * * mysql -u your_user -p your_password your_database -e "CALL ReleaseExpiredReservations();"

-- ============================================
-- END OF PROCEDURES
-- ============================================

