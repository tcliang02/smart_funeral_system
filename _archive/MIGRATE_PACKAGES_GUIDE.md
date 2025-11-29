# Guide: Migrate Packages Data from MySQL (HeidiSQL) to Supabase

This guide will help you migrate your `packages` and `package_features` data from MySQL to Supabase.

## Step 1: Export Data from MySQL (HeidiSQL)

1. **Open HeidiSQL** and connect to your MySQL database (`smart_funeral_system`)

2. **Run the export query**:
   ```sql
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
   ```

3. **Copy all the results** (right-click → Copy → Copy as SQL INSERT statements, or manually copy the data)

4. **Export package_features**:
   ```sql
   SELECT 
       package_id,
       feature_name,
       created_at
   FROM package_features
   ORDER BY package_id, feature_id;
   ```

## Step 2: Prepare Data for Supabase

The data format needs to be converted from MySQL to PostgreSQL:

### MySQL Format:
- `1` or `0` for booleans → PostgreSQL: `TRUE` or `FALSE`
- `NULL` values stay as `NULL`
- Timestamps: Keep as strings in format `'YYYY-MM-DD HH:MM:SS'`
- Strings: Use single quotes `'text'`

### Example Conversion:

**MySQL:**
```sql
(22, 19, 'Basic Service 16', 'Essential funeral service package', 2500.00, 10, 10.00, 'home', 1, 0, '2025-10-23 09:57:14', '2025-10-23 11:45:54')
```

**PostgreSQL:**
```sql
(22, 19, 'Basic Service 16', 'Essential funeral service package', 2500.00, 10, 10.00, 'home', TRUE, FALSE, '2025-10-23 09:57:14', '2025-10-23 11:45:54')
```

## Step 3: Import into Supabase

1. **Open Supabase Dashboard** → Go to SQL Editor

2. **Open the file**: `MIGRATE_PACKAGES_TO_SUPABASE.sql`

3. **Update the VALUES** in the INSERT statements with your actual data from Step 1

4. **Run the script** in Supabase SQL Editor

5. **Verify the import**:
   ```sql
   SELECT COUNT(*) FROM packages;
   SELECT COUNT(*) FROM package_features;
   ```

## Quick Method: Use the Pre-filled Script

If your packages match the data in `database_backup_utf8.sql`, you can use the pre-filled `MIGRATE_PACKAGES_TO_SUPABASE.sql` file directly:

1. Open `MIGRATE_PACKAGES_TO_SUPABASE.sql`
2. Copy the entire file
3. Paste into Supabase SQL Editor
4. Run it

The script includes:
- All packages (IDs: 22, 23, 26, 30-38, 100-102)
- All package features for those packages
- Uses `ON CONFLICT` to avoid duplicates
- Updates sequences correctly

## Troubleshooting

### Error: "duplicate key value violates unique constraint"
- The package already exists in Supabase
- The script uses `ON CONFLICT DO UPDATE` to handle this
- If you want to skip existing records, change to `ON CONFLICT DO NOTHING`

### Error: "foreign key constraint"
- Make sure the `provider_id` values exist in the `service_provider` table
- Check that providers 19, 20, 21 exist in Supabase

### Error: "invalid input syntax for type boolean"
- Convert `1` → `TRUE` and `0` → `FALSE`
- Make sure boolean values are not quoted

### Missing package_features
- The script includes all features from the backup
- If you have additional features, add them to the `package_features` INSERT statement

## Verification Queries

After importing, run these to verify:

```sql
-- Count packages
SELECT COUNT(*) as total_packages FROM packages;

-- Count features
SELECT COUNT(*) as total_features FROM package_features;

-- View all packages with their features
SELECT 
    p.package_id,
    p.name,
    p.price,
    COUNT(pf.feature_id) as feature_count
FROM packages p
LEFT JOIN package_features pf ON p.package_id = pf.package_id
GROUP BY p.package_id, p.name, p.price
ORDER BY p.package_id;

-- Check for packages without features
SELECT 
    package_id,
    name
FROM packages
WHERE package_id NOT IN (SELECT DISTINCT package_id FROM package_features)
ORDER BY package_id;
```

## Next Steps

After successful migration:
1. Test your application to ensure packages display correctly
2. Verify package features are showing
3. Check that bookings can reference the packages
4. Update any hardcoded package IDs if needed

