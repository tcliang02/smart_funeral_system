<?php
// Delete a provider add-on
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, DELETE");
header("Access-Control-Allow-Headers: Content-Type"), ngrok-skip-browser-warning;

include "db_connect.php";

$data = json_decode(file_get_contents("php://input"), true);
$addon_id = $data["addon_id"] ?? null;

if (!$addon_id) {
    echo json_encode(["success" => false, "message" => "Missing addon_id"]);
    exit;
}

$sql = "DELETE FROM provider_addons WHERE addon_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $addon_id);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Add-on deleted successfully"
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Error deleting add-on: " . $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>

