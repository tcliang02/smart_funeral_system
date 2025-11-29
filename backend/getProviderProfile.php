<?php
/**
 * Get Provider Profile
 * Retrieves comprehensive provider profile information
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type'), ngrok-skip-browser-warning;

require_once 'db_connect.php';

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get provider_id from GET or POST
$provider_id = null;

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $provider_id = isset($_GET['provider_id']) ? intval($_GET['provider_id']) : null;
} else {
    $data = json_decode(file_get_contents("php://input"), true);
    $provider_id = isset($data['provider_id']) ? intval($data['provider_id']) : null;
    
    // Also try user_id for backward compatibility
    if (!$provider_id && isset($data['user_id'])) {
        $user_id = intval($data['user_id']);
        // Get provider_id from user_id
        $sql = "SELECT provider_id FROM service_provider WHERE user_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $provider_id = $row['provider_id'];
        }
    }
}

if (!$provider_id) {
    echo json_encode([
        'success' => false,
        'message' => 'Provider ID is required'
    ]);
    exit;
}

try {
    // Get comprehensive provider profile with calculated average rating
    $sql = "SELECT 
                sp.provider_id,
                sp.user_id,
                sp.company_name,
                sp.business_type,
                sp.business_registration,
                sp.description,
                sp.address,
                sp.city,
                sp.state,
                sp.postal_code,
                sp.phone,
                sp.email,
                sp.website,
                sp.logo,
                sp.operating_hours,
                sp.services_offered,
                sp.facebook_url,
                sp.instagram_url,
                COALESCE(AVG(pr.rating), 0) as rating,
                COUNT(pr.review_id) as total_reviews,
                sp.is_verified,
                sp.is_active,
                sp.created_at,
                sp.updated_at,
                u.name as user_name,
                u.email as user_email
            FROM service_provider sp
            LEFT JOIN users u ON sp.user_id = u.user_id
            LEFT JOIN provider_reviews pr ON sp.provider_id = pr.provider_id
            WHERE sp.provider_id = ?
            GROUP BY sp.provider_id";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $provider_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Provider not found'
        ]);
        exit;
    }
    
    $profile = $result->fetch_assoc();
    
    // Count total packages
    $sql_packages = "SELECT COUNT(*) as package_count FROM packages WHERE provider_id = ? AND is_active = TRUE";
    $stmt_packages = $conn->prepare($sql_packages);
    $stmt_packages->bind_param("i", $provider_id);
    $stmt_packages->execute();
    $package_result = $stmt_packages->get_result();
    $package_data = $package_result->fetch_assoc();
    $profile['package_count'] = $package_data['package_count'];
    
    // Count total bookings
    $sql_bookings = "SELECT COUNT(*) as booking_count FROM bookings WHERE provider_id = ?";
    $stmt_bookings = $conn->prepare($sql_bookings);
    $stmt_bookings->bind_param("i", $provider_id);
    $stmt_bookings->execute();
    $booking_result = $stmt_bookings->get_result();
    $booking_data = $booking_result->fetch_assoc();
    $profile['booking_count'] = $booking_data['booking_count'];
    
    // Format logo URL
    if ($profile['logo']) {
        $profile['logo_url'] = "http://localhost/smart_funeral_system/" . $profile['logo'];
    } else {
        $profile['logo_url'] = null;
    }
    
    // Parse services_offered if JSON
    if ($profile['services_offered']) {
        $decoded = json_decode($profile['services_offered'], true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            $profile['services_offered'] = $decoded;
        }
    }
    
    echo json_encode([
        'success' => true,
        'profile' => $profile
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error retrieving profile: ' . $e->getMessage()
    ]);
}

$conn->close();
?>

