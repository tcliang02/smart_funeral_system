<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Content-Type: text/html; charset=UTF-8");
include "db_connect.php";

// Process form submission for editing packages
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    if ($_POST['action'] === 'update' && isset($_POST['package_id'])) {
        // Update package details
        $package_id = intval($_POST['package_id']);
        $name = $_POST['name'];
        $description = $_POST['description'];
        $price = floatval($_POST['price']);
        $capacity = $_POST['capacity'] ?? null;
        $duration_hours = $_POST['duration_hours'] ?? null;
        $location_type = $_POST['location_type'] ?? 'both';
        $is_featured = isset($_POST['is_featured']) ? 1 : 0;
        
        // Update the package
        $update_sql = "UPDATE packages SET 
                        name = ?, 
                        description = ?, 
                        price = ?, 
                        capacity = ?, 
                        duration_hours = ?, 
                        location_type = ?,
                        is_featured = ?
                       WHERE package_id = ?";
        $update_stmt = $conn->prepare($update_sql);
        $update_stmt->bind_param("ssdsssii", $name, $description, $price, $capacity, $duration_hours, $location_type, $is_featured, $package_id);
        
        if ($update_stmt->execute()) {
            $message = "Package updated successfully!";
            $message_type = "success";
        } else {
            $message = "Error updating package: " . $conn->error;
            $message_type = "error";
        }
    }
}

// Get the provider ID
$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 8; // Default to user_id 8
$provider_query = "SELECT provider_id, company_name FROM service_provider WHERE user_id = ?";
$stmt = $conn->prepare($provider_query);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$provider_id = null;
$company_name = "Unknown Provider";

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $provider_id = $row['provider_id'];
    $company_name = $row['company_name'];
}

// Get package details if editing
$edit_package = null;
if (isset($_GET['edit']) && is_numeric($_GET['edit'])) {
    $edit_id = intval($_GET['edit']);
    $edit_sql = "SELECT * FROM packages WHERE package_id = ? AND provider_id = ?";
    $edit_stmt = $conn->prepare($edit_sql);
    $edit_stmt->bind_param("ii", $edit_id, $provider_id);
    $edit_stmt->execute();
    $edit_result = $edit_stmt->get_result();
    
    if ($edit_result->num_rows > 0) {
        $edit_package = $edit_result->fetch_assoc();
    }
}

// Get all packages for this provider with full details
$sql = "SELECT * FROM packages WHERE provider_id = ? ORDER BY is_featured DESC, created_at DESC";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $provider_id);
$stmt->execute();
$packages_result = $stmt->get_result();

// Get package features
$features = [];
$table_check = $conn->query("SHOW TABLES LIKE 'package_features'");
if ($table_check->num_rows > 0) {
    $features_sql = "SELECT * FROM package_features WHERE package_id IN (SELECT package_id FROM packages WHERE provider_id = ?)";
    $features_stmt = $conn->prepare($features_sql);
    $features_stmt->bind_param("i", $provider_id);
    $features_stmt->execute();
    $features_result = $features_stmt->get_result();
    
    while ($feature = $features_result->fetch_assoc()) {
        if (!isset($features[$feature['package_id']])) {
            $features[$feature['package_id']] = [];
        }
        $features[$feature['package_id']][] = $feature;
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Package Management - <?php echo htmlspecialchars($company_name); ?></title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100 font-sans">
    <div class="container mx-auto px-4 py-8">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold text-gray-800"><?php echo htmlspecialchars($company_name); ?> - Package Management</h1>
            <a href="show_package_details.php" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Refresh</a>
        </div>
        
        <?php if (isset($message)): ?>
            <div class="mb-4 p-4 rounded <?php echo $message_type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'; ?>">
                <?php echo $message; ?>
            </div>
        <?php endif; ?>

        <?php if ($edit_package): ?>
            <!-- Edit Package Form -->
            <div class="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 class="text-xl font-semibold mb-4">Edit Package: <?php echo htmlspecialchars($edit_package['name']); ?></h2>
                <form method="post" action="">
                    <input type="hidden" name="action" value="update">
                    <input type="hidden" name="package_id" value="<?php echo $edit_package['package_id']; ?>">
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-gray-700 font-medium mb-2" for="name">Package Name</label>
                            <input type="text" id="name" name="name" value="<?php echo htmlspecialchars($edit_package['name']); ?>" required
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-gray-700 font-medium mb-2" for="price">Price (RM)</label>
                            <input type="number" id="price" name="price" value="<?php echo $edit_package['price']; ?>" step="0.01" required
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-gray-700 font-medium mb-2" for="description">Description</label>
                        <textarea id="description" name="description" rows="4" required
                                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"><?php echo htmlspecialchars($edit_package['description']); ?></textarea>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label class="block text-gray-700 font-medium mb-2" for="capacity">Capacity</label>
                            <input type="text" id="capacity" name="capacity" value="<?php echo htmlspecialchars($edit_package['capacity'] ?? ''); ?>"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-gray-700 font-medium mb-2" for="duration_hours">Duration (hours)</label>
                            <input type="text" id="duration_hours" name="duration_hours" value="<?php echo htmlspecialchars($edit_package['duration_hours'] ?? ''); ?>"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-gray-700 font-medium mb-2" for="location_type">Location Type</label>
                            <select id="location_type" name="location_type"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="both" <?php echo ($edit_package['location_type'] ?? '') === 'both' ? 'selected' : ''; ?>>Indoor & Outdoor</option>
                                <option value="indoor" <?php echo ($edit_package['location_type'] ?? '') === 'indoor' ? 'selected' : ''; ?>>Indoor Only</option>
                                <option value="outdoor" <?php echo ($edit_package['location_type'] ?? '') === 'outdoor' ? 'selected' : ''; ?>>Outdoor Only</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="mb-4">
                        <label class="flex items-center">
                            <input type="checkbox" name="is_featured" <?php echo $edit_package['is_featured'] ? 'checked' : ''; ?>
                                   class="h-5 w-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500">
                            <span class="ml-2 text-gray-700">Featured Package</span>
                        </label>
                    </div>
                    
                    <div class="flex justify-end space-x-4">
                        <a href="show_package_details.php" class="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">Cancel</a>
                        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Changes</button>
                    </div>
                </form>
            </div>
        <?php endif; ?>
        
        <!-- Packages Table -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
                <h2 class="text-xl font-semibold text-gray-800">All Packages (Provider ID: <?php echo $provider_id ?? 'Unknown'; ?>)</h2>
            </div>
            
            <?php if ($packages_result && $packages_result->num_rows > 0): ?>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            <?php while ($package = $packages_result->fetch_assoc()): ?>
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"><?php echo $package['package_id']; ?></td>
                                    <td class="px-6 py-4 text-sm text-gray-900">
                                        <p class="font-medium"><?php echo htmlspecialchars($package['name']); ?></p>
                                        <p class="text-xs text-gray-500"><?php echo substr(htmlspecialchars($package['description']), 0, 50); ?>...</p>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">RM <?php echo number_format($package['price'], 2); ?></td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><?php echo htmlspecialchars($package['capacity'] ?? 'N/A'); ?></td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><?php echo htmlspecialchars($package['duration_hours'] ?? 'N/A'); ?> hrs</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><?php echo htmlspecialchars($package['location_type'] ?? 'N/A'); ?></td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <?php if ($package['is_featured']): ?>
                                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">Featured</span>
                                        <?php else: ?>
                                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">No</span>
                                        <?php endif; ?>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><?php echo date('Y-m-d', strtotime($package['created_at'])); ?></td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <a href="?edit=<?php echo $package['package_id']; ?>" class="text-indigo-600 hover:text-indigo-900 mr-3">Edit</a>
                                    </td>
                                </tr>
                                <?php if (!empty($features[$package['package_id']])): ?>
                                    <tr>
                                        <td class="px-6 py-4" colspan="9">
                                            <div class="pl-4 border-l-2 border-green-500">
                                                <p class="text-xs font-semibold text-gray-600 mb-1">Features:</p>
                                                <div class="flex flex-wrap gap-2">
                                                    <?php foreach ($features[$package['package_id']] as $feature): ?>
                                                        <span class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                                            <?php echo htmlspecialchars($feature['feature_name']); ?>
                                                        </span>
                                                    <?php endforeach; ?>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                <?php endif; ?>
                            <?php endwhile; ?>
                        </tbody>
                    </table>
                </div>
            <?php else: ?>
                <div class="px-6 py-12 text-center">
                    <p class="text-gray-500">No packages found for this provider</p>
                </div>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>
<?php $conn->close(); ?>