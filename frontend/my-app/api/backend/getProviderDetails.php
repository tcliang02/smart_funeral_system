<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type"), ngrok-skip-browser-warning;
header("Content-Type: application/json");

include "db_connect.php";

$provider_id = $_GET['provider_id'] ?? null;

if (!$provider_id) {
    echo json_encode(["success" => false, "message" => "Missing provider_id parameter"]);
    exit;
}

try {
    // Get provider details with ratings
    $provider_sql = "SELECT 
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
                        u.username,
                        COALESCE(AVG(pr.rating), 0) as avg_rating,
                        COUNT(pr.rating) as review_count
                     FROM service_provider sp
                     LEFT JOIN users u ON sp.user_id = u.id
                     LEFT JOIN packages p ON sp.provider_id = p.provider_id
                     LEFT JOIN bookings b ON p.package_id = b.package_id
                     LEFT JOIN provider_reviews pr ON b.booking_id = pr.booking_id AND pr.review_type = 'customer_to_provider'
                     WHERE sp.provider_id = ?
                     GROUP BY sp.provider_id";
    
    $provider_stmt = $conn->prepare($provider_sql);
    $provider_stmt->bind_param("i", $provider_id);
    $provider_stmt->execute();
    $provider_result = $provider_stmt->get_result();
    
    if ($provider_result->num_rows === 0) {
        echo json_encode(["success" => false, "message" => "Provider not found"]);
        exit;
    }
    
    $provider = $provider_result->fetch_assoc();
    $provider['avg_rating'] = round($provider['avg_rating'], 1);
    
    // Get all packages for this provider
    $packages_sql = "SELECT 
                        package_id,
                        name,
                        description,
                        price,
                        is_featured,
                        duration_hours,
                        capacity,
                        location_type,
                        created_at,
                        (SELECT GROUP_CONCAT(feature_name SEPARATOR '|') 
                         FROM package_features pf 
                         WHERE pf.package_id = p.package_id) as features
                     FROM packages p
                     WHERE provider_id = ?
                     ORDER BY is_featured DESC, created_at DESC";
    
    $packages_stmt = $conn->prepare($packages_sql);
    $packages_stmt->bind_param("i", $provider_id);
    $packages_stmt->execute();
    $packages_result = $packages_stmt->get_result();
    
    $packages = [];
    while ($package_row = $packages_result->fetch_assoc()) {
        $package_row['features'] = $package_row['features'] ? explode('|', $package_row['features']) : [];
        $packages[] = $package_row;
    }
    
    // Get recent reviews
    $reviews_sql = "SELECT 
                        pr.rating,
                        pr.review_text,
                        u.name as reviewer_name,
                        pr.created_at
                    FROM provider_reviews pr
                    JOIN bookings b ON pr.booking_id = b.booking_id
                    JOIN packages p ON b.package_id = p.package_id
                    LEFT JOIN users u ON pr.reviewer_user_id = u.user_id
                    WHERE p.provider_id = ? AND pr.review_type = 'customer_to_provider'
                    ORDER BY pr.created_at DESC
                    LIMIT 10";
    
    $reviews_stmt = $conn->prepare($reviews_sql);
    $reviews_stmt->bind_param("i", $provider_id);
    $reviews_stmt->execute();
    $reviews_result = $reviews_stmt->get_result();
    
    $reviews = [];
    while ($review_row = $reviews_result->fetch_assoc()) {
        $reviews[] = $review_row;
    }
    
    // Get provider statistics
    $stats_sql = "SELECT 
                    COUNT(DISTINCT o.booking_id) as total_bookings,
                    COUNT(DISTINCT p.package_id) as total_packages,
                    AVG(p.price) as avg_package_price
                  FROM service_provider sp
                  LEFT JOIN packages p ON sp.provider_id = p.provider_id
                  LEFT JOIN bookings o ON p.package_id = o.package_id
                  WHERE sp.provider_id = ?";
    
    $stats_stmt = $conn->prepare($stats_sql);
    $stats_stmt->bind_param("i", $provider_id);
    $stats_stmt->execute();
    $stats_result = $stats_stmt->get_result();
    $stats = $stats_result->fetch_assoc();
    
    echo json_encode([
        "success" => true,
        "provider" => $provider,
        "packages" => $packages,
        "reviews" => $reviews,
        "statistics" => [
            "total_bookings" => intval($stats['total_bookings']),
            "total_packages" => intval($stats['total_packages']),
            "avg_package_price" => round($stats['avg_package_price'], 2)
        ]
    ]);
    
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}

$conn->close();
?>
