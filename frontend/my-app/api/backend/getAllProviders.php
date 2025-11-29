<?php
header("Content-Type: application/json");
include "db_connect.php";

$sql = "SELECT sp.*, u.username 
        FROM service_provider sp
        JOIN users u ON sp.user_id = u.id
        ORDER BY sp.created_at DESC";

$result = $conn->query($sql);
$providers = [];

while ($row = $result->fetch_assoc()) {
  $providers[] = $row;
}

echo json_encode(["success" => true, "providers" => $providers]);
$conn->close();
?>
