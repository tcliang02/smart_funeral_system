<?php
// Add a new add-on for provider (from template or custom)
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type"), ngrok-skip-browser-warning;

include "db_connect.php";

$data = json_decode(file_get_contents("php://input"), true);

$provider_id = $data["provider_id"] ?? null;
$template_id = $data["template_id"] ?? null; // NULL if custom
$addon_name = $data["addon_name"] ?? null;
$description = $data["description"] ?? null;
$price = $data["price"] ?? null;
$category_id = $data["category_id"] ?? null;
$is_custom = $data["is_custom"] ?? 0;

if (!$provider_id || !$addon_name || $price === null || !$category_id) {
    echo json_encode([
        "success" => false,
        "message" => "Missing required fields: provider_id, addon_name, price, category_id"
    ]);
    exit;
}

// If using template, get template details
if ($template_id && !$is_custom) {
    $templateSql = "SELECT template_name, description FROM addon_templates WHERE template_id = ?";
    $stmt = $conn->prepare($templateSql);
    $stmt->bind_param("i", $template_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        // Use template data if not overridden
        if (!$addon_name) $addon_name = $row['template_name'];
        if (!$description) $description = $row['description'];
    }
    $stmt->close();
}

// Check if this addon already exists for this provider
$checkSql = "SELECT addon_id FROM provider_addons 
             WHERE provider_id = ? AND addon_name = ?";
$checkStmt = $conn->prepare($checkSql);
$checkStmt->bind_param("is", $provider_id, $addon_name);
$checkStmt->execute();
$checkResult = $checkStmt->get_result();

if ($checkResult->num_rows > 0) {
    echo json_encode([
        "success" => false,
        "message" => "Add-on with this name already exists for this provider"
    ]);
    $checkStmt->close();
    $conn->close();
    exit;
}
$checkStmt->close();

// Insert new provider add-on
$sql = "INSERT INTO provider_addons 
        (provider_id, template_id, addon_name, description, price, category_id, is_custom, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)";

$stmt = $conn->prepare($sql);
$stmt->bind_param("iissdii", $provider_id, $template_id, $addon_name, $description, $price, $category_id, $is_custom);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Add-on added successfully",
        "addon_id" => $conn->insert_id
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Error adding add-on: " . $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>

