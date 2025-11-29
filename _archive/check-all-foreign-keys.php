<?php
include "backend/db_connect.php";

echo "<h2>Check ALL Foreign Key Constraints on booking_id</h2>";

// Find all foreign keys that reference booking_id
$sql = "SELECT 
    TABLE_NAME,
    CONSTRAINT_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'smart_funeral_system'
AND REFERENCED_TABLE_NAME = 'bookings'
AND REFERENCED_COLUMN_NAME = 'booking_id'";

$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    echo "<h3>Foreign keys referencing bookings.booking_id:</h3>";
    echo "<table border='1' cellpadding='5'>";
    echo "<tr><th>Table</th><th>Constraint Name</th><th>Column</th><th>References</th></tr>";
    while ($row = $result->fetch_assoc()) {
        echo "<tr>";
        echo "<td>{$row['TABLE_NAME']}</td>";
        echo "<td>{$row['CONSTRAINT_NAME']}</td>";
        echo "<td>{$row['COLUMN_NAME']}</td>";
        echo "<td>{$row['REFERENCED_TABLE_NAME']}.{$row['REFERENCED_COLUMN_NAME']}</td>";
        echo "</tr>";
    }
    echo "</table>";
} else {
    echo "<p>No foreign keys found referencing bookings.booking_id</p>";
}

$conn->close();
?>