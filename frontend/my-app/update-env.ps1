# 🔧 Update .env.local with Correct Supabase Connection
# This script updates your .env.local with the correct Supabase connection string

$envFile = ".env.local"
$envExample = "env.example"

Write-Host "🔧 Updating .env.local with correct Supabase connection..." -ForegroundColor Green
Write-Host ""

# Check if .env.local exists
if (-not (Test-Path $envFile)) {
    Write-Host "❌ .env.local not found. Creating from env.example..." -ForegroundColor Yellow
    Copy-Item $envExample $envFile
}

# Read current .env.local
$content = Get-Content $envFile -Raw

# Update with correct Supabase connection string
$newContent = @"
# Supabase Database Configuration (Server-side only)
# These are used in Next.js API routes

# Option 1: Use full connection string (RECOMMENDED)
DATABASE_URL=postgres://postgres:9K5XOne9Fwq7Q71o@db.wtfngwbynkkmtjcsdqnw.supabase.co:5432/postgres

# Option 2: Individual variables (alternative)
DB_HOST=db.wtfngwbynkkmtjcsdqnw.supabase.co
DB_USER=postgres
DB_PASSWORD=9K5XOne9Fwq7Q71o
DB_NAME=postgres
DB_PORT=5432

# JWT Secret for authentication
JWT_SECRET=cNOruspUQwSJWt7ld2GKXqBe9vV5RoEkMz0C1gifPy8hZaIHFTnxmj4YDLb6A3

# Supabase Client Configuration (Browser-accessible)
# Variables prefixed with NEXT_PUBLIC_ are exposed to the browser
NEXT_PUBLIC_SUPABASE_URL=https://wtfngwbynkkmtjcsdqnw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0Zm5nd2J5bmtrbXRqY3NkcW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NjcwODcsImV4cCI6MjA3ODI0MzA4N30.8J-bES2J8VYbuFOb_urIK2cK0qb9QcdYqetVSE02qzE
"@

# Write updated content
Set-Content -Path $envFile -Value $newContent

Write-Host "✅ .env.local updated successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Updated configuration:" -ForegroundColor Cyan
Write-Host "   - DATABASE_URL: postgres://postgres:***@db.wtfngwbynkkmtjcsdqnw.supabase.co:5432/postgres" -ForegroundColor Gray
Write-Host "   - DB_HOST: db.wtfngwbynkkmtjcsdqnw.supabase.co (with 'db.' prefix)" -ForegroundColor Gray
Write-Host ""
Write-Host "🔄 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Restart your dev server: npm run dev" -ForegroundColor White
Write-Host "   2. Test connection: http://localhost:3000/api/backend/test-db" -ForegroundColor White
Write-Host ""

