<?php
/**
 * Unified Database Connection
 * Uses PDO for both PostgreSQL (production) and MySQL (local development)
 * This eliminates the need for dual query logic throughout the codebase
 */

$isProduction = getenv('VERCEL') === '1' || getenv('DB_HOST') !== false;

if ($isProduction) {
    // ✅ PRODUCTION: PostgreSQL (Supabase) via PDO
    $host = getenv('DB_HOST') ?: 'localhost';
    $user = getenv('DB_USER') ?: 'postgres';
    $pass = getenv('DB_PASSWORD') ?: '';
    $dbname = getenv('DB_NAME') ?: 'postgres';
    $port = getenv('DB_PORT') ?: 5432;
    $dbType = 'pgsql';
    
    require_once __DIR__ . '/PDOAdapter.php';

    try {
        $dsn = "pgsql:host=$host;port=$port;dbname=$dbname;sslmode=require";
        $pdo = new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]);
        
        // Wrap PDO in our Adapter to support legacy MySQLi code
        $conn = new PDOAdapter($pdo);
        
    } catch (PDOException $e) {
        http_response_code(500);
        die(json_encode(["success" => false, "message" => "Database connection failed: " . $e->getMessage()]));
    }
} else {
    // 🏠 LOCAL DEVELOPMENT: MySQL via PDO (unified approach)
    $host = "localhost";
    $user = "root";
    $pass = "";
    $dbname = "smart_funeral_system";
    $port = 3306;
    $dbType = 'mysql';
    
    require_once __DIR__ . '/PDOAdapter.php';
    
    try {
        $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4";
        $pdo = new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]);
        
        // Wrap PDO in our Adapter to support legacy MySQLi code
        $conn = new PDOAdapter($pdo);
        
    } catch (PDOException $e) {
        http_response_code(500);
        die(json_encode(["success" => false, "message" => "Database connection failed: " . $e->getMessage()]));
    }
}

// Store database type for helper functions
$GLOBALS['DB_TYPE'] = $dbType;
?>
