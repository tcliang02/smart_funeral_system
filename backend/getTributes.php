<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, ngrok-skip-browser-warning");
header("Content-Type: application/json");
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");

include "db_connect.php";
include "helpers.php";

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get tributes - public ones or user's own if authenticated
$headers = getallheaders();
$auth = verifyAuth($headers);

// Default query for public tributes only
$query = "SELECT t.*, u.name as created_by 
          FROM tributes t
          LEFT JOIN users u ON t.created_by = u.user_id
          WHERE t.is_public = 1";
$params = [];
$types = "";

// If authenticated, also show user's private tributes
if ($auth && isset($auth['user_id'])) {
    $query = "SELECT t.*, u.name as created_by 
              FROM tributes t
              LEFT JOIN users u ON t.created_by = u.user_id
              WHERE t.is_public = 1 OR t.created_by = ?";
    $params[] = $auth['user_id'];
    $types = "i";
}

// Add search functionality
if (isset($_GET['search']) && !empty($_GET['search'])) {
    $search = "%" . sanitize($_GET['search']) . "%";
    $query .= " AND (t.deceased_name LIKE ? OR t.biography LIKE ?)";
    $params[] = $search;
    $params[] = $search;
    $types .= "ss";
}

// Add sorting
$query .= " ORDER BY t.created_at DESC";

// Execute query using helper function
$rows = executeQuery($conn, $query, $params);

$tributes = [];
foreach ($rows as $row) {
    // Calculate days since passing if death_date is available
    $daysSincePassing = null;
    if (!empty($row['death_date'])) {
        $deathDate = new DateTime($row['death_date']);
        $now = new DateTime();
        $interval = $now->diff($deathDate);
        $daysSincePassing = $interval->days;
    }
    
    $tribute = [
        'id' => $row['tribute_id'],
        'name' => $row['deceased_name'],
        'birth_date' => $row['birth_date'],
        'death_date' => $row['death_date'],
        'photo_url' => $row['photo_url'] ?? '/images/default_memorial.jpg',
        'biography' => $row['biography'],
        'is_public' => (bool)$row['is_public'],
        'created_by' => $row['created_by'],
        'created_at' => $row['created_at'],
        'days_since_passing' => $daysSincePassing
    ];
    
    $tributes[] = $tribute;
}

echo json_encode([
    'success' => true,
    'count' => count($tributes),
    'tributes' => $tributes
]);

// Close connection only for mysqli
if (!($conn instanceof PDO)) {
    $conn->close();
}
?>
