<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type"), ngrok-skip-browser-warning;
header("Content-Type: application/json");

include "db_connect.php";
include "helpers.php";

// Get request data
$data = json_decode(file_get_contents("php://input"), true);
$user_id = $data['user_id'] ?? null;

if (!$user_id) {
    echo json_encode(["success" => false, "message" => "user_id required"]);
    exit;
}

try {
    // Get user data from database
    $sql = "SELECT user_id, name, username, email, role FROM users WHERE user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode(["success" => false, "message" => "User not found"]);
        exit;
    }
    
    $user = $result->fetch_assoc();
    
    // Ensure user has both id and user_id fields
    if (empty($user['id'])) {
        $user['id'] = $user['user_id'];
    }
    if (empty($user['username'])) {
        $user['username'] = $user['name'];
    }
    
    // Generate new token with correct structure
    $tokenData = [
        'id' => $user['id'],
        'user_id' => $user['user_id'],
        'username' => $user['username'],
        'name' => $user['name'],
        'email' => $user['email'],
        'role' => $user['role']
    ];
    
    $token = generateToken($tokenData, 86400); // 24 hours
    
    // Return token and user data
    echo json_encode([
        "success" => true,
        "message" => "Token refreshed successfully",
        "token" => $token,
        "user" => $tokenData
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}
?>
