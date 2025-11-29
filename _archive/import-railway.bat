@echo off
echo ================================
echo Railway MySQL Database Import
echo ================================
echo.
echo This will connect to Railway MySQL and import your database
echo.
pause

cd /d c:\xampp\htdocs\smart_funeral_system\backend

echo Connecting to Railway MySQL...
echo.
echo After MySQL prompt appears, copy and paste these commands:
echo.
echo USE railway;
echo SOURCE c:/xampp/htdocs/smart_funeral_system/database_backup.sql;
echo SHOW TABLES;
echo SELECT COUNT(*) FROM users;
echo EXIT;
echo.
pause

railway run mysql -u root -p"SjGGZXZkqBcQkvsdubCUethcNxEmxDJG" railway
