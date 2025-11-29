<?php
$conn = new mysqli('localhost', 'root', '', 'smart_funeral_system');

// Check for any remaining foreign key constraints
echo "🔍 Checking for foreign key constraints...<br><br>";

$result = $conn->query("
    SELECT 
        CONSTRAINT_NAME,
        TABLE_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = 'smart_funeral_system'
    AND REFERENCED_TABLE_NAME IS NOT NULL
    ORDER BY TABLE_NAME
");

if ($result->num_rows > 0) {
    echo "<table border='1' cellpadding='5'>";
    echo "<tr><th>Constraint</th><th>Table</th><th>Column</th><th>References Table</th><th>References Column</th></tr>";
    while ($row = $result->fetch_assoc()) {
        echo "<tr>";
        echo "<td>" . $row['CONSTRAINT_NAME'] . "</td>";
        echo "<td>" . $row['TABLE_NAME'] . "</td>";
        echo "<td>" . $row['COLUMN_NAME'] . "</td>";
        echo "<td>" . $row['REFERENCED_TABLE_NAME'] . "</td>";
        echo "<td>" . $row['REFERENCED_COLUMN_NAME'] . "</td>";
        echo "</tr>";
    }
    echo "</table>";
} else {
    echo "✅ No foreign key constraints found!<br>";
}

echo "<br><br>🔍 Checking if tribute tables exist...<br><br>";

$tables = ['tributes', 'tribute_messages', 'tribute_photos', 'tribute_candles', 'tribute_rsvp'];
foreach ($tables as $table) {
    $result = $conn->query("SHOW TABLES LIKE '$table'");
    if ($result->num_rows > 0) {
        echo "⚠️ Table $table EXISTS<br>";
    } else {
        echo "✅ Table $table does NOT exist<br>";
    }
}

$conn->close();
?>
