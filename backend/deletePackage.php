<?php
// Start output buffering to prevent any output before JSON
ob_start();

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, DELETE");
header("Access-Control-Allow-Headers: Content-Type"), ngrok-skip-browser-warning;

include "db_connect.php";

// Enable error logging but disable display to prevent HTML errors in JSON
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Log incoming request data
$raw_data = file_get_contents("php://input");
error_log("Delete package request data: " . $raw_data);

$data = json_decode($raw_data, true);
$id = $data["id"] ?? null;

if (!$id) {
  ob_end_clean();
  echo json_encode(["success" => false, "message" => "Missing package ID"]);
  exit;
}

$sql = "DELETE FROM packages WHERE package_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
  ob_end_clean();
  echo json_encode(["success" => true, "message" => "Package deleted successfully"]);
} else {
  // Log the error for debugging
  error_log("MySQL Error: " . $stmt->error);
  ob_end_clean();
  echo json_encode(["success" => false, "message" => "Failed to delete package: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>

