<?php
header("Content-Type: application/json");
include "db_connect.php";

$data = json_decode(file_get_contents("php://input"), true);
$provider_id = $data["provider_id"] ?? null;

if (!$provider_id) {
  echo json_encode(["success" => false, "message" => "Missing provider_id"]);
  exit;
}

$sql = "SELECT 
          p.*,
          COALESCE(AVG(pr.rating), 0) as average_rating,
          COUNT(pr.rating) as total_ratings
        FROM packages p
        LEFT JOIN bookings b ON p.package_id = b.package_id
        LEFT JOIN provider_reviews pr ON b.booking_id = pr.booking_id AND pr.review_type = 'customer_to_provider'
        WHERE p.provider_id = ?
        GROUP BY p.package_id
        ORDER BY p.created_at DESC";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $provider_id);
$stmt->execute();
$result = $stmt->get_result();

$packages = [];
while ($row = $result->fetch_assoc()) {
  $row['average_rating'] = round(floatval($row['average_rating']), 1);
  $row['total_ratings'] = intval($row['total_ratings']);
  $packages[] = $row;
}

echo json_encode(["success" => true, "packages" => $packages]);

$stmt->close();
$conn->close();
?>
