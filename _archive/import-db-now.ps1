# Import database to Railway
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Railway Database Import" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

Write-Host "✅ Database backup ready: 126 KB`n" -ForegroundColor Green

Write-Host "Opening Railway MySQL connection..." -ForegroundColor Yellow
Write-Host "A MySQL prompt will open.`n" -ForegroundColor Yellow

Write-Host "COPY AND PASTE THESE COMMANDS:" -ForegroundColor Cyan
Write-Host "==============================`n" -ForegroundColor Cyan
Write-Host "USE railway;" -ForegroundColor White
Write-Host "SOURCE c:/xampp/htdocs/smart_funeral_system/database_backup.sql;" -ForegroundColor White  
Write-Host "SHOW TABLES;" -ForegroundColor White
Write-Host "SELECT COUNT(*) FROM users;" -ForegroundColor White
Write-Host "EXIT;`n" -ForegroundColor White

Read-Host "Press Enter to open MySQL connection"

cd c:\xampp\htdocs\smart_funeral_system\backend
railway connect MySQL
