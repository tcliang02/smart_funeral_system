<?php
require_once 'db_connect.php';

echo "<h1>🔍 Database Investigation & Fix</h1>";

// Step 1: Get all column names
echo "<h2>Step 1: Finding Column Names</h2>";
$result = $conn->query("DESCRIBE tributes");
$columns = [];
$bankColumns = [];
$photoColumns = [];

while ($row = $result->fetch_assoc()) {
    $col = $row['Field'];
    $columns[] = $col;
    
    // Find bank-related columns
    if (stripos($col, 'bank') !== false || stripos($col, 'account') !== false || stripos($col, 'donation') !== false) {
        $bankColumns[] = $col;
    }
    
    // Find photo-related columns
    if (stripos($col, 'portrait') !== false || stripos($col, 'photo') !== false) {
        $photoColumns[] = $col;
    }
}

echo "<h3>Bank-Related Columns Found:</h3>";
echo "<ul style='color: blue; font-weight: bold;'>";
foreach ($bankColumns as $col) {
    echo "<li>$col</li>";
}
echo "</ul>";

echo "<h3>Photo-Related Columns Found:</h3>";
echo "<ul style='color: green; font-weight: bold;'>";
foreach ($photoColumns as $col) {
    echo "<li>$col</li>";
}
echo "</ul>";

// Step 2: Show current data
echo "<h2>Step 2: Current Data (Tribute ID 1)</h2>";
$result = $conn->query("SELECT * FROM tributes WHERE tribute_id = 1");
if ($row = $result->fetch_assoc()) {
    echo "<table border='1' cellpadding='5'>";
    echo "<tr><th>Column</th><th>Current Value</th></tr>";
    
    // Show only relevant columns
    foreach ($row as $key => $value) {
        if (in_array($key, $bankColumns) || in_array($key, $photoColumns)) {
            $displayValue = ($value === null || $value === '') ? '<span style="color: red; font-weight: bold;">NULL/EMPTY</span>' : htmlspecialchars($value);
            echo "<tr><td><strong>$key</strong></td><td>$displayValue</td></tr>";
        }
    }
    echo "</table>";
}

// Step 3: Identify exact column names needed
echo "<h2>Step 3: Column Mapping</h2>";

$columnMap = [
    'portrait_photo' => null,
    'bank_account_number' => null,
    'bank_account_name' => null,
    'bank_name' => null,
    'donation_qr_code' => null
];

echo "<p>Frontend expects these columns:</p>";
echo "<ul>";

// Try to find matches
foreach ($columnMap as $expectedCol => &$actualCol) {
    $found = false;
    foreach ($columns as $col) {
        $colLower = strtolower($col);
        $expectedLower = strtolower($expectedCol);
        
        // Direct match
        if ($colLower === $expectedLower) {
            $actualCol = $col;
            $found = true;
            break;
        }
        
        // Partial matches
        if ($expectedCol === 'portrait_photo' && stripos($col, 'portrait') !== false) {
            $actualCol = $col;
            $found = true;
        } elseif ($expectedCol === 'bank_account_number' && stripos($col, 'account') !== false && stripos($col, 'number') !== false) {
            $actualCol = $col;
            $found = true;
        } elseif ($expectedCol === 'bank_account_name' && stripos($col, 'account') !== false && stripos($col, 'name') !== false) {
            $actualCol = $col;
            $found = true;
        } elseif ($expectedCol === 'bank_name' && stripos($col, 'bank') !== false && stripos($col, 'name') !== false && stripos($col, 'account') === false) {
            $actualCol = $col;
            $found = true;
        } elseif ($expectedCol === 'donation_qr_code' && (stripos($col, 'qr') !== false || stripos($col, 'donation') !== false)) {
            $actualCol = $col;
            $found = true;
        }
    }
    
    if ($found) {
        echo "<li><strong>$expectedCol</strong> → <span style='color: green;'>✅ $actualCol</span></li>";
    } else {
        echo "<li><strong>$expectedCol</strong> → <span style='color: red;'>❌ NOT FOUND</span></li>";
    }
}
unset($actualCol);

echo "</ul>";

// Step 4: Update data if columns found
echo "<h2>Step 4: Updating Data</h2>";

$updates = [];
$values = [
    'portrait_photo' => 'uploads/tributes/sample_portrait.jpg',
    'bank_account_number' => '1234567890',
    'bank_account_name' => 'John Doe Memorial Fund',
    'bank_name' => 'SStar Bank',
    'donation_qr_code' => 'uploads/tributes/sample_qr.png'
];

foreach ($columnMap as $expectedCol => $actualCol) {
    if ($actualCol !== null) {
        $updates[] = "$actualCol = '" . $conn->real_escape_string($values[$expectedCol]) . "'";
    }
}

if (!empty($updates)) {
    $sql = "UPDATE tributes SET " . implode(', ', $updates) . " WHERE tribute_id = 1";
    echo "<p><strong>SQL Query:</strong></p>";
    echo "<pre style='background: #f0f0f0; padding: 10px; border-radius: 5px;'>" . htmlspecialchars($sql) . "</pre>";
    
    if ($conn->query($sql)) {
        echo "<p style='color: green; font-weight: bold; font-size: 18px;'>✅ SUCCESS! Data updated.</p>";
    } else {
        echo "<p style='color: red; font-weight: bold;'>❌ ERROR: " . $conn->error . "</p>";
    }
} else {
    echo "<p style='color: orange; font-weight: bold;'>⚠️ No columns found to update!</p>";
}

// Step 5: Show updated data
echo "<h2>Step 5: Updated Data</h2>";
$result = $conn->query("SELECT * FROM tributes WHERE tribute_id = 1");
if ($row = $result->fetch_assoc()) {
    echo "<table border='1' cellpadding='5'>";
    echo "<tr><th>Column</th><th>New Value</th></tr>";
    
    foreach ($columnMap as $expectedCol => $actualCol) {
        if ($actualCol !== null && isset($row[$actualCol])) {
            $value = $row[$actualCol];
            $displayValue = ($value === null || $value === '') ? '<span style="color: red;">STILL NULL</span>' : '<span style="color: blue; font-weight: bold;">' . htmlspecialchars($value) . '</span>';
            echo "<tr><td><strong>$actualCol</strong></td><td>$displayValue</td></tr>";
        }
    }
    echo "</table>";
}

// Step 6: Generate JSON to verify
echo "<h2>Step 6: JSON Output (What Frontend Receives)</h2>";
$result = $conn->query("SELECT * FROM tributes WHERE tribute_id = 1");
if ($row = $result->fetch_assoc()) {
    $testData = [];
    foreach ($columnMap as $expectedCol => $actualCol) {
        if ($actualCol !== null) {
            $testData[$expectedCol] = $row[$actualCol];
        } else {
            $testData[$expectedCol] = null;
        }
    }
    
    echo "<pre style='background: #f0f0f0; padding: 10px; border-radius: 5px;'>";
    echo json_encode($testData, JSON_PRETTY_PRINT);
    echo "</pre>";
    
    echo "<h3>Console Log Preview:</h3>";
    echo "<p>📸 Portrait: <strong>" . ($testData['portrait_photo'] ?? 'NULL') . "</strong></p>";
    echo "<p>🏦 Bank Account Number: <strong>" . ($testData['bank_account_number'] ?? 'NULL') . "</strong></p>";
    echo "<p>🏦 Bank Account Name: <strong>" . ($testData['bank_account_name'] ?? 'NULL') . "</strong></p>";
    echo "<p>🏦 Bank Name: <strong>" . ($testData['bank_name'] ?? 'NULL') . "</strong></p>";
    echo "<p>🏦 QR Code: <strong>" . ($testData['donation_qr_code'] ?? 'NULL') . "</strong></p>";
}

$conn->close();

echo "<br><h2 style='color: green;'>✅ Analysis Complete!</h2>";
echo "<p><strong>Next Step:</strong> Refresh your tribute page and check console logs.</p>";
?>
