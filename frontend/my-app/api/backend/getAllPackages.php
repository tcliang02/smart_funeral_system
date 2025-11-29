<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type"), ngrok-skip-browser-warning;

include "db_connect.php";

// Get all packages from all providers
$sql = "SELECT p.*, sp.company_name, sp.address, sp.phone 
        FROM packages p
        LEFT JOIN service_provider sp ON p.provider_id = sp.provider_id
        ORDER BY p.created_at DESC";

$result = $conn->query($sql);
$packages = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $package_id = $row['package_id'];
        
        // Fetch features for this package
        $featureSql = "SELECT feature_name FROM package_features WHERE package_id = ?";
        $featureStmt = $conn->prepare($featureSql);
        $featureStmt->bind_param("i", $package_id);
        $featureStmt->execute();
        $featureResult = $featureStmt->get_result();
        
        $features = [];
        while ($featureRow = $featureResult->fetch_assoc()) {
            $features[] = $featureRow['feature_name'];
        }
        $featureStmt->close();
        
        // Add features to package data
        $row['features'] = $features;
        $packages[] = $row;
    }
    echo json_encode(["success" => true, "packages" => $packages]);
} else {
    echo json_encode(["success" => false, "message" => "Error fetching packages: " . $conn->error]);
}

$conn->close();
?>

