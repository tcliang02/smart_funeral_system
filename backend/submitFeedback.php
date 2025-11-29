<?php
/**
 * Submit Feedback Endpoint
 * Handles feedback submissions (bugs, feature requests, general feedback)
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'db_connect.php';
require_once 'helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (empty($input['name']) || empty($input['email']) || empty($input['message']) || empty($input['type'])) {
    echo json_encode(['success' => false, 'message' => 'Name, email, message, and type are required']);
    exit;
}

// Validate feedback type
$allowedTypes = ['bug', 'feature', 'general'];
if (!in_array($input['type'], $allowedTypes)) {
    echo json_encode(['success' => false, 'message' => 'Invalid feedback type']);
    exit;
}

// Validate email format
if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit;
}

try {
    // Get user_id if user is logged in (optional)
    $userId = null;
    if (isset($input['user_id']) && !empty($input['user_id'])) {
        $userId = intval($input['user_id']);
    }

    // Insert feedback into database
    $sql = "INSERT INTO feedback (
        user_id,
        feedback_type,
        name,
        email,
        message,
        status
    ) VALUES (?, ?, ?, ?, ?, 'pending')";

    $params = [
        $userId,
        $input['type'],
        trim($input['name']),
        trim($input['email']),
        trim($input['message'])
    ];

    $result = executeQuery($sql, $params);

    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => 'Feedback submitted successfully. Thank you for your input!',
            'feedback_id' => $conn->lastInsertId()
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to submit feedback. Please try again.'
        ]);
    }

} catch (Exception $e) {
    error_log("Error submitting feedback: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while submitting feedback. Please try again later.'
    ]);
}

$conn = null;
?>

