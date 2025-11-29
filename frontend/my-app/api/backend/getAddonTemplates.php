<?php
// Get all add-on categories and templates for provider to browse
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");

include "db_connect.php";

// Get all categories with their templates
$sql = "SELECT 
          c.category_id,
          c.category_name,
          c.description,
          c.display_order
        FROM addon_categories c
        ORDER BY c.display_order";

$result = $conn->query($sql);
$categories = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $category_id = $row['category_id'];
        
        // Get templates for this category
        $templateSql = "SELECT 
                          template_id,
                          template_name,
                          description,
                          suggested_price,
                          is_popular,
                          category_id
                        FROM addon_templates
                        WHERE category_id = ?
                        ORDER BY is_popular DESC, template_name";
        
        $stmt = $conn->prepare($templateSql);
        $stmt->bind_param("i", $category_id);
        $stmt->execute();
        $templateResult = $stmt->get_result();
        
        $templates = [];
        while ($template = $templateResult->fetch_assoc()) {
            $templates[] = $template;
        }
        $stmt->close();
        
        $row['templates'] = $templates;
        $categories[] = $row;
    }
    
    echo json_encode([
        "success" => true,
        "categories" => $categories
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Error fetching templates: " . $conn->error
    ]);
}

$conn->close();
?>
