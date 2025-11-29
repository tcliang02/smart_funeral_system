<?php
header('Content-Type: text/html; charset=utf-8');

$conn = new mysqli('localhost', 'root', '', 'smart_funeral_system');

if ($conn->connect_error) {
    die("❌ Connection failed: " . $conn->connect_error);
}

echo "✅ Database connected!<br><br>";

// Disable foreign key checks
$conn->query("SET FOREIGN_KEY_CHECKS = 0");

// Drop existing tables
echo "🗑️ Dropping existing tribute tables...<br>";
$tables = ['tribute_rsvp', 'tribute_candles', 'tribute_photos', 'tribute_messages', 'tributes'];
foreach ($tables as $table) {
    $conn->query("DROP TABLE IF EXISTS $table");
    echo "✅ Dropped $table<br>";
}

echo "<br>📦 Creating tribute tables...<br>";

// Create tributes table (NO FOREIGN KEYS)
$sql = "CREATE TABLE tributes (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    booking_id INT(11) NULL,
    creator_user_id INT(11) NOT NULL,
    deceased_name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    date_of_death DATE NOT NULL,
    location_of_birth VARCHAR(255),
    portrait_photo VARCHAR(500),
    life_story TEXT,
    is_public TINYINT(1) DEFAULT 1,
    allow_messages TINYINT(1) DEFAULT 1,
    allow_photos TINYINT(1) DEFAULT 1,
    allow_candles TINYINT(1) DEFAULT 1,
    moderate_messages TINYINT(1) DEFAULT 0,
    donation_items JSON,
    account_holder_name VARCHAR(255),
    bank_name VARCHAR(100),
    account_number VARCHAR(50),
    bank_qr_code VARCHAR(500),
    grave_invite_message TEXT,
    grave_location_name VARCHAR(255),
    grave_address TEXT,
    grave_datetime DATETIME,
    map_link VARCHAR(500),
    virtual_link VARCHAR(500),
    enable_rsvp TINYINT(1) DEFAULT 0,
    rsvp_collect_name TINYINT(1) DEFAULT 0,
    rsvp_collect_phone TINYINT(1) DEFAULT 0,
    rsvp_max_guests INT(11),
    view_count INT(11) DEFAULT 0,
    flower_count INT(11) DEFAULT 0,
    candle_count INT(11) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

if ($conn->query($sql)) {
    echo "✅ Created tributes table<br>";
} else {
    die("❌ Error creating tributes: " . $conn->error . "<br>");
}

// Create tribute_messages table
$sql = "CREATE TABLE tribute_messages (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    tribute_id INT(11) NOT NULL,
    user_id INT(11) NULL,
    guest_name VARCHAR(255),
    guest_email VARCHAR(255),
    message TEXT NOT NULL,
    is_approved TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

if ($conn->query($sql)) {
    echo "✅ Created tribute_messages table<br>";
} else {
    die("❌ Error: " . $conn->error . "<br>");
}

// Create tribute_photos table
$sql = "CREATE TABLE tribute_photos (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    tribute_id INT(11) NOT NULL,
    uploader_user_id INT(11) NULL,
    uploader_name VARCHAR(255),
    photo_url VARCHAR(500) NOT NULL,
    photo_description TEXT,
    is_approved TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

if ($conn->query($sql)) {
    echo "✅ Created tribute_photos table<br>";
} else {
    die("❌ Error: " . $conn->error . "<br>");
}

// Create tribute_candles table
$sql = "CREATE TABLE tribute_candles (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    tribute_id INT(11) NOT NULL,
    lighter_user_id INT(11) NULL,
    lighter_name VARCHAR(255),
    candle_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

if ($conn->query($sql)) {
    echo "✅ Created tribute_candles table<br>";
} else {
    die("❌ Error: " . $conn->error . "<br>");
}

// Create tribute_rsvp table
$sql = "CREATE TABLE tribute_rsvp (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    tribute_id INT(11) NOT NULL,
    guest_name VARCHAR(255) NOT NULL,
    guest_phone VARCHAR(50),
    guest_email VARCHAR(255),
    number_of_guests INT(11) DEFAULT 1,
    attendance_type ENUM('physical', 'virtual') DEFAULT 'physical',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

if ($conn->query($sql)) {
    echo "✅ Created tribute_rsvp table<br>";
} else {
    die("❌ Error: " . $conn->error . "<br>");
}

// Insert sample tribute
echo "<br>📝 Inserting sample tribute...<br>";
$sql = "INSERT INTO tributes (
    creator_user_id, deceased_name, date_of_birth, date_of_death, 
    location_of_birth, life_story
) VALUES (
    7, 'Tan Ah Kow', '1945-03-15', '2025-10-15',
    'Kuala Lumpur, Malaysia',
    'A loving father, devoted husband, and respected community leader. Mr. Tan dedicated his life to education and served as a principal for over 30 years.'
)";

if ($conn->query($sql)) {
    echo "✅ Inserted sample tribute (ID: " . $conn->insert_id . ")<br>";
} else {
    echo "❌ Error inserting sample: " . $conn->error . "<br>";
}

// Re-enable foreign key checks
$conn->query("SET FOREIGN_KEY_CHECKS = 1");

echo "<br><h2>🎉 Tribute system database setup complete!</h2>";

$conn->close();
?>
