<?php
/**
 * Central Router for Smart Funeral System Backend
 * 
 * This router centralizes:
 * - CORS headers
 * - Authentication middleware
 * - Request routing
 * - Error handling
 * 
 * Usage: All API requests should go through this router
 * Example: /api/login -> routes to login.php
 */

// Set CORS headers first
// Set CORS headers
$allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://your-production-domain.com'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    // Fallback for development if origin not in list (optional, can be strict)
    header("Access-Control-Allow-Origin: *"); 
}

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, ngrok-skip-browser-warning");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Include Database Connection
require_once __DIR__ . '/db_connect.php';

// Get the request path
$requestUri = $_SERVER['REQUEST_URI'];
$scriptName = $_SERVER['SCRIPT_NAME'];
$basePath = dirname($scriptName);

// Remove query string
$path = parse_url($requestUri, PHP_URL_PATH);

// Remove base path if running in subdirectory
if ($basePath !== '/') {
    $path = str_replace($basePath, '', $path);
}

// Remove leading/trailing slashes
$path = trim($path, '/');

// Route mapping
if ($path === 'api/login') {
    require_once __DIR__ . '/controllers/AuthController.php';
    $controller = new AuthController($conn);
    $controller->login();
    exit;
}

if ($path === 'api/register') {
    require_once __DIR__ . '/controllers/AuthController.php';
    $controller = new AuthController($conn);
    $controller->register();
    exit;
}

if ($path === 'api/booking/create') {
    require_once __DIR__ . '/controllers/BookingController.php';
    $controller = new BookingController($conn);
    $controller->create();
    exit;
}

if ($path === 'api/booking/manage') {
    require_once __DIR__ . '/controllers/BookingController.php';
    $controller = new BookingController($conn);
    $controller->manage();
    exit;
}

if ($path === 'api/booking/update') {
    require_once __DIR__ . '/controllers/BookingController.php';
    $controller = new BookingController($conn);
    $controller->updateStatus();
    exit;
}

if ($path === 'api/booking/cancel') {
    require_once __DIR__ . '/controllers/BookingController.php';
    $controller = new BookingController($conn);
    $controller->cancel();
    exit;
}

$routes = [
    // Authentication
    // 'api/login' => 'login.php', // Handled by Controller
    // 'api/register' => 'register.php', // Handled by Controller
    'api/refreshToken' => 'refreshToken.php',
    
    // User Management
    'api/user/bookings' => 'getUserBookings.php',
    'api/user/profile' => 'getFamilyProfile.php',
    'api/user/profile/update' => 'updateFamilyProfile.php',
    'api/user/delete' => 'deleteFamilyAccount.php',
    
    // Service Providers
    'api/providers' => 'getAllProviders.php',
    'api/providers/advanced' => 'getProvidersAdvanced.php',
    'api/provider/details' => 'getProviderDetails.php',
    'api/provider/profile' => 'getProviderProfile.php',
    'api/provider/profile/update' => 'updateProviderProfile.php',
    'api/provider/profile/create' => 'createProviderProfile.php',
    'api/provider/delete' => 'deleteProviderAccount.php',
    'api/provider/bookings' => 'getProviderBookings.php',
    'api/provider/dashboard' => 'getProviderDashboard.php',
    'api/provider/availability' => 'manageProviderAvailability.php',
    'api/provider/packages' => 'getPackages.php',
    'api/provider/packages/all' => 'getAllPackages.php',
    'api/provider/packages/add' => 'addPackage.php',
    'api/provider/packages/update' => 'managePackage.php',
    'api/provider/packages/delete' => 'deletePackage.php',
    'api/provider/addons' => 'getProviderAddons.php',
    'api/provider/addons/active' => 'getActiveAddons.php',
    'api/provider/addons/templates' => 'getAddonTemplates.php',
    'api/provider/addons/add' => 'addProviderAddon.php',
    'api/provider/addons/update' => 'updateProviderAddon.php',
    'api/provider/addons/delete' => 'deleteProviderAddon.php',
    'api/provider/ratings' => 'getPendingRatings.php',
    
    // Bookings
    // 'api/booking/create' => 'createBooking.php', // Handled by Controller
    // 'api/booking/cancel' => 'cancelBooking.php', // Handled by Controller
    // 'api/booking/update' => 'updateBookingStatus.php', // Handled by Controller
    // 'api/booking/manage' => 'manageBookings.php', // Handled by Controller
    'api/booking/check-availability' => 'checkAvailability.php',
    
    // Tributes
    'api/tributes' => 'getTributes.php',
    'api/tribute' => 'getTribute.php',
    'api/tribute/create' => 'createTribute.php',
    'api/tribute/update' => 'updateTribute.php',
    'api/tribute/search' => 'searchTributes.php',
    'api/tribute/find' => 'find_your_tribute.php',
    'api/tribute/photo/upload' => 'uploadTributePhoto.php',
    'api/tribute/photo/update' => 'updateTributeImage.php',
    'api/tribute/photo/delete' => 'deleteFamilyPhoto.php',
    'api/tribute/message/add' => 'addMessage.php',
    'api/tribute/message/delete' => 'deleteMessage.php',
    'api/tribute/rsvp/list' => 'getRSVPList.php',
    'api/tribute/rsvp/submit' => 'submitRSVP.php',
    'api/tribute/candle/light' => 'lightCandle.php',
    'api/tribute/flower/offer' => 'offerFlower.php',
    
    // Voice Memorials
    'api/voice/memorials' => 'getVoiceMemorials.php',
    'api/voice/memories' => 'getMemories.php',
    'api/voice/memories/save' => 'saveMemories.php',
    'api/voice/sample/upload' => 'uploadVoiceSample.php',
    'api/voice/settings/update' => 'updateVoiceSettings.php',
    'api/voice/chat' => 'voiceChatbot.php',
    'api/voice/clone' => 'elevenLabsVoiceClone.php',
    
    // AI Chatbot
    'api/chatbot' => 'chatbot.php',
    
    // File Uploads
    'api/upload/file' => 'uploadFile.php',
    'api/upload/files' => 'uploadFiles.php',
    
    // Ratings
    'api/rating/submit' => 'submitRating.php',
    
    // Learning
    'api/learning/log' => 'logLearningInteraction.php',
];

// Check if route exists
if (isset($routes[$path])) {
    $file = $routes[$path];
    $filePath = __DIR__ . '/' . $file;
    
    // Check if file exists
    if (file_exists($filePath)) {
        // Include the file (it will handle its own logic)
        require_once $filePath;
    } else {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Endpoint file not found: ' . $file
        ]);
    }
} else {
    // Try direct file access for backward compatibility
    // Remove 'api/' prefix if present
    $directPath = str_replace('api/', '', $path);
    $filePath = __DIR__ . '/' . $directPath . '.php';
    
    if (file_exists($filePath)) {
        require_once $filePath;
    } else {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Endpoint not found: /' . $path,
            'available_routes' => array_keys($routes)
        ]);
    }
}
?>

