@echo off
echo ========================================
echo PortLink - Seed Demo Data
echo ========================================
echo.

set /p DB_PASSWORD="Enter PostgreSQL password: "

echo Running SQL script...
set PGPASSWORD=%DB_PASSWORD%
psql -h localhost -U postgres -d portlink_db -f seed-demo-simple.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Success! Demo data has been created.
    echo ========================================
    echo.
    echo Created:
    echo   - 9 Ship Visits
    echo   - 16 Assets
    echo   - Multiple Schedules
    echo   - Sample Tasks
    echo.
    echo Next steps:
    echo   1. Restart backend server if running
    echo   2. Refresh frontend dashboard
    echo   3. View Ship Visits page
    echo.
) else (
    echo.
    echo Error occurred. Check the output above.
)

set PGPASSWORD=
pause
