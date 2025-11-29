@echo off
REM ============================================================
REM EMERGENCY RECOVERY SCRIPT - Smart Funeral System
REM ============================================================
REM This script will guide you through the recovery process
REM ============================================================

echo.
echo ================================================================
echo   SMART FUNERAL SYSTEM - EMERGENCY RECOVERY
echo ================================================================
echo.

:CHECK_XAMPP
echo [STEP 1/5] Checking XAMPP installation...
if exist "C:\xampp\mysql\bin\mysql.exe" (
    echo [OK] XAMPP MySQL found!
    goto CHECK_HTDOCS
) else (
    echo [ERROR] XAMPP not found!
    echo.
    echo Please install XAMPP first:
    echo https://www.apachefriends.org/download.html
    echo.
    echo After installing XAMPP, run this script again.
    pause
    exit
)

:CHECK_HTDOCS
echo [STEP 2/5] Checking project files...
if exist "C:\xampp\htdocs\smart_funeral_system\backend\db_connect.php" (
    echo [OK] Project files found!
    goto CHECK_MYSQL
) else (
    echo [ERROR] Project files not found!
    echo.
    echo Please restore your htdocs backup to:
    echo C:\xampp\htdocs\smart_funeral_system\
    echo.
    pause
    exit
)

:CHECK_MYSQL
echo [STEP 3/5] Checking MySQL service...
netstat -an | find ":3306" >nul
if %errorlevel% equ 0 (
    echo [OK] MySQL is running!
    goto RESTORE_DB
) else (
    echo [WARNING] MySQL may not be running.
    echo.
    echo Please start MySQL from XAMPP Control Panel, then press any key...
    pause >nul
    goto CHECK_MYSQL
)

:RESTORE_DB
echo [STEP 4/5] Ready to restore database...
echo.
echo ============================================================
echo IMPORTANT: This will create/restore your database
echo Database name: smart_funeral_system
echo ============================================================
echo.
echo Choose restoration method:
echo 1. phpMyAdmin (Recommended - Opens browser)
echo 2. Command Line (Automatic)
echo 3. Skip database restoration
echo.
set /p choice="Enter your choice (1/2/3): "

if "%choice%"=="1" goto PHPMYADMIN
if "%choice%"=="2" goto CMDLINE
if "%choice%"=="3" goto VERIFY
goto RESTORE_DB

:PHPMYADMIN
echo.
echo Opening phpMyAdmin...
start http://localhost/phpmyadmin
echo.
echo ============================================================
echo MANUAL STEPS IN PHPMYADMIN:
echo ============================================================
echo 1. Click "SQL" tab at the top
echo 2. Click "Browse" or open file from:
echo    %cd%\backend\MASTER_DATABASE_RESTORATION.sql
echo 3. Copy the entire SQL content and paste in phpMyAdmin
echo 4. Click "Go" button
echo 5. Wait for success message
echo ============================================================
echo.
pause
goto VERIFY

:CMDLINE
echo.
echo [INFO] Attempting automatic database restoration...
echo.
cd /d "C:\xampp\mysql\bin"
mysql.exe -u root -e "CREATE DATABASE IF NOT EXISTS smart_funeral_system;"
if %errorlevel% equ 0 (
    echo [OK] Database created!
    echo [INFO] Importing SQL...
    mysql.exe -u root smart_funeral_system < "%cd%\backend\MASTER_DATABASE_RESTORATION.sql"
    if %errorlevel% equ 0 (
        echo [OK] Database restored successfully!
    ) else (
        echo [ERROR] Failed to import SQL. Please use phpMyAdmin method.
    )
) else (
    echo [ERROR] Failed to create database. Please use phpMyAdmin method.
)
echo.
pause
goto VERIFY

:VERIFY
echo [STEP 5/5] Verification...
echo.
echo Opening verification tools...
start http://localhost/phpmyadmin
timeout /t 2 /nobreak >nul
cd /d "%cd%"
if exist "frontend\my-app\package.json" (
    echo.
    echo [INFO] Starting frontend...
    cd frontend\my-app
    start cmd /k "npm run dev"
    cd ..\..
)
echo.
echo ============================================================
echo VERIFICATION CHECKLIST
echo ============================================================
echo.
echo In phpMyAdmin, check:
echo [ ] Database 'smart_funeral_system' exists
echo [ ] Run: SHOW TABLES; (should show 15 tables)
echo [ ] Run: SELECT COUNT(*) FROM addon_templates; (should be 49)
echo.
echo In your browser:
echo [ ] Frontend loads: http://localhost:5173
echo [ ] Backend responds: http://localhost/smart_funeral_system/backend/
echo.
echo ============================================================
goto END

:END
echo.
echo ============================================================
echo RECOVERY SCRIPT COMPLETED
echo ============================================================
echo.
echo For detailed guides, check:
echo - QUICK_RECOVERY_CHECKLIST.md
echo - DATABASE_RESTORATION_GUIDE.md  
echo - HEIDISQL_SETUP_GUIDE.md
echo.
echo If you encounter any issues:
echo 1. Check XAMPP Control Panel (Apache + MySQL running)
echo 2. Check logs: C:\xampp\mysql\data\mysql_error.log
echo 3. Review the guide files mentioned above
echo.
pause
