# PortLink Orchestrator - Backend API

Digital Twin Platform for Port Operations - Backend Service

## Tech Stack

- **Framework:** NestJS 11+
- **Language:** TypeScript 5+
- **Database:** PostgreSQL 14+
- **ORM:** TypeORM
- **Caching:** Redis 7+
- **Authentication:** JWT + Passport
- **WebSocket:** Socket.io

## Prerequisites

- Node.js 20 LTS or higher
- PostgreSQL 14+ (running on localhost:5432)
- Redis 7+ (running on localhost:6379)
- npm or yarn package manager

## Installation

```bash
# Install dependencies
npm install
```

## Configuration

1. Copy the example environment file:
```bash
copy .env.example .env
```

2. Update the `.env` file with your database credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=portlink_db
```

## Database Setup

### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE portlink_db;

# Exit psql
\q
```

### Run Migrations

```bash
# The application uses synchronize in development mode
# Tables will be created automatically on first run

# For production, use migrations:
npm run migration:run
```

### Seed Initial Data

```bash
npm run seed
```

This will create:
- 4 default users (Admin, Manager, Operations, Driver)
- 12 sample assets (Cranes, Trucks, Reach Stackers, etc.)

**Default Credentials:**
- Admin: `admin@portlink.com` / `Admin@123`
- Manager: `manager@portlink.com` / `Manager@123`
- Operations: `operations@portlink.com` / `Ops@123`
- Driver: `driver@portlink.com` / `Driver@123`

## Running the Application

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at: `http://localhost:3000/api/v1`

## Database Schema

The application uses 4 PostgreSQL schemas:

- **auth:** User authentication and authorization
- **operations:** Core operational entities (Assets, ShipVisits, Schedules, Tasks)
- **simulation:** Simulation runs and conflict detection
- **analytics:** KPIs and event logs

### Entities

1. **User** (auth.users) - User accounts with RBAC
2. **Asset** (operations.assets) - Port equipment and resources
3. **ShipVisit** (operations.ship_visits) - Vessel arrival/departure tracking
4. **Schedule** (operations.schedules) - Operation schedules
5. **Task** (operations.tasks) - Individual work tasks
6. **SimulationRun** (simulation.simulation_runs) - What-if simulation scenarios
7. **Conflict** (simulation.conflicts) - Detected scheduling conflicts
8. **KPI** (analytics.kpis) - Key performance indicators
9. **EventLog** (analytics.event_logs) - System audit trail

## Project Structure

```
backend/
├── src/
│   ├── config/               # Configuration files
│   │   ├── database.config.ts
│   │   └── datasource.ts
│   ├── database/
│   │   ├── migrations/       # Database migrations
│   │   └── seeds/            # Seed data
│   ├── modules/
│   │   ├── users/            # User module
│   │   ├── assets/           # Asset management
│   │   ├── ship-visits/      # Ship visit tracking
│   │   ├── schedules/        # Schedule management
│   │   ├── tasks/            # Task management
│   │   ├── simulation/       # Simulation engine
│   │   ├── conflicts/        # Conflict detection
│   │   ├── kpis/             # KPI analytics
│   │   └── event-logs/       # Event logging
│   ├── app.module.ts         # Main application module
│   └── main.ts               # Application entry point
├── .env                      # Environment variables
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies and scripts
```

## Development

### Available Scripts

- `npm run start:dev` - Start development server with hot reload
- `npm run build` - Build production bundle
- `npm run start:prod` - Run production server
- `npm run migration:generate -- src/database/migrations/MigrationName` - Generate migration
- `npm run migration:run` - Run pending migrations
- `npm run migration:revert` - Revert last migration
- `npm run seed` - Seed database with initial data
- `npm test` - Run tests

## Phase 1 Status

✅ **Completed:**
- Project initialization with NestJS
- TypeScript configuration
- Database configuration (PostgreSQL + TypeORM)
- All 9 entity models with relationships
- Database schemas (auth, operations, simulation, analytics)
- Initial migration script
- Seed data with default users and assets
- Environment configuration

## Next Steps (Phase 2)

- Authentication module (JWT + Passport)
- User module with CRUD operations
- RBAC guards and decorators
- Common utilities and DTOs

## License

MIT
