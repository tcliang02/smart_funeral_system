<?php
require './backend/db_connect.php';

$result = mysqli_query($conn, "SELECT u.id, u.username, u.role, sp.provider_id, sp.company_name 
                                FROM users u 
                                LEFT JOIN service_provider sp ON u.id = sp.user_id 
                                WHERE u.role='provider' LIMIT 5");

echo "Provider Users:\n";
while ($row = mysqli_fetch_assoc($result)) {
    echo "User ID: {$row['id']}, Username: {$row['username']}, Provider ID: {$row['provider_id']}, Company: {$row['company_name']}\n";
}

mysqli_close($conn);
?>