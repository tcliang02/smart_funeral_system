# ZENLINK: API Endpoints Quick Reference

## 🔗 Base URL
- **Development:** `http://localhost:3000`
- **Production:** `https://your-domain.com`

---

## 📋 Authentication & User Management

### Login
```http
POST /api/backend/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Register
```http
POST /api/backend/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123",
  "phone": "0123456789",
  "role": "family"
}
```

### Verify Auth
```http
GET /api/backend/verifyAuth
Headers: { "Authorization": "Bearer <token>" }
```

---

## 🏢 Service Providers & Packages

### Get All Providers
```http
GET /api/backend/getAllProviders
```

### Get All Packages
```http
GET /api/backend/getAllPackages
```

### Get Provider Packages
```http
POST /api/backend/getPackages
Content-Type: application/json

{
  "provider_id": 19
}
```

### Manage Package
```http
POST /api/backend/managePackage  # Create
PUT /api/backend/managePackage   # Update
```

---

## 🛍️ Addons & Templates

### Get Addon Templates
```http
GET /api/backend/getAddonTemplates
```

### Get Provider Addons
```http
POST /api/backend/getProviderAddons
Content-Type: application/json

{
  "provider_id": 19
}
```

### Get Active Addons (for booking)
```http
GET /api/backend/getActiveAddons?provider_id=19
```

### Add Provider Addon
```http
POST /api/backend/addProviderAddon
Content-Type: application/json

{
  "provider_id": 19,
  "template_id": 1,
  "addon_name": "Premium Urn",
  "price": 1000.00,
  "category_id": 4
}
```

---

## 📅 Booking System ⭐ ERP

### Create Booking
```http
POST /api/backend/createBooking
Content-Type: application/json

{
  "package_id": 103,
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "0123456789",
  "service_date": "2024-12-15",
  "service_dates": [
    {
      "date": "2024-12-15",
      "start_time": "09:00:00",
      "end_time": "18:00:00",
      "event_type": "wake_day_1"
    }
  ],
  "selected_addons": [
    {
      "addon_id": 10,
      "addon_name": "Premium Urn",
      "price": 1000.00,
      "quantity": 2
    }
  ],
  "total_amount": 7600.00
}
```

### Update Booking Status
```http
POST /api/backend/updateBookingStatus
Content-Type: application/json

{
  "booking_id": 117,
  "provider_id": 19,
  "new_status": "confirmed",
  "provider_notes": "Booking confirmed"
}
```

### Check Availability ⭐ NEW
```http
POST /api/backend/check-availability
Content-Type: application/json

# Inventory Check
{
  "type": "inventory",
  "addon_id": 10,
  "quantity": 2
}

# Resource Check
{
  "type": "resource",
  "provider_id": 19,
  "resource_type": "parlour",
  "resource_name": "Hall A",
  "start_date": "2024-12-15",
  "end_date": "2024-12-17"
}
```

### Get User Bookings
```http
GET /api/backend/getUserBookings?user_id=16
```

### Get Provider Bookings
```http
GET /api/backend/getProviderBookings?provider_id=19
```

---

## 🕯️ Tribute System

### Get Tributes
```http
GET /api/backend/getTributes
```

### Get Tribute by ID
```http
GET /api/backend/getTributeById?tribute_id=1
```

### Create Tribute
```http
POST /api/backend/createTribute
Content-Type: application/json

{
  "deceased_name": "John Doe",
  "birth_date": "1950-01-01",
  "death_date": "2024-01-01",
  "biography": "...",
  "is_public": true
}
```

### Add Message
```http
POST /api/backend/addMessage
Content-Type: application/json

{
  "tribute_id": 1,
  "message": "Rest in peace...",
  "author_name": "Friend"
}
```

### Submit RSVP
```http
POST /api/backend/submitRSVP
Content-Type: application/json

{
  "tribute_id": 1,
  "guest_name": "Jane Doe",
  "will_attend": true,
  "number_of_guests": 2
}
```

---

## 🤖 AI Chatbot

### Chatbot
```http
POST /api/backend/chatbot
Content-Type: application/json

{
  "message": "I'm feeling sad",
  "mode": "grief_counselor",
  "user_id": 16
}
```

### Voice Chatbot
```http
POST /api/backend/voiceChatbot
Content-Type: application/json

{
  "tribute_id": 1,
  "message": "Tell me about yourself",
  "user_id": 16
}
```

---

## 📊 Provider Dashboard

### Get Dashboard
```http
GET /api/backend/getProviderDashboard?provider_id=19
```

### Manage Availability
```http
GET /api/backend/manageProviderAvailability?provider_id=19&start_date=2024-12-01&end_date=2024-12-31

POST /api/backend/manageProviderAvailability
Content-Type: application/json

{
  "provider_id": 19,
  "date_unavailable": "2024-12-25",
  "reason": "Holiday"
}
```

---

## 📤 File Uploads

### Upload File
```http
POST /api/backend/uploadFile
Content-Type: multipart/form-data

{
  "file": <File>
}
```

### Upload Multiple Files
```http
POST /api/backend/uploadFiles
Content-Type: multipart/form-data

{
  "files": [<File1>, <File2>, ...]
}
```

---

## ⭐ Key ERP Endpoints

### Inventory Availability
```http
POST /api/backend/check-availability
{
  "type": "inventory",
  "addon_id": 10,
  "quantity": 2
}
```

### Resource Availability
```http
POST /api/backend/check-availability
{
  "type": "resource",
  "provider_id": 19,
  "resource_type": "parlour",
  "resource_name": "Hall A",
  "start_date": "2024-12-15",
  "end_date": "2024-12-17"
}
```

### Booking Creation (with validation)
```http
POST /api/backend/createBooking
# Includes:
# - Inventory validation
# - Resource availability check
# - Multi-day date insertion
# - Inventory reservation
```

### Booking Confirmation (with stock decrement)
```http
POST /api/backend/updateBookingStatus
{
  "new_status": "confirmed"
}
# Automatically:
# - Decrements stock for physical items
# - Logs to stock history
```

---

## 🔍 Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

---

## 📝 Notes

- All endpoints return JSON
- Authentication required for most endpoints (JWT token in Authorization header)
- CORS enabled for development
- All dates in ISO format (YYYY-MM-DD)
- All prices in RM (Malaysian Ringgit)

---

**Total Endpoints: 50+**
**ERP Endpoints: 5+ (inventory, resources, booking validation)**


