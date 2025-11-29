# 📊 Rating System Visual Flow Guide

## 🔄 Complete Rating System Workflow

```
┌──────────────────────────────────────────────────────────────────────┐
│                     RATING SYSTEM COMPLETE FLOW                       │
└──────────────────────────────────────────────────────────────────────┘

Step 1: BOOKING CREATION (Customer)
┌─────────────────────────┐
│   Customer Orders       │
│   Funeral Service       │
│                         │
│   Status: PENDING       │
└────────┬────────────────┘
         │
         ▼
Step 2: BOOKING CONFIRMATION (Provider)
┌─────────────────────────┐
│   Provider Reviews      │
│   & Confirms Booking    │
│                         │
│   Status: CONFIRMED     │
└────────┬────────────────┘
         │
         ▼
Step 3: SERVICE DELIVERY
┌─────────────────────────┐
│   Service Performed     │
│   on Scheduled Date     │
│                         │
│   Status: CONFIRMED     │
└────────┬────────────────┘
         │
         ▼
Step 4: SERVICE COMPLETION (Provider) ⭐ NEW FEATURE
┌─────────────────────────────────────────┐
│   Provider Clicks                       │
│   "COMPLETE SERVICE" Button             │
│                                         │
│   ✅ Status: COMPLETED                  │
│   ✅ completed_at = NOW()               │
│   ✅ rating_deadline = NOW() + 30 days │
└────────┬────────────────────────────────┘
         │
         ├──────────────────┬──────────────────┐
         ▼                  ▼                  ▼
    
CUSTOMER SIDE          PROVIDER SIDE      DATABASE UPDATE
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ Navigate to   │    │ Navigate to   │    │ bookings      │
│ "Rate         │    │ "Customer     │    │ table updated │
│ Services"     │    │ Ratings"      │    │               │
│               │    │               │    │ completed_at  │
│ See pending   │    │ See customers │    │ rating_       │
│ ratings       │    │ to rate       │    │ deadline      │
└───────┬───────┘    └───────┬───────┘    └───────────────┘
        │                    │
        ▼                    ▼

Step 5a: CUSTOMER RATES PROVIDER
┌─────────────────────────────────────┐
│  CustomerRatings.jsx Page           │
│                                     │
│  📊 Statistics Dashboard            │
│  ┌──────┬──────┬──────┐            │
│  │Total │Pend. │Comp. │            │
│  └──────┴──────┴──────┘            │
│                                     │
│  📋 Completed Services List         │
│  ┌─────────────────────────────┐   │
│  │ ABC Funeral Services        │   │
│  │ Premium Package             │   │
│  │ ⏰ 28 days remaining         │   │
│  │ [Rate Service]              │   │
│  └─────────────────────────────┘   │
│                                     │
│  Rating Modal Opens ▼               │
│  ┌─────────────────────────────┐   │
│  │ Rate ABC Funeral Services   │   │
│  │                             │   │
│  │ Category: [Quality ▼]       │   │
│  │                             │   │
│  │ Rating: ⭐⭐⭐⭐⭐            │   │
│  │                             │   │
│  │ Review: [Excellent service] │   │
│  │                             │   │
│  │ [Cancel] [Submit Rating]    │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  API: submitRating.php              │
│  {                                  │
│    booking_id: 123                  │
│    rating: 5                        │
│    review_text: "Excellent..."      │
│    review_category: "quality"       │
│    review_type:                     │
│      "customer_to_provider"         │
│  }                                  │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Database: provider_reviews         │
│  ✅ Rating saved                    │
│  ✅ customer_rating_submitted=TRUE │
└─────────────────────────────────────┘

Step 5b: PROVIDER RATES CUSTOMER
┌─────────────────────────────────────┐
│  ProviderRatings.jsx Page           │
│                                     │
│  📊 Statistics Dashboard            │
│  ┌──────┬──────┬──────┐            │
│  │Total │Pend. │Comp. │            │
│  └──────┴──────┴──────┘            │
│                                     │
│  👨‍👩‍👧‍👦 Customer List                │
│  ┌─────────────────────────────┐   │
│  │ John Doe                    │   │
│  │ Premium Package             │   │
│  │ ⏰ 28 days remaining         │   │
│  │ [Rate Customer]             │   │
│  └─────────────────────────────┘   │
│                                     │
│  Rating Modal Opens ▼               │
│  ┌─────────────────────────────┐   │
│  │ Rate Customer Interaction   │   │
│  │                             │   │
│  │ Category: [Cooperation ▼]   │   │
│  │                             │   │
│  │ Rating: ⭐⭐⭐⭐⭐            │   │
│  │                             │   │
│  │ Review: [Great cooperation] │   │
│  │                             │   │
│  │ [Cancel] [Submit Rating]    │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  API: submitRating.php              │
│  {                                  │
│    booking_id: 123                  │
│    rating: 5                        │
│    review_text: "Great..."          │
│    review_category: "cooperation"   │
│    review_type:                     │
│      "provider_to_customer"         │
│  }                                  │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Database: customer_reviews         │
│  ✅ Rating saved                    │
│  ✅ provider_rating_submitted=TRUE │
└─────────────────────────────────────┘

Step 6: RATING COMPLETED ✅
┌─────────────────────────────────────┐
│  Both Parties Have Rated            │
│                                     │
│  Customer View:                     │
│  ✅ Your Rating: ⭐⭐⭐⭐⭐         │
│  📝 "Excellent service..."          │
│                                     │
│  Provider View:                     │
│  ✅ Your Rating: ⭐⭐⭐⭐⭐         │
│  📝 "Great cooperation..."          │
└─────────────────────────────────────┘
```

---

## 🎯 Key Component Interactions

### Navigation Flow

```
CUSTOMER (Family Member)
┌────────────────────────────┐
│        Navbar              │
│  ┌──────────────────────┐  │
│  │ Home                 │  │
│  │ Order Services       │  │
│  │ Tribute              │  │
│  │ AI Chatbot           │  │
│  │ My Orders            │  │
│  │ ⭐ Rate Services     │◄─── NEW LINK
│  │ FAQs                 │  │
│  └──────────────────────┘  │
└────────────────────────────┘
         │
         ▼
┌────────────────────────────┐
│  CustomerRatings.jsx       │
│  /customer-ratings         │
└────────────────────────────┘


PROVIDER (Service Provider)
┌────────────────────────────┐
│   Service Provider         │
│   Dashboard                │
│  ┌──────────────────────┐  │
│  │ Overview Tab         │  │
│  │ Manage Bookings      │◄─── Complete Service Button
│  │ ⭐ Customer Ratings  │◄─── NEW TAB
│  │ Packages Tab         │  │
│  │ Availability Tab     │  │
│  └──────────────────────┘  │
└────────────────────────────┘
         │
         ▼
┌────────────────────────────┐
│  ProviderRatings.jsx       │
│  /provider-ratings         │
└────────────────────────────┘
```

---

## 🗄️ Database Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE STRUCTURE                        │
└─────────────────────────────────────────────────────────────┘

          users                    service_provider
     ┌───────────┐                ┌────────────┐
     │ id (PK)   │                │ id (PK)    │
     │ name      │                │ name       │
     │ email     │                │ services   │
     │ role      │                │ user_id    │
     └─────┬─────┘                └──────┬─────┘
           │                             │
           │        bookings             │
           │   ┌──────────────────┐      │
           └──►│ id (PK)          │◄─────┘
               │ user_id (FK)     │
               │ provider_id (FK) │
               │ status           │
               │ service_date     │
               │ completed_at     │◄─── NEW
               │ rating_deadline  │◄─── NEW
               │ customer_rating_ │◄─── NEW
               │   submitted      │
               │ provider_rating_ │◄─── NEW
               │   submitted      │
               └────┬─────────────┘
                    │
          ┌─────────┴─────────┐
          │                   │
          ▼                   ▼
┌──────────────────┐  ┌──────────────────┐
│ provider_reviews │  │ customer_reviews │
│ (Customer→       │  │ (Provider→       │
│  Provider)       │  │  Customer)       │
├──────────────────┤  ├──────────────────┤
│ id (PK)          │  │ id (PK)          │
│ booking_id (FK)  │  │ booking_id (FK)  │
│ reviewer_user_id │  │ reviewer_user_id │
│ rating (1-5)     │  │ rating (1-5)     │
│ review_text      │  │ review_text      │
│ review_category  │  │ review_category  │
│ review_type      │  │ created_at       │
│ created_at       │  │                  │
└──────────────────┘  └──────────────────┘
```

---

## 📱 UI Component Structure

### CustomerRatings.jsx Component Tree
```
CustomerRatings
├── Loading Spinner (while fetching)
├── Header Section
│   ├── Title: "⭐ Rate Your Services"
│   └── Subtitle
├── Statistics Dashboard
│   ├── Total Services Card
│   ├── Pending Ratings Card
│   └── Completed Ratings Card
├── Ratings List
│   └── For each booking:
│       ├── Booking Info Card
│       │   ├── Provider Name
│       │   ├── Package Name
│       │   ├── Service Date
│       │   └── Status Badge
│       ├── IF pending:
│       │   └── Deadline Notice + Rate Button
│       ├── IF completed:
│       │   └── Submitted Rating Display
│       └── IF expired:
│           └── Expiration Notice
└── Rating Modal (when open)
    ├── Modal Overlay
    └── Modal Content
        ├── Title
        ├── Category Dropdown
        ├── StarRating Component
        ├── Review Text Area
        ├── Character Counter
        └── Action Buttons
            ├── Cancel
            └── Submit
```

### ProviderRatings.jsx Component Tree
```
ProviderRatings
├── Loading Spinner
├── Header Section
│   ├── Title: "👨‍👩‍👧‍👦 Rate Your Customers"
│   └── Subtitle
├── Statistics Dashboard
│   ├── Total Customers Card
│   ├── Pending Ratings Card
│   └── Completed Ratings Card
├── Customer Ratings List
│   └── For each booking:
│       ├── Customer Info Card
│       │   ├── Customer Name
│       │   ├── Email
│       │   ├── Package Name
│       │   ├── Booking Reference
│       │   └── Status Badge
│       ├── IF pending:
│       │   └── Deadline Notice + Rate Button
│       ├── IF completed:
│       │   └── Submitted Rating Display
│       └── IF expired:
│           └── Expiration Notice
└── Rating Modal (when open)
    ├── Modal Overlay
    └── Modal Content
        ├── Title
        ├── Category Dropdown
        ├── StarRating Component
        ├── Review Text Area
        ├── Character Counter
        └── Action Buttons
```

---

## 🎨 Status & Color Coding

### Booking Status Flow
```
PENDING          CONFIRMED        COMPLETED
  🟡      →        🔵      →        🟢
Yellow           Blue             Green

[New Booking] → [Provider     → [Service Done]
                 Confirms]       [Rate Now!]
```

### Rating Status Colors
```
PENDING (Within 30 Days)
🟡 Yellow Background
   Yellow Border
   "28 days remaining"
   [Rate Service] button visible

COMPLETED (Rated)
🟢 Green Background
   Green Border
   "Your Rating: ⭐⭐⭐⭐⭐"
   Rating display only

EXPIRED (Past 30 Days)
🔴 Red Background
   Red Border
   "Rating period has expired"
   No action available
```

---

## 🔄 API Call Flow

### Rating Submission Flow
```
Frontend                    Backend                 Database
   │                           │                        │
   │  1. User clicks "Submit"  │                        │
   │──────────────────────────►│                        │
   │                           │                        │
   │                           │  2. Validate request   │
   │                           │     - Check auth       │
   │                           │     - Check booking    │
   │                           │     - Check deadline   │
   │                           │                        │
   │                           │  3. Save rating        │
   │                           │───────────────────────►│
   │                           │                        │
   │                           │  4. Update flags       │
   │                           │───────────────────────►│
   │                           │                        │
   │                           │◄───────────────────────│
   │                           │  5. Confirm success    │
   │◄──────────────────────────│                        │
   │  6. Show success message  │                        │
   │  7. Refresh rating list   │                        │
   │                           │                        │
```

### Rating Retrieval Flow
```
Frontend                    Backend                 Database
   │                           │                        │
   │  1. Page loads            │                        │
   │──────────────────────────►│                        │
   │  GET /getPendingRatings   │                        │
   │  ?user_id=X&role=customer │                        │
   │                           │                        │
   │                           │  2. Validate user      │
   │                           │                        │
   │                           │  3. Query bookings     │
   │                           │───────────────────────►│
   │                           │  SELECT * FROM         │
   │                           │  bookings WHERE...     │
   │                           │                        │
   │                           │◄───────────────────────│
   │                           │  4. Calculate deadline │
   │                           │  5. Determine status   │
   │                           │                        │
   │◄──────────────────────────│                        │
   │  6. Display ratings       │                        │
   │                           │                        │
```

---

## ✨ Interactive Elements

### Star Rating Component
```
Hover State:
⭐⭐⭐⭐☆  →  ⭐⭐⭐⭐⭐
          (hover on 5th star)

Selected State:
⭐⭐⭐⭐⭐  (5 stars - Excellent)
⭐⭐⭐⭐☆  (4 stars - Very Good)
⭐⭐⭐☆☆  (3 stars - Good)
⭐⭐☆☆☆  (2 stars - Fair)
⭐☆☆☆☆  (1 star  - Needs Improvement)

With Labels:
Rating: ⭐⭐⭐⭐☆
        "Very Good"
```

### Rating Modal Animation
```
Closed State:
[Component hidden]

Opening:
Background: opacity 0 → 1
Modal: scale 0.9 → 1.0
       opacity 0 → 1

Open State:
[Modal fully visible and interactive]

Closing:
Modal: scale 1.0 → 0.9
       opacity 1 → 0
Background: opacity 1 → 0
```

---

## 🎯 User Journey Maps

### Customer Journey: Rating a Provider
```
1. Login
   ↓
2. Complete Order (already done in past)
   ↓
3. Provider marks service as complete
   ↓
4. Navigate to "Rate Services" in navbar
   ↓
5. See completed service in list
   ↓
6. Check deadline countdown (e.g., "28 days")
   ↓
7. Click "Rate Service" button
   ↓
8. Select rating category (Quality/Professionalism/etc.)
   ↓
9. Click stars to rate (1-5)
   ↓
10. Optionally add review text
   ↓
11. Click "Submit Rating"
   ↓
12. See success message ✅
   ↓
13. Status changes to "Completed"
```

### Provider Journey: Completing Service & Rating Customer
```
1. Login as provider
   ↓
2. Navigate to "Manage Bookings"
   ↓
3. Find confirmed booking
   ↓
4. Click "Complete Service" button
   ↓
5. Add completion notes
   ↓
6. Confirm completion
   ↓
7. Navigate to "Customer Ratings" tab
   ↓
8. See customer in pending ratings list
   ↓
9. Click "Rate Customer" button
   ↓
10. Select category (Cooperation/Communication/etc.)
   ↓
11. Rate with stars (1-5)
   ↓
12. Add optional feedback
   ↓
13. Submit rating
   ↓
14. See success message ✅
   ↓
15. Status changes to "Completed"
```

---

## 📊 Statistics Calculation

### Dashboard Stats Logic
```javascript
// Total Services/Customers
totalCount = allRatings.length

// Pending Ratings
pendingCount = allRatings.filter(
  r => r.rating_status === 'pending'
).length

// Completed Ratings
completedCount = allRatings.filter(
  r => r.rating_status === 'completed'
).length

// Expired Ratings (optional display)
expiredCount = allRatings.filter(
  r => r.rating_status === 'expired'
).length
```

### Rating Status Determination
```sql
-- In getPendingRatings.php

CASE
  WHEN (
    review_type = 'customer_to_provider' 
    AND customer_rating_submitted = TRUE
  ) OR (
    review_type = 'provider_to_customer' 
    AND provider_rating_submitted = TRUE
  ) THEN 'completed'
  
  WHEN NOW() > rating_deadline 
  THEN 'expired'
  
  ELSE 'pending'
END as rating_status
```

---

## 🎊 Implementation Highlights

### Key Achievements ✅
```
1. ✅ Bidirectional Rating System
   - Customers rate providers
   - Providers rate customers

2. ✅ Automated Deadline Management
   - 30-day window after completion
   - Automated database triggers

3. ✅ Professional UI/UX
   - Modern gradient designs
   - Interactive components
   - Responsive layouts

4. ✅ Complete Service Workflow
   - "Complete Service" button
   - Triggers rating availability
   - Professional completion modal

5. ✅ Print Receipt Feature
   - For both customers and providers
   - Professional HTML templates
   - Print-optimized layouts

6. ✅ Statistics Dashboards
   - Real-time rating counts
   - Visual status indicators
   - Progress tracking

7. ✅ Security & Validation
   - Role-based access control
   - Duplicate prevention
   - Deadline enforcement
```

---

**🎉 Visual guide complete! Use this alongside the detailed documentation for full understanding of the rating system.**

*See `RATING_SYSTEM_COMPLETE.md` for technical details*  
*See `RATING_SYSTEM_QUICK_START.md` for deployment steps*
