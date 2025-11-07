# Demo Data Seeding Guide

## Overview
This guide explains how to populate the PortLink Orchestrator database with demo data for testing and development purposes.

## What Data is Created

### Ship Visits (9 vessels)
- **2 IN_PROGRESS**: MV Ocean Star, MV Pacific Pearl (currently at berth with ongoing operations)
- **1 ARRIVED**: MV Atlantic Queen (ready to start operations)
- **3 PLANNED**: MV Baltic Breeze, MV Indian Express, MV Mediterranean Dream (upcoming arrivals)
- **3 DEPARTED**: MV Nordic Trader, MV Asian Navigator, MV Caribbean Princess (historical data)

### Assets (16 equipment items)
- 5 Cranes (4 available/in-use, 1 in maintenance)
- 3 Reach Stackers
- 4 Trucks
- 2 Yard Tractors
- 2 Forklifts

### Schedules
Multiple operations for active ships with various statuses (IN_PROGRESS, SCHEDULED, PENDING)

### Tasks
Sample tasks linked to schedules with different statuses (IN_PROGRESS, ASSIGNED, PENDING, COMPLETED)

## How to Seed Demo Data

### Option 1: Using Batch Script (Recommended - Windows)

```batch
cd C:\Users\khvnp\Documents\Hackathon_2025\PORTLINK_ORCHESTRATOR\backend
.\seed-demo.bat
```

Enter your PostgreSQL password when prompted (default: `123`).

### Option 2: Using PowerShell Script

```powershell
cd C:\Users\khvnp\Documents\Hackathon_2025\PORTLINK_ORCHESTRATOR\backend
.\seed-demo-data.ps1
```

### Option 3: Manual SQL Execution

```powershell
# Set environment variable for password
$env:PGPASSWORD='your_password'

# Run SQL script
psql -h localhost -U postgres -d portlink_db -f seed-demo-simple.sql

# Clear password
$env:PGPASSWORD=$null
```

## After Seeding

1. **Restart Backend Server** (if running)
   ```bash
   npm run start:dev
   ```

2. **Refresh Frontend Dashboard**
   - Open browser to `http://localhost:5173`
   - You should now see:
     - Ship Visits count on Dashboard
     - Asset utilization metrics
     - Active schedules count
     - Active tasks count

3. **Navigate to Ship Visits Page**
   - Click on "Ship Visits" in the navigation
   - You will see 9 ship visits with various statuses
   - Filter by status: ALL, PLANNED, ARRIVED, IN_PROGRESS, DEPARTED

## Files Included

- `seed-demo-simple.sql` - Simplified SQL script that matches actual database schema
- `seed-demo.bat` - Windows batch script for easy execution
- `seed-demo-data.ps1` - PowerShell script with validation
- `seed-demo-data.sql` - Original comprehensive SQL (may need schema adjustments)

## Troubleshooting

### Error: Column does not exist
The entity schemas may have changed. Use `seed-demo-simple.sql` which matches the current schema.

### Error: Connection refused
Make sure PostgreSQL is running:
```powershell
Get-Service postgresql*
```

### Error: Authentication failed
Check your PostgreSQL password. Default is usually `postgres` or `123`.

### Data Not Showing in Frontend
1. Check backend console for errors
2. Open browser DevTools → Network tab
3. Verify API calls are successful (200 status)
4. Check Redux DevTools to see if data is in store

## Verification Queries

Check what was created:

```sql
-- Count ship visits by status
SELECT status, COUNT(*) 
FROM operations.ship_visits 
GROUP BY status;

-- Count assets by type and status
SELECT type, status, COUNT(*) 
FROM operations.assets 
GROUP BY type, status;

-- Count schedules by status
SELECT status, COUNT(*) 
FROM operations.schedules 
GROUP BY status;

-- Count tasks by status
SELECT status, COUNT(*) 
FROM operations.tasks 
GROUP BY status;
```

## Next Steps

After seeding demo data, you can:

1. Test the **Dashboard** - View KPIs and metrics
2. Test **Ship Visits** - Filter, search, and view details
3. Test **Schedules** - View operations timeline
4. Test **Tasks** - Monitor task progress
5. Test **Simulation** - Run what-if scenarios with the demo data
6. Test **Analytics** - Generate reports and charts

## Clearing Demo Data (Optional)

If you want to start fresh:

```sql
-- WARNING: This deletes all data!
DELETE FROM operations.tasks;
DELETE FROM operations.schedules;
DELETE FROM operations.ship_visits;
DELETE FROM operations.assets;
```

## Notes

- The demo data uses realistic ship names, IMO numbers, and voyage numbers
- Timestamps are relative to NOW() so data appears current
- Some operations are IN_PROGRESS to demonstrate real-time features
- Completion percentages vary to show progress tracking
- Historical data (DEPARTED ships) provides context for reports

---

**Last Updated**: November 5, 2025  
**Database**: portlink_db  
**Schema Version**: Latest (matches TypeORM entities)
