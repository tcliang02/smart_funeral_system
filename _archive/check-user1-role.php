<?php
include 'backend/db_connect.php';

echo "<h2>Checking user1 (id=15) in database:</h2>";

$result = $conn->query("SELECT user_id, id, name, username, email, role FROM users WHERE user_id = 15 OR id = 15");

if ($result->num_rows > 0) {
    echo "<pre>";
    while ($row = $result->fetch_assoc()) {
        echo "User found:\n";
        echo "  user_id: " . ($row['user_id'] ?? 'NULL') . "\n";
        echo "  id: " . ($row['id'] ?? 'NULL') . "\n";
        echo "  name: " . ($row['name'] ?? 'NULL') . "\n";
        echo "  username: " . ($row['username'] ?? 'NULL') . "\n";
        echo "  email: " . ($row['email'] ?? 'NULL') . "\n";
        echo "  role: " . ($row['role'] ?? 'NULL') . "\n";
        echo "\n";
    }
    echo "</pre>";
} else {
    echo "❌ No user found with user_id=15 or id=15";
}

echo "<hr>";
echo "<h3>All users in database:</h3>";
$result = $conn->query("SELECT user_id, id, name, username, email, role FROM users ORDER BY user_id");
echo "<table border='1' cellpadding='5'>";
echo "<tr><th>user_id</th><th>id</th><th>name</th><th>username</th><th>email</th><th>role</th></tr>";
while ($row = $result->fetch_assoc()) {
    echo "<tr>";
    echo "<td>" . ($row['user_id'] ?? 'NULL') . "</td>";
    echo "<td>" . ($row['id'] ?? 'NULL') . "</td>";
    echo "<td>" . ($row['name'] ?? 'NULL') . "</td>";
    echo "<td>" . ($row['username'] ?? 'NULL') . "</td>";
    echo "<td>" . ($row['email'] ?? 'NULL') . "</td>";
    echo "<td><strong>" . ($row['role'] ?? 'NULL') . "</strong></td>";
    echo "</tr>";
}
echo "</table>";
?>
