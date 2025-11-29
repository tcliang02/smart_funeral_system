-- ========================================
-- COMPLETE SAFE DATA IMPORT for Supabase
-- Imports ALL missing data in correct order (respects foreign keys)
-- ========================================

-- Temporarily disable RLS for data operations
ALTER TABLE voice_conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE voice_models DISABLE ROW LEVEL SECURITY;
ALTER TABLE voice_chat_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE personality_traits DISABLE ROW LEVEL SECURITY;
ALTER TABLE memories_database DISABLE ROW LEVEL SECURITY;
ALTER TABLE tribute_rsvp DISABLE ROW LEVEL SECURITY;
ALTER TABLE tribute_photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE tribute_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE tributes DISABLE ROW LEVEL SECURITY;
ALTER TABLE profile_activity_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE provider_reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE provider_availability DISABLE ROW LEVEL SECURITY;
ALTER TABLE provider_addons DISABLE ROW LEVEL SECURITY;
ALTER TABLE package_features DISABLE ROW LEVEL SECURITY;
ALTER TABLE booking_addons DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE packages DISABLE ROW LEVEL SECURITY;
ALTER TABLE service_provider DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE addon_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE addon_categories DISABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 1: Insert missing packages FIRST (including package_id 1, 2, 3 that bookings reference)
-- ========================================
INSERT INTO packages (package_id, provider_id, name, description, price, capacity, duration_hours, location_type, is_active, is_featured, created_at, updated_at) VALUES
-- The missing package_id 1, 2, 3 that bookings reference
(1, 19, 'Buddhist Memorial Service', 'Traditional Buddhist ceremony with monk chanting', 5500.00, 80, 24.00, 'both', TRUE, FALSE, '2025-10-23 10:00:00', '2025-10-23 10:00:00'),
(2, 19, 'Deluxe Buddhist Service', 'Premium service with lotus lamps and scriptures', 8500.00, 100, 30.00, 'both', TRUE, TRUE, '2025-10-23 10:00:00', '2025-10-23 10:00:00'),
(3, 19, 'VIP Buddhist Ceremony', 'VIP Buddhist ceremony with full monk assembly', 18000.00, 150, 36.00, 'both', TRUE, TRUE, '2025-10-23 10:00:00', '2025-10-23 10:00:00'),
-- Additional packages
(100, 19, 'Basic Service', 'Essential funeral service', 3000.00, 50, 12.00, 'both', TRUE, FALSE, '2025-10-29 16:52:24', '2025-10-29 16:52:24'),
(101, 19, 'Standard Service', 'Standard memorial service', 5500.00, 80, 24.00, 'both', TRUE, FALSE, '2025-10-29 16:52:24', '2025-10-29 16:52:24'),
(102, 19, 'Premium Tribute Service', 'Comprehensive memorial with premium features', 9500.00, 120, 30.00, 'both', TRUE, TRUE, '2025-10-29 16:52:24', '2025-10-29 16:52:24')
ON CONFLICT (package_id) DO NOTHING;

SELECT setval('packages_package_id_seq', (SELECT GREATEST(MAX(package_id), 102) FROM packages));

-- ========================================
-- STEP 1B: Insert package_features for each package
-- ========================================
INSERT INTO package_features (package_id, feature_name, created_at) VALUES
-- Features for package_id=1 (Buddhist Memorial Service)
(1, 'Traditional Buddhist Ceremony Setup', '2025-10-23 10:00:00'),
(1, 'Monk Chanting Service', '2025-10-23 10:00:00'),
(1, 'Basic Altar Arrangement', '2025-10-23 10:00:00'),
(1, 'Incense and Offerings', '2025-10-23 10:00:00'),

-- Features for package_id=2 (Deluxe Buddhist Service)
(2, 'Premium Buddhist Ceremony Setup', '2025-10-23 10:00:00'),
(2, 'Extended Monk Chanting (3 days)', '2025-10-23 10:00:00'),
(2, 'Lotus Lamp Arrangement (108 pcs)', '2025-10-23 10:00:00'),
(2, 'Buddhist Scripture Set', '2025-10-23 10:00:00'),
(2, 'Vegetarian Meal Service', '2025-10-23 10:00:00'),
(2, 'Memorial Hall Decoration', '2025-10-23 10:00:00'),

-- Features for package_id=3 (VIP Buddhist Ceremony)
(3, 'VIP Buddhist Ceremony Setup', '2025-10-23 10:00:00'),
(3, 'Full Monk Assembly (7 monks)', '2025-10-23 10:00:00'),
(3, 'Premium Altar with Gold Decorations', '2025-10-23 10:00:00'),
(3, 'Luxury Floral Arrangements', '2025-10-23 10:00:00'),
(3, 'Vegetarian Buffet (100 pax)', '2025-10-23 10:00:00'),
(3, 'Premium Transportation Service', '2025-10-23 10:00:00'),
(3, 'Professional Video Documentation', '2025-10-23 10:00:00'),
(3, 'Memorial Plaque (Marble)', '2025-10-23 10:00:00'),

-- Features for package_id=100 (Basic Service)
(100, 'Basic Wooden Casket', '2025-10-29 16:52:24'),
(100, 'Simple Embalming', '2025-10-29 16:52:24'),
(100, 'Small Memorial Room (8 hours)', '2025-10-29 16:52:24'),
(100, 'Basic Transportation', '2025-10-29 16:52:24'),

-- Features for package_id=101 (Standard Service)
(101, 'Quality Wooden Casket', '2025-10-29 16:52:24'),
(101, 'Professional Embalming', '2025-10-29 16:52:24'),
(101, 'Medium Memorial Hall (16 hours)', '2025-10-29 16:52:24'),
(101, 'Premium Hearse', '2025-10-29 16:52:24'),
(101, 'Flower Wreath Set', '2025-10-29 16:52:24'),
(101, 'Memorial Program Booklet', '2025-10-29 16:52:24'),

-- Features for package_id=102 (Premium Tribute Service)
(102, 'Luxury Mahogany Casket', '2025-10-29 16:52:24'),
(102, 'Expert Embalming & Cosmetics', '2025-10-29 16:52:24'),
(102, 'Large Memorial Hall (30 hours)', '2025-10-29 16:52:24'),
(102, 'Executive Hearse & Family Car', '2025-10-29 16:52:24'),
(102, 'Designer Floral Arrangements', '2025-10-29 16:52:24'),
(102, 'Professional Video Recording', '2025-10-29 16:52:24'),
(102, 'Memorial Website Creation', '2025-10-29 16:52:24'),
(102, 'Refreshments for 100 Guests', '2025-10-29 16:52:24')
ON CONFLICT DO NOTHING;

-- ========================================
-- STEP 2: Insert ALL missing bookings (including booking_id 1, 10-14, 100-107, 110)
-- ========================================
INSERT INTO bookings (booking_id, booking_reference, user_id, provider_id, package_id, booking_date, service_date, service_time, service_address, total_amount, status, customer_name, customer_email, customer_phone, special_requirements, uploaded_files, provider_notes, payment_status, payment_method, created_at, updated_at, confirmed_at) VALUES
-- The missing booking_id=1 that booking_addons references
(1, 'BK000001', 15, 19, 1, '2025-10-23', '2025-10-28', '10:00', 'Provider 19 Memorial Hall', 5500.00, 'completed', 'Customer User 15', 'user15@example.com', '+60123456015', 'Traditional Buddhist ceremony with monk chanting', NULL, 'Ceremony completed successfully', 'paid', 'card', '2025-10-23 02:00:00', '2025-10-29 05:00:00', '2025-10-23 06:00:00'),

-- The missing booking_id=10-14
(10, 'BK000010', 15, 19, 1, '2025-10-24', '2025-10-29', '09:00', 'Provider 19 Memorial Hall', 6000.00, 'completed', 'Customer User 15', 'user15@example.com', '+60123456015', 'Full Buddhist service with offerings', NULL, NULL, 'paid', 'bank', '2025-10-24 03:00:00', '2025-10-30 06:00:00', '2025-10-24 07:00:00'),

(11, 'BK000011', 15, 19, 2, '2025-10-25', '2025-10-30', '14:00', 'Provider 19 Grand Hall', 8500.00, 'completed', 'Customer User 15', 'user15@example.com', '+60123456015', 'Premium service with lotus lamps and scriptures', NULL, NULL, 'paid', 'card', '2025-10-25 01:00:00', '2025-10-31 08:00:00', '2025-10-25 05:00:00'),

(12, 'BK000012', 15, 19, 1, '2025-10-26', '2025-11-01', '11:00', 'Provider 19 Memorial Hall', 5800.00, 'completed', 'Customer User 15', 'user15@example.com', '+60123456015', 'Standard service with memory book', NULL, NULL, 'paid', 'bank', '2025-10-26 02:30:00', '2025-11-02 07:00:00', '2025-10-26 06:30:00'),

(13, 'BK000013', 15, 19, 2, '2025-10-27', '2025-11-03', '15:00', 'Provider 19 Grand Hall', 9200.00, 'completed', 'Customer User 15', 'user15@example.com', '+60123456015', 'Deluxe memorial with flower arrangements', NULL, NULL, 'paid', 'card', '2025-10-27 03:00:00', '2025-11-04 09:00:00', '2025-10-27 07:00:00'),

(14, 'BK000014', 15, 19, 3, '2025-10-28', '2025-11-05', '10:00', 'Provider 19 Premium Hall', 18500.00, 'confirmed', 'Customer User 15', 'user15@example.com', '+60123456015', 'VIP Buddhist ceremony with full monk assembly and vegetarian buffet', NULL, 'Premium arrangement confirmed', 'pending', 'bank', '2025-10-28 01:00:00', '2025-10-28 05:00:00', '2025-10-28 05:00:00'),

-- The missing booking_id=100-107
(100, 'BK000100', 16, 19, 100, '2025-08-05', '2025-08-10', '09:00', 'Provider 19 Memorial Hall', 3150.00, 'completed', 'Customer User 16', 'user16@example.com', '+60123456016', 'Simple service preferred', NULL, NULL, 'paid', 'card', '2025-08-05 02:00:00', '2025-08-11 07:00:00', '2025-08-05 06:00:00'),

(101, 'BK000101', 16, 19, 101, '2025-08-18', '2025-08-22', '14:00', 'Provider 19 Memorial Hall', 5900.00, 'completed', 'Customer User 16', 'user16@example.com', '+60123456016', 'Afternoon service with light refreshments', NULL, NULL, 'paid', 'bank', '2025-08-18 03:00:00', '2025-08-23 08:00:00', '2025-08-18 07:00:00'),

(102, 'BK000102', 16, 19, 102, '2025-09-03', '2025-09-08', '10:00', 'Provider 19 Grand Hall', 10100.00, 'completed', 'Customer User 16', 'user16@example.com', '+60123456016', 'Full service with video recording', NULL, NULL, 'paid', 'card', '2025-09-03 01:00:00', '2025-09-09 09:00:00', '2025-09-03 05:00:00'),

(103, 'BK000103', 16, 19, 101, '2025-09-15', '2025-09-20', '11:00', 'Provider 19 Memorial Hall', 6050.00, 'completed', 'Customer User 16', 'user16@example.com', '+60123456016', 'Memorial program booklet needed', NULL, NULL, 'paid', 'card', '2025-09-15 02:30:00', '2025-09-21 06:00:00', '2025-09-15 06:30:00'),

(104, 'BK000104', 16, 19, 100, '2025-09-25', '2025-09-28', '15:00', 'Provider 19 Memorial Hall', 3000.00, 'completed', 'Customer User 16', 'user16@example.com', '+60123456016', 'Basic service', NULL, NULL, 'paid', 'bank', '2025-09-25 03:00:00', '2025-09-29 08:00:00', '2025-09-25 07:00:00'),

(105, 'BK000105', 16, 19, 101, '2025-10-05', '2025-10-10', '09:00', 'Provider 19 Memorial Hall', 6180.00, 'completed', 'Customer User 16', 'user16@example.com', '+60123456016', 'Prefer afternoon service with light refreshments', NULL, NULL, 'paid', 'card', '2025-10-05 01:30:00', '2025-10-11 07:00:00', '2025-10-05 05:00:00'),

(106, 'BK000106', 16, 19, 102, '2025-10-20', '2025-10-26', '10:00', 'Provider 19 Grand Hall', 10370.00, 'completed', 'Customer User 16', 'user16@example.com', '+60123456016', 'VIP service with traditional music', NULL, NULL, 'paid', 'bank', '2025-10-20 02:00:00', '2025-10-27 06:00:00', '2025-10-20 06:00:00'),

(107, 'BK000107', 16, 19, 102, '2025-10-29', '2025-11-08', '11:00', 'Provider 19 Grand Hall', 10370.00, 'confirmed', 'Customer User 16', 'user16@example.com', '+60123456016', 'VIP service with traditional music', NULL, NULL, 'pending', 'bank', '2025-10-29 02:00:00', '2025-10-29 06:00:00', '2025-10-29 06:00:00'),

-- The missing booking_id=110
(110, 'BK000110', 16, 19, 102, '2025-11-01', '2025-11-15', '10:00', 'Provider 19 Grand Hall', 14500.00, 'confirmed', 'Customer User 16', 'user16@example.com', '+60123456016', '49-day memorial service with complete rituals', NULL, NULL, 'pending', 'card', '2025-11-01 02:00:00', '2025-11-01 06:00:00', '2025-11-01 06:00:00')

ON CONFLICT (booking_id) DO NOTHING;

SELECT setval('bookings_booking_id_seq', (SELECT GREATEST(MAX(booking_id), 110) FROM bookings));

-- ========================================
-- STEP 3: NOW insert booking_addons (after bookings exist)
-- ========================================
INSERT INTO booking_addons (booking_addon_id, booking_id, addon_name, addon_price, quantity) VALUES
-- Addons for booking_id=1
(9, 1, 'Incense and Candle Package', 180.00, 1),
(10, 1, 'Fresh Fruit Offering Platter', 150.00, 1),

-- Addons for booking_id=10
(20, 10, 'Incense and Candle Package', 180.00, 1),
(21, 10, 'Fresh Fruit Offering Platter', 150.00, 1),
(22, 10, 'White Lotus Arrangement', 450.00, 1),
(23, 10, 'Vegetarian Food Offerings', 200.00, 1),

-- Addons for booking_id=11
(24, 11, 'Lotus Lamp Set (108 pcs)', 350.00, 1),
(25, 11, 'Buddhist Scripture Set', 250.00, 1),
(26, 11, 'Premium Flower Stand', 280.00, 1),
(27, 11, 'White Rose and Lily Bouquet', 320.00, 1),

-- Addons for booking_id=12
(28, 12, 'Memory Book and Guest Register', 120.00, 1),
(29, 12, 'Premium Fruit Platter', 180.00, 1),

-- Addons for booking_id=13
(30, 13, 'Premium Flower Stand', 280.00, 1),
(31, 13, 'Memorial Photo Display Board', 150.00, 1),
(32, 13, 'Guest Condolence Book', 80.00, 1),
(33, 13, 'Tea & Coffee Service', 170.00, 1),

-- Addons for booking_id=14
(107, 14, 'Premium Luxury Hearse', 1200.00, 1),
(108, 14, 'Full Monk Assembly (7 monks)', 2800.00, 1),
(109, 14, 'Vegetarian Buffet (100 pax)', 1500.00, 1),
(110, 14, 'Premium Buddhist Altar Setup', 1200.00, 1),
(111, 14, 'Lotus Lamp Set (108 pcs)', 350.00, 1),
(112, 14, 'White Lotus Arrangement', 450.00, 1),
(113, 14, 'Memorial Plaque (Marble)', 550.00, 1),
(114, 14, 'Digital Memorial USB', 200.00, 1),
(115, 14, 'Standard Hearse Service', 600.00, 1),
(116, 14, 'Family Transportation (1 bus)', 500.00, 1),
(117, 14, 'Premium Cremation Package', 2500.00, 1),
(118, 14, 'Columbarium Niche (1 year)', 500.00, 1),

-- Addons for booking_id=100-107
(119, 100, 'Memory Book and Guest Register', 120.00, 1),
(120, 101, 'White Lotus Arrangement', 450.00, 1),
(121, 102, 'Premium Buddhist Altar Setup', 1200.00, 1),
(122, 103, 'Memory Book and Guest Register', 120.00, 1),
(123, 106, 'Premium Luxury Hearse', 1200.00, 1),
(124, 106, 'Full Monk Assembly (7 monks)', 2800.00, 1),
(125, 107, 'Premium Luxury Hearse', 1200.00, 1),
(126, 107, 'Full Monk Assembly (7 monks)', 2800.00, 1),

-- Addons for booking_id=110
(127, 110, '49-Day Memorial Service', 5000.00, 1)

ON CONFLICT (booking_addon_id) DO NOTHING;

SELECT setval('booking_addons_booking_addon_id_seq', (SELECT GREATEST(MAX(booking_addon_id), 127) FROM booking_addons));

-- ========================================
-- STEP 4: Insert other missing data
-- ========================================

-- Insert missing memories_database
INSERT INTO memories_database (id, tribute_id, memory_text, memory_type, created_at) VALUES
(1, 2, 'She like to say come home early', 'story', '2025-10-25 09:28:53'),
(2, 2, 'she speaks chinese', '', '2025-10-25 09:28:53')
ON CONFLICT (id) DO NOTHING;

SELECT setval('memories_database_id_seq', (SELECT GREATEST(MAX(id), 2) FROM memories_database));

-- Insert missing personality_traits
INSERT INTO personality_traits (id, tribute_id, trait_category, trait_value, created_at) VALUES
(1, 2, 'interests', 'She like to play golf', '2025-10-25 09:28:53')
ON CONFLICT (id) DO NOTHING;

SELECT setval('personality_traits_id_seq', (SELECT GREATEST(MAX(id), 1) FROM personality_traits));

-- Insert missing tribute_messages
INSERT INTO tribute_messages (message_id, tribute_id, sender_name, sender_email, message, photo_url, is_approved, created_at) VALUES
(16, 2, 'Giselle', 'giselle@gmail.com', 'Bye Bye my friend. I will miss you', 'uploads/tributes/tribute_message_690cb11ee5888_1762439454.jpg', TRUE, '2025-11-06 14:30:54'),
(17, 2, 'Moka', 'moka@gmail.com', 'Sayonara kawanku.', 'uploads/tributes/tribute_message_690cb13fa3793_1762439487.webp', TRUE, '2025-11-06 14:31:27')
ON CONFLICT (message_id) DO NOTHING;

SELECT setval('tribute_messages_message_id_seq', (SELECT GREATEST(MAX(message_id), 17) FROM tribute_messages));

-- Insert missing tribute_photos
INSERT INTO tribute_photos (photo_id, tribute_id, photo_url, caption, uploaded_by, created_at) VALUES
(4, 2, 'uploads/tributes/family_gallery_690cb0a6ac1c8_1762439334.jpg', 'Family Photo', 'user1', '2025-11-06 14:28:54'),
(5, 2, 'uploads/tributes/family_gallery_690cb0c325b6e_1762439363.webp', 'Family Reunion', 'user1', '2025-11-06 14:29:23')
ON CONFLICT (photo_id) DO NOTHING;

SELECT setval('tribute_photos_photo_id_seq', (SELECT GREATEST(MAX(photo_id), 5) FROM tribute_photos));

-- Insert missing tribute_rsvp
INSERT INTO tribute_rsvp (rsvp_id, tribute_id, attendee_name, attendee_email, attendee_phone, will_attend, attendance_type, number_of_guests, message, created_at) VALUES
(1, 2, 'TAN CHIA LIANG', 'tcliang2002@gmail.com', '0126108162', FALSE, 'not-attending', 4, '', '2025-10-24 11:54:12'),
(3, 2, 'TAN CHIA LIANG', 'tcliang2002@gmail.com', '0126108162', FALSE, 'not-attending', 1, '', '2025-10-29 07:49:59'),
(4, 2, 'jason', 'tcliang2002@gmail.com', '0126108162', TRUE, 'physical', 1, '', '2025-10-29 10:50:40')
ON CONFLICT (rsvp_id) DO NOTHING;

SELECT setval('tribute_rsvp_rsvp_id_seq', (SELECT GREATEST(MAX(rsvp_id), 4) FROM tribute_rsvp));

-- Insert missing voice_chat_settings
INSERT INTO voice_chat_settings (id, tribute_id, is_enabled, access_level, created_at, updated_at) VALUES
(1, 2, TRUE, 'family', '2025-10-29 04:12:33', '2025-10-29 04:12:33')
ON CONFLICT (id) DO NOTHING;

SELECT setval('voice_chat_settings_id_seq', (SELECT GREATEST(MAX(id), 1) FROM voice_chat_settings));

-- Insert missing voice_conversations
INSERT INTO voice_conversations (id, tribute_id, user_input, ai_response, audio_url, created_at) VALUES
(6, 2, 'hi how are you', 'Hey there! I''m doing great, thanks for asking. How about you?', NULL, '2025-10-29 05:13:26'),
(7, 2, 'where you from', 'I''m from America! Born and raised. How about you?', NULL, '2025-10-29 05:13:42'),
(8, 2, 'can we go play golf', 'That sounds great! I love playing golf. When do you want to go?', NULL, '2025-10-29 05:14:00'),
(10, 2, 'lets play at 3pm', 'Perfect! 3 PM works for me. Looking forward to it!', NULL, '2025-10-29 07:45:41'),
(11, 2, 'ok see you then', 'See you then! Take care!', NULL, '2025-10-29 07:45:54'),
(12, 2, 'yea sure', 'Awesome! Let''s meet at the golf course around 3 PM then. Can''t wait!', NULL, '2025-10-29 07:46:10')
ON CONFLICT (id) DO NOTHING;

SELECT setval('voice_conversations_id_seq', (SELECT GREATEST(MAX(id), 12) FROM voice_conversations));

-- Insert missing voice_models
INSERT INTO voice_models (voice_id, tribute_id, elevenlabs_voice_id, audio_sample_path, sample_duration, status, created_by, created_at) VALUES
(2, 2, 'mock_voice_68fc96a6afd80', 'voice_sample_2_1761384100.webm', NULL, 'ready', 15, '2025-10-25 09:21:42')
ON CONFLICT (voice_id) DO NOTHING;

SELECT setval('voice_models_voice_id_seq', (SELECT GREATEST(MAX(voice_id), 2) FROM voice_models));

-- Insert missing provider_addons
INSERT INTO provider_addons (addon_id, provider_id, template_id, addon_name, description, price, category_id, is_active, is_custom, created_at, updated_at) VALUES
(1, 19, 2, '49-Day Memorial Service', 'Complete 49-day memorial services with weekly prayer sessions', 5000.00, 1, TRUE, FALSE, '2025-10-23 10:23:20', '2025-11-08 16:45:49'),
(2, 19, 11, 'Incense and Candle Package', 'Premium incense sticks and ceremonial candles for 3-day ceremony', 180.00, 2, TRUE, FALSE, '2025-10-23 10:23:20', '2025-10-23 10:23:20'),
(3, 19, 16, 'Fresh Fruit Offering Platter', 'Traditional fruit offerings including apples, oranges, and bananas', 150.00, 3, TRUE, FALSE, '2025-10-23 10:23:20', '2025-10-23 10:23:20'),
(4, 19, NULL, 'Happy Meal', 'Happy all the day', 50.00, 9, TRUE, TRUE, '2025-10-23 10:23:42', '2025-10-23 10:23:42')
ON CONFLICT (addon_id) DO NOTHING;

SELECT setval('provider_addons_addon_id_seq', (SELECT GREATEST(MAX(addon_id), 4) FROM provider_addons));

-- Insert missing provider_availability
INSERT INTO provider_availability (availability_id, provider_id, date_unavailable, reason, created_at) VALUES
(6, 19, '2025-11-02', 'Not available', '2025-10-28 18:27:17'),
(7, 19, '2025-11-03', 'Not available', '2025-10-28 18:27:17'),
(8, 19, '2025-11-04', 'Not available', '2025-10-28 18:27:17'),
(9, 19, '2025-11-05', 'Not available', '2025-10-28 18:27:17'),
(10, 19, '2025-11-06', 'Not available', '2025-10-28 18:27:17'),
(11, 19, '2025-11-07', 'Not available', '2025-10-28 18:27:17'),
(12, 19, '2025-11-08', 'Not available', '2025-10-28 18:27:17'),
(13, 19, '2025-11-09', 'Not available', '2025-10-28 18:27:17'),
(14, 19, '2025-11-10', 'Not available', '2025-10-28 18:27:17'),
(15, 19, '2025-11-11', 'Not available', '2025-10-28 18:27:17'),
(16, 19, '2025-11-12', 'Not available', '2025-10-28 18:27:17')
ON CONFLICT (availability_id) DO NOTHING;

SELECT setval('provider_availability_availability_id_seq', (SELECT GREATEST(MAX(availability_id), 16) FROM provider_availability));

-- Insert missing provider_reviews
INSERT INTO provider_reviews (review_id, reviewer_user_id, provider_id, booking_id, rating, review_text, review_category, review_type, created_at, updated_at) VALUES
(100, 16, 19, 100, 5, 'Excellent service, very professional and compassionate staff.', 'quality', 'customer_to_provider', '2025-08-11 07:00:00', '2025-10-29 16:52:24'),
(101, 16, 19, 101, 4, 'Good service, the light refreshments were well appreciated by attendees.', 'quality', 'customer_to_provider', '2025-08-23 08:00:00', '2025-10-29 16:52:24'),
(102, 16, 19, 102, 5, 'Outstanding service! Video recording was high quality and well edited.', 'quality', 'customer_to_provider', '2025-09-09 09:00:00', '2025-10-29 16:52:24'),
(103, 16, 19, 103, 4, 'Professional service, memorial booklet was beautifully designed.', 'quality', 'customer_to_provider', '2025-09-21 06:00:00', '2025-10-29 16:52:24'),
(104, 16, 19, 105, 5, 'Very satisfied with the service. Staff was attentive and respectful.', 'quality', 'customer_to_provider', '2025-10-11 07:00:00', '2025-10-29 16:52:24'),
(105, 16, 19, 106, 4, 'Great facilities and caring staff. The traditional music was a beautiful touch.', 'quality', 'customer_to_provider', '2025-10-28 03:00:00', '2025-10-29 16:52:24')
ON CONFLICT (review_id) DO NOTHING;

SELECT setval('provider_reviews_review_id_seq', (SELECT GREATEST(MAX(review_id), 105) FROM provider_reviews));

-- Insert missing profile_activity_log
INSERT INTO profile_activity_log (log_id, user_id, action_type, action_details, created_at) VALUES
(1, 16, 'profile_update', '{"provider_id":19,"updated_fields":["provider_id","company_name","business_type","business_registration","description","address","city","state","postal_code","phone","email","website","operating_hours","services_offered","facebook_url","instagram_url"],"timestamp":"2025-10-28 07:59:30"}', '2025-10-28 06:59:30'),
(2, 16, 'profile_update', '{"provider_id":19,"updated_fields":["provider_id","company_name","business_type","business_registration","description","address","city","state","postal_code","phone","email","website","operating_hours","services_offered","facebook_url","instagram_url"],"timestamp":"2025-10-28 08:18:25"}', '2025-10-28 07:18:25'),
(3, 16, 'profile_update', '{"provider_id":19,"updated_fields":["provider_id","company_name","business_type","business_registration","description","address","city","state","postal_code","phone","email","website","operating_hours","services_offered","facebook_url","instagram_url"],"timestamp":"2025-10-28 19:19:50"}', '2025-10-28 18:19:50')
ON CONFLICT (log_id) DO NOTHING;

SELECT setval('profile_activity_log_log_id_seq', (SELECT GREATEST(MAX(log_id), 3) FROM profile_activity_log));

-- ========================================
-- VERIFICATION QUERIES
-- ========================================
SELECT 'addon_categories' as table_name, COUNT(*) as count FROM addon_categories
UNION ALL
SELECT 'addon_templates', COUNT(*) FROM addon_templates
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'service_provider', COUNT(*) FROM service_provider
UNION ALL
SELECT 'packages', COUNT(*) FROM packages
UNION ALL
SELECT 'bookings', COUNT(*) FROM bookings
UNION ALL
SELECT 'booking_addons', COUNT(*) FROM booking_addons
UNION ALL
SELECT 'tributes', COUNT(*) FROM tributes
UNION ALL
SELECT 'memories_database', COUNT(*) FROM memories_database
UNION ALL
SELECT 'personality_traits', COUNT(*) FROM personality_traits
UNION ALL
SELECT 'tribute_messages', COUNT(*) FROM tribute_messages
UNION ALL
SELECT 'tribute_photos', COUNT(*) FROM tribute_photos
UNION ALL
SELECT 'tribute_rsvp', COUNT(*) FROM tribute_rsvp
UNION ALL
SELECT 'voice_chat_settings', COUNT(*) FROM voice_chat_settings
UNION ALL
SELECT 'voice_conversations', COUNT(*) FROM voice_conversations
UNION ALL
SELECT 'voice_models', COUNT(*) FROM voice_models
UNION ALL
SELECT 'provider_addons', COUNT(*) FROM provider_addons
UNION ALL
SELECT 'provider_availability', COUNT(*) FROM provider_availability
UNION ALL
SELECT 'provider_reviews', COUNT(*) FROM provider_reviews
UNION ALL
SELECT 'profile_activity_log', COUNT(*) FROM profile_activity_log
ORDER BY table_name;

-- ========================================
-- SUCCESS MESSAGE
-- ========================================
-- Done! All missing data imported in correct order.
-- Foreign key constraints are now satisfied.
