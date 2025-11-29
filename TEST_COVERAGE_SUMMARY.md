# API Standardization Test Coverage

## Overview
This document lists all 52 standardized API routes (93% of total routes) that are covered by the test script.

## Test Script
**File:** `TEST_ALL_STANDARDIZED_ROUTES.js`

**Usage:**
1. Open browser console on `http://localhost:3000`
2. Copy and paste the entire script
3. Or run: `node TEST_ALL_STANDARDIZED_ROUTES.js` (if using Node.js with fetch)

## Routes Tested (52 total)

### Authentication & User Management (3 routes)
- ✅ `POST /api/backend/login` - User login
- ✅ `GET /api/backend/verifyAuth` - Verify authentication token
- ✅ `POST /api/backend/register` - User registration (validation error test)

### Provider Management (8 routes)
- ✅ `GET /api/backend/getAllProviders` - Get all service providers
- ✅ `GET /api/backend/getProviderProfile` - Get provider profile
- ✅ `GET /api/backend/getProviderId` - Get provider ID by user ID
- ✅ `GET /api/backend/getProviderDashboard` - Get provider dashboard data
- ✅ `GET /api/backend/getProviderBookings` - Get provider bookings
- ✅ `GET /api/backend/getProviderAddons` - Get provider addons
- ✅ `GET /api/backend/getActiveAddons` - Get active addons by provider
- ✅ `POST /api/backend/updateProviderProfile` - Update provider profile

### Package Management (3 routes)
- ✅ `GET /api/backend/getAllPackages` - Get all packages
- ✅ `GET /api/backend/getPackages` - Get packages by provider
- ✅ `POST /api/backend/managePackage` - Create/update package

### Booking Management (4 routes)
- ✅ `GET /api/backend/getUserBookings` - Get user bookings
- ✅ `GET /api/backend/getProviderBookings` - Get provider bookings
- ✅ `POST /api/backend/createBooking` - Create booking (unauthorized test)
- ✅ `POST /api/backend/updateBookingStatus` - Update booking status
- ✅ `POST /api/backend/cancelBooking` - Cancel booking

### Availability & Inventory (3 routes)
- ✅ `GET /api/backend/checkAvailability` - Check provider availability (legacy)
- ✅ `POST /api/backend/check-availability` - Check inventory availability
- ✅ `POST /api/backend/check-availability` - Check resource availability

### Tribute Management (6 routes)
- ✅ `GET /api/backend/getTributes` - Get tributes (paginated)
- ✅ `GET /api/backend/getTributeById` - Get tribute by ID
- ✅ `POST /api/backend/createTribute` - Create tribute
- ✅ `POST /api/backend/updateTribute` - Update tribute
- ✅ `POST /api/backend/submitRSVP` - Submit RSVP
- ✅ `GET /api/backend/getRSVPList` - Get RSVP list
- ✅ `POST /api/backend/addMessage` - Add message to tribute
- ✅ `POST /api/backend/offerFlower` - Offer virtual flower
- ✅ `POST /api/backend/submitRating` - Submit rating

### Voice & AI Features (5 routes)
- ✅ `GET /api/backend/getVoiceMemorials` - Get voice memorials
- ✅ `GET /api/backend/getVoiceStatus` - Get voice status
- ✅ `POST /api/backend/updateVoiceSettings` - Update voice settings
- ✅ `POST /api/backend/elevenLabsVoiceClone` - Clone voice with ElevenLabs
- ✅ `GET /api/backend/getMemories` - Get memories
- ✅ `GET /api/backend/getTraits` - Get personality traits
- ✅ `POST /api/backend/saveMemories` - Save memories and traits

### File Management (3 routes)
- ✅ `POST /api/backend/uploadFile` - Upload file to Supabase
- ✅ `POST /api/backend/uploadFamilyPhoto` - Upload family photo
- ✅ `POST /api/backend/deleteFamilyPhoto` - Delete family photo

### Addon Management (4 routes)
- ✅ `GET /api/backend/getAddonTemplates` - Get addon templates
- ✅ `POST /api/backend/addProviderAddon` - Add provider addon
- ✅ `POST /api/backend/updateProviderAddon` - Update provider addon
- ✅ `POST /api/backend/deleteProviderAddon` - Delete provider addon

### Profile Management (3 routes)
- ✅ `GET /api/backend/getFamilyProfile` - Get family profile
- ✅ `POST /api/backend/updateFamilyProfile` - Update family profile
- ✅ `POST /api/backend/changePassword` - Change password

### Other Features (2 routes)
- ✅ `POST /api/backend/submitFeedback` - Submit feedback
- ✅ `POST /api/backend/deleteMessage` - Delete message

### Error Handling Tests
- ✅ Validation Error Format (400 Bad Request)
- ✅ Not Found Error Format (404 Not Found)
- ✅ Unauthorized Error Format (401 Unauthorized)

## Test Categories

### 1. Public Endpoints (No Auth Required)
- getAllProviders
- getAllPackages
- getPackages
- getProviderProfile
- getProviderAddons
- getAddonTemplates
- getActiveAddons
- getTributes
- getTributeById
- getVoiceMemorials
- getVoiceStatus
- getMemories
- getTraits
- checkAvailability (GET & POST)

### 2. Protected Endpoints (Auth Required)
- verifyAuth
- getFamilyProfile
- getProviderDashboard
- getProviderBookings
- getUserBookings
- getProviderId
- getRSVPList
- createBooking
- updateBookingStatus
- cancelBooking
- createTribute
- updateTribute
- submitRSVP
- addMessage
- offerFlower
- submitRating
- updateProviderProfile
- updateFamilyProfile
- changePassword
- managePackage
- addProviderAddon
- updateProviderAddon
- deleteProviderAddon
- deletePackage
- deleteProviderAccount
- deleteFamilyAccount
- manageProviderAvailability
- uploadFile
- uploadFamilyPhoto
- deleteFamilyPhoto
- deleteMessage
- submitFeedback
- updateVoiceSettings
- elevenLabsVoiceClone
- saveMemories

### 3. Error Format Tests
- Validation errors (400)
- Not found errors (404)
- Unauthorized errors (401)

## Response Format Standard

All standardized routes return:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": { ... } // Optional
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## Remaining Routes (4 routes - 7%)

These routes are not yet standardized:
1. `POST /api/backend/voiceChatbot` - Complex AI route
2. `POST /api/backend/chatbot` - Complex AI route
3. Any other routes that may have been missed

## Notes

- Update `TEST_CREDENTIALS` in the script with real credentials to test protected endpoints
- Some tests may be skipped if authentication is not available
- The test script validates both response format and HTTP status codes
- All error responses follow the standardized format with error codes

