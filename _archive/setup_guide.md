# Local Development Environment Setup Guide

This guide will walk you through setting up your local development environment for the Smart Funeral System project.

## Prerequisites

Before you begin, ensure you have the following installed:

1. **XAMPP** (v7.4 or higher)
   - Download from: https://www.apachefriends.org/download.html
   - Select version with PHP 7.4 or higher

2. **Node.js** (v14 or higher)
   - Download from: https://nodejs.org/
   - LTS version recommended

3. **Git** (optional, for version control)
   - Download from: https://git-scm.com/downloads

4. **HeidiSQL** (or any MySQL client)
   - Included with XAMPP, or download separately from: https://www.heidisql.com/download.php

## Setup Steps

### 1. Install XAMPP

1. Run the XAMPP installer
2. Select at least the following components:
   - Apache
   - MySQL
   - PHP
   - phpMyAdmin
3. Complete the installation and launch XAMPP Control Panel

### 2. Clone or Download the Project

**Option A: Using Git**
```bash
cd C:\xampp\htdocs
git clone [repository-url] smart_funeral_system
```

**Option B: Manual Download**
1. Download the project as a ZIP file
2. Extract to `C:\xampp\htdocs\smart_funeral_system`

### 3. Start Apache and MySQL in XAMPP

1. Open XAMPP Control Panel
2. Click the "Start" button next to Apache and MySQL
3. Both services should show running with a green background

### 4. Set Up the Database

1. Open HeidiSQL (from XAMPP start menu or directly)
2. Connect to your local MySQL server:
   - Host: `localhost` (or `127.0.0.1`)
   - User: `root`
   - Password: (leave empty unless you set one)
   - Port: `3306` (default)
3. Follow the detailed instructions in `backend/database_setup_guide.md` to create the database and tables

### 5. Configure the Backend

The backend is already configured to work with the default XAMPP settings. The database connection settings are in `backend/db_connect.php`. 

If your MySQL setup has a different username or password, update this file:

```php
<?php
$host = "localhost";  // Change if your MySQL is on a different host
$user = "root";       // Your MySQL username
$pass = "";           // Your MySQL password
$dbname = "smart_funeral_system";
```

### 6. Set Up the Frontend

1. Open a command prompt/terminal
2. Navigate to the frontend directory:
   ```bash
   cd C:\xampp\htdocs\smart_funeral_system\frontend\my-app
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. You should see a URL where the app is running (typically http://localhost:5173)

## Testing the Installation

### Test the Backend

1. Make sure Apache and MySQL are running in XAMPP
2. Open your browser and navigate to: http://localhost/smart_funeral_system/backend/verify-auth.php
3. You should see a JSON response (likely an error about missing token, which is expected)

### Test the Frontend

1. With the frontend development server running, open http://localhost:5173
2. You should see the Smart Funeral System homepage
3. Try to log in with one of the test accounts created in the database setup:
   - Username: `testfamily`, Password: `family123`
   - Username: `testprovider`, Password: `provider123`

## Troubleshooting

### Apache Won't Start

- Check if another service is using port 80 (common with IIS or Skype)
- In XAMPP Control Panel, click "Config" next to Apache, select "httpd.conf"
- Change the port from 80 to another value (e.g., 8080)
- You'll then need to access your site at http://localhost:8080/smart_funeral_system

### MySQL Won't Start

- Check if another MySQL instance is running
- Check the XAMPP error logs for details
- Try changing the port in the MySQL configuration

### Database Connection Issues

- Verify your database exists and tables are created
- Check username/password in `db_connect.php`
- Ensure MySQL is running

### Frontend Build Issues

- Make sure you're using a compatible Node.js version
- Delete `node_modules` and reinstall:
  ```bash
  rm -rf node_modules
  npm install
  ```
- Clear npm cache:
  ```bash
  npm cache clean --force
  ```

### CORS Issues

If you're experiencing CORS errors:

1. Check that the backend PHP files include the necessary headers:
   ```php
   header("Access-Control-Allow-Origin: *");
   header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
   header("Access-Control-Allow-Headers: Content-Type, Authorization");
   ```

2. If using a different port for the frontend, you may need to update the headers to specify the exact origin.

## Development Workflow

1. Start XAMPP services (Apache and MySQL)
2. Run the frontend development server:
   ```bash
   cd frontend/my-app
   npm run dev
   ```
3. Make changes to your code
4. Frontend changes will auto-refresh in the browser
5. For backend changes, simply save the PHP files (no restart required)

## Additional Resources

- XAMPP Documentation: https://www.apachefriends.org/docs/
- React Documentation: https://reactjs.org/docs/getting-started.html
- Vite Documentation: https://vitejs.dev/guide/
- PHP Documentation: https://www.php.net/docs.php