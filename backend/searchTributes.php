<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, ngrok-skip-browser-warning');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'db_connect.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    // Get search parameters
    $search_name = isset($_GET['name']) ? $_GET['name'] : '';
    $search_date = isset($_GET['date_of_death']) ? $_GET['date_of_death'] : '';
    $filter = isset($_GET['filter']) ? $_GET['filter'] : 'recent'; // recent, popular, oldest
    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 12;
    $offset = ($page - 1) * $limit;
    $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
    
    // Build query - show public tributes OR private tributes created by the current user
    $where_clauses = [];
    $params = [];
    $types = "";
    
    if ($user_id > 0) {
        $where_clauses[] = "(is_public = 1 OR created_by = ?)";
        $params[] = $user_id;
        $types = "i";
    } else {
        $where_clauses[] = "is_public = 1";
    }
    $params_base = $params; // Save base params for count query
    $types_base = $types;
    
    if ($search_name) {
        $where_clauses[] = "deceased_name LIKE ?";
        $params[] = "%" . $search_name . "%";
        $types .= "s";
    }
    
    if ($search_date) {
        $where_clauses[] = "death_date = ?";
        $params[] = $search_date;
        $types .= "s";
    }
    
    $where_sql = implode(" AND ", $where_clauses);
    
    // Order by clause
    $order_by = "created_at DESC"; // Default: recent
    if ($filter === 'popular') {
        $order_by = "view_count DESC, created_at DESC";
    } elseif ($filter === 'oldest') {
        $order_by = "death_date ASC";
    }
    
    // Get total count
    $count_sql = "SELECT COUNT(*) as total FROM tributes WHERE $where_sql";
    $stmt = $conn->prepare($count_sql);
    if (!empty($params_base)) {
        $stmt->bind_param($types_base, ...$params_base);
    }
    $stmt->execute();
    $count_result = $stmt->get_result();
    $total = $count_result->fetch_assoc()['total'];
    
    // Get tributes
    $sql = "SELECT 
        tribute_id as id,
        deceased_name,
        birth_date as date_of_birth,
        death_date as date_of_death,
        photo_url as portrait_photo,
        view_count,
        flower_count,
        is_public,
        created_by,
        created_at
    FROM tributes 
    WHERE $where_sql 
    ORDER BY $order_by 
    LIMIT ? OFFSET ?";
    
    $stmt = $conn->prepare($sql);
    $params[] = $limit;
    $params[] = $offset;
    $types .= "ii";
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $tributes = [];
    while ($row = $result->fetch_assoc()) {
        // Get message count for each tribute
        $msg_sql = "SELECT COUNT(*) as count FROM tribute_messages WHERE tribute_id = ? AND is_approved = 1";
        $msg_stmt = $conn->prepare($msg_sql);
        $msg_stmt->bind_param("i", $row['id']);
        $msg_stmt->execute();
        $msg_result = $msg_stmt->get_result();
        $row['message_count'] = $msg_result->fetch_assoc()['count'];
        
        $tributes[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'tributes' => $tributes,
        'pagination' => [
            'current_page' => $page,
            'total_pages' => ceil($total / $limit),
            'total_tributes' => $total,
            'per_page' => $limit
        ]
    ]);
    
    $stmt->close();
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
