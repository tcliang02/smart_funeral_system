# 4.3.3 Data Dictionary

This section will provide the description, data types, and size of the attributes within each table in the Smart Funeral Management System database.


Table 4.1: Data Dictionary for 'users' Table

┌─────┬────────────────┬─────────────────────────────────────────────────────────────┬───────────┬──────┐
│ No. │ Attribute Name │ Description                                                 │ Data Type │ Size │
├─────┼────────────────┼─────────────────────────────────────────────────────────────┼───────────┼──────┤
│ 1   │ id             │ Primary key of 'users' table                                │ Integer   │ 10   │
│ 2   │ name           │ Stores user's full name                                     │ Varchar   │ 255  │
│ 3   │ email          │ Stores user's email address                                 │ Varchar   │ 255  │
│ 4   │ password       │ Stores user's hashed password                               │ Varchar   │ 255  │
│ 5   │ phone          │ Stores user's phone number                                  │ Varchar   │ 20   │
│ 6   │ role           │ Stores user's role (family_member, service_provider, admin) │ Varchar   │ 50   │
│ 7   │ created_at     │ Stores date and time when user account was created          │ Timestamp │ -    │
│ 8   │ updated_at     │ Stores date and time when user account was last updated     │ Timestamp │ -    │
└─────┴────────────────┴─────────────────────────────────────────────────────────────┴───────────┴──────┘

Table 4.1 shows the data dictionary of 'users' table. The 'users' table serves as the central authentication repository for all registered users of the Smart Funeral Management System, including family members, service providers, and administrators.

---

## Table 2: Data Dictionary for 'service_provider' Table

| No. | Attribute Name | Description | Data Type | Size |
|-----|----------------|-------------|-----------|------|
| 1 | id | Primary key of 'service_provider' table | Integer | 10 |
| 2 | user_id | Foreign key referencing 'users' table | Integer | 10 |
| 3 | business_name | Stores funeral service provider's business name | Varchar | 255 |
| 4 | description | Stores detailed business description | Text | - |
| 5 | address | Stores business street address | Varchar | 255 |
| 6 | city | Stores business city location | Varchar | 100 |
| 7 | state | Stores business state/province | Varchar | 100 |
| 8 | postal_code | Stores business postal/zip code | Varchar | 20 |
| 9 | contact_person | Stores name of primary contact person | Varchar | 255 |
| 10 | phone | Stores business contact phone number | Varchar | 20 |
| 11 | email | Stores business contact email | Varchar | 255 |
| 12 | status | Stores provider account status (active, inactive, suspended) | Varchar | 50 |
| 13 | avg_rating | Stores calculated average customer rating | Decimal(3,2) | - |
| 14 | total_reviews | Stores total number of customer reviews received | Integer | 10 |
| 15 | created_at | Stores date and time when provider account was created | Timestamp | - |
| 16 | updated_at | Stores date and time when provider profile was last updated | Timestamp | - |

**Table Description:** The 'service_provider' table contains detailed business profile information for funeral service providers registered in the system.

---

## Table 3: Data Dictionary for 'provider_availability' Table

| No. | Attribute Name | Description | Data Type | Size |
|-----|----------------|-------------|-----------|------|
| 1 | id | Primary key of 'provider_availability' table | Integer | 10 |
| 2 | provider_id | Foreign key referencing 'service_provider' table | Integer | 10 |
| 3 | available_date | Stores specific date for service availability | Date | - |
| 4 | total_capacity | Stores maximum bookings provider can handle per date | Integer | 10 |
| 5 | booked_capacity | Stores current number of bookings for the date | Integer | 10 |
| 6 | is_available | Stores boolean indicating if date is still available | Boolean | 1 |
| 7 | notes | Stores optional notes about availability (special conditions, holiday hours) | Text | - |
| 8 | created_at | Stores date and time when availability record was created | Timestamp | - |
| 9 | updated_at | Stores date and time when availability was last updated | Timestamp | - |

**Table Description:** The 'provider_availability' table manages date-based capacity scheduling for service providers to prevent overbooking and track available service slots.

---

## Table 4: Data Dictionary for 'profile_activity_log' Table

| No. | Attribute Name | Description | Data Type | Size |
|-----|----------------|-------------|-----------|------|
| 1 | id | Primary key of 'profile_activity_log' table | Integer | 10 |
| 2 | user_id | Foreign key referencing 'users' table (provider account) | Integer | 10 |
| 3 | activity_type | Stores type of activity (profile_update, availability_change, login) | Varchar | 100 |
| 4 | activity_details | Stores detailed description of the activity performed | Text | - |
| 5 | ip_address | Stores IP address from which activity was performed | Varchar | 45 |
| 6 | created_at | Stores date and time when activity occurred | Timestamp | - |

**Table Description:** The 'profile_activity_log' table tracks all provider profile activities for security auditing and compliance purposes.

---

## Table 5: Data Dictionary for 'tributes' Table

| No. | Attribute Name | Description | Data Type | Size |
|-----|----------------|-------------|-----------|------|
| 1 | id | Primary key of 'tributes' table | Integer | 10 |
| 2 | user_id | Foreign key referencing 'users' table (tribute creator) | Integer | 10 |
| 3 | deceased_name | Stores full name of deceased person | Varchar | 255 |
| 4 | date_of_birth | Stores deceased person's birth date | Date | - |
| 5 | date_of_passing | Stores deceased person's passing date | Date | - |
| 6 | biography | Stores detailed life story and memories of deceased | Text | - |
| 7 | profile_photo | Stores file path/URL of deceased person's photo | Varchar | 255 |
| 8 | privacy | Stores privacy level (public, private, family_only) | Varchar | 50 |
| 9 | slug | Stores unique URL-friendly identifier for tribute page | Varchar | 255 |
| 10 | created_at | Stores date and time when tribute was created | Timestamp | - |
| 11 | updated_at | Stores date and time when tribute was last updated | Timestamp | - |

**Table Description:** The 'tributes' table stores core memorial information for deceased individuals, serving as the central entity for all tribute-related features.

---

## Table 6: Data Dictionary for 'tribute_messages' Table

| No. | Attribute Name | Description | Data Type | Size |
|-----|----------------|-------------|-----------|------|
| 1 | id | Primary key of 'tribute_messages' table | Integer | 10 |
| 2 | tribute_id | Foreign key referencing 'tributes' table | Integer | 10 |
| 3 | author_name | Stores name of person leaving condolence message | Varchar | 255 |
| 4 | author_email | Stores email of message author (optional) | Varchar | 255 |
| 5 | message | Stores condolence message content | Text | - |
| 6 | message_type | Stores type of message (condolence, memory, prayer) | Varchar | 50 |
| 7 | is_approved | Stores moderation status (pending, approved, rejected) | Boolean | 1 |
| 8 | created_at | Stores date and time when message was posted | Timestamp | - |

**Table Description:** The 'tribute_messages' table stores condolence messages, memories, and prayers posted by visitors on tribute memorial pages.

---

## Table 7: Data Dictionary for 'tribute_photos' Table

| No. | Attribute Name | Description | Data Type | Size |
|-----|----------------|-------------|-----------|------|
| 1 | id | Primary key of 'tribute_photos' table | Integer | 10 |
| 2 | tribute_id | Foreign key referencing 'tributes' table | Integer | 10 |
| 3 | photo_url | Stores file path/URL of uploaded memorial photo | Varchar | 255 |
| 4 | caption | Stores optional caption/description for the photo | Text | - |
| 5 | uploaded_by_name | Stores name of person who uploaded the photo | Varchar | 255 |
| 6 | uploaded_at | Stores date and time when photo was uploaded | Timestamp | - |

**Table Description:** The 'tribute_photos' table manages memorial photo galleries uploaded by family members and funeral attendees.

---

## Table 8: Data Dictionary for 'tribute_rsvp' Table

| No. | Attribute Name | Description | Data Type | Size |
|-----|----------------|-------------|-----------|------|
| 1 | id | Primary key of 'tribute_rsvp' table | Integer | 10 |
| 2 | tribute_id | Foreign key referencing 'tributes' table | Integer | 10 |
| 3 | user_id | Foreign key referencing 'users' table (optional for registered users) | Integer | 10 |
| 4 | event_id | Stores identifier for specific memorial event | Integer | 10 |
| 5 | event_name | Stores name of memorial event (Funeral Service, Wake, Memorial) | Varchar | 255 |
| 6 | event_datetime | Stores date and time of memorial event | Datetime | - |
| 7 | event_location | Stores venue/location of memorial event | Varchar | 255 |
| 8 | description | Stores event description and special instructions | Text | - |
| 9 | max_attendees | Stores maximum number of attendees allowed | Integer | 10 |
| 10 | rsvp_name | Stores name of person submitting RSVP | Varchar | 255 |
| 11 | rsvp_email | Stores email for RSVP confirmation | Varchar | 255 |
| 12 | attendance_status | Stores attendance response (attending, not_attending, maybe) | Varchar | 50 |
| 13 | number_of_guests | Stores number of additional guests attending | Integer | 10 |
| 14 | created_at | Stores date and time when RSVP was submitted | Timestamp | - |

**Table Description:** The 'tribute_rsvp' table manages memorial event information and tracks attendee RSVP responses.

---

## Table 9: Data Dictionary for 'packages' Table

| No. | Attribute Name | Description | Data Type | Size |
|-----|----------------|-------------|-----------|------|
| 1 | id | Primary key of 'packages' table | Integer | 10 |
| 2 | provider_id | Foreign key referencing 'service_provider' table | Integer | 10 |
| 3 | package_name | Stores descriptive name of funeral service package | Varchar | 255 |
| 4 | description | Stores detailed description of services included | Text | - |
| 5 | price | Stores base price of the package | Decimal(10,2) | - |
| 6 | features | Stores summary of key package features | Text | - |
| 7 | is_active | Stores package availability status | Boolean | 1 |
| 8 | created_at | Stores date and time when package was created | Timestamp | - |
| 9 | updated_at | Stores date and time when package was last updated | Timestamp | - |

**Table Description:** The 'packages' table contains funeral service package offerings created and managed by service providers.

---

## Table 10: Data Dictionary for 'package_features' Table

| No. | Attribute Name | Description | Data Type | Size |
|-----|----------------|-------------|-----------|------|
| 1 | id | Primary key of 'package_features' table | Integer | 10 |
| 2 | package_id | Foreign key referencing 'packages' table | Integer | 10 |
| 3 | feature_name | Stores name of specific feature (e.g., "Professional Embalming") | Varchar | 255 |
| 4 | feature_description | Stores detailed description of the feature | Text | - |
| 5 | display_order | Stores ordering sequence for feature display | Integer | 10 |
| 6 | created_at | Stores date and time when feature was added | Timestamp | - |

**Table Description:** The 'package_features' table stores individual features and services included in each funeral service package for detailed breakdowns.

---

## Table 11: Data Dictionary for 'addon_categories' Table

| No. | Attribute Name | Description | Data Type | Size |
|-----|----------------|-------------|-----------|------|
| 1 | id | Primary key of 'addon_categories' table | Integer | 10 |
| 2 | category_name | Stores unique name of add-on category | Varchar | 255 |
| 3 | description | Stores description of add-on category purpose | Text | - |
| 4 | is_active | Stores category availability status | Boolean | 1 |
| 5 | display_order | Stores ordering sequence for category display | Integer | 10 |
| 6 | created_at | Stores date and time when category was created | Timestamp | - |

**Table Description:** The 'addon_categories' table organizes add-on services into logical groups (Buddhist Ceremony, Video Tribute, Transportation, etc.).

---

## Table 12: Data Dictionary for 'addon_templates' Table

| No. | Attribute Name | Description | Data Type | Size |
|-----|----------------|-------------|-----------|------|
| 1 | id | Primary key of 'addon_templates' table | Integer | 10 |
| 2 | category_id | Foreign key referencing 'addon_categories' table | Integer | 10 |
| 3 | template_name | Stores standardized name for add-on template | Varchar | 255 |
| 4 | description | Stores template description and typical use case | Text | - |
| 5 | price | Stores suggested/base price for template | Decimal(10,2) | - |
| 6 | is_active | Stores template availability status | Boolean | 1 |
| 7 | display_order | Stores ordering sequence for template display | Integer | 10 |
| 8 | created_at | Stores date and time when template was created | Timestamp | - |

**Table Description:** The 'addon_templates' table provides reusable add-on blueprints that providers can customize for their specific offerings.

---

## Table 13: Data Dictionary for 'provider_addons' Table

| No. | Attribute Name | Description | Data Type | Size |
|-----|----------------|-------------|-----------|------|
| 1 | id | Primary key of 'provider_addons' table | Integer | 10 |
| 2 | provider_id | Foreign key referencing 'service_provider' table | Integer | 10 |
| 3 | template_id | Foreign key referencing 'addon_templates' table | Integer | 10 |
| 4 | category_id | Foreign key referencing 'addon_categories' table | Integer | 10 |
| 5 | addon_name | Stores provider's custom name for add-on | Varchar | 255 |
| 6 | description | Stores provider-specific description | Text | - |
| 7 | price | Stores provider's custom pricing | Decimal(10,2) | - |
| 8 | is_active | Stores add-on availability status | Boolean | 1 |
| 9 | created_at | Stores date and time when add-on was created | Timestamp | - |
| 10 | updated_at | Stores date and time when add-on was last updated | Timestamp | - |

**Table Description:** The 'provider_addons' table links add-on templates to specific providers with customized pricing and details.

---

## Table 14: Data Dictionary for 'bookings' Table

| No. | Attribute Name | Description | Data Type | Size |
|-----|----------------|-------------|-----------|------|
| 1 | id | Primary key of 'bookings' table | Integer | 10 |
| 2 | user_id | Foreign key referencing 'users' table (customer) | Integer | 10 |
| 3 | provider_id | Foreign key referencing 'service_provider' table | Integer | 10 |
| 4 | package_id | Foreign key referencing 'packages' table | Integer | 10 |
| 5 | availability_id | Foreign key referencing 'provider_availability' table | Integer | 10 |
| 6 | service_date | Stores scheduled date for funeral service | Date | - |
| 7 | service_time | Stores scheduled time for funeral service | Time | - |
| 8 | package_price | Stores package cost at time of booking | Decimal(10,2) | - |
| 9 | addons_total | Stores total cost of selected add-ons | Decimal(10,2) | - |
| 10 | total_amount | Stores final total amount for booking | Decimal(10,2) | - |
| 11 | payment_method | Stores payment method used (FPX, eWallet, Credit Card) | Varchar | 50 |
| 12 | status | Stores booking status (pending, confirmed, completed, cancelled) | Varchar | 50 |
| 13 | special_requests | Stores customer's special requirements or notes | Text | - |
| 14 | created_at | Stores date and time when booking was created | Timestamp | - |
| 15 | updated_at | Stores date and time when booking was last updated | Timestamp | - |

**Table Description:** The 'bookings' table manages the complete booking lifecycle from service request to completion, including payment information.

---

## Table 15: Data Dictionary for 'booking_addons' Table

| No. | Attribute Name | Description | Data Type | Size |
|-----|----------------|-------------|-----------|------|
| 1 | id | Primary key of 'booking_addons' table | Integer | 10 |
| 2 | booking_id | Foreign key referencing 'bookings' table | Integer | 10 |
| 3 | addon_id | Foreign key referencing 'provider_addons' table | Integer | 10 |
| 4 | addon_name | Stores snapshot of add-on name at time of booking | Varchar | 255 |
| 5 | addon_price | Stores snapshot of add-on price at time of booking | Decimal(10,2) | - |
| 6 | quantity | Stores number of units of this add-on booked | Integer | 10 |
| 7 | created_at | Stores date and time when add-on was added to booking | Timestamp | - |

**Table Description:** The 'booking_addons' table creates many-to-many relationship between bookings and selected add-on services.

---

## Table 16: Data Dictionary for 'provider_reviews' Table

| No. | Attribute Name | Description | Data Type | Size |
|-----|----------------|-------------|-----------|------|
| 1 | id | Primary key of 'provider_reviews' table | Integer | 10 |
| 2 | user_id | Foreign key referencing 'users' table (reviewer) | Integer | 10 |
| 3 | provider_id | Foreign key referencing 'service_provider' table | Integer | 10 |
| 4 | booking_id | Foreign key referencing 'bookings' table | Integer | 10 |
| 5 | rating | Stores numerical rating (1-5 stars) | Integer | 10 |
| 6 | review_text | Stores written review content | Text | - |
| 7 | created_at | Stores date and time when review was submitted | Timestamp | - |
| 8 | updated_at | Stores date and time when review was last edited | Timestamp | - |

**Table Description:** The 'provider_reviews' table enables customer feedback through ratings and written reviews for service quality transparency.

---

## Table 17: Data Dictionary for 'voice_models' Table

| No. | Attribute Name | Description | Data Type | Size |
|-----|----------------|-------------|-----------|------|
| 1 | id | Primary key of 'voice_models' table | Integer | 10 |
| 2 | model_name | Stores unique name of AI voice model | Varchar | 255 |
| 3 | description | Stores description of model capabilities | Text | - |
| 4 | api_endpoint | Stores API URL for voice model service | Varchar | 255 |
| 5 | is_active | Stores model availability status | Boolean | 1 |
| 6 | created_at | Stores date and time when model was configured | Timestamp | - |

**Table Description:** The 'voice_models' table stores AI model configurations for the voice memorial chatbot feature.

---

## Table 18: Data Dictionary for 'personality_traits' Table

| No. | Attribute Name | Description | Data Type | Size |
|-----|----------------|-------------|-----------|------|
| 1 | id | Primary key of 'personality_traits' table | Integer | 10 |
| 2 | tribute_id | Foreign key referencing 'tributes' table | Integer | 10 |
| 3 | trait_category | Stores category of personality trait (hobby, characteristic, belief) | Varchar | 100 |
| 4 | trait_value | Stores specific trait description | Text | - |
| 5 | created_at | Stores date and time when trait was added | Timestamp | - |

**Table Description:** The 'personality_traits' table captures personality characteristics of the deceased to personalize AI voice interactions.

---

## Table 19: Data Dictionary for 'memories_database' Table

| No. | Attribute Name | Description | Data Type | Size |
|-----|----------------|-------------|-----------|------|
| 1 | id | Primary key of 'memories_database' table | Integer | 10 |
| 2 | tribute_id | Foreign key referencing 'tributes' table | Integer | 10 |
| 3 | memory_text | Stores detailed memory or anecdote about deceased | Text | - |
| 4 | memory_type | Stores type of memory (story, achievement, favorite_saying) | Varchar | 100 |
| 5 | created_at | Stores date and time when memory was added | Timestamp | - |

**Table Description:** The 'memories_database' table preserves memorial anecdotes and stories used by AI to generate contextual responses.

---

## Table 20: Data Dictionary for 'voice_chat_settings' Table

| No. | Attribute Name | Description | Data Type | Size |
|-----|----------------|-------------|-----------|------|
| 1 | id | Primary key of 'voice_chat_settings' table | Integer | 10 |
| 2 | tribute_id | Foreign key referencing 'tributes' table | Integer | 10 |
| 3 | model_id | Foreign key referencing 'voice_models' table | Integer | 10 |
| 4 | is_enabled | Stores whether voice chat is active for tribute | Boolean | 1 |
| 5 | access_level | Stores who can access voice chat (family_only, public) | Varchar | 50 |
| 6 | created_at | Stores date and time when settings were configured | Timestamp | - |

**Table Description:** The 'voice_chat_settings' table manages AI voice chat behavior and access permissions for each tribute.

---

## Table 21: Data Dictionary for 'voice_conversations' Table

| No. | Attribute Name | Description | Data Type | Size |
|-----|----------------|-------------|-----------|------|
| 1 | id | Primary key of 'voice_conversations' table | Integer | 10 |
| 2 | tribute_id | Foreign key referencing 'tributes' table | Integer | 10 |
| 3 | model_id | Foreign key referencing 'voice_models' table | Integer | 10 |
| 4 | user_query | Stores user's input question/message | Text | - |
| 5 | bot_response | Stores AI-generated response | Text | - |
| 6 | response_time | Stores time taken to generate response (milliseconds) | Integer | 10 |
| 7 | created_at | Stores date and time when conversation occurred | Timestamp | - |

**Table Description:** The 'voice_conversations' table logs all AI chatbot interactions for quality improvement and conversation history.

---

## Database Summary

### Total Tables: 21

### Functional Groups:
1. **Authentication (1 table):** users
2. **Service Providers (3 tables):** service_provider, provider_availability, profile_activity_log
3. **Tributes & Interactions (4 tables):** tributes, tribute_messages, tribute_photos, tribute_rsvp
4. **Services (5 tables):** packages, package_features, addon_categories, addon_templates, provider_addons
5. **Bookings (3 tables):** bookings, booking_addons, provider_reviews
6. **AI Voice Memorial (5 tables):** voice_models, personality_traits, memories_database, voice_chat_settings, voice_conversations

### Total Relationships: 30 connections
### Total Attributes: 235+ fields across all tables

---

**This data dictionary is production-ready and documents the complete database schema for the Smart Funeral Management System!** 🎉
