<?php
$conn = new mysqli('localhost', 'root', '', 'smart_funeral_system');

// Disable foreign key checks
$conn->query("SET FOREIGN_KEY_CHECKS = 0");

// Drop all tribute tables in reverse order
echo "🗑️  Dropping existing tribute tables (if any)..." . PHP_EOL;

$tables = ['tribute_rsvp', 'tribute_candles', 'tribute_photos', 'tribute_messages', 'tributes'];
foreach ($tables as $table) {
    $conn->query("DROP TABLE IF EXISTS $table");
    echo "   Dropped $table" . PHP_EOL;
}

// Re-enable foreign key checks
$conn->query("SET FOREIGN_KEY_CHECKS = 1");

echo PHP_EOL . "✅ Ready for fresh installation!" . PHP_EOL;
$conn->close();
?>
