# 🔧 Fresh Start - Setup .env.local with Correct Supabase Connection

$envFile = ".env.local"

Write-Host "🚀 Fresh Start - Setting up .env.local..." -ForegroundColor Green
Write-Host ""

# Create .env.local with correct Supabase connection
$envContent = @"
# Supabase Database Connection
# Using connection string from Supabase Dashboard
DATABASE_URL=postgres://postgres:9K5XOne9Fwq7Q71o@db.wtfngwbynkkmtjcsdqnw.supabase.co:5432/postgres

# Alternative: Individual variables (backup method)
DB_HOST=db.wtfngwbynkkmtjcsdqnw.supabase.co
DB_USER=postgres
DB_PASSWORD=9K5XOne9Fwq7Q71o
DB_NAME=postgres
DB_PORT=5432

# JWT Secret for authentication
JWT_SECRET=cNOruspUQwSJWt7ld2GKXqBe9vV5RoEkMz0C1gifPy8hZaIHFTnxmj4YDLb6A3

# Supabase Client Configuration (Browser-accessible)
NEXT_PUBLIC_SUPABASE_URL=https://wtfngwbynkkmtjcsdqnw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0Zm5nd2J5bmtrbXRqY3NkcW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NjcwODcsImV4cCI6MjA3ODI0MzA4N30.8J-bES2J8VYbuFOb_urIK2cK0qb9QcdYqetVSE02qzE
"@

# Write to file
Set-Content -Path $envFile -Value $envContent

Write-Host "✅ .env.local created/updated successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Configuration:" -ForegroundColor Cyan
Write-Host "   ✅ DATABASE_URL: postgres://postgres:***@db.wtfngwbynkkmtjcsdqnw.supabase.co:5432/postgres" -ForegroundColor Gray
Write-Host "   ✅ DB_HOST: db.wtfngwbynkkmtjcsdqnw.supabase.co (with 'db.' prefix)" -ForegroundColor Gray
Write-Host "   ✅ All environment variables set" -ForegroundColor Gray
Write-Host ""
Write-Host "🔄 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Restart dev server: npm run dev" -ForegroundColor White
Write-Host "   2. Test connection: http://localhost:3000/api/backend/test-db" -ForegroundColor White
Write-Host "   3. If successful, import database tables to Supabase" -ForegroundColor White
Write-Host ""

