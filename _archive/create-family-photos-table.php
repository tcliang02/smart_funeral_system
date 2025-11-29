<?php
require_once 'backend/db_connect.php';

// Create family_photos table
$sql = "CREATE TABLE IF NOT EXISTS family_photos (
    photo_id INT(11) AUTO_INCREMENT PRIMARY KEY,
    tribute_id INT(11) NOT NULL,
    user_id INT(11) NOT NULL,
    photo_url VARCHAR(255) NOT NULL,
    photo_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tribute_id) REFERENCES tributes(tribute_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
)";

if ($conn->query($sql)) {
    echo "✅ family_photos table created successfully!\n";
} else {
    echo "❌ Error creating table: " . $conn->error . "\n";
}

// Show the structure
$result = $conn->query("DESCRIBE family_photos");
echo "\n=== FAMILY_PHOTOS TABLE STRUCTURE ===\n";
while ($row = $result->fetch_assoc()) {
    echo $row['Field'] . " (" . $row['Type'] . ")\n";
}
?>