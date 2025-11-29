# Smart Funeral System API Documentation

This document provides detailed information about the REST API endpoints available in the Smart Funeral System.

## Base URL

All API endpoints are relative to your local installation:

```
http://localhost/smart_funeral_system/backend/
```

## Authentication

Most endpoints require authentication via JWT token.

### Headers

For protected endpoints, include the following header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Responses

All responses are in JSON format and include at minimum:

```json
{
  "success": true|false,
  "message": "Description of the result"
}
```

## Error Handling

Error responses include:

```json
{
  "success": false,
  "message": "Description of the error"
}
```

Common error status codes:
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Server Error

## Endpoints

### Authentication

#### Login

- **URL:** `/login.php`
- **Method:** `POST`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "username": "user123",
    "password": "securepassword",
    "role": "family|provider|admin" // optional
  }
  ```
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "JWT_TOKEN",
    "user": {
      "id": 1,
      "username": "user123",
      "role": "family|provider|admin",
      "email": "user@example.com"
    },
    "provider": { // only if role is "provider"
      "provider_id": 1,
      "company_name": "Company Name",
      // other provider details...
    }
  }
  ```

#### Register

- **URL:** `/register.php`
- **Method:** `POST`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "securepassword",
    "role": "family|provider"
  }
  ```
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Registration successful",
    "user_id": 123
  }
  ```

#### Verify Authentication

- **URL:** `/verify-auth.php`
- **Method:** `GET`
- **Auth Required:** Yes
- **Success Response:**
  ```json
  {
    "success": true,
    "user": {
      "id": 1,
      "username": "user123",
      "role": "family|provider|admin",
      "email": "user@example.com"
    }
  }
  ```

### Service Providers

#### Get All Providers

- **URL:** `/getAllProviders.php`
- **Method:** `GET`
- **Auth Required:** No
- **Success Response:**
  ```json
  {
    "success": true,
    "providers": [
      {
        "provider_id": 1,
        "company_name": "Peaceful Passage Funeral Home",
        "address": "123 Serenity Ave",
        "phone": "(555) 123-4567",
        "description": "Provider description",
        "website": "www.example.com",
        "logo_url": "/images/logos/peaceful_passage.png",
        "average_price": 3500.00,
        "total_packages": 3
      },
      // ...more providers
    ]
  }
  ```

#### Get Provider Profile

- **URL:** `/getProviderProfile.php`
- **Method:** `GET`
- **Auth Required:** Yes (provider role)
- **Success Response:**
  ```json
  {
    "success": true,
    "profile": {
      "provider_id": 1,
      "company_name": "Peaceful Passage Funeral Home",
      "address": "123 Serenity Ave",
      "phone": "(555) 123-4567",
      "description": "Provider description",
      "website": "www.example.com",
      "logo_url": "/images/logos/peaceful_passage.png",
      "average_price": 3500.00,
      "total_packages": 3
    }
  }
  ```

#### Update Provider Profile

- **URL:** `/updateProviderProfile.php`
- **Method:** `POST`
- **Auth Required:** Yes (provider role)
- **Request Body:**
  ```json
  {
    "company_name": "Updated Name",
    "address": "New Address",
    "phone": "New Phone",
    "description": "Updated description",
    "website": "www.updated.com"
  }
  ```
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Profile updated successfully"
  }
  ```

### Packages

#### Get Packages

- **URL:** `/getPackages.php`
- **Method:** `GET`
- **Auth Required:** No
- **Query Parameters:**
  - `provider_id` (optional) - Filter by provider
- **Success Response:**
  ```json
  {
    "success": true,
    "packages": [
      {
        "package_id": 1,
        "provider_id": 1,
        "name": "Basic Cremation",
        "description": "A simple and dignified cremation service",
        "price": 1200.00,
        "image_url": "/images/packages/basic_cremation.jpg",
        "is_featured": 1,
        "company_name": "Peaceful Passage Funeral Home"
      },
      // ...more packages
    ]
  }
  ```

#### Add Package

- **URL:** `/addPackage.php`
- **Method:** `POST`
- **Auth Required:** Yes (provider role)
- **Request Body:**
  ```json
  {
    "name": "Premium Service",
    "description": "Comprehensive funeral service",
    "price": 3500.00,
    "is_featured": true,
    "image_url": "/images/packages/premium.jpg"
  }
  ```
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Package added successfully",
    "package_id": 123
  }
  ```

#### Delete Package

- **URL:** `/deletePackage.php`
- **Method:** `POST`
- **Auth Required:** Yes (provider role)
- **Request Body:**
  ```json
  {
    "package_id": 123
  }
  ```
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Package deleted successfully"
  }
  ```

### Tributes

#### Get Tributes

- **URL:** `/getTributes.php`
- **Method:** `GET`
- **Auth Required:** No
- **Query Parameters:**
  - `user_id` (optional) - Filter by user
  - `tribute_id` (optional) - Get specific tribute
- **Success Response:**
  ```json
  {
    "success": true,
    "tributes": [
      {
        "tribute_id": 1,
        "user_id": 2,
        "name": "John Smith",
        "birth_date": "1945-03-15",
        "death_date": "2023-01-10",
        "photo_url": "/images/tributes/john_smith.jpg",
        "biography": "John was a beloved father...",
        "funeral_date": "2023-01-15 10:00:00",
        "funeral_location": "Peaceful Chapel",
        "is_public": 1,
        "created_at": "2023-01-11 14:23:45"
      },
      // ...more tributes
    ]
  }
  ```

## Using the API in React

Here's an example of how to use the API from your React frontend:

```javascript
// Login example
const loginUser = async (username, password) => {
  try {
    const response = await fetch('/backend/login.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      return data.user;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

// Protected API call example
const getProviderProfile = async () => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch('/backend/getProviderProfile.php', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.profile;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Failed to get profile:', error);
    throw error;
  }
};
```

## Error Handling Best Practices

In your React application, handle API errors gracefully:

```javascript
try {
  const data = await fetchSomeEndpoint();
  // Handle success case
} catch (error) {
  // Show appropriate error message to user
  if (error.message === 'Unauthorized') {
    // Redirect to login
  } else {
    // Show general error message
  }
}
```