<?php
/**
 * Get Family Profile
 * Retrieves profile information for family/attendee accounts
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once 'db_connect.php';
require_once 'helpers.php';

// Get user_id from query parameter or session
$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : null;

// If no user_id provided, try to get from session/token
if (!$user_id && isset($_SESSION['user_id'])) {
    $user_id = $_SESSION['user_id'];
}

if (!$user_id) {
    echo json_encode([
        'success' => false,
        'message' => 'User ID is required'
    ]);
    exit;
}

try {
    // Get user profile
    $sql = "SELECT 
                user_id,
                name,
                email,
                phone,
                address,
                profile_picture,
                role,
                is_active,
                created_at,
                updated_at
            FROM users 
            WHERE user_id = ? AND role IN ('family', 'attendee')";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Family profile not found'
        ]);
        exit;
    }
    
    $profile = $result->fetch_assoc();
    
    // Get additional statistics
    // Count tributes created by this user
    $sql_tributes = "SELECT COUNT(*) as tribute_count FROM tributes WHERE created_by = ?";
    $stmt_tributes = $conn->prepare($sql_tributes);
    $stmt_tributes->bind_param("i", $user_id);
    $stmt_tributes->execute();
    $tribute_result = $stmt_tributes->get_result();
    $tribute_data = $tribute_result->fetch_assoc();
    $profile['tribute_count'] = $tribute_data['tribute_count'];
    
    // Count bookings made by this user
    $sql_bookings = "SELECT COUNT(*) as booking_count FROM bookings WHERE user_id = ?";
    $stmt_bookings = $conn->prepare($sql_bookings);
    $stmt_bookings->bind_param("i", $user_id);
    $stmt_bookings->execute();
    $booking_result = $stmt_bookings->get_result();
    $booking_data = $booking_result->fetch_assoc();
    $profile['booking_count'] = $booking_data['booking_count'];
    
    // Format profile picture URL
    if ($profile['profile_picture']) {
        $profile['profile_picture_url'] = "http://localhost/smart_funeral_system/" . $profile['profile_picture'];
    } else {
        $profile['profile_picture_url'] = null;
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
