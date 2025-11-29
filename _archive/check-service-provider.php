<?php
include "backend/db_connect.php";

echo "<h2>service_provider Table Structure</h2>";
$sql = "DESCRIBE service_provider";
$result = $conn->query($sql);
if ($result) {
    echo "<table border='1' cellpadding='5'>";
    echo "<tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
    while ($row = $result->fetch_assoc()) {
        echo "<tr><td>{$row['Field']}</td><td>{$row['Type']}</td><td>{$row['Null']}</td><td>{$row['Key']}</td><td>" . ($row['Default'] ?? 'NULL') . "</td><td>{$row['Extra']}</td></tr>";
    }
    echo "</table>";
}
$conn->close();
?>
