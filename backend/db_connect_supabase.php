<?php
// Supabase PostgreSQL connection
$host = "wtfngwbynkkmtjcsdqnw.supabase.co";
$user = "postgres";
$pass = "CE2EWeU3yOTJhMJH";
$dbname = "postgres";
$port = 5432;

// Create PostgreSQL connection
$conn = pg_connect("host=$host port=$port dbname=$dbname user=$user password=$pass sslmode=require");

// Check connection
if (!$conn) {
    die(json_encode(["success" => false, "message" => "Database connection failed: " . pg_last_error()]));
}
?>