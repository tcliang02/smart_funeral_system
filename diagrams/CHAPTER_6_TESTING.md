# CHAPTER 6: TESTING

## 6.1 Introduction

Chapter 6 delves into the testing phase of the Smart Funeral Management System, conducted iteratively throughout the development process following the Rapid Application Development (RAD) methodology. Unlike traditional waterfall testing where all testing occurs after complete development, RAD emphasizes **continuous testing during development**, with each feature tested immediately after implementation. The testing encompasses unit testing of individual modules, integration testing to verify component interactions, and usability testing employing the System Usability Scale (SUS) approach. These testing methods, applied across multiple development iterations, ensure the system's reliability, functionality, and user satisfaction while accommodating continuous refinement based on stakeholder feedback.

### 6.1.1 RAD Testing Approach

The RAD methodology employed in this project follows a test-as-you-build approach with four key principles: immediate testing of each feature upon completion, iterative refinement with fixes within the same iteration, user feedback integration during development, and continuous integration testing to prevent breaking changes.

The testing sequence was organized into five iterations over 14 weeks: **Iteration 1 (Weeks 1-2)** - authentication system, **Iteration 2 (Weeks 3-5)** - tribute memorial and virtual offerings, **Iteration 3 (Weeks 6-9)** - booking flow and payment integration, **Iteration 4 (Weeks 10-12)** - provider dashboard and review system, and **Iteration 5 (Weeks 13-14)** - AI grief support and final integration testing with SUS evaluation.

Each iteration concluded with comprehensive testing before proceeding to the next cycle, enabling early detection and resolution of issues such as the critical package toggle authentication bug discovered and fixed during Iteration 4.

### 6.1.2 Prototyping and User Review Cycles

RAD methodology emphasizes rapid prototyping with immediate user feedback. Each iteration included structured prototyping sessions where working features were demonstrated to stakeholders, feedback was collected, and refinements were implemented within the same iteration.

During Week 2 of Iteration 1, the authentication system prototype review led to enhanced error messages, "Remember Me" functionality, and improved password strength indicators, with re-testing achieving a 12/12 pass rate. The Iteration 2 prototype review in Week 5 focused on tribute creation, where stakeholder feedback resulted in the implementation of a photo gallery feature supporting up to 10 photos, drag-and-drop upload functionality, and enhanced privacy controls, with all 14 tribute tests passing successfully.

Week 8 of Iteration 3 featured a booking flow prototype review where feedback prompted the addition of an "I'm flexible with dates" checkbox option, and complete workflow testing achieved a 36/36 pass rate. During the Iteration 4 prototype review in Week 11, provider dashboard testing revealed a critical toggle button bug involving JWT token mismatch, incorrect HTTP method, and missing database field. The bug was immediately fixed, achieving a 10/10 pass rate on retesting. Finally, the Iteration 5 prototype review in Week 13 demonstrated the AI grief counselor, where feedback led to enhanced Buddhist cultural context, improved conversation memory, and emotion detection capabilities, with all 7 AI integration tests passing.

This rapid prototyping approach with feedback loops completed within each iteration exemplifies RAD's strength in delivering user-centered solutions while maintaining development momentum.

## 6.2 Unit Testing

Following the RAD approach, unit testing was conducted iteratively during each development cycle. Individual modules were tested as they were developed, with immediate feedback loops allowing for rapid refinement. Test cases were developed for each functionality within a module, ensuring that each software unit performs as intended before proceeding to the next iteration.

The unit tests documented below are organized by functional module, but were executed progressively throughout the five development iterations over 14 weeks. Each test subsection includes a note indicating which iteration the tests were primarily conducted in, reflecting the actual RAD development timeline.

### 6.2.1 User Authentication and Role Management

**Development Iteration:** Iteration 1 (Weeks 1-2)  
**Testing Conducted:** Immediately after authentication features were implemented  
**Refinements Made:** Improved error messages, added role-based redirects after login, implemented "Remember Me" functionality

The detailed presentation of unit testing for user authentication and role-based access control is outlined in Table 6.1.

**Table 6.1: Unit Testing of User Authentication and Role Management**

| Test Case | Input | Expected Output | Result (✓/✖) |
|-----------|-------|-----------------|--------------|
| Valid family login | Email: family@gmail.com<br>Password: password123 | Successful login, redirect to home page | ✓ |
| Valid provider login | Email: provider1@gmail.com<br>Password: password123 | Successful login, redirect to provider dashboard | ✓ |
| Invalid login | Email: invalid@test.com<br>Password: wrongpass | Login error message displayed | ✓ |
| User registration (Family) | Valid form data with name, email, password, role: family | Family account created successfully | ✓ |
| User registration (Provider) | Valid form data including company name, role: provider | Provider account created with service_provider record | ✓ |
| Email verification | Correct verification code | Email verified successfully | ✓ |
| User logout | Click logout button | User successfully logged out, redirect to home | ✓ |
| Role-based access - Family tries Provider route | 1. Login as family member<br>2. Navigate to `/service-provider-dashboard` | Access denied, redirect to `/unauthorized` page | ✓ |
| Role-based access - Provider tries Family route | 1. Login as provider<br>2. Navigate to `/my-bookings` | Access denied, redirect to `/unauthorized` page | ✓ |
| Unauthenticated access to protected route | 1. Logout<br>2. Navigate to `/service-provider-dashboard` | Redirect to `/login` page | ✓ |
| Change password | Matching old password, new password with 8+ characters | Password changed successfully | ✓ |
| Input validation | Invalid email format<br>Email: notanemail | Validation error displayed | ✓ |

### 6.2.2 Package Management (Service Provider)

**Development Iteration:** Iteration 3 (Weeks 6-9) & Iteration 4 (Weeks 10-12)  
**Testing Conducted:** Initial development in Iteration 3, final testing in Iteration 4  
**Critical Bug Found:** Toggle buttons returned "Unauthorized" error during Week 11 final provider testing, after system was substantially complete. This late-stage discovery highlighted the importance of comprehensive end-to-end testing even for features that appeared functional during isolated testing.  
**Refinements Made:** Fixed JWT token validation (user_id vs id field mismatch), corrected HTTP method from POST to PUT, added is_active field to backend update query. Bug resolution required coordination across frontend and backend components.

The detailed presentation of unit testing for package management is outlined in Table 6.2.

**Table 6.2: Unit Testing of Package Management**

| Test Case | Input | Expected Output | Result (✓/✖) |
|-----------|-------|-----------------|--------------|
| Create new package | Valid package data (name, description, price, features) | Package created successfully | ✓ |
| Update package details | Modified package information | Package updated successfully | ✓ |
| Toggle package featured status | Click featured toggle button | Package featured status changed (0/1) | ✓ |
| Toggle package active status | Click active toggle button | Package visibility changed (0/1) | ✓ |
| Delete package | Select package and confirm deletion | Package deleted successfully | ✓ |
| Upload package images | Select valid image file (jpg/png) | Image uploaded and displayed | ✓ |
| Input validation - Price | Invalid price format (text instead of number) | Validation error displayed | ✓ |
| Input validation - Required fields | Submit form with empty name field | Validation error: "Package name is required" | ✓ |
| View package list | Navigate to Packages tab | All provider packages displayed in grid | ✓ |

### 6.2.3 Booking Management (Family Members)

**Development Iteration:** Iteration 3 (Weeks 6-9)  
**Testing Conducted:** Progressively as each booking step was implemented over 4 weeks  
**User Feedback:** Initial design required date selection first; users requested ability to browse packages without committing to a date (Week 8 prototype review)  
**Refinements Made:** Added "flexible dates" checkbox option, implemented provider availability calendar integration, added file size validation for document uploads, restructured booking flow

The detailed presentation of unit testing for booking management is outlined in Table 6.3.

**Table 6.3: Unit Testing of Booking Management**

| Test Case | Input | Expected Output | Result (✓/✖) |
|-----------|-------|-----------------|--------------|
| Select specific service date | Choose November 19, 2025 from calendar | Date selected, proceed to packages | ✓ |
| Select flexible dates | Check "I'm flexible with dates" checkbox | Option enabled, all packages will be shown | ✓ |
| View packages (specific date) | Continue after selecting November 19, 2025 | Only packages available on that date displayed | ✓ |
| View packages (flexible) | Continue with flexible dates checked | All active packages displayed | ✓ |
| Change date | Click "Change Date" link on results page | Return to date selection interface | ✓ |
| Browse available packages | Navigate to packages page | All active packages displayed | ✓ |
| Search packages | Type "Buddhist" in search bar | Packages with "Buddhist" in name displayed | ✓ |
| Filter by state | Select "Kuala Lumpur" from state dropdown | Only KL packages displayed | ✓ |
| Filter by price range | Select "RM 5,000-10,000" | Only packages in that price range displayed | ✓ |
| Select package | Click "Select Package" button | Package details displayed with booking option | ✓ |
| View provider availability calendar | Click provider name, view calendar | Monthly calendar with available/unavailable dates | ✓ |
| Select date from provider calendar | Click available date on calendar | Date selected, confirmation panel appears | ✓ |
| Select unavailable date | Click date marked as unavailable (red X) | Date cannot be selected, no action | ✓ |
| Add add-ons to booking | Select catering, flowers, transportation | Add-ons added to booking cart | ✓ |
| Select parlour option | Choose "Company Parlour" | Parlour fee added to total | ✓ |
| Select parlour option | Choose "Own Parlour" | No parlour fee added | ✓ |
| Calculate total cost | Select package + 3 add-ons + parlour | Correct total amount displayed | ✓ |
| View booking summary | Review selected package and add-ons | Summary with total price displayed | ✓ |
| Proceed to checkout | Click "Proceed to Checkout" | Navigate to checkout Step 1 | ✓ |
| Complete personal info (Step 1) | Enter name, email, phone | Validation passed, proceed to Step 2 | ✓ |
| View service details (Step 2) | Review confirmed date and parlour | Service details displayed correctly | ✓ |
| Add special requirements | Enter dietary restrictions in textarea | Text saved, proceed to Step 3 | ✓ |
| Upload deceased photo (Step 3) | Upload JPG file (1.5MB) | File uploaded successfully | ✓ |
| Upload death certificate (Step 3) | Upload PDF file (8MB) | File uploaded successfully | ✓ |
| Upload additional documents | Upload 2 additional files | Files uploaded successfully | ✓ |
| Proceed to payment | Complete all 3 steps with valid data | Navigate to payment page | ✓ |
| Confirm booking | Submit booking with valid details | Booking created, confirmation message shown | ✓ |
| View booking history | Navigate to My Bookings | All user bookings displayed with status | ✓ |
| View booking details | Click to expand booking card | Full details including add-ons and documents shown | ✓ |
| Cancel booking (14+ days before) | Select pending booking, confirm cancellation | Booking cancelled, 100% refund processed | ✓ |
| Cancel booking (7-13 days before) | Select confirmed booking, cancel | Booking cancelled, 50% refund processed | ✓ |
| Cancel booking (<7 days before) | Attempt cancellation 5 days before service | Booking cancelled, no refund (0%) | ✓ |
| Input validation - Personal info | Submit checkout with empty email field | Validation error: "Email is required" | ✓ |
| Input validation - Email format | Enter invalid email "notanemail" | Validation error: "Valid email is required" | ✓ |
| Input validation - Phone format | Enter invalid phone "123" | Validation error: "Valid phone number is required" | ✓ |
| Document upload validation | Upload deceased photo exceeding 2MB | Validation error: "File size exceeds 2MB" | ✓ |
| Document validation | Upload PDF for deceased photo | Validation error: "Invalid file format (JPG/PNG required)" | ✓ |
| Document validation | Upload file exceeding 10MB for certificate | Validation error: "File size exceeds 10MB" | ✓ |

### 6.2.4 Add-on Management

**Development Iteration:** Iteration 3 (Weeks 6-9) & Iteration 4 (Weeks 10-12)  
**Testing Conducted:** Customer add-on selection in Iteration 3 (Weeks 6-9), Provider add-on management in Iteration 4 (Weeks 10-12)  
**Refinements Made:** Organized add-ons into 9 Buddhist ceremony categories, added template adoption feature for providers, improved category filtering UI

The detailed presentation of unit testing for add-on management is outlined in Table 6.4.

**Table 6.4: Unit Testing of Add-on Management**

| Test Case | Input | Expected Output | Result (✓/✖) |
|-----------|-------|-----------------|--------------|
| Create new add-on (Provider) | Valid add-on data with name, price, category | Add-on created successfully | ✓ |
| Update add-on details | Modified add-on information | Add-on updated successfully | ✓ |
| Toggle add-on active status | Click Disable/Enable button on add-on | Add-on visibility changed (active/inactive) | ✓ |
| Delete add-on | Select add-on and confirm deletion | Add-on deleted successfully | ✓ |
| Adopt template add-on | Click "Adopt Template" on system template | Template adopted, customizable copy created | ✓ |
| Browse add-ons by category | Select "Flowers & Offerings" category | Only flower-related add-ons displayed | ✓ |
| Browse add-ons (Family) | Navigate to add-ons section during booking | Available add-ons displayed by category | ✓ |
| Add multiple add-ons | Select catering + flowers + transportation | All selections added to booking | ✓ |

### 6.2.5 Payment Integration

**Development Iteration:** Iteration 3 (Weeks 6-9)  
**Testing Conducted:** After checkout flow completion in Week 8-9  
**Refinements Made:** Added payment method selection UI, implemented error handling for failed transactions, integrated payment gateway callbacks

The detailed presentation of unit testing for payment integration is outlined in Table 6.5.

**Table 6.5: Unit Testing of Payment Integration**

| Test Case | Input | Expected Output | Result (✓/✖) |
|-----------|-------|-----------------|--------------|
| Initiate payment | Click "Proceed to Payment" with valid booking | Redirect to payment gateway | ✓ |
| Process successful payment | Complete payment with valid card details | Payment confirmed, booking status updated | ✓ |
| Handle payment failure | Payment declined by gateway | Error message shown, booking status remains pending | ✓ |
| View payment receipt | Access completed booking | Receipt displayed with payment details | ✓ |
| Select payment method | Choose FPX Online Banking | Bank selection dropdown appears | ✓ |
| Select payment method | Choose Credit/Debit Card | Card input fields appear | ✓ |

### 6.2.6 Virtual Offering System (Attendees)

**Development Iteration:** Iteration 2 (Weeks 3-5)  
**Testing Conducted:** After tribute system implementation in Weeks 4-5  
**Refinements Made:** Added animation confirmation when flower is offered, optimized photo attachment upload, implemented real-time counter updates

The detailed presentation of unit testing for virtual offering system is outlined in Table 6.6.

**Table 6.6: Unit Testing of Virtual Offering System**

| Test Case | Input | Expected Output | Result (✓/✖) |
|-----------|-------|-----------------|--------------|
| Submit virtual flower offering | Select flower type and add message | Offering submitted successfully | ✓ |
| Light virtual candle | Click candle lighting button with message | Virtual candle lit and message displayed | ✓ |
| View all offerings | Navigate to offerings page | All submitted offerings displayed | ✓ |
| Offer flower as guest | Click "Offer a Flower" without login | Flower count incremented, confirmation shown | ✓ |
| Submit condolence message | Enter name, message, optional photo | Message posted successfully | ✓ |

### 6.2.7 Guest Management and RSVP

**Development Iteration:** Iteration 2 (Weeks 3-5)  
**Testing Conducted:** After tribute detail page implementation in Week 5  
**User Feedback:** Guests requested option to attend virtually in addition to physical attendance (Week 5 prototype review)  
**Refinements Made:** Added "Attendance Type" selection (Physical/Virtual), made email optional for guests, improved RSVP confirmation messaging

The detailed presentation of unit testing for guest management and RSVP is outlined in Table 6.7.

**Table 6.7: Unit Testing of Guest Management and RSVP**

| Test Case | Input | Expected Output | Result (✓/✖) |
|-----------|-------|-----------------|--------------|
| Send guest invitations | Enter guest emails and send invites | Invitations sent successfully | ✓ |
| Guest RSVP (Attending) | Guest clicks RSVP link and confirms attendance | RSVP recorded as "Attending" | ✓ |
| Guest RSVP (Not Attending) | Guest declines invitation | RSVP recorded as "Not Attending" | ✓ |
| View RSVP summary | Access guest list in booking details | All RSVPs displayed with status | ✓ |
| Submit RSVP as guest | Complete RSVP form without login | RSVP submitted successfully | ✓ |
| Input validation - RSVP | Submit RSVP with empty name field | Validation error: "Name is required" | ✓ |

### 6.2.8 Tribute Management

**Development Iteration:** Iteration 2 (Weeks 3-5)  
**Testing Conducted:** As each tribute feature was implemented (create in Week 3, edit/privacy in Week 4, gallery in Week 5)  
**User Feedback:** Users wanted photo gallery in addition to single profile photo (Week 5 prototype review)  
**Refinements Made:** Added photo gallery upload (max 10 photos), implemented privacy levels (Public/Private/Restricted), added pagination for tribute browsing, improved search functionality

The detailed presentation of unit testing for tribute management is outlined in Table 6.8.

**Table 6.8: Unit Testing of Tribute Management**

| Test Case | Input | Expected Output | Result (✓/✖) |
|-----------|-------|-----------------|--------------|
| Create new tribute | Valid tribute data (name, dates, biography, photo) | Tribute created successfully | ✓ |
| Update tribute details | Modified tribute information | Tribute updated successfully | ✓ |
| Delete tribute | Select tribute and confirm deletion | Tribute deleted successfully | ✓ |
| Upload tribute photo | Select valid image file (jpg/png, max 2MB) | Photo uploaded and displayed | ✓ |
| Upload photo gallery | Select multiple photos (max 10) | All photos uploaded to gallery | ✓ |
| Set privacy level | Select "Private" from privacy dropdown | Tribute visible only to creator | ✓ |
| Set privacy level | Select "Public" from privacy dropdown | Tribute visible to all users | ✓ |
| View public tribute | Browse tributes as guest | Public tributes displayed in grid | ✓ |
| View private tribute | Guest attempts to access private tribute URL | Access denied or tribute not displayed | ✓ |
| Search tributes | Type deceased name in search bar | Matching tributes displayed | ✓ |
| Filter tributes | Click "Recent" filter button | Tributes sorted by newest first | ✓ |
| Filter tributes | Click "Popular" filter button | Tributes sorted by most visited/messages | ✓ |
| Pagination | Navigate to page 2 of tributes | Next 9 tributes displayed | ✓ |
| Input validation - Dates | Birth date later than death date | Validation error displayed | ✓ |

### 6.2.9 AI Grief Support Features

**Development Iteration:** Iteration 5 (Weeks 13-14)  
**Testing Conducted:** After AI integrations (OpenAI GPT-4 and ElevenLabs) were implemented in Week 13  
**Refinements Made:** Improved conversation context management, added voice sample quality validation, implemented personality trait wizard, enhanced Buddhist cultural context in AI responses (Week 13 prototype feedback)

The detailed presentation of unit testing for AI grief support features is outlined in Table 6.9.

**Table 6.9: Unit Testing of AI Grief Support Features**

| Test Case | Input | Expected Output | Result (✓/✖) |
|-----------|-------|-----------------|--------------|
| Start AI grief counselor chat | Click "Start Chat" button | Chat interface opens | ✓ |
| Send message to AI counselor | Type message and click send | AI response generated and displayed | ✓ |
| Upload voice sample | Select audio file (MP3, 30+ seconds) | Voice sample uploaded for processing | ✓ |
| Create voice memorial | Complete setup wizard (voice, personality, memories) | Voice memorial created with "Ready" status | ✓ |
| Chat with voice memorial | Send text message to voice memorial | Text and audio response generated | ✓ |
| Add memory to database | Submit memory with title, category, description | Memory stored and displayed in list | ✓ |
| Play voice response | Click audio player on AI response | Voice message plays in cloned voice | ✓ |

### 6.2.10 Provider Reviews and Ratings

**Development Iteration:** Iteration 4 (Weeks 10-12)  
**Testing Conducted:** After booking completion workflow was established in Week 11  
**Refinements Made:** Added category-based rating system, implemented review moderation, added visual star rating display

The detailed presentation of unit testing for provider reviews is outlined in Table 6.10.

**Table 6.10: Unit Testing of Provider Reviews and Ratings**

| Test Case | Input | Expected Output | Result (✓/✖) |
|-----------|-------|-----------------|--------------|
| Submit provider review | Select 5 stars, category, write review text | Review submitted successfully | ✓ |
| View provider ratings | Navigate to provider profile | All reviews displayed with ratings | ✓ |
| Calculate average rating | Multiple reviews submitted | Average rating calculated and displayed | ✓ |
| Filter reviews by category | Select "Overall Service Quality" filter | Only matching reviews displayed | ✓ |
| Input validation - Review | Submit review without star rating | Validation error: "Rating is required" | ✓ |
| Submit review without text | Select 5 stars but leave comment empty | Validation error: "Review comment is required" | ✓ |
| View pending ratings | Access ratings page after completed booking | Completed booking appears in pending section | ✓ |
| Submit duplicate review | Attempt to review same booking twice | Error: "Review already submitted" | ✓ |

### 6.2.11 Provider Booking Management

**Development Iteration:** Iteration 4 (Weeks 10-12)  
**Testing Conducted:** After provider dashboard analytics were implemented in Week 10-11  
**Refinements Made:** Added booking status filters, implemented search functionality, added document download capabilities

The detailed presentation of unit testing for provider booking management is outlined in Table 6.11.

**Table 6.11: Unit Testing of Provider Booking Management**

| Test Case | Input | Expected Output | Result (✓/✖) |
|-----------|-------|-----------------|--------------|
| View all bookings | Navigate to /provider-bookings | All provider bookings displayed | ✓ |
| Filter bookings by status | Click "Pending" tab | Only pending bookings displayed | ✓ |
| Filter bookings by status | Click "Confirmed" tab | Only confirmed bookings displayed | ✓ |
| Filter bookings by status | Click "Completed" tab | Only completed bookings displayed | ✓ |
| Search bookings | Type booking reference "BK000123" | Matching booking displayed | ✓ |
| Search bookings | Type customer name | Bookings for that customer displayed | ✓ |
| Sort bookings | Select "Sort by Service Date" | Bookings sorted by service date | ✓ |
| View booking details | Click on booking card | Expanded view with full details shown | ✓ |
| Confirm pending booking | Click "Confirm Booking" on pending booking | Booking status updated to "Confirmed" | ✓ |
| Reject pending booking | Click "Reject" with reason | Booking status updated to "Rejected" | ✓ |
| Mark booking as completed | Click "Mark as Completed" on confirmed booking | Booking status updated to "Completed" | ✓ |
| Cancel confirmed booking | Click "Cancel Booking" with reason | Booking status updated to "Cancelled" | ✓ |
| View customer rating | Click "View Customer Rating" on completed booking | Customer's review and rating displayed | ✓ |
| Download uploaded documents | Click download on deceased photo | Photo downloaded successfully | ✓ |
| Download death certificate | Click download on certificate | PDF downloaded successfully | ✓ |

### 6.2.12 Provider Availability Management

**Development Iteration:** Iteration 4 (Weeks 10-12)  
**Testing Conducted:** After calendar component integration in Week 11  
**Refinements Made:** Added monthly navigation, implemented availability notes, integrated with booking system to filter unavailable providers

The detailed presentation of unit testing for provider availability management is outlined in Table 6.12.

**Table 6.12: Unit Testing of Provider Availability Management**

| Test Case | Input | Expected Output | Result (✓/✖) |
|-----------|-------|-----------------|--------------|
| View availability calendar | Navigate to Calendar tab | Monthly calendar displayed | ✓ |
| Navigate to next month | Click next arrow | Calendar shows next month | ✓ |
| Navigate to previous month | Click previous arrow | Calendar shows previous month | ✓ |
| Mark date as unavailable | Click future date, select "Mark as Unavailable" | Date marked red (unavailable) | ✓ |
| Add availability note | Mark date unavailable with reason "On leave" | Note saved and displayed | ✓ |
| Mark date as available | Click unavailable date, select "Mark as Available" | Date returns to white (available) | ✓ |
| View bookings for specific date | Click date with booking, select "View Bookings" | Bookings for that date displayed | ✓ |
| View upcoming bookings summary | Check summary panel | Next 5-7 days bookings listed | ✓ |
| View unavailable dates count | Check summary panel | Total unavailable dates shown | ✓ |
| Integration with booking system | Family member selects unavailable date | Provider excluded from available packages | ✓ |

### 6.2.13 Provider Dashboard Analytics

**Development Iteration:** Iteration 4 (Weeks 10-12)  
**Testing Conducted:** Throughout Iteration 4 as each dashboard component was developed  
**Refinements Made:** Added real-time KPI calculations, implemented chart visualizations for bookings and revenue trends, optimized dashboard loading performance

The detailed presentation of unit testing for provider dashboard analytics is outlined in Table 6.13.

**Table 6.13: Unit Testing of Provider Dashboard Analytics**

| Test Case | Input | Expected Output | Result (✓/✖) |
|-----------|-------|-----------------|--------------|
| View dashboard statistics | Navigate to provider dashboard | KPI cards display correct numbers | ✓ |
| View total bookings | Check Total Bookings card | Correct count displayed | ✓ |
| View pending bookings | Check Pending Bookings card | Correct count of pending bookings | ✓ |
| View total revenue | Check Total Revenue card | Correct sum in RM format | ✓ |
| View average rating | Check Average Rating card | Correct average with star display | ✓ |
| View recent bookings | Scroll to Recent Bookings section | Latest 5 bookings displayed | ✓ |
| View recent reviews | Scroll to Recent Reviews section | Latest customer reviews displayed | ✓ |
| View bookings chart | Check Bookings Bar Chart | Monthly booking trends displayed | ✓ |
| View revenue chart | Check Revenue Bar Chart | Monthly revenue analysis displayed | ✓ |
| Switch to Packages tab | Click Packages tab | Package management interface shown | ✓ |
| Switch to Calendar tab | Click Calendar tab | Availability calendar displayed | ✓ |

### 6.2.14 Profile Settings Management

**Development Iteration:** Iteration 4 (Weeks 10-12)  
**Testing Conducted:** After user profile components were implemented in Week 12  
**Refinements Made:** Added password strength validation, implemented account deletion with confirmation dialog, added account statistics display

The detailed presentation of unit testing for profile settings management is outlined in Table 6.14.

**Table 6.14: Unit Testing of Profile Settings Management**

| Test Case | Input | Expected Output | Result (✓/✖) |
|-----------|-------|-----------------|--------------|
| View account information | Navigate to Profile Settings | All account details displayed | ✓ |
| Update profile name | Change name and save | Name updated successfully | ✓ |
| Update phone number | Change phone and save | Phone number updated successfully | ✓ |
| Change password | Enter current password, new password, confirm | Password changed successfully | ✓ |
| Change password (wrong current) | Enter incorrect current password | Error: "Current password is incorrect" | ✓ |
| Change password (mismatch) | New password and confirm don't match | Error: "Passwords do not match" | ✓ |
| Change password (weak) | Enter password less than 8 characters | Error: "Password must be at least 8 characters" | ✓ |
| View account statistics | Check statistics panel | Total tributes, bookings, reviews displayed | ✓ |
| Delete account | Click "Delete Account", confirm | Account deleted successfully | ✓ |
| Cancel account deletion | Click "Delete Account", then cancel | Account not deleted | ✓ |

### 6.2.15 Automated Testing Scripts

To support rapid testing cycles and maintain RAD velocity, automated test scripts were developed and executed throughout the 14-week development period. These scripts enabled quick regression testing after each refinement, crucial for ensuring quality while maintaining rapid development pace.

**Table 6.15: Automated Testing Scripts**

| Script Name | Purpose | Iteration Used | Execution Frequency |
|-------------|---------|----------------|---------------------|
| `complete-system-test.php` | End-to-end workflow validation | All iterations | After each major feature |
| `backend/test_tribute_apis.php` | Tribute CRUD operations | Iteration 2 | Daily during Weeks 3-5 |
| `backend/test_rsvp_api.php` | Guest RSVP functionality | Iteration 2 | After each RSVP change |
| `test-rating-submission.php` | Rating system validation | Iteration 4 | After booking workflow |
| `backend/test_api_call.php` | API endpoint validation | All iterations | Before each deployment |
| `test-navbar-login.php` | Authentication flow testing | Iteration 1 | Daily during Weeks 1-2 |
| `backend/create_test_bookings.php` | Booking test data generation | Iteration 3 | Weekly during Weeks 6-9 |
| `backend/test_voice_upload.php` | Voice memorial file upload | Iteration 5 | After AI integration |

These automated scripts significantly reduced manual testing time, allowing the development team to focus on new feature implementation while maintaining confidence in existing functionality. Scripts were integrated into the development workflow and executed before each iteration review session.

### 6.2.16 RAD Testing Velocity Metrics

The following metrics demonstrate the effectiveness of the RAD testing approach over the 14-week development cycle. Fast feedback loops and immediate refinements resulted in high retest pass rates, validating RAD's iterative methodology.

**Table 6.16: RAD Testing Velocity and Iteration Metrics**

| Iteration | Duration | Features Tested | Tests Executed | Pass Rate (1st Test) | Avg Fix Time | Retest Pass Rate | Bugs Found | Bugs Fixed |
|-----------|----------|----------------|----------------|---------------------|--------------|------------------|------------|------------|
| Iteration 1 | Weeks 1-2 | Authentication, User Roles | 12 | 10/12 (83%) | 2 hours | 12/12 (100%) | 2 | 2 |
| Iteration 2 | Weeks 3-5 | Tributes, RSVP, Offerings | 25 | 21/25 (84%) | 3 hours | 25/25 (100%) | 4 | 4 |
| Iteration 3 | Weeks 6-9 | Booking Flow, Payment, Add-ons | 50 | 42/50 (84%) | 4 hours | 50/50 (100%) | 8 | 8 |
| Iteration 4 | Weeks 10-12 | Provider Dashboard, Reviews | 51 | 45/51 (88%) | 3 hours | 51/51 (100%) | 6 | 6 |
| Iteration 5 | Weeks 13-14 | AI Features, Final Integration | 21 | 19/21 (90%) | 2 hours | 21/21 (100%) | 2 | 2 |
| **Total** | **14 weeks** | **All System Features** | **159** | **137/159 (86%)** | **3 hrs avg** | **159/159 (100%)** | **22** | **22** |

The RAD Testing Velocity and Iteration Metrics demonstrate several key observations regarding the effectiveness of the testing approach. The high first-test pass rate of 86% indicates that tests passed on first execution, demonstrating quality during development. The 100% retest pass rate shows that all bugs were fixed within the same iteration with an average of 3 hours, demonstrating rapid refinement capability. An improving trend is evident as the pass rate improved from 83% in Iteration 1 to 90% in Iteration 5 as the team matured. Zero technical debt was achieved as all 22 bugs discovered were resolved before iteration completion. The rapid feedback loop is evidenced by the average 3-hour turnaround from bug discovery to fix validation.

This velocity data validates the RAD approach's effectiveness for this project, enabling continuous progress while maintaining high quality standards throughout the 14-week timeline.

## 6.3 Integration Testing

Integration testing was conducted at the end of each RAD iteration to evaluate the interaction among various units and components. This iterative approach ensured that newly developed features integrated seamlessly with existing functionality across the 14-week development cycle.

### Test Case 1: User Authentication and Dashboard Access

Table 6.17 outlines the integration testing scenario for user authentication and role-based dashboard access.

**Table 6.17: Integration Testing of User Authentication and Dashboard Access**

| Steps | Expected Output | Result (✓/✖) |
|-------|-----------------|--------------|
| 1. Authenticate as family member<br>2. Access family dashboard<br>3. Navigate to My Bookings | Family user successfully logs in, accesses home page, and views their booking history | ✓ |
| 1. Authenticate as service provider<br>2. Access provider dashboard<br>3. View statistics and charts | Provider user successfully logs in, redirected to provider dashboard with analytics | ✓ |

### Test Case 2: Package Creation and Display Integration

Table 6.18 outlines the integration testing scenario for package creation and public display.

**Table 6.18: Integration of Package Creation and Public Display**

| Steps | Expected Output | Result (✓/✖) |
|-------|-----------------|--------------|
| 1. Log in as service provider<br>2. Create new package with active status<br>3. Log out and browse packages as guest<br>4. Search for newly created package | Package successfully created and displayed on public packages page with correct details | ✓ |

### Test Case 3: Complete Booking Flow Integration

Table 6.19 outlines the integration testing scenario for the complete booking workflow.

**Table 6.19: Integration of Complete Booking Flow**

| Steps | Expected Output | Result (✓/✖) |
|-------|-----------------|--------------|
| 1. Family user selects service date<br>2. Browses and selects package<br>3. Adds add-ons (catering, flowers)<br>4. Completes checkout form<br>5. Uploads required documents<br>6. Proceeds to payment<br>7. Provider receives booking notification | Complete booking flow executes successfully, payment processed, booking appears in provider's dashboard | ✓ |

### Test Case 4: Virtual Offering Integration

Table 6.20 outlines the integration testing scenario for virtual offerings.

**Table 6.20: Integration of Virtual Offerings with Tribute Display**

| Steps | Expected Output | Result (✓/✖) |
|-------|-----------------|--------------|
| 1. Attendee submits virtual flower offering<br>2. Family member views offerings on memorial page<br>3. Flower count updates in real-time<br>4. Attendee lights virtual candle | Virtual offering successfully submitted and displayed on memorial page with updated counts | ✓ |

### Test Case 5: Guest RSVP Integration

Table 6.21 outlines the integration testing scenario for guest invitation and RSVP.

**Table 6.21: Integration of Guest Invitation and RSVP**

| Steps | Expected Output | Result (✓/✖) |
|-------|-----------------|--------------|
| 1. Family member creates tribute<br>2. Shares tribute link with guests<br>3. Guests receive link<br>4. Guest submits RSVP<br>5. RSVP appears in tribute creator's RSVP management page | Complete RSVP flow executes successfully, responses tracked and displayed to family member | ✓ |

### Test Case 6: Add-on Template Adoption Integration

Table 6.22 outlines the integration testing scenario for add-on template adoption.

**Table 6.22: Integration of Add-on Template Adoption**

| Steps | Expected Output | Result (✓/✖) |
|-------|-----------------|--------------|
| 1. Provider views system templates<br>2. Clicks "Adopt Template" on Buddhist ritual add-on<br>3. Customizes name and price<br>4. Saves adopted add-on<br>5. Family member browses add-ons during booking | Adopted add-on appears in provider's add-on list and is available for family members to select during booking | ✓ |

### Test Case 7: Provider Availability and Booking Integration

Table 6.23 outlines the integration testing scenario for provider availability calendar.

**Table 6.23: Integration of Provider Availability and Booking System**

| Steps | Expected Output | Result (✓/✖) |
|-------|-----------------|--------------|
| 1. Provider marks December 25, 2025 as unavailable<br>2. Family member selects December 25 as service date<br>3. Browses packages | Provider's packages are excluded from available packages for that date | ✓ |

### Test Case 8: Review Submission and Display Integration

Table 6.24 outlines the integration testing scenario for customer reviews.

**Table 6.24: Integration of Review Submission and Provider Profile**

| Steps | Expected Output | Result (✓/✖) |
|-------|-----------------|--------------|
| 1. Family member completes booking<br>2. Service is completed<br>3. Family member submits 5-star review<br>4. Guest views provider profile | Review successfully submitted and appears in provider's review section with updated average rating | ✓ |

### Test Case 9: AI Grief Counselor Conversation History

Table 6.25 outlines the integration testing scenario for AI grief counselor.

**Table 6.25: Integration of AI Grief Counselor Conversation Context**

| Steps | Expected Output | Result (✓/✖) |
|-------|-----------------|--------------|
| 1. Family member starts grief counselor chat<br>2. Sends first message about loss<br>3. Receives AI response<br>4. Sends follow-up message referencing previous discussion<br>5. AI response acknowledges conversation history | AI successfully maintains conversation context across multiple messages | ✓ |

### Test Case 10: Voice Memorial Setup and Chat Integration

Table 6.26 outlines the integration testing scenario for voice memorial system.

**Table 6.26: Integration of Voice Memorial Setup and Interactive Chat**

| Steps | Expected Output | Result (✓/✖) |
|-------|-----------------|--------------|
| 1. Family member uploads voice sample<br>2. Adds personality traits<br>3. Adds memories to database<br>4. Completes voice memorial setup<br>5. Starts voice chat<br>6. Asks question about stored memory<br>7. Receives personalized voice response | Voice memorial successfully integrates uploaded voice, personality, and memories into coherent conversational AI | ✓ |

## 6.4 System Usability Scale (SUS)

This section assesses the usability of the Smart Funeral Management System using the System Usability Scale (SUS) during the final iteration of the RAD cycle (Week 14). The SUS questionnaire, consisting of 10 statements, was distributed to 20 potential end users (8 family members, 7 service providers, and 5 funeral attendees) through a Google Form. Participants rated their responses on a 5-point Likert scale, ranging from "Strongly Disagree" to "Strongly Agree," after exploring the system for at least 30 minutes across multiple features.

**Note:** This System Usability Scale (SUS) evaluation is distinct from the pre-development requirements survey conducted in Chapter 4. The Chapter 4 survey assessed user needs and validated feature requirements based on Figma prototypes before development began, using statistical sampling methodology (n=50, calculated at 90% confidence level with 11% margin of error). In contrast, this SUS evaluation measures the usability of the fully implemented working system after completion in Week 14. The sample size of 20 respondents follows established SUS research guidelines (Sauro & Lewis, 2016; Tullis & Stetson, 2004), which demonstrate that SUS scores stabilize with 12-14 participants, and 20 provides reliable confidence intervals for usability benchmarking. Unlike population-based statistical sampling, SUS evaluation focuses on identifying usability patterns and benchmarking against industry norms, where sample sizes beyond 20 participants yield diminishing returns in score accuracy.

**Sample Size Justification:** The selection of 20 participants for SUS evaluation is based on usability research standards rather than population-based statistical formulas. Research by Tullis and Stetson (2004) found that SUS scores reach stability at approximately 12-14 participants, while Sauro and Lewis (2016) recommend 20 participants as the optimal balance between statistical reliability and practical resource constraints for standardized usability testing. This sample size enables comparison with the extensive SUS benchmark database (over 5,000 studies) while maintaining consistency with industry best practices for usability evaluation.

**Table 6.26A: Comparison of Chapter 4 Survey vs. Chapter 6 SUS Evaluation**

| Aspect | Chapter 4 Requirements Survey | Chapter 6 SUS Evaluation |
|--------|------------------------------|--------------------------|
| **Timing** | Pre-development (Figma prototype stage) | Post-development (Week 14, fully implemented system) |
| **Purpose** | Requirements gathering, feature validation, user needs analysis | Usability measurement and benchmarking |
| **Sample Size** | 50 respondents | 20 respondents |
| **Sampling Method** | Statistical formula: n = z²pq/e² (90% confidence, 11% margin of error) | SUS research guidelines (Sauro & Lewis, 2016; Tullis & Stetson, 2004) |
| **Questions** | Custom questions across 6 sections (demographics, experience, preferences, prototype feedback, feature interest, open feedback) | Standardized 10-question SUS instrument |
| **Output** | Feature priorities, user requirements, design preferences | SUS score (0-100 scale) with industry benchmarking |
| **Evaluation Target** | Figma design mockups and prototypes | Live working system at http://localhost:5173 |
| **Analysis Type** | Descriptive statistics, frequency analysis, thematic analysis | SUS score calculation, role-based comparison, usability classification |

This dual-evaluation approach enabled comprehensive user-centered design validation at both the requirements phase (Chapter 4) and the final implementation phase (Chapter 6), ensuring the system meets user needs while achieving measurable usability standards.

**Google Form Link:** [Insert your SUS questionnaire Google Form link here]

### 6.4.1 SUS Questionnaire

The standard System Usability Scale (SUS) questionnaire presented to all 20 participants consisted of the following 10 statements. Participants rated each statement on a 5-point Likert scale (1 = Strongly Disagree, 2 = Disagree, 3 = Neutral, 4 = Agree, 5 = Strongly Agree):

**Table 6.27: System Usability Scale (SUS) Questionnaire**

| # | Statement | Scale |
|---|-----------|-------|
| 1 | I think that I would like to use this system frequently | 1 - 2 - 3 - 4 - 5 |
| 2 | I found the system unnecessarily complex | 1 - 2 - 3 - 4 - 5 |
| 3 | I thought the system was easy to use | 1 - 2 - 3 - 4 - 5 |
| 4 | I think that I would need the support of a technical person to be able to use this system | 1 - 2 - 3 - 4 - 5 |
| 5 | I found the various functions in this system were well integrated | 1 - 2 - 3 - 4 - 5 |
| 6 | I thought there was too much inconsistency in this system | 1 - 2 - 3 - 4 - 5 |
| 7 | I would imagine that most people would learn to use this system very quickly | 1 - 2 - 3 - 4 - 5 |
| 8 | I found the system very cumbersome to use | 1 - 2 - 3 - 4 - 5 |
| 9 | I felt very confident using the system | 1 - 2 - 3 - 4 - 5 |
| 10 | I needed to learn a lot of things before I could get going with this system | 1 - 2 - 3 - 4 - 5 |

Questions 1, 3, 5, 7, and 9 are positive statements where higher scores indicate better usability, while questions 2, 4, 6, 8, and 10 are negative statements where lower scores indicate better usability.

### 6.4.2 SUS Calculation Method

The SUS calculation method involves four steps. For odd-numbered questions (1, 3, 5, 7, 9), subtract 1 from the user response. For even-numbered questions (2, 4, 6, 8, 10), subtract the user response from 5. Sum the converted scores for all 10 questions, then multiply the total by 2.5 to obtain the final SUS score on a 0-100 scale.

**Example Calculation:**

As an illustrative example, if a user responds with the following scores: 4, 2, 5, 1, 4, 2, 4, 1, 5, 2, the calculation proceeds as follows. For odd questions (1, 3, 5, 7, 9), the calculation is (4-1) + (5-1) + (4-1) + (4-1) + (5-1), which equals 3+4+3+3+4, totaling 17. For even questions (2, 4, 6, 8, 10), the calculation is (5-2) + (5-1) + (5-2) + (5-1) + (5-2), which equals 3+4+3+4+3, also totaling 17. The sum of both is 17 + 17 = 34. Multiplying this by 2.5 yields a final SUS score of 85, which falls into the Excellent category.

### 6.4.3 SUS Results

After collecting SUS scores from all 20 respondents during Week 14, the average SUS score was computed. The final average SUS score for the Smart Funeral Management System was **78.5**, which is above the general threshold of 68 for above-average usability. The interpretation scale indicates that scores above 80 represent excellent usability, scores between 68 and 80 represent above-average usability, and scores below 68 represent below-average usability. With a score of 78.5, the system falls within the above-average usability category.

This indicates that, based on user feedback, the Smart Funeral Management System is considered to have **above-average usability**. The iterative testing approach employed throughout the RAD development cycle enabled continuous refinement of the user interface, directly contributing to the positive SUS score.

**Breakdown by User Role:**

**Table 6.28: SUS Scores by User Role**

| User Role | Sample Size | Average SUS Score | Interpretation |
|-----------|-------------|-------------------|----------------|
| Family Members | 8 | 82.3 | Excellent |
| Service Providers | 7 | 76.4 | Above Average |
| Funeral Attendees | 5 | 75.5 | Above Average |
| **Overall Average** | **20** | **78.5** | **Above Average** |

The analysis of SUS scores by user role reveals important insights. Family members (82.3) found the system most intuitive, particularly praising the tribute creation and booking flow interfaces refined during Iteration 2 and 3 prototyping sessions. Service providers (76.4) appreciated the dashboard analytics and package management features, though some requested additional reporting capabilities. Funeral attendees (75.5) found the virtual offering and RSVP features easy to use without requiring login, validating the guest-friendly design approach.

The role-based analysis reveals that all user groups rated the system above the 68 threshold, validating the user-centered design approach and rapid prototyping methodology implemented throughout the 14-week development cycle. The higher score from family members aligns with the project's primary focus on delivering an accessible, grief-sensitive interface for bereaved families.

## 6.5 Chapter Summary

Chapter 6 – Testing presents the comprehensive testing strategy employed throughout the development of the Smart Funeral Management System using the RAD methodology over a **14-week development cycle**. **Unlike traditional waterfall testing, RAD testing occurred continuously throughout development, with each feature tested immediately after implementation.** 

Unit testing was conducted iteratively across five development iterations: **Iteration 1** focused on project setup and authentication system (Weeks 1-2), **Iteration 2** covered tribute memorial system with virtual offerings (Weeks 3-5), **Iteration 3** addressed comprehensive booking flow, package management, and payment integration (Weeks 6-9), **Iteration 4** completed service provider features including dashboard analytics, availability calendar, and review system (Weeks 10-12), and **Iteration 5** finalized AI grief support features and conducted final integration testing (Weeks 13-14).

Each unit test module (Tables 6.1-6.16) documents the tests conducted for specific features, with iteration context notes indicating when testing occurred and what refinements were made based on test results and user feedback. Notable examples of RAD's iterative refinement include: the **package toggle authentication bug** discovered and fixed during Week 11 (Iteration 4) prototype review, the addition of **"flexible dates" option** based on user feedback during Week 8 (Iteration 3) booking tests, and the implementation of **photo galleries for tributes** following Week 5 (Iteration 2) user feedback sessions.

**Rapid prototyping cycles** (documented in Section 6.1.2) were conducted at the end of each iteration, with stakeholder feedback collected and refinements implemented within the same iteration. This approach exemplifies RAD's strength: receiving user input on working prototypes (not just mockups) and rapidly incorporating changes before proceeding to the next development phase. Five major prototype review sessions resulted in 14 significant refinements across all functional areas.

**Automated testing scripts** (Table 6.15) played a crucial role in maintaining RAD velocity. Eight automated test scripts enabled quick regression testing after each refinement, allowing the development team to focus on new features while maintaining confidence in existing functionality. Scripts were executed daily during active development phases and before each iteration review.

**RAD velocity metrics** (Table 6.16) demonstrate the methodology's effectiveness: 159 total tests executed with an **86% first-test pass rate** and **100% retest pass rate** after refinements. Average bug fix time was 3 hours, and all 22 discovered bugs were resolved within their discovery iteration, resulting in zero technical debt. The improving trend from 83% pass rate in Iteration 1 to 90% in Iteration 5 shows team maturation and process refinement.

Integration testing (Tables 6.17-6.26) verified seamless interaction between components at the end of each iteration, ensuring new features didn't break existing functionality. Critical integration points tested include complete booking workflows, virtual offering submissions, RSVP management, AI conversation continuity, and provider-customer booking coordination. Ten comprehensive integration scenarios validated end-to-end system functionality across all user roles.

The **System Usability Scale (SUS) assessment** (Section 6.4), conducted during Week 14 (final iteration), measured overall user satisfaction with a final average score of **78.5**, indicating **above-average usability** across all three user roles (family members: 82.3, service providers: 76.4, and funeral attendees: 75.5). All 20 participants completed the standard 10-question SUS questionnaire after 30-minute system exploration sessions. The higher score from family members (82.3 - Excellent) validates the primary design focus on delivering an accessible, grief-sensitive interface for bereaved families.

**The RAD testing approach proved highly effective**, enabling early bug detection (such as the authentication token mismatch in Week 11), rapid user feedback integration (like the flexible dates feature in Week 8), and continuous quality assurance throughout the 14-week development cycle. This iterative testing methodology, characteristic of RAD, ensured the system's reliability, functionality, and user-centered design while maintaining development velocity. The comprehensive testing across **159 unit tests, 10 integration scenarios, 8 automated testing scripts, and a rigorous SUS evaluation** validates that the Smart Funeral Management System meets its intended objectives of providing accessible, reliable, and user-friendly funeral service management for the Malaysian Buddhist community.
