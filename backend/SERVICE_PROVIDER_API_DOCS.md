# Smart Funeral System - Backend API Documentation
## Service Provider Enhancement

### 🚀 Overview
Enhanced backend API for service provider management with comprehensive CRUD operations, booking management, and advanced filtering capabilities.

---

## 📋 Table of Contents
1. [Provider Management APIs](#provider-management)
2. [Package Management APIs](#package-management)
3. [Booking Management APIs](#booking-management)
4. [Dashboard & Analytics APIs](#dashboard-analytics)
5. [Database Schema](#database-schema)
6. [Error Handling](#error-handling)

---

## 🏢 Provider Management APIs

### 1. Create Provider Profile
**Endpoint:** `POST /backend/createProviderProfile.php`

**Description:** Create a new service provider profile

**Request Body:**
```json
{
  "user_id": 123,
  "company_name": "Peaceful Funeral Services",
  "address": "123 Memorial Ave, Kuala Lumpur",
  "phone": "+60123456789",
  "description": "Compassionate funeral services with dignity",
  "website": "https://peaceful-funeral.com",
  "logo_url": "/uploads/logo.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Provider profile created successfully",
  "provider_id": 456
}
```

### 2. Get Advanced Provider List
**Endpoint:** `GET /backend/getProvidersAdvanced.php`

**Description:** Get providers with advanced filtering and pagination

**Query Parameters:**
- `location` (string): Filter by location
- `min_price` (number): Minimum average price
- `max_price` (number): Maximum average price
- `rating` (number): Minimum rating (1-5)
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 50)

**Example Request:**
```
GET /backend/getProvidersAdvanced.php?location=Kuala%20Lumpur&min_price=1000&max_price=5000&rating=4&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "providers": [
    {
      "provider_id": 1,
      "company_name": "Peaceful Funeral Services",
      "address": "123 Memorial Ave, Kuala Lumpur",
      "phone": "+60123456789",
      "description": "Compassionate funeral services",
      "website": "https://peaceful-funeral.com",
      "logo_url": "/uploads/logo.jpg",
      "average_price": 3500.00,
      "total_packages": 5,
      "avg_rating": 4.5,
      "review_count": 23,
      "package_count": 5,
      "featured_packages": [
        {
          "package_id": 1,
          "name": "Premium Service Package",
          "price": 4500.00,
          "description": "Complete funeral service package",
          "image_url": "/uploads/package1.jpg"
        }
      ]
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 3,
    "total_count": 25,
    "per_page": 10
  }
}
```

### 3. Get Provider Details
**Endpoint:** `GET /backend/getProviderDetails.php`

**Description:** Get comprehensive details for a specific provider

**Query Parameters:**
- `provider_id` (required): Provider ID

**Response:**
```json
{
  "success": true,
  "provider": {
    "provider_id": 1,
    "company_name": "Peaceful Funeral Services",
    "address": "123 Memorial Ave, Kuala Lumpur",
    "phone": "+60123456789",
    "description": "Compassionate funeral services",
    "website": "https://peaceful-funeral.com",
    "avg_rating": 4.5,
    "review_count": 23
  },
  "packages": [
    {
      "package_id": 1,
      "name": "Premium Service Package",
      "description": "Complete funeral service",
      "price": 4500.00,
      "features": ["Professional guidance", "Transportation", "Embalming"]
    }
  ],
  "reviews": [
    {
      "rating": 5,
      "review_text": "Excellent service",
      "reviewer_name": "John Doe",
      "created_at": "2024-01-15 10:30:00"
    }
  ],
  "statistics": {
    "total_bookings": 45,
    "total_packages": 5,
    "avg_package_price": 3200.00
  }
}
```

---

## 📦 Package Management APIs

### 1. Create/Update Package
**Endpoint:** `POST/PUT /backend/managePackage.php`

**Description:** Create new package (POST) or update existing (PUT)

**Request Body (Create):**
```json
{
  "provider_id": 1,
  "name": "Premium Funeral Package",
  "description": "Complete funeral service with all amenities",
  "price": 4500.00,
  "image_url": "/uploads/premium-package.jpg",
  "is_featured": 1,
  "features": [
    "Professional funeral director guidance",
    "Transportation of deceased",
    "Embalming and preparation",
    "Use of funeral home facilities",
    "Basic floral arrangements"
  ]
}
```

**Request Body (Update):**
```json
{
  "package_id": 123,
  "provider_id": 1,
  "name": "Updated Premium Package",
  "description": "Enhanced funeral service package",
  "price": 4800.00,
  "image_url": "/uploads/premium-package-v2.jpg",
  "is_featured": 1,
  "features": [
    "Professional funeral director guidance",
    "Transportation of deceased",
    "Embalming and preparation",
    "Premium floral arrangements",
    "Memorial video creation"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Package created/updated successfully",
  "package_id": 123
}
```

---

## 📅 Booking Management APIs

### 1. Create Booking
**Endpoint:** `POST /backend/createBooking.php`

**Description:** Create a new booking for a package

**Request Body:**
```json
{
  "package_id": 123,
  "customer_name": "John Smith",
  "customer_email": "john.smith@email.com",
  "customer_phone": "+60123456789",
  "service_date": "2024-12-15",
  "service_address": "123 Memorial Drive, Kuala Lumpur",
  "special_requirements": "Religious ceremony required",
  "total_amount": 5200.00,
  "selected_addons": [
    {
      "name": "Premium Flowers",
      "price": 500.00
    },
    {
      "name": "Video Recording",
      "price": 200.00
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "booking_id": 789,
  "booking_reference": "BK000789",
  "package_name": "Premium Funeral Package"
}
```

### 2. Manage Bookings
**Endpoint:** `POST/PUT /backend/manageBookings.php`

**Description:** Update booking status (POST) or get provider bookings (PUT)

**Update Status Request (POST):**
```json
{
  "booking_id": 789,
  "status": "confirmed",
  "provider_notes": "Confirmed service for December 15th. All arrangements in place."
}
```

**Get Bookings Request (PUT):**
```json
{
  "provider_id": 1,
  "status": "pending",
  "page": 1,
  "limit": 10
}
```

**Get Bookings Response:**
```json
{
  "success": true,
  "bookings": [
    {
      "booking_id": 789,
      "booking_reference": "BK000789",
      "customer_name": "John Smith",
      "customer_email": "john.smith@email.com",
      "customer_phone": "+60123456789",
      "service_date": "2024-12-15",
      "service_address": "123 Memorial Drive, KL",
      "total_amount": 5200.00,
      "status": "pending",
      "package_name": "Premium Funeral Package",
      "addons": [
        {
          "addon_name": "Premium Flowers",
          "addon_price": 500.00
        }
      ]
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 2,
    "total_count": 15,
    "per_page": 10
  }
}
```

---

## 📊 Dashboard & Analytics APIs

### 1. Provider Dashboard
**Endpoint:** `GET /backend/getProviderDashboard.php`

**Description:** Get comprehensive dashboard data for service provider

**Query Parameters:**
- `user_id` (required): User ID of the provider

**Response:**
```json
{
  "success": true,
  "provider": {
    "provider_id": 1,
    "company_name": "Peaceful Funeral Services",
    "avg_rating": 4.5,
    "review_count": 23
  },
  "statistics": {
    "total_bookings": 45,
    "total_packages": 5,
    "total_revenue": 156750.00,
    "pending_bookings": 3,
    "confirmed_bookings": 8,
    "completed_bookings": 34
  },
  "recent_bookings": [
    {
      "booking_id": 789,
      "customer_name": "John Smith",
      "service_date": "2024-12-15",
      "total_amount": 5200.00,
      "status": "pending",
      "package_name": "Premium Package"
    }
  ],
  "monthly_stats": [
    {
      "month": 12,
      "year": 2024,
      "booking_count": 8,
      "total_revenue": 28500.00
    }
  ],
  "packages": [
    {
      "package_id": 1,
      "name": "Premium Package",
      "price": 4500.00,
      "booking_count": 12,
      "is_featured": 1
    }
  ]
}
```

---

## 🗄️ Database Schema

### Key Tables

#### service_provider
```sql
- provider_id (INT, PRIMARY KEY)
- user_id (INT, FOREIGN KEY)
- company_name (VARCHAR)
- address (VARCHAR)
- phone (VARCHAR)
- description (TEXT)
- website (VARCHAR)
- logo_url (VARCHAR)
- average_price (DECIMAL)
- total_packages (INT)
- years_experience (INT)
- specialties (TEXT)
- service_areas (TEXT)
- is_verified (BOOLEAN)
- is_active (BOOLEAN)
```

#### packages
```sql
- package_id (INT, PRIMARY KEY)
- provider_id (INT, FOREIGN KEY)
- name (VARCHAR)
- description (TEXT)
- price (DECIMAL)
- image_url (VARCHAR)
- capacity (VARCHAR)
- duration_hours (INT)
- is_featured (BOOLEAN)
```

#### bookings
```sql
- booking_id (INT, PRIMARY KEY)
- booking_reference (VARCHAR)
- package_id (INT, FOREIGN KEY)
- customer_name (VARCHAR)
- customer_email (VARCHAR)
- customer_phone (VARCHAR)
- service_date (DATE)
- service_address (TEXT)
- total_amount (DECIMAL)
- status (ENUM)
- provider_notes (TEXT)
```

#### package_features
```sql
- feature_id (INT, PRIMARY KEY)
- package_id (INT, FOREIGN KEY)
- feature_name (VARCHAR)
```

#### provider_reviews
```sql
- review_id (INT, PRIMARY KEY)
- provider_id (INT, FOREIGN KEY)
- reviewer_name (VARCHAR)
- rating (INT, 1-5)
- review_text (TEXT)
```

---

## ⚠️ Error Handling

### Standard Error Response
```json
{
  "success": false,
  "message": "Error description here"
}
```

### Common Error Codes
- **400**: Bad Request - Missing required fields
- **401**: Unauthorized - Invalid authentication
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource doesn't exist
- **500**: Server Error - Database or server issues

### Validation Rules
- All required fields must be provided
- Email addresses must be valid format
- Phone numbers should include country code
- Prices must be positive decimal values
- Dates must be in YYYY-MM-DD format
- Status values must be from predefined enum

---

## 🚀 Usage Examples

### Frontend Integration (JavaScript)
```javascript
// Create a new package
const createPackage = async (packageData) => {
  try {
    const response = await fetch('/backend/managePackage.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(packageData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Package created:', result.package_id);
    } else {
      console.error('Error:', result.message);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};

// Get provider dashboard
const getDashboard = async (userId) => {
  try {
    const response = await fetch(`/backend/getProviderDashboard.php?user_id=${userId}`);
    const data = await response.json();
    
    if (data.success) {
      updateDashboardUI(data);
    }
  } catch (error) {
    console.error('Error loading dashboard:', error);
  }
};
```

---

## 📝 Notes

1. **Authentication**: All provider-specific endpoints should include authentication checks
2. **File Uploads**: Image uploads should be handled separately with proper validation
3. **Rate Limiting**: Consider implementing rate limiting for public endpoints
4. **Caching**: Provider data and packages can be cached for better performance
5. **Validation**: Client-side validation should mirror server-side rules
6. **Security**: Sanitize all inputs and use prepared statements

---

**Last Updated:** December 2024  
**Version:** 2.0  
**Maintained By:** Smart Funeral System Backend Team