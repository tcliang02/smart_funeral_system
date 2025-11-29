# ZENLINK Funeral Services & Addons - Complete Documentation

## Overview
This document provides a comprehensive overview of all funeral service packages, addons, and their business logic in the ZENLINK system. Use this document to verify package and addon logic with your live agent.

---

## 1. FUNERAL SERVICE PACKAGES

### Package Database Structure

**Table: `packages`**
- `package_id` (Primary Key)
- `provider_id` (Foreign Key → `service_provider`)
- `name` (Package Name)
- `description` (Package Description)
- `price` (Base Price - Decimal)
- `capacity` (Number of people - Optional)
- `duration_hours` (Service duration - Optional)
- `location_type` (Values: 'own', 'provider', 'both' - Default: 'both')
- `is_featured` (Boolean - Featured package flag)
- `is_active` (Boolean - Active status)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Table: `package_features`**
- `feature_id` (Primary Key)
- `package_id` (Foreign Key → `packages`)
- `feature_name` (Feature description)

### Package Logic Rules

1. **Package Ownership**: Each package belongs to ONE service provider (`provider_id`)
2. **Package Features**: Packages can have multiple features stored in `package_features` table
3. **Package Pricing**: Base price is stored in `packages.price` field
4. **Package Status**: 
   - `is_active = 1`: Package is available for booking
   - `is_active = 0`: Package is hidden/disabled
5. **Location Types**:
   - `'own'`: Customer's own location only
   - `'provider'`: Provider's location only
   - `'both'`: Both locations available (default)
6. **Provider Statistics**: When a package is created/updated, the system automatically updates:
   - `service_provider.total_packages` (count of active packages)
   - `service_provider.average_price` (average of all package prices)

### Package Fields Used in Booking

When a customer selects a package, the system uses:
- `package_id` → Links to booking
- `name` → Displayed to customer
- `price` → Base price for total calculation
- `provider_id` → Links booking to provider
- `capacity` → Displayed as capacity badge
- `duration_hours` → Service duration info
- `location_type` → Determines parlour selection options

---

## 2. ADDON SYSTEM

### Addon Database Structure

**Table: `addon_categories`**
- `category_id` (Primary Key)
- `category_name` (Unique category name)
- `description` (Category description)
- `is_active` (Boolean)
- `display_order` (Order for display)
- `created_at` (Timestamp)

**Table: `addon_templates`**
- `template_id` (Primary Key)
- `category_id` (Foreign Key → `addon_categories`)
- `template_name` (Template name)
- `description` (Template description)
- `suggested_price` (Suggested price - Decimal)
- `is_popular` (Boolean - Popular flag)
- `created_at` (Timestamp)

**Table: `provider_addons`**
- `addon_id` (Primary Key)
- `provider_id` (Foreign Key → `service_provider`)
- `template_id` (Foreign Key → `addon_templates` - Optional, NULL for custom)
- `category_id` (Foreign Key → `addon_categories`)
- `addon_name` (Provider's custom name)
- `description` (Provider's description)
- `price` (Provider's custom price - Decimal)
- `is_active` (Boolean - Active status)
- `is_custom` (Boolean - Custom addon flag)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Table: `booking_addons`**
- `booking_addon_id` (Primary Key)
- `booking_id` (Foreign Key → `bookings`)
- `addon_id` (Foreign Key → `provider_addons` - Optional, NULL for custom)
- `addon_name` (Name of addon at time of booking)
- `addon_price` (Price of addon at time of booking)

### Addon Categories (Expected Structure)

Based on the system design, addons are organized into these categories:

1. **Buddhist Rituals & Ceremonies**
2. **Altars & Religious Items**
3. **Flowers & Offerings**
4. **Urns & Caskets**
5. **Monks & Chanting Services**
6. **Memorial Items**
7. **Transportation**
8. **Cremation Services**
9. **Food & Refreshments**

*Note: Actual categories in your database may vary. Check `addon_categories` table for current list.*

### Addon Logic Rules

1. **Addon Ownership**: Each addon belongs to ONE service provider (`provider_id`)
2. **Addon Categories**: All addons must belong to a category (`category_id`)
3. **Template vs Custom**:
   - **Template-based**: `template_id` is set, `is_custom = 0`
     - Provider selects from `addon_templates` and customizes price/name
   - **Custom**: `template_id = NULL`, `is_custom = 1`
     - Provider creates completely custom addon
4. **Addon Pricing**: Each provider sets their own price (`provider_addons.price`)
5. **Addon Status**: 
   - `is_active = 1`: Addon is available for selection
   - `is_active = 0`: Addon is hidden/disabled
6. **Addon Display**: Addons are grouped by category and displayed in `display_order`
7. **Addon Selection**: Customers can select MULTIPLE addons from MULTIPLE categories

---

## 3. PACKAGE + ADDON INTEGRATION

### Booking Flow Logic

1. **Customer selects a Package**
   - Package provides base service
   - Base price: `packages.price`

2. **Customer selects Addons** (Optional)
   - Can select multiple addons
   - Each addon has its own price: `provider_addons.price`
   - Addons are provider-specific (only addons from the same provider as the package)

3. **Parlour Selection** (Optional)
   - If `packages.location_type = 'both'` or `'provider'`:
     - Customer can choose: "Use Provider's Parlour" (additional fee)
     - Or: "Use Own Location" (no fee)
   - Parlour fee is stored separately (not in package price)

4. **Total Calculation**
   ```
   Total Amount = Package Base Price 
                + Sum of Selected Addon Prices 
                + Parlour Fee (if provider's parlour selected)
   ```

### Booking Database Structure

**Table: `bookings`**
- `booking_id` (Primary Key)
- `booking_reference` (Auto-generated: "BK" + 6-digit number)
- `user_id` (Customer who made booking)
- `provider_id` (Service provider)
- `package_id` (Selected package)
- `customer_name` (Customer name)
- `customer_email` (Customer email)
- `customer_phone` (Customer phone)
- `service_date` (Date of service)
- `service_address` (Service location)
- `special_requirements` (Text field)
- `total_amount` (Calculated total)
- `payment_method` (Payment method)
- `payment_status` (Payment status)
- `status` (Booking status: 'pending', 'confirmed', 'cancelled', etc.)
- `uploaded_files` (JSON array of file paths)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Table: `booking_addons`**
- `booking_addon_id` (Primary Key)
- `booking_id` (Foreign Key → `bookings`)
- `addon_id` (Foreign Key → `provider_addons` - Optional)
- `addon_name` (Name at time of booking - for historical record)
- `addon_price` (Price at time of booking - for historical record)

### Important Business Rules

1. **Addon Price Snapshot**: When a booking is created, the addon name and price are stored in `booking_addons` table. This ensures that if the provider changes addon prices later, historical bookings still show the original price.

2. **Addon Validation**: 
   - Only addons from the SAME provider as the selected package can be selected
   - Only `is_active = 1` addons are shown to customers
   - Custom addons (`is_custom = 1`) can be created by providers

3. **Package Validation**:
   - Only `is_active = 1` packages are shown to customers
   - Package must belong to an active provider

4. **Booking Reference**: Auto-generated as "BK" + 6-digit zero-padded booking_id (e.g., "BK000123")

---

## 4. API ENDPOINTS

### Package Endpoints

- `GET /api/backend/getAllPackages` - Get all packages from all providers
- `GET /api/backend/getPackages?provider_id=X` - Get packages for specific provider
- `POST /api/backend/provider/packages/add` - Create new package (Provider only)
- `PUT /api/backend/provider/packages/update` - Update package (Provider only)
- `DELETE /api/backend/provider/packages/delete` - Delete package (Provider only)

### Addon Endpoints

- `GET /api/backend/getActiveAddons?provider_id=X` - Get active addons for provider (grouped by category)
- `GET /api/backend/getAddonTemplates` - Get all addon templates and categories
- `GET /api/backend/provider/addons` - Get provider's addons (Provider only)
- `POST /api/backend/provider/addons/add` - Add new addon (Provider only)
- `PUT /api/backend/provider/addons/update` - Update addon (Provider only)
- `DELETE /api/backend/provider/addons/delete` - Delete addon (Provider only)

### Booking Endpoints

- `POST /api/backend/createBooking` - Create new booking
  - Required fields: `package_id`, `customer_name`, `customer_email`, `customer_phone`, `service_date`
  - Optional fields: `service_address`, `special_requirements`, `selected_addons[]`, `payment_method`, `uploaded_files[]`
  - Returns: `booking_id`, `booking_reference`, `package_name`

---

## 5. FRONTEND IMPLEMENTATION

### Package Selection Flow

1. Customer browses providers on `/order-services`
2. Customer views provider details and packages
3. Customer clicks "View Details" on a package → `/provider/{provider_id}/package/{package_id}`
4. Package details page shows:
   - Package name, description, price
   - Package features (from `package_features` table)
   - Package capacity, duration, location type
   - Provider information

### Addon Selection Flow

1. On package details page, customer sees addon categories
2. Categories are expandable/collapsible
3. Each category shows available addons with:
   - Addon name
   - Description
   - Price
   - Checkbox to select
4. Customer can select multiple addons from multiple categories
5. Selected addons are stored in state: `selectedAddons[]`

### Parlour Selection

1. If package `location_type` allows provider parlour:
   - Radio buttons: "Use Provider's Parlour" vs "Use Own Location"
   - If provider parlour selected, additional fee is added
2. Parlour fee is stored separately (not in package or addon)

### Checkout Flow

1. Customer clicks "Proceed to Checkout"
2. Total is calculated:
   ```javascript
   totalPrice = package.price 
              + selectedAddons.reduce((sum, addon) => sum + addon.price, 0)
              + (parlourChoice === 'provider' ? parlourFee : 0)
   ```
3. Data is stored in `sessionStorage`:
   - Package details
   - Provider details
   - Selected addons
   - Total amount
   - Parlour choice
4. Customer navigates to `/checkout` page
5. Checkout page retrieves data from `sessionStorage`
6. Customer completes booking form and submits
7. `createBooking` API is called with all data
8. Booking is created in database with:
   - Package reference
   - All selected addons (stored in `booking_addons` table)
   - Total amount
   - Customer details

---

## 6. VERIFICATION CHECKLIST FOR LIVE AGENT

Use this checklist to verify the logic is correct:

### Package Logic
- [ ] Can a provider create multiple packages? ✓ (Yes)
- [ ] Can packages have different prices? ✓ (Yes)
- [ ] Can packages have multiple features? ✓ (Yes, stored in `package_features` table)
- [ ] Are inactive packages hidden from customers? ✓ (Yes, only `is_active = 1` shown)
- [ ] Can packages specify location type (own/provider/both)? ✓ (Yes)
- [ ] Does package price include addons? ✗ (No, addons are separate)

### Addon Logic
- [ ] Can a provider create multiple addons? ✓ (Yes)
- [ ] Are addons organized by categories? ✓ (Yes, `addon_categories` table)
- [ ] Can providers use templates or create custom addons? ✓ (Yes, both supported)
- [ ] Can customers select multiple addons? ✓ (Yes)
- [ ] Can customers select addons from multiple categories? ✓ (Yes)
- [ ] Are addon prices provider-specific? ✓ (Yes, each provider sets their own price)
- [ ] Are inactive addons hidden from customers? ✓ (Yes, only `is_active = 1` shown)
- [ ] Can customers only select addons from the same provider as the package? ✓ (Yes, validated)

### Booking Logic
- [ ] Is total amount calculated correctly? ✓ (Package + Addons + Parlour Fee)
- [ ] Are addon prices stored at booking time? ✓ (Yes, in `booking_addons` table)
- [ ] Can a booking have multiple addons? ✓ (Yes, multiple rows in `booking_addons`)
- [ ] Is booking reference auto-generated? ✓ (Yes, "BK" + 6-digit number)
- [ ] Are package and addon prices independent? ✓ (Yes, separate fields)

### Data Integrity
- [ ] If a package is deleted, what happens to existing bookings? ⚠️ (Check: Should bookings remain with historical data)
- [ ] If an addon is deleted, what happens to existing bookings? ✓ (Bookings remain, addon data stored in `booking_addons`)
- [ ] If addon price changes, do existing bookings update? ✗ (No, prices are snapshotted at booking time)
- [ ] Can a provider modify addon prices after creation? ✓ (Yes, via update endpoint)

---

## 7. SAMPLE DATA STRUCTURE

### Sample Package
```json
{
  "package_id": 1,
  "provider_id": 1,
  "name": "Basic Funeral Package",
  "description": "Essential funeral arrangements with basic support.",
  "price": 2000.00,
  "capacity": 50,
  "duration_hours": 4,
  "location_type": "both",
  "is_featured": 0,
  "is_active": 1,
  "features": [
    "Casket and transportation",
    "Basic ceremony setup",
    "Limited flower arrangement",
    "Basic sound system",
    "Memorial guest book"
  ]
}
```

### Sample Addon Category
```json
{
  "category_id": 1,
  "category_name": "Buddhist Rituals & Ceremonies",
  "description": "Traditional Buddhist funeral rituals and ceremonies",
  "display_order": 1,
  "addons": [
    {
      "addon_id": 1,
      "addon_name": "7-Day Prayer Service",
      "description": "Traditional 7-day Buddhist prayer ceremony",
      "price": 1500.00,
      "is_custom": 0
    },
    {
      "addon_id": 2,
      "addon_name": "49-Day Memorial Service",
      "description": "Extended 49-day memorial service",
      "price": 3000.00,
      "is_custom": 0
    }
  ]
}
```

### Sample Booking with Addons
```json
{
  "booking_id": 123,
  "booking_reference": "BK000123",
  "package_id": 1,
  "provider_id": 1,
  "customer_name": "John Doe",
  "total_amount": 5000.00,
  "selected_addons": [
    {
      "addon_id": 1,
      "addon_name": "7-Day Prayer Service",
      "addon_price": 1500.00
    },
    {
      "addon_id": 5,
      "addon_name": "Premium Urn",
      "addon_price": 1000.00
    }
  ]
}
```

**Calculation**: 
- Package Base: RM 2,000.00
- Addon 1: RM 1,500.00
- Addon 2: RM 1,000.00
- Parlour Fee: RM 500.00 (if selected)
- **Total: RM 5,000.00**

---

## 8. POTENTIAL ISSUES TO CHECK

1. **Addon Price Changes**: If a provider changes an addon price, existing bookings should NOT be affected (prices are snapshotted). Verify this works.

2. **Package Deletion**: If a package is deleted, check if existing bookings still reference it correctly.

3. **Addon Category Ordering**: Verify that addon categories display in the correct order (`display_order` field).

4. **Parlour Fee Logic**: Verify that parlour fee is only added when:
   - Package `location_type` allows provider parlour
   - Customer selects "Use Provider's Parlour"

5. **Total Calculation**: Verify that total is calculated correctly in both frontend and backend.

6. **Addon Validation**: Verify that customers cannot select addons from a different provider than the package.

---

## 9. DATABASE QUERIES FOR VERIFICATION

### Get All Packages with Features
```sql
SELECT p.*, 
       GROUP_CONCAT(pf.feature_name) as features
FROM packages p
LEFT JOIN package_features pf ON p.package_id = pf.package_id
WHERE p.is_active = 1
GROUP BY p.package_id;
```

### Get All Addons by Category
```sql
SELECT c.category_name,
       c.display_order,
       pa.addon_name,
       pa.price,
       pa.is_active
FROM addon_categories c
JOIN provider_addons pa ON c.category_id = pa.category_id
WHERE pa.is_active = 1
ORDER BY c.display_order, pa.addon_name;
```

### Get Booking with Addons
```sql
SELECT b.*,
       ba.addon_name,
       ba.addon_price
FROM bookings b
LEFT JOIN booking_addons ba ON b.booking_id = ba.booking_id
WHERE b.booking_id = ?;
```

---

## 10. SUMMARY

**Key Points:**
1. Packages are provider-specific base services with a base price
2. Addons are optional extras organized by categories
3. Addons are also provider-specific and can be template-based or custom
4. Total = Package Price + Sum of Addon Prices + Parlour Fee
5. Addon prices are snapshotted at booking time for historical accuracy
6. Both packages and addons have active/inactive status controls
7. Customers can select multiple addons from multiple categories
8. All addons must belong to the same provider as the selected package

**This logic ensures:**
- Flexible pricing (base package + optional addons)
- Provider autonomy (each provider sets their own prices)
- Historical accuracy (prices are stored at booking time)
- Clear organization (categories for easy browsing)
- Data integrity (foreign key relationships)

---

## 11. AREAS FOR IMPROVEMENT & RECOMMENDATIONS

### A. Inventory vs. Service Logic

**Current Issue:**
- Addons are currently just a price and a name
- No distinction between physical items (with stock) and services (unlimited)
- Risk: Multiple customers can book the same physical item (e.g., "Premium Urn") if only 1 is in stock

**Current Structure:**
```sql
provider_addons {
    addon_id,
    addon_name,
    price,
    is_active
    -- NO stock_quantity field
}
```

**Recommended Enhancement:**
Add inventory tracking for physical items:

```sql
ALTER TABLE provider_addons 
ADD COLUMN addon_type ENUM('service', 'item') DEFAULT 'service',
ADD COLUMN stock_quantity INT DEFAULT NULL,
ADD COLUMN min_quantity INT DEFAULT 1,
ADD COLUMN max_quantity INT DEFAULT NULL;
```

**Logic:**
- `addon_type = 'service'`: Unlimited quantity (e.g., "Chanting Monk", "Prayer Service")
- `addon_type = 'item'`: Physical stock tracking (e.g., "Premium Urn", "Casket")
- `stock_quantity`: Current available stock (NULL for services)
- When booking, check `stock_quantity >= requested_quantity` for items
- Decrement stock when booking is confirmed

**Example:**
```sql
-- Service (unlimited)
INSERT INTO provider_addons (addon_name, price, addon_type, stock_quantity) 
VALUES ('7-Day Prayer Service', 1500.00, 'service', NULL);

-- Physical Item (limited stock)
INSERT INTO provider_addons (addon_name, price, addon_type, stock_quantity) 
VALUES ('Premium Urn', 1000.00, 'item', 5);
```

---

### B. Date/Time Scheduling Conflict

**Current Issue:**
- Bookings have a single `service_date`
- Buddhist funerals often span multiple days (Wake: 3-5 days, Cremation, Prayers)
- No way to block out resources (parlours, monks) for multi-day periods
- Risk: Double-booking the same parlour or monk

**Current Structure:**
```sql
bookings {
    service_date DATE,  -- Single date only
    service_time TIME   -- Single time only
}
```

**Recommended Enhancement:**
Create a `booking_dates` table for multi-day bookings:

```sql
CREATE TABLE booking_dates (
    booking_date_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    event_type VARCHAR(50), -- 'wake', 'cremation', 'prayer', etc.
    location VARCHAR(255),
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
);
```

**Logic:**
- A booking can have multiple dates (Wake Day 1, Day 2, Day 3, Cremation Day 4)
- Each date can block specific resources (parlour, monk availability)
- Check availability across all dates before confirming booking

**Example:**
```sql
-- Booking spans 4 days
INSERT INTO booking_dates (booking_id, date, event_type) VALUES
(123, '2024-12-15', 'wake_day_1'),
(123, '2024-12-16', 'wake_day_2'),
(123, '2024-12-17', 'wake_day_3'),
(123, '2024-12-18', 'cremation');
```

---

### C. Sophisticated Parlour Selection

**Current Issue:**
- Binary choice: "Use Provider Parlour" (Yes/No) + single fee
- Real-world: Providers have multiple halls (Hall A: RM500, Hall B: RM1500, VIP Hall: RM3000)
- Current `location_type` in packages is too simplistic

**Current Structure:**
```sql
packages {
    location_type ENUM('own', 'provider', 'both')  -- Too binary
}
-- Parlour fee stored separately, not as addon
```

**Recommended Enhancement:**
Treat Parlour/Hall as a specific type of Addon with availability tracking:

1. **Remove `location_type` from packages** (or keep for backward compatibility)
2. **Create "Venue Rental" category** in `addon_categories`
3. **Add Halls as Addons** in `provider_addons` with:
   - `category_id` = "Venue Rental"
   - `addon_type` = 'service' (or 'item' if physical space)
   - `capacity` field (how many people)
   - `availability` tracking

**New Structure:**
```sql
-- Add to addon_categories
INSERT INTO addon_categories (category_name, display_order) 
VALUES ('Venue Rental', 10);

-- Add halls as addons
INSERT INTO provider_addons (provider_id, category_id, addon_name, price, addon_type) VALUES
(1, (SELECT category_id FROM addon_categories WHERE category_name = 'Venue Rental'), 
 'Hall A (Small - 50 pax)', 500.00, 'service'),
(1, (SELECT category_id FROM addon_categories WHERE category_name = 'Venue Rental'), 
 'Hall B (Medium - 100 pax)', 1000.00, 'service'),
(1, (SELECT category_id FROM addon_categories WHERE category_name = 'Venue Rental'), 
 'VIP Hall (Large - 200 pax)', 1500.00, 'service');
```

**Logic:**
- Customer selects Package (Service) + Addon (Hall A/B/VIP)
- Check hall availability for all booking dates
- Hall capacity must match or exceed package capacity
- Hall price is included in total calculation like any other addon

---

### D. Paper Products Category (Chinese Buddhist/Taoist)

**Current Gap:**
- No specific category for Paper Offerings (Zhizha/纸扎)
- These are a major revenue stream in Chinese Buddhist/Taoist funerals
- Currently might be mixed with "Memorial Items" or missing entirely

**Recommended Enhancement:**
Add dedicated category for Paper Effigies:

```sql
INSERT INTO addon_categories (category_name, description, display_order) VALUES
('Paper Effigies (Zhizha)', 'Traditional Chinese paper offerings including houses, cars, money, and other symbolic items', 8);
```

**Common Paper Offerings:**
- Paper House (RM 200-500)
- Paper Car (RM 150-300)
- Paper Money (RM 50-200)
- Paper Clothes (RM 100-250)
- Paper Electronics (RM 100-300)
- Paper Servants (RM 80-150)

**Example Addons:**
```sql
INSERT INTO provider_addons (provider_id, category_id, addon_name, description, price) VALUES
(1, (SELECT category_id FROM addon_categories WHERE category_name = 'Paper Effigies (Zhizha)'),
 'Paper House (Large)', 'Traditional Chinese paper house offering', 500.00),
(1, (SELECT category_id FROM addon_categories WHERE category_name = 'Paper Effigies (Zhizha)'),
 'Paper Car (Mercedes)', 'Luxury paper car offering', 300.00),
(1, (SELECT category_id FROM addon_categories WHERE category_name = 'Paper Effigies (Zhizha)'),
 'Paper Money Set (Complete)', 'Complete set of paper money offerings', 200.00);
```

---

## 12. ANALYTICS & BUSINESS INTELLIGENCE

### Most Popular Buddhist Addons Query

Track which rituals and services are most popular to help providers optimize their offerings:

```sql
-- Smart Insight: Which Buddhist Rituals are trending?
SELECT 
    pa.addon_name, 
    c.category_name,
    COUNT(ba.booking_addon_id) as total_bookings,
    SUM(ba.addon_price) as total_revenue,
    AVG(ba.addon_price) as average_price,
    COUNT(DISTINCT ba.booking_id) as unique_bookings
FROM booking_addons ba
JOIN provider_addons pa ON ba.addon_id = pa.addon_id
JOIN addon_categories c ON pa.category_id = c.category_id
WHERE c.category_name LIKE '%Buddhist%' 
   OR c.category_name LIKE '%Ritual%'
   OR c.category_name LIKE '%Ceremony%'
GROUP BY pa.addon_id, pa.addon_name, c.category_name
ORDER BY total_bookings DESC, total_revenue DESC;
```

### Revenue by Category

```sql
-- Revenue breakdown by addon category
SELECT 
    c.category_name,
    COUNT(DISTINCT ba.booking_id) as bookings_count,
    COUNT(ba.booking_addon_id) as addons_sold,
    SUM(ba.addon_price) as total_revenue,
    AVG(ba.addon_price) as average_addon_price
FROM booking_addons ba
JOIN provider_addons pa ON ba.addon_id = pa.addon_id
JOIN addon_categories c ON pa.category_id = c.category_id
GROUP BY c.category_id, c.category_name
ORDER BY total_revenue DESC;
```

### Package Performance Analysis

```sql
-- Which packages generate the most revenue?
SELECT 
    p.name AS package_name,
    COUNT(b.booking_id) as total_bookings,
    SUM(b.total_amount) as total_revenue,
    AVG(b.total_amount) as average_booking_value,
    AVG(
        (SELECT COUNT(*) FROM booking_addons ba WHERE ba.booking_id = b.booking_id)
    ) as avg_addons_per_booking
FROM packages p
JOIN bookings b ON p.package_id = b.package_id
WHERE b.status IN ('confirmed', 'completed')
GROUP BY p.package_id, p.name
ORDER BY total_revenue DESC;
```

### Provider Performance Comparison

```sql
-- Compare providers by addon sales
SELECT 
    sp.company_name,
    COUNT(DISTINCT b.booking_id) as total_bookings,
    COUNT(ba.booking_addon_id) as total_addons_sold,
    SUM(ba.addon_price) as addon_revenue,
    AVG(ba.addon_price) as avg_addon_price
FROM service_provider sp
JOIN bookings b ON sp.provider_id = b.provider_id
JOIN booking_addons ba ON b.booking_id = ba.booking_id
WHERE b.status IN ('confirmed', 'completed')
GROUP BY sp.provider_id, sp.company_name
ORDER BY addon_revenue DESC;
```

---

## 13. IMPLEMENTATION PRIORITY

### High Priority (Critical for Operations)
1. ✅ **Inventory Tracking** - Prevent overbooking of physical items
2. ✅ **Multi-Day Booking Support** - Essential for Buddhist funeral services
3. ✅ **Parlour as Addon** - More flexible than binary choice

### Medium Priority (Business Optimization)
4. ✅ **Paper Products Category** - Major revenue stream in Chinese market
5. ✅ **Analytics Queries** - Help providers optimize offerings

### Low Priority (Nice to Have)
6. ⚠️ **Advanced Availability System** - Real-time resource blocking
7. ⚠️ **Quantity Selection** - Allow customers to select quantity for addons
8. ⚠️ **Addon Bundles** - Pre-configured addon packages

---

## 14. MIGRATION STRATEGY

### Phase 1: Add New Fields (Non-Breaking)
```sql
-- Add inventory tracking (backward compatible)
ALTER TABLE provider_addons 
ADD COLUMN addon_type ENUM('service', 'item') DEFAULT 'service' AFTER is_custom,
ADD COLUMN stock_quantity INT DEFAULT NULL AFTER addon_type,
ADD COLUMN min_quantity INT DEFAULT 1 AFTER stock_quantity,
ADD COLUMN max_quantity INT DEFAULT NULL AFTER min_quantity;

-- Add capacity to addons (for halls)
ALTER TABLE provider_addons 
ADD COLUMN capacity INT DEFAULT NULL AFTER price;
```

### Phase 2: Create New Tables
```sql
-- Multi-day booking support
CREATE TABLE booking_dates (
    booking_date_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    event_type VARCHAR(50),
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    INDEX idx_booking_date (booking_id, date)
);

-- Resource availability tracking (optional, for advanced scheduling)
CREATE TABLE resource_availability (
    availability_id INT PRIMARY KEY AUTO_INCREMENT,
    provider_id INT NOT NULL,
    resource_type VARCHAR(50), -- 'parlour', 'monk', 'equipment'
    resource_name VARCHAR(255),
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    is_available BOOLEAN DEFAULT TRUE,
    booking_id INT NULL, -- If booked, link to booking
    FOREIGN KEY (provider_id) REFERENCES service_provider(provider_id),
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE SET NULL,
    INDEX idx_resource_date (provider_id, resource_type, date)
);
```

### Phase 3: Data Migration
```sql
-- Migrate existing bookings to booking_dates (if single date exists)
INSERT INTO booking_dates (booking_id, date, start_time, event_type)
SELECT booking_id, service_date, service_time, 'main_service'
FROM bookings
WHERE service_date IS NOT NULL;

-- Set all existing addons as 'service' type (default)
UPDATE provider_addons SET addon_type = 'service' WHERE addon_type IS NULL;
```

---

## 15. CRITICAL OPERATIONAL LOGIC: Availability & Inventory Management

### A. Date Range Overlap Detection (The "Danger Zone")

**The Problem:**
When multiple bookings request the same resource (hall, monk, equipment) with overlapping date ranges, simple date equality checks fail. For example:
- Booking A: Hall 1, Monday to Wednesday
- Booking B: Hall 1, Wednesday to Friday
- **Conflict:** Wednesday is booked by both!

**The Solution:**
A robust SQL procedure that checks for **any** overlap in date ranges, not just exact matches.

**Key Logic:**
```sql
-- Overlap occurs when:
-- 1. Requested start falls within existing booking
-- 2. Requested end falls within existing booking  
-- 3. Requested range completely contains existing booking
-- 4. Existing booking completely contains requested range
```

**Implementation:**
See `backend/sql/AVAILABILITY_AND_INVENTORY_LOGIC.sql` - `CheckResourceAvailability()` procedure.

**Usage:**
```sql
CALL CheckResourceAvailability(
    1,                    -- provider_id
    'parlour',            -- resource_type
    'Hall A',             -- resource_name
    '2024-12-15',         -- start_date
    '2024-12-17',         -- end_date
    '09:00:00',           -- start_time
    '18:00:00',           -- end_time
    NULL                  -- exclude_booking_id (for updates)
);
```

---

### B. Inventory Reservation with TTL (Time-To-Live)

**The Problem:**
When should inventory be decremented?
- **Option A:** When booking is created → Risk: Abandoned carts hold stock hostage
- **Option B:** When booking is paid → Risk: Item sells out during payment

**The Solution:**
**Option A with TTL (Time-To-Live)** - Reserve inventory when booking is created, but automatically release it after 15 minutes if payment isn't received.

**Implementation Flow:**

1. **Booking Created (Pending Status)**
   - Inventory is "reserved" (counted in `reserved_quantity` calculation)
   - Stock is NOT decremented yet
   - Booking has 15-minute TTL

2. **Payment Received (Confirmed Status)**
   - `ConfirmInventory()` procedure is called
   - Stock is actually decremented
   - Reservation becomes permanent

3. **TTL Expired (Background Job)**
   - `ReleaseExpiredReservations()` runs every 5 minutes
   - Finds bookings older than 15 minutes with status 'pending'
   - Changes status to 'expired'
   - Inventory reservation is automatically released

**SQL Procedures:**
- `CheckInventoryAvailability()` - Checks stock accounting for reservations
- `ReserveInventory()` - Reserves inventory (implicit via booking status)
- `ConfirmInventory()` - Decrements stock when booking is confirmed
- `ReleaseExpiredReservations()` - Background job to release expired reservations

**PHP Background Job:**
- `backend/php/ReleaseExpiredReservations.php` - Cron job script
- Should run every 5 minutes: `*/5 * * * * php ReleaseExpiredReservations.php`

---

### C. Comprehensive Booking Validation

**The Problem:**
Before creating a booking, you need to validate:
1. Package exists and is active
2. All selected addons have sufficient stock
3. All requested resources (halls, monks) are available for the date range

**The Solution:**
`ValidateBooking()` stored procedure that checks everything at once.

**Usage:**
```sql
CALL ValidateBooking(
    1,  -- provider_id
    5,  -- package_id
    '[{"date":"2024-12-15","start_time":"09:00","end_time":"18:00","event_type":"wake"}]',  -- service_dates (JSON)
    '[{"addon_id":10,"quantity":2},{"addon_id":15,"quantity":1}]',  -- selected_addons (JSON)
    '[{"resource_type":"parlour","resource_name":"Hall A"}]'  -- resources (JSON)
);
```

**Returns:**
- `is_valid`: TRUE/FALSE
- `error_messages`: Detailed list of validation failures
- `message`: Human-readable summary

---

### D. Resource Availability Queries

**Get Available Resources for Date Range:**
```sql
CALL GetAvailableResources(
    1,              -- provider_id
    'parlour',      -- resource_type
    '2024-12-15',   -- start_date
    '2024-12-20'    -- end_date
);
```

Returns list of resources that are available for the entire date range.

---

## 16. INVENTORY MANAGEMENT WORKFLOW

### Step-by-Step Flow

1. **Customer Selects Addons**
   - Frontend calls `CheckInventoryAvailability()` for each addon
   - Shows "In Stock" or "Out of Stock" to customer
   - Prevents selection of unavailable items

2. **Customer Creates Booking**
   - Frontend calls `ValidateBooking()` with all selections
   - If validation passes, booking is created with status 'pending'
   - Inventory is now "reserved" (counted in availability checks)
   - Stock is NOT decremented yet

3. **Customer Pays (Within 15 Minutes)**
   - Payment gateway confirms payment
   - Backend calls `ConfirmInventory(booking_id)`
   - Stock is decremented
   - Booking status changes to 'confirmed'
   - Stock history is logged

4. **Customer Doesn't Pay (After 15 Minutes)**
   - Background job `ReleaseExpiredReservations()` runs
   - Finds expired booking
   - Changes status to 'expired'
   - Inventory reservation is released
   - Stock becomes available again

5. **Stock Replenishment**
   - Provider adds new stock
   - Updates `stock_quantity` in `provider_addons`
   - Optionally logs in `addon_stock_history` with change_type = 'purchase'

---

## 17. CRON JOB SETUP

### Linux/Unix (crontab)

```bash
# Edit crontab
crontab -e

# Add this line (runs every 5 minutes)
*/5 * * * * cd /path/to/smart_funeral_system/backend && php ReleaseExpiredReservations.php >> /path/to/logs/cron.log 2>&1
```

### Windows (Task Scheduler)

1. Open Task Scheduler
2. Create Basic Task
3. Name: "Release Expired Reservations"
4. Trigger: Every 5 minutes
5. Action: Start a program
   - Program: `php.exe`
   - Arguments: `C:\xampp\htdocs\smart_funeral_system\backend\ReleaseExpiredReservations.php`
   - Start in: `C:\xampp\htdocs\smart_funeral_system\backend`

### Alternative: Database Event Scheduler (MySQL)

```sql
-- Enable event scheduler
SET GLOBAL event_scheduler = ON;

-- Create event
CREATE EVENT IF NOT EXISTS release_expired_reservations
ON SCHEDULE EVERY 5 MINUTE
DO
  CALL ReleaseExpiredReservations();
```

---

## 18. TESTING THE AVAILABILITY LOGIC

### Test Case 1: Date Range Overlap

```sql
-- Booking A: Dec 15-17
INSERT INTO bookings (...) VALUES (...);
INSERT INTO booking_dates (booking_id, date) VALUES (1, '2024-12-15'), (1, '2024-12-16'), (1, '2024-12-17');

-- Try to book Hall A for Dec 17-19 (should fail - Dec 17 overlaps)
CALL CheckResourceAvailability(1, 'parlour', 'Hall A', '2024-12-17', '2024-12-19', NULL, NULL, NULL);
-- Expected: is_available = FALSE, conflict_count = 1
```

### Test Case 2: Inventory TTL

```sql
-- Create pending booking with physical item
INSERT INTO bookings (status, created_at) VALUES ('pending', DATE_SUB(NOW(), INTERVAL 16 MINUTE));
INSERT INTO booking_addons (booking_id, addon_id, quantity) VALUES (1, 10, 2);

-- Check availability (should show as available because booking is expired)
CALL CheckInventoryAvailability(10, 2, NULL);
-- Expected: is_available = TRUE (expired booking doesn't count)

-- Run release job
CALL ReleaseExpiredReservations();
-- Expected: Booking status changes to 'expired'
```

### Test Case 3: Stock Decrement

```sql
-- Confirm booking
CALL ConfirmInventory(123);

-- Verify stock was decremented
SELECT stock_quantity FROM provider_addons WHERE addon_id = 10;
-- Expected: Original stock - 2

-- Check stock history
SELECT * FROM addon_stock_history WHERE booking_id = 123;
-- Expected: Record with change_type = 'sale', quantity_change = -2
```

---

## 19. MONITORING & ALERTS

### Key Metrics to Monitor

1. **Expired Reservation Rate**
   ```sql
   SELECT 
       COUNT(*) as expired_count,
       COUNT(*) * 100.0 / (SELECT COUNT(*) FROM bookings WHERE status IN ('pending', 'expired')) as expired_percentage
   FROM bookings
   WHERE status = 'expired'
     AND DATE(created_at) = CURDATE();
   ```
   - High rate (>20%) may indicate payment issues or TTL too short

2. **Low Stock Alerts**
   ```sql
   SELECT addon_name, stock_quantity
   FROM provider_addons
   WHERE addon_type = 'item'
     AND stock_quantity IS NOT NULL
     AND stock_quantity < 5;  -- Alert threshold
   ```

3. **Resource Conflict Rate**
   ```sql
   -- Track how often availability checks fail
   -- (Requires logging table - see recommendations)
   ```

---

*Document Generated: 2024*
*System: ZENLINK Funeral Management System*
*Last Updated: With Critical Operational Logic (Availability & Inventory Management)*

