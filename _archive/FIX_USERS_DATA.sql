-- ========================================
-- FIX USERS DATA - Update with correct data from HeidiSQL
-- ========================================

-- Disable RLS temporarily
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Update existing users with correct data
UPDATE users SET 
    name = 'user1',
    username = 'user1',
    email = 'tcliang2002@gmail.com',
    password = '$2y$10$Q7ddRUxY1.ksfLXBdZoF/usThO.8IE9UVJ7OgCMJvQOW8D5lRtM32',
    role = 'family',
    is_active = TRUE,
    created_at = '2025-10-23 13:34:29',
    updated_at = '2025-10-28 13:22:24'
WHERE user_id = 15;

UPDATE users SET 
    name = 'provider1',
    username = 'provider1',
    email = 'provider1@gmail.com',
    password = '$2y$10$lk8zx4H6KepIJ2.lCI9cLuCkqRo5VNGX9mlIpZQMyGcWzmKQnrRhq',
    role = 'provider',
    is_active = TRUE,
    created_at = '2025-10-23 14:35:55',
    updated_at = '2025-10-28 13:22:24'
WHERE user_id = 16;

UPDATE users SET 
    name = 'Peaceful Rest',
    username = 'peacefulrest',
    email = 'peacefulrest@example.com',
    password = '$2y$10$Q7ddRUxY1.ksfLXBdZoF/usThO.8IE9UVJ7OgCMJvQOW8D5lRtM32',
    role = 'provider',
    is_active = TRUE,
    created_at = '2025-10-30 00:30:04',
    updated_at = '2025-10-30 00:30:04'
WHERE user_id = 20;

UPDATE users SET 
    name = 'Harmony Memorial',
    username = 'harmonymemorial',
    email = 'harmony@example.com',
    password = '$2y$10$Q7ddRUxY1.ksfLXBdZoF/usThO.8IE9UVJ7OgCMJvQOW8D5lRtM32',
    role = 'provider',
    is_active = TRUE,
    created_at = '2025-10-30 00:30:05',
    updated_at = '2025-10-30 00:30:05'
WHERE user_id = 21;

UPDATE users SET 
    name = 'Alice Wong',
    username = 'alicewong',
    email = 'alice@example.com',
    password = '$2y$10$Q7ddRUxY1.ksfLXBdZoF/usThO.8IE9UVJ7OgCMJvQOW8D5lRtM32',
    role = 'family',
    is_active = TRUE,
    created_at = '2025-10-30 00:30:05',
    updated_at = '2025-10-30 00:30:05'
WHERE user_id = 22;

UPDATE users SET 
    name = 'Bob Tan',
    username = 'bobtan',
    email = 'bob@example.com',
    password = '$2y$10$Q7ddRUxY1.ksfLXBdZoF/usThO.8IE9UVJ7OgCMJvQOW8D5lRtM32',
    role = 'family',
    is_active = TRUE,
    created_at = '2025-10-30 00:30:05',
    updated_at = '2025-10-30 00:30:05'
WHERE user_id = 23;

UPDATE users SET 
    name = 'Carol Lee',
    username = 'carollee',
    email = 'carol@example.com',
    password = '$2y$10$Q7ddRUxY1.ksfLXBdZoF/usThO.8IE9UVJ7OgCMJvQOW8D5lRtM32',
    role = 'family',
    is_active = TRUE,
    created_at = '2025-10-30 00:30:05',
    updated_at = '2025-10-30 00:30:05'
WHERE user_id = 24;

-- Verify the updates
SELECT user_id, name, username, email, role 
FROM users 
ORDER BY user_id;

-- ========================================
-- SUCCESS!
-- ========================================
-- All users updated with correct data from MySQL
-- User 16 is now: provider1 (not "Provider User")
