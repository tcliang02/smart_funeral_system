<?php
// PostgreSQL connection for Supabase (Vercel deployment)
// Falls back to MySQL for local XAMPP development

$isProduction = getenv('VERCEL') === '1' || getenv('DB_HOST') !== false;

if ($isProduction) {
    // ✅ PRODUCTION: PostgreSQL (Supabase) via PDO
    $host = getenv('DB_HOST') ?: 'localhost';
    $user = getenv('DB_USER') ?: 'postgres';
    $pass = getenv('DB_PASSWORD') ?: '';
    $dbname = getenv('DB_NAME') ?: 'postgres';
    $port = getenv('DB_PORT') ?: 5432;
    
    try {
        $dsn = "pgsql:host=$host;port=$port;dbname=$dbname;sslmode=require";
        $conn = new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        die(json_encode(["success" => false, "message" => "Database connection failed: " . $e->getMessage()]));
    }
} else {
    // 🏠 LOCAL DEVELOPMENT: MySQL (XAMPP) via mysqli
    $host = "localhost";
    $user = "root";
    $pass = "";
    $dbname = "smart_funeral_system";
    $port = 3306;
    
    $conn = new mysqli($host, $user, $pass, $dbname, $port);
    
    if ($conn->connect_error) {
        http_response_code(500);
        die(json_encode(["success" => false, "message" => "Database connection failed: " . $conn->connect_error]));
    }
}
?>
