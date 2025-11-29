<?php
// Update an existing provider add-on
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, PUT");
header("Access-Control-Allow-Headers: Content-Type"), ngrok-skip-browser-warning;

include "db_connect.php";

$data = json_decode(file_get_contents("php://input"), true);

$addon_id = $data["addon_id"] ?? null;
$addon_name = $data["addon_name"] ?? null;
$description = $data["description"] ?? null;
$price = $data["price"] ?? null;
$is_active = $data["is_active"] ?? 1;

if (!$addon_id || !$addon_name || $price === null) {
    echo json_encode([
        "success" => false,
        "message" => "Missing required fields: addon_id, addon_name, price"
    ]);
    exit;
}

$sql = "UPDATE provider_addons 
        SET addon_name = ?, 
            description = ?, 
            price = ?, 
            is_active = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE addon_id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ssdii", $addon_name, $description, $price, $is_active, $addon_id);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Add-on updated successfully"
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Error updating add-on: " . $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>

