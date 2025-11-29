<?php
// 🔥 CORS Headers FIRST - before anything else
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
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
$password = $data["password"] ?? "";
$role = sanitize($data["role"] ?? "");

// Validation
if (empty($username) || empty($password)) {
    echo json_encode(["success" => false, "message" => "Please fill in all fields."]);
    exit;
}

// Check if using PDO (PostgreSQL) or mysqli (MySQL)
$isPDO = $conn instanceof PDO;

try {
    // Query by role if provided
    if (!empty($role)) {
        if ($isPDO) {
            $stmt = $conn->prepare("SELECT * FROM users WHERE name = :username AND role = :role");
            $stmt->execute(['username' => $username, 'role' => $role]);
            $user = $stmt->fetch();
        } else {
            $stmt = $conn->prepare("SELECT * FROM users WHERE name = ? AND role = ?");
            $stmt->bind_param("ss", $username, $role);
            $stmt->execute();
            $result = $stmt->get_result();
            $user = $result->fetch_assoc();
        }
    } else {
        if ($isPDO) {
            $stmt = $conn->prepare("SELECT * FROM users WHERE name = :username");
            $stmt->execute(['username' => $username]);
            $user = $stmt->fetch();
        } else {
            $stmt = $conn->prepare("SELECT * FROM users WHERE name = ?");
            $stmt->bind_param("s", $username);
            $stmt->execute();
            $result = $stmt->get_result();
            $user = $result->fetch_assoc();
        }
    }

    if ($user && password_verify($password, $user["password"])) {
        // Create user data for token
        $userData = [
            "user_id" => $user["user_id"],
            "name" => $user["name"],
            "email" => $user["email"],
            "role" => $user["role"]
        ];

        // Generate JWT token
        $token = generateToken($userData);

        // ✅ If provider, fetch their provider details
        $provider = null;
        if ($user["role"] === "provider") {
            $provider = getProviderByUserId($conn, $user["user_id"]);
        }

        echo json_encode([
            "success" => true,
            "message" => "Login successful",
            "token" => $token,
            "user" => [
                "user_id" => $user["user_id"],
                "name" => $user["name"],
                "role" => $user["role"],
                "email" => $user["email"]
            ],
            "provider" => $provider
        ]);

    } else {
        echo json_encode(["success" => false, "message" => $user ? "Invalid password." : "User not found."]);
    }

    if (!$isPDO) {
        $stmt->close();
        $conn->close();
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
}
?>
