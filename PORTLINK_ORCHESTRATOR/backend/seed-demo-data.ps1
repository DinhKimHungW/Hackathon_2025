# Seed Demo Data Script for PortLink Orchestrator
# This script populates the database with comprehensive demo data

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PortLink Orchestrator - Demo Data Seeder" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Database configuration
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_NAME = "portlink_db"
$DB_USER = "postgres"

Write-Host "Database Configuration:" -ForegroundColor Yellow
Write-Host "  Host: $DB_HOST"
Write-Host "  Port: $DB_PORT"
Write-Host "  Database: $DB_NAME"
Write-Host "  User: $DB_USER`n"

# Check if psql is available
try {
    $psqlVersion = psql --version 2>&1
    Write-Host "PostgreSQL client found: $psqlVersion`n" -ForegroundColor Green
}
catch {
    Write-Host "Error: PostgreSQL client psql not found!" -ForegroundColor Red
    Write-Host "Please install PostgreSQL client tools and add to PATH.`n" -ForegroundColor Yellow
    exit 1
}

# Confirm before proceeding
Write-Host "This script will:" -ForegroundColor Yellow
Write-Host "  1. Insert demo ship visits - 9 vessels with various statuses"
Write-Host "  2. Insert demo assets - 16 pieces of equipment"
Write-Host "  3. Insert demo schedules - operations for ships"
Write-Host "  4. Insert demo tasks - ongoing and completed tasks"
Write-Host ""
Write-Host "WARNING: This will add data to your database!" -ForegroundColor Red
$confirm = Read-Host "Do you want to continue? (yes/no)"

if ($confirm -ne "yes") {
    Write-Host "`nOperation cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host "`nStarting demo data seeding...`n" -ForegroundColor Cyan

# Run the SQL script
$scriptPath = Join-Path $PSScriptRoot "seed-demo-data.sql"

if (-not (Test-Path $scriptPath)) {
    Write-Host "Error: seed-demo-data.sql not found at: $scriptPath" -ForegroundColor Red
    exit 1
}

Write-Host "Executing SQL script: $scriptPath`n" -ForegroundColor Green

# Execute the script using environment variable for password
$securePassword = Read-Host "Enter PostgreSQL password for user '$DB_USER'" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
$env:PGPASSWORD = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)

try {
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $scriptPath
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n========================================" -ForegroundColor Green
        Write-Host "Demo data seeded successfully!" -ForegroundColor Green
        Write-Host "========================================`n" -ForegroundColor Green
        
        Write-Host "Summary of created data:" -ForegroundColor Cyan
        Write-Host "  * Ship Visits: 9 vessels" -ForegroundColor White
        Write-Host "    - 2 IN_PROGRESS currently at berth"
        Write-Host "    - 1 ARRIVED ready for operations"
        Write-Host "    - 3 PLANNED upcoming arrivals"
        Write-Host "    - 3 DEPARTED historical data"
        Write-Host ""
        Write-Host "  * Assets: 16 equipment items" -ForegroundColor White
        Write-Host "    - 5 Cranes - 4 available or in-use, 1 maintenance"
        Write-Host "    - 3 Reach Stackers"
        Write-Host "    - 4 Trucks"
        Write-Host "    - 2 Yard Tractors"
        Write-Host "    - 2 Forklifts"
        Write-Host ""
        Write-Host "  * Schedules: 15-20 operations" -ForegroundColor White
        Write-Host "    - Mixed status: IN_PROGRESS, SCHEDULED, PENDING"
        Write-Host ""
        Write-Host "  * Tasks: 8 tasks" -ForegroundColor White
        Write-Host "    - IN_PROGRESS, ASSIGNED, PENDING, COMPLETED"
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "  1. Restart your backend server if running"
        Write-Host "  2. Refresh your frontend dashboard"
        Write-Host "  3. Navigate to Ship Visits page to see the data"
        Write-Host ""
    }
    else {
        Write-Host "`nError seeding demo data. Check the output above for details." -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "`nError executing SQL script:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
finally {
    # Clear password from environment
    $env:PGPASSWORD = $null
}

Write-Host "Done!`n" -ForegroundColor Cyan
