<?php
$conn = new mysqli('localhost', 'root', '', 'smart_funeral_system');
echo "Checking bookings table structure:" . PHP_EOL . PHP_EOL;
$result = $conn->query('DESCRIBE bookings');
while ($row = $result->fetch_assoc()) {
    echo $row['Field'] . " | " . $row['Type'] . " | Key: " . $row['Key'] . PHP_EOL;
}
echo PHP_EOL . "Checking users table structure:" . PHP_EOL . PHP_EOL;
$result = $conn->query('DESCRIBE users');
while ($row = $result->fetch_assoc()) {
    echo $row['Field'] . " | " . $row['Type'] . " | Key: " . $row['Key'] . PHP_EOL;
}
?>
