<?php
/**
 * AI Configuration Manager
 * Loads and manages AI prompt configurations from JSON files
 * 
 * @version 1.0.0
 * @author Smart Funeral System
 */

class AIConfigManager {
    private $config;
    private $configPath;
    
    /**
     * Constructor - Load configuration from JSON file
     */
    public function __construct($configPath = null) {
        if ($configPath === null) {
            $this->configPath = __DIR__ . '/config/ai_prompts.json';
        } else {
            $this->configPath = $configPath;
        }
        
        $this->loadConfig();
    }
    
    /**
     * Load configuration from JSON file
     */
    private function loadConfig() {
        if (!file_exists($this->configPath)) {
            throw new Exception("AI configuration file not found: " . $this->configPath);
        }
        
        $jsonContent = file_get_contents($this->configPath);
        $this->config = json_decode($jsonContent, true);
        
        if ($this->config === null) {
            throw new Exception("Invalid JSON in AI configuration file");
        }
    }
    
    /**
     * Get system prompt for a specific mode
     * 
     * @param string $mode The AI mode (grief_counselor, website_helper, voice_memorial)
     * @return string The system prompt
     */
    public function getSystemPrompt($mode) {
        $modeKey = $this->getModeKey($mode);
        
        if (!isset($this->config['modes'][$modeKey])) {
            throw new Exception("AI mode not found: " . $mode);
        }
        
        return $this->config['modes'][$modeKey]['system_prompt'];
    }
    
    /**
     * Get model settings for a specific mode
     * 
     * @param string $mode The AI mode
     * @return array Model settings (temperature, max_tokens, etc.)
     */
    public function getModelSettings($mode) {
        $modeKey = $this->getModeKey($mode);
        
        if (!isset($this->config['modes'][$modeKey])) {
            throw new Exception("AI mode not found: " . $mode);
        }
        
        return $this->config['modes'][$modeKey]['model_settings'];
    }
    
    /**
     * Get crisis keywords for grief counselor mode
     * 
     * @return array List of crisis keywords
     */
    public function getCrisisKeywords() {
        if (isset($this->config['modes']['grief_counselor']['crisis_keywords'])) {
            return $this->config['modes']['grief_counselor']['crisis_keywords'];
        }
        return [];
    }
    
    /**
     * Get crisis response message
     * 
     * @return string Crisis response message
     */
    public function getCrisisResponse() {
        if (isset($this->config['modes']['grief_counselor']['crisis_response'])) {
            return $this->config['modes']['grief_counselor']['crisis_response'];
        }
        return "Please contact a crisis helpline immediately.";
    }
    
    /**
     * Get allowed roles for a specific mode
     * 
     * @param string $mode The AI mode
     * @return array List of allowed roles
     */
    public function getAllowedRoles($mode) {
        $modeKey = $this->getModeKey($mode);
        
        if (!isset($this->config['modes'][$modeKey])) {
            return [];
        }
        
        return $this->config['modes'][$modeKey]['access_roles'] ?? [];
    }
    
    /**
     * Get quick actions for website helper
     * 
     * @return array List of quick action buttons
     */
    public function getQuickActions() {
        if (isset($this->config['modes']['website_helper']['quick_actions'])) {
            return $this->config['modes']['website_helper']['quick_actions'];
        }
        return [];
    }
    
    /**
     * Get voice memorial system prompt with placeholders replaced
     * 
     * @param array $data Data to fill placeholders (deceased_name, biography, etc.)
     * @return string Personalized system prompt
     */
    public function getVoiceMemorialPrompt($data) {
        if (!isset($this->config['modes']['voice_memorial']['system_prompt_template'])) {
            throw new Exception("Voice memorial prompt template not found");
        }
        
        $template = $this->config['modes']['voice_memorial']['system_prompt_template'];
        
        // Replace placeholders
        $replacements = [
            '{deceased_name}' => $data['deceased_name'] ?? 'the deceased',
            '{biography}' => $data['biography'] ?? 'No biography available',
            '{personality_traits}' => $data['personality_traits'] ?? 'Kind and caring',
            '{memories}' => $data['memories'] ?? 'Many cherished memories'
        ];
        
        return str_replace(array_keys($replacements), array_values($replacements), $template);
    }
    
    /**
     * Load few-shot examples from dataset
     * 
     * @param string $mode The AI mode (grief_counselor, website_helper, voice_memorial)
     * @param int $count Number of examples to load (default: 5)
     * @return array Array of examples with 'instruction' and 'response'
     */
    public function loadFewShotExamples($mode, $count = 5) {
        $modeKey = $this->getModeKey($mode);
        
        // Map mode to dataset file
        $datasetMap = [
            'grief_counselor' => __DIR__ . '/datasets/grief_counselor_dataset.json',
            'website_helper' => __DIR__ . '/datasets/website_helper_dataset.json',
            'voice_memorial' => __DIR__ . '/datasets/voice_memorial_dataset.json'
        ];
        
        if (!isset($datasetMap[$modeKey])) {
            return [];
        }
        
        $datasetPath = $datasetMap[$modeKey];
        
        if (!file_exists($datasetPath)) {
            return [];
        }
        
        $jsonContent = file_get_contents($datasetPath);
        $dataset = json_decode($jsonContent, true);
        
        if (!is_array($dataset) || empty($dataset)) {
            return [];
        }
        
        // Get random examples
        $count = min($count, count($dataset));
        $randomKeys = array_rand($dataset, $count);
        
        // If only 1 example, array_rand returns int not array
        if (!is_array($randomKeys)) {
            $randomKeys = [$randomKeys];
        }
        
        $examples = [];
        foreach ($randomKeys as $key) {
            $examples[] = $dataset[$key];
        }
        
        return $examples;
    }
    
    /**
     * Get enhanced system prompt with few-shot examples
     * 
     * @param string $mode The AI mode
     * @param int $exampleCount Number of examples to include (default: 5, 0 = disabled)
     * @return string Enhanced system prompt with examples
     */
    public function getEnhancedSystemPrompt($mode, $exampleCount = 5) {
        $basePrompt = $this->getSystemPrompt($mode);
        
        // If few-shot disabled or no examples requested, return base prompt
        if ($exampleCount <= 0) {
            return $basePrompt;
        }
        
        $examples = $this->loadFewShotExamples($mode, $exampleCount);
        
        if (empty($examples)) {
            return $basePrompt;
        }
        
        // Build few-shot section
        $fewShotSection = "\n\n## High-Quality Response Examples\n\n";
        $fewShotSection .= "Here are examples of excellent responses that demonstrate the tone, style, and depth expected:\n\n";
        
        foreach ($examples as $i => $example) {
            $num = $i + 1;
            $fewShotSection .= "Example {$num}:\n";
            $fewShotSection .= "User: " . $example['instruction'] . "\n";
            $fewShotSection .= "Assistant: " . $example['response'] . "\n\n";
        }
        
        $fewShotSection .= "Now respond to the user's actual message in the same natural, empathetic style as shown above.";
        
        return $basePrompt . $fewShotSection;
    }
    
    /**
     * Get voice settings for ElevenLabs
     * 
     * @return array Voice generation settings
     */
    public function getVoiceSettings() {
        if (isset($this->config['modes']['voice_memorial']['voice_settings'])) {
            return $this->config['modes']['voice_memorial']['voice_settings'];
        }
        return [
            'stability' => 0.75,
            'similarity_boost' => 0.85
        ];
    }
    
    /**
     * Get global settings
     * 
     * @return array Global configuration settings
     */
    public function getGlobalSettings() {
        return $this->config['global_settings'] ?? [];
    }
    
    /**
     * Get API endpoint URL
     * 
     * @param string $api API name (deepseek, elevenlabs)
     * @return string API endpoint URL
     */
    public function getApiEndpoint($api) {
        $key = $api . '_url';
        return $this->config['api_endpoints'][$key] ?? null;
    }
    
    /**
     * Convert mode alias to config key
     * 
     * @param string $mode Mode from request (grief, website, voice)
     * @return string Config key (grief_counselor, website_helper, voice_memorial)
     */
    private function getModeKey($mode) {
        $mapping = [
            'grief' => 'grief_counselor',
            'website' => 'website_helper',
            'voice' => 'voice_memorial'
        ];
        
        return $mapping[$mode] ?? $mode;
    }
    
    /**
     * Check if user has access to a specific mode
     * 
     * @param string $mode AI mode
     * @param string $userRole User's role
     * @return bool True if user has access
     */
    public function hasAccess($mode, $userRole) {
        $allowedRoles = $this->getAllowedRoles($mode);
        
        // If no roles specified, allow all
        if (empty($allowedRoles)) {
            return true;
        }
        
        // Guest users are considered as 'attendee'
        if ($userRole === 'guest' || $userRole === null) {
            $userRole = 'attendee';
        }
        
        return in_array($userRole, $allowedRoles);
    }
    
    /**
     * Get configuration version
     * 
     * @return string Version number
     */
    public function getVersion() {
        return $this->config['version'] ?? '1.0.0';
    }
    
    /**
     * Get last updated date
     * 
     * @return string Last updated date
     */
    public function getLastUpdated() {
        return $this->config['last_updated'] ?? date('Y-m-d');
    }
    
    /**
     * Validate configuration structure
     * 
     * @return bool True if valid
     * @throws Exception if invalid
     */
    public function validateConfig() {
        $requiredKeys = ['version', 'modes', 'global_settings'];
        
        foreach ($requiredKeys as $key) {
            if (!isset($this->config[$key])) {
                throw new Exception("Missing required configuration key: " . $key);
            }
        }
        
        // Validate each mode has required fields
        foreach ($this->config['modes'] as $modeName => $modeConfig) {
            $requiredModeKeys = ['name', 'description', 'model_settings', 'system_prompt'];
            
            foreach ($requiredModeKeys as $key) {
                if (!isset($modeConfig[$key])) {
                    throw new Exception("Mode '{$modeName}' missing required key: {$key}");
                }
            }
        }
        
        return true;
    }
}
