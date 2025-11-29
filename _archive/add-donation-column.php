<?php
require_once 'backend/db_connect.php';

// Add donation_items column if it doesn't exist
echo "Adding donation_items column...\n";
$sql = "ALTER TABLE tributes ADD COLUMN donation_items JSON";
if ($conn->query($sql)) {
    echo "✅ donation_items column added successfully!\n";
} else {
    echo "Note: " . $conn->error . "\n";
}

// Now add sample donation items
$donation_items = [
    [
        'name' => 'Memorial Flowers',
        'description' => 'Beautiful flower arrangements for the memorial service',
        'price' => 50.00,
        'image' => 'flowers.jpg'
    ],
    [
        'name' => 'Charity Donation',
        'description' => 'Donation to favorite charity in memory of the deceased',
        'price' => 100.00,
        'image' => 'charity.jpg'
    ],
    [
        'name' => 'Memory Book',
        'description' => 'Contribute to a memory book with photos and messages',
        'price' => 25.00,
        'image' => 'book.jpg'
    ]
];

echo "\nAdding sample donation items to tribute ID 2...\n";
$update_sql = "UPDATE tributes SET donation_items = ? WHERE tribute_id = 2";
$stmt = $conn->prepare($update_sql);
$donation_json = json_encode($donation_items);
$stmt->bind_param("s", $donation_json);

if ($stmt->execute()) {
    echo "✅ Donation items added successfully!\n";
    echo "Items added:\n";
    foreach ($donation_items as $item) {
        echo "- {$item['name']}: $" . number_format($item['price'], 2) . "\n";
    }
} else {
    echo "❌ Error adding donation items: " . $conn->error . "\n";
}

echo "\nAll tribute sections should now be fully visible and functional!\n";
?>