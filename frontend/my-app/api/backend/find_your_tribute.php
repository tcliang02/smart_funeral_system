<?php
echo "=== CHECKING ALL TRIBUTES IN DATABASE ===\n\n";

require_once 'db_connect.php';

$sql = "SELECT tribute_id, deceased_name, portrait_photo, account_number, account_holder_name, bank_name, bank_qr_code, creator_user_id FROM tributes ORDER BY tribute_id DESC";
$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    echo "Found " . $result->num_rows . " tributes:\n";
    echo str_repeat("=", 80) . "\n";
    
    while ($row = $result->fetch_assoc()) {
        echo "\nID: " . $row['id'] . " | Name: " . $row['deceased_name'] . " | Creator: " . $row['creator_user_id'] . "\n";
        echo "  Portrait: " . ($row['portrait_photo'] ?: 'NULL') . "\n";
        echo "  Account Number: " . ($row['account_number'] ?: 'NULL') . "\n";
        echo "  Account Holder: " . ($row['account_holder_name'] ?: 'NULL') . "\n";
        echo "  Bank Name: " . ($row['bank_name'] ?: 'NULL') . "\n";
        echo "  QR Code: " . ($row['bank_qr_code'] ?: 'NULL') . "\n";
        echo str_repeat("-", 80) . "\n";
    }
} else {
    echo "No tributes found!\n";
}

echo "\n=== WHICH TRIBUTE ID ARE YOU VIEWING? ===\n";
echo "Please check your browser URL. It should be something like:\n";
echo "http://localhost:5173/tribute/X  (where X is the ID number)\n\n";

echo "Based on the bank_name 'qqqqqqq' you mentioned, let me find it:\n";
$sql = "SELECT tribute_id, deceased_name FROM tributes WHERE bank_name LIKE '%qqq%'";
$result = $conn->query($sql);
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        echo ">>> YOU ARE VIEWING TRIBUTE ID: " . $row['id'] . " (" . $row['deceased_name'] . ")\n";
        
        // Now test this specific ID
        echo "\n=== TESTING API FOR YOUR TRIBUTE ===\n";
        $_SERVER['REQUEST_METHOD'] = 'GET';
        $_GET['id'] = $row['id'];
        
        ob_start();
        include 'getTribute.php';
        $response = ob_get_clean();
        
        // Extract JSON
        $lines = explode("\n", $response);
        foreach ($lines as $line) {
            if (strpos($line, '{"success"') === 0) {
                $data = json_decode($line, true);
                if ($data && $data['success']) {
                    echo "API Response for ID " . $row['id'] . ":\n";
                    echo "  portrait_photo: " . ($data['tribute']['portrait_photo'] ?: 'NULL') . "\n";
                    echo "  bank_account_number: " . ($data['tribute']['bank_account_number'] ?: 'NULL') . "\n";
                    echo "  bank_account_name: " . ($data['tribute']['bank_account_name'] ?: 'NULL') . "\n";
                    echo "  bank_name: " . ($data['tribute']['bank_name'] ?: 'NULL') . "\n";
                    echo "  donation_qr_code: " . ($data['tribute']['donation_qr_code'] ?: 'NULL') . "\n";
                }
                break;
            }
        }
    }
} else {
    echo "Could not find tribute with bank_name containing 'qqq'\n";
}
?>