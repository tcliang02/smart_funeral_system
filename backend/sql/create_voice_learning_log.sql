-- Voice Learning Log Table
-- Tracks AI learning interactions from quick questions
-- Helps analyze what questions users ask and how AI responds

CREATE TABLE IF NOT EXISTS voice_learning_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tribute_id INT NOT NULL,
    question_category VARCHAR(50) NOT NULL COMMENT 'greeting, reaction, wisdom, comfort, emotion',
    user_message TEXT NOT NULL COMMENT 'The quick question user clicked',
    ai_response TEXT NOT NULL COMMENT 'How the AI responded',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_tribute (tribute_id),
    INDEX idx_category (question_category),
    INDEX idx_created (created_at),
    
    FOREIGN KEY (tribute_id) REFERENCES tributes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Example queries for analysis:

-- 1. See all learning interactions for a specific memorial
-- SELECT * FROM voice_learning_log WHERE tribute_id = 1 ORDER BY created_at DESC;

-- 2. See most common question categories
-- SELECT question_category, COUNT(*) as count 
-- FROM voice_learning_log 
-- GROUP BY question_category 
-- ORDER BY count DESC;

-- 3. See how AI greets users (greeting category)
-- SELECT user_message, ai_response 
-- FROM voice_learning_log 
-- WHERE question_category = 'greeting' 
-- LIMIT 10;

-- 4. Analyze AI's comfort responses
-- SELECT user_message, ai_response 
-- FROM voice_learning_log 
-- WHERE question_category = 'comfort' 
-- ORDER BY created_at DESC;
