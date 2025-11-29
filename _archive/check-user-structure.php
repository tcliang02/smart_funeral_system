<?php
require_once './backend/db_connect.php';

// Check table structure
$structure = "DESCRIBE users";
$result = mysqli_query($conn, $structure);

echo "Users table structure:\n";
while ($row = mysqli_fetch_assoc($result)) {
    echo "{$row['Field']} - {$row['Type']} - {$row['Null']} - {$row['Default']}\n";
}

echo "\n\nCurrent user 7 data:\n";
$check = "SELECT * FROM users WHERE id = 7";
$user = mysqli_fetch_assoc(mysqli_query($conn, $check));
print_r($user);

mysqli_close($conn);
?>