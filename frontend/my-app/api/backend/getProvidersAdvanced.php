<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type"), ngrok-skip-browser-warning;
header("Content-Type: application/json");

include "db_connect.php";

// Get query parameters for filtering
$location = $_GET['location'] ?? '';
$min_price = $_GET['min_price'] ?? 0;
$max_price = $_GET['max_price'] ?? 999999;
$rating = $_GET['rating'] ?? 0;
$page = max(1, intval($_GET['page'] ?? 1));
$limit = min(50, max(1, intval($_GET['limit'] ?? 10)));
$offset = ($page - 1) * $limit;

try {
    // Build the base query
    $sql = "SELECT 
                sp.provider_id,
                sp.company_name,
                sp.address,
                sp.phone,
                sp.description,
                sp.website,
                sp.logo_url,
                sp.average_price,
                sp.total_packages,
                sp.created_at,
                u.email,
                COUNT(p.package_id) as package_count,
                COALESCE(AVG(pr.rating), 0) as avg_rating,
                COUNT(pr.rating) as review_count
            FROM service_provider sp
            LEFT JOIN users u ON sp.user_id = u.id
            LEFT JOIN packages p ON sp.provider_id = p.provider_id
            LEFT JOIN bookings b ON p.package_id = b.package_id
            LEFT JOIN provider_reviews pr ON b.booking_id = pr.booking_id AND pr.review_type = 'customer_to_provider'
            WHERE 1=1";
    
    $params = [];
    $types = "";
    
    // Add filters
    if (!empty($location)) {
        $sql .= " AND sp.address LIKE ?";
        $params[] = "%$location%";
        $types .= "s";
    }
    
    if ($min_price > 0) {
        $sql .= " AND sp.average_price >= ?";
        $params[] = $min_price;
        $types .= "d";
    }
    
    if ($max_price < 999999) {
        $sql .= " AND sp.average_price <= ?";
        $params[] = $max_price;
        $types .= "d";
    }
    
    $sql .= " GROUP BY sp.provider_id";
    
    if ($rating > 0) {
        $sql .= " HAVING avg_rating >= ?";
        $params[] = $rating;
        $types .= "d";
    }
    
    $sql .= " ORDER BY sp.created_at DESC LIMIT ? OFFSET ?";
    $params[] = $limit;
    $params[] = $offset;
    $types .= "ii";
    
    // Execute main query
    $stmt = $conn->prepare($sql);
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();
    
    $providers = [];
    while ($row = $result->fetch_assoc()) {
        // Get recent packages for each provider
        $package_sql = "SELECT package_id, name, price, description, 
                              duration_hours, capacity, location_type, is_featured
                       FROM packages 
                       WHERE provider_id = ? 
                       ORDER BY created_at DESC 
                       LIMIT 3";
        $package_stmt = $conn->prepare($package_sql);
        $package_stmt->bind_param("i", $row['provider_id']);
        $package_stmt->execute();
        $package_result = $package_stmt->get_result();
        
        $packages = [];
        while ($package_row = $package_result->fetch_assoc()) {
            $packages[] = $package_row;
        }
        
        $row['featured_packages'] = $packages;
        $row['avg_rating'] = round($row['avg_rating'], 1);
        $providers[] = $row;
    }
    
    // Get total count for pagination
    $count_sql = "SELECT COUNT(DISTINCT sp.provider_id) as total
                  FROM service_provider sp
                  LEFT JOIN packages p ON sp.provider_id = p.provider_id
                  LEFT JOIN bookings b ON p.package_id = b.package_id
                  LEFT JOIN provider_reviews pr ON b.booking_id = pr.booking_id AND pr.review_type = 'customer_to_provider'
                  WHERE 1=1";
    
    $count_params = [];
    $count_types = "";
    
    if (!empty($location)) {
        $count_sql .= " AND sp.address LIKE ?";
        $count_params[] = "%$location%";
        $count_types .= "s";
    }
    
    if ($min_price > 0) {
        $count_sql .= " AND sp.average_price >= ?";
        $count_params[] = $min_price;
        $count_types .= "d";
    }
    
    if ($max_price < 999999) {
        $count_sql .= " AND sp.average_price <= ?";
        $count_params[] = $max_price;
        $count_types .= "d";
    }
    
    if ($rating > 0) {
        $count_sql .= " GROUP BY sp.provider_id HAVING AVG(r.rating) >= ?";
        $count_params[] = $rating;
        $count_types .= "d";
    }
    
    $count_stmt = $conn->prepare($count_sql);
    if (!empty($count_params)) {
        $count_stmt->bind_param($count_types, ...$count_params);
    }
    $count_stmt->execute();
    $count_result = $count_stmt->get_result();
    $total_count = $count_result->num_rows;
    
    echo json_encode([
        "success" => true,
        "providers" => $providers,
        "pagination" => [
            "current_page" => $page,
            "total_pages" => ceil($total_count / $limit),
            "total_count" => $total_count,
            "per_page" => $limit
        ]
    ]);
    
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}

$conn->close();
?>
