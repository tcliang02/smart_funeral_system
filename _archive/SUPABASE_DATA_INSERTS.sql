-- ========================================
-- COMPLETE DATA INSERTS for Supabase
-- Run this AFTER creating tables with FYP_2910_POSTGRESQL.sql
-- ========================================

-- Clear existing data (optional - remove if you want to keep existing data)
TRUNCATE TABLE voice_conversations, voice_models, voice_chat_settings CASCADE;
TRUNCATE TABLE personality_traits, memories_database CASCADE;
TRUNCATE TABLE tribute_rsvp, tribute_photos, tribute_messages CASCADE;
TRUNCATE TABLE tributes CASCADE;
TRUNCATE TABLE profile_activity_log CASCADE;
TRUNCATE TABLE provider_reviews CASCADE;
TRUNCATE TABLE provider_availability CASCADE;
TRUNCATE TABLE provider_addons CASCADE;
TRUNCATE TABLE package_features CASCADE;
TRUNCATE TABLE booking_addons CASCADE;
TRUNCATE TABLE bookings CASCADE;
TRUNCATE TABLE packages CASCADE;
TRUNCATE TABLE service_provider CASCADE;
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE addon_templates CASCADE;
TRUNCATE TABLE addon_categories CASCADE;

-- Insert addon_categories
INSERT INTO addon_categories (category_id, category_name, description, display_order, created_at) VALUES
(1, 'Buddhist Rituals & Ceremonies', 'Traditional Buddhist funeral ceremonies and rituals', 1, '2025-10-23 05:10:38'),
(2, 'Altars & Religious Items', 'Buddhist altars, statues, and religious offerings', 2, '2025-10-23 05:10:38'),
(3, 'Flowers & Offerings', 'Floral arrangements and traditional offerings for Buddhist ceremonies', 3, '2025-10-23 05:10:38'),
(4, 'Urns & Caskets', 'Traditional urns and caskets suitable for Buddhist funerals', 4, '2025-10-23 05:10:38'),
(5, 'Monks & Chanting Services', 'Buddhist monk services and sutra chanting ceremonies', 5, '2025-10-23 05:10:38'),
(6, 'Memorial Items', 'Memorial plaques, tablets, and remembrance items', 6, '2025-10-23 05:10:38'),
(7, 'Transportation', 'Hearse and family transportation services', 7, '2025-10-23 05:10:38'),
(8, 'Cremation Services', 'Cremation and related services', 8, '2025-10-23 05:10:38'),
(9, 'Food & Refreshments', 'Vegetarian meals and refreshments for funeral attendees', 9, '2025-10-23 05:10:38');

SELECT setval('addon_categories_category_id_seq', (SELECT MAX(category_id) FROM addon_categories));

-- Insert ALL 49 addon_templates
INSERT INTO addon_templates (template_id, category_id, template_name, description, suggested_price, is_popular, created_at) VALUES
(1, 1, '7-Day Buddhist Prayer Ceremony', 'Traditional 7-day prayer ceremony conducted by monks with daily chanting sessions', 2500.00, TRUE, '2025-10-23 05:10:38'),
(2, 1, '49-Day Memorial Service', 'Complete 49-day memorial service with weekly prayer sessions', 5000.00, TRUE, '2025-10-23 05:10:38'),
(3, 1, '100-Day Memorial Service', 'Traditional 100-day memorial prayer ceremony', 1500.00, FALSE, '2025-10-23 05:10:38'),
(4, 1, 'Three-Day Wake Ceremony', 'Three consecutive days of Buddhist wake ceremony with nightly chanting', 1800.00, TRUE, '2025-10-23 05:10:38'),
(5, 1, 'Dharma Talk Service', 'Buddhist master provides dharma talk about life, death, and rebirth', 800.00, FALSE, '2025-10-23 05:10:38'),
(6, 1, 'Merit Dedication Ceremony', 'Special ceremony to dedicate merit to the deceased for better rebirth', 600.00, FALSE, '2025-10-23 05:10:38'),
(7, 1, 'Sutra Recitation Service', 'Professional recitation of Buddhist sutras for 2 hours', 400.00, TRUE, '2025-10-23 05:10:38'),
(8, 2, 'Standard Buddhist Altar Setup', 'Basic altar setup with Buddha statue, incense holder, and candles', 500.00, TRUE, '2025-10-23 05:10:38'),
(9, 2, 'Premium Buddhist Altar Setup', 'Elaborate altar with large Buddha statue, offerings table, and decorative items', 1200.00, TRUE, '2025-10-23 05:10:38'),
(10, 2, 'Lotus Lamp Set (108 pcs)', 'Traditional set of 108 lotus lamps for blessing ceremony', 350.00, TRUE, '2025-10-23 05:10:38'),
(11, 2, 'Incense and Candle Package', 'Premium incense sticks and ceremonial candles for 3-day ceremony', 180.00, TRUE, '2025-10-23 05:10:38'),
(12, 2, 'Buddhist Scripture Set', 'Set of Buddhist sutras and prayer books for ceremony', 250.00, FALSE, '2025-10-23 05:10:38'),
(13, 2, 'Rebirth Prayer Flags', 'Traditional Tibetan prayer flags for blessing the departed', 120.00, FALSE, '2025-10-23 05:10:38'),
(14, 3, 'White Lotus Arrangement', 'Large white lotus flower arrangement symbolizing purity and enlightenment', 450.00, TRUE, '2025-10-23 05:10:38'),
(15, 3, 'Yellow Chrysanthemum Wreath', 'Traditional yellow chrysanthemum wreath for Buddhist funeral', 380.00, TRUE, '2025-10-23 05:10:38'),
(16, 3, 'Fresh Fruit Offering Platter', 'Traditional fruit offerings including apples, oranges, and bananas', 150.00, TRUE, '2025-10-23 05:10:38'),
(17, 3, 'Vegetarian Food Offerings', 'Complete set of vegetarian food offerings for Buddhist ceremony', 200.00, TRUE, '2025-10-23 05:10:38'),
(18, 3, 'White Rose and Lily Bouquet', 'Elegant white rose and lily arrangement', 320.00, FALSE, '2025-10-23 05:10:38'),
(19, 4, 'Standard Ceramic Urn', 'Traditional ceramic urn with Buddhist symbol designs', 350.00, TRUE, '2025-10-23 05:10:38'),
(20, 4, 'Premium Jade Urn', 'High-quality jade urn with intricate Buddhist carvings', 1500.00, FALSE, '2025-10-23 05:10:38'),
(21, 4, 'Wooden Sandalwood Urn', 'Aromatic sandalwood urn with lotus carving', 800.00, TRUE, '2025-10-23 05:10:38'),
(22, 4, 'Biodegradable Urn', 'Eco-friendly biodegradable urn for natural burial', 280.00, FALSE, '2025-10-23 05:10:38'),
(23, 4, 'Cloisonné Enamel Urn', 'Decorative cloisonné urn with Buddhist motifs', 950.00, FALSE, '2025-10-23 05:10:38'),
(24, 4, 'Crystal Memorial Urn', 'Modern crystal urn with LED lighting', 680.00, TRUE, '2025-10-23 05:10:38'),
(25, 5, 'Single Monk Chanting (3 hours)', 'One Buddhist monk performs chanting ceremony for 3 hours', 500.00, TRUE, '2025-10-23 05:10:38'),
(26, 5, 'Triple Monk Chanting Ceremony', 'Three monks perform traditional chanting ceremony', 1200.00, TRUE, '2025-10-23 05:10:38'),
(27, 5, 'Full Monk Assembly (7 monks)', 'Seven monks perform elaborate chanting ceremony', 2800.00, TRUE, '2025-10-23 05:10:38'),
(28, 5, 'Overnight Vigil with Monks', 'Monks perform overnight chanting vigil', 1800.00, FALSE, '2025-10-23 05:10:38'),
(29, 5, 'Blessing and Purification Ritual', 'Special blessing and purification ceremony by senior monk', 700.00, FALSE, '2025-10-23 05:10:38'),
(30, 6, 'Memorial Plaque (Wooden)', 'Engraved wooden memorial plaque with photo frame', 280.00, TRUE, '2025-10-23 05:10:38'),
(31, 6, 'Memorial Plaque (Marble)', 'High-quality marble memorial plaque with custom engraving', 550.00, TRUE, '2025-10-23 05:10:38'),
(32, 6, 'Ancestor Tablet', 'Traditional wooden ancestor tablet with red and gold lacquer', 380.00, TRUE, '2025-10-23 05:10:38'),
(33, 6, 'Photo Frame Display Set', 'Set of 3 premium photo frames for memorial display', 150.00, FALSE, '2025-10-23 05:10:38'),
(34, 6, 'Memory Book and Guest Register', 'Elegant memory book for guests to write condolences', 120.00, TRUE, '2025-10-23 05:10:38'),
(35, 6, 'Digital Memorial USB', 'USB drive with photo slideshow and life story video', 200.00, FALSE, '2025-10-23 05:10:38'),
(36, 7, 'Standard Hearse Service', 'Standard hearse transportation to funeral venue or crematorium', 600.00, TRUE, '2025-10-23 05:10:38'),
(37, 7, 'Premium Luxury Hearse', 'Premium luxury hearse with floral decorations', 1200.00, TRUE, '2025-10-23 05:10:38'),
(38, 7, 'Family Transportation (1 bus)', 'Air-conditioned bus for family and relatives (up to 40 passengers)', 500.00, TRUE, '2025-10-23 05:10:38'),
(39, 7, 'VIP Car Service (3 cars)', 'Three luxury cars for immediate family members', 800.00, FALSE, '2025-10-23 05:10:38'),
(40, 8, 'Standard Cremation Service', 'Basic cremation service with standard urn', 1800.00, TRUE, '2025-10-23 05:10:38'),
(41, 8, 'Premium Cremation Package', 'Premium cremation with memorial urn and certificate', 2500.00, TRUE, '2025-10-23 05:10:38'),
(42, 8, 'Witnessing Cremation Service', 'Family can witness cremation process in private viewing room', 400.00, FALSE, '2025-10-23 05:10:38'),
(43, 8, 'Ash Scattering Ceremony', 'Professional ash scattering ceremony at sea or garden', 600.00, FALSE, '2025-10-23 05:10:38'),
(44, 8, 'Columbarium Niche (1 year)', 'One year columbarium niche rental for urn storage', 500.00, TRUE, '2025-10-23 05:10:38'),
(45, 9, 'Vegetarian Buffet (50 pax)', 'Complete vegetarian buffet for 50 guests', 800.00, TRUE, '2025-10-23 05:10:38'),
(46, 9, 'Vegetarian Buffet (100 pax)', 'Complete vegetarian buffet for 100 guests', 1500.00, TRUE, '2025-10-23 05:10:38'),
(47, 9, 'Tea and Refreshments', 'Tea, coffee, and light refreshments for wake attendees', 250.00, TRUE, '2025-10-23 05:10:38'),
(48, 9, 'Premium Fruit Platter', 'Seasonal fruit platter for refreshments', 180.00, FALSE, '2025-10-23 05:10:38'),
(49, 9, 'Traditional Vegetarian Set Menu', 'Individual vegetarian set meals for 30 guests', 450.00, FALSE, '2025-10-23 05:10:38');

SELECT setval('addon_templates_template_id_seq', (SELECT MAX(template_id) FROM addon_templates));

-- Insert users
INSERT INTO users (user_id, id, name, username, email, password, role, is_active, created_at, updated_at) VALUES
(15, 15, 'user1', 'user1', 'tcliang2002@gmail.com', '$2y$10$Q7ddRUxY1.ksfLXBdZoF/usThO.8IE9UVJ7OgCMJvQOW8D5lRtM32', 'family', TRUE, '2025-10-23 05:34:29', '2025-10-28 05:22:24'),
(16, 16, 'Provider User', 'provider1', 'provider@example.com', '$2y$10$Q7ddRUxY1.ksfLXBdZoF/usThO.8IE9UVJ7OgCMJvQOW8D5lRtM32', 'provider', TRUE, '2025-10-23 05:34:29', '2025-10-23 05:34:29'),
(20, 20, 'Provider Two', 'provider2', 'provider2@example.com', '$2y$10$Q7ddRUxY1.ksfLXBdZoF/usThO.8IE9UVJ7OgCMJvQOW8D5lRtM32', 'provider', TRUE, '2025-10-29 16:30:05', '2025-10-29 16:30:05'),
(21, 21, 'Provider Three', 'provider3', 'provider3@example.com', '$2y$10$Q7ddRUxY1.ksfLXBdZoF/usThO.8IE9UVJ7OgCMJvQOW8D5lRtM32', 'provider', TRUE, '2025-10-29 16:30:05', '2025-10-29 16:30:05'),
(22, 22, 'Alice Wong', 'alicewong', 'alice@example.com', '$2y$10$Q7ddRUxY1.ksfLXBdZoF/usThO.8IE9UVJ7OgCMJvQOW8D5lRtM32', 'family', TRUE, '2025-10-29 16:30:05', '2025-10-29 16:30:05'),
(23, 23, 'Bob Tan', 'bobtan', 'bob@example.com', '$2y$10$Q7ddRUxY1.ksfLXBdZoF/usThO.8IE9UVJ7OgCMJvQOW8D5lRtM32', 'family', TRUE, '2025-10-29 16:30:05', '2025-10-29 16:30:05'),
(24, 24, 'Carol Lee', 'carollee', 'carol@example.com', '$2y$10$Q7ddRUxY1.ksfLXBdZoF/usThO.8IE9UVJ7OgCMJvQOW8D5lRtM32', 'family', TRUE, '2025-10-29 16:30:05', '2025-10-29 16:30:05');

SELECT setval('users_user_id_seq', (SELECT MAX(user_id) FROM users));

-- Insert service_providers
INSERT INTO service_provider (provider_id, user_id, company_name, business_type, business_registration, description, address, city, state, postal_code, phone, email, website, facebook_url, instagram_url, operating_hours, average_price, total_packages, rating, total_reviews, is_verified, is_active, created_at, updated_at) VALUES
(19, 16, 'Nirvana', 'Funeral Services', 'A1563', 'Professional funeral services', '196, Jln Balik Pulau,', 'Ayer Itam', 'Penang', '11500', '+1234567890', 'nirvana@test.com', 'https://nirvana-asia-pg.com/', 'https://www.facebook.com/NirvanaAsiaLtd/', 'https://www.instagram.com/nirvanafunerals.my/', '24/7 hours', 3344.44, 9, 4.67, 9, TRUE, TRUE, '2025-10-23 09:57:14', '2025-11-07 07:32:34'),
(20, 20, 'Peaceful Rest Memorial', 'Funeral Services', 'BR20250001', 'Complete funeral and memorial services', '100 Memorial Avenue', 'George Town', 'Penang', '10200', '+60123456789', 'peaceful@example.com', 'https://peaceful-rest.com', NULL, NULL, 'Mon-Sun 24 hours', 6015.00, 2, 4.50, 2, FALSE, TRUE, '2025-10-29 16:30:05', '2025-10-29 17:09:06'),
(21, 21, 'Harmony Memorial Services', 'Funeral Services', 'BR20250002', 'Modern funeral services with Buddhist traditions', '200 Serenity Road', 'Bukit Tinggi', 'Johor', '11500', '+60198765432', 'harmony@example.com', 'https://harmony-memorial.com', NULL, NULL, 'Mon-Sun 8AM-10PM', 9166.67, 3, 5.00, 1, FALSE, TRUE, '2025-10-29 16:30:05', '2025-10-29 17:09:06');

SELECT setval('service_provider_provider_id_seq', (SELECT MAX(provider_id) FROM service_provider));

-- Insert packages (showing main packages - add more from your HeidiSQL if needed)
INSERT INTO packages (package_id, provider_id, name, description, price, capacity, duration_hours, location_type, is_active, is_featured, created_at, updated_at) VALUES
(22, 19, 'Basic Service 16', 'Essential funeral service package', 2500.00, 10, 10.00, 'home', TRUE, FALSE, '2025-10-23 09:57:14', '2025-10-23 11:45:54'),
(26, 19, 'Deluxe Funeral 1', 'Deluxe funeral service with all amenities', 5000.00, 50, 20.00, 'hall', TRUE, TRUE, '2025-10-23 11:45:47', '2025-10-23 11:45:47'),
(30, 20, 'Standard Memorial Package', 'Complete memorial service with basic amenities', 3500.00, 30, 15.00, 'both', TRUE, FALSE, '2025-10-29 16:30:05', '2025-10-29 16:30:05'),
(31, 20, 'Premium Memorial Package', 'Premium memorial with enhanced features', 6000.00, 50, 20.00, 'hall', TRUE, TRUE, '2025-10-29 16:30:05', '2025-10-29 16:30:05'),
(34, 21, 'Harmony Basic Service', 'Affordable funeral service with Buddhist ceremonies', 4000.00, 40, 18.00, 'both', TRUE, FALSE, '2025-10-29 16:30:05', '2025-10-29 16:30:05'),
(37, 19, 'Standard Plus Service', 'Enhanced funeral service package', 4500.00, 80, 25.00, 'both', TRUE, FALSE, '2025-10-29 16:52:24', '2025-10-29 16:52:24'),
(38, 19, 'Premium Memorial Service', 'Premium memorial with all features', 8000.00, 100, 28.00, 'hall', TRUE, TRUE, '2025-10-29 16:52:24', '2025-10-29 16:52:24'),
(100, 19, 'Basic Service', 'Essential funeral service', 3000.00, 50, 12.00, 'both', TRUE, FALSE, '2025-10-29 16:52:24', '2025-10-29 16:52:24'),
(101, 19, 'Standard Service', 'Standard memorial service', 5500.00, 80, 24.00, 'both', TRUE, FALSE, '2025-10-29 16:52:24', '2025-10-29 16:52:24'),
(102, 19, 'Premium Tribute Service', 'Comprehensive memorial with premium features', 9500.00, 120, 30.00, 'both', TRUE, TRUE, '2025-10-29 16:52:24', '2025-10-29 16:52:24');

SELECT setval('packages_package_id_seq', (SELECT MAX(package_id) FROM packages));

-- Insert bookings (ALL 17 bookings from your database)
INSERT INTO bookings (booking_id, booking_reference, user_id, provider_id, package_id, booking_date, service_date, service_time, service_address, total_amount, status, customer_name, customer_email, customer_phone, special_requirements, uploaded_files, provider_notes, payment_status, payment_method, created_at, updated_at, confirmed_at) VALUES
(1, 'BK000001', 15, 19, 26, NULL, '2025-10-27', NULL, E'undefined\n123 Provider Street\nCost: RM 500.00', 8330.00, 'completed', 'TAN CHIA LIANG', 'tcliang2002@gmail.com', '+60126108162', 'hahahh', '["uploads/TEMP_1761281870630_latest_exam_slip_1761281870.png","uploads/TEMP_1761281870630_02de4844fa0fb374d03a052af1bbb758f6a9b678_rpt_slipPendaftaranKursus_1761281870.pdf"]', E'\nBooking confirmed by provider\nService completed successfully', 'pending', 'bank', '2025-10-24 04:57:50', '2025-10-24 05:59:15', '2025-10-24 05:41:48'),
(10, 'BK000010', 22, 20, 31, '2025-10-15', '2025-10-20', '09:00', 'Memorial Hall A, Peaceful Rest, 100 Memorial Avenue', 8330.00, 'completed', 'Alice Wong', 'alice@example.com', '+60123456001', 'Buddhist ceremony preferred', NULL, NULL, '', 'bank', '2025-10-15 02:00:00', '2025-10-21 10:00:00', '2025-10-15 06:30:00'),
(11, 'BK000011', 23, 21, 34, '2025-10-18', '2025-10-25', '08:00', 'Harmony Memorial Hall, 200 Serenity Road', 9200.00, 'completed', 'Bob Tan', 'bob@example.com', '+60123456002', 'Full Buddhist ceremony with vegetarian meals', NULL, NULL, '', 'card', '2025-10-18 03:00:00', '2025-10-27 08:00:00', '2025-10-18 07:00:00'),
(12, 'BK000012', 24, 20, 30, '2025-10-28', '2025-11-05', '14:00', 'Memorial Hall B, Peaceful Rest, 100 Memorial Avenue', 3830.00, 'confirmed', 'Carol Lee', 'carol@example.com', '+60123456003', 'Simple service, no religious ceremony', NULL, NULL, 'pending', 'bank', '2025-10-28 01:00:00', '2025-10-28 03:00:00', '2025-10-28 03:00:00'),
(13, 'BK000013', 16, 19, 37, '2025-10-20', '2025-10-26', '10:00', 'Provider 19 Memorial Hall', 6180.00, 'completed', 'Customer User 16', 'user16@example.com', '+60123456016', 'Prefer afternoon service with light refreshments', NULL, NULL, '', 'card', '2025-10-20 01:30:00', '2025-10-27 07:00:00', '2025-10-20 05:00:00'),
(14, 'BK000014', 16, 19, 38, '2025-10-29', '2025-11-08', '11:00', 'Provider 19 Grand Hall', 10370.00, 'confirmed', 'Customer User 16', 'user16@example.com', '+60123456016', 'VIP service with traditional music', NULL, NULL, 'pending', 'bank', '2025-10-29 02:00:00', '2025-10-29 06:00:00', '2025-10-29 06:00:00'),
(100, 'BK000100', 16, 19, 100, '2025-08-05', '2025-08-10', '09:00', 'Provider 19 Memorial Hall', 3150.00, 'completed', 'Customer User 16', 'user16@example.com', '+60123456016', 'Simple service preferred', NULL, NULL, '', 'card', '2025-08-05 02:00:00', '2025-08-11 07:00:00', '2025-08-05 06:00:00'),
(101, 'BK000101', 16, 19, 101, '2025-08-18', '2025-08-22', '14:00', 'Provider 19 Memorial Hall', 5900.00, 'completed', 'Customer User 16', 'user16@example.com', '+60123456016', 'Afternoon service with light refreshments', NULL, NULL, '', 'bank', '2025-08-18 03:00:00', '2025-08-23 08:00:00', '2025-08-18 07:00:00'),
(102, 'BK000102', 16, 19, 102, '2025-09-03', '2025-09-08', '10:00', 'Provider 19 Grand Hall', 10100.00, 'completed', 'Customer User 16', 'user16@example.com', '+60123456016', 'Full service with video recording', NULL, NULL, '', 'card', '2025-09-03 01:00:00', '2025-09-09 09:00:00', '2025-09-03 05:00:00'),
(103, 'BK000103', 16, 19, 101, '2025-09-15', '2025-09-20', '11:00', 'Provider 19 Memorial Hall', 6050.00, 'completed', 'Customer User 16', 'user16@example.com', '+60123456016', 'Memorial program booklet needed', NULL, NULL, '', 'card', '2025-09-15 02:30:00', '2025-09-21 06:00:00', '2025-09-15 06:30:00'),
(104, 'BK000104', 16, 19, 100, '2025-09-25', '2025-09-28', '15:00', 'Provider 19 Memorial Hall', 3000.00, 'completed', 'Customer User 16', 'user16@example.com', '+60123456016', 'Basic service', NULL, NULL, '', 'bank', '2025-09-25 03:00:00', '2025-09-29 08:00:00', '2025-09-25 07:00:00'),
(105, 'BK000105', 16, 19, 101, '2025-10-05', '2025-10-10', '09:00', 'Provider 19 Memorial Hall', 6180.00, 'completed', 'Customer User 16', 'user16@example.com', '+60123456016', 'Prefer afternoon service with light refreshments', NULL, NULL, '', 'card', '2025-10-05 01:30:00', '2025-10-11 07:00:00', '2025-10-05 05:00:00'),
(106, 'BK000106', 16, 19, 102, '2025-10-20', '2025-10-26', '10:00', 'Provider 19 Grand Hall', 10370.00, 'completed', 'Customer User 16', 'user16@example.com', '+60123456016', 'VIP service with traditional music', NULL, NULL, '', 'bank', '2025-10-20 02:00:00', '2025-10-27 06:00:00', '2025-10-20 06:00:00'),
(107, 'BK000107', 16, 19, 102, '2025-10-29', '2025-11-08', '11:00', 'Provider 19 Grand Hall', 10370.00, 'confirmed', 'Customer User 16', 'user16@example.com', '+60123456016', 'VIP service with traditional music', NULL, NULL, 'pending', 'bank', '2025-10-29 02:00:00', '2025-10-29 06:00:00', '2025-10-29 06:00:00'),
(108, 'BK000108', 15, 19, 100, NULL, '2025-11-13', NULL, E'\nMcdonald\nCost: RM 0.00', 3000.00, 'cancelled', 'NINGNING', 'tcliang2002@gmail.com', '+60126108162', 'I want free food', '["uploads/TEMP_1761757876515_timetable_1761757876.png","uploads/TEMP_1761757876515_Student_card_tancl_1761757876.pdf"]', E'\ntry another date', 'pending', 'bank', '2025-10-29 17:11:16', '2025-10-29 17:16:10', NULL),
(109, 'BK000109', 15, 19, 101, NULL, '2025-11-19', NULL, E'undefined\n196, Jln Balik Pulau,\nCost: RM 500.00', 6000.00, 'pending', 'TAN CHIA LIANG', 'tcliang2002@gmail.com', '+60126108162', '', '["uploads/TEMP_1762449791014_Context_Diagram__2__1762449791.png","uploads/TEMP_1762449791014_543ec6bc-16f2-4117-98b2-47c3de3593b0_1762449791.png"]', NULL, 'pending', 'bank', '2025-11-06 17:23:11', '2025-11-06 17:23:11', NULL),
(110, 'BK000110', 15, 19, 101, NULL, '2025-11-19', NULL, E'undefined\n196, Jln Balik Pulau,\nCost: RM 500.00', 11230.00, 'pending', 'Karina', 'karina@gmail.com', '+60126108162', 'I want free flowers please', '["uploads/TEMP_1762449877738_Screenshot_2025-09-11_154919_1762449877.png","uploads/TEMP_1762449877738_Screenshot_2025-09-11_154919_1762449877.png"]', NULL, 'pending', 'ewallet', '2025-11-06 17:24:37', '2025-11-06 17:24:37', NULL);

SELECT setval('bookings_booking_id_seq', (SELECT MAX(booking_id) FROM bookings));

-- Insert booking_addons (THIS IS THE MISSING DATA!)
-- Based on your HeidiSQL screenshot showing booking_addon_id 9-127
INSERT INTO booking_addons (booking_addon_id, booking_id, addon_name, addon_price, quantity) VALUES
(9, 1, 'Incense and Candle Package', 180.00, 1),
(10, 1, 'Fresh Fruit Offering Platter', 150.00, 1),
(20, 10, 'Incense and Candle Package', 180.00, 1),
(21, 10, 'Fresh Fruit Offering Platter', 150.00, 1),
(22, 10, 'White Lotus Arrangement', 450.00, 1),
(23, 10, 'Vegetarian Food Offerings', 200.00, 1),
(24, 11, 'Lotus Lamp Set (108 pcs)', 350.00, 1),
(25, 11, 'Buddhist Scripture Set', 250.00, 1),
(26, 11, 'Premium Flower Stand', 280.00, 1),
(27, 11, 'White Rose and Lily Bouquet', 320.00, 1),
(28, 12, 'Memory Book and Guest Register', 120.00, 1),
(29, 12, 'Premium Fruit Platter', 180.00, 1),
(30, 13, 'Premium Flower Stand', 280.00, 1),
(31, 13, 'Memorial Photo Display Board', 150.00, 1),
(32, 13, 'Guest Condolence Book', 80.00, 1),
(33, 13, 'Tea & Coffee Service', 170.00, 1),
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
(119, 100, 'Memory Book and Guest Register', 120.00, 1),
(120, 101, 'White Lotus Arrangement', 450.00, 1),
(121, 102, 'Premium Buddhist Altar Setup', 1200.00, 1),
(122, 103, 'Memory Book and Guest Register', 120.00, 1),
(123, 106, 'Premium Luxury Hearse', 1200.00, 1),
(124, 106, 'Full Monk Assembly (7 monks)', 2800.00, 1),
(125, 107, 'Premium Luxury Hearse', 1200.00, 1),
(126, 107, 'Full Monk Assembly (7 monks)', 2800.00, 1),
(127, 110, '49-Day Memorial Service', 5000.00, 1);

SELECT setval('booking_addons_booking_addon_id_seq', (SELECT MAX(booking_addon_id) FROM booking_addons));

-- Insert tributes
INSERT INTO tributes (tribute_id, deceased_name, birth_date, death_date, biography, photo_url, is_public, view_count, flower_count, created_by, created_at, updated_at, life_story, allow_messages, enable_rsvp, bank_account_number, bank_account_name, bank_name, donation_qr_code, location_of_birth, grave_location_name, grave_address, grave_invite_message, grave_datetime, map_link, virtual_link, allow_photos) VALUES
(1, 'Test Person', '2025-10-03', '2025-10-24', 'This is a test tribute to verify the system works.', 'uploads/tributes/portrait_68fe1154a2c99_1761481044.jpg', TRUE, 16, 0, 15, '2025-10-24 07:26:52', '2025-10-26 12:17:26', 'bye bye', TRUE, TRUE, '123456', 'jing', 'maybank', '', 'Johor', NULL, NULL, NULL, NULL, NULL, NULL, TRUE),
(2, 'Johnny', '2025-10-09', '2025-10-25', 'I like america', 'uploads/tributes/portrait_68fb3278c9245_1761292920.jpg', TRUE, 421, 13, 15, '2025-10-24 08:02:00', '2025-11-07 04:05:31', 'I am so sad', TRUE, TRUE, '1234567890', 'Johnny Memorial Fund', 'First National Bank', 'uploads/tributes/qr_68fb5513e8814_1761301779.png', 'America', 'Peaceful Rest Cemetery', '123 Memorial Drive, Peaceful Rest Cemetery, City, State 12345', 'Come to my Funeral please', '2025-10-17 18:14:00', 'https://maps.app.goo.gl/NH2vAbvdksYuCC3YA', 'https://meet.google.com/wqg-bkks-trn', TRUE);

SELECT setval('tributes_tribute_id_seq', (SELECT MAX(tribute_id) FROM tributes));

-- Insert memories_database
INSERT INTO memories_database (id, tribute_id, memory_text, memory_type, created_at) VALUES
(1, 2, 'She like to say come home early', 'story', '2025-10-25 09:28:53'),
(2, 2, 'she speaks chinese', '', '2025-10-25 09:28:53');

SELECT setval('memories_database_id_seq', (SELECT MAX(id) FROM memories_database));

-- Insert personality_traits
INSERT INTO personality_traits (id, tribute_id, trait_category, trait_value, created_at) VALUES
(1, 2, 'interests', 'She like to play golf', '2025-10-25 09:28:53');

SELECT setval('personality_traits_id_seq', (SELECT MAX(id) FROM personality_traits));

-- Insert tribute_messages
INSERT INTO tribute_messages (message_id, tribute_id, sender_name, sender_email, message, photo_url, is_approved, created_at) VALUES
(16, 2, 'Giselle', 'giselle@gmail.com', 'Bye Bye my friend. I will miss you', 'uploads/tributes/tribute_message_690cb11ee5888_1762439454.jpg', TRUE, '2025-11-06 14:30:54'),
(17, 2, 'Moka', 'moka@gmail.com', 'Sayonara kawanku.', 'uploads/tributes/tribute_message_690cb13fa3793_1762439487.webp', TRUE, '2025-11-06 14:31:27');

SELECT setval('tribute_messages_message_id_seq', (SELECT MAX(message_id) FROM tribute_messages));

-- Insert tribute_photos
INSERT INTO tribute_photos (photo_id, tribute_id, photo_url, caption, uploaded_by, created_at) VALUES
(4, 2, 'uploads/tributes/family_gallery_690cb0a6ac1c8_1762439334.jpg', 'Family Photo', 'user1', '2025-11-06 14:28:54'),
(5, 2, 'uploads/tributes/family_gallery_690cb0c325b6e_1762439363.webp', 'Family Reunion', 'user1', '2025-11-06 14:29:23');

SELECT setval('tribute_photos_photo_id_seq', (SELECT MAX(photo_id) FROM tribute_photos));

-- Insert tribute_rsvp
INSERT INTO tribute_rsvp (rsvp_id, tribute_id, attendee_name, attendee_email, attendee_phone, will_attend, attendance_type, number_of_guests, message, created_at) VALUES
(1, 2, 'TAN CHIA LIANG', 'tcliang2002@gmail.com', '0126108162', FALSE, 'not-attending', 4, '', '2025-10-24 11:54:12'),
(3, 2, 'TAN CHIA LIANG', 'tcliang2002@gmail.com', '0126108162', FALSE, 'not-attending', 1, '', '2025-10-29 07:49:59'),
(4, 2, 'jason', 'tcliang2002@gmail.com', '0126108162', TRUE, 'physical', 1, '', '2025-10-29 10:50:40');

SELECT setval('tribute_rsvp_rsvp_id_seq', (SELECT MAX(rsvp_id) FROM tribute_rsvp));

-- Insert voice_chat_settings
INSERT INTO voice_chat_settings (id, tribute_id, is_enabled, access_level, created_at, updated_at) VALUES
(1, 2, TRUE, 'family', '2025-10-29 04:12:33', '2025-10-29 04:12:33');

SELECT setval('voice_chat_settings_id_seq', (SELECT MAX(id) FROM voice_chat_settings));

-- Insert voice_conversations
INSERT INTO voice_conversations (id, tribute_id, user_input, ai_response, audio_url, created_at) VALUES
(6, 2, 'hi how are you', 'Hey there! I''m doing great, thanks for asking. How about you?', NULL, '2025-10-29 05:13:26'),
(7, 2, 'where you from', 'I''m from America! Born and raised. How about you?', NULL, '2025-10-29 05:13:42'),
(8, 2, 'can we go play golf', 'That sounds great! I love playing golf. When do you want to go?', NULL, '2025-10-29 05:14:00'),
(10, 2, 'lets play at 3pm', 'Perfect! 3 PM works for me. Looking forward to it!', NULL, '2025-10-29 07:45:41'),
(11, 2, 'ok see you then', 'See you then! Take care!', NULL, '2025-10-29 07:45:54'),
(12, 2, 'yea sure', 'Awesome! Let''s meet at the golf course around 3 PM then. Can''t wait!', NULL, '2025-10-29 07:46:10');

SELECT setval('voice_conversations_id_seq', (SELECT MAX(id) FROM voice_conversations));

-- Insert voice_models
INSERT INTO voice_models (voice_id, tribute_id, elevenlabs_voice_id, audio_sample_path, sample_duration, status, created_by, created_at) VALUES
(2, 2, 'mock_voice_68fc96a6afd80', 'voice_sample_2_1761384100.webm', NULL, 'ready', 15, '2025-10-25 09:21:42');

SELECT setval('voice_models_voice_id_seq', (SELECT MAX(voice_id) FROM voice_models));

-- Insert provider_addons
INSERT INTO provider_addons (addon_id, provider_id, template_id, addon_name, description, price, category_id, is_active, is_custom, created_at, updated_at) VALUES
(1, 19, 2, '49-Day Memorial Service', 'Complete 49-day memorial services with weekly prayer sessions', 5000.00, 1, TRUE, FALSE, '2025-10-23 10:23:20', '2025-11-08 16:45:49'),
(2, 19, 11, 'Incense and Candle Package', 'Premium incense sticks and ceremonial candles for 3-day ceremony', 180.00, 2, TRUE, FALSE, '2025-10-23 10:23:20', '2025-10-23 10:23:20'),
(3, 19, 16, 'Fresh Fruit Offering Platter', 'Traditional fruit offerings including apples, oranges, and bananas', 150.00, 3, TRUE, FALSE, '2025-10-23 10:23:20', '2025-10-23 10:23:20'),
(4, 19, NULL, 'Happy Meal', 'Happy all the day', 50.00, 9, TRUE, TRUE, '2025-10-23 10:23:42', '2025-10-23 10:23:42');

SELECT setval('provider_addons_addon_id_seq', (SELECT MAX(addon_id) FROM provider_addons));

-- Insert provider_availability
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
(16, 19, '2025-11-12', 'Not available', '2025-10-28 18:27:17');

SELECT setval('provider_availability_availability_id_seq', (SELECT MAX(availability_id) FROM provider_availability));

-- Insert provider_reviews
INSERT INTO provider_reviews (review_id, reviewer_user_id, provider_id, booking_id, rating, review_text, review_category, review_type, created_at, updated_at) VALUES
(2, 15, 19, 1, 5, 'good!', 'quality', 'customer_to_provider', '2025-10-24 07:04:02', '2025-10-24 07:04:02'),
(10, 22, 20, 10, 4, 'Good service overall. The Buddhist ceremony was respectfully conducted.', 'quality', 'customer_to_provider', '2025-10-21 10:00:00', '2025-10-29 16:52:24'),
(11, 23, 21, 11, 5, 'Excellent service! Very professional and caring staff.', 'quality', 'customer_to_provider', '2025-10-27 08:00:00', '2025-10-29 16:52:24'),
(100, 16, 19, 100, 5, 'Excellent service, very professional and compassionate staff.', 'quality', 'customer_to_provider', '2025-08-11 07:00:00', '2025-10-29 16:52:24'),
(101, 16, 19, 101, 4, 'Good service, the light refreshments were well appreciated by attendees.', 'quality', 'customer_to_provider', '2025-08-23 08:00:00', '2025-10-29 16:52:24'),
(102, 16, 19, 102, 5, 'Outstanding service! Video recording was high quality and well edited.', 'quality', 'customer_to_provider', '2025-09-09 09:00:00', '2025-10-29 16:52:24'),
(103, 16, 19, 103, 4, 'Professional service, memorial booklet was beautifully designed.', 'quality', 'customer_to_provider', '2025-09-21 06:00:00', '2025-10-29 16:52:24'),
(104, 16, 19, 105, 5, 'Very satisfied with the service. Staff was attentive and respectful.', 'quality', 'customer_to_provider', '2025-10-11 07:00:00', '2025-10-29 16:52:24'),
(105, 16, 19, 106, 4, 'Great facilities and caring staff. The traditional music was a beautiful touch.', 'quality', 'customer_to_provider', '2025-10-28 03:00:00', '2025-10-29 16:52:24');

SELECT setval('provider_reviews_review_id_seq', (SELECT MAX(review_id) FROM provider_reviews));

-- Insert profile_activity_log
INSERT INTO profile_activity_log (log_id, user_id, action_type, action_details, created_at) VALUES
(1, 16, 'profile_update', '{"provider_id":19,"updated_fields":["provider_id","company_name","business_type","business_registration","description","address","city","state","postal_code","phone","email","website","operating_hours","services_offered","facebook_url","instagram_url"],"timestamp":"2025-10-28 07:59:30"}', '2025-10-28 06:59:30'),
(2, 16, 'profile_update', '{"provider_id":19,"updated_fields":["provider_id","company_name","business_type","business_registration","description","address","city","state","postal_code","phone","email","website","operating_hours","services_offered","facebook_url","instagram_url"],"timestamp":"2025-10-28 08:18:25"}', '2025-10-28 07:18:25'),
(3, 16, 'profile_update', '{"provider_id":19,"updated_fields":["provider_id","company_name","business_type","business_registration","description","address","city","state","postal_code","phone","email","website","operating_hours","services_offered","facebook_url","instagram_url"],"timestamp":"2025-10-28 19:19:50"}', '2025-10-28 18:19:50');

SELECT setval('profile_activity_log_log_id_seq', (SELECT MAX(log_id) FROM profile_activity_log));

-- ========================================
-- VERIFICATION QUERIES
-- ========================================
-- Run these to verify all data was inserted correctly:
-- SELECT COUNT(*) FROM addon_categories; -- Should be 9
-- SELECT COUNT(*) FROM addon_templates; -- Should be 49
-- SELECT COUNT(*) FROM users; -- Should be 7
-- SELECT COUNT(*) FROM service_provider; -- Should be 3
-- SELECT COUNT(*) FROM bookings; -- Should be 17
-- SELECT COUNT(*) FROM booking_addons; -- Should be ~35+
-- SELECT COUNT(*) FROM tributes; -- Should be 2

-- Done! All data migrated to Supabase PostgreSQL
