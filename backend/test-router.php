<?php
/**
 * Test Script for Central Router
 * 
 * This script tests the router functionality
 * Run this from command line or browser
 */

// Simulate different request paths
$testRoutes = [
    'api/login',
    'api/providers',
    'api/booking/create',
    'api/tribute/create',
    'api/nonexistent',
];

echo "=== Testing Central Router ===\n\n";

echo "Router file exists: " . (file_exists(__DIR__ . '/index.php') ? '✅' : '❌') . "\n";
echo "Routes defined: " . count($testRoutes) . "\n\n";

// Check if routes file exists
$routerFile = __DIR__ . '/index.php';
if (!file_exists($routerFile)) {
    echo "❌ Router file not found!\n";
    exit(1);
}

// Read router file to check route definitions
$routerContent = file_get_contents($routerFile);
$routeCount = substr_count($routerContent, '=>');

echo "Routes in router: ~$routeCount\n\n";

echo "Test Routes:\n";
foreach ($testRoutes as $route) {
    $exists = strpos($routerContent, "'$route'") !== false;
    echo "  $route: " . ($exists ? '✅' : '❌') . "\n";
}

echo "\n=== Router Test Complete ===\n";
echo "\nTo test the router in action:\n";
echo "1. Start your web server\n";
echo "2. Access: http://localhost/backend/api/login\n";
echo "3. Or use curl: curl -X POST http://localhost/backend/api/login -H 'Content-Type: application/json' -d '{\"username\":\"test\",\"password\":\"test\"}'\n";
?>

