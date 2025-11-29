<?php
require_once __DIR__ . '/BaseController.php';

class BookingController extends BaseController {

    public function create() {
        $data = $this->getJsonInput();
        
        // Validate required fields
        $required_fields = ['package_id', 'customer_name', 'customer_email', 'customer_phone', 'service_date'];
        foreach ($required_fields as $field) {
            if (empty($data[$field])) {
                return $this->jsonResponse(["success" => false, "message" => "Missing required field: $field"], 400);
            }
        }
        
        $package_id = $data['package_id'];
        $customer_name = $data['customer_name'];
        $customer_email = $data['customer_email'];
        $customer_phone = $data['customer_phone'];
        $service_date = $data['service_date'];
        $service_address = $data['service_address'] ?? '';
        $special_requirements = $data['special_requirements'] ?? '';
        $selected_addons = $data['selected_addons'] ?? [];
        $uploaded_files = $data['uploaded_files'] ?? null;
        $total_amount = floatval($data['total_amount']);
        $user_id = $data['user_id'] ?? null;
        $payment_method = $data['payment_method'] ?? null;
        
        try {
            $this->conn->begin_transaction();
            
            // Verify package exists
            $package_stmt = $this->conn->prepare("SELECT provider_id, name, price FROM packages WHERE package_id = :package_id");
            $package_stmt->execute(['package_id' => $package_id]);
            $package = $package_stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$package) {
                return $this->jsonResponse(["success" => false, "message" => "Package not found"], 404);
            }
            
            $provider_id = $package['provider_id'];
            
            // Prepare uploaded files JSON
            $uploaded_files_json = (!empty($uploaded_files) && is_array($uploaded_files)) ? json_encode($uploaded_files) : null;
            
            // Create booking
            $booking_sql = "INSERT INTO bookings 
                            (package_id, provider_id, user_id, customer_name, customer_email, customer_phone, 
                             service_date, service_address, special_requirements, total_amount, payment_method, uploaded_files, status) 
                            VALUES (:package_id, :provider_id, :user_id, :customer_name, :customer_email, :customer_phone, 
                                    :service_date, :service_address, :special_requirements, :total_amount, :payment_method, :uploaded_files, 'pending')";
            
            $booking_stmt = $this->conn->prepare($booking_sql);
            $booking_result = $booking_stmt->execute([
                'package_id' => $package_id,
                'provider_id' => $provider_id,
                'user_id' => $user_id,
                'customer_name' => $customer_name,
                'customer_email' => $customer_email,
                'customer_phone' => $customer_phone,
                'service_date' => $service_date,
                'service_address' => $service_address,
                'special_requirements' => $special_requirements,
                'total_amount' => $total_amount,
                'payment_method' => $payment_method,
                'uploaded_files' => $uploaded_files_json
            ]);
            
            if ($booking_result) {
                $booking_id = $this->conn->lastInsertId();
                
                // Add selected add-ons
                if (!empty($selected_addons) && is_array($selected_addons)) {
                    foreach ($selected_addons as $addon) {
                        $addon_name = $addon['addon_name'] ?? $addon['name'] ?? '';
                        $addon_price = $addon['price'] ?? 0;
                        $addon_id = $addon['addon_id'] ?? null;
                        
                        if (!empty($addon_name) && isset($addon_price)) {
                            if ($addon_id !== null) {
                                $addon_sql = "INSERT INTO booking_addons (booking_id, addon_id, addon_name, addon_price) VALUES (:booking_id, :addon_id, :addon_name, :addon_price)";
                                $addon_stmt = $this->conn->prepare($addon_sql);
                                $addon_stmt->execute([
                                    'booking_id' => $booking_id,
                                    'addon_id' => $addon_id,
                                    'addon_name' => $addon_name,
                                    'addon_price' => $addon_price
                                ]);
                            } else {
                                $addon_sql = "INSERT INTO booking_addons (booking_id, addon_name, addon_price) VALUES (:booking_id, :addon_name, :addon_price)";
                                $addon_stmt = $this->conn->prepare($addon_sql);
                                $addon_stmt->execute([
                                    'booking_id' => $booking_id,
                                    'addon_name' => $addon_name,
                                    'addon_price' => $addon_price
                                ]);
                            }
                        }
                    }
                }
                
                // Generate booking reference
                $booking_ref = "BK" . str_pad($booking_id, 6, "0", STR_PAD_LEFT);
                $update_ref_stmt = $this->conn->prepare("UPDATE bookings SET booking_reference = :booking_ref WHERE booking_id = :booking_id");
                $update_ref_stmt->execute(['booking_ref' => $booking_ref, 'booking_id' => $booking_id]);
                
                $this->conn->commit();
                
                return $this->jsonResponse([
                    "success" => true,
                    "message" => "Booking created successfully",
                    "booking_id" => $booking_id,
                    "booking_reference" => $booking_ref,
                    "package_name" => $package['name']
                ]);
                
            } else {
                throw new Exception("Failed to create booking record");
            }
            
        } catch (Exception $e) {
            $this->conn->rollback();
            error_log("Create Booking Error: " . $e->getMessage());
            return $this->jsonResponse(["success" => false, "message" => "Error: " . $e->getMessage()], 500);
        }
    }

    public function manage() {
        $data = $this->getJsonInput();
        $method = $_SERVER['REQUEST_METHOD'];

        if ($method === 'POST') {
            // Update booking status (Simple)
            $booking_id = $data['booking_id'] ?? null;
            $status = $data['status'] ?? null;
            $provider_notes = $data['provider_notes'] ?? '';
            
            if (!$booking_id || !$status) {
                return $this->jsonResponse(["success" => false, "message" => "Missing booking_id or status"], 400);
            }
            
            $valid_statuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
            if (!in_array($status, $valid_statuses)) {
                return $this->jsonResponse(["success" => false, "message" => "Invalid status"], 400);
            }
            
            try {
                $stmt = $this->conn->prepare("UPDATE bookings SET status = :status, provider_notes = :notes, updated_at = CURRENT_TIMESTAMP WHERE booking_id = :id");
                $result = $stmt->execute(['status' => $status, 'notes' => $provider_notes, 'id' => $booking_id]);
                
                if ($result) {
                    return $this->jsonResponse(["success" => true, "message" => "Booking status updated successfully"]);
                } else {
                    return $this->jsonResponse(["success" => false, "message" => "Failed to update booking status"], 500);
                }
            } catch (Exception $e) {
                return $this->jsonResponse(["success" => false, "message" => "Error: " . $e->getMessage()], 500);
            }
            
        } elseif ($method === 'PUT') {
            // Get bookings for provider
            $provider_id = $data['provider_id'] ?? null;
            $status_filter = $data['status'] ?? '';
            $page = max(1, intval($data['page'] ?? 1));
            $limit = min(50, max(1, intval($data['limit'] ?? 10)));
            $offset = ($page - 1) * $limit;
            
            if (!$provider_id) {
                return $this->jsonResponse(["success" => false, "message" => "Missing provider_id"], 400);
            }
            
            try {
                $sql = "SELECT b.*, p.name as package_name, p.price as package_price
                        FROM bookings b
                        JOIN packages p ON b.package_id = p.package_id
                        WHERE p.provider_id = :provider_id";
                
                $params = ['provider_id' => $provider_id];
                
                if (!empty($status_filter)) {
                    $sql .= " AND b.status = :status";
                    $params['status'] = $status_filter;
                }
                
                $sql .= " ORDER BY b.created_at DESC LIMIT :limit OFFSET :offset";
                // PDO limit/offset often need integer binding, but execute array treats as strings. 
                // For safety with some drivers, we might need bindValue, but for now let's try standard execute.
                // Actually, for LIMIT/OFFSET in PDO MySQL/PgSQL, direct injection in execute array works mostly, 
                // but strictly speaking bindValue(..., PDO::PARAM_INT) is safer. 
                // Given our PDOAdapter, let's stick to standard execute for simplicity unless it fails.
                
                // Re-writing query to avoid binding issues with LIMIT/OFFSET in some PDO drivers
                // We'll use direct interpolation for LIMIT/OFFSET since they are cast to int above.
                $sql = str_replace(":limit", $limit, $sql);
                $sql = str_replace(":offset", $offset, $sql);
                
                $stmt = $this->conn->prepare($sql);
                $stmt->execute($params);
                $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Fetch addons for each booking
                foreach ($bookings as &$booking) {
                    $addon_stmt = $this->conn->prepare("SELECT addon_name, addon_price FROM booking_addons WHERE booking_id = :id");
                    $addon_stmt->execute(['id' => $booking['booking_id']]);
                    $booking['addons'] = $addon_stmt->fetchAll(PDO::FETCH_ASSOC);
                }
                
                // Get total count
                $count_sql = "SELECT COUNT(*) as total 
                              FROM bookings b 
                              JOIN packages p ON b.package_id = p.package_id 
                              WHERE p.provider_id = :provider_id";
                if (!empty($status_filter)) {
                    $count_sql .= " AND b.status = :status";
                }
                
                $count_stmt = $this->conn->prepare($count_sql);
                $count_stmt->execute($params);
                $total_count = $count_stmt->fetch(PDO::FETCH_ASSOC)['total'];
                
                return $this->jsonResponse([
                    "success" => true,
                    "bookings" => $bookings,
                    "pagination" => [
                        "current_page" => $page,
                        "total_pages" => ceil($total_count / $limit),
                        "total_count" => $total_count,
                        "per_page" => $limit
                    ]
                ]);
                
            } catch (Exception $e) {
                return $this->jsonResponse(["success" => false, "message" => "Error: " . $e->getMessage()], 500);
            }
        }
    }

    public function updateStatus() {
        $data = $this->getJsonInput();
        
        if (empty($data['booking_id']) || empty($data['provider_id']) || empty($data['new_status'])) {
            return $this->jsonResponse(["success" => false, "message" => "Missing required fields"], 400);
        }
        
        $booking_id = intval($data['booking_id']);
        $provider_id = intval($data['provider_id']);
        $new_status = $data['new_status'];
        $provider_notes = $data['provider_notes'] ?? '';
        $cancellation_reason = $data['cancellation_reason'] ?? '';
        
        $valid_statuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
        if (!in_array($new_status, $valid_statuses)) {
            return $this->jsonResponse(["success" => false, "message" => "Invalid status"], 400);
        }
        
        try {
            $this->conn->begin_transaction();
            
            // Verify booking and ownership
            $verify_sql = "SELECT b.booking_id, b.status, b.total_amount, p.provider_id 
                           FROM bookings b
                           INNER JOIN packages p ON b.package_id = p.package_id
                           WHERE b.booking_id = :id";
            $verify_stmt = $this->conn->prepare($verify_sql);
            $verify_stmt->execute(['id' => $booking_id]);
            $booking = $verify_stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$booking) {
                return $this->jsonResponse(["success" => false, "message" => "Booking not found"], 404);
            }
            
            if ($booking['provider_id'] != $provider_id) {
                return $this->jsonResponse(["success" => false, "message" => "Permission denied"], 403);
            }
            
            $params = ['id' => $booking_id];
            $update_sql = "";
            
            if ($new_status === 'confirmed') {
                $update_sql = "UPDATE bookings SET status = 'confirmed', confirmed_at = NOW(), provider_notes = CONCAT(COALESCE(provider_notes, ''), '\n', :note) WHERE booking_id = :id";
                $params['note'] = $provider_notes ?: 'Booking confirmed by provider';
                
            } else if ($new_status === 'cancelled') {
                $refund_amount = $booking['total_amount'];
                $update_sql = "UPDATE bookings SET status = 'cancelled', cancellation_reason = :reason, cancelled_by = 'provider', cancelled_at = NOW(), refund_amount = :refund, provider_notes = CONCAT(COALESCE(provider_notes, ''), '\n', :note) WHERE booking_id = :id";
                $params['reason'] = $cancellation_reason ?: 'Cancelled by service provider';
                $params['refund'] = $refund_amount;
                $params['note'] = $provider_notes;
                
            } else {
                $update_sql = "UPDATE bookings SET status = :status, provider_notes = CONCAT(COALESCE(provider_notes, ''), '\n', :note) WHERE booking_id = :id";
                $params['status'] = $new_status;
                $params['note'] = $provider_notes;
            }
            
            $update_stmt = $this->conn->prepare($update_sql);
            if ($update_stmt->execute($params)) {
                $this->conn->commit();
                
                $response = [
                    "success" => true,
                    "message" => "Booking status updated to: $new_status",
                    "booking_id" => $booking_id,
                    "new_status" => $new_status
                ];
                
                if ($new_status === 'cancelled') {
                    $response['refund_amount'] = $booking['total_amount'];
                    $response['refund_percentage'] = 100;
                }
                
                return $this->jsonResponse($response);
            } else {
                throw new Exception("Failed to update booking status");
            }
            
        } catch (Exception $e) {
            $this->conn->rollback();
            error_log("Update Status Error: " . $e->getMessage());
            return $this->jsonResponse(["success" => false, "message" => "Error: " . $e->getMessage()], 500);
        }
    }

    public function cancel() {
        $data = $this->getJsonInput();
        
        if (empty($data['booking_id']) || empty($data['user_id'])) {
            return $this->jsonResponse(["success" => false, "message" => "Missing required fields"], 400);
        }
        
        $booking_id = intval($data['booking_id']);
        $user_id = intval($data['user_id']);
        $cancellation_reason = $data['cancellation_reason'] ?? 'Customer requested cancellation';
        
        try {
            $this->conn->begin_transaction();
            
            $verify_stmt = $this->conn->prepare("SELECT booking_id, total_amount, status, user_id FROM bookings WHERE booking_id = :id");
            $verify_stmt->execute(['id' => $booking_id]);
            $booking = $verify_stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$booking) {
                return $this->jsonResponse(["success" => false, "message" => "Booking not found"], 404);
            }
            
            if ($booking['user_id'] != $user_id) {
                return $this->jsonResponse(["success" => false, "message" => "Permission denied"], 403);
            }
            
            if ($booking['status'] === 'cancelled') {
                return $this->jsonResponse(["success" => false, "message" => "Already cancelled"], 400);
            }
            
            if ($booking['status'] === 'completed') {
                return $this->jsonResponse(["success" => false, "message" => "Cannot cancel completed booking"], 400);
            }
            
            $refund_amount = $booking['total_amount'] * 0.95;
            
            $cancel_sql = "UPDATE bookings SET status = 'cancelled', cancellation_reason = :reason, cancelled_by = 'customer', cancelled_at = NOW(), refund_amount = :refund WHERE booking_id = :id";
            $cancel_stmt = $this->conn->prepare($cancel_sql);
            
            if ($cancel_stmt->execute(['reason' => $cancellation_reason, 'refund' => $refund_amount, 'id' => $booking_id])) {
                $this->conn->commit();
                
                return $this->jsonResponse([
                    "success" => true,
                    "message" => "Booking cancelled successfully",
                    "booking_id" => $booking_id,
                    "refund_amount" => $refund_amount,
                    "refund_percentage" => 95
                ]);
            } else {
                throw new Exception("Failed to cancel booking");
            }
            
        } catch (Exception $e) {
            $this->conn->rollback();
            return $this->jsonResponse(["success" => false, "message" => "Error: " . $e->getMessage()], 500);
        }
    }
}
