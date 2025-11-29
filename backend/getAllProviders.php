<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
include "db_connect.php";
include "helpers.php";

$isPDO = $conn instanceof PDO;

// Note: Changed u.id to u.user_id to match database structure
$sql = "SELECT sp.*, u.name as username 
        FROM service_provider sp
        JOIN users u ON sp.user_id = u.user_id
        ORDER BY sp.created_at DESC";

try {
    if ($isPDO) {
        $stmt = $conn->query($sql);
        $providers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } else {
        $result = $conn->query($sql);
        if (!$result) {
            throw new Exception("Error fetching providers: " . $conn->error);
        }
        $providers = [];
        while ($row = $result->fetch_assoc()) {
            $providers[] = $row;
        }
    }
    
    echo json_encode(["success" => true, "providers" => $providers]);
    
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}

// Close connection only for mysqli
if (!$isPDO) {
    $conn->close();
}
?>
