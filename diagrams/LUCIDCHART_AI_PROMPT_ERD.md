# Lucidchart AI Prompt - ERD Database Schema
## Smart Funeral Management System

---

## 🤖 AI Prompt for Lucidchart

```
Create an Entity Relationship Diagram (ERD) for a Smart Funeral Management System with 21 tables organized into 8 modules:

MODULE 1 - CORE USER MANAGEMENT (2 tables):
Table: users
- id (PK, int)
- email (UK, string)
- password (string)
- name (string)
- phone (string)
- role (string)
- created_at (datetime)
- updated_at (datetime)

Table: profile_activity_log
- id (PK, int)
- user_id (FK → users, int)
- activity_type (string)
- activity_details (text)
- ip_address (string)
- created_at (datetime)

MODULE 2 - SERVICE PROVIDER MANAGEMENT (5 tables):
Table: service_provider
- id (PK, int)
- user_id (FK → users, int)
- business_name (string)
- description (text)
- address (string)
- city (string)
- state (string)
- postal_code (string)
- contact_person (string)
- phone (string)
- email (string)
- status (string)
- avg_rating (decimal)
- total_reviews (int)
- created_at (datetime)
- updated_at (datetime)

Table: packages
- id (PK, int)
- provider_id (FK → service_provider, int)
- package_name (string)
- description (text)
- price (decimal)
- features (text)
- is_active (boolean)
- created_at (datetime)
- updated_at (datetime)

Table: addon_categories
- id (PK, int)
- category_name (UK, string)
- description (text)
- is_active (boolean)
- display_order (int)
- created_at (datetime)

Table: provider_addons
- id (PK, int)
- provider_id (FK → service_provider, int)
- category_id (FK → addon_categories, int)
- addon_name (string)
- description (text)
- price (decimal)
- is_active (boolean)
- created_at (datetime)
- updated_at (datetime)

Table: provider_availability
- id (PK, int)
- provider_id (FK → service_provider, int)
- available_date (UK, date)
- total_capacity (int)
- booked_capacity (int)
- is_available (boolean)
- notes (text)
- created_at (datetime)
- updated_at (datetime)

MODULE 3 - TRIBUTE SYSTEM (3 tables):
Table: tributes
- id (PK, int)
- user_id (FK → users, int)
- deceased_name (string)
- date_of_birth (date)
- date_of_passing (date)
- biography (text)
- profile_photo (string)
- privacy (string)
- slug (UK, string)
- created_at (datetime)
- updated_at (datetime)

Table: tribute_messages
- id (PK, int)
- tribute_id (FK → tributes, int)
- author_name (string)
- author_email (string)
- message (text)
- message_type (string)
- is_approved (boolean)
- created_at (datetime)

Table: tribute_photos
- id (PK, int)
- tribute_id (FK → tributes, int)
- photo_url (string)
- caption (string)
- uploaded_by_name (string)
- uploaded_at (datetime)

MODULE 4 - EVENT MANAGEMENT (2 tables):
Table: rsvp_events
- id (PK, int)
- tribute_id (FK → tributes, int)
- event_name (string)
- event_datetime (datetime)
- location (string)
- description (text)
- max_attendees (int)
- created_at (datetime)

Table: rsvp_responses
- id (PK, int)
- event_id (FK → rsvp_events, int)
- user_id (FK → users, int, nullable)
- guest_name (string)
- guest_email (string)
- guest_phone (string)
- response (string)
- number_of_guests (int)
- created_at (datetime)

MODULE 5 - BOOKING SYSTEM (2 tables):
Table: bookings
- id (PK, int)
- user_id (FK → users, int)
- provider_id (FK → service_provider, int)
- package_id (FK → packages, int)
- availability_id (FK → provider_availability, int)
- service_date (date)
- service_time (time)
- package_price (decimal)
- addons_total (decimal)
- total_amount (decimal)
- status (string)
- special_requests (text)
- created_at (datetime)
- updated_at (datetime)

Table: booking_addons
- id (PK, int)
- booking_id (FK → bookings, int)
- addon_id (FK → provider_addons, int)
- addon_name (string)
- addon_price (decimal)
- quantity (int)
- created_at (datetime)

MODULE 6 - PAYMENT SYSTEM (1 table):
Table: payments
- id (PK, int)
- booking_id (FK → bookings, int)
- amount (decimal)
- payment_method (string)
- payment_status (string)
- transaction_id (UK, string)
- gateway_response (text)
- payment_date (datetime)
- created_at (datetime)

MODULE 7 - REVIEW SYSTEM (1 table):
Table: reviews
- id (PK, int)
- user_id (FK → users, int)
- provider_id (FK → service_provider, int)
- booking_id (FK → bookings, int, nullable)
- rating (int)
- review_text (text)
- created_at (datetime)
- updated_at (datetime)

MODULE 8 - AI VOICE CHATBOT (2 tables):
Table: voice_models
- id (PK, int)
- model_name (UK, string)
- description (string)
- api_endpoint (string)
- is_active (boolean)
- created_at (datetime)

Table: voice_chat_history
- id (PK, int)
- user_id (FK → users, int, nullable)
- model_id (FK → voice_models, int)
- user_query (text)
- bot_response (text)
- response_time (float)
- created_at (datetime)

RELATIONSHIPS:
- users → tributes (1:N)
- users → bookings (1:N)
- users → reviews (1:N)
- users → rsvp_responses (1:N)
- users → profile_activity_log (1:N)
- users → voice_chat_history (1:N)
- service_provider → packages (1:N)
- service_provider → provider_addons (1:N)
- service_provider → provider_availability (1:N)
- service_provider → bookings (1:N)
- service_provider → reviews (1:N)
- tributes → tribute_messages (1:N)
- tributes → tribute_photos (1:N)
- tributes → rsvp_events (1:N)
- bookings → packages (N:1)
- bookings → booking_addons (1:N)
- bookings → payments (1:1)
- bookings → provider_availability (N:1)
- addon_categories → provider_addons (1:N)
- provider_addons → booking_addons (1:N)
- rsvp_events → rsvp_responses (1:N)
- voice_models → voice_chat_history (1:N)

Use standard ERD notation with crow's foot symbols for cardinality. Group tables by modules with clear visual separation. Use professional database colors.
```

---

## 📝 Simplified Prompt (If AI Rejects Above)

```
Create a database ERD with 21 tables for a funeral management system:

Core tables: users, service_provider, tributes, bookings, packages, provider_addons, addon_categories, provider_availability, tribute_messages, tribute_photos, rsvp_events, rsvp_responses, booking_addons, payments, reviews, profile_activity_log, voice_models, voice_chat_history

Show all primary keys (PK), foreign keys (FK), and unique keys (UK). Use crow's foot notation for relationships. Group tables by function: user management, service providers, tributes, bookings, payments, reviews, and AI chatbot.
```

---

## 🎨 Manual Drawing Guide for Lucidchart

### Step 1: Initial Setup (2 minutes)
1. Open Lucidchart
2. Click "Create new document"
3. Select "Entity Relationship Diagram (ERD)" template
4. Choose "Crow's Foot" notation style
5. Set canvas to **Landscape orientation**, **A3 size** (for 21 tables)

### Step 2: Create Table Shapes (15 minutes)

**For each of the 21 tables:**
1. Drag an **Entity** shape from left panel
2. Double-click to edit table name
3. Click the **"+"** icon to add attributes
4. For each attribute:
   - Enter attribute name
   - Select data type from dropdown
   - Check boxes for: PK (Primary Key), FK (Foreign Key), UK (Unique Key)

**Table Organization by Module:**

**Row 1 - Core User Management:**
- `users` (8 attributes)
- `profile_activity_log` (6 attributes)

**Row 2 - Service Provider Management:**
- `service_provider` (16 attributes)
- `packages` (9 attributes)
- `addon_categories` (6 attributes)

**Row 3 - Provider Services:**
- `provider_addons` (9 attributes)
- `provider_availability` (9 attributes)

**Row 4 - Tribute System:**
- `tributes` (11 attributes)
- `tribute_messages` (8 attributes)
- `tribute_photos` (6 attributes)

**Row 5 - Event Management:**
- `rsvp_events` (7 attributes)
- `rsvp_responses` (9 attributes)

**Row 6 - Booking System:**
- `bookings` (14 attributes)
- `booking_addons` (7 attributes)

**Row 7 - Payment & Review:**
- `payments` (9 attributes)
- `reviews` (8 attributes)

**Row 8 - AI Chatbot:**
- `voice_models` (6 attributes)
- `voice_chat_history` (7 attributes)

### Step 3: Draw Relationships (20 minutes)

**Use Crow's Foot Connector Tool:**

**Core User Relationships (6 connections):**
1. `users` → `tributes` (1:N - one to many)
2. `users` → `bookings` (1:N)
3. `users` → `reviews` (1:N)
4. `users` → `rsvp_responses` (1:N)
5. `users` → `profile_activity_log` (1:N)
6. `users` → `voice_chat_history` (1:N)

**Service Provider Relationships (5 connections):**
7. `service_provider` → `packages` (1:N)
8. `service_provider` → `provider_addons` (1:N)
9. `service_provider` → `provider_availability` (1:N)
10. `service_provider` → `bookings` (1:N)
11. `service_provider` → `reviews` (1:N)

**Tribute System Relationships (3 connections):**
12. `tributes` → `tribute_messages` (1:N)
13. `tributes` → `tribute_photos` (1:N)
14. `tributes` → `rsvp_events` (1:N)

**Booking System Relationships (4 connections):**
15. `bookings` → `packages` (N:1 - many to one)
16. `bookings` → `booking_addons` (1:N)
17. `bookings` → `payments` (1:1 - one to one)
18. `bookings` → `provider_availability` (N:1)

**Add-on Management Relationships (2 connections):**
19. `addon_categories` → `provider_addons` (1:N)
20. `provider_addons` → `booking_addons` (1:N)

**Event Management Relationships (1 connection):**
21. `rsvp_events` → `rsvp_responses` (1:N)

**AI Chatbot Relationships (1 connection):**
22. `voice_models` → `voice_chat_history` (1:N)

**Total Relationships: 22 connections**

### Step 4: Apply Styling (10 minutes)

**Color Scheme by Module:**
1. **Core User Management**: Light Blue (#D1ECF1) with Dark Blue border (#0C5460)
2. **Service Provider Management**: Light Orange (#FFE5CC) with Dark Orange border (#CC8A39)
3. **Tribute System**: Light Purple (#E8DAEF) with Purple border (#7D3C98)
4. **Event Management**: Light Pink (#F9EBEA) with Pink border (#CB4335)
5. **Booking System**: Light Green (#D4EDDA) with Green border (#28A745)
6. **Payment System**: Light Yellow (#FFF3CD) with Yellow border (#856404)
7. **Review System**: Light Teal (#D1F2EB) with Teal border (#148F77)
8. **AI Chatbot**: Light Gray (#E5E7E9) with Gray border (#566573)

**For Each Table:**
1. Select table shape
2. Right-click → Format
3. Fill: Choose module color
4. Border: 2px solid, module border color
5. Text: Bold for table name, regular for attributes

**For Relationship Lines:**
1. Select all relationship lines
2. Set line width: 2px
3. Set line color: #34495E (dark gray)
4. Ensure crow's foot symbols are visible

### Step 5: Add Legend (5 minutes)

**Create a legend box in top-right corner:**
```
LEGEND
━━━━━━━━━━━━━━━━━
PK  = Primary Key
FK  = Foreign Key
UK  = Unique Key

CARDINALITY
━━━━━━━━━━━━━━━━━
1:1  = One to One
1:N  = One to Many
N:1  = Many to One

MODULES
━━━━━━━━━━━━━━━━━
🔵 Core User (2 tables)
🟠 Service Provider (5 tables)
🟣 Tribute System (3 tables)
🔴 Event Management (2 tables)
🟢 Booking System (2 tables)
🟡 Payment System (1 table)
🔵 Review System (1 table)
⚪ AI Chatbot (2 tables)

Total: 21 Tables
```

### Step 6: Add Title (2 minutes)

**Top of diagram:**
1. Insert Text Box
2. Enter: **"Smart Funeral Management System - Database ERD"**
3. Font: Arial or Helvetica, 24pt, Bold
4. Color: #2C3E50 (dark gray)
5. Align: Center

### Step 7: Final Adjustments (6 minutes)

1. **Auto-arrange tables**: Select all → Arrange → Distribute Vertically
2. **Align relationship lines**: Use elbow connectors for cleaner look
3. **Add spacing**: Ensure 50px minimum gap between tables
4. **Check overlap**: Move tables if lines cross unnecessarily
5. **Zoom test**: View at 50%, 100%, 150% to ensure readability
6. **Export options**: File → Download → PDF or PNG (high resolution)

---

## ⚙️ Technical Requirements

### Key Constraints to Show

**Primary Keys (21 total):**
- Every table has `id` as PK

**Foreign Keys (19 total):**
- `profile_activity_log.user_id` → `users.id`
- `service_provider.user_id` → `users.id`
- `packages.provider_id` → `service_provider.id`
- `provider_addons.provider_id` → `service_provider.id`
- `provider_addons.category_id` → `addon_categories.id`
- `provider_availability.provider_id` → `service_provider.id`
- `tributes.user_id` → `users.id`
- `tribute_messages.tribute_id` → `tributes.id`
- `tribute_photos.tribute_id` → `tributes.id`
- `rsvp_events.tribute_id` → `tributes.id`
- `rsvp_responses.event_id` → `rsvp_events.id`
- `rsvp_responses.user_id` → `users.id` (nullable)
- `bookings.user_id` → `users.id`
- `bookings.provider_id` → `service_provider.id`
- `bookings.package_id` → `packages.id`
- `bookings.availability_id` → `provider_availability.id`
- `booking_addons.booking_id` → `bookings.id`
- `booking_addons.addon_id` → `provider_addons.id`
- `payments.booking_id` → `bookings.id`
- `reviews.user_id` → `users.id`
- `reviews.provider_id` → `service_provider.id`
- `reviews.booking_id` → `bookings.id` (nullable)
- `voice_chat_history.user_id` → `users.id` (nullable)
- `voice_chat_history.model_id` → `voice_models.id`

**Unique Keys (5 total):**
- `users.email`
- `tributes.slug`
- `addon_categories.category_name`
- `provider_availability.available_date` (composite with provider_id)
- `payments.transaction_id`
- `voice_models.model_name`

### Cardinality Notation

**One to Many (1:N) - 19 relationships:**
- Use crow's foot (three lines) on "many" side
- Use single line on "one" side

**One to One (1:1) - 1 relationship:**
- `bookings` ↔ `payments`
- Use single line on both sides

**Many to One (N:1) - 2 relationships:**
- `bookings` → `packages`
- `bookings` → `provider_availability`
- Use crow's foot on "many" side

---

## 📊 Expected Output Specifications

**Diagram Size:** A3 Landscape (297mm × 420mm)  
**Table Count:** 21 tables  
**Relationship Count:** 22 connections  
**Attribute Count:** ~180 total attributes  
**Estimated Time:** 60 minutes for complete manual creation  

**Quality Checklist:**
- ✅ All 21 tables visible and labeled
- ✅ All attributes listed with correct data types
- ✅ All PKs, FKs, UKs marked clearly
- ✅ All 22 relationships drawn with correct cardinality
- ✅ Color-coded by module (8 colors)
- ✅ Legend included
- ✅ Title present
- ✅ No overlapping lines
- ✅ Professional appearance
- ✅ Readable at 100% zoom

---

## 🚀 Quick Tips

1. **Start with core tables** (`users`, `service_provider`) then branch out
2. **Use alignment tools** to keep diagram organized
3. **Group related tables** by proximity (module grouping)
4. **Test readability** by zooming to 50% - should still be clear
5. **Save frequently** during manual creation
6. **Export high-res PDF** for documentation (300 DPI minimum)

---

**Total estimated time for manual creation: ~60 minutes**  
**AI generation time (if accepted): ~30 seconds**
