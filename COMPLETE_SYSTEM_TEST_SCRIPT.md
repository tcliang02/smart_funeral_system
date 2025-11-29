# 🧪 Complete System Test Script - Every Feature

This comprehensive test script covers **every corner** of your Smart Funeral System. Follow this step-by-step to test all functionality.

---

## 📋 Test Credentials

**Family Member Account:**
- Username: `user1`
- Password: `123456`

**Service Provider Account:**
- Username: `provider1` 
- Password: `123456`

---

## 🎯 Test Categories

1. [Authentication & User Management](#1-authentication--user-management)
2. [Service Provider Features](#2-service-provider-features)
3. [Package Management](#3-package-management)
4. [Addon Management](#4-addon-management)
5. [Provider Availability](#5-provider-availability)
6. [Booking System](#6-booking-system)
7. [Tribute System](#7-tribute-system)
8. [Voice Memorial & AI](#8-voice-memorial--ai)
9. [Rating & Feedback](#9-rating--feedback)
10. [Profile Management](#10-profile-management)
11. [API Endpoints](#11-api-endpoints)
12. [Security & Middleware](#12-security--middleware)

---

## 1. Authentication & User Management

### 1.1 Registration Tests

**Test 1.1.1: Register Family Member**
1. Navigate to `http://localhost:3000/register`
2. Fill in registration form:
   - Full Name: `Test Family`
   - Email: `testfamily@example.com`
   - Phone: `1234567890`
   - Username: `testfamily`
   - Password: `Test123!`
   - Role: `Family Member`
3. Click "Register"
4. ✅ **Expected:** Successful registration, redirected to login

**Test 1.1.2: Register Service Provider**
1. Navigate to `http://localhost:3000/register`
2. Fill in registration form:
   - Business Name: `Test Funeral Home`
   - Email: `testprovider@example.com`
   - Phone: `9876543210`
   - Username: `testprovider`
   - Password: `Test123!`
   - Role: `Service Provider`
   - Address: `123 Test St`
   - Description: `Test funeral services`
3. Click "Register"
4. ✅ **Expected:** Successful registration, redirected to login

**Test 1.1.3: Registration Validation**
1. Try to register with existing username
2. ✅ **Expected:** Error message "Username already exists"
3. Try to register with weak password
4. ✅ **Expected:** Password validation error
5. Try to register with missing required fields
6. ✅ **Expected:** Validation errors for required fields

### 1.2 Login Tests

**Test 1.2.1: Login as Family Member**
1. Navigate to `http://localhost:3000/login`
2. Enter credentials:
   - Username: `user1`
   - Password: `123456`
3. Click "Login"
4. ✅ **Expected:** Successful login, redirected to home page
5. ✅ **Check:** Token stored in localStorage
6. ✅ **Check:** User data stored in localStorage

**Test 1.2.2: Login as Service Provider**
1. Navigate to `http://localhost:3000/login`
2. Enter credentials:
   - Username: `provider1`
   - Password: `123456`
3. Click "Login"
4. ✅ **Expected:** Successful login, redirected to provider dashboard
5. ✅ **Check:** Token stored in localStorage

**Test 1.2.3: Login Validation**
1. Try to login with wrong password
2. ✅ **Expected:** Error "Invalid credentials"
3. Try to login with non-existent username
4. ✅ **Expected:** Error "User not found"
5. Try to login with empty fields
6. ✅ **Expected:** Validation errors

**Test 1.2.4: Logout**
1. Click logout button
2. ✅ **Expected:** Redirected to home page
3. ✅ **Check:** Token removed from localStorage
4. ✅ **Check:** Cannot access protected pages

---

## 2. Service Provider Features

### 2.1 Provider Dashboard

**Test 2.1.1: Access Dashboard** (Login as provider first)
1. Navigate to `http://localhost:3000/service-provider-dashboard`
2. ✅ **Expected:** Dashboard loads with:
   - Total bookings count
   - Revenue statistics
   - Recent bookings list
   - Package summary
   - Addon summary

**Test 2.1.2: Dashboard Statistics**
1. Check "Total Bookings" card
2. ✅ **Expected:** Shows correct count
3. Check "Total Revenue" card
4. ✅ **Expected:** Shows correct amount
5. Check "Pending Bookings" card
6. ✅ **Expected:** Shows correct count

**Test 2.1.3: Recent Bookings Widget**
1. View recent bookings table
2. ✅ **Expected:** Shows latest bookings with:
   - Customer name
   - Package name
   - Date
   - Status
   - Amount

### 2.2 Provider Profile

**Test 2.2.1: View Provider Profile**
1. Navigate to provider profile page
2. ✅ **Expected:** Shows:
   - Business name
   - Contact information
   - Address
   - Description
   - Rating (if any)

**Test 2.2.2: Edit Provider Profile**
1. Click "Edit Profile"
2. Update business description
3. Update phone number
4. Update address
5. Click "Save"
6. ✅ **Expected:** Profile updated successfully
7. ✅ **Check:** Changes reflected immediately

---

## 3. Package Management

### 3.1 View Packages (Public)

**Test 3.1.1: Browse All Packages**
1. Navigate to `http://localhost:3000/order-services`
2. ✅ **Expected:** Shows list of all packages from all providers
3. ✅ **Check:** Each package shows:
   - Package name
   - Provider name
   - Price
   - Description
   - Image (if available)

**Test 3.1.2: Filter Packages by Provider**
1. Select a specific provider from dropdown
2. ✅ **Expected:** Shows only that provider's packages

**Test 3.1.3: View Package Details**
1. Click on a package
2. Navigate to package details page
3. ✅ **Expected:** Shows:
   - Full package description
   - Price
   - Included services
   - Available addons
   - Provider information
   - "Book Now" button

### 3.2 Manage Packages (Provider Only)

**Test 3.2.1: Create New Package** (Login as provider)
1. Navigate to `http://localhost:3000/manage-packages`
2. Click "Create New Package"
3. Fill in form:
   - Package Name: `Premium Funeral Service`
   - Description: `Complete funeral service package`
   - Price: `5000`
   - Services Included: `Casket, Embalming, Viewing`
4. Upload package image
5. Click "Create"
6. ✅ **Expected:** Package created successfully
7. ✅ **Check:** New package appears in list

**Test 3.2.2: Edit Package**
1. Click "Edit" on existing package
2. Update package name
3. Update price
4. Click "Save"
5. ✅ **Expected:** Package updated successfully
6. ✅ **Check:** Changes reflected in package list

**Test 3.2.3: Delete Package**
1. Click "Delete" on a package
2. Confirm deletion
3. ✅ **Expected:** Package deleted successfully
4. ✅ **Check:** Package removed from list
5. ✅ **Check:** Cannot book deleted package

**Test 3.2.4: Package Validation**
1. Try to create package with negative price
2. ✅ **Expected:** Validation error
3. Try to create package without name
4. ✅ **Expected:** Required field error

---

## 4. Addon Management

### 4.1 View Addons (Public)

**Test 4.1.1: View Available Addons**
1. Navigate to package details page
2. Scroll to "Available Add-ons" section
3. ✅ **Expected:** Shows addon categories:
   - Flowers
   - Catering
   - Transportation
   - Venue
   - Memorial Items

**Test 4.1.2: View Addon Details**
1. Click on an addon
2. ✅ **Expected:** Shows:
   - Addon name
   - Description
   - Price
   - Category
   - Image (if available)

### 4.2 Manage Addons (Provider Only)

**Test 4.2.1: Create Custom Addon** (Login as provider)
1. Navigate to `http://localhost:3000/manage-addons`
2. Click "Create Custom Addon"
3. Fill in form:
   - Addon Name: `Premium Flower Arrangement`
   - Category: `Flowers`
   - Description: `Beautiful flower arrangement`
   - Price: `200`
4. Upload addon image
5. Click "Create"
6. ✅ **Expected:** Addon created successfully

**Test 4.2.2: Use Addon Template**
1. Navigate to "Addon Templates" tab
2. Select a template
3. Click "Add to My Addons"
4. Customize price if needed
5. Click "Save"
6. ✅ **Expected:** Addon added from template

**Test 4.2.3: Edit Addon**
1. Click "Edit" on existing addon
2. Update addon name and price
3. Click "Save"
4. ✅ **Expected:** Addon updated successfully

**Test 4.2.4: Delete Addon**
1. Click "Delete" on an addon
2. Confirm deletion
3. ✅ **Expected:** Addon deleted successfully
4. ✅ **Check:** Addon no longer available for booking

---

## 5. Provider Availability

### 5.1 View Availability (Public)

**Test 5.1.1: View Provider Calendar**
1. Navigate to provider details page
2. Click "Check Availability"
3. ✅ **Expected:** Calendar loads showing:
   - Current month
   - Available dates (white/green)
   - Unavailable dates (red with X)
   - Past dates (grayed out)

**Test 5.1.2: Navigate Calendar**
1. Click "Next Month"
2. ✅ **Expected:** Shows next month's availability
3. Click "Previous Month"
4. ✅ **Expected:** Shows previous month's availability

**Test 5.1.3: Select Available Date**
1. Click on an available date
2. ✅ **Expected:** Date highlighted in green
3. ✅ **Check:** Selected date shown below calendar

**Test 5.1.4: Try to Select Unavailable Date**
1. Click on a red (unavailable) date
2. ✅ **Expected:** Nothing happens, date not selectable
3. Hover over unavailable date
4. ✅ **Expected:** Shows reason for unavailability

### 5.2 Manage Availability (Provider Only)

**Test 5.2.1: Mark Date as Unavailable** (Login as provider)
1. Navigate to `http://localhost:3000/provider/availability`
2. Click on an available date
3. Select "Mark as Unavailable"
4. Enter reason: `Fully booked`
5. Click "Save"
6. ✅ **Expected:** Date marked as unavailable
7. ✅ **Check:** Date shows red with X

**Test 5.2.2: Mark Date as Available**
1. Click on an unavailable date
2. Select "Mark as Available"
3. Click "Save"
4. ✅ **Expected:** Date marked as available
5. ✅ **Check:** Date shows white/green

**Test 5.2.3: Bulk Unavailability**
1. Select date range
2. Mark entire range as unavailable
3. Enter reason: `Holiday closure`
4. Click "Save"
5. ✅ **Expected:** All dates in range marked unavailable

---

## 6. Booking System

### 6.1 Create Booking (Family Member)

**Test 6.1.1: Book Package** (Login as family member)
1. Navigate to package details page
2. Click "Book Now"
3. Select service date from calendar
4. Select addons (optional)
5. Fill in booking details:
   - Deceased Name: `John Doe`
   - Contact Person: `Jane Doe`
   - Phone: `1234567890`
   - Email: `jane@example.com`
   - Special Requests: `Please arrange flowers`
6. Click "Proceed to Checkout"
7. ✅ **Expected:** Redirected to checkout page

**Test 6.1.2: Checkout Process**
1. Review order summary
2. ✅ **Check:** Shows:
   - Package details
   - Selected addons
   - Service date
   - Total amount
3. Select payment method
4. Click "Confirm Booking"
5. ✅ **Expected:** Booking created successfully
6. ✅ **Expected:** Redirected to thank you page

**Test 6.1.3: View Booking Confirmation**
1. Check thank you page
2. ✅ **Expected:** Shows:
   - Booking ID
   - Order summary
   - Payment status
   - Next steps

**Test 6.1.4: View My Bookings**
1. Navigate to `http://localhost:3000/orders`
2. ✅ **Expected:** Shows list of all bookings
3. ✅ **Check:** Each booking shows:
   - Booking ID
   - Package name
   - Provider name
   - Service date
   - Status
   - Total amount

**Test 6.1.5: View Booking Details**
1. Click on a booking
2. ✅ **Expected:** Shows full booking details:
   - Package information
   - Addons
   - Service date
   - Status
   - Payment information
   - Provider contact

### 6.2 Manage Bookings (Provider)

**Test 6.2.1: View Provider Bookings** (Login as provider)
1. Navigate to `http://localhost:3000/provider-bookings`
2. ✅ **Expected:** Shows all bookings for this provider
3. ✅ **Check:** Can filter by status:
   - Pending
   - Confirmed
   - Completed
   - Cancelled

**Test 6.2.2: Update Booking Status**
1. Click on a pending booking
2. Change status to "Confirmed"
3. Add notes (optional)
4. Click "Update"
5. ✅ **Expected:** Status updated successfully
6. ✅ **Check:** Customer notified (if notifications enabled)

**Test 6.2.3: Cancel Booking**
1. Click on a booking
2. Click "Cancel Booking"
3. Enter cancellation reason
4. Confirm cancellation
5. ✅ **Expected:** Booking cancelled
6. ✅ **Check:** Status shows "Cancelled"

---

## 7. Tribute System

### 7.1 Browse Tributes (Public)

**Test 7.1.1: View All Tributes**
1. Navigate to `http://localhost:3000/tribute`
2. ✅ **Expected:** Shows grid of tribute pages
3. ✅ **Check:** Each tribute shows:
   - Deceased name
   - Photo
   - Birth/Death dates
   - Short description

**Test 7.1.2: Filter Tributes**
1. Use filter dropdown
2. Select "My Tributes" (if logged in)
3. ✅ **Expected:** Shows only your created tributes
4. Select "All Tributes"
5. ✅ **Expected:** Shows all public tributes

**Test 7.1.3: Search Tributes**
1. Enter name in search box
2. ✅ **Expected:** Shows matching tributes

**Test 7.1.4: View Tribute Page**
1. Click on a tribute
2. ✅ **Expected:** Shows full tribute page with:
   - Deceased information
   - Photo gallery
   - Biography
   - Service details (if any)
   - Condolence messages
   - Flower offerings
   - RSVP list (if applicable)

### 7.2 Create Tribute (Authenticated)

**Test 7.2.1: Create New Tribute** (Login required)
1. Navigate to `http://localhost:3000/tribute/create`
2. Fill in tribute form:
   - Full Name: `John Smith`
   - Birth Date: `1950-01-15`
   - Death Date: `2024-11-20`
   - Biography: `Loving father and grandfather...`
   - Service Date: `2024-11-25`
   - Service Location: `Memorial Chapel`
3. Upload photo
4. Click "Create Tribute"
5. ✅ **Expected:** Tribute created successfully
6. ✅ **Expected:** Redirected to tribute page

**Test 7.2.2: Upload Multiple Photos**
1. In tribute creation/edit
2. Upload multiple photos
3. ✅ **Expected:** All photos uploaded
4. ✅ **Check:** Photos appear in gallery

**Test 7.2.3: Set Privacy Settings**
1. In tribute creation
2. Select "Private" or "Public"
3. ✅ **Expected:** Privacy setting saved
4. ✅ **Check:** Private tributes not visible to others

### 7.3 Edit Tribute

**Test 7.3.1: Edit Tribute** (Must be creator)
1. Navigate to your tribute page
2. Click "Edit Tribute"
3. Update biography
4. Add more photos
5. Update service details
6. Click "Save Changes"
7. ✅ **Expected:** Changes saved successfully
8. ✅ **Check:** Updates reflected immediately

**Test 7.3.2: Delete Tribute**
1. Click "Delete Tribute"
2. Confirm deletion
3. ✅ **Expected:** Tribute deleted
4. ✅ **Check:** Tribute no longer accessible

### 7.4 Tribute Interactions (Public)

**Test 7.4.1: Leave Condolence Message**
1. Navigate to tribute page
2. Scroll to "Messages" section
3. Enter name and message
4. Click "Submit"
5. ✅ **Expected:** Message posted successfully
6. ✅ **Check:** Message appears in list

**Test 7.4.2: Offer Flowers**
1. Scroll to "Flower Offerings" section
2. Enter name
3. Select flower type
4. Add message (optional)
5. Click "Offer Flowers"
6. ✅ **Expected:** Flower offering recorded
7. ✅ **Check:** Offering appears in list

**Test 7.4.3: RSVP to Service**
1. Scroll to "RSVP" section
2. Enter name, email, phone
3. Select attendance status
4. Add number of guests
5. Click "Submit RSVP"
6. ✅ **Expected:** RSVP recorded
7. ✅ **Check:** RSVP appears in list

**Test 7.4.4: View RSVP List** (Creator only)
1. Navigate to tribute page (as creator)
2. Click "View RSVP List"
3. ✅ **Expected:** Shows all RSVPs with:
   - Name
   - Email
   - Phone
   - Attendance status
   - Number of guests

---

## 8. Voice Memorial & AI

### 8.1 Voice Memorial Creation

**Test 8.1.1: Upload Voice Samples** (Login required)
1. Navigate to `http://localhost:3000/grief-support/voice`
2. Click "Create Voice Memorial"
3. Select tribute
4. Upload voice recording files (WAV/MP3)
5. ✅ **Expected:** Files uploaded successfully
6. ✅ **Check:** Upload progress shown

**Test 8.1.2: Clone Voice with ElevenLabs**
1. After uploading samples
2. Enter personality traits:
   - Warm
   - Caring
   - Humorous
3. Click "Create Voice Clone"
4. ✅ **Expected:** Voice cloning initiated
5. ✅ **Check:** Processing status shown
6. Wait for completion
7. ✅ **Expected:** Voice clone ready

**Test 8.1.3: Test Voice Clone**
1. After voice clone created
2. Enter test message
3. Click "Generate Speech"
4. ✅ **Expected:** Audio generated
5. Play audio
6. ✅ **Check:** Voice sounds like original

### 8.2 AI Chatbot

**Test 8.2.1: Start Chat Session**
1. Navigate to `http://localhost:3000/grief-support/chat`
2. Select a voice memorial
3. Click "Start Conversation"
4. ✅ **Expected:** Chat interface opens

**Test 8.2.2: Send Messages**
1. Type message: "Tell me about your childhood"
2. Send message
3. ✅ **Expected:** AI responds in character
4. ✅ **Check:** Response uses personality traits
5. Send follow-up questions
6. ✅ **Expected:** Contextual responses

**Test 8.2.3: Voice Chat**
1. Click "Voice Chat" button
2. Speak into microphone
3. ✅ **Expected:** Speech recognized
4. ✅ **Expected:** AI responds with voice
5. ✅ **Check:** Voice uses cloned voice

**Test 8.2.4: View Chat History**
1. Navigate to previous chat
2. ✅ **Expected:** Shows full conversation history
3. ✅ **Check:** Messages in correct order

### 8.3 Memory Collection

**Test 8.3.1: Add Memory**
1. Navigate to tribute page
2. Click "Add Memory"
3. Fill in memory form:
   - Title: `Fishing Trip 1995`
   - Description: `We caught the biggest fish...`
   - Date: `1995-07-15`
4. Upload photos
5. Click "Save Memory"
6. ✅ **Expected:** Memory saved
7. ✅ **Check:** Memory appears in collection

**Test 8.3.2: View Memory Timeline**
1. Navigate to "Memories" section
2. ✅ **Expected:** Shows memories in chronological order
3. ✅ **Check:** Each memory shows:
   - Title
   - Date
   - Description
   - Photos

---

## 9. Rating & Feedback

### 9.1 Rate Service Provider (After Booking)

**Test 9.1.1: Submit Rating** (Login as family member)
1. Navigate to completed booking
2. Click "Rate Service"
3. Select star rating (1-5)
4. Write review
5. Click "Submit Rating"
6. ✅ **Expected:** Rating submitted successfully
7. ✅ **Check:** Cannot rate same booking twice

**Test 9.1.2: View My Ratings**
1. Navigate to `http://localhost:3000/customer-ratings`
2. ✅ **Expected:** Shows all ratings you've submitted
3. ✅ **Check:** Each rating shows:
   - Provider name
   - Star rating
   - Review text
   - Date

**Test 9.1.3: Edit Rating**
1. Click "Edit" on a rating
2. Update star rating
3. Update review text
4. Click "Save"
5. ✅ **Expected:** Rating updated

### 9.2 View Provider Ratings (Public)

**Test 9.2.1: View Provider Ratings**
1. Navigate to provider profile page
2. Scroll to "Ratings & Reviews" section
3. ✅ **Expected:** Shows:
   - Average rating
   - Total number of ratings
   - Rating distribution (5-star, 4-star, etc.)
   - Individual reviews

**Test 9.2.2: Filter Reviews**
1. Filter by star rating
2. ✅ **Expected:** Shows only selected rating reviews
3. Sort by date
4. ✅ **Expected:** Reviews sorted correctly

### 9.3 Provider Response (Provider Only)

**Test 9.3.1: Respond to Rating** (Login as provider)
1. Navigate to `http://localhost:3000/provider-ratings`
2. View customer ratings
3. Click "Respond" on a rating
4. Write response
5. Click "Submit"
6. ✅ **Expected:** Response posted
7. ✅ **Check:** Response visible to customers

---

## 10. Profile Management

### 10.1 Family Member Profile

**Test 10.1.1: View Profile** (Login as family member)
1. Navigate to `http://localhost:3000/profile-settings`
2. ✅ **Expected:** Shows profile information:
   - Name
   - Email
   - Phone
   - Username

**Test 10.1.2: Update Profile**
1. Click "Edit Profile"
2. Update name
3. Update phone number
4. Update email
5. Click "Save"
6. ✅ **Expected:** Profile updated successfully
7. ✅ **Check:** Changes reflected immediately

**Test 10.1.3: Change Password**
1. Click "Change Password"
2. Enter current password
3. Enter new password
4. Confirm new password
5. Click "Update Password"
6. ✅ **Expected:** Password changed successfully
7. ✅ **Check:** Can login with new password

**Test 10.1.4: Upload Profile Photo**
1. Click "Upload Photo"
2. Select image file
3. ✅ **Expected:** Photo uploaded
4. ✅ **Check:** Photo displayed in profile

**Test 10.1.5: Delete Account**
1. Click "Delete Account"
2. Confirm deletion
3. Enter password
4. Click "Delete"
5. ✅ **Expected:** Account deleted
6. ✅ **Check:** Cannot login anymore
7. ✅ **Check:** All user data removed

### 10.2 Provider Profile

**Test 10.2.1: Update Business Information** (Login as provider)
1. Navigate to profile settings
2. Update business name
3. Update description
4. Update address
5. Update operating hours
6. Click "Save"
7. ✅ **Expected:** Profile updated

**Test 10.2.2: Upload Business Photos**
1. Upload multiple business photos
2. ✅ **Expected:** Photos uploaded
3. ✅ **Check:** Photos visible on public profile

---

## 11. API Endpoints

### 11.1 Public Endpoints (No Auth Required)

**Test 11.1.1: Get All Providers**
```javascript
// Run in browser console
const res = await fetch('/api/backend/getAllProviders');
const data = await res.json();
console.log('Providers:', data);
```
✅ **Expected:** Returns list of all providers

**Test 11.1.2: Get All Packages**
```javascript
const res = await fetch('/api/backend/getAllPackages');
const data = await res.json();
console.log('Packages:', data);
```
✅ **Expected:** Returns list of all packages

**Test 11.1.3: Get Provider Profile**
```javascript
const res = await fetch('/api/backend/getProviderProfile?provider_id=1');
const data = await res.json();
console.log('Provider Profile:', data);
```
✅ **Expected:** Returns provider details

**Test 11.1.4: Get Tributes**
```javascript
const res = await fetch('/api/backend/getTributes');
const data = await res.json();
console.log('Tributes:', data);
```
✅ **Expected:** Returns list of tributes

**Test 11.1.5: Get Provider Availability**
```javascript
const res = await fetch('/api/backend/manageProviderAvailability?provider_id=1&start_date=2024-11-01&end_date=2024-11-30');
const data = await res.json();
console.log('Availability:', data);
```
✅ **Expected:** Returns availability calendar

### 11.2 Protected Endpoints (Auth Required)

**Test 11.2.1: Create Booking (Without Token)**
```javascript
const res = await fetch('/api/backend/createBooking', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ package_id: 1 })
});
const data = await res.json();
console.log('Status:', res.status, 'Response:', data);
```
✅ **Expected:** 401 Unauthorized with error code `MISSING_TOKEN`

**Test 11.2.2: Create Booking (With Token)**
```javascript
const token = localStorage.getItem('token');
const res = await fetch('/api/backend/createBooking', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    package_id: 1,
    service_date: '2024-12-25',
    customer_name: 'Test User',
    customer_email: 'test@example.com',
    customer_phone: '1234567890',
    total_amount: 1000
  })
});
const data = await res.json();
console.log('Booking:', data);
```
✅ **Expected:** Booking created successfully (or validation error if data incomplete)

**Test 11.2.3: Get User Bookings**
```javascript
const token = localStorage.getItem('token');
const res = await fetch('/api/backend/getUserBookings', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await res.json();
console.log('My Bookings:', data);
```
✅ **Expected:** Returns user's bookings

**Test 11.2.4: Update Provider Profile**
```javascript
const token = localStorage.getItem('token');
const res = await fetch('/api/backend/updateProviderProfile', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    business_name: 'Updated Name',
    description: 'Updated description'
  })
});
const data = await res.json();
console.log('Update Result:', data);
```
✅ **Expected:** Profile updated (if logged in as provider)

---

## 12. Security & Middleware

### 12.1 Authentication Tests

**Test 12.1.1: Access Protected Page Without Login**
1. Logout if logged in
2. Try to navigate to `http://localhost:3000/orders`
3. ✅ **Expected:** Redirected to login page

**Test 12.1.2: Token Expiration**
1. Login and get token
2. Manually modify token in localStorage
3. Try to access protected endpoint
4. ✅ **Expected:** 401 Unauthorized

**Test 12.1.3: Invalid Token**
```javascript
const res = await fetch('/api/backend/createBooking', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': 'Bearer invalid_token_123'
  },
  body: JSON.stringify({ package_id: 1 })
});
const data = await res.json();
console.log('Status:', res.status, 'Response:', data);
```
✅ **Expected:** 401 Unauthorized with error code `INVALID_TOKEN`

### 12.2 Authorization Tests

**Test 12.2.1: Family Member Access Provider Features**
1. Login as family member
2. Try to access `http://localhost:3000/manage-packages`
3. ✅ **Expected:** Access denied or redirected

**Test 12.2.2: Provider Access Family Features**
1. Login as provider
2. Try to create tribute
3. ✅ **Expected:** Should work (providers can create tributes)

**Test 12.2.3: Edit Other User's Data**
1. Login as user A
2. Try to edit user B's booking
3. ✅ **Expected:** Access denied

### 12.3 Input Validation

**Test 12.3.1: SQL Injection Prevention**
```javascript
const res = await fetch('/api/backend/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: "admin' OR '1'='1",
    password: "anything"
  })
});
const data = await res.json();
```
✅ **Expected:** Login fails, no SQL injection

**Test 12.3.2: XSS Prevention**
1. Create tribute with script tag in biography:
   `<script>alert('XSS')</script>`
2. View tribute page
3. ✅ **Expected:** Script not executed, displayed as text

**Test 12.3.3: File Upload Validation**
1. Try to upload non-image file as profile photo
2. ✅ **Expected:** Validation error
3. Try to upload very large file (>10MB)
4. ✅ **Expected:** Size limit error

---

## 📊 Complete Test Checklist

### Authentication & Users
- [ ] Register family member
- [ ] Register service provider
- [ ] Login family member
- [ ] Login service provider
- [ ] Logout
- [ ] Change password
- [ ] Delete account

### Service Providers
- [ ] View provider dashboard
- [ ] View provider profile
- [ ] Edit provider profile
- [ ] View provider ratings

### Packages
- [ ] Browse all packages
- [ ] View package details
- [ ] Create package (provider)
- [ ] Edit package (provider)
- [ ] Delete package (provider)

### Addons
- [ ] View available addons
- [ ] Create custom addon (provider)
- [ ] Use addon template (provider)
- [ ] Edit addon (provider)
- [ ] Delete addon (provider)

### Availability
- [ ] View provider calendar
- [ ] Select available date
- [ ] Mark date unavailable (provider)
- [ ] Mark date available (provider)

### Bookings
- [ ] Create booking
- [ ] Checkout process
- [ ] View my bookings
- [ ] View booking details
- [ ] View provider bookings (provider)
- [ ] Update booking status (provider)
- [ ] Cancel booking

### Tributes
- [ ] Browse tributes
- [ ] View tribute page
- [ ] Create tribute
- [ ] Edit tribute
- [ ] Delete tribute
- [ ] Leave condolence message
- [ ] Offer flowers
- [ ] RSVP to service
- [ ] View RSVP list (creator)

### Voice Memorial & AI
- [ ] Upload voice samples
- [ ] Create voice clone
- [ ] Test voice clone
- [ ] Start chat session
- [ ] Send messages to AI
- [ ] Voice chat
- [ ] Add memory
- [ ] View memory timeline

### Ratings
- [ ] Submit rating
- [ ] View my ratings
- [ ] Edit rating
- [ ] View provider ratings
- [ ] Respond to rating (provider)

### Profile
- [ ] View profile
- [ ] Update profile
- [ ] Upload profile photo
- [ ] Change password

### API Endpoints
- [ ] Test public endpoints
- [ ] Test protected endpoints without token (401)
- [ ] Test protected endpoints with token
- [ ] Test invalid token (401)

### Security
- [ ] Access protected pages without login
- [ ] Token expiration handling
- [ ] Role-based access control
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] File upload validation

---

## 🎯 Quick Test Script (Browser Console)

**Run this comprehensive test in browser console:**

```javascript
// ============================================
// COMPLETE SYSTEM TEST
// ============================================

(async function completeSystemTest() {
  console.log('🧪 Starting Complete System Test...\n');
  console.log('='.repeat(60));
  
  const results = {
    passed: 0,
    failed: 0,
    skipped: 0,
    tests: []
  };
  
  function logTest(name, status, message = '') {
    const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${emoji} ${name}: ${status}${message ? ' - ' + message : ''}`);
    results.tests.push({ name, status, message });
    if (status === 'PASS') results.passed++;
    else if (status === 'FAIL') results.failed++;
    else results.skipped++;
  }
  
  // Test 1: Public Endpoints
  console.log('\n📋 Category: Public Endpoints');
  try {
    const res = await fetch('/api/backend/getAllProviders');
    const data = await res.json();
    if (res.ok && data.success) {
      logTest('Get All Providers', 'PASS', `Found ${data.data?.providers?.length || 0} providers`);
    } else {
      logTest('Get All Providers', 'FAIL', data.message);
    }
  } catch (err) {
    logTest('Get All Providers', 'FAIL', err.message);
  }
  
  try {
    const res = await fetch('/api/backend/getAllPackages');
    const data = await res.json();
    if (res.ok && data.success) {
      logTest('Get All Packages', 'PASS', `Found ${data.data?.packages?.length || 0} packages`);
    } else {
      logTest('Get All Packages', 'FAIL', data.message);
    }
  } catch (err) {
    logTest('Get All Packages', 'FAIL', err.message);
  }
  
  try {
    const res = await fetch('/api/backend/getTributes');
    const data = await res.json();
    if (res.ok && data.success) {
      logTest('Get Tributes', 'PASS', `Found ${data.data?.tributes?.length || 0} tributes`);
    } else {
      logTest('Get Tributes', 'FAIL', data.message);
    }
  } catch (err) {
    logTest('Get Tributes', 'FAIL', err.message);
  }
  
  try {
    const res = await fetch('/api/backend/manageProviderAvailability?provider_id=1&start_date=2024-11-01&end_date=2024-11-30');
    const data = await res.json();
    if (res.ok && data.success) {
      logTest('Get Provider Availability', 'PASS', `Found ${data.unavailable_dates?.length || 0} unavailable dates`);
    } else {
      logTest('Get Provider Availability', 'FAIL', data.message);
    }
  } catch (err) {
    logTest('Get Provider Availability', 'FAIL', err.message);
  }
  
  // Test 2: Middleware Protection
  console.log('\n📋 Category: Middleware Protection');
  try {
    const res = await fetch('/api/backend/createBooking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ package_id: 1 })
    });
    const data = await res.json();
    if (res.status === 401 && data.error?.code === 'MISSING_TOKEN') {
      logTest('Protected Endpoint Without Token', 'PASS', 'Correctly blocked with 401');
    } else {
      logTest('Protected Endpoint Without Token', 'FAIL', `Expected 401, got ${res.status}`);
    }
  } catch (err) {
    logTest('Protected Endpoint Without Token', 'FAIL', err.message);
  }
  
  try {
    const res = await fetch('/api/backend/createBooking', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid_token_123'
      },
      body: JSON.stringify({ package_id: 1 })
    });
    const data = await res.json();
    if (res.status === 401) {
      logTest('Protected Endpoint With Invalid Token', 'PASS', 'Correctly rejected');
    } else {
      logTest('Protected Endpoint With Invalid Token', 'FAIL', `Expected 401, got ${res.status}`);
    }
  } catch (err) {
    logTest('Protected Endpoint With Invalid Token', 'FAIL', err.message);
  }
  
  // Test 3: Authentication
  console.log('\n📋 Category: Authentication');
  const token = localStorage.getItem('token');
  if (token) {
    logTest('Token in LocalStorage', 'PASS', 'User is logged in');
    
    // Test with valid token
    try {
      const res = await fetch('/api/backend/getUserBookings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.status !== 401) {
        logTest('Protected Endpoint With Valid Token', 'PASS', 'Token accepted');
      } else {
        logTest('Protected Endpoint With Valid Token', 'FAIL', 'Token rejected');
      }
    } catch (err) {
      logTest('Protected Endpoint With Valid Token', 'FAIL', err.message);
    }
  } else {
    logTest('Token in LocalStorage', 'SKIP', 'User not logged in');
    logTest('Protected Endpoint With Valid Token', 'SKIP', 'No token available');
  }
  
  // Test 4: API Response Format
  console.log('\n📋 Category: API Response Format');
  try {
    const res = await fetch('/api/backend/getAllProviders');
    const data = await res.json();
    const hasStandardFormat = 'success' in data && (data.data || data.error);
    if (hasStandardFormat) {
      logTest('API Response Format', 'PASS', 'Standardized format detected');
    } else {
      logTest('API Response Format', 'FAIL', 'Non-standard format');
    }
  } catch (err) {
    logTest('API Response Format', 'FAIL', err.message);
  }
  
  // Test 5: Error Handling
  console.log('\n📋 Category: Error Handling');
  try {
    const res = await fetch('/api/backend/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'nonexistent', password: 'wrong' })
    });
    const data = await res.json();
    if (data.error && data.error.code) {
      logTest('Error Response Format', 'PASS', `Error code: ${data.error.code}`);
    } else {
      logTest('Error Response Format', 'FAIL', 'No error code in response');
    }
  } catch (err) {
    logTest('Error Response Format', 'FAIL', err.message);
  }
  
  // Final Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⚠️  Skipped: ${results.skipped}`);
  console.log(`📋 Total: ${results.tests.length}`);
  
  const passRate = ((results.passed / (results.passed + results.failed)) * 100).toFixed(1);
  console.log(`\n📈 Pass Rate: ${passRate}%`);
  
  if (results.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED!');
  } else {
    console.log('\n⚠️  Some tests failed. Review the results above.');
  }
  
  console.log('\n' + '='.repeat(60));
  
  return results;
})();
```

---

## 🎉 Summary

This test script covers **every feature** of your Smart Funeral System:

1. ✅ **Authentication** - Registration, login, logout, password management
2. ✅ **Service Providers** - Dashboard, profile, ratings
3. ✅ **Packages** - Browse, create, edit, delete
4. ✅ **Addons** - View, create, manage
5. ✅ **Availability** - Calendar, booking dates
6. ✅ **Bookings** - Create, manage, status updates
7. ✅ **Tributes** - Create, edit, interactions
8. ✅ **Voice Memorial** - Voice cloning, AI chat
9. ✅ **Ratings** - Submit, view, respond
10. ✅ **Profile** - View, edit, photos
11. ✅ **API** - All endpoints tested
12. ✅ **Security** - Authentication, authorization, validation

**Follow this guide step-by-step to test every corner of your system!** 🚀
