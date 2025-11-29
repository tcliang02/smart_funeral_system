<?php
/**
 * CORS Configuration for Remote Access
 * Include this at the top of ALL PHP backend files
 */

// Allow requests from Vercel deployment
// ⚠️ UPDATE THIS after deploying to Vercel!
$allowed_origins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://smartfuneralsystem-qglcmdx5l-tan-chia-bi22-2712s-projects.vercel.app',  // ✅ Latest Vercel URL
    'https://smartfuneralsystem-6a3dfnof5-tan-chia-bi22-2712s-projects.vercel.app',
    'https://smartfuneralsystem-99ugp1ylc-tan-chia-bi22-2712s-projects.vercel.app',
    // Add more URLs if needed
];

// Get the origin from the request
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Check if origin is allowed OR allow all for ngrok testing
if (in_array($origin, $allowed_origins) || strpos($origin, 'vercel.app') !== false) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    // Fallback: allow all for ngrok testing
    header("Access-Control-Allow-Origin: *");
}

// Allow credentials (cookies, sessions)
header('Access-Control-Allow-Credentials: true');

// Allow these methods
header('Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE, PUT');

// Allow these headers
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With'), ngrok-skip-browser-warning;

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
?>

