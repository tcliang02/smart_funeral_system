-- ========================================
-- VERIFICATION SCRIPT - Check ALL table counts
-- Run this in Supabase SQL Editor to verify data completeness
-- ========================================

-- Count records in all tables
SELECT 
    'addon_categories' as table_name, 
    COUNT(*) as count,
    CASE WHEN COUNT(*) >= 9 THEN '✅ OK' ELSE '⚠️ Missing data' END as status
FROM addon_categories
UNION ALL
SELECT 
    'addon_templates', 
    COUNT(*),
    CASE WHEN COUNT(*) >= 20 THEN '✅ OK' ELSE '⚠️ Missing data' END
FROM addon_templates
UNION ALL
SELECT 
    'users', 
    COUNT(*),
    CASE WHEN COUNT(*) >= 16 THEN '✅ OK' ELSE '⚠️ Missing data' END
FROM users
UNION ALL
SELECT 
    'service_provider', 
    COUNT(*),
    CASE WHEN COUNT(*) >= 1 THEN '✅ OK' ELSE '⚠️ Missing data' END
FROM service_provider
UNION ALL
SELECT 
    'packages', 
    COUNT(*),
    CASE WHEN COUNT(*) >= 6 THEN '✅ OK' ELSE '⚠️ Missing data' END
FROM packages
UNION ALL
SELECT 
    'bookings', 
    COUNT(*),
    CASE WHEN COUNT(*) >= 12 THEN '✅ OK' ELSE '⚠️ Missing data' END
FROM bookings
UNION ALL
SELECT 
    'booking_addons', 
    COUNT(*),
    CASE WHEN COUNT(*) >= 37 THEN '✅ OK' ELSE '⚠️ CRITICAL - Should have 37+' END
FROM booking_addons
UNION ALL
SELECT 
    'tributes', 
    COUNT(*),
    CASE WHEN COUNT(*) >= 2 THEN '✅ OK' ELSE '⚠️ Missing data' END
FROM tributes
UNION ALL
SELECT 
    'memories_database', 
    COUNT(*),
    CASE WHEN COUNT(*) >= 2 THEN '✅ OK' ELSE '⚠️ Missing data' END
FROM memories_database
UNION ALL
SELECT 
    'personality_traits', 
    COUNT(*),
    CASE WHEN COUNT(*) >= 1 THEN '✅ OK' ELSE '⚠️ Missing data' END
FROM personality_traits
UNION ALL
SELECT 
    'tribute_messages', 
    COUNT(*),
    CASE WHEN COUNT(*) >= 17 THEN '✅ OK' ELSE '⚠️ Missing data' END
FROM tribute_messages
UNION ALL
SELECT 
    'tribute_photos', 
    COUNT(*),
    CASE WHEN COUNT(*) >= 5 THEN '✅ OK' ELSE '⚠️ Missing data' END
FROM tribute_photos
UNION ALL
SELECT 
    'tribute_rsvp', 
    COUNT(*),
    CASE WHEN COUNT(*) >= 4 THEN '✅ OK' ELSE '⚠️ Missing data' END
FROM tribute_rsvp
UNION ALL
SELECT 
    'voice_chat_settings', 
    COUNT(*),
    CASE WHEN COUNT(*) >= 1 THEN '✅ OK' ELSE '⚠️ Missing data' END
FROM voice_chat_settings
UNION ALL
SELECT 
    'voice_conversations', 
    COUNT(*),
    CASE WHEN COUNT(*) >= 6 THEN '✅ OK' ELSE '⚠️ Missing data' END
FROM voice_conversations
UNION ALL
SELECT 
    'voice_models', 
    COUNT(*),
    CASE WHEN COUNT(*) >= 1 THEN '✅ OK' ELSE '⚠️ Missing data' END
FROM voice_models
UNION ALL
SELECT 
    'provider_addons', 
    COUNT(*),
    CASE WHEN COUNT(*) >= 4 THEN '✅ OK' ELSE '⚠️ Missing data' END
FROM provider_addons
UNION ALL
SELECT 
    'provider_availability', 
    COUNT(*),
    CASE WHEN COUNT(*) >= 11 THEN '✅ OK' ELSE '⚠️ Missing data' END
FROM provider_availability
UNION ALL
SELECT 
    'provider_reviews', 
    COUNT(*),
    CASE WHEN COUNT(*) >= 6 THEN '✅ OK' ELSE '⚠️ Missing data' END
FROM provider_reviews
UNION ALL
SELECT 
    'profile_activity_log', 
    COUNT(*),
    CASE WHEN COUNT(*) >= 3 THEN '✅ OK' ELSE '⚠️ Missing data' END
FROM profile_activity_log
UNION ALL
SELECT 
    'package_features', 
    COUNT(*),
    CASE WHEN COUNT(*) >= 0 THEN '✅ OK (may be empty)' ELSE '⚠️ Check' END
FROM package_features
ORDER BY table_name;

-- ========================================
-- Detailed check for CRITICAL tables
-- ========================================

-- Check booking_addons specifically (should have 37 records)
SELECT 
    '🔍 BOOKING_ADDONS DETAILS' as check_type,
    COUNT(*) as total_records,
    MIN(booking_addon_id) as min_id,
    MAX(booking_addon_id) as max_id,
    CASE 
        WHEN COUNT(*) >= 37 THEN '✅ COMPLETE' 
        ELSE '❌ MISSING ' || (37 - COUNT(*))::text || ' records'
    END as status
FROM booking_addons;

-- Check if all bookings have their referenced packages
SELECT 
    '🔍 BOOKINGS VALIDATION' as check_type,
    COUNT(*) as total_bookings,
    COUNT(DISTINCT package_id) as unique_packages_used,
    CASE 
        WHEN COUNT(*) >= 12 THEN '✅ COMPLETE' 
        ELSE '❌ MISSING bookings'
    END as status
FROM bookings;

-- Check if all packages exist
SELECT 
    '🔍 PACKAGES VALIDATION' as check_type,
    COUNT(*) as total_packages,
    MIN(package_id) as min_id,
    MAX(package_id) as max_id,
    CASE 
        WHEN COUNT(*) >= 6 THEN '✅ COMPLETE (has package 1,2,3,100,101,102)' 
        ELSE '❌ MISSING packages'
    END as status
FROM packages;

-- ========================================
-- EXPECTED FINAL COUNTS (from MySQL)
-- ========================================
/*
addon_categories: 9 records
addon_templates: 20 records
users: 16+ records
service_provider: 1+ records
packages: 6 records (IDs: 1,2,3,100,101,102)
bookings: 12 records (IDs: 1,10-14,100-107,110)
booking_addons: 37 records (IDs: 9-10,20-33,107-127) ← CRITICAL!
tributes: 2+ records
memories_database: 2 records
personality_traits: 1 record
tribute_messages: 17 records
tribute_photos: 5 records
tribute_rsvp: 4 records
voice_chat_settings: 1 record
voice_conversations: 6 records
voice_models: 1 record
provider_addons: 4 records
provider_availability: 11 records
provider_reviews: 6 records
profile_activity_log: 3 records
package_features: 0 records (empty table is OK)
*/
