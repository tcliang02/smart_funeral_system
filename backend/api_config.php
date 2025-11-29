<?php
// API Configuration - DO NOT COMMIT TO PUBLIC REPOSITORIES
// In production, use environment variables or secure config management

define('DEEPSEEK_API_KEY', 'sk-3ff887b3eab042c9a3294fd3d62c8d80');
define('ELEVENLABS_API_KEY', 'sk_c986151a7b7b8133875347496ad0ced54a66d63623c371bf');

// API Endpoints
define('DEEPSEEK_API_URL', 'https://api.deepseek.com/v1/chat/completions');
define('ELEVENLABS_API_URL', 'https://api.elevenlabs.io/v1');

// File Upload Settings
define('MAX_VOICE_SAMPLE_SIZE', 50 * 1024 * 1024); // 50MB
define('ALLOWED_AUDIO_TYPES', ['audio/wav', 'audio/mpeg', 'audio/mp4', 'audio/webm', 'audio/ogg', 'audio/x-m4a']);
define('UPLOAD_DIR', dirname(__DIR__) . '/uploads/');
define('VOICE_SAMPLES_DIR', UPLOAD_DIR . 'voice_samples/');

// Voice Settings
define('MIN_VOICE_DURATION', 30); // seconds
define('MAX_VOICE_DURATION', 180); // seconds (3 minutes)

// Chat Settings
define('MAX_CONVERSATION_HISTORY', 10);
define('DEEPSEEK_MODEL', 'deepseek-chat');
define('DEEPSEEK_MAX_TOKENS', 80);  // ~30-35 words for natural conversation
define('DEEPSEEK_TEMPERATURE', 1.0);  // Higher = more natural/creative/human-like

// Security
define('ENABLE_RATE_LIMITING', true);
define('MAX_REQUESTS_PER_HOUR', 100);

// Create upload directories if they don't exist
if (!file_exists(VOICE_SAMPLES_DIR)) {
    mkdir(VOICE_SAMPLES_DIR, 0777, true);
}
?>
