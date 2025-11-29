-- ========================================
-- EXPORT PACKAGES DATA FROM MySQL (HeidiSQL)
-- Run this query in HeidiSQL to get your current packages data
-- ========================================

-- Export packages data
SELECT 
    CONCAT('(',
        package_id, ',',
        provider_id, ',',
        QUOTE(name), ',',
        IFNULL(QUOTE(description), 'NULL'), ',',
        price, ',',
        IFNULL(capacity, 'NULL'), ',',
        IFNULL(duration_hours, 'NULL'), ',',
        QUOTE(location_type), ',',
        IF(is_active = 1, 'TRUE', 'FALSE'), ',',
        IF(is_featured = 1, 'TRUE', 'FALSE'), ',',
        QUOTE(created_at), ',',
        QUOTE(updated_at),
    ')') as insert_statement
FROM packages
ORDER BY package_id;

-- Export package_features data
SELECT 
    CONCAT('(',
        package_id, ',',
        QUOTE(feature_name), ',',
        QUOTE(created_at),
    ')') as insert_statement
FROM package_features
ORDER BY package_id, feature_id;

-- ========================================
-- ALTERNATIVE: Simple SELECT queries
-- ========================================

-- Get all packages (copy the results)
SELECT 
    package_id,
    provider_id,
    name,
    description,
    price,
    capacity,
    duration_hours,
    location_type,
    is_active,
    is_featured,
    created_at,
    updated_at
FROM packages
ORDER BY package_id;

-- Get all package features (copy the results)
SELECT 
    package_id,
    feature_name,
    created_at
FROM package_features
ORDER BY package_id, feature_id;

