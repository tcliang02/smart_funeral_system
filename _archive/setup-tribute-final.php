<?php
header('Content-Type: text/html; charset=utf-8');

$conn = new mysqli('localhost', 'root', '', 'smart_funeral_system');

if ($conn->connect_error) {
    die("❌ Connection failed: " . $conn->connect_error);
}

echo "✅ Database connected!<br><br>";

// Disable foreign key checks
$conn->query("SET FOREIGN_KEY_CHECKS = 0");
$conn->query("SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO'");

// Drop existing tables
echo "🗑️ Dropping existing tribute tables...<br>";
$tables = ['tribute_rsvp', 'tribute_candles', 'tribute_photos', 'tribute_messages', 'tributes'];
foreach ($tables as $table) {
    if ($conn->query("DROP TABLE IF EXISTS `$table`")) {
        echo "✅ Dropped $table<br>";
    } else {
        echo "⚠️ Could not drop $table: " . $conn->error . "<br>";
    }
}

// IMPORTANT: Flush table cache
$conn->query("FLUSH TABLES");
echo "🔄 Flushed table cache<br>";

echo "<br>📦 Creating tribute tables...<br>";

// Create tributes table - VERY SIMPLE VERSION FIRST
$sql = "CREATE TABLE IF NOT EXISTS `tributes` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `creator_user_id` INT(11) NOT NULL,
    `deceased_name` VARCHAR(255) NOT NULL,
    `date_of_birth` DATE NOT NULL,
    `date_of_death` DATE NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

if ($conn->query($sql)) {
    echo "✅ Created tributes table (basic version)<br>";
} else {
    die("❌ Error creating tributes: " . $conn->error . "<br>");
}

// Now add more columns one by one
echo "<br>📝 Adding additional columns to tributes...<br>";

$columns = [
    "ADD COLUMN `booking_id` INT(11) NULL AFTER `id`",
    "ADD COLUMN `location_of_birth` VARCHAR(255) NULL AFTER `date_of_death`",
    "ADD COLUMN `portrait_photo` VARCHAR(500) NULL",
    "ADD COLUMN `life_story` TEXT NULL",
    "ADD COLUMN `is_public` TINYINT(1) DEFAULT 1",
    "ADD COLUMN `allow_messages` TINYINT(1) DEFAULT 1",
    "ADD COLUMN `allow_photos` TINYINT(1) DEFAULT 1",
    "ADD COLUMN `allow_candles` TINYINT(1) DEFAULT 1",
    "ADD COLUMN `moderate_messages` TINYINT(1) DEFAULT 0",
    "ADD COLUMN `donation_items` JSON NULL",
    "ADD COLUMN `account_holder_name` VARCHAR(255) NULL",
    "ADD COLUMN `bank_name` VARCHAR(100) NULL",
    "ADD COLUMN `account_number` VARCHAR(50) NULL",
    "ADD COLUMN `bank_qr_code` VARCHAR(500) NULL",
    "ADD COLUMN `grave_invite_message` TEXT NULL",
    "ADD COLUMN `grave_location_name` VARCHAR(255) NULL",
    "ADD COLUMN `grave_address` TEXT NULL",
    "ADD COLUMN `grave_datetime` DATETIME NULL",
    "ADD COLUMN `map_link` VARCHAR(500) NULL",
    "ADD COLUMN `virtual_link` VARCHAR(500) NULL",
    "ADD COLUMN `enable_rsvp` TINYINT(1) DEFAULT 0",
    "ADD COLUMN `rsvp_collect_name` TINYINT(1) DEFAULT 0",
    "ADD COLUMN `rsvp_collect_phone` TINYINT(1) DEFAULT 0",
    "ADD COLUMN `rsvp_max_guests` INT(11) NULL",
    "ADD COLUMN `view_count` INT(11) DEFAULT 0",
    "ADD COLUMN `flower_count` INT(11) DEFAULT 0",
    "ADD COLUMN `candle_count` INT(11) DEFAULT 0",
    "ADD COLUMN `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
];

foreach ($columns as $column) {
    $sql = "ALTER TABLE `tributes` $column";
    if ($conn->query($sql)) {
        echo "✅ Added column<br>";
    } else {
        // Column might already exist, that's OK
        echo "⚠️ Column might exist already<br>";
    }
}

// Create tribute_messages table
echo "<br>📦 Creating tribute_messages...<br>";
$sql = "CREATE TABLE IF NOT EXISTS `tribute_messages` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

if ($conn->query($sql)) {
    echo "✅ Created tribute_messages table<br>";
} else {
    echo "❌ Error: " . $conn->error . "<br>";
}

// Create tribute_photos table
echo "<br>📦 Creating tribute_photos...<br>";
$sql = "CREATE TABLE IF NOT EXISTS `tribute_photos` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

if ($conn->query($sql)) {
    echo "✅ Created tribute_photos table<br>";
} else {
    echo "❌ Error: " . $conn->error . "<br>";
}

// Create tribute_candles table
echo "<br>📦 Creating tribute_candles...<br>";
$sql = "CREATE TABLE IF NOT EXISTS `tribute_candles` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `tribute_id` INT(11) NOT NULL,
    `lighter_user_id` INT(11) NULL,
    `lighter_name` VARCHAR(255) NULL,
    `candle_message` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_tribute` (`tribute_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

if ($conn->query($sql)) {
    echo "✅ Created tribute_candles table<br>";
} else {
    echo "❌ Error: " . $conn->error . "<br>";
}

// Create tribute_rsvp table
echo "<br>📦 Creating tribute_rsvp...<br>";
$sql = "CREATE TABLE IF NOT EXISTS `tribute_rsvp` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

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
echo "<p>✅ All tables created successfully without foreign key constraints</p>";
echo "<p>📊 Tables created: tributes, tribute_messages, tribute_photos, tribute_candles, tribute_rsvp</p>";

$conn->close();
?>
