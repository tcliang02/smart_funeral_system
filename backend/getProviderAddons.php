<?php
// Get all add-ons for a specific provider
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type"), ngrok-skip-browser-warning;

include "db_connect.php";

$data = json_decode(file_get_contents("php://input"), true);
$provider_id = $data["provider_id"] ?? null;

if (!$provider_id) {
    echo json_encode(["success" => false, "message" => "Missing provider_id"]);
    exit;
}

// Get provider's add-ons with category information
$sql = "SELECT 
          pa.addon_id,
          pa.provider_id,
          pa.template_id,
          pa.addon_name,
          pa.description,
          pa.price,
          pa.category_id,
          pa.is_active,
          pa.is_custom,
          c.category_name,
          at.template_name
        FROM provider_addons pa
        JOIN addon_categories c ON pa.category_id = c.category_id
        LEFT JOIN addon_templates at ON pa.template_id = at.template_id
        WHERE pa.provider_id = ?
        ORDER BY c.display_order, pa.addon_name";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $provider_id);
$stmt->execute();
$result = $stmt->get_result();

$addons = [];
while ($row = $result->fetch_assoc()) {
    $addons[] = $row;
}

echo json_encode([
    "success" => true,
    "addons" => $addons
]);

$stmt->close();
$conn->close();
?>

