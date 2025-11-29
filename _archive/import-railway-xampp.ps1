# Import database using XAMPP's MySQL client through Railway tunnel

$mysqlPath = "C:\xampp\mysql\bin\mysql.exe"

if (!(Test-Path $mysqlPath)) {
    Write-Host "ERROR: MySQL client not found at $mysqlPath" -ForegroundColor Red
    Write-Host "Please make sure XAMPP is installed" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Railway Database Import" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

Write-Host "Using XAMPP MySQL client..." -ForegroundColor Green
Write-Host "Connecting via Railway tunnel...`n" -ForegroundColor Yellow

cd c:\xampp\htdocs\smart_funeral_system\backend

Write-Host "After the mysql> prompt appears, paste these commands:`n" -ForegroundColor Cyan
Write-Host "USE railway;" -ForegroundColor White
Write-Host "SOURCE c:/xampp/htdocs/smart_funeral_system/database_backup.sql;" -ForegroundColor White
Write-Host "SHOW TABLES;" -ForegroundColor White
Write-Host "SELECT COUNT(*) FROM users;" -ForegroundColor White
Write-Host "EXIT;`n" -ForegroundColor White

Read-Host "Press Enter to connect"

railway run C:\xampp\mysql\bin\mysql.exe -u root -pSjGGZXZkqBcQkvsdubCUethcNxEmxDJG railway
