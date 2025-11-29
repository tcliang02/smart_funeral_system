# Entity Relationship Diagram (ERD) - Smart Funeral System

## Complete Database Schema

```mermaid
erDiagram
    USERS {
        int user_id PK
        int id FK
        string name
        string username
        string email UK
        string password
        string phone
        string address
        string profile_picture
        string role FK
        boolean is_active FK
        timestamp created_at
        timestamp updated_at
    }
    
    SERVICE_PROVIDER {
        int provider_id PK
        int user_id FK
        string company_name
        string logo_url
        string business_type
        string business_registration
        text description
        string address
        string city
        string state
        string postal_code
        string phone
        string email FK
        string website
        string facebook_url
        string instagram_url
        string operating_hours
        text services_offered
        decimal average_price
        int total_packages
        string logo
        decimal rating FK
        int total_reviews
        boolean is_verified
        boolean is_active FK
        timestamp created_at
        timestamp updated_at
    }
    
    PACKAGES {
        int package_id PK
        int provider_id FK
        string name
        text description
        decimal price
        int capacity
        int duration_hours
        string location_type
        boolean is_active FK
        boolean is_featured FK
        timestamp created_at
        timestamp updated_at
    }
    
    PACKAGE_FEATURES {
        int feature_id PK
        int package_id FK
        string feature_name
        timestamp created_at
    }
    
    ADDON_CATEGORIES {
        int category_id PK
        string category_name
        text description
        int display_order
        timestamp created_at
    }
    
    ADDON_TEMPLATES {
        int template_id PK
        int category_id FK
        string template_name
        text description
        decimal suggested_price
        boolean is_popular FK
        timestamp created_at
    }
    
    PROVIDER_ADDONS {
        int addon_id PK
        int provider_id FK
        int template_id FK
        string addon_name
        text description
        decimal price
        int category_id FK
        boolean is_active
        boolean is_custom
        timestamp created_at
        timestamp updated_at
    }
    
    PROVIDER_AVAILABILITY {
        int availability_id PK
        int provider_id FK
        date date_unavailable
        text reason
        timestamp created_at
    }
    
    BOOKINGS {
        int booking_id PK
        string booking_reference
        int user_id FK
        int provider_id FK
        int package_id FK
        date booking_date
        date service_date FK
        time service_time
        text service_address
        decimal total_amount
        string status FK
        string customer_name
        string customer_email
        string customer_phone
        text special_requirements
        json uploaded_files
        text provider_notes
        text cancellation_reason
        string cancelled_by
        timestamp cancelled_at
        timestamp confirmed_at
        decimal refund_amount
        string payment_status
        string payment_method
        timestamp created_at
        timestamp updated_at
    }
    
    BOOKING_ADDONS {
        int booking_addon_id PK
        int booking_id FK
        string addon_name
        decimal addon_price
        int quantity
    }
    
    PROVIDER_REVIEWS {
        int review_id PK
        int reviewer_user_id FK
        int provider_id FK
        int booking_id FK
        int rating FK
        text review_text
        string review_category
        string review_type
        timestamp created_at
        timestamp updated_at
    }
    
    PROFILE_ACTIVITY_LOG {
        int log_id PK
        int user_id FK
        string action_type FK
        text action_details
        timestamp created_at FK
    }
    
    TRIBUTES {
        int tribute_id PK
        string deceased_name
        date birth_date
        date death_date
        text biography
        string photo_url
        boolean is_public FK
        int view_count
        int flower_count
        string slug UK
        int created_by FK
        timestamp created_at
        timestamp updated_at
        text life_story
        boolean allow_messages
        boolean enable_rsvp
        string grave_location_name
        text grave_address
        text donation_items
        string bank_account_number
        string bank_account_name
        string bank_name
        string donation_qr_code
        string location_of_birth
        text grave_invite_message
        datetime grave_datetime
        string map_link
        string virtual_link
        boolean allow_photos
    }
    
    TRIBUTE_MESSAGES {
        int message_id PK
        int tribute_id FK
        string sender_name
        string sender_email
        text message
        string photo_url
        boolean is_approved
        timestamp created_at
    }
    
    TRIBUTE_PHOTOS {
        int photo_id PK
        int tribute_id FK
        string photo_url
        string caption
        int uploaded_by
        timestamp created_at
    }
    
    TRIBUTE_RSVP {
        int rsvp_id PK
        int tribute_id FK
        string attendee_name
        string attendee_email
        string attendee_phone
        boolean will_attend
        string attendance_type
        int number_of_guests
        text message
        timestamp created_at
    }
    
    VOICE_MODELS {
        int voice_id PK
        int tribute_id FK
        string elevenlabs_voice_id
        string audio_sample_path
        int sample_duration
        string status
        int created_by FK
        timestamp created_at
    }
    
    PERSONALITY_TRAITS {
        int id PK
        int tribute_id FK
        string trait_category
        text trait_value
        timestamp created_at
    }
    
    MEMORIES_DATABASE {
        int id PK
        int tribute_id FK
        text memory_text
        string memory_type
        timestamp created_at
    }
    
    VOICE_CHAT_SETTINGS {
        int id PK
        int tribute_id UK
        boolean is_enabled
        string access_level
        timestamp created_at
        timestamp updated_at
    }
    
    VOICE_CONVERSATIONS {
        int id PK
        int tribute_id FK
        text user_input
        text ai_response
        string audio_url
        timestamp created_at
    }
    
    USERS ||--o{ TRIBUTES : creates
    USERS ||--o{ BOOKINGS : places
    USERS ||--o{ TRIBUTE_MESSAGES : writes
    USERS ||--o{ TRIBUTE_PHOTOS : uploads
    USERS ||--o{ TRIBUTE_RSVP : responds
    USERS ||--o{ PROVIDER_REVIEWS : writes
    USERS ||--o{ PROFILE_ACTIVITY_LOG : logs
    USERS ||--|| SERVICE_PROVIDER : "registers as"
    
    SERVICE_PROVIDER ||--o{ PACKAGES : offers
    SERVICE_PROVIDER ||--o{ PROVIDER_ADDONS : provides
    SERVICE_PROVIDER ||--o{ BOOKINGS : receives
    SERVICE_PROVIDER ||--o{ PROVIDER_REVIEWS : receives
    SERVICE_PROVIDER ||--o{ PROVIDER_AVAILABILITY : manages
    
    PACKAGES ||--o{ PACKAGE_FEATURES : contains
    PACKAGES ||--o{ BOOKINGS : "booked in"
    
    ADDON_CATEGORIES ||--o{ ADDON_TEMPLATES : contains
    ADDON_TEMPLATES ||--o{ PROVIDER_ADDONS : "template for"
    
    BOOKINGS ||--o{ BOOKING_ADDONS : includes
    BOOKINGS ||--|| PROVIDER_REVIEWS : "reviewed in"
    
    TRIBUTES ||--o{ TRIBUTE_MESSAGES : contains
    TRIBUTES ||--o{ TRIBUTE_PHOTOS : displays
    TRIBUTES ||--o{ TRIBUTE_RSVP : manages
    TRIBUTES ||--o{ VOICE_MODELS : stores
    TRIBUTES ||--o{ PERSONALITY_TRAITS : defines
    TRIBUTES ||--o{ MEMORIES_DATABASE : remembers
    TRIBUTES ||--|| VOICE_CHAT_SETTINGS : configures
    
    VOICE_MODELS ||--o{ VOICE_CONVERSATIONS : generates
```

## Key Relationships

### User Management
- **USERS** (1) → (M) **TRIBUTES**: One user can create multiple tributes
- **USERS** (1) → (M) **BOOKINGS**: One user can make multiple bookings
- **USERS** (1) → (M) **PROVIDER_REVIEWS**: One user can write multiple reviews
- **USERS** (1) → (M) **TRIBUTE_MESSAGES/PHOTOS**: One user can interact with tributes
- **USERS** (1) → (M) **PROFILE_ACTIVITY_LOG**: One user has multiple activity logs
- **USERS** (1) → (1) **SERVICE_PROVIDER**: One user can register as one service provider

### Service Provider System
- **SERVICE_PROVIDER** (1) → (M) **PACKAGES**: One provider offers multiple packages
- **SERVICE_PROVIDER** (1) → (M) **PROVIDER_ADDONS**: One provider provides multiple add-ons
- **SERVICE_PROVIDER** (1) → (M) **BOOKINGS**: One provider receives multiple bookings
- **SERVICE_PROVIDER** (1) → (M) **PROVIDER_REVIEWS**: One provider receives multiple reviews
- **SERVICE_PROVIDER** (1) → (M) **PROVIDER_AVAILABILITY**: One provider manages availability dates

### Add-on System
- **ADDON_CATEGORIES** (1) → (M) **ADDON_TEMPLATES**: One category contains multiple templates
- **ADDON_TEMPLATES** (1) → (M) **PROVIDER_ADDONS**: One template can be used by multiple providers
- **ADDON_CATEGORIES** (1) → (M) **PROVIDER_ADDONS**: One category organizes multiple provider add-ons

### Booking System
- **PACKAGES** (1) → (M) **PACKAGE_FEATURES**: One package has multiple features
- **PACKAGES** (1) → (M) **BOOKINGS**: One package can be booked multiple times
- **BOOKINGS** (1) → (M) **BOOKING_ADDONS**: One booking includes multiple add-ons
- **BOOKINGS** (1) → (1) **PROVIDER_REVIEWS**: One booking can have one review

### Tribute System
- **TRIBUTES** (1) → (M) **TRIBUTE_MESSAGES**: One tribute has multiple condolence messages (tribute wall)
- **TRIBUTES** (1) → (M) **TRIBUTE_PHOTOS**: One tribute displays multiple memorial photos
- **TRIBUTES** (1) → (M) **TRIBUTE_RSVP**: One tribute manages multiple RSVP responses for funeral events

### Voice Memory AI System
- **TRIBUTES** (1) → (M) **VOICE_MODELS**: One tribute can have multiple voice models
- **TRIBUTES** (1) → (M) **PERSONALITY_TRAITS**: One tribute defines personality characteristics
- **TRIBUTES** (1) → (M) **MEMORIES_DATABASE**: One tribute stores multiple memories for AI context
- **TRIBUTES** (1) → (1) **VOICE_CHAT_SETTINGS**: One tribute has one voice chat configuration
- **VOICE_MODELS** (1) → (M) **VOICE_CONVERSATIONS**: One voice model generates multiple conversations

## Data Integrity Rules

1. **Cascading Deletes**: Deleting a tribute removes all associated messages, photos, RSVPs, voice models, and memories
2. **Soft Deletes**: Users and service providers use status flags instead of hard deletes  
3. **Unique Constraints**: Email (users), slug (tributes), booking_reference (bookings)
4. **Foreign Key Constraints**: All relationships enforce referential integrity
5. **Check Constraints**: Rating (1-5), status enums, boolean flags

## Database Summary

**Total Tables: 21**

### Core System (5 tables):
- users, service_provider, profile_activity_log, provider_availability, tributes

### Booking System (5 tables):
- packages, package_features, bookings, booking_addons, provider_reviews

### Add-on System (3 tables):
- addon_categories, addon_templates, provider_addons

### Tribute Features (3 tables):
- tribute_messages, tribute_photos, tribute_rsvp

### Voice AI System (5 tables):
- voice_models, personality_traits, memories_database, voice_chat_settings, voice_conversations

## Note on Features

- **Virtual Candles**: The `allow_candles` field exists in tributes table but no tribute_candles table - feature not implemented
- **Voice AI**: Full implementation with 5 tables for ElevenLabs voice cloning and AI personality
- **Add-on Templates**: Providers can create add-ons from predefined templates in 9 categories
- **Provider Availability**: Providers can mark dates as unavailable for bookings
