<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, ngrok-skip-browser-warning");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include "db_connect.php";
include "helpers.php";

$data = json_decode(file_get_contents("php://input"), true);

$username = sanitize($data["username"] ?? "");
$email = sanitize($data["email"] ?? "");
$password = $data["password"] ?? "";
$requestedRole = sanitize($data["role"] ?? "guest");

// Valid roles for Smart Funeral System (3 ROLES ONLY):
// - family: Family Member - Can access ALL 3 AI systems + create tributes
// - guest: Public visitor - Can ONLY access AI Assistant (website help)
// - provider: Service Provider - Can ONLY access AI Assistant + manage services
$validRoles = ["family", "guest", "provider"];
$role = in_array($requestedRole, $validRoles) ? $requestedRole : "guest";

if (empty($username) || empty($email) || empty($password)) {
    echo json_encode(["success" => false, "message" => "All fields are required."]);
    exit;
}

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "message" => "Invalid email format."]);
    exit;
}

// Validate password strength (at least 6 characters)
if (strlen($password) < 6) {
    echo json_encode(["success" => false, "message" => "Password must be at least 6 characters."]);
    exit;
}

// ✅ Check if name or email already exists
$check = $conn->prepare("SELECT * FROM users WHERE name = ? OR email = ?");
$check->bind_param("ss", $username, $email);
$check->execute();
$result = $check->get_result();

if ($result->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "Username or email already exists."]);
    exit;
}

// ✅ Secure password
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// ✅ Insert into users table (using 'name' column, not 'username')
$stmt = $conn->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $username, $email, $hashed_password, $role);

if ($stmt->execute()) {
    $user_id = $stmt->insert_id; // Get the newly created user ID

    // ✅ If the user is a service provider, insert into service_provider table
    if ($role === "provider") {
        $provider_stmt = $conn->prepare("
            INSERT INTO service_provider (user_id, company_name, phone, email, is_active)
            VALUES (?, ?, '', ?, 1)
        ");
        $provider_stmt->bind_param("iss", $user_id, $username, $email);
        $provider_stmt->execute();
        $provider_stmt->close();
    }

    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => "Registration failed."]);
}

$stmt->close();
$conn->close();
?>
