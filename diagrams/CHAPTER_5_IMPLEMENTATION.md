# CHAPTER 5: IMPLEMENTATION

## 5.1 Introduction

This chapter presents a comprehensive overview of the Smart Funeral Management System's implementation process. The implementation phase translates the design specifications from Chapter 4 into a fully functional web-based application. This chapter discusses the software tools utilized during development, database implementation strategies, system module implementation, and the integration of core features including the tribute memorial system, booking management, Buddhist add-on services, and AI-powered voice memorial chatbot.

The implementation follows a modular approach, where each component is developed and tested independently before integration. This methodology ensures maintainability, scalability, and ease of debugging throughout the development lifecycle.

---

## 5.2 Software Tools

Visual Studio Code was selected as the primary text editor for developing the Smart Funeral Management System due to its extensive support for modern web development technologies and its rich ecosystem of extensions. This Integrated Development Environment (IDE) provides native support for multiple programming languages including JavaScript (React), PHP, HTML, CSS, and JSON, making it ideal for full-stack web development. Visual Studio Code's IntelliSense feature enables faster and more accurate coding through intelligent code completion, while its built-in PowerShell terminal allows developers to run commands without leaving the editor. The IDE's seamless Git integration facilitates version control management through integrated GitHub support, ensuring efficient collaboration and code tracking throughout the development process. Additionally, the Extension Marketplace provides access to essential development tools such as ESLint for JavaScript code quality, PHP IntelliSense for backend development, Prettier for code formatting, Live Server for real-time preview, and Thunder Client for API testing.

React.js (version 18.x) was chosen as the frontend framework for building the user interface due to its component-based architecture that enables the creation of reusable UI components, resulting in cleaner code and improved maintainability. React's Virtual DOM optimizes rendering performance for dynamic content updates, ensuring a smooth user experience even with frequent data changes. The framework's modular approach allows components such as Navbar, Footer, and ServiceCard to be reused across different pages, significantly reducing code duplication and development time. State management is efficiently handled through React Hooks, particularly useState and useEffect, which provide a modern and intuitive approach to managing application state. Furthermore, React's Single Page Application (SPA) architecture enables seamless navigation without full page reloads, creating a more responsive and desktop-like experience for users.

Vite was utilized as the build tool and development server, offering significant performance improvements over traditional bundlers. Vite provides fast Hot Module Replacement (HMR) that enables instant updates during development without requiring full page refreshes, dramatically improving developer productivity. The tool generates optimized production builds with automatic code splitting, ensuring that users only download the code they need for the current page. Additionally, Vite's native ES modules support enables a faster development experience by eliminating the need for bundling during development.

PHP (version 8.x) serves as the server-side scripting language for implementing business logic and API endpoints throughout the Smart Funeral Management System. The backend architecture follows a procedural approach with modular PHP scripts organized by functionality, promoting code organization and maintainability. The authentication system is implemented through dedicated scripts including register.php, login.php, and logout.php, which handle user registration, authentication, and session management respectively. Tribute management functionality is provided through createTribute.php, getTribute.php, and updateTribute.php, enabling families to create and manage memorial pages for their loved ones. The booking system utilizes createBooking.php, getUserBookings.php, and getProviderBookings.php to facilitate service reservations and booking management for both customers and service providers. Payment processing is integrated through dedicated API endpoints that communicate with external payment gateway services. The innovative Voice AI integration is powered by specialized scripts including voiceChatbot.php for AI conversations, uploadVoiceSample.php for voice model training, and checkVoiceStatus.php for monitoring the setup progress.

XAMPP (version 8.2.x) provides the local development environment, bundling essential components required for web application development. The package includes Apache HTTP Server, which serves as the web server for hosting the application during development and testing. MySQL Database (version 8.0.x) functions as the relational database management system, storing all application data across the 21 interconnected tables. The PHP scripting engine is also included, enabling server-side processing and dynamic content generation.

HeidiSQL was employed as the primary database administration tool due to its comprehensive features and intuitive interface. This powerful tool offers visual database schema design and modification capabilities, allowing developers to create and modify table structures through a graphical interface. SQL query execution and optimization features enable developers to test and refine database queries for optimal performance. The data import/export functionality facilitates database migration and backup operations, while foreign key relationship visualization provides a clear understanding of table dependencies. Additionally, HeidiSQL's table structure analysis and indexing capabilities assist in maintaining database performance and integrity.

phpMyAdmin served as an alternative web-based database management interface, particularly useful for specific administration tasks. This tool proved invaluable for remote database access during deployment phases, as it provides a web-based interface accessible from any location. Quick SQL query execution through phpMyAdmin's intuitive interface enables rapid database testing and debugging. The database backup and restoration features ensure data safety and enable easy rollback to previous states when necessary. Furthermore, phpMyAdmin's user privilege management capabilities allow for fine-grained access control to database resources.

Git and GitHub were utilized for source code version control throughout the development lifecycle. Git provides distributed version control capabilities that enable comprehensive code tracking and change management. Branch management features facilitate organized feature development by allowing developers to work on new features in isolation before merging them into the main codebase. The commit history maintains a detailed record of all changes made to the codebase, enabling easy identification of when and why specific modifications were made. GitHub's collaboration capabilities further enhance team development by providing tools for code review, issue tracking, and project management, ensuring smooth coordination among team members.

---

## 5.3 Database Implementation

### 5.3.1 Database Design Approach

The Smart Funeral Management System database was implemented using a structured approach that prioritizes data integrity, normalization, and referential integrity. The implementation process adhered to industry best practices to ensure a robust and maintainable database architecture. Database tables were normalized to Third Normal Form (3NF) to eliminate data redundancy and ensure data consistency across all system modules. Comprehensive foreign key relationships were established to maintain referential integrity across all 21 tables, preventing orphaned records and maintaining data consistency. Strategic indexes were created on frequently queried columns to optimize query performance, particularly for search operations and reporting functions. Appropriate data types and sizes were carefully selected to balance storage efficiency with data accuracy, ensuring optimal database performance while maintaining data precision.

### 5.3.2 Database Structure Overview

The database architecture comprises 21 interconnected tables organized into 6 functional modules, as presented in Table 5.1. This modular organization facilitates system maintenance, enhances code readability, and promotes scalability for future enhancements. Each module represents a distinct functional area of the system, with clear boundaries and well-defined relationships between modules.

**Table 5.1: Database Module Organization**

| Module | Table Count | Tables | Primary Function |
|--------|-------------|--------|------------------|
| Authentication & User Management | 1 | users | User account management and authentication |
| Service Provider Module | 3 | service_provider, provider_availability, profile_activity_log | Provider profile and availability management |
| Tribute Memorial System | 4 | tributes, tribute_messages, tribute_photos, tribute_rsvp | Digital memorial pages and condolences |
| Package & Add-on Management | 6 | packages, package_features, addon_categories, addon_templates, provider_addons, booking_addons | Service packages and Buddhist add-ons |
| Booking & Payment System | 2 | bookings, provider_reviews | Service reservations and customer feedback |
| AI Voice Memorial System | 5 | voice_models, personality_traits, memories_database, voice_chat_settings, voice_conversations | AI-powered interactive memorials |

**[DIAGRAM SUGGESTION 1: Insert Entity Relationship Diagram (ERD) showing all 21 tables and their relationships here. The ERD should display primary keys, foreign keys, and cardinality relationships between tables. You can use your ERD_DATABASE_SCHEMA_NEW.md Mermaid diagram.]**

### 5.3.3 Database Creation and Implementation

The database implementation utilized SQL Data Definition Language (DDL) scripts executed through HeidiSQL, ensuring consistent and repeatable database deployment. The primary script, MASTER_DATABASE_RESTORATION.sql, contains the complete database schema encompassing database creation and initialization, table structure definitions with constraints, primary key and auto-increment configurations, foreign key relationships and cascading rules, index creation for performance optimization, and default values with data validation rules. This comprehensive script enables complete database reconstruction in development, testing, and production environments, ensuring consistency across all deployment stages.

**Example Implementation: Users Table**

The users table serves as the central authentication repository for the system. The following SQL statement demonstrates the implementation of key database design principles:

```sql
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('family', 'attendee', 'provider', 'admin') DEFAULT 'family',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

This implementation incorporates several critical database design features. The user_id primary key with auto-increment provides unique identification for each user account. A unique constraint on the email field ensures no duplicate user accounts can be created. The ENUM data type for the role field restricts values to predefined user types (family, attendee, provider, admin), preventing invalid role assignments. Strategic indexes on the email and role columns optimize authentication queries and user filtering operations. The InnoDB storage engine enables transaction support and foreign key constraint enforcement, essential for maintaining data integrity.

### 5.3.4 Foreign Key Relationships and Referential Integrity

The database implements 30 foreign key relationships to maintain referential integrity across all functional modules. Table 5.2 presents the key foreign key relationships organized by module, demonstrating the interconnected nature of the system architecture.

**Table 5.2: Key Foreign Key Relationships by Module**

| Child Table | Foreign Key | Parent Table | Cascading Rule | Purpose |
|-------------|-------------|--------------|----------------|---------|
| service_provider | user_id | users | ON DELETE CASCADE | Links provider to user account |
| provider_availability | provider_id | service_provider | ON DELETE CASCADE | Associates availability with provider |
| tributes | created_by | users | ON DELETE SET NULL | Tracks tribute creator |
| tribute_messages | tribute_id | tributes | ON DELETE CASCADE | Links messages to tribute |
| tribute_photos | tribute_id | tributes | ON DELETE CASCADE | Associates photos with tribute |
| packages | provider_id | service_provider | ON DELETE CASCADE | Links packages to provider |
| bookings | user_id | users | ON DELETE SET NULL | Tracks booking customer |
| bookings | provider_id | service_provider | ON DELETE CASCADE | Associates booking with provider |
| bookings | package_id | packages | ON DELETE CASCADE | Links booking to package |
| provider_reviews | booking_id | bookings | ON DELETE SET NULL | Connects reviews to bookings |
| voice_models | tribute_id | tributes | ON DELETE CASCADE | Associates AI voice with tribute |

**[DIAGRAM SUGGESTION 2: Insert a Database Schema Diagram focusing on the foreign key relationships. Use color-coding to show different modules and arrows to indicate cascading rules (CASCADE in red, SET NULL in blue).]**

Two distinct cascading rules were strategically applied throughout the database design. The ON DELETE CASCADE rule ensures that child records are automatically deleted when the parent record is removed, maintaining database consistency. For instance, deleting a tribute automatically removes all associated messages, photos, and RSVP entries. The ON DELETE SET NULL rule sets the foreign key to NULL when the parent is deleted, preserving historical data. For example, deleting a user account preserves their created tributes but removes the creator reference, maintaining memorial pages while acknowledging the account closure.

### 5.3.5 Data Integrity Constraints

Multiple constraint types were implemented throughout the database to ensure data validity and consistency, as summarized in Table 5.3. These constraints enforce business rules at the database level, preventing invalid data entry and maintaining data quality.

**Table 5.3: Data Integrity Constraints Implementation**

| Constraint Type | Implementation Example | Purpose | Tables Applied |
|-----------------|------------------------|---------|----------------|
| Primary Key | `user_id INT AUTO_INCREMENT PRIMARY KEY` | Unique row identification | All 21 tables |
| Unique | `email VARCHAR(100) UNIQUE NOT NULL` | Prevent duplicate values | users, service_provider |
| Not Null | `deceased_name VARCHAR(100) NOT NULL` | Ensure required fields | All tables (selected columns) |
| Check | `rating INT CHECK (rating >= 1 AND rating <= 5)` | Validate data ranges | provider_reviews |
| Foreign Key | `FOREIGN KEY (tribute_id) REFERENCES tributes(id)` | Maintain relationships | 30 relationships across tables |
| Default Values | `status ENUM(...) DEFAULT 'pending'` | Set initial values | bookings, packages, addons |
| Enum | `role ENUM('family', 'attendee', 'provider', 'admin')` | Restrict to valid values | users, bookings |

### 5.3.6 Database Performance Optimization

Strategic indexing was implemented to optimize query performance for frequently accessed data. Table 5.4 presents the key indexes created across critical tables, targeting columns used in WHERE clauses, JOIN operations, and ORDER BY statements.

**Table 5.4: Performance Indexes by Functional Area**

| Functional Area | Table | Index Name | Indexed Columns | Query Optimization Target |
|-----------------|-------|------------|-----------------|---------------------------|
| Authentication | users | idx_email | email | Login authentication queries |
| Authentication | users | idx_role | role | User filtering by role |
| Provider Search | service_provider | idx_provider_active | is_active | Active provider listings |
| Provider Search | service_provider | idx_provider_rating | rating | Provider ranking queries |
| Booking Management | bookings | idx_booking_status | status | Booking status filtering |
| Booking Management | bookings | idx_booking_date | service_date | Date-based booking searches |
| Booking Management | bookings | idx_booking_provider | provider_id | Provider booking history |
| Availability Check | provider_availability | idx_provider_date | provider_id, date_unavailable | Date availability queries |
| Tribute Search | tributes | idx_slug | slug | URL-based tribute retrieval |
| Tribute Search | tributes | idx_public | is_public | Public tribute filtering |

These indexes significantly improve system performance across multiple operations. Provider search and filtering operations benefit from indexes on is_active and rating columns, enabling rapid provider discovery and ranking. Booking status tracking and reporting utilize indexes on status and service_date columns, facilitating efficient booking management dashboards. Date-based availability checks leverage composite indexes on provider_id and date_unavailable columns, optimizing the booking calendar functionality.

**[DIAGRAM SUGGESTION 3: Insert a Performance Comparison Chart showing query execution times before and after indexing for key operations (provider search, booking queries, tribute retrieval). Use a bar chart or line graph.]**

### 5.3.7 Initial Data Population

The database initialization process included the population of essential reference data to enable immediate system functionality upon deployment. This initial data seeding ensures that the system is operational without requiring manual data entry for fundamental system components.

**Add-on System Initialization**

Nine predefined add-on categories were populated to organize Buddhist funeral service offerings, as shown in Table 5.5. These categories provide a structured framework for service providers to offer traditional Buddhist funeral services.

**Table 5.5: Initial Add-on Categories**

| Category ID | Category Name | Description | Display Order |
|-------------|---------------|-------------|---------------|
| 1 | Buddhist Rituals & Ceremonies | Traditional Buddhist funeral ceremonies and rituals | 1 |
| 2 | Altars & Religious Items | Buddhist altars, statues, and religious offerings | 2 |
| 3 | Flowers & Offerings | Floral arrangements and traditional offerings | 3 |
| 4 | Urns & Caskets | Traditional urns and caskets suitable for Buddhist funerals | 4 |
| 5 | Monks & Chanting Services | Buddhist monk services and sutra chanting ceremonies | 5 |
| 6 | Memorial Items | Memorial plaques, tablets, and remembrance items | 6 |
| 7 | Transportation | Hearse and family transportation services | 7 |
| 8 | Cremation Services | Cremation and related services | 8 |
| 9 | Food & Refreshments | Vegetarian meals and refreshments for attendees | 9 |

A comprehensive library of 49 add-on templates was populated across the nine categories, providing standardized service options with suggested pricing. These templates serve as blueprints that service providers can adopt or customize according to their specific offerings. Sample templates include the 7-Day Buddhist Prayer Ceremony priced at RM2,500.00, Premium Buddhist Altar Setup at RM1,200.00, and Standard Hearse Service at RM600.00. This extensive template library enables service providers to quickly establish their service catalog without creating offerings from scratch.

A default administrator account was created to enable initial system configuration and management. This account provides full system access for initial setup, user management, and system configuration tasks. The administrator password is securely hashed using PHP's password_hash() function with bcrypt algorithm, ensuring account security from the initial deployment.

---

## 5.4 System Implementation

This section presents the implementation of the Smart Funeral Management System through comprehensive visual demonstrations of its features organized by user roles. The system provides role-based access control where Family Members can create tributes and book funeral services, Service Providers manage their business operations and packages, and public visitors (Funeral Attendees) can view tributes and submit condolences. Screenshots are presented with detailed explanations of each interface's functionality and user interactions.

### 5.4.1 Common Features

Common features are accessible to all users regardless of their role, providing essential system functionality that supports the overall user experience.

#### 5.4.1.1 Public Landing Page (Unauthenticated Visitors)

**[INSERT SCREENSHOT: Home Page showing hero section, features overview, and user type navigation cards]**

**Figure 5.1: Smart Funeral Management System – Public Home Page**

The public landing page serves as the primary entry point for unauthenticated visitors to the Smart Funeral Management System. The interface features an animated hero section with welcoming messaging that introduces the system's purpose of simplifying funeral service planning during difficult times. The page is organized into multiple sections including a feature showcase highlighting key system capabilities: Service Scheduling, Memorial Pages, Payment Integration, Grief Support AI, and Voice Memories. Each feature is presented in a card format with descriptive text and icons for visual clarity.

The navigation bar displays a simplified menu showing only Home and FAQs links, focusing visitor attention on understanding the platform's offerings before registration. The bottom section presents three user type cards (For Families, For Funeral Attendees, For Service Providers) that guide different user groups to their respective features with prominent "Sign Up" or "Login" call-to-action buttons. This minimalist approach focuses on user acquisition and role education, helping visitors understand which user type best matches their needs. The interface employs Framer Motion animations for smooth transitions and hover effects that enhance user engagement without overwhelming first-time visitors.

#### 5.4.1.2 User Authentication System

**[INSERT SCREENSHOT: Login Page with email and password input fields]**

Figure 5.2 illustrates the login interface where users authenticate themselves to access role-specific features. The login form is centered on the page with a clean, professional design featuring email and password input fields. Form validation provides immediate feedback for empty fields or invalid credentials. Error messages are displayed prominently in red when authentication fails, guiding users to correct their login information. Upon successful authentication, users are redirected to their role-specific dashboard - Service Providers are directed to the Service Provider Dashboard while Family Members return to the home page with access to protected features. The system stores user information and authentication tokens in browser localStorage for session management.

**[INSERT SCREENSHOT: Registration Page showing role selection with family and provider options]**

**Figure 5.3: Smart Funeral Management System – User Registration**

The registration interface enables new users to create accounts with role-based access control. The form collects essential information including full name, email address, phone number, and password with confirmation. A critical feature is the role selection allowing users to register as either Family Member or Service Provider. When the Service Provider role is selected, an additional Company Name input field appears dynamically through conditional rendering.

```jsx
const [role, setRole] = useState('family');
const [showCompanyField, setShowCompanyField] = useState(false);

const handleRoleChange = (selectedRole) => {
  setRole(selectedRole);
  setShowCompanyField(selectedRole === 'provider');
};

const handleSubmit = async (e) => {
  e.preventDefault();
  const formData = {
    name, email, phone, password, role,
    ...(role === 'provider' && { companyName })
  };
  
  const response = await fetch('/backend/register.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
};
```

The code above implements dynamic form rendering based on user role selection. The `handleRoleChange` function toggles the visibility of the Company Name field when Service Provider is selected. Upon submission, the form conditionally includes company name in the payload only for provider registrations. The backend `register.php` hashes passwords using PHP's `password_hash()` function and automatically creates a `service_provider` record for provider accounts.

#### 5.4.1.3 Tribute Memorial Wall

**Figure 5.4: Smart Funeral Management System – Tribute Memorial Wall**

The Tribute Home page displays a public gallery of memorial pages for deceased individuals. Tributes are presented in a responsive grid layout with each card showing the deceased person's profile photo, full name, life dates (formatted with icons), biography excerpt (truncated to 100 characters), and privacy badges (Public or Private). The interface includes search functionality, filter buttons for sorting (Recent, Popular, Oldest), and pagination controls displaying 9 tributes per page. Family members who are logged in see Edit and Delete buttons on their tributes, while public visitors see a "View Memorial" button. The Create New Tribute button is visible only to authenticated family members.

### 5.4.2 Family Member Features

Family members have access to specialized features for creating and managing memorial tributes, booking funeral services with Buddhist add-ons, managing their bookings, submitting ratings, and accessing AI grief support tools.

#### 5.4.2.1 Family Member Landing Page

**[INSERT SCREENSHOT: Home Page for authenticated family members showing full navigation]**

**Figure 5.5: Smart Funeral Management System – Family Member Home Page**

Authenticated family members experience an enhanced version of the home page with full navigation access and personalized content. The navigation bar displays comprehensive menu options: Home, Order Services, Tributes, Grief Support, My Orders, and FAQs, reflecting the complete feature set available to family members. Unlike the public landing page, call-to-action buttons on feature cards now directly navigate to functional pages rather than registration prompts.

The hero section may display personalized welcome messages using the logged-in user's name retrieved from authentication context. Feature cards remain visually identical to the public version but function as direct access points to protected features. Family members can immediately click "Book Funeral Services" to access the Order Services page, "Create Memorial Tribute" to initiate tribute creation, or "Access Grief Support" to utilize AI counseling tools without encountering authentication barriers. The interface maintains the same visual design and animations as the public page to ensure consistency, while the underlying functionality adapts to provide authenticated access to all family-exclusive features including service bookings, tribute management, AI grief counselor, and voice memorial creation.

#### 5.4.2.2 Tribute Management

**Figure 5.6: Smart Funeral Management System – Create Tribute Form**

The tribute creation interface allows family members to establish digital memorials for their loved ones. The form collects comprehensive information including the deceased person's full name, dates of birth and death (with calendar date pickers), and biographical information (multiline text area). A photo upload section allows families to add a profile picture with file validation ensuring only image formats are accepted. Privacy settings are implemented through a dropdown menu offering three options: Public (visible to everyone), Private (only visible to creator), and Restricted (family only). The form includes validation messages for required fields and provides immediate feedback upon successful tribute creation.

**Figure 5.7: Smart Funeral Management System – Tribute Detail Page**

The tribute memorial page serves as the central hub for all tribute-related activities. The top section displays the deceased person's profile photo, full name, and life dates formatted with birth and death icons. The biography section presents the complete life story in a well-formatted text block. The page implements a tabbed interface: the Messages tab displays condolence messages with options to light virtual candles and offer virtual flowers, the Photos tab shows the photo gallery, and the RSVP tab lists funeral event responses. For tribute creators, administrative controls including "Edit Tribute" and "Delete Tribute" buttons are visible. The interface implements access control through AuthContext, checking if the current logged-in user matches the tribute's `created_by` field.

**Figure 5.8: Smart Funeral Management System – Edit Tribute Page**

The tribute editing interface is accessible exclusively to tribute creators. The page structure mirrors the create form but with all fields pre-populated with existing tribute information fetched via `getTribute.php`. Family members can update any field including the deceased's name, dates, biography, and privacy settings. The photo upload section displays the current tribute photo with an option to upload a replacement image. Upon successful update, the form calls `updateTribute.php` and redirects to the tribute detail page.

**Figure 5.9: Smart Funeral Management System – RSVP Management**

The RSVP management interface displays all funeral event responses submitted for a specific tribute. This protected page is only accessible to the tribute creator. The interface presents RSVPs in a structured layout showing respondent names, email addresses, attendance status (Attending, Not Attending, Maybe), number of guests, contact phone numbers, and additional notes. Statistics at the top summarize total responses, confirmed attendees, total guest count, and maybe responses, helping families plan funeral logistics effectively.

#### 5.4.2.3 Service Booking Management

**[INSERT SCREENSHOT: Date selection interface with calendar picker and flexible dates checkbox]**

**Figure 5.10: Smart Funeral Management System – Order Services Date Selection**

The service booking entry point implements a distinctive date-first booking approach that prioritizes availability checking before package browsing. The interface features a centered card with a calendar icon and the heading "When do you need the service?" Users can select a specific service date from the calendar date picker (dd/mm/yyyy format) or check the "I'm flexible with dates" checkbox to view all available packages regardless of date restrictions. The checkbox option displays helper text "Show all available packages" to clarify its purpose. Upon clicking the prominent "Continue to Packages" button, the system processes the date selection and navigates to the package results page.

**[INSERT SCREENSHOT: Package results grid showing multiple funeral packages with prices and Select Package buttons]**

**Figure 5.11: Smart Funeral Management System – Available Packages Results**

Following date selection, the system displays available funeral packages in a responsive grid layout. A success notification at the top confirms the search mode: "Showing all packages (flexible dates)" for flexible searches, or "Showing packages available on [selected date]" for specific date selections with a "Change Date" link. The interface implements Quick Search functionality with a search bar allowing users to filter by package name, provider name, or location. Advanced filtering options include State dropdown (filtering by Malaysian states) and Price Range dropdown (All Prices, Under RM 5,000, RM 5,000-10,000, Above RM 10,000).

Each package is displayed as a card containing provider name with expandable dropdown, package title and brief description, pricing prominently displayed in blue (e.g., "RM 2,800", "RM 5,500"), and a purple "Select Package" button. Packages are organized by provider, with multiple packages from the same provider grouped together. Examples include packages from Nirvana (Essential Memorial Service, Standard Funeral Package, Premium Tribute Service), Peaceful Rest Funeral Services (Basic Farewell Package, Premium Memorial Package, Deluxe Celebration of Life), and Harmony Memorial Services (Buddhist Basic Service, Buddhist Premium Service, Buddhist Deluxe Service). The grid layout adjusts responsively: 3 columns on desktop, 2 columns on tablet, and 1 column on mobile devices.

```php
// checkAvailability.php
$selectedDate = $_POST['service_date'];
$isFlexible = $_POST['is_flexible'];

if ($isFlexible) {
    // Show all active providers
    $query = "SELECT sp.*, u.name as provider_name, 
              AVG(pr.rating) as avg_rating, COUNT(pr.id) as review_count
              FROM service_provider sp
              JOIN users u ON sp.user_id = u.id
              LEFT JOIN provider_reviews pr ON sp.id = pr.provider_id
              WHERE sp.is_active = 1
              GROUP BY sp.id";
} else {
    // Show only providers available on selected date
    $query = "SELECT sp.*, u.name as provider_name,
              AVG(pr.rating) as avg_rating, COUNT(pr.id) as review_count
              FROM service_provider sp
              JOIN users u ON sp.user_id = u.id
              LEFT JOIN provider_reviews pr ON sp.id = pr.provider_id
              WHERE sp.is_active = 1
              AND sp.id NOT IN (
                  SELECT provider_id FROM provider_availability
                  WHERE date_unavailable = ?
              )
              GROUP BY sp.id";
}
```

The code above implements the availability checking logic. When users select a specific date, the system excludes providers who have marked that date as unavailable in the `provider_availability` table. For flexible date searches, all active providers are displayed. The query joins with the `provider_reviews` table to calculate average ratings and review counts, enabling informed provider selection. The results are then displayed in the package grid (Figure 5.11) where users can browse and compare offerings before selecting a specific package for detailed viewing.

**[INSERT SCREENSHOT: Provider-specific availability calendar with About this Provider panel and monthly calendar view]**

**Figure 5.12: Smart Funeral Management System – Provider Availability Calendar**

An alternative booking path allows users to check specific provider availability before viewing packages. The interface displays two main panels: the left panel shows "About this Provider" information (business description, location, phone, email), while the right panel presents an interactive monthly calendar with navigation arrows.

The calendar uses color-coded dates: white for available, red X for unavailable (provider-blocked), green for selected, and bordered for today. Upon date selection, a confirmation panel appears showing "Date Selected!" with a checkmark, the chosen date, and available package count. Users can click "← Change Date" to reselect or "Confirm & Return to Packages →" to proceed with filtered results for that date.

**Figure 5.13: Smart Funeral Management System – Package Details with Buddhist Add-ons**

The package detail view presents comprehensive information about a selected funeral service package. Package details include base price, service capacity, duration, and location type. A critical component is the Buddhist Add-on Selection System displaying nine predefined categories: Buddhist Rituals & Ceremonies, Altars & Religious Items, Flowers & Offerings, Urns & Caskets, Monks & Chanting Services, Memorial Items, Transportation, Cremation Services, and Food & Refreshments. Within each category, available add-ons are displayed with names, descriptions, and prices. Users can select multiple add-ons using checkboxes. The Parlour Selection section allows families to choose between using their own parlour (no charge) or the provider's parlour (with associated fee). The cost breakdown panel displays the base package price, each selected add-on with individual prices, parlour fee (if applicable), and the calculated total amount.

```jsx
const [selectedAddons, setSelectedAddons] = useState([]);
const [parlourChoice, setParlourChoice] = useState('own');
const [totalAmount, setTotalAmount] = useState(0);

const handleAddonToggle = (addon) => {
  setSelectedAddons(prev => {
    const exists = prev.find(a => a.id === addon.id);
    if (exists) {
      return prev.filter(a => a.id !== addon.id);
    } else {
      return [...prev, addon];
    }
  });
};

useEffect(() => {
  const addonsTotal = selectedAddons.reduce((sum, addon) => 
    sum + parseFloat(addon.price), 0);
  const parlourFee = parlourChoice === 'provider' ? 
    parseFloat(packageData.parlour_fee || 0) : 0;
  setTotalAmount(parseFloat(packageData.base_price) + addonsTotal + parlourFee);
}, [selectedAddons, parlourChoice, packageData]);

const handleProceedToCheckout = () => {
  navigate('/checkout', {
    state: {
      package: packageData,
      provider: providerData,
      selectedAddons,
      parlourChoice,
      totalAmount
    }
  });
};
```

The code above manages the add-on selection and cost calculation logic. The `handleAddonToggle` function adds or removes add-ons from the selection array. The `useEffect` hook recalculates the total amount whenever add-ons or parlour choice changes, summing the base package price, all selected add-on prices, and the parlour fee if applicable. Upon clicking "Proceed to Checkout", the complete booking data is passed to the checkout page via React Router's location state.

**[INSERT SCREENSHOT: Checkout page Step 1 showing Personal Information form with Full Name, Email, and Phone Number fields]**

**Figure 5.14: Smart Funeral Management System – Checkout (Personal Information)**

The checkout interface implements a three-step booking finalization process displayed through a progress bar showing: Select Package (completed), Add-ons & Details (completed), Checkout & Payment (current). The first step collects Personal Information to establish customer contact details for the booking.

The form includes three required fields with validation: Full Name input field with placeholder "Enter your full name", Email Address field with placeholder "johnoe@email.com" and email format validation, and Phone Number field with placeholder "+60 12-345-6789" requiring valid Malaysian phone format. The Order Summary sidebar displays the selected package details including provider name, location, contact information, booking date (Wednesday, November 19, 2025), cost breakdown showing Base Package (RM5,500.00), Company Parlour add-on (+RM500.00), and Total Amount (RM6,000.00). Trust indicators at the bottom list "Secure booking process", "24/7 customer support", "Flexible payment options", and "Comprehensive service guarantee". The "Next Step" button proceeds to service details after form validation.

**[INSERT SCREENSHOT: Checkout page Step 2 showing Service Details with confirmed date, parlour selection, and special requirements]**

**Figure 5.15: Smart Funeral Management System – Checkout (Service Details)**

The second checkout step displays confirmed Service Details and allows families to specify special requirements. The Service Date section shows a green highlighted box with calendar icon displaying the confirmed date (e.g., "Wednesday, November 19, 2025") with helper text "Date selected from availability calendar" and a link "Need to change the date? Go back to Add-ons & Details page" for modifications.

The Funeral Parlour section displays the selected parlour option (Company Parlour or Own Parlour) with a purple icon, descriptive text "Professional farewell venue with all facilities", and the Additional Fee (RM500.00). An information note states "To change parlour selection, please go back to Add-ons & Details page". The Special Requirements text area allows input of specific requests such as religious rites, flower preferences, or dietary needs with placeholder text "Any special requests, religious rites, flower preferences, etc." The Order Summary sidebar remains consistent across all steps. Navigation includes "Previous" button to return to personal information and "Next Step" button to proceed to document upload.

**[INSERT SCREENSHOT: Checkout page Step 3 showing Required Documents upload fields for deceased photo, death certificate, and additional documents]**

**Figure 5.16: Smart Funeral Management System – Checkout (Required Documents)**

The final checkout step collects Required Documents essential for service processing. Three file upload sections are presented with validation indicators. The Photo of the Deceased field (marked with red asterisk) displays "Choose File | No file chosen" with format restrictions "JPG, PNG or JPEG format (Max 2MB)" and validation error "Photo of the deceased is required" in red text if not uploaded.

The Death Certificate field (required, red asterisk) accepts "PDF, JPG, PNG or JPEG format (Max 10MB)" and displays validation error "Death certificate is required" when empty. The Additional Documents (Optional) field allows multiple file uploads with helper text "Any additional documentation (multiple files allowed, max 5MB each)". Each upload field uses standard file input with "Choose File" button. The Order Summary sidebar continues to display complete booking information and total amount. Navigation buttons include "Previous" to return to service details and "Proceed to Payment →" to advance to payment processing, which becomes enabled only after required documents are successfully uploaded and validated.

```jsx
const [currentStep, setCurrentStep] = useState(1);
const [formData, setFormData] = useState({
  customerName: '', email: '', phone: '',
  specialRequirements: ''
});
const [uploadedFiles, setUploadedFiles] = useState({
  deceasedPhoto: null, deathCertificate: null, additionalDocs: []
});
const [errors, setErrors] = useState({});

const validateStep = (step) => {
  const newErrors = {};
  if (step === 1) {
    if (!formData.customerName) newErrors.customerName = 'Name is required';
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) 
      newErrors.email = 'Valid email is required';
    if (!formData.phone || !/^\d{10,}$/.test(formData.phone)) 
      newErrors.phone = 'Valid phone number is required';
  } else if (step === 3) {
    if (!uploadedFiles.deceasedPhoto) 
      newErrors.deceasedPhoto = 'Photo of the deceased is required';
    if (!uploadedFiles.deathCertificate) 
      newErrors.deathCertificate = 'Death certificate is required';
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleNextStep = () => {
  if (validateStep(currentStep)) {
    if (currentStep === 3) {
      navigate('/payment', {
        state: { ...location.state, bookingDetails: formData, uploadedFiles }
      });
    } else {
      setCurrentStep(currentStep + 1);
    }
  }
};

const handlePreviousStep = () => {
  setCurrentStep(currentStep - 1);
};
```

The code above implements the three-step checkout navigation and validation system. The `currentStep` state tracks which step the user is on (1: Personal Information, 2: Service Details, 3: Required Documents). The `validateStep` function validates only the fields relevant to the current step - Step 1 validates personal information fields, Step 2 has no validation as service date and parlour were already confirmed on the package details page, and Step 3 validates required file uploads. The `handleNextStep` function validates the current step before advancing, and upon completing Step 3, navigates to the payment page with all collected data. Users can move backward using the "Previous" button without validation.

**Figure 5.17: Smart Funeral Management System – Payment Processing**

The payment processing interface displays a final booking summary and collects payment information. Payment method selection is implemented through radio buttons offering FPX Online Banking, eWallet (Touch 'n Go, GrabPay), and Credit/Debit Card options. When FPX is selected, a bank selection dropdown appears. For credit card selection, additional input fields appear for card number, expiration date, CVV, and cardholder name. A terms and conditions checkbox must be checked before the "Complete Payment" button becomes enabled. Upon clicking Complete Payment, the system calls `createBooking.php` which inserts data into the `bookings` table and associates selected add-ons in the `booking_addons` table.

**Figure 5.18: Smart Funeral Management System – Booking Confirmation**

The booking confirmation page displays immediately after successful payment completion. The interface features a success icon and congratulatory message. The booking reference number is displayed prominently (format: BK000XXX). Key booking details are summarized including service provider company name, package name, service date, service location, and total amount paid. Call-to-action buttons guide users: "View My Bookings" navigates to `/orders`, "Browse More Services" returns to `/order-services`, and "Create Memorial Tribute" directs to `/tribute/create`. An information panel explains next steps: confirmation email will be sent, the provider will contact within 24 hours, and booking details are accessible anytime in My Bookings section.

**Figure 5.19: Smart Funeral Management System – My Bookings Dashboard**

The booking management dashboard displays all user funeral service reservations. Bookings are presented in an organized card layout with each card containing booking reference number, service provider company name, package name and price, service date, booking status badge with color coding (Pending: yellow, Confirmed: blue, Completed: green, Cancelled: gray), total amount paid, and action buttons based on status. For pending or confirmed bookings, a "Cancel Booking" button opens a modal prompting for cancellation reason before calling `cancelBooking.php`. The cancel function implements refund calculation: 100% refund if cancelled 14+ days before service date, 50% if 7-13 days before, no refund if less than 7 days. For completed bookings without ratings, a "Leave Review" button appears. Each booking card is expandable to show full details including selected add-ons, uploaded documents (with download links), customer contact information, service address, and special requirements.

#### 5.4.2.4 Customer Ratings and Reviews

**Figure 5.20: Smart Funeral Management System – Customer Ratings Interface**

The customer ratings interface enables family members to submit reviews for completed bookings. The page is divided into Pending Ratings and Your Submitted Ratings sections. The Pending Ratings section lists completed bookings without reviews, displaying booking reference, provider name, service date, and a "Write Review" button. The rating form includes a 5-star rating selector with interactive hover effects, a category dropdown for review classification (Overall Service Quality, Value for Money, Professionalism, Responsiveness, Facilities & Equipment, Product Quality), a text area for detailed comments (with character count), and a "Submit Rating" button. Upon submission, the system calls `submitRating.php` which inserts the review into the `provider_reviews` table. The Your Submitted Ratings section displays all previously written reviews with provider name, rating stars, review text, submission date, and booking reference.

#### 5.4.2.5 Profile Settings Management

**Figure 5.21: Smart Funeral Management System – Profile Settings**

The profile management interface allows users to view and update account information. The profile section is organized into collapsible panels displaying Account Information (full name, email, phone number, role badge, account creation date), Security section (change password form with current password verification, new password input, confirmation, and strength indicator), and Account Statistics panel (total tributes created, bookings made, reviews submitted, member since date). Update buttons call `updateFamilyProfile.php` or `updateProviderProfile.php` depending on user role. A Delete Account button at the bottom opens a confirmation modal before permanently removing the account via `deleteFamilyAccount.php` or `deleteProviderAccount.php`.

#### 5.4.2.6 AI Grief Support Features

**Figure 5.22: Smart Funeral Management System – Grief Support Hub**

The Grief Support Hub serves as the central access point for AI-powered grief counseling features. The page header introduces the grief support services with empathetic messaging. Two main AI services are presented as featured cards: AI Grief Counselor (text-based chat) with a "Start Chat" button linking to `/grief-support/chat`, and Voice Memorial Chat (interactive voice conversations) with an "Explore Voice Memorials" button linking to `/grief-support/voice`. An additional resources section provides links to external grief support organizations, articles on coping with loss, and community support groups. An important note explains these AI tools supplement, not replace, professional grief counseling services.

**Figure 5.23: Smart Funeral Management System – AI Grief Counselor Chat**

The AI Grief Counselor interface provides text-based grief counseling powered by an AI chatbot. This protected route (family members only) implements a modern chat interface with conversation history displaying message bubbles in alternating colors (user messages on right in blue, AI responses on left in gray). Each message shows the sender name, message text, and timestamp. The chat input area consists of a multiline text input box and a "Send" button. The AI integration calls `chatbot.php` backend endpoint which processes user input and generates empathetic responses using natural language processing.

```php
// chatbot.php
$userMessage = $_POST['message'];
$userId = $_SESSION['user_id'];

// Retrieve conversation history for context
$historyQuery = "SELECT * FROM grief_conversations 
                 WHERE user_id = ? ORDER BY created_at DESC LIMIT 10";
$history = $conn->prepare($historyQuery);
$history->execute([$userId]);
$previousMessages = $history->fetchAll();

// Construct prompt with context
$systemPrompt = "You are a compassionate grief counselor providing empathetic 
                 support to someone who has lost a loved one. Respond with 
                 validation, compassion, and gentle guidance.";

$conversationContext = array_map(function($msg) {
    return [
        'role' => $msg['role'],
        'content' => $msg['message']
    ];
}, $previousMessages);

// Call AI API (OpenAI GPT)
$apiResponse = callOpenAI([
    'model' => 'gpt-4',
    'messages' => array_merge(
        [['role' => 'system', 'content' => $systemPrompt]],
        $conversationContext,
        [['role' => 'user', 'content' => $userMessage]]
    )
]);

$aiResponse = $apiResponse['choices'][0]['message']['content'];

// Store conversation
$storeQuery = "INSERT INTO grief_conversations 
               (user_id, role, message, created_at) VALUES (?, ?, ?, NOW())";
$store = $conn->prepare($storeQuery);
$store->execute([$userId, 'user', $userMessage]);
$store->execute([$userId, 'assistant', $aiResponse]);

echo json_encode(['success' => true, 'response' => $aiResponse]);
```

The code above implements the AI grief counseling chatbot. It retrieves the last 10 conversation messages to provide context for the AI model. A system prompt defines the chatbot's personality as a compassionate grief counselor. The conversation history is formatted and sent to OpenAI's GPT-4 API along with the new user message. The AI-generated response is stored in the `grief_conversations` table maintaining conversation history for future context. Both user and assistant messages are saved, enabling the chatbot to reference previous discussions and provide more personalized support over time.

**Figure 5.24: Smart Funeral Management System – Voice Memorial Hub**

The Voice Memorial Hub displays all voice memorial setups created by the logged-in family member. Each voice memorial is presented as a card showing the deceased person's name, photo, creation date, setup status (Not Started, In Progress, Ready), and action buttons. For fully configured voice memorials (status: Ready), a "Chat Now" button navigates to the voice chat interface. For incomplete setups, a "Continue Setup" button links to the voice management wizard. Setup status indicators use color coding: gray for Not Started (no voice sample uploaded), yellow/orange for In Progress (voice sample uploaded but personality traits incomplete), and green for Ready (full setup completed). A "Create New Voice Memorial" button allows users to initiate voice memorial setup for another tribute.

**Figure 5.25: Smart Funeral Management System – Voice Memorial Setup Wizard**

The Voice Memorial Setup Wizard implements a multi-step process indicated by progress indicators: Voice Sample Upload, Personality Traits, Memory Collection, Settings Configuration. The Voice Sample Upload step allows users to upload audio recordings of the deceased person's voice. File upload interface supports common audio formats (MP3, WAV, M4A) with file size validation. Instructions guide users to upload clear recordings of at least 30 seconds duration for optimal voice cloning quality. The uploaded file is sent to `uploadVoiceSample.php` which stores the file and creates a record in the `voice_models` table with status 'processing'. Integration with ElevenLabs voice cloning API processes the audio sample to generate a custom voice model, storing the returned `elevenlabs_voice_id` for future text-to-speech conversions.

**Figure 5.26: Smart Funeral Management System – Memory Collection Interface**

The Memory Collection page allows family members to provide contextual information that helps the AI generate authentic conversation responses. The interface presents a form for adding memories, stories, and important facts about the deceased person. Input fields include memory title, category dropdown (Life Events, Personal Stories, Hobbies & Interests, Relationships, Beliefs & Values, Favorite Things), detailed description (multiline text area), and date associated with the memory (optional calendar picker). Each submitted memory is stored in the `memories_database` table linked to the specific tribute_id. A list view displays all previously added memories with edit and delete capabilities. These memories serve as the knowledge base that the AI voice chatbot references during conversations.

**Figure 5.27: Smart Funeral Management System – Voice Memorial Chat**

The Voice Memorial Chat interface enables live voice conversations with an AI recreation of the deceased loved one. The chat interface combines text and audio elements: conversation history is displayed as text messages showing both user questions and AI responses, each message includes an audio player icon allowing playback of the AI-generated voice response, and user input can be submitted via text input field or voice recording button. Responses are generated by calling `voiceChatbot.php` which retrieves tribute information, personality traits from `personality_traits` table, relevant memories from `memories_database`, previous conversation context from `voice_conversations` table, sends a constructed prompt to the AI language model (GPT-4) to generate an appropriate response, converts the text response to speech using ElevenLabs Text-to-Speech API with the deceased person's cloned voice, returns both text and audio URL to the frontend, and stores the conversation in `voice_conversations` table for future context.

```php
// voiceChatbot.php (excerpt)
$tributeId = $_POST['tribute_id'];
$userMessage = $_POST['message'];

// Retrieve voice model and memories
$voiceQuery = "SELECT elevenlabs_voice_id FROM voice_models 
               WHERE tribute_id = ? AND status = 'ready'";
$voiceModel = $conn->prepare($voiceQuery);
$voiceModel->execute([$tributeId]);
$voiceData = $voiceModel->fetch();

$memoriesQuery = "SELECT * FROM memories_database WHERE tribute_id = ?";
$memories = $conn->prepare($memoriesQuery);
$memories->execute([$tributeId]);
$memoryData = $memories->fetchAll();

// Construct AI prompt with personality
$personalityPrompt = "You are {deceased_name}. Answer as if you were still alive, 
                      based on these memories: " . json_encode($memoryData);

$aiResponse = callOpenAI([...]);

// Convert to speech using ElevenLabs
$audioResponse = callElevenLabs([
    'voice_id' => $voiceData['elevenlabs_voice_id'],
    'text' => $aiResponse,
    'model_id' => 'eleven_monolingual_v1'
]);

$audioUrl = saveAudioFile($audioResponse);

echo json_encode([
    'text' => $aiResponse,
    'audio_url' => $audioUrl
]);
```

The code above implements the voice memorial chatbot. It retrieves the ElevenLabs voice model ID created during voice setup and fetches all stored memories for context. The AI prompt instructs the model to respond as the deceased person using the memories as a knowledge base. After generating the text response, it's converted to speech using ElevenLabs TTS API with the cloned voice. Both the text and audio URL are returned to the frontend, enabling users to read and hear the AI-generated response in their loved one's voice.

### 5.4.3 Funeral Attendee Features

Funeral attendees (public visitors) have access to view public tributes, submit condolence messages, offer symbolic gestures, and submit RSVP responses for funeral events without requiring full account registration.

#### 5.4.3.1 Funeral Attendee Landing Page

**[INSERT SCREENSHOT: Home page viewed by authenticated funeral attendee with simplified navigation]**

**Figure 5.28: Smart Funeral Management System – Funeral Attendee Landing Page**

Authenticated funeral attendees are redirected to the home page (`/`) with a streamlined interface optimized for viewing memorial tributes. The navigation bar displays a simplified menu showing only Home and FAQs links, hiding inaccessible features like Order Services, Tributes management, and Grief Support. This restricted navigation prevents confusion and maintains a clean interface focused on their primary purpose.

Attendees access public tributes by navigating to `/tribute`, which presents memorial pages in a responsive grid layout with search functionality, filter options (Recent, Popular, Oldest), and pagination showing 9 tributes per page. Each tribute card displays the deceased's profile photo, full name, life dates, biography excerpt (100 characters), and privacy badge. Clicking any card opens the full tribute page where attendees can read the biography, submit condolence messages with optional photo attachments, offer virtual flowers, and submit RSVP responses for funeral events.

#### 5.4.3.2 Public Tribute Viewing

**Figure 5.29: Smart Funeral Management System – Public Tribute Page**

The public tribute viewing interface allows funeral attendees (non-logged-in visitors or users without tribute ownership) to view memorial pages. The interface presents the deceased person's profile photo, full name, and formatted life dates prominently at the top. The biography section displays the complete life story in readable paragraphs. Unlike tribute creators who see Edit and Delete buttons, public attendees see a simplified interface focused on viewing and interaction. The tabbed content area provides access to Messages (read condolences and submit new ones), Photos (viewing shared memorial images), and RSVP (submitting funeral attendance responses). This implementation balances public access for community mourning with privacy protection by hiding administrative controls and respecting tribute privacy settings.

#### 5.4.3.3 Condolence Messages and Symbolic Gestures

**Figure 5.30: Smart Funeral Management System – Message Submission Form**

The interactive condolence features allow visitors to engage through two mechanisms: submitting written condolence messages with optional photo attachments, and offering virtual flowers as a symbolic gesture of sympathy. The message submission form includes input fields for visitor's name (required), email address (optional for non-logged-in visitors), message text area (required for heartfelt condolences), and photo upload (optional, allowing visitors to attach meaningful photos with their tributes). The photo upload functionality integrates with `uploadFile.php` to handle image validation and storage, followed by `addMessage.php` which inserts the message into the `tribute_messages` table along with the photo URL if provided.

The "Offer a Flower" button provides a simple yet meaningful way to pay respects. Clicking this button calls `offerFlower.php`, incrementing the `flower_count` field in the tributes table and displaying a confirmation animation with the message "Thank you for offering a flower 🌸✨". The interface implements optimistic UI updates, immediately incrementing the flower count for responsive feedback while the backend processes the request asynchronously. All submitted condolence messages appear chronologically below the form, displaying sender name, submission date, message text, and attached photo (if provided). The tribute header prominently displays the total count of flowers offered, allowing families to see the community's outpouring of support at a glance.

#### 5.4.3.4 RSVP for Funeral Events

**Figure 5.31: Smart Funeral Management System – RSVP Submission Form**

The RSVP submission interface allows attendees to indicate their attendance for funeral services, helping families with planning and logistics. Input fields collect essential attendee information: full name (required validation via trim check), phone number (required for contact purposes), email address (optional for confirmation), attendance type selection via radio buttons or dropdown (Physical or Virtual attendance), and number of guests (numeric input defaulting to 1, representing total people including the respondent). Form validation ensures required fields (name and phone) are completed before submission through client-side checks that display error toast notifications if validation fails.

Upon clicking "Submit RSVP", the system calls `submitRSVP.php` which inserts the response into the `tribute_rsvp` table with fields `tribute_id`, `guest_name`, `guest_phone`, `guest_email`, `number_of_guests`, and `attendance_type`. Success confirmation is displayed as a toast notification "✅ RSVP submitted successfully!" and the form resets to default values. The RSVP form is accessible to all visitors regardless of authentication status, ensuring barrier-free participation from the community. This implementation reflects modern funeral practices by accommodating both physical attendance at traditional ceremonies and virtual participation through online streaming, addressing the evolving needs of geographically dispersed families and attendees.

### 5.4.4 Service Provider Features

Service providers have access to a comprehensive business management dashboard with features for analytics, package management, add-on customization, booking management, availability management, reviews, and profile administration.

#### 5.4.4.1 Service Provider Landing Page (Dashboard)

**[INSERT SCREENSHOT: Service Provider Dashboard showing statistics, charts, and recent activity]**

**Figure 5.33: Smart Funeral Management System – Service Provider Dashboard (Landing Page)**

Service providers experience a completely different landing page optimized for business management rather than public-facing content. Upon successful login, providers are automatically redirected to their dedicated Service Provider Dashboard (`/service-provider-dashboard`) which serves as their primary landing page and command center for all business operations. This page bypasses the public home page entirely, reflecting the distinct nature of provider accounts.

The navigation bar displays a specialized menu showing only Dashboard, Packages, and FAQs links, eliminating access to customer-facing features like tribute creation or service booking. This focused navigation emphasizes the provider's role as service supplier rather than service consumer. The dashboard implements a comprehensive business analytics interface rather than marketing content.

The dashboard Statistics Overview displays key performance indicators in card format including Total Bookings, Pending Bookings, Completed Bookings, Total Revenue (formatted as RM X,XXX.XX), Average Rating (displayed as X.X out of 5.0 stars), Total Reviews, and Revenue Growth percentage. The Recent Bookings section shows the 5 most recent bookings with booking reference, customer name, package name, service date, total amount, and status badge. The Recent Reviews panel displays latest customer feedback with star ratings, review text excerpts, and customer names. Visual charts implement dynamic data visualization: a Bookings Bar Chart showing monthly booking trends over the past 6-12 months using Chart.js, and a Revenue Bar Chart displaying monthly revenue analysis with data fetched from `getProviderDashboard.php` which aggregates booking data grouped by month.

```php
// getProviderDashboard.php
$providerId = $_SESSION['provider_id'];

// Get statistics
$statsQuery = "SELECT 
    COUNT(*) as total_bookings,
    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_bookings,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_bookings,
    SUM(CASE WHEN status IN ('confirmed', 'completed') THEN total_amount ELSE 0 END) as total_revenue,
    (SELECT AVG(rating) FROM provider_reviews WHERE provider_id = ?) as avg_rating,
    (SELECT COUNT(*) FROM provider_reviews WHERE provider_id = ?) as review_count
    FROM bookings WHERE provider_id = ?";

$stats = $conn->prepare($statsQuery);
$stats->execute([$providerId, $providerId, $providerId]);
$dashboardStats = $stats->fetch();

// Get monthly booking trends
$trendsQuery = "SELECT 
    DATE_FORMAT(service_date, '%Y-%m') as month,
    COUNT(*) as booking_count,
    SUM(total_amount) as revenue
    FROM bookings 
    WHERE provider_id = ? AND service_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
    GROUP BY month ORDER BY month";

$trends = $conn->prepare($trendsQuery);
$trends->execute([$providerId]);
$monthlyTrends = $trends->fetchAll();

echo json_encode([
    'stats' => $dashboardStats,
    'trends' => $monthlyTrends
]);
```

The code above implements the provider dashboard analytics. It queries the bookings table to calculate total bookings, pending/completed counts, total revenue (summing only confirmed and completed bookings), and joins with provider_reviews to get average rating and review count. The monthly trends query groups bookings by month for the past 12 months, calculating booking count and revenue for each month. This data powers the dashboard's KPI cards and visualization charts, providing providers with actionable business insights.

The dashboard implements a modern tab navigation system with buttons for Overview (default), Manage Bookings (navigates to `/provider-bookings`), Packages (integrated tab), Calendar (availability management tab), and Manage Add-ons (navigates to `/manage-addons`). Active tabs are highlighted with gradient backgrounds while inactive tabs use hover effects for better user experience.

#### 5.4.4.2 Package Management

**Figure 5.34: Smart Funeral Management System – Package Management in Dashboard**

The package management interface is accessible through the Packages tab within the Service Provider Dashboard. Existing packages are displayed in a responsive grid layout with each package card showing package name, description (truncated for card view), base price formatted as RM X,XXX.XX, capacity and duration statistics, location type with color-coded badges (Blue for Both, Green for Indoor Only, Amber for Outdoor Only), booking count, feature preview (first 3 features with "+ more" indicator if over 3 features), and toggle switches for Featured Package (yellow) and Active status (green). Each card includes Edit and Delete action buttons. The "Add New Package" button at the top initiates package creation. Status toggles implement optimistic UI updates, immediately reflecting changes while processing backend requests via `updatePackage.php`. Delete operations trigger confirmation modals before calling `deletePackage.php`.

**Figure 5.35: Smart Funeral Management System – Add/Edit Package Form**

The package creation and editing form appears as a modal or expanded section when clicking "Add New Package" or Edit on existing packages. Input fields include Package Name (text input, required, max 100 characters), Description (multiline textarea), Base Price (numeric input accepting decimals), Capacity (number input for maximum attendees), Duration (service hours as number input), Location Type (dropdown: Indoor Only, Outdoor Only, Both), and Status checkbox for Active/Inactive. The Package Features section implements dynamic feature management with an "Add Feature" button allowing providers to add multiple features. Each feature row contains a text input and remove button (X icon). Features are stored in the `package_features` table linked via `package_id` foreign key. Form validation ensures required fields are completed, price is positive, capacity and duration are valid integers, and at least one feature is provided. Submission calls `addPackage.php` (for new packages) or `updatePackage.php` (for edits).

#### 5.4.4.3 Add-on Management

**Figure 5.36: Smart Funeral Management System – Manage Add-ons**

The add-on management interface (accessed via navigation to `/manage-addons`) allows providers to customize their Buddhist funeral add-on offerings. The page implements tabbed navigation with three sections: My Add-ons (showing provider's current offerings), Templates (displaying 49 system-provided templates), and Create Custom (form for custom add-ons). The My Add-ons tab organizes offerings by nine Buddhist ceremony categories as expandable accordion sections: Buddhist Rituals & Ceremonies, Altars & Religious Items, Flowers & Offerings, Urns & Caskets, Monks & Chanting Services, Memorial Items, Transportation, Cremation Services, and Food & Refreshments. Each add-on displays name, description, price (RM XXX.XX format), active status toggle (green/gray), and Edit/Delete buttons. The Templates tab fetches data from `getAddonTemplates.php` showing all system templates with name, category, suggested description, suggested price, and "Adopt Template" button. The Create Custom tab provides a form with category dropdown, addon name, description textarea, price input, and active status checkbox.

```jsx
// ManageAddons.jsx - Template adoption logic
const handleAdoptTemplate = async (template) => {
  const adoption = {
    provider_id: providerData.id,
    template_id: template.id,
    category_id: template.category_id,
    addon_name: template.name,
    description: template.description,
    price: template.suggested_price,
    is_active: true
  };
  
  const response = await fetch('/backend/addProviderAddon.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(adoption)
  });
  
  if (response.ok) {
    setNotification('Template adopted successfully!');
    fetchMyAddons(); // Refresh the My Add-ons list
  }
};
```

The code above implements the template adoption feature. When a provider clicks "Adopt Template", the template's information is copied into a new provider addon record. The provider can customize the name, description, and price before final adoption. The system maintains a reference to the original template via `template_id` while allowing full customization. This flexible approach enables providers to offer standardized Buddhist services while accommodating unique business capabilities and competitive pricing strategies.

**Figure 5.37: Smart Funeral Management System – Edit Add-on Modal**

The add-on editing interface appears as a modal dialog when clicking Edit on existing add-ons or Adopt Template on templates. The form displays category (read-only or dropdown), addon name (text input, pre-populated for edits), description (multiline textarea, pre-populated), price (numeric input with RM prefix, pre-populated), and active status checkbox. Template-based add-ons show a "Based on Template" badge. Providers can fully customize name, description, and pricing while maintaining category association. Save functionality calls `addProviderAddon.php` (for new/adopted) or `updateProviderAddon.php` (for edits), writing to `provider_addons` table with fields `provider_id`, `template_id`, `category_id`, `addon_name`, `description`, `price`, and `is_active`.

#### 5.4.4.4 Booking Management and Fulfillment

**Figure 5.38: Smart Funeral Management System – Provider Bookings Dashboard**

The provider booking management dashboard (accessed via navigation to `/provider-bookings`) displays all bookings received by the service provider. The page header shows "Manage Bookings" with status filter tabs: All, Pending, Confirmed, Completed, and Cancelled. Active filters are highlighted with booking counts displayed in each tab. Bookings are presented in card layout (mobile) or table view (desktop) showing booking reference (BK000XXX format), customer name and contact information, selected package name, service date, total amount (RM X,XXX.XX), status badge (color-coded: yellow for pending, blue for confirmed, green for completed, gray for cancelled), booking date, and action buttons based on status. Search functionality allows filtering by reference number, customer name, or date. Sort options enable ordering by booking date, service date, or total amount.

```php
// getProviderBookings.php
$providerId = $_SESSION['provider_id'];
$statusFilter = $_GET['status'] ?? 'all';

$query = "SELECT b.*, u.name as customer_name, u.email as customer_email,
          u.phone as customer_phone, p.name as package_name,
          (SELECT GROUP_CONCAT(CONCAT(pa.addon_name, '|', pa.price))
           FROM booking_addons ba 
           JOIN provider_addons pa ON ba.addon_id = pa.id
           WHERE ba.booking_id = b.id) as addons_list
          FROM bookings b
          JOIN users u ON b.user_id = u.id
          JOIN packages p ON b.package_id = p.id
          WHERE b.provider_id = ?";

if ($statusFilter !== 'all') {
    $query .= " AND b.status = ?";
    $params = [$providerId, $statusFilter];
} else {
    $params = [$providerId];
}

$query .= " ORDER BY b.created_at DESC";

$stmt = $conn->prepare($query);
$stmt->execute($params);
$bookings = $stmt->fetchAll();

echo json_encode(['bookings' => $bookings]);
```

The code above fetches provider bookings with status-based filtering. The query joins the bookings table with users and packages tables to retrieve customer and package information. A subquery aggregates all selected add-ons for each booking using GROUP_CONCAT, combining addon name and price. The status filter parameter allows providers to view bookings by status category. Search functionality allows providers to find bookings by reference number, customer name, or date. Sort options enable ordering by booking date, service date, or total amount.

**Figure 5.39: Smart Funeral Management System – Expanded Booking Details**

The detailed booking view reveals comprehensive information for service fulfillment. Sections include Customer Information (full name, email, phone with click-to-call, special requirements), Service Details (package name and features list, service date/time, location address, parlour choice with fee), Selected Add-ons (organized by category with individual prices), Cost Breakdown (base package price, add-on line items, parlour fee, subtotal, total paid), Uploaded Documents (deceased photo thumbnail, death certificate viewer/download, additional documents), and Payment Information (payment method, status, transaction reference). Provider Action Buttons appear based on status: Pending bookings show "Confirm Booking" and "Reject with Reason", Confirmed bookings show "Mark as Completed" and "Cancel Booking", Completed bookings show "View Customer Rating". Actions call `updateBookingStatus.php` which updates the `bookings` table and stores provider notes or cancellation reasons.

**Figure 5.40: Smart Funeral Management System – Provider Availability Calendar**

The availability calendar interface (accessible through the Calendar tab in the dashboard) allows providers to manage their service schedule. The calendar displays month view with color-coded dates: Green for available dates (no bookings/restrictions), Yellow for dates with confirmed bookings, Red for unavailable dates marked by provider (fully blocked), and Gray for past dates (not selectable). Providers interact by clicking future dates to toggle availability, opening a modal with options: Mark as Unavailable (blocks date completely), Add Availability Note (e.g., "On leave", "Holiday"), or View Bookings for This Date (if bookings exist). Unavailability data is stored in `provider_availability` table with fields `provider_id`, `date_unavailable`, `reason` (optional), and `created_at`. The calendar integrates with the booking system: when families select service dates on `/order-services`, the system queries this table via `checkAvailability.php`. Month navigation arrows allow viewing future months. A summary panel shows upcoming bookings (next 5-7 days), unavailable dates count for current month, and total bookings scheduled.

**Figure 5.41: Smart Funeral Management System – Provider Reviews and Ratings**

The provider ratings and reviews interface (displayed in the Overview tab of the dashboard) allows service providers to view customer feedback. The header prominently displays performance metrics: Average Rating shown as large star visualization (e.g., 4.5 ★★★★½ out of 5.0), Total Reviews Count (e.g., "Based on 47 reviews"), and Rating Distribution bar chart showing percentages for 5-star, 4-star, 3-star, 2-star, and 1-star reviews. The Recent Reviews section displays individual customer reviews chronologically (most recent first) with review cards showing customer name (anonymized if privacy enabled), star rating (1-5 stars as filled/empty icons), review category badge (Quality, Value, Professionalism, Responsiveness, Facilities, Products), review text (full customer comment), booking reference number (for verification), and submission date (formatted as relative time or specific date). Filter options allow viewing by rating, category, or date range. Sort options include Most Recent, Highest Rated First, or Lowest Rated First. Review data is fetched via `getProviderDashboard.php` querying the `provider_reviews` table filtered by `provider_id`, joined with bookings and users tables. Providers cannot edit or delete reviews (maintaining integrity), but may have "Report Inappropriate Review" option for guideline violations.

**Figure 5.42: Smart Funeral Management System – Provider Profile Settings**

The provider profile management interface (accessed via ProfileSettings page with role-based rendering) displays provider-specific content. The page features a header showing company name and provider role badge. The Business Information section presents editable fields: Company Name (text input, required), Business Description (multiline textarea describing services and philosophy), Business Address (Street Address, City, State, Postal Code as separate inputs), Contact Information (Business Phone with format validation, Business Email with email validation, Website URL optional), and Business Hours (time pickers or text inputs, e.g., "Mon-Fri: 9:00 AM - 6:00 PM"). A Company Logo upload section allows logo image upload (displayed on provider cards) with file type validation (JPG, PNG) and size restrictions. The Account Statistics panel displays Total Packages Offered (active package count), Total Add-ons Available (active provider add-ons count), Total Bookings Received (all-time), Total Revenue Earned (sum of completed bookings), Average Rating (from reviews), and Member Since Date (registration date). The Security section provides Change Password form with current password verification, new password input, confirm password, and strength indicator. Social Media Links section may include optional inputs for Facebook, Instagram, etc. Update buttons for each section call `updateProviderProfile.php` updating the `service_provider` table. A Delete Account button (warning red) opens confirmation modal before permanently removing via `deleteProviderAccount.php`, implementing cascade deletion for associated packages, bookings (setting `provider_id` to NULL for historical records), and reviews.

---

## 5.5 API Integration

### 5.5.1 Payment Gateway Integration

**Payment Methods Supported:**
- FPX (Malaysian online banking)
- eWallet (Touch 'n Go, GrabPay, Boost)
- Credit/Debit Cards (Visa, Mastercard)

### 5.5.2 ElevenLabs Voice AI Integration

**API Endpoints Used:**
- Voice model creation and training
- Text-to-speech conversion
- Voice cloning from audio samples

### 5.5.3 Email Notification System

**Email Triggers:**
- Registration confirmation
- Booking confirmation
- RSVP confirmations
- Review submission notifications

---

## 5.6 Testing and Debugging

### 5.6.1 Development Testing Tools

- **Thunder Client**: API endpoint testing within VS Code
- **Browser DevTools**: Frontend debugging and network inspection
- **PHP Error Logging**: Backend error tracking and debugging
- **HeidiSQL Query Execution**: Database query testing and optimization

### 5.6.2 Testing Approach

1. **Unit Testing**: Individual PHP functions tested in isolation
2. **Integration Testing**: API endpoints tested with database interactions
3. **User Acceptance Testing**: Real-world scenarios tested by end-users
4. **Performance Testing**: Load testing for concurrent bookings and tribute access

---

## 5.7 Deployment Preparation

### 5.7.1 Production Environment Setup

- **Web Server**: Apache HTTP Server with mod_rewrite enabled
- **PHP Configuration**: Version 8.0+ with required extensions (mysqli, json, fileinfo)
- **Database**: MySQL 8.0+ with InnoDB storage engine
- **SSL Certificate**: HTTPS encryption for secure data transmission

### 5.7.2 Code Optimization

- **Frontend**: Production build using Vite with minification and tree-shaking
- **Backend**: Opcode caching with OPcache for improved PHP performance
- **Database**: Query optimization and index fine-tuning based on access patterns

---

## 5.8 Conclusion

This chapter detailed the comprehensive implementation process of the Smart Funeral Management System, covering software tool selection, database creation, and system module development. The implementation successfully translated the design specifications into a functional web-based application with 21 database tables, 358 PHP backend files, and a modern React frontend.

Key achievements include:
- Secure authentication system with role-based access control
- Complete tribute memorial system with multimedia support
- Sophisticated booking system with Buddhist add-on integration
- Innovative AI voice memorial chatbot feature
- Responsive user interface built with React and Vite
- Robust database architecture with comprehensive foreign key relationships

The next chapter will present the system testing results and evaluate the system's performance against the defined objectives and requirements.
