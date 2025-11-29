<?php
ob_start(); // Start output buffering
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type"), ngrok-skip-browser-warning;
header("Content-Type: application/json");

include "db_connect.php";

$user_id = $_GET['user_id'] ?? null;

if (!$user_id) {
    echo json_encode(["success" => false, "message" => "Missing user_id parameter"]);
    exit;
}

try {
    // Get provider dashboard data
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
                        COUNT(DISTINCT pr.review_id) as review_count
                     FROM service_provider sp
                     LEFT JOIN users u ON sp.user_id = u.id
                     LEFT JOIN packages p ON sp.provider_id = p.provider_id
                     LEFT JOIN bookings b ON p.package_id = b.package_id
                     LEFT JOIN provider_reviews pr ON b.booking_id = pr.booking_id AND pr.review_type = 'customer_to_provider'
                     WHERE sp.user_id = ?
                     GROUP BY sp.provider_id";
    
    $provider_stmt = $conn->prepare($provider_sql);
    $provider_stmt->bind_param("i", $user_id);
    $provider_stmt->execute();
    $provider_result = $provider_stmt->get_result();
    
    if ($provider_result->num_rows === 0) {
        echo json_encode(["success" => false, "message" => "Provider profile not found"]);
        exit;
    }
    
    $provider = $provider_result->fetch_assoc();
    $provider_id = $provider['provider_id'];
    
    // Debug logging
    error_log("getProviderDashboard: user_id=$user_id, provider_id=$provider_id");
    $provider['avg_rating'] = round($provider['avg_rating'], 1);
    
    // Get recent bookings
    $bookings_sql = "SELECT 
                        b.booking_id,
                        b.customer_name,
                        b.customer_email,
                        b.customer_phone,
                        b.service_date,
                        b.total_amount,
                        b.status,
                        b.created_at,
                        p.name as package_name
                     FROM bookings b
                     LEFT JOIN packages p ON b.package_id = p.package_id
                     WHERE p.provider_id = ?
                     ORDER BY b.created_at DESC
                     LIMIT 10";
    
    $bookings_stmt = $conn->prepare($bookings_sql);
    $bookings_stmt->bind_param("i", $provider_id);
    $bookings_stmt->execute();
    $bookings_result = $bookings_stmt->get_result();
    
    $recent_bookings = [];
    while ($booking_row = $bookings_result->fetch_assoc()) {
        $recent_bookings[] = $booking_row;
    }
    
    // Get monthly statistics
    $monthly_stats_sql = "SELECT 
                            MONTH(b.created_at) as month,
                            YEAR(b.created_at) as year,
                            COUNT(*) as booking_count,
                            SUM(b.total_amount) as total_revenue
                          FROM bookings b
                          LEFT JOIN packages p ON b.package_id = p.package_id
                          WHERE p.provider_id = ? AND b.created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                          GROUP BY YEAR(b.created_at), MONTH(b.created_at)
                          ORDER BY year DESC, month DESC";
    
    $monthly_stmt = $conn->prepare($monthly_stats_sql);
    $monthly_stmt->bind_param("i", $provider_id);
    $monthly_stmt->execute();
    $monthly_result = $monthly_stmt->get_result();
    
    $monthly_stats = [];
    while ($month_row = $monthly_result->fetch_assoc()) {
        $monthly_stats[] = $month_row;
    }
    
    // Get recent reviews with customer information
    $reviews_sql = "SELECT 
                        pr.review_id,
                        pr.rating,
                        pr.review_text,
                        pr.review_category,
                        pr.created_at,
                        u.username as reviewer_name,
                        u.email as reviewer_email,
                        b.booking_id,
                        b.customer_name,
                        pkg.name as package_name
                    FROM provider_reviews pr
                    JOIN bookings b ON pr.booking_id = b.booking_id
                    JOIN packages pkg ON b.package_id = pkg.package_id
                    JOIN users u ON pr.reviewer_user_id = u.id
                    WHERE pkg.provider_id = ? AND pr.review_type = 'customer_to_provider'
                    ORDER BY pr.created_at DESC
                    LIMIT 10";
    
    $reviews_stmt = $conn->prepare($reviews_sql);
    $reviews_stmt->bind_param("i", $provider_id);
    $reviews_stmt->execute();
    $reviews_result = $reviews_stmt->get_result();
    
    $recent_reviews = [];
    while ($review_row = $reviews_result->fetch_assoc()) {
        $recent_reviews[] = $review_row;
    }

    // Get overall statistics
    $stats_sql = "SELECT 
                    COUNT(DISTINCT b.booking_id) as total_bookings,
                    COUNT(DISTINCT p.package_id) as total_packages,
                    COALESCE(SUM(b.total_amount), 0) as total_revenue,
                    COUNT(DISTINCT CASE WHEN b.status = 'pending' THEN b.booking_id END) as pending_bookings,
                    COUNT(DISTINCT CASE WHEN b.status = 'confirmed' THEN b.booking_id END) as confirmed_bookings,
                    COUNT(DISTINCT CASE WHEN b.status = 'completed' THEN b.booking_id END) as completed_bookings
                  FROM service_provider sp
                  LEFT JOIN packages p ON sp.provider_id = p.provider_id
                  LEFT JOIN bookings b ON p.package_id = b.package_id
                  WHERE sp.provider_id = ?";
    
    $stats_stmt = $conn->prepare($stats_sql);
    $stats_stmt->bind_param("i", $provider_id);
    $stats_stmt->execute();
    $stats_result = $stats_stmt->get_result();
    $stats = $stats_result->fetch_assoc();
    
    // Get packages with booking counts and all available fields
    $packages_sql = "SELECT 
                        p.*,
                        COUNT(b.booking_id) as booking_count
                     FROM packages p
                     LEFT JOIN bookings b ON p.package_id = b.package_id
                     WHERE p.provider_id = ?
                     GROUP BY p.package_id
                     ORDER BY p.is_featured DESC, p.created_at DESC";
    
    $packages_stmt = $conn->prepare($packages_sql);
    $packages_stmt->bind_param("i", $provider_id);
    $packages_stmt->execute();
    $packages_result = $packages_stmt->get_result();
    
    $packages = [];
    while ($package_row = $packages_result->fetch_assoc()) {
        // Get features for this package if they exist
        $features = [];
        $features_sql = "SELECT feature_id, package_id, feature_name FROM package_features WHERE package_id = ?";
        if ($conn->query("SHOW TABLES LIKE 'package_features'")->num_rows > 0) {
            $features_stmt = $conn->prepare($features_sql);
            $features_stmt->bind_param("i", $package_row['package_id']);
            $features_stmt->execute();
            $features_result = $features_stmt->get_result();
            
            while ($feature_row = $features_result->fetch_assoc()) {
                // Ensure we're returning a consistent structure
                $features[] = [
                    'feature_id' => $feature_row['feature_id'],
                    'package_id' => $feature_row['package_id'],
                    'feature_name' => $feature_row['feature_name']
                ];
            }
        }
        
        // Add debug logging for features
        error_log("Features for package ID " . $package_row['package_id'] . ": " . json_encode($features));
        
        $package_row['features'] = $features;
        $packages[] = $package_row;
    }
    
    // Debug logging
    error_log("getProviderDashboard: Found " . count($packages) . " packages for provider_id=$provider_id");
    
    // Calculate real revenue growth percentage
    $revenue_growth = 0;
    if (count($monthly_stats) >= 2) {
        $current_month_revenue = floatval($monthly_stats[0]['total_revenue'] ?? 0);
        $previous_month_revenue = floatval($monthly_stats[1]['total_revenue'] ?? 0);
        
        if ($previous_month_revenue > 0) {
            $revenue_growth = (($current_month_revenue - $previous_month_revenue) / $previous_month_revenue) * 100;
        } else if ($current_month_revenue > 0) {
            $revenue_growth = 100; // First month with revenue
        }
    }
    
    // Clean output buffer before sending JSON
    ob_clean();
    
    echo json_encode([
        "success" => true,
        "data" => [
            "stats" => [
                "totalBookings" => intval($stats['total_bookings']),
                "pendingBookings" => intval($stats['pending_bookings']),
                "completedBookings" => intval($stats['completed_bookings']),
                "totalRevenue" => floatval($stats['total_revenue']),
                "averageRating" => floatval($provider['avg_rating']),
                "totalReviews" => intval($provider['review_count']),
                "revenueGrowth" => round($revenue_growth, 1)
            ],
            "recentBookings" => $recent_bookings,
            "recentReviews" => $recent_reviews,
            "monthlyRevenue" => $monthly_stats,
            "packages" => $packages
        ]
    ]);
    exit;
    
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}

$conn->close();
?>
