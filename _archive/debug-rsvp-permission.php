<?php
header('Content-Type: application/json');
require_once 'backend/db_connect.php';

$tribute_id = 2;
$user_id = 15;

try {
    // Check what the database has
    $sql = "SELECT tribute_id, created_by, deceased_name FROM tributes WHERE tribute_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $tribute_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $tribute = $result->fetch_assoc();
    
    echo json_encode([
        'success' => true,
        'tribute' => $tribute,
        'user_id_from_request' => $user_id,
        'comparison' => [
            'created_by' => $tribute['created_by'],
            'user_id' => $user_id,
            'are_equal' => ($tribute['created_by'] == $user_id),
            'strict_equal' => ($tribute['created_by'] === $user_id),
            'types' => [
                'created_by' => gettype($tribute['created_by']),
                'user_id' => gettype($user_id)
            ]
        ]
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>
