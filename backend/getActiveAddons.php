<?php
// Get active add-ons for a specific provider (for customer to see during checkout)
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");

include "db_connect.php";

$provider_id = $_GET["provider_id"] ?? null;

if (!$provider_id) {
    echo json_encode(["success" => false, "message" => "Missing provider_id parameter"]);
    exit;
}

// Get active add-ons grouped by category
$sql = "SELECT 
          pa.addon_id,
          pa.addon_name,
          pa.description,
          pa.price,
          pa.is_custom,
          c.category_id,
          c.category_name
        FROM provider_addons pa
        JOIN addon_categories c ON pa.category_id = c.category_id
        WHERE pa.provider_id = ? AND pa.is_active = 1
        ORDER BY c.display_order, pa.addon_name";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $provider_id);
$stmt->execute();
$result = $stmt->get_result();

$categories = [];
while ($row = $result->fetch_assoc()) {
    $category_id = $row['category_id'];
    $category_name = $row['category_name'];
    
    if (!isset($categories[$category_id])) {
        $categories[$category_id] = [
            'category_id' => $category_id,
            'category_name' => $category_name,
            'addons' => []
        ];
    }
    
    $categories[$category_id]['addons'][] = [
        'addon_id' => $row['addon_id'],
        'addon_name' => $row['addon_name'],
        'description' => $row['description'],
        'price' => $row['price'],
        'is_custom' => $row['is_custom']
    ];
}

echo json_encode([
    "success" => true,
    "categories" => array_values($categories)
]);

$stmt->close();
$conn->close();
?>
