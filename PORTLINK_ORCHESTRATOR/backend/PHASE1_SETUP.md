# Phase 1 Setup Guide - Database Configuration

## ✅ Phase 1 Completed Tasks

1. ✅ NestJS project initialized
2. ✅ All dependencies installed
3. ✅ TypeScript configured
4. ✅ Database entities created (9 entities)
5. ✅ Database configuration files created
6. ✅ Migration scripts prepared
7. ✅ Seed data scripts created
8. ✅ Application built successfully

## 🔧 Manual Setup Required

### Step 1: Configure PostgreSQL Password

Update the `.env` file with your PostgreSQL credentials:

```env
DB_PASSWORD=your_actual_postgres_password
```

### Step 2: Create Database

Option A - Using psql (if password configured):
```bash
psql -U postgres
CREATE DATABASE portlink_db;
\q
```

Option B - Using pgAdmin:
1. Open pgAdmin
2. Right-click on "Databases" → "Create" → "Database"
3. Name: `portlink_db`
4. Owner: `postgres`
5. Click "Save"

### Step 3: Initialize Database Schemas

Option A - Run SQL script:
```bash
psql -U postgres -d portlink_db -f init-database.sql
```

Option B - Run from pgAdmin:
1. Open pgAdmin
2. Select `portlink_db` database
3. Tools → Query Tool
4. Open file `init-database.sql`
5. Click Execute (F5)

### Step 4: Start Application (Auto-create tables)

```bash
npm run start:dev
```

The application will automatically create all tables because `synchronize: true` is enabled in development mode.

### Step 5: Seed Initial Data

After the application starts successfully:

```bash
# Stop the application (Ctrl+C)
npm run seed
```

This creates:
- 4 default users
- 12 sample assets

### Step 6: Verify Setup

```bash
# Restart application
npm run start:dev
```

Open browser: http://localhost:3000/api/v1

You should see a message that the API is running.

## 📊 Database Structure

After setup, you'll have:

**Schemas:**
- `auth` - User authentication
- `operations` - Core operations (Assets, Ships, Schedules, Tasks)
- `simulation` - Simulation runs and conflicts
- `analytics` - KPIs and event logs

**Tables (9 total):**
1. `auth.users` - User accounts
2. `operations.assets` - Equipment and resources
3. `operations.ship_visits` - Vessel tracking
4. `operations.schedules` - Operation schedules
5. `operations.tasks` - Work tasks
6. `simulation.simulation_runs` - Simulation scenarios
7. `simulation.conflicts` - Detected conflicts
8. `analytics.kpis` - Performance metrics
9. `analytics.event_logs` - Audit trail

## 🔐 Default Login Credentials

```
Admin:      admin@portlink.com / Admin@123
Manager:    manager@portlink.com / Manager@123
Operations: operations@portlink.com / Ops@123
Driver:     driver@portlink.com / Driver@123
```

## ✨ Next Steps (Phase 2)

Once Phase 1 setup is complete:

1. Authentication Module
   - JWT token generation
   - Login/Logout endpoints
   - Password reset

2. User Module
   - CRUD operations
   - Profile management

3. RBAC Implementation
   - Role guards
   - Permission decorators

---

**Need Help?**
- Check README.md for detailed documentation
- Review .env.example for configuration options
- Ensure PostgreSQL and Redis are running
