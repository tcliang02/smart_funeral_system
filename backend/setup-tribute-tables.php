<?php
// Execute Tribute System Database Schema
header('Content-Type: text/plain; charset=utf-8');

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "smart_funeral_system";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("❌ Connection failed: " . $conn->connect_error . PHP_EOL);
}

echo "📦 Creating tribute system database tables..." . PHP_EOL . PHP_EOL;

$sql = file_get_contents(__DIR__ . '/tribute_system_schema_v2.sql');

if ($conn->multi_query($sql)) {
    do {
        if ($result = $conn->store_result()) {
            while ($row = $result->fetch_assoc()) {
                print_r($row);
                echo PHP_EOL;
            }
            $result->free();
        }
        
        if ($conn->more_results()) {
            echo "---" . PHP_EOL;
        }
    } while ($conn->next_result());
    
    echo PHP_EOL . "✅ All tribute tables created successfully!" . PHP_EOL;
} else {
    echo "❌ Error: " . $conn->error . PHP_EOL;
}

$conn->close();
?>
