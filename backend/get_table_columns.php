<?php
require_once 'db_connect.php';

echo "<h2>DATABASE TABLE COLUMNS</h2>";

// Get all tables
$tables = [];
$result = $conn->query("SHOW TABLES");
while ($row = $result->fetch_array()) {
    $tables[] = $row[0];
}

sort($tables);

foreach ($tables as $table) {
    echo "<h3>Table: $table</h3>";
    
    // Get column details
    $columns = $conn->query("DESCRIBE `$table`");
    
    echo "<table border='1' cellpadding='5' style='margin-bottom: 20px;'>";
    echo "<tr><th>Field</th><th>Key</th></tr>";
    
    while ($col = $columns->fetch_assoc()) {
        $key = '';
        if ($col['Key'] == 'PRI') $key = 'PK';
        elseif ($col['Key'] == 'MUL') $key = 'FK';
        elseif ($col['Key'] == 'UNI') $key = 'UK';
        
        echo "<tr>";
        echo "<td><strong>{$col['Field']}</strong></td>";
        echo "<td>$key</td>";
        echo "</tr>";
    }
    
    echo "</table>";
}

$conn->close();
?>
