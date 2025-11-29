<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type"), ngrok-skip-browser-warning;
header("Content-Type: application/json");

include "db_connect.php";

$data = json_decode(file_get_contents("php://input"), true);
$provider_id = $data["provider_id"] ?? null;
$package_name = trim($data["package_name"] ?? "");
$description = trim($data["description"] ?? "");
$price = $data["price"] ?? null;

if (!$provider_id || empty($package_name) || $price === null) {
    echo json_encode(["success" => false, "message" => "Missing required fields."]);
    exit;
}

$stmt = $conn->prepare("
    INSERT INTO packages (provider_id, package_name, description, price)
    VALUES (?, ?, ?, ?)
");
$stmt->bind_param("issd", $provider_id, $package_name, $description, $price);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Package added successfully."]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to add package."]);
}

$stmt->close();
$conn->close();
?>

