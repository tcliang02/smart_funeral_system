<?php
require_once 'backend/db_connect.php';

// Check if bank columns exist in tributes table
$result = $conn->query("DESCRIBE tributes");
$columns = [];
while ($row = $result->fetch_assoc()) {
    $columns[] = $row['Field'];
}

echo "Checking bank-related columns in tributes table...\n";

$required_bank_columns = [
    'bank_account_number' => 'VARCHAR(50)',
    'bank_account_name' => 'VARCHAR(100)', 
    'bank_name' => 'VARCHAR(100)',
    'donation_qr_code' => 'VARCHAR(255)'
];

$missing = [];
foreach ($required_bank_columns as $col => $type) {
    if (!in_array($col, $columns)) {
        $missing[] = "ALTER TABLE tributes ADD COLUMN $col $type;";
        echo "❌ Missing: $col\n";
    } else {
        echo "✅ Found: $col\n";
    }
}

if (!empty($missing)) {
    echo "\nAdding missing columns...\n";
    foreach ($missing as $sql) {
        if ($conn->query($sql)) {
            echo "✅ Added column\n";
        } else {
            echo "❌ Error: " . $conn->error . "\n";
        }
    }
}

// Now update tribute ID 2 with sample bank info
echo "\nUpdating tribute ID 2 with sample bank information...\n";
$update_sql = "UPDATE tributes SET 
    bank_account_number = '1234567890',
    bank_account_name = 'Johnny Memorial Fund',
    bank_name = 'First National Bank',
    donation_qr_code = 'qr_code_placeholder.png'
    WHERE tribute_id = 2";

if ($conn->query($update_sql)) {
    echo "✅ Bank information added successfully!\n";
} else {
    echo "❌ Error: " . $conn->error . "\n";
}

echo "\nDonation section should now display properly!\n";
?>