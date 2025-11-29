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
 * @param mysqli|PDO $conn Database connection
 * @param int $userId User ID
 * @return array|null User data or null if not found
 */
function getUserById($conn, $userId) {
    $isPDO = $conn instanceof PDO;
    
    if ($isPDO) {
        $stmt = $conn->prepare("SELECT user_id, name as username, email, role FROM users WHERE user_id = :userId");
        $stmt->execute(['userId' => $userId]);
        $result = $stmt->fetch();
        return $result ?: null;
    } else {
        $stmt = $conn->prepare("SELECT user_id, name as username, email, role FROM users WHERE user_id = ?");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            return $result->fetch_assoc();
        }
        return null;
    }
}

/**
 * Get provider data by user ID
 * @param mysqli|PDO $conn Database connection
 * @param int $userId User ID
 * @return array|null Provider data or null if not found
 */
function getProviderByUserId($conn, $userId) {
    $isPDO = $conn instanceof PDO;
    
    if ($isPDO) {
        $stmt = $conn->prepare("SELECT * FROM service_provider WHERE user_id = :userId");
        $stmt->execute(['userId' => $userId]);
        $result = $stmt->fetch();
        return $result ?: null;
    } else {
        $stmt = $conn->prepare("SELECT * FROM service_provider WHERE user_id = ?");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            return $result->fetch_assoc();
        }
        return null;
    }
}

/**
 * Verify user authentication
 * @param string $token JWT token
 * @return array|bool User data if authenticated, false otherwise
 */
function verifyAuth($headers) {
    error_log("=== VERIFY AUTH DEBUG ===");
    error_log("Headers received: " . print_r($headers, true));
    
    // Get authorization header
    $authHeader = null;
    if (isset($headers['Authorization'])) {
        $authHeader = $headers['Authorization'];
    } elseif (isset($headers['authorization'])) {
        $authHeader = $headers['authorization'];
    }
    
    error_log("Auth header: " . ($authHeader ?? 'NULL'));
    
    // Check if token exists
    if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        error_log("ERROR: No valid Bearer token found");
        return false;
    }
    
    $token = $matches[1];
    error_log("Token extracted: " . substr($token, 0, 50) . "...");
    
    $tokenParts = explode('.', $token);
    error_log("Token parts count: " . count($tokenParts));
    
    if (count($tokenParts) !== 3) {
        error_log("ERROR: Invalid JWT structure - expected 3 parts");
        return false;
    }
    
    $userData = json_decode(base64_decode($tokenParts[1]), true);
    error_log("Decoded userData: " . print_r($userData, true));
    
    // Simple token verification - in production, use proper JWT validation
    if (!$userData) {
        error_log("ERROR: Failed to decode token payload");
        return false;
    }
    
    // Support both 'id' and 'user_id' fields for compatibility
    if (!isset($userData['id']) && !isset($userData['user_id'])) {
        error_log("ERROR: Missing 'id' or 'user_id' field in token");
        return false;
    }
    
    // Normalize user_id to id for consistency
    if (isset($userData['user_id']) && !isset($userData['id'])) {
        $userData['id'] = $userData['user_id'];
    }
    
    if (!isset($userData['exp'])) {
        error_log("ERROR: Missing 'exp' field in token");
        return false;
    }
    
    $currentTime = time();
    error_log("Expiry check - Token exp: " . $userData['exp'] . ", Current time: " . $currentTime . ", Expired: " . ($userData['exp'] < $currentTime ? 'YES' : 'NO'));
    
    if ($userData['exp'] < $currentTime) {
        error_log("ERROR: Token has expired");
        return false;
    }
    
    error_log("=== AUTH SUCCESS ===");
    return $userData;
}

/**
 * Generate a JWT token
 * @param array $userData User data to encode
 * @param int $expiry Expiry time in seconds (default 24 hours)
 * @return string JWT token
 */
function generateToken($userData, $expiry = 86400) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    
    $payload = array_merge($userData, [
        'iat' => time(),
        'exp' => time() + $expiry
    ]);
    $payload = json_encode($payload);
    
    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    
    // In production, use a secure secret key
    $secret = 'smart_funeral_system_secret_key';
    
    $signature = hash_hmac('sha256', $base64UrlHeader . '.' . $base64UrlPayload, $secret, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    return $base64UrlHeader . '.' . $base64UrlPayload . '.' . $base64UrlSignature;
}
?>