<?php
error_reporting(0);
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type'), ngrok-skip-browser-warning;
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

ob_start();

require_once 'db_connect.php';
require_once 'api_config.php';
require_once 'AIConfigManager.php';

// Initialize AI Configuration Manager
try {
    $aiConfig = new AIConfigManager();
} catch (Exception $e) {
    ob_clean();
    echo json_encode([
        'success' => false,
        'error' => 'Failed to load AI configuration: ' . $e->getMessage()
    ]);
    exit();
}

// Get the request data
$data = json_decode(file_get_contents('php://input'), true);
$message = $data['message'] ?? '';
$userId = $data['user_id'] ?? null;
$tributeId = $data['tribute_id'] ?? null;
$conversationHistory = $data['conversation_history'] ?? [];
$mode = $data['mode'] ?? 'grief'; // 'website' or 'grief'

if (empty($message)) {
    echo json_encode(['success' => false, 'message' => 'Message is required']);
    exit();
}

// 🆘 CRISIS DETECTION - Check for crisis keywords
function detectCrisis($text, $aiConfig) {
    $crisisKeywords = $aiConfig->getCrisisKeywords();
    
    $lowerText = strtolower($text);
    foreach ($crisisKeywords as $keyword) {
        if (strpos($lowerText, $keyword) !== false) {
            return true;
        }
    }
    return false;
}

// If crisis detected, return immediate help resources
if (detectCrisis($message, $aiConfig)) {
    ob_clean();
    echo json_encode([
        'success' => true,
        'reply' => $aiConfig->getCrisisResponse(),
        'crisis_detected' => true
    ]);
    exit();
}

// 🔒 ACCESS CONTROL: Grief counselor mode is family-only
if ($mode === 'grief' && $userId) {
    $stmt = $conn->prepare("SELECT role FROM users WHERE user_id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        
        // Check if user has access to this mode using config
        if (!$aiConfig->hasAccess($mode, $user['role'])) {
            ob_clean();
            echo json_encode([
                'success' => false, 
                'message' => 'Access denied. Counselor AI is available for family members only.',
                'requires_role' => 'family'
            ]);
            exit();
        }
    }
    $stmt->close();
}

// Get system prompt and model settings from config
try {
    // Check if few-shot learning is enabled in config
    $globalSettings = $aiConfig->getGlobalSettings();
    $fewShotEnabled = $globalSettings['few_shot_learning']['enabled'] ?? true;
    $fewShotCount = $globalSettings['few_shot_learning']['example_count'] ?? 5;
    
    // Use enhanced system prompt with few-shot examples if enabled
    // Set to 0 to disable few-shot learning
    $systemPrompt = $fewShotEnabled 
        ? $aiConfig->getEnhancedSystemPrompt($mode, $fewShotCount)
        : $aiConfig->getSystemPrompt($mode);
        
    $modelSettings = $aiConfig->getModelSettings($mode);
} catch (Exception $e) {
    ob_clean();
    echo json_encode([
        'success' => false,
        'error' => 'Configuration error: ' . $e->getMessage()
    ]);
    exit();
}



// Build conversation context
$messages = [
    [
        'role' => 'system',
        'content' => $systemPrompt
    ]
];

// Add conversation history
foreach ($conversationHistory as $msg) {
    $messages[] = [
        'role' => $msg['role'],
        'content' => $msg['content']
    ];
}

// Add current message
$messages[] = [
    'role' => 'user',
    'content' => $message
];

// Prepare API request using config settings
$requestData = [
    'model' => DEEPSEEK_MODEL,
    'messages' => $messages,
    'temperature' => $modelSettings['temperature'],
    'max_tokens' => $modelSettings['max_tokens'],
    'stream' => false
];

// Make API call to DeepSeek
$ch = curl_init(DEEPSEEK_API_URL);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . DEEPSEEK_API_KEY
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestData));
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    ob_clean();
    echo json_encode([
        'success' => false,
        'message' => 'Failed to get response from AI service',
        'error' => $response
    ]);
    exit();
}

$result = json_decode($response, true);

if (isset($result['choices'][0]['message']['content'])) {
    $botReply = $result['choices'][0]['message']['content'];
    
    // Save conversation to database (optional)
    if ($userId && $tributeId) {
        try {
            $stmt = $conn->prepare("
                INSERT INTO chatbot_conversations (user_id, tribute_id, user_message, bot_response, created_at) 
                VALUES (?, ?, ?, ?, NOW())
            ");
            $stmt->bind_param("iiss", $userId, $tributeId, $message, $botReply);
            $stmt->execute();
            $stmt->close();
        } catch (Exception $e) {
            // Log error but don't fail the request
            error_log("Failed to save conversation: " . $e->getMessage());
        }
    }
    
    ob_clean();
    echo json_encode([
        'success' => true,
        'reply' => $botReply,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
} else {
    ob_clean();
    echo json_encode([
        'success' => false,
        'message' => 'Invalid response from AI service',
        'raw_response' => $result
    ]);
}
?>

