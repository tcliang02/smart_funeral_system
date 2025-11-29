# Smart Funeral System

A comprehensive web application for managing funeral services, memorial tributes, and connecting families with service providers.

## System Overview

The Smart Funeral System offers:

- **For Families:**
  - Browse and compare funeral service providers
  - View and purchase funeral packages
  - Create memorial tributes for loved ones
  - Manage funeral arrangements in one place

- **For Service Providers:**
  - Create and manage service packages
  - Maintain a company profile
  - Process and track orders

## Technology Stack

- **Frontend:** React.js with Vite
- **Backend:** PHP (REST API)
- **Database:** MySQL
- **Server:** XAMPP (Apache)

## Prerequisites

- XAMPP (with PHP 7.4+ and MySQL)
- Node.js (v14+) and npm
- HeidiSQL or similar MySQL client (optional, but recommended)

## Setup Instructions

### 1. Database Setup

1. Start XAMPP and ensure Apache and MySQL services are running
2. Set up the database using HeidiSQL:
   - Follow the detailed instructions in `backend/database_setup_guide.md`
   - This will create all necessary tables and insert test data

### 2. Backend Setup

The backend is built with plain PHP files that serve as API endpoints. No additional setup is required beyond the database configuration.

### 3. Frontend Setup

1. Open a terminal and navigate to the frontend directory:

```
cd frontend/my-app
```

2. Install dependencies:

```
npm install
```

3. Start the development server:

```
npm run dev
```

4. The application should now be running at http://localhost:5173

## Running the Application

1. Ensure XAMPP is running (Apache and MySQL services)
2. Start the React frontend development server:
   ```
   cd frontend/my-app
   npm run dev
   ```
3. Access the application at http://localhost:5173

## Test Accounts

The following test accounts are created automatically when you set up the database:

1. **Admin User**
   - Username: `admin`
   - Password: `admin123`

2. **Family User**
   - Username: `testfamily`
   - Password: `family123`

3. **Service Provider**
   - Username: `testprovider`
   - Password: `provider123`

## Project Structure

```
smart_funeral_system/
├── backend/                 # PHP API endpoints
│   ├── db_connect.php       # Database connection
│   ├── helpers.php          # Helper functions
│   ├── login.php            # Authentication endpoint
│   └── ...                  # Other API endpoints
├── frontend/
│   └── my-app/              # React application
│       ├── src/
│       │   ├── components/  # Reusable UI components
│       │   ├── pages/       # Page components
│       │   ├── data/        # Static data files
│       │   ├── App.jsx      # Root component
│       │   └── main.jsx     # Application entry point
│       ├── public/          # Static assets
│       └── package.json     # Dependencies and scripts
└── README.md                # This file
```

## API Endpoints

The backend provides the following API endpoints:

- **Authentication:**
  - `login.php` - User login
  - `register.php` - User registration
  - `verify-auth.php` - Token verification

- **Service Providers:**
  - `getAllProviders.php` - List all service providers
  - `getProviderProfile.php` - Get provider details
  - `updateProviderProfile.php` - Update provider profile

- **Packages:**
  - `getPackages.php` - List packages
  - `addPackage.php` - Create package
  - `deletePackage.php` - Delete package

- **Tributes:**
  - `getTributes.php` - List memorial tributes

## Development Guidelines

- **Backend Changes:**
  - Add new API endpoints as individual PHP files
  - Use `db_connect.php` for database access
  - Implement authentication with `verify-auth.php` for protected routes
  - Format responses as JSON with appropriate status codes

- **Frontend Changes:**
  - Add new pages in `src/pages/`
  - Create reusable components in `src/components/`
  - Use the AuthContext for authentication state
  - Update the navigation in `Navbar.jsx` for new pages

## License

This project is for educational purposes only.