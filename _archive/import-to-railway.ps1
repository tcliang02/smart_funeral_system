# Import Database to Railway MySQL
# Run this script after starting XAMPP MySQL

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Railway Database Import" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Railway MySQL Credentials
$MYSQL_HOST = "mysql.railway.internal"
$MYSQL_USER = "root"
$MYSQL_PASSWORD = "SjGGZXZkqBcQkvsdubCUethcNxEmxDJG"
$MYSQL_DATABASE = "railway"
$MYSQL_PORT = "3306"

# Note: mysql.railway.internal only works from within Railway
# We need to use Railway CLI to import

Write-Host "[Step 1/3] Checking database backup..." -ForegroundColor Yellow
$backupFile = "c:\xampp\htdocs\smart_funeral_system\database_backup.sql"

if (Test-Path $backupFile) {
    Write-Host "✅ Database backup found!`n" -ForegroundColor Green
} else {
    Write-Host "❌ Database backup not found!" -ForegroundColor Red
    Write-Host "Creating backup now..." -ForegroundColor Yellow
    
    Write-Host "Starting XAMPP MySQL required!" -ForegroundColor Red
    Read-Host "Press Enter when MySQL is running"
    
    C:\xampp\mysql\bin\mysqldump.exe -u root smart_funeral_system > $backupFile
    
    if (Test-Path $backupFile) {
        Write-Host "✅ Database exported!`n" -ForegroundColor Green
    } else {
        Write-Host "❌ Export failed!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "[Step 2/3] Connecting to Railway..." -ForegroundColor Yellow
Write-Host "This will open a MySQL connection via Railway CLI`n" -ForegroundColor Cyan

# Change to backend directory where railway is linked
cd c:\xampp\htdocs\smart_funeral_system\backend

Write-Host "Running: railway connect MySQL" -ForegroundColor Gray
Write-Host "After connection opens, run these commands:" -ForegroundColor Cyan
Write-Host "  USE railway;" -ForegroundColor White
Write-Host "  SOURCE c:/xampp/htdocs/smart_funeral_system/database_backup.sql;" -ForegroundColor White
Write-Host "  SHOW TABLES;" -ForegroundColor White
Write-Host "  EXIT;`n" -ForegroundColor White

Read-Host "Press Enter to open Railway MySQL connection"

railway connect MySQL

Write-Host "`n================================" -ForegroundColor Green
Write-Host "Database import instructions shown above!" -ForegroundColor Green
Write-Host "================================`n" -ForegroundColor Green
