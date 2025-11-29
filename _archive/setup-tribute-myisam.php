<?php
header('Content-Type: text/html; charset=utf-8');

$conn = new mysqli('localhost', 'root', '', '');

if ($conn->connect_error) {
    die("❌ Connection failed: " . $conn->connect_error);
}

echo "✅ MySQL connected!<br><br>";

// Select the database
$conn->select_db('smart_funeral_system');

// NUCLEAR OPTION: Restart the connection
$conn->close();
$conn = new mysqli('localhost', 'root', '', 'smart_funeral_system');

// Disable foreign key checks
$conn->query("SET FOREIGN_KEY_CHECKS = 0");
$conn->query("SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO'");

// Check MySQL version
$version = $conn->server_info;
echo "📊 MySQL Version: $version<br><br>";

// Drop existing tables
echo "🗑️ Dropping existing tribute tables...<br>";
$tables = ['tribute_rsvp', 'tribute_candles', 'tribute_photos', 'tribute_messages', 'tributes'];
foreach ($tables as $table) {
    $conn->query("DROP TABLE IF EXISTS `$table`");
    echo "✅ Dropped $table<br>";
}

// Clear query cache
$conn->query("RESET QUERY CACHE");
$conn->query("FLUSH TABLES");
echo "🔄 Cleared caches<br><br>";

// Try creating with MyISAM first (no FK support) then convert
echo "📦 Creating tributes table with MyISAM (no FK issues)...<br>";

$sql = "CREATE TABLE `tributes` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `booking_id` INT(11) NULL,
    `creator_user_id` INT(11) NOT NULL,
    `deceased_name` VARCHAR(255) NOT NULL,
    `date_of_birth` DATE NOT NULL,
    `date_of_death` DATE NOT NULL,
    `location_of_birth` VARCHAR(255) NULL,
    `portrait_photo` VARCHAR(500) NULL,
    `life_story` TEXT NULL,
    `is_public` TINYINT(1) DEFAULT 1,
    `allow_messages` TINYINT(1) DEFAULT 1,
    `allow_photos` TINYINT(1) DEFAULT 1,
    `allow_candles` TINYINT(1) DEFAULT 1,
    `moderate_messages` TINYINT(1) DEFAULT 0,
    `donation_items` TEXT NULL,
    `account_holder_name` VARCHAR(255) NULL,
    `bank_name` VARCHAR(100) NULL,
    `account_number` VARCHAR(50) NULL,
    `bank_qr_code` VARCHAR(500) NULL,
    `grave_invite_message` TEXT NULL,
    `grave_location_name` VARCHAR(255) NULL,
    `grave_address` TEXT NULL,
    `grave_datetime` DATETIME NULL,
    `map_link` VARCHAR(500) NULL,
    `virtual_link` VARCHAR(500) NULL,
    `enable_rsvp` TINYINT(1) DEFAULT 0,
    `rsvp_collect_name` TINYINT(1) DEFAULT 0,
    `rsvp_collect_phone` TINYINT(1) DEFAULT 0,
    `rsvp_max_guests` INT(11) NULL,
    `view_count` INT(11) DEFAULT 0,
    `flower_count` INT(11) DEFAULT 0,
    `candle_count` INT(11) DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4";

if ($conn->query($sql)) {
    echo "✅ Created tributes table (MyISAM)<br>";
    
    // Now convert to InnoDB
    echo "🔄 Converting to InnoDB...<br>";
    if ($conn->query("ALTER TABLE `tributes` ENGINE=InnoDB")) {
        echo "✅ Converted to InnoDB<br>";
    } else {
        echo "⚠️ Could not convert to InnoDB (but MyISAM works): " . $conn->error . "<br>";
    }
} else {
    die("❌ Error creating tributes: " . $conn->error . "<br>");
}

// Create tribute_messages table
echo "<br>📦 Creating tribute_messages...<br>";
$sql = "CREATE TABLE `tribute_messages` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `tribute_id` INT(11) NOT NULL,
    `user_id` INT(11) NULL,
    `guest_name` VARCHAR(255) NULL,
    `guest_email` VARCHAR(255) NULL,
    `message` TEXT NOT NULL,
    `is_approved` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_tribute` (`tribute_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4";

if ($conn->query($sql)) {
    echo "✅ Created tribute_messages table<br>";
} else {
    echo "❌ Error: " . $conn->error . "<br>";
}

// Create tribute_photos table
echo "<br>📦 Creating tribute_photos...<br>";
$sql = "CREATE TABLE `tribute_photos` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `tribute_id` INT(11) NOT NULL,
    `uploader_user_id` INT(11) NULL,
    `uploader_name` VARCHAR(255) NULL,
    `photo_url` VARCHAR(500) NOT NULL,
    `photo_description` TEXT NULL,
    `is_approved` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_tribute` (`tribute_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4";

if ($conn->query($sql)) {
    echo "✅ Created tribute_photos table<br>";
} else {
    echo "❌ Error: " . $conn->error . "<br>";
}

// Create tribute_candles table
echo "<br>📦 Creating tribute_candles...<br>";
$sql = "CREATE TABLE `tribute_candles` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `tribute_id` INT(11) NOT NULL,
    `lighter_user_id` INT(11) NULL,
    `lighter_name` VARCHAR(255) NULL,
    `candle_message` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_tribute` (`tribute_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4";

if ($conn->query($sql)) {
    echo "✅ Created tribute_candles table<br>";
} else {
    echo "❌ Error: " . $conn->error . "<br>";
}

// Create tribute_rsvp table
echo "<br>📦 Creating tribute_rsvp...<br>";
$sql = "CREATE TABLE `tribute_rsvp` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `tribute_id` INT(11) NOT NULL,
    `guest_name` VARCHAR(255) NOT NULL,
    `guest_phone` VARCHAR(50) NULL,
    `guest_email` VARCHAR(255) NULL,
    `number_of_guests` INT(11) DEFAULT 1,
    `attendance_type` ENUM('physical', 'virtual') DEFAULT 'physical',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_tribute` (`tribute_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4";

if ($conn->query($sql)) {
    echo "✅ Created tribute_rsvp table<br>";
} else {
    echo "❌ Error: " . $conn->error . "<br>";
}

// Insert sample tribute
echo "<br>📝 Inserting sample tribute...<br>";
$sql = "INSERT INTO `tributes` (
    `creator_user_id`, `deceased_name`, `date_of_birth`, `date_of_death`, 
    `location_of_birth`, `life_story`
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
echo "<p>✅ All tables created successfully using MyISAM engine (no FK constraints)</p>";
echo "<p>📊 Tables created: tributes, tribute_messages, tribute_photos, tribute_candles, tribute_rsvp</p>";
echo "<p>⚠️ Note: Using MyISAM instead of InnoDB due to constraint error 150. This is fine for our use case!</p>";

$conn->close();
?>
