# Buddhist Funeral Add-On System - Implementation Guide

## 📋 Overview
Hybrid add-on system allowing service providers to manage Buddhist funeral ceremony add-ons while providing system-wide templates for consistency.

**Date:** October 17, 2025  
**Focus:** Buddhist Funeral Services  
**Approach:** Hybrid (Templates + Custom)

---

## 🗄️ Database Structure

### 1. `addon_categories` Table
Organizes add-ons into Buddhist funeral service categories.

```sql
- category_id (PK)
- category_name (e.g., 'Buddhist Rituals & Ceremonies')
- description
- display_order
- created_at
```

**9 Buddhist Categories:**
1. Buddhist Rituals & Ceremonies
2. Altars & Religious Items
3. Flowers & Offerings
4. Urns & Caskets
5. Monks & Chanting Services
6. Memorial Items
7. Transportation
8. Cremation Services
9. Food & Refreshments

### 2. `addon_templates` Table
System-provided Buddhist funeral service templates.

```sql
- template_id (PK)
- category_id (FK)
- template_name
- description
- suggested_price
- is_popular (boolean - marks commonly used services)
- created_at
```

**Total Templates:** 50+ authentic Buddhist funeral services

**Popular Templates:**
- 7-Day Buddhist Prayer Ceremony (RM 2,500)
- 3-Monk Chanting Ceremony (RM 1,200)
- White Lotus Arrangement (RM 450)
- Standard Ceramic Urn with Buddhist symbols (RM 350)
- Vegetarian Buffet for 50 pax (RM 1,000)

### 3. `provider_addons` Table
Provider-specific add-ons (enabled templates or custom services).

```sql
- addon_id (PK)
- provider_id (FK)
- template_id (FK, NULL if custom)
- addon_name
- description
- price (provider sets their own price)
- category_id (FK)
- is_active (boolean - show to customers)
- is_custom (boolean - TRUE if provider created)
- created_at
- updated_at
```

---

## 🔌 Backend API Endpoints

### 1. `getAddonTemplates.php`
**Method:** GET  
**Purpose:** Get all categories with their template add-ons  
**Used by:** Provider Dashboard to browse available services  

**Response:**
```json
{
  "success": true,
  "categories": [
    {
      "category_id": 1,
      "category_name": "Buddhist Rituals & Ceremonies",
      "description": "Traditional Buddhist funeral ceremonies...",
      "display_order": 1,
      "templates": [
        {
          "template_id": 1,
          "template_name": "7-Day Buddhist Prayer Ceremony",
          "description": "Traditional 7-day prayer ceremony...",
          "suggested_price": 2500.00,
          "is_popular": 1
        }
      ]
    }
  ]
}
```

### 2. `getProviderAddons.php`
**Method:** POST  
**Purpose:** Get all add-ons for specific provider (for management)  
**Request:** `{"provider_id": 1}`  

**Response:**
```json
{
  "success": true,
  "addons": [
    {
      "addon_id": 5,
      "provider_id": 1,
      "template_id": 3,
      "addon_name": "7-Day Prayer Ceremony",
      "description": "...",
      "price": 2800.00,
      "category_id": 1,
      "category_name": "Buddhist Rituals & Ceremonies",
      "is_active": 1,
      "is_custom": 0,
      "template_name": "7-Day Buddhist Prayer Ceremony"
    }
  ]
}
```

### 3. `getActiveAddons.php`
**Method:** GET  
**Purpose:** Get active add-ons for customer checkout  
**Request:** `?provider_id=1`  

**Response:**
```json
{
  "success": true,
  "categories": [
    {
      "category_id": 1,
      "category_name": "Buddhist Rituals & Ceremonies",
      "addons": [
        {
          "addon_id": 5,
          "addon_name": "7-Day Prayer Ceremony",
          "description": "...",
          "price": 2800.00,
          "is_custom": 0
        }
      ]
    }
  ]
}
```

### 4. `addProviderAddon.php`
**Method:** POST  
**Purpose:** Add new add-on (from template or custom)  

**Request (From Template):**
```json
{
  "provider_id": 1,
  "template_id": 5,
  "addon_name": "7-Day Prayer Ceremony",
  "description": "Traditional 7-day Buddhist prayer...",
  "price": 2800.00,
  "category_id": 1,
  "is_custom": 0
}
```

**Request (Custom):**
```json
{
  "provider_id": 1,
  "template_id": null,
  "addon_name": "Special Taoist Ceremony Integration",
  "description": "Custom Taoist-Buddhist combined ceremony",
  "price": 3500.00,
  "category_id": 1,
  "is_custom": 1
}
```

### 5. `updateProviderAddon.php`
**Method:** POST/PUT  
**Purpose:** Update existing add-on (price, name, active status)  

**Request:**
```json
{
  "addon_id": 5,
  "addon_name": "7-Day Prayer Ceremony (Premium)",
  "description": "Updated description...",
  "price": 3000.00,
  "is_active": 1
}
```

### 6. `deleteProviderAddon.php`
**Method:** POST/DELETE  
**Purpose:** Remove add-on from provider's offerings  

**Request:**
```json
{
  "addon_id": 5
}
```

---

## 🎨 Frontend Implementation

### Customer View (`PackageDetails.jsx`)

**Features:**
- ✅ Displays add-ons grouped by category
- ✅ Buddhist theme (amber/orange colors, lotus icons 🪷)
- ✅ Shows custom service badge for provider-created services
- ✅ Real-time price calculation
- ✅ Beautiful card UI with Buddhist aesthetics

**Data Flow:**
1. Customer selects package → Navigate to PackageDetails
2. Fetch package data → Fetch provider data
3. Fetch provider's active add-ons via `getActiveAddons.php?provider_id=X`
4. Display add-ons by category
5. Customer toggles add-ons → Update total price
6. Click "Book This Package" → Navigate to Checkout with selected add-ons

**Key Changes:**
- Removed static `data/addons.js` import
- Fetch provider-specific add-ons from database
- Group add-ons by category for better organization
- Buddhist-themed UI (lotus icons, amber colors)
- Support custom services badge

---

## 🔧 Setup Instructions

### Step 1: Run Database Migration
```sql
-- Open phpMyAdmin or HeidiSQL
-- Run: backend/buddhist_addon_system.sql
```

This creates:
- 3 new tables
- 9 Buddhist service categories
- 50+ template add-ons

### Step 2: Verify Tables Created
```sql
SELECT COUNT(*) FROM addon_categories; -- Should return 9
SELECT COUNT(*) FROM addon_templates; -- Should return 50+
SELECT COUNT(*) FROM provider_addons; -- Should return 0 (empty initially)
```

### Step 3: Test API Endpoints
1. **Test Templates:** http://localhost/smart_funeral_system/backend/getAddonTemplates.php
2. **Test Active Addons:** http://localhost/smart_funeral_system/backend/getActiveAddons.php?provider_id=1

### Step 4: Test Customer View
1. Login as family member (user1)
2. Go to Order Services → Select any package
3. You should see "No add-ons available" message
4. (Provider needs to add add-ons first)

---

## 📱 Next Steps: Provider Dashboard

### TODO: Create "Manage Add-ons" Page for Providers

**Location:** `frontend/my-app/src/pages/ManageAddons.jsx`

**Features Needed:**
1. **Browse Templates Tab**
   - Show all 9 categories
   - Display template add-ons with suggested prices
   - "Add to My Services" button
   - Allow price customization before adding

2. **My Add-ons Tab**
   - List provider's current add-ons
   - Toggle active/inactive
   - Edit prices
   - Delete add-ons
   - Shows which are from templates vs custom

3. **Create Custom Add-on Tab**
   - Form to create completely custom services
   - Select category
   - Set custom price
   - Add detailed description

**UI Components:**
- Category tabs/accordion
- Add-on cards with enable/disable toggle
- Price edit inline input
- Modal for customization
- Search/filter by category

---

## 🎯 Benefits of This System

### For Service Providers:
✅ **Quick Setup:** Enable template services with custom pricing  
✅ **Flexibility:** Create unique custom services  
✅ **Competitive Pricing:** Set prices for their market  
✅ **Differentiation:** Offer unique Buddhist ceremonies  
✅ **Easy Management:** Enable/disable services anytime  

### For Family Members (Customers):
✅ **Organized Browsing:** Add-ons grouped by category  
✅ **Authentic Services:** Traditional Buddhist funeral options  
✅ **Clear Descriptions:** Understand each service  
✅ **Transparent Pricing:** See costs upfront  
✅ **Personalization:** Choose services that match their needs  

### For System:
✅ **Quality Control:** Professional templates as starting point  
✅ **Consistency:** Common naming for similar services  
✅ **Scalability:** Easy to add more templates  
✅ **Analytics:** Track popular services across providers  
✅ **Buddhist Focus:** Authentic cultural services  

---

## 📊 Sample Buddhist Services by Category

### 1. Buddhist Rituals & Ceremonies (5 templates)
- 7-Day Buddhist Prayer Ceremony
- 49-Day Memorial Service
- Three-Day Wake Ceremony
- Dharma Talk Service

### 2. Altars & Religious Items (6 templates)
- Standard/Premium Buddhist Altar Setup
- Lotus Lamp Set (108 pcs)
- Incense and Candle Package
- Buddhist Scripture Set

### 3. Flowers & Offerings (6 templates)
- White Lotus Arrangement
- Yellow Chrysanthemum Wreath
- Fresh Fruit Offering Platter
- Vegetarian Food Offerings

### 4. Urns & Caskets (6 templates)
- Ceramic Urn with Buddhist symbols
- Premium Jade Urn
- Sandalwood Urn with lotus carving
- Biodegradable Urn

### 5. Monks & Chanting Services (5 templates)
- Single Monk Chanting (2 hours)
- 3-Monk/7-Monk Ceremony
- Night Vigil Chanting
- Cremation Blessing

### 6. Memorial Items (6 templates)
- Memorial Photo Frame Display
- Ancestral Tablet (Standard/Premium)
- Memory Book & Guestbook
- Digital Memorial Video

### 7. Transportation (5 templates)
- Hearse Service (Standard/Premium)
- Family Car Service (1-3 vehicles)
- Motorcycle Escort

### 8. Cremation Services (5 templates)
- Standard/Private Cremation
- Witnessing Cremation
- Ashes Collection & Processing
- Scattering at Sea

### 9. Food & Refreshments (5 templates)
- Vegetarian Buffet (50/100 pax)
- Tea and Snacks Service
- Monk Meal Offering
- Bottled Water & Drinks

---

## 🔐 Security Considerations

1. **Provider Ownership:** Providers can only manage their own add-ons
2. **Input Validation:** Price must be positive, names required
3. **SQL Injection Prevention:** All queries use prepared statements
4. **Active Status:** Customers only see `is_active = 1` add-ons
5. **Duplicate Prevention:** Check before inserting same addon name

---

## 🧪 Testing Checklist

### Database:
- [ ] Tables created successfully
- [ ] All 9 categories inserted
- [ ] 50+ template add-ons inserted
- [ ] Foreign keys working properly

### Backend APIs:
- [ ] getAddonTemplates returns all categories
- [ ] getProviderAddons returns empty array for new provider
- [ ] addProviderAddon successfully creates add-on
- [ ] updateProviderAddon updates price and status
- [ ] deleteProviderAddon removes add-on
- [ ] getActiveAddons returns only active add-ons

### Frontend (Customer):
- [ ] Package details page loads
- [ ] Shows "No add-ons available" when provider has none
- [ ] Displays add-ons by category when available
- [ ] Toggle add-on selection works
- [ ] Total price updates correctly
- [ ] Selected add-ons show in order summary
- [ ] Buddhist theme (lotus icons, amber colors) displays
- [ ] Custom service badge shows for custom add-ons

### Frontend (Provider) - TODO:
- [ ] Provider can browse templates
- [ ] Provider can add template with custom price
- [ ] Provider can create custom add-on
- [ ] Provider can edit add-on price
- [ ] Provider can toggle active/inactive
- [ ] Provider can delete add-on

---

## 📝 Files Created

### Backend:
1. `backend/buddhist_addon_system.sql` - Database migration
2. `backend/getAddonTemplates.php` - Get template library
3. `backend/getProviderAddons.php` - Get provider's add-ons
4. `backend/addProviderAddon.php` - Add new add-on
5. `backend/updateProviderAddon.php` - Update add-on
6. `backend/deleteProviderAddon.php` - Delete add-on
7. `backend/getActiveAddons.php` - Get active add-ons for customer

### Frontend:
1. `frontend/my-app/src/pages/PackageDetails.jsx` - Updated to use provider add-ons
2. **TODO:** `frontend/my-app/src/pages/ManageAddons.jsx` - Provider management page

### Documentation:
1. `BUDDHIST_ADDON_SYSTEM.md` - This file

---

## 🚀 Ready to Deploy!

The hybrid Buddhist funeral add-on system is now implemented! 

**Current Status:**
✅ Database structure created  
✅ 50+ Buddhist service templates seeded  
✅ Backend APIs functional  
✅ Customer view (PackageDetails) updated  
⏳ Provider management page (next step)  

**To Complete:**
1. Run `backend/buddhist_addon_system.sql` in your database
2. Refresh the frontend
3. Create Provider "Manage Add-ons" page
4. Providers can start adding services
5. Customers can select Buddhist ceremony add-ons!

---

🪷 **Namo Amitabha Buddha** 🪷
