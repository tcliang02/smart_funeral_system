<?php
// Simple connection test
echo "Attempting MySQL connection...\n";

try {
    $host = "mysql.railway.internal";
    $user = "root"; 
    $pass = "SjGGZXZkqBcQkvsdubCUethcNxEmxDJG";
    $dbname = "railway";
    $port = 3306;
    
    echo "Host: $host:$port\n";
    echo "Database: $dbname\n";
    
    $conn = new mysqli($host, $user, $pass, $dbname, $port);
    
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    
    echo "Connected successfully!\n";
    
    // Test query
    $result = $conn->query("SELECT COUNT(*) as count FROM users");
    if ($result) {
        $row = $result->fetch_assoc();
        echo "Users count: " . $row['count'] . "\n";
    }
    
    $conn->close();
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>