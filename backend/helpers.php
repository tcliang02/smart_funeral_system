<?php
// Helper functions for the Smart Funeral System backend

/**
 * Sanitize user input
 * @param string $data Input to sanitize
 * @return string Sanitized input
 */
function sanitize($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

/**
 * Get user data by ID
 * @param PDO $conn Database connection (always PDO now)
 * @param int $userId User ID
 * @return array|null User data or null if not found
 */
function getUserById($conn, $userId) {
    try {
        $stmt = $conn->prepare("SELECT user_id, name as username, email, role FROM users WHERE user_id = :userId");
        $stmt->execute(['userId' => $userId]);
        $user = $stmt->fetch();
        return $user ?: null;
    } catch (PDOException $e) {
        error_log("Error fetching user by ID: " . $e->getMessage());
        return null;
    }
}

/**
 * Get provider data by user ID
 * @param PDO $conn Database connection (always PDO now)
 * @param int $userId User ID
 * @return array|null Provider data or null if not found
 */
function getProviderByUserId($conn, $userId) {
    try {
        $stmt = $conn->prepare("SELECT * FROM service_provider WHERE user_id = :userId");
        $stmt->execute(['userId' => $userId]);
        $provider = $stmt->fetch();
        return $provider ?: null;
    } catch (PDOException $e) {
        error_log("Error fetching provider by user ID: " . $e->getMessage());
        return null;
    }
}

 * @param string $sql SQL query (use ? placeholders)
 * @param array $params Parameters to bind
 * @return array|null Single row or null
 */
function executeQuerySingle($conn, $sql, $params = []) {
    $rows = executeQuery($conn, $sql, $params);
    return !empty($rows) ? $rows[0] : null;
}

/**
 * Execute a query without returning results (INSERT, UPDATE, DELETE)
 * @param PDO $conn Database connection (always PDO now)
 * @param string $sql SQL query (use ? placeholders)
 * @param array $params Parameters to bind
 * @return bool Success status
 */
function executeUpdate($conn, $sql, $params = []) {
    try {
        // Convert ? placeholders to :param for PDO
        $pdoSql = $sql;
        $pdoParams = [];
        $paramIndex = 0;
        
        $pdoSql = preg_replace_callback('/\?/', function() use (&$paramIndex, &$pdoParams, $params) {
            $key = 'param' . $paramIndex;
            $pdoParams[$key] = $params[$paramIndex] ?? null;
            $paramIndex++;
            return ':' . $key;
        }, $pdoSql);
        
        $stmt = $conn->prepare($pdoSql);
        return $stmt->execute($pdoParams);
    } catch (PDOException $e) {
        error_log("Database update error: " . $e->getMessage());
        return false;
    }
}
?>