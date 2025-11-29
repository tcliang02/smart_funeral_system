<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, ngrok-skip-browser-warning");

include "db_connect.php";
include "helpers.php";

$isPDO = $conn instanceof PDO;

// Get all packages from all providers
$sql = "SELECT p.*, sp.company_name, sp.address, sp.phone 
        FROM packages p
        LEFT JOIN service_provider sp ON p.provider_id = sp.provider_id
        ORDER BY p.created_at DESC";

try {
    $packages = [];
    
    if ($isPDO) {
        // PostgreSQL (Supabase) via PDO
        $stmt = $conn->query($sql);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } else {
        // MySQL (XAMPP) via mysqli
        $result = $conn->query($sql);
        if (!$result) {
            throw new Exception("Error fetching packages: " . $conn->error);
        }
        $rows = [];
        while ($row = $result->fetch_assoc()) {
            $rows[] = $row;
        }
    }
    
    foreach ($rows as $row) {
        $package_id = $row['package_id'];
        
        // Fetch features for this package
        $featureSql = "SELECT feature_name FROM package_features WHERE package_id = ?";
        $features = executeQuery($conn, $featureSql, [$package_id]);
        
        $featureNames = [];
        foreach ($features as $featureRow) {
            $featureNames[] = $featureRow['feature_name'];
        }
        
        // Add features to package data
        $row['features'] = $featureNames;
        $packages[] = $row;
    }
    
    echo json_encode(["success" => true, "packages" => $packages]);
    
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}

// Close connection only for mysqli
if (!$isPDO) {
    $conn->close();
}
?>

