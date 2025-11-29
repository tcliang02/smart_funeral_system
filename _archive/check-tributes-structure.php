<?php
include 'backend/db_connect.php';

echo "<h2>Checking tributes table structure:</h2>";

$result = $conn->query("SHOW COLUMNS FROM tributes");

echo "<table border='1' cellpadding='5'>";
echo "<tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
while ($row = $result->fetch_assoc()) {
    echo "<tr>";
    echo "<td><strong>" . $row['Field'] . "</strong></td>";
    echo "<td>" . $row['Type'] . "</td>";
    echo "<td>" . $row['Null'] . "</td>";
    echo "<td>" . $row['Key'] . "</td>";
    echo "<td>" . ($row['Default'] ?? 'NULL') . "</td>";
    echo "<td>" . $row['Extra'] . "</td>";
    echo "</tr>";
}
echo "</table>";

echo "<hr><h3>Sample tributes data:</h3>";
$result = $conn->query("SELECT * FROM tributes LIMIT 3");
echo "<pre>";
while ($row = $result->fetch_assoc()) {
    print_r($row);
    echo "\n---\n";
}
echo "</pre>";
?>
