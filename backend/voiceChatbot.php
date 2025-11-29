<?php
error_reporting(0);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type'), ngrok-skip-browser-warning;

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
        'error' => 'Configuration error: ' . $e->getMessage()
    ]);
    exit();
}

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        ob_clean();
        echo json_encode(['success' => false, 'error' => 'Invalid request method']);
        exit();
    }

    $input = json_decode(file_get_contents('php://input'), true);
    
    $tribute_id = isset($input['tribute_id']) ? intval($input['tribute_id']) : 0;
    $user_id = isset($input['user_id']) ? intval($input['user_id']) : 0;
    $message = isset($input['message']) ? trim($input['message']) : '';
    
    if ($tribute_id <= 0) {
        ob_clean();
        echo json_encode(['success' => false, 'error' => 'Invalid tribute ID']);
        exit();
    }
    
    if (empty($message)) {
        ob_clean();
        echo json_encode(['success' => false, 'error' => 'Message is required']);
        exit();
    }

    // 🔒 ACCESS CONTROL: Voice Memorial AI is family-only (using config)
    if ($user_id > 0) {
        $stmt = $conn->prepare("SELECT role FROM users WHERE user_id = ?");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();
            
            // Check access using config manager
            if (!$aiConfig->hasAccess('voice', $user['role'])) {
                ob_clean();
                echo json_encode([
                    'success' => false, 
                    'error' => 'Access denied. Voice Memorial AI is available for family members only.',
                    'requires_role' => 'family'
                ]);
                exit();
            }
        }
        $stmt->close();
    }

    // Get voice model
    $stmt = $conn->prepare("SELECT elevenlabs_voice_id FROM voice_models WHERE tribute_id = ? AND status = 'ready' LIMIT 1");
    $stmt->bind_param("i", $tribute_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $voiceModel = $result->fetch_assoc();
    
    if (!$voiceModel) {
        ob_clean();
        echo json_encode(['success' => false, 'error' => 'Voice model not found']);
        exit();
    }
    
    $voice_id = $voiceModel['elevenlabs_voice_id'];

    // Get tribute information
    $stmt = $conn->prepare("SELECT deceased_name, biography FROM tributes WHERE tribute_id = ?");
    $stmt->bind_param("i", $tribute_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $tribute = $result->fetch_assoc();

    // Get personality traits
    $stmt = $conn->prepare("SELECT trait_category, trait_value FROM personality_traits WHERE tribute_id = ?");
    $stmt->bind_param("i", $tribute_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $traits = [];
    while ($row = $result->fetch_assoc()) {
        $traits[] = $row;
    }

    // Get memories (limit to most important ones)
    $stmt = $conn->prepare("SELECT memory_type, memory_text FROM memories_database WHERE tribute_id = ? ORDER BY created_at DESC LIMIT 20");
    $stmt->bind_param("i", $tribute_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $memories = [];
    while ($row = $result->fetch_assoc()) {
        $memories[] = $row;
    }

    // Get recent conversation history for context
    $stmt = $conn->prepare("SELECT user_input, ai_response FROM voice_conversations WHERE tribute_id = ? ORDER BY created_at DESC LIMIT 5");
    $stmt->bind_param("i", $tribute_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $conversationHistory = [];
    while ($row = $result->fetch_assoc()) {
        $conversationHistory[] = $row;
    }
    // Reverse to get chronological order
    $conversationHistory = array_reverse($conversationHistory);

    // Build personality context using config template
    $personalityContext = buildPersonalityContext($tribute, $traits, $memories, $aiConfig);

    // Call DeepSeek API for response (using config settings)
    $aiResponse = callDeepSeekAPI($message, $personalityContext, $conversationHistory, $aiConfig);

    // Call ElevenLabs TTS API for voice (using config settings)
    $audioUrl = callElevenLabsTTS($aiResponse, $voice_id, $aiConfig);

    // Create voice_conversations table if it doesn't exist
    $createTableSQL = "
        CREATE TABLE IF NOT EXISTS voice_conversations (
            id INT PRIMARY KEY AUTO_INCREMENT,
            tribute_id INT NOT NULL,
            user_input TEXT,
            ai_response TEXT,
            audio_url VARCHAR(500),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (tribute_id) REFERENCES tributes(tribute_id) ON DELETE CASCADE
        )
    ";
    $conn->query($createTableSQL);
    
    // Save conversation to database
    $stmt = $conn->prepare("INSERT INTO voice_conversations (tribute_id, user_input, ai_response, audio_url) VALUES (?, ?, ?, ?)");
    if ($stmt) {
        $stmt->bind_param("isss", $tribute_id, $message, $aiResponse, $audioUrl);
        if (!$stmt->execute()) {
            error_log("Failed to save voice conversation: " . $stmt->error);
        }
        $stmt->close();
    } else {
        error_log("Failed to prepare voice conversation insert: " . $conn->error);
    }

    ob_clean();
    echo json_encode([
        'success' => true,
        'response' => $aiResponse,
        'audio_url' => $audioUrl
    ]);

} catch (Exception $e) {
    ob_clean();
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

$conn->close();

/**
 * Build personality context from tribute data using config template
 */
function buildPersonalityContext($tribute, $traits, $memories, $aiConfig) {
    // Format traits for template
    $traitsFormatted = [];
    foreach ($traits as $trait) {
        $traitsFormatted[] = $trait['trait_category'] . ": " . $trait['trait_value'];
    }
    
    // Format memories for template
    $memoriesFormatted = [];
    foreach (array_slice($memories, 0, 15) as $memory) {
        if (!empty($memory['memory_text'])) {
            $memoriesFormatted[] = substr($memory['memory_text'], 0, 150);
        }
    }
    
    // Build context string
    $context = "\n\n=== WHO YOU ARE ===\n";
    $context .= "You are " . ($tribute['deceased_name'] ?? 'the deceased person') . ".\n";
    
    if (!empty($tribute['biography'])) {
        $context .= "Biography: " . $tribute['biography'] . "\n";
    }
    
    if (!empty($traitsFormatted)) {
        $context .= "\n=== YOUR PERSONALITY ===\n";
        $context .= implode("\n", $traitsFormatted) . "\n";
    }
    
    if (!empty($memoriesFormatted)) {
        $context .= "\n=== YOUR MEMORIES ===\n";
        $context .= implode("\n", $memoriesFormatted) . "\n";
    }
    
    return $context;
}
    
/**
 * Call DeepSeek API for AI response (using config settings)
 */
function callDeepSeekAPI($userMessage, $personalityContext, $conversationHistory = [], $aiConfig) {
    // Check if API key is configured
    if (!defined('DEEPSEEK_API_KEY') || empty(DEEPSEEK_API_KEY) || DEEPSEEK_API_KEY === 'your_deepseek_api_key_here') {
        // Return a simple fallback response if API is not configured
        return generateFallbackResponse($userMessage);
    }
    
    // Get model settings from config
    $modelSettings = $aiConfig->getModelSettings('voice');
    
    // DISABLE few-shot learning - rely ONLY on family-provided memories
    // Generic examples contaminate responses with irrelevant content
    $fewShotEnabled = false;
    $fewShotCount = 0;
    
    // Build system prompt WITHOUT generic examples
    // Only use real family data (biography, traits, memories)
    $basePrompt = $aiConfig->getSystemPrompt('voice');
    
    // Append the personalized deceased information to the prompt
    $fullSystemPrompt = $basePrompt . "\n\n" . $personalityContext;
    
    // Build messages array with conversation history
    $messages = [
        [
            'role' => 'system',
            'content' => $fullSystemPrompt
        ]
    ];
    
    // Add previous conversation for context (last 5 messages)
    foreach ($conversationHistory as $msg) {
        $messages[] = [
            'role' => 'user',
            'content' => $msg['user_input']
        ];
        $messages[] = [
            'role' => 'assistant',
            'content' => $msg['ai_response']
        ];
    }
    
    // Add current message
    $messages[] = [
        'role' => 'user',
        'content' => $userMessage
    ];
    
    // Use dynamic settings from config
    $data = [
        'model' => DEEPSEEK_MODEL,
        'messages' => $messages,
        'temperature' => $modelSettings['temperature'],
        'max_tokens' => $modelSettings['max_tokens'],
        'top_p' => $modelSettings['top_p'],
        'frequency_penalty' => $modelSettings['frequency_penalty'],
        'presence_penalty' => $modelSettings['presence_penalty']
    ];
    
    $curl = curl_init();
    
    curl_setopt_array($curl, [
        CURLOPT_URL => DEEPSEEK_API_URL,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($data),
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . DEEPSEEK_API_KEY
        ],
        CURLOPT_TIMEOUT => 30
    ]);
    
    $response = curl_exec($curl);
    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    $error = curl_error($curl);
    curl_close($curl);
    
    if ($error) {
        // Return fallback on cURL error
        return generateFallbackResponse($userMessage);
    }
    
    if ($httpCode !== 200) {
        // Return fallback on API error (including insufficient balance)
        return generateFallbackResponse($userMessage);
    }
    
    $responseData = json_decode($response, true);
    
    if (!isset($responseData['choices'][0]['message']['content'])) {
        return generateFallbackResponse($userMessage);
    }
    
    return $responseData['choices'][0]['message']['content'];
}

/**
 * Generate a simple fallback response when AI API is unavailable
 */
function generateFallbackResponse($userMessage) {
    $message_lower = strtolower($userMessage);
    
    // Greeting responses
    if (preg_match('/\b(hi|hey|hello|good morning|good afternoon)\b/i', $userMessage)) {
        $greetings = [
            "Hey there! Good to hear from you.",
            "Hi! I'm so glad you're here.",
            "Hello! How are you doing today?",
            "Hey! It's wonderful to talk with you."
        ];
        return $greetings[array_rand($greetings)];
    }
    
    // Missing/love responses
    if (strpos($message_lower, 'miss') !== false || strpos($message_lower, 'love') !== false) {
        $love_responses = [
            "I miss you too, so much. You're always in my heart.",
            "I love you more than words can say. How are you holding up?",
            "Missing you too. You know I'm always with you, right?",
            "I love you too. Tell me, how have things been?"
        ];
        return $love_responses[array_rand($love_responses)];
    }
    
    // Memory/remember responses
    if (strpos($message_lower, 'remember') !== false || strpos($message_lower, 'memory') !== false) {
        $memory_responses = [
            "Oh yes, those are such precious memories. What specifically stands out to you?",
            "I remember that too. Those were good times, weren't they?",
            "That's one of my favorite memories! Makes me smile just thinking about it.",
            "I'll never forget those moments. They meant the world to me."
        ];
        return $memory_responses[array_rand($memory_responses)];
    }
    
    // How are you responses
    if (preg_match('/\bhow (are|r) (you|u)\b/i', $userMessage) || 
        preg_match('/\bhow\'s (it|everything)\b/i', $userMessage)) {
        $status_responses = [
            "I'm at peace, watching over you. How about you?",
            "I'm doing well, just thinking of you. How are things with you?",
            "I'm good. More importantly, how are YOU doing?",
            "Peaceful and content. But tell me about you - how's life?"
        ];
        return $status_responses[array_rand($status_responses)];
    }
    
    // Sad/hard responses
    if (strpos($message_lower, 'sad') !== false || 
        strpos($message_lower, 'hard') !== false || 
        strpos($message_lower, 'difficult') !== false ||
        strpos($message_lower, 'hurts') !== false) {
        $comfort_responses = [
            "I know it's tough. I'm always here with you, even if you can't see me.",
            "I wish I could hug you right now. You're stronger than you know.",
            "It's okay to feel that way. I'm right here, and I always will be.",
            "I'm so sorry you're going through this. You're not alone."
        ];
        return $comfort_responses[array_rand($comfort_responses)];
    }
    
    // Questions
    if (strpos($message_lower, '?') !== false || 
        preg_match('/\b(what|when|where|why|who|which)\b/i', $userMessage)) {
        $question_responses = [
            "That's a great question. What do YOU think?",
            "Hmm, I wish I could give you a better answer to that.",
            "I'm not entirely sure, but I'd love to hear your thoughts on it.",
            "That's something worth thinking about together."
        ];
        return $question_responses[array_rand($question_responses)];
    }
    
    // Generic warm responses
    $generic_responses = [
        "Thank you for sharing that with me.",
        "I'm so glad we can talk like this.",
        "That means a lot to me. Tell me more?",
        "I appreciate you keeping my memory alive.",
        "It's wonderful to hear from you.",
        "You're always on my mind too.",
        "I'm listening. Go on.",
        "That's really important to me. Thanks for telling me."
    ];
    
    return $generic_responses[array_rand($generic_responses)];
}

/**
 * Call ElevenLabs TTS API to generate voice (using config settings)
 */
function callElevenLabsTTS($text, $voiceId, $aiConfig) {
    // Check if API is configured
    if (!defined('ELEVENLABS_API_KEY') || empty(ELEVENLABS_API_KEY) || ELEVENLABS_API_KEY === 'your_elevenlabs_api_key_here') {
        // Return null if TTS is not available (text-only response)
        return null;
    }
    
    // Get voice settings from config
    $voiceSettings = $aiConfig->getVoiceSettings();
    
    $url = ELEVENLABS_API_URL . '/text-to-speech/' . $voiceId;
    
    $data = [
        'text' => $text,
        'model_id' => $voiceSettings['model_id'],
        'voice_settings' => [
            'stability' => $voiceSettings['stability'],
            'similarity_boost' => $voiceSettings['similarity_boost']
        ]
    ];
    
    $curl = curl_init();
    
    curl_setopt_array($curl, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($data),
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'xi-api-key: ' . ELEVENLABS_API_KEY
        ],
        CURLOPT_TIMEOUT => 30
    ]);
    
    $response = curl_exec($curl);
    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    $error = curl_error($curl);
    curl_close($curl);
    
    if ($error || $httpCode !== 200) {
        // Return null if TTS fails (text-only response)
        return null;
    }
    
    // Save audio file
    $audioDir = UPLOAD_DIR . 'voice_responses/';
    if (!file_exists($audioDir)) {
        mkdir($audioDir, 0777, true);
    }
    
    $fileName = 'voice_response_' . time() . '_' . uniqid() . '.mp3';
    $filePath = $audioDir . $fileName;
    
    file_put_contents($filePath, $response);
    
    return '/uploads/voice_responses/' . $fileName;
}
?>

