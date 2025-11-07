# PORTLINK ORCHESTRATOR - DEVELOPMENT OUTLINE

**Project:** PortLink Orchestrator - Digital Twin Platform  
**Version:** 1.0  
**Date:** 02/11/2025  
**Status:** Development Blueprint - Part 1/3

---

## 📋 TABLE OF CONTENTS

### Part 1 (This Document)
1. [Overview & Development Strategy](#1-overview--development-strategy)
2. [Prerequisites & Environment Setup](#2-prerequisites--environment-setup)
3. [Phase 1: Database & Data Layer](#phase-1-database--data-layer)
4. [Phase 2: Backend Foundation](#phase-2-backend-foundation)

### Part 2 (Coming Next)
5. Phase 3: Core Business Logic
6. Phase 4: Simulation Engine & What-If

### Part 3 (Coming Last)
7. Phase 5: Frontend Development
8. Phase 6: Integration & Deployment
9. Phase 7: Testing & Production Launch

---

## 1. Overview & Development Strategy

### 1.1. Development Philosophy

**🎯 Core Principles:**
- **Document-Driven Development (DDD):** Every feature must map to requirements in PortLinkSRS.md
- **Test-Driven Development (TDD):** Write tests before implementation
- **Incremental Delivery:** Each phase produces a working, testable artifact
- **Security First:** Implement authentication, authorization, and validation from day 1

**📊 Success Criteria:**
Each phase is considered complete when:
- ✅ All functional requirements (RQF-xxx) are implemented
- ✅ All non-functional requirements (RQN-xxx) are met
- ✅ Unit tests coverage ≥ 80%
- ✅ Integration tests pass
- ✅ Code review completed
- ✅ Documentation updated

### 1.2. Document Reading Guide for AI Agents

**🔍 How to Use the Documents:**

```
STEP 1: Understand Requirements
├── Read: PortLinkSRS.md
│   ├── Section 5: Functional Requirements (RQF-001 to RQF-018)
│   ├── Section 6: Non-Functional Requirements (RQN-001 to RQN-010)
│   └── Section 4: Personas (P-1, P-2, P-3, P-4)
│
STEP 2: Understand Architecture
├── Read: System_Architecture_Document.md
│   ├── Section 2: High-Level Architecture
│   ├── Section 3: Technology Stack
│   └── Section 4: System Layers & Components
│
STEP 3: Understand Database Design
├── Read: Database_Design_Document.md
│   ├── Section 3.1-3.4: All Tables & Schemas
│   ├── Section 4: Indexes
│   └── Section 5: Constraints
│
STEP 4: Understand API Contracts
├── Read: API_Specification_Document.md
│   ├── Section 3: Authentication & Authorization
│   ├── Section 5-6: Auth & User Management APIs
│   └── All endpoints with request/response schemas
│
STEP 5: Understand Deployment
├── Read: Deployment_Plan_Document.md
│   ├── Section 4: Docker Configuration
│   ├── Section 8: Environment Configuration
│   └── Section 9: Database Migration
│
STEP 6: Understand User Experience
└── Read: User_Manual_Guide.md
    ├── Section 5-8: Persona-specific guides
    └── Section 9-11: Advanced features
```

**🎓 Key Requirements Mapping:**

| Requirement | Source Document | Implementation Phase |
|-------------|----------------|---------------------|
| RQF-001 to RQF-004 | PortLinkSRS.md § 5.1 | Phase 2 (Auth Module) |
| RQF-005 to RQF-007 | PortLinkSRS.md § 5.2 | Phase 5 (Dashboard UI) |
| RQF-008 to RQF-013 | PortLinkSRS.md § 5.3 | Phase 4 (Simulation) |
| RQF-014 to RQF-015 | PortLinkSRS.md § 5.4 | Phase 3 (Notification) |
| RQF-016 to RQF-018 | PortLinkSRS.md § 5.5 | Phase 6 (Integration) |
| RQN-001 | PortLinkSRS.md § 6 | Phase 4 (Performance) |
| RQN-002 | PortLinkSRS.md § 6 | Phase 3 (WebSocket) |
| RQN-003 to RQN-004 | PortLinkSRS.md § 6 | Phase 5 (UI/UX) |

### 1.3. Technology Stack Summary

**Backend:**
- **Runtime:** Node.js 20 LTS
- **Framework:** NestJS 10+ (TypeScript)
- **Database:** PostgreSQL 14+
- **Cache:** Redis 7+
- **Real-time:** Socket.io
- **ORM:** TypeORM
- **Validation:** class-validator, class-transformer
- **Auth:** JWT (jsonwebtoken), bcrypt

**Frontend:**
- **Framework:** React 18+ (TypeScript)
- **State Management:** Redux Toolkit + RTK Query
- **UI Library:** Material-UI (MUI) v5
- **Charts:** D3.js, Recharts
- **Gantt:** Bryntum Gantt or DHTMLX Gantt
- **Real-time:** Socket.io-client
- **Forms:** React Hook Form + Yup

**DevOps:**
- **Containerization:** Docker, Docker Compose
- **Web Server:** Nginx
- **CI/CD:** GitHub Actions
- **Monitoring:** Prometheus + Grafana (Optional)

### 1.4. Development Timeline

```
┌─────────────────────────────────────────────────────────────────┐
│                     8-Week Development Plan                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Week 1-2: Phase 1 + Phase 2                                     │
│   ├── Database setup (3 days)                                   │
│   ├── Backend foundation (4 days)                               │
│   └── Auth module (4 days)                                      │
│                                                                  │
│ Week 3-4: Phase 3                                               │
│   ├── Operations module (5 days)                                │
│   ├── WebSocket real-time (3 days)                              │
│   └── Notification module (2 days)                              │
│                                                                  │
│ Week 5: Phase 4                                                 │
│   ├── Simulation engine (4 days)                                │
│   └── Conflict detection (3 days)                               │
│                                                                  │
│ Week 6-7: Phase 5                                               │
│   ├── Frontend foundation (3 days)                              │
│   ├── Dashboard + Gantt (4 days)                                │
│   ├── What-If UI (3 days)                                       │
│   └── Mobile responsive (2 days)                                │
│                                                                  │
│ Week 8: Phase 6 + Phase 7                                       │
│   ├── TOS integration (2 days)                                  │
│   ├── Deployment setup (2 days)                                 │
│   ├── E2E testing (2 days)                                      │
│   └── Production launch (1 day)                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Prerequisites & Environment Setup

### 2.1. Development Environment Setup

**📦 Install Required Software:**

```bash
# 1. Install Node.js 20 LTS
# Download from: https://nodejs.org/

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x

# 2. Install PostgreSQL 14+
# Windows: https://www.postgresql.org/download/windows/
# macOS: brew install postgresql@14
# Linux: sudo apt install postgresql-14

# Verify PostgreSQL
psql --version  # Should show 14.x

# 3. Install Redis
# Windows: https://github.com/microsoftarchive/redis/releases
# macOS: brew install redis
# Linux: sudo apt install redis-server

# Verify Redis
redis-server --version  # Should show 7.x

# 4. Install Docker (Optional, for production-like env)
# Download from: https://www.docker.com/products/docker-desktop/

# Verify Docker
docker --version
docker-compose --version

# 5. Install Git
git --version

# 6. Install VS Code (Recommended IDE)
# Download from: https://code.visualstudio.com/
```

**🔧 VS Code Extensions (Recommended):**

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "christian-kohler.path-intellisense",
    "ms-azuretools.vscode-docker",
    "ckolkman.vscode-postgres",
    "rvest.vs-code-prettier-eslint"
  ]
}
```

### 2.2. Project Structure Creation

**📁 Create Project Directories:**

```bash
# Navigate to workspace
cd c:/Users/khvnp/Documents/Hackathon_2025

# Create project root
mkdir -p portlink-orchestrator
cd portlink-orchestrator

# Create backend structure
mkdir -p backend/src/{auth,users,operations,simulation,analytics,integration,notifications,common}
mkdir -p backend/src/common/{decorators,filters,guards,interceptors,pipes,utils}
mkdir -p backend/test/{unit,integration,e2e}
mkdir -p backend/database/{migrations,seeds}

# Create frontend structure
mkdir -p frontend/src/{components,pages,services,store,types,utils,assets}
mkdir -p frontend/src/components/{common,dashboard,gantt,simulation,admin}
mkdir -p frontend/public

# Create deployment files
mkdir -p deployment/{docker,nginx,scripts}

# Create documentation (copy from current location)
mkdir -p docs
```

**Final Project Structure:**

```
portlink-orchestrator/
├── backend/
│   ├── src/
│   │   ├── auth/                    # Authentication module
│   │   ├── users/                   # User management
│   │   ├── operations/              # Port operations (vessels, berths, tasks)
│   │   ├── simulation/              # What-If simulation engine
│   │   ├── analytics/               # KPIs, metrics, reports
│   │   ├── integration/             # TOS integration
│   │   ├── notifications/           # Event logs, alerts
│   │   ├── common/                  # Shared utilities
│   │   │   ├── decorators/
│   │   │   ├── filters/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   ├── pipes/
│   │   │   └── utils/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── test/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeds/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── .eslintrc.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/              # Reusable components
│   │   │   ├── dashboard/           # Digital Twin dashboard
│   │   │   ├── gantt/               # Gantt chart components
│   │   │   ├── simulation/          # What-If simulation UI
│   │   │   └── admin/               # Admin panel
│   │   ├── pages/
│   │   ├── services/                # API services
│   │   ├── store/                   # Redux store
│   │   ├── types/                   # TypeScript types
│   │   ├── utils/                   # Utility functions
│   │   ├── assets/                  # Images, icons
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .env.example
│
├── deployment/
│   ├── docker/
│   │   ├── Dockerfile.backend
│   │   ├── Dockerfile.frontend
│   │   └── docker-compose.yml
│   ├── nginx/
│   │   └── nginx.conf
│   └── scripts/
│       ├── setup.sh
│       └── deploy.sh
│
├── docs/                            # Copy all .md files here
│   ├── PortLinkSRS.md
│   ├── System_Architecture_Document.md
│   ├── Database_Design_Document.md
│   ├── API_Specification_Document.md
│   ├── Deployment_Plan_Document.md
│   └── User_Manual_Guide.md
│
├── .gitignore
├── README.md
└── Dev_outline.md (this file)
```

### 2.3. Initialize Git Repository

```bash
# Initialize Git
git init

# Create .gitignore
cat > .gitignore << 'EOF'
# Node modules
node_modules/
npm-debug.log*

# Environment variables
.env
.env.local
.env.*.local

# Build outputs
dist/
build/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Database
*.sqlite
*.db

# Test coverage
coverage/
.nyc_output/
EOF

# Create README.md
cat > README.md << 'EOF'
# PortLink Orchestrator - Digital Twin Platform

## Overview
Digital Twin platform for port operations management.

## Getting Started
See `Dev_outline.md` for development guide.

## Documentation
- [System Requirements](docs/PortLinkSRS.md)
- [Architecture](docs/System_Architecture_Document.md)
- [API Specification](docs/API_Specification_Document.md)
- [Database Design](docs/Database_Design_Document.md)
- [Deployment Guide](docs/Deployment_Plan_Document.md)
- [User Manual](docs/User_Manual_Guide.md)
EOF

# Initial commit
git add .
git commit -m "Initial project structure"
```

---

## PHASE 1: Database & Data Layer

**📅 Duration:** 3 days  
**🎯 Goal:** Setup PostgreSQL database with all tables, relationships, indexes, and constraints as per Database_Design_Document.md

### Phase 1.1: Database Setup (Day 1)

**📖 Reference Documents:**
- Database_Design_Document.md § 2 (Architecture)
- Database_Design_Document.md § 3 (Tables)
- Deployment_Plan_Document.md § 9 (Database Setup)

**✅ Tasks:**

#### Task 1.1.1: Install and Configure PostgreSQL

```bash
# 1. Create PostgreSQL database
psql -U postgres

CREATE DATABASE portlink_orchestrator_dev;
CREATE DATABASE portlink_orchestrator_test;

# 2. Create database user
CREATE USER portlink_admin WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE portlink_orchestrator_dev TO portlink_admin;
GRANT ALL PRIVILEGES ON DATABASE portlink_orchestrator_test TO portlink_admin;

# 3. Enable required extensions
\c portlink_orchestrator_dev
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

\c portlink_orchestrator_test
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

\q
```

#### Task 1.1.2: Setup Backend Project with TypeORM

```bash
cd backend

# Initialize Node.js project
npm init -y

# Install NestJS CLI globally
npm install -g @nestjs/cli

# Create NestJS project
nest new . --package-manager npm

# Install database dependencies
npm install --save @nestjs/typeorm typeorm pg
npm install --save @nestjs/config
npm install --save class-validator class-transformer

# Install dev dependencies
npm install --save-dev @types/node
```

#### Task 1.1.3: Configure TypeORM Connection

**Create: `backend/src/config/database.config.ts`**

```typescript
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('DB_HOST', 'localhost'),
  port: configService.get('DB_PORT', 5432),
  username: configService.get('DB_USERNAME', 'portlink_admin'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_NAME', 'portlink_orchestrator_dev'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  synchronize: false, // Never use true in production
  logging: configService.get('NODE_ENV') === 'development',
  ssl: configService.get('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
});
```

**Create: `backend/.env.example`**

```bash
# Application
NODE_ENV=development
PORT=4000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=portlink_admin
DB_PASSWORD=your_secure_password
DB_NAME=portlink_orchestrator_dev
DB_SSL=false

# JWT
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# CORS
CORS_ORIGIN=http://localhost:5173
```

**Create: `backend/.env`** (copy from .env.example and fill values)

#### Task 1.1.4: Update app.module.ts

**Update: `backend/src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

**✅ Verification:**

```bash
# Start the app (should connect to DB without errors)
npm run start:dev

# You should see:
# [Nest] LOG [TypeOrmModule] Mapped {User, Asset, ShipVisit, ...} entities
# [Nest] LOG [NestApplication] Nest application successfully started
```

### Phase 1.2: Entity Creation - Auth Schema (Day 1)

**📖 Reference:** Database_Design_Document.md § 3.1

**✅ Tasks:**

#### Task 1.2.1: Create User Entity

**Create: `backend/src/users/entities/user.entity.ts`**

```typescript
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  OPERATIONS = 'OPERATIONS',
  DRIVER = 'DRIVER',
}

@Entity('users', { schema: 'auth' })
@Index('idx_users_email', ['email'], { where: 'deleted_at IS NULL' })
@Index('idx_users_username', ['username'], { where: 'deleted_at IS NULL' })
@Index('idx_users_role', ['role'], { where: 'deleted_at IS NULL' })
@Index('idx_users_active', ['isActive'], { where: 'deleted_at IS NULL' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, select: false })
  passwordHash: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  fullName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.OPERATIONS,
  })
  role: UserRole;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 10, default: 'vi' })
  preferredLanguage: string;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @Column({ type: 'inet', nullable: true })
  lastLoginIp: string;

  @Column({ type: 'int', default: 0 })
  failedLoginAttempts: number;

  @Column({ type: 'timestamp', nullable: true })
  accountLockedUntil: Date;

  @Column({ type: 'boolean', default: false })
  isTwoFactorEnabled: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  twoFactorSecret: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ type: 'uuid', nullable: true })
  updatedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by_id' })
  updatedBy: User;

  @Column({ type: 'uuid', nullable: true })
  deletedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'deleted_by_id' })
  deletedBy: User;
}
```

#### Task 1.2.2: Create RefreshToken Entity

**Create: `backend/src/auth/entities/refresh-token.entity.ts`**

```typescript
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('refresh_tokens', { schema: 'auth' })
@Index('idx_refresh_tokens_user', ['userId'])
@Index('idx_refresh_tokens_expires', ['expiresAt'])
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 500 })
  token: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'boolean', default: false })
  isRevoked: boolean;

  @Column({ type: 'inet', nullable: true })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
```

#### Task 1.2.3: Create AuditLog Entity

**Create: `backend/src/auth/entities/audit-log.entity.ts`**

```typescript
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum AuditAction {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  ACCESS_DENIED = 'ACCESS_DENIED',
}

@Entity('audit_logs', { schema: 'auth' })
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: AuditAction })
  action: AuditAction;

  @Column({ type: 'varchar', length: 100 })
  entityType: string;

  @Column({ type: 'uuid', nullable: true })
  entityId: string;

  @Column({ type: 'jsonb', nullable: true })
  oldValues: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  newValues: Record<string, any>;

  @Column({ type: 'inet', nullable: true })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
```

**✅ Verification:**

```bash
# Generate migration
npm run typeorm migration:generate -- -n CreateAuthSchema

# Run migration
npm run typeorm migration:run

# Check database
psql -U portlink_admin -d portlink_orchestrator_dev
\dt auth.*

# You should see:
# auth.users
# auth.refresh_tokens
# auth.audit_logs
```

### Phase 1.3: Entity Creation - Operations Schema (Day 2)

**📖 Reference:** Database_Design_Document.md § 3.2

**✅ Tasks:**

#### Task 1.3.1: Create Asset Entity

**Create: `backend/src/operations/entities/asset.entity.ts`**

```typescript
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum AssetType {
  BERTH = 'BERTH',
  CRANE = 'CRANE',
  YARD = 'YARD',
  TRUCK = 'TRUCK',
}

export enum AssetStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE',
}

@Entity('assets', { schema: 'operations' })
@Index('idx_assets_type', ['type'], { where: 'deleted_at IS NULL' })
@Index('idx_assets_status', ['status'], { where: 'deleted_at IS NULL' })
@Index('idx_assets_code', ['code'], { where: 'deleted_at IS NULL' })
@Index('idx_assets_zone', ['zone'], { where: 'deleted_at IS NULL' })
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'enum', enum: AssetType })
  type: AssetType;

  @Column({ type: 'enum', enum: AssetStatus, default: AssetStatus.AVAILABLE })
  status: AssetStatus;

  @Column({ type: 'varchar', length: 50, nullable: true })
  zone: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  longitude: number;

  @Column({ type: 'jsonb', nullable: true })
  specifications: {
    maxDraft?: number;
    maxLOA?: number;
    craneCapacity?: number;
    craneReach?: number;
    [key: string]: any;
  };

  @Column({ type: 'int', nullable: true })
  maxCapacity: number;

  @Column({ type: 'int', nullable: true })
  currentOccupancy: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ type: 'uuid', nullable: true })
  updatedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by_id' })
  updatedBy: User;

  @Column({ type: 'uuid', nullable: true })
  deletedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'deleted_by_id' })
  deletedBy: User;
}
```

#### Task 1.3.2: Create ShipVisit Entity

**Create: `backend/src/operations/entities/ship-visit.entity.ts`**

```typescript
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ShipVisitStatus {
  PLANNED = 'PLANNED',
  APPROACHING = 'APPROACHING',
  BERTHED = 'BERTHED',
  WORKING = 'WORKING',
  COMPLETED = 'COMPLETED',
  DEPARTED = 'DEPARTED',
  CANCELLED = 'CANCELLED',
}

export enum WorkType {
  LOADING = 'LOADING',
  UNLOADING = 'UNLOADING',
  BOTH = 'BOTH',
}

@Entity('ship_visits', { schema: 'operations' })
@Index('idx_ship_visits_eta', ['etaTos'])
@Index('idx_ship_visits_status', ['status'])
@Index('idx_ship_visits_ship_name', ['shipName'])
@Index('idx_ship_visits_tos_ref', ['tosReference'])
@Index('idx_ship_visits_work_type', ['workType'])
export class ShipVisit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  shipName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  imoNumber: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  vesselType: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  loa: number; // Length Overall

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  draft: number;

  @Column({ type: 'int', nullable: true })
  grossTonnage: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  tosReference: string;

  @Column({ type: 'timestamp' })
  etaTos: Date; // ETA from TOS

  @Column({ type: 'timestamp', nullable: true })
  etaActual: Date; // Actual ETA

  @Column({ type: 'timestamp', nullable: true })
  ataBerthing: Date; // Actual Time of Arrival

  @Column({ type: 'timestamp', nullable: true })
  atdBerthing: Date; // Actual Time of Departure

  @Column({ type: 'enum', enum: ShipVisitStatus, default: ShipVisitStatus.PLANNED })
  status: ShipVisitStatus;

  @Column({ type: 'enum', enum: WorkType })
  workType: WorkType;

  @Column({ type: 'int', nullable: true })
  cargoQuantity: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  cargoType: string;

  @Column({ type: 'text', nullable: true })
  specialRequirements: string;

  @Column({ type: 'int', nullable: true })
  estimatedWorkingHours: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ type: 'uuid', nullable: true })
  updatedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by_id' })
  updatedBy: User;
}
```

#### Task 1.3.3: Create Schedule Entity

**Create: `backend/src/operations/entities/schedule.entity.ts`**

```typescript
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Task } from './task.entity';

@Entity('schedules', { schema: 'operations' })
@Index('idx_schedules_active', ['isActive'])
@Index('idx_schedules_simulation', ['isSimulation'])
@Index('idx_schedules_time_range', ['startTime', 'endTime'])
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isSimulation: boolean;

  @Column({ type: 'uuid', nullable: true })
  baseScheduleId: string; // Reference to original schedule if this is a simulation

  @ManyToOne(() => Schedule, { nullable: true })
  @JoinColumn({ name: 'base_schedule_id' })
  baseSchedule: Schedule;

  @Column({ type: 'varchar', length: 50, nullable: true })
  version: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @OneToMany(() => Task, task => task.schedule)
  tasks: Task[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ type: 'uuid', nullable: true })
  updatedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by_id' })
  updatedBy: User;
}
```

#### Task 1.3.4: Create Task Entity

**Create: `backend/src/operations/entities/task.entity.ts`**

```typescript
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  Check,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Schedule } from './schedule.entity';
import { ShipVisit } from './ship-visit.entity';
import { Asset } from './asset.entity';

export enum TaskType {
  BERTHING = 'BERTHING',
  LOADING = 'LOADING',
  UNLOADING = 'UNLOADING',
  UNBERTHING = 'UNBERTHING',
  MAINTENANCE = 'MAINTENANCE',
}

export enum TaskStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DELAYED = 'DELAYED',
}

@Entity('tasks', { schema: 'operations' })
@Index('idx_tasks_schedule', ['scheduleId'])
@Index('idx_tasks_ship_visit', ['shipVisitId'])
@Index('idx_tasks_berth', ['berthId'])
@Index('idx_tasks_crane', ['craneId'])
@Index('idx_tasks_time_range', ['startTimePredicted', 'endTimePredicted'])
@Index('idx_tasks_status', ['status'])
@Check(`"berth_id" IS NOT NULL OR "crane_id" IS NOT NULL`)
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  scheduleId: string;

  @ManyToOne(() => Schedule, schedule => schedule.tasks)
  @JoinColumn({ name: 'schedule_id' })
  schedule: Schedule;

  @Column({ type: 'uuid' })
  shipVisitId: string;

  @ManyToOne(() => ShipVisit)
  @JoinColumn({ name: 'ship_visit_id' })
  shipVisit: ShipVisit;

  @Column({ type: 'uuid', nullable: true })
  berthId: string;

  @ManyToOne(() => Asset, { nullable: true })
  @JoinColumn({ name: 'berth_id' })
  berth: Asset;

  @Column({ type: 'uuid', nullable: true })
  craneId: string;

  @ManyToOne(() => Asset, { nullable: true })
  @JoinColumn({ name: 'crane_id' })
  crane: Asset;

  @Column({ type: 'enum', enum: TaskType })
  type: TaskType;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.PENDING })
  status: TaskStatus;

  @Column({ type: 'timestamp' })
  startTimePredicted: Date;

  @Column({ type: 'timestamp' })
  endTimePredicted: Date;

  @Column({ type: 'timestamp', nullable: true })
  startTimeActual: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTimeActual: Date;

  @Column({ type: 'uuid', nullable: true })
  assignedToId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_to_id' })
  assignedTo: User;

  @Column({ type: 'int', nullable: true })
  priority: number; // 1 = highest

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  dependencies: {
    predecessorTaskIds?: string[];
    successorTaskIds?: string[];
  };

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ type: 'uuid', nullable: true })
  updatedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by_id' })
  updatedBy: User;
}
```

### Phase 1.4: Entity Creation - Simulation Schema (Day 2)

**📖 Reference:** Database_Design_Document.md § 3.3

#### Task 1.4.1: Create SimulationRun Entity

**Create: `backend/src/simulation/entities/simulation-run.entity.ts`**

```typescript
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Schedule } from '../../operations/entities/schedule.entity';

export enum SimulationStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('simulation_runs', { schema: 'simulation' })
@Index('idx_simulation_runs_status', ['status'])
@Index('idx_simulation_runs_created_at', ['createdAt'])
export class SimulationRun {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'uuid' })
  baseScheduleId: string;

  @ManyToOne(() => Schedule)
  @JoinColumn({ name: 'base_schedule_id' })
  baseSchedule: Schedule;

  @Column({ type: 'uuid', nullable: true })
  resultScheduleId: string;

  @ManyToOne(() => Schedule, { nullable: true })
  @JoinColumn({ name: 'result_schedule_id' })
  resultSchedule: Schedule;

  @Column({ type: 'jsonb' })
  scenario: {
    type: 'delay' | 'maintenance' | 'custom';
    changes: Array<{
      entityType: 'ship_visit' | 'asset';
      entityId: string;
      field: string;
      oldValue: any;
      newValue: any;
    }>;
  };

  @Column({ type: 'enum', enum: SimulationStatus, default: SimulationStatus.PENDING })
  status: SimulationStatus;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'int', nullable: true })
  executionTimeMs: number;

  @Column({ type: 'jsonb', nullable: true })
  results: {
    conflictsDetected?: number;
    tasksAffected?: number;
    recommendations?: Array<{
      type: string;
      description: string;
      impact: string;
    }>;
  };

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;
}
```

#### Task 1.4.2: Create Conflict Entity

**Create: `backend/src/simulation/entities/conflict.entity.ts`**

```typescript
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SimulationRun } from './simulation-run.entity';
import { Schedule } from '../../operations/entities/schedule.entity';
import { Task } from '../../operations/entities/task.entity';

export enum ConflictType {
  RESOURCE_DOUBLE_BOOKING = 'RESOURCE_DOUBLE_BOOKING',
  CAPACITY_EXCEEDED = 'CAPACITY_EXCEEDED',
  TIME_CONSTRAINT_VIOLATION = 'TIME_CONSTRAINT_VIOLATION',
  DEPENDENCY_VIOLATION = 'DEPENDENCY_VIOLATION',
}

export enum ConflictSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

@Entity('conflicts', { schema: 'simulation' })
@Index('idx_conflicts_simulation', ['simulationRunId'])
@Index('idx_conflicts_schedule', ['scheduleId'])
@Index('idx_conflicts_severity', ['severity'])
export class Conflict {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  simulationRunId: string;

  @ManyToOne(() => SimulationRun, { nullable: true })
  @JoinColumn({ name: 'simulation_run_id' })
  simulationRun: SimulationRun;

  @Column({ type: 'uuid' })
  scheduleId: string;

  @ManyToOne(() => Schedule)
  @JoinColumn({ name: 'schedule_id' })
  schedule: Schedule;

  @Column({ type: 'enum', enum: ConflictType })
  type: ConflictType;

  @Column({ type: 'enum', enum: ConflictSeverity })
  severity: ConflictSeverity;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'jsonb' })
  affectedTasks: {
    taskIds: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  recommendations: Array<{
    type: string;
    description: string;
    estimatedImpact: string;
  }>;

  @Column({ type: 'boolean', default: false })
  isResolved: boolean;

  @Column({ type: 'text', nullable: true })
  resolution: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
```

### Phase 1.5: Entity Creation - Analytics Schema (Day 3)

**📖 Reference:** Database_Design_Document.md § 3.4

#### Task 1.5.1: Create KPI Entity

**Create: `backend/src/analytics/entities/kpi.entity.ts`**

```typescript
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum KpiType {
  BERTH_UTILIZATION = 'BERTH_UTILIZATION',
  CRANE_UTILIZATION = 'CRANE_UTILIZATION',
  VESSEL_TURNAROUND_TIME = 'VESSEL_TURNAROUND_TIME',
  TASK_COMPLETION_RATE = 'TASK_COMPLETION_RATE',
  WAITING_TIME = 'WAITING_TIME',
  PRODUCTIVITY = 'PRODUCTIVITY',
}

@Entity('kpis', { schema: 'analytics' })
@Index('idx_kpis_type', ['type'])
@Index('idx_kpis_timestamp', ['timestamp'])
@Index('idx_kpis_entity', ['entityType', 'entityId'])
export class Kpi {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: KpiType })
  type: KpiType;

  @Column({ type: 'varchar', length: 50, nullable: true })
  entityType: string;

  @Column({ type: 'uuid', nullable: true })
  entityId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number;

  @Column({ type: 'varchar', length: 20 })
  unit: string;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
```

#### Task 1.5.2: Create EventLog Entity

**Create: `backend/src/notifications/entities/event-log.entity.ts`**

```typescript
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum EventType {
  SHIP_ARRIVAL = 'SHIP_ARRIVAL',
  SHIP_DEPARTURE = 'SHIP_DEPARTURE',
  TASK_STARTED = 'TASK_STARTED',
  TASK_COMPLETED = 'TASK_COMPLETED',
  CONFLICT_DETECTED = 'CONFLICT_DETECTED',
  SIMULATION_COMPLETED = 'SIMULATION_COMPLETED',
  ASSET_STATUS_CHANGED = 'ASSET_STATUS_CHANGED',
  SCHEDULE_UPDATED = 'SCHEDULE_UPDATED',
}

export enum EventSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

@Entity('event_logs', { schema: 'analytics' })
@Index('idx_event_logs_type', ['eventType'])
@Index('idx_event_logs_severity', ['severity'])
@Index('idx_event_logs_timestamp', ['timestamp'])
@Index('idx_event_logs_user', ['userId'])
export class EventLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: EventType })
  eventType: EventType;

  @Column({ type: 'enum', enum: EventSeverity })
  severity: EventSeverity;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 50, nullable: true })
  entityType: string;

  @Column({ type: 'uuid', nullable: true })
  entityId: string;

  @Column({ type: 'varchar', length: 255 })
  message: string;

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, any>;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'inet', nullable: true })
  ipAddress: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
```

### Phase 1.6: Database Migration & Seeding (Day 3)

**✅ Tasks:**

#### Task 1.6.1: Configure TypeORM Migrations

**Update: `backend/package.json`** - Add migration scripts:

```json
{
  "scripts": {
    "typeorm": "ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js",
    "migration:generate": "npm run typeorm migration:generate -- -n",
    "migration:create": "npm run typeorm migration:create -- -n",
    "migration:run": "npm run typeorm migration:run",
    "migration:revert": "npm run typeorm migration:revert",
    "seed": "ts-node -r tsconfig-paths/register database/seeds/seed.ts"
  }
}
```

**Install additional dependencies:**

```bash
npm install --save-dev ts-node tsconfig-paths
```

#### Task 1.6.2: Create Initial Migration

**Create: `backend/database/migrations/1730534400000-InitialSchema.ts`**

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1730534400000 implements MigrationInterface {
  name = 'InitialSchema1730534400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create schemas
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS auth`);
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS operations`);
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS simulation`);
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS analytics`);

    // Enable extensions
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pg_trgm"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "btree_gist"`);

    // Auth schema tables will be created by TypeORM based on entities
    // This is just for custom SQL if needed
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP SCHEMA IF EXISTS analytics CASCADE`);
    await queryRunner.query(`DROP SCHEMA IF EXISTS simulation CASCADE`);
    await queryRunner.query(`DROP SCHEMA IF EXISTS operations CASCADE`);
    await queryRunner.query(`DROP SCHEMA IF EXISTS auth CASCADE`);
  }
}
```

#### Task 1.6.3: Create Seed Data

**Create: `backend/database/seeds/seed.ts`**

```typescript
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../src/users/entities/user.entity';
import { Asset, AssetType, AssetStatus } from '../../src/operations/entities/asset.entity';

export async function seedDatabase(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);
  const assetRepository = dataSource.getRepository(Asset);

  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const admin = userRepository.create({
    username: 'admin',
    email: 'admin@portlink.com',
    passwordHash: adminPassword,
    fullName: 'System Administrator',
    role: UserRole.ADMIN,
    isActive: true,
    preferredLanguage: 'vi',
  });
  await userRepository.save(admin);
  console.log('✅ Created admin user');

  // Create operations user
  const opsPassword = await bcrypt.hash('Ops@123', 10);
  const ops = userRepository.create({
    username: 'ops.manager',
    email: 'ops@portlink.com',
    passwordHash: opsPassword,
    fullName: 'Operations Manager',
    role: UserRole.OPERATIONS,
    isActive: true,
    preferredLanguage: 'vi',
  });
  await userRepository.save(ops);
  console.log('✅ Created operations user');

  // Create driver user
  const driverPassword = await bcrypt.hash('Driver@123', 10);
  const driver = userRepository.create({
    username: 'driver.001',
    email: 'driver001@portlink.com',
    passwordHash: driverPassword,
    fullName: 'Nguyen Van A',
    role: UserRole.DRIVER,
    isActive: true,
    preferredLanguage: 'vi',
  });
  await userRepository.save(driver);
  console.log('✅ Created driver user');

  // Create berths
  const berths = [
    { code: 'B-01', name: 'Berth 01', zone: 'NORTH', maxDraft: 12.5, maxLOA: 250 },
    { code: 'B-02', name: 'Berth 02', zone: 'NORTH', maxDraft: 12.5, maxLOA: 250 },
    { code: 'B-03', name: 'Berth 03', zone: 'SOUTH', maxDraft: 10.0, maxLOA: 180 },
    { code: 'B-04', name: 'Berth 04', zone: 'SOUTH', maxDraft: 10.0, maxLOA: 180 },
  ];

  for (const berthData of berths) {
    const berth = assetRepository.create({
      code: berthData.code,
      name: berthData.name,
      type: AssetType.BERTH,
      status: AssetStatus.AVAILABLE,
      zone: berthData.zone,
      specifications: {
        maxDraft: berthData.maxDraft,
        maxLOA: berthData.maxLOA,
      },
      createdById: admin.id,
    });
    await assetRepository.save(berth);
  }
  console.log('✅ Created 4 berths');

  // Create cranes
  const cranes = [
    { code: 'C-01', name: 'Crane 01', zone: 'NORTH', capacity: 50, reach: 45 },
    { code: 'C-02', name: 'Crane 02', zone: 'NORTH', capacity: 50, reach: 45 },
    { code: 'C-03', name: 'Crane 03', zone: 'SOUTH', capacity: 40, reach: 40 },
    { code: 'C-04', name: 'Crane 04', zone: 'SOUTH', capacity: 40, reach: 40 },
  ];

  for (const craneData of cranes) {
    const crane = assetRepository.create({
      code: craneData.code,
      name: craneData.name,
      type: AssetType.CRANE,
      status: AssetStatus.AVAILABLE,
      zone: craneData.zone,
      specifications: {
        craneCapacity: craneData.capacity,
        craneReach: craneData.reach,
      },
      createdById: admin.id,
    });
    await assetRepository.save(crane);
  }
  console.log('✅ Created 4 cranes');

  console.log('🎉 Database seeding completed!');
}

// Main execution
import { getDatabaseConfig } from '../../src/config/database.config';
import { ConfigService } from '@nestjs/config';

async function run() {
  const configService = new ConfigService();
  const dataSource = new DataSource(getDatabaseConfig(configService) as any);
  
  await dataSource.initialize();
  await seedDatabase(dataSource);
  await dataSource.destroy();
}

run().catch(console.error);
```

#### Task 1.6.4: Run Migrations and Seeds

```bash
# Generate migration from entities
npm run typeorm migration:generate -- -n InitialSchema

# Run migrations
npm run typeorm migration:run

# Run seeds
npm run seed

# Verify in database
psql -U portlink_admin -d portlink_orchestrator_dev

# Check all tables
\dt auth.*
\dt operations.*
\dt simulation.*
\dt analytics.*

# Check seed data
SELECT * FROM auth.users;
SELECT * FROM operations.assets;
```

**✅ Phase 1 Complete! Verification Checklist:**

- [ ] PostgreSQL database created and running
- [ ] All schemas created (auth, operations, simulation, analytics)
- [ ] All entities defined with proper relationships
- [ ] Migrations generated and executed successfully
- [ ] Seed data loaded (admin, ops, driver users + 4 berths + 4 cranes)
- [ ] No TypeORM errors in console

---

## PHASE 2: Backend Foundation

**📅 Duration:** 4 days  
**🎯 Goal:** Build core NestJS backend with authentication, authorization, and common utilities

### Phase 2.1: Authentication Module (Day 4)

**📖 Reference Documents:**
- API_Specification_Document.md § 5 (Auth APIs)
- System_Architecture_Document.md § 4 (Security)
- PortLinkSRS.md § 5.1 (RQF-001 to RQF-004)

**✅ Tasks:**

#### Task 2.1.1: Install Authentication Dependencies

```bash
cd backend

npm install --save @nestjs/jwt @nestjs/passport passport passport-jwt
npm install --save bcrypt
npm install --save class-validator class-transformer

npm install --save-dev @types/passport-jwt @types/bcrypt
```

#### Task 2.1.2: Create Auth DTOs

**Create: `backend/src/auth/dto/login.dto.ts`**

```typescript
import { IsString, IsNotEmpty, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'admin',
    description: 'Username (3-50 chars, alphanumeric)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9._]+$/, {
    message: 'Username can only contain letters, numbers, dots and underscores',
  })
  username: string;

  @ApiProperty({
    example: 'Admin@123',
    description: 'Password (min 8 chars)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}

export class LoginResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: {
      id: string;
      username: string;
      email: string;
      fullName: string;
      role: string;
    };
  };
}
```

**Create: `backend/src/auth/dto/refresh-token.dto.ts`**

```typescript
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class RefreshTokenResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  data: {
    accessToken: string;
    expiresIn: number;
  };
}
```

#### Task 2.1.3: Create JWT Strategy

**Create: `backend/src/auth/strategies/jwt.strategy.ts`**

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

export interface JwtPayload {
  sub: string; // user id
  username: string;
  role: string;
  iat: number;
  exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);
    
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
  }
}
```

#### Task 2.1.4: Create Auth Service

**Create: `backend/src/auth/auth.service.ts`**

```typescript
import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { AuditLog, AuditAction } from './entities/audit-log.entity';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto, ipAddress: string, userAgent: string) {
    const { username, password } = loginDto;

    // Find user with password
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.username = :username', { username })
      .andWhere('user.deletedAt IS NULL')
      .getOne();

    if (!user) {
      await this.logAudit(null, AuditAction.ACCESS_DENIED, 'User', null, ipAddress, userAgent);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked
    if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
      throw new ForbiddenException('Account is locked due to multiple failed login attempts');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      // Increment failed attempts
      await this.handleFailedLogin(user);
      await this.logAudit(user.id, AuditAction.ACCESS_DENIED, 'User', user.id, ipAddress, userAgent);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new ForbiddenException('Account is inactive');
    }

    // Reset failed attempts
    await this.userRepository.update(user.id, {
      failedLoginAttempts: 0,
      accountLockedUntil: null,
      lastLoginAt: new Date(),
      lastLoginIp: ipAddress,
    });

    // Generate tokens
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user, ipAddress, userAgent);

    // Log successful login
    await this.logAudit(user.id, AuditAction.LOGIN, 'User', user.id, ipAddress, userAgent);

    return {
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken: refreshToken.token,
        expiresIn: 3600, // 1 hour in seconds
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      },
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto, ipAddress: string) {
    const { refreshToken } = refreshTokenDto;

    // Find refresh token
    const tokenEntity = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken, isRevoked: false },
      relations: ['user'],
    });

    if (!tokenEntity) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if expired
    if (tokenEntity.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    // Check if user is still active
    if (!tokenEntity.user.isActive) {
      throw new ForbiddenException('User account is inactive');
    }

    // Generate new access token
    const accessToken = await this.generateAccessToken(tokenEntity.user);

    return {
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        expiresIn: 3600,
      },
    };
  }

  async logout(userId: string, refreshToken: string) {
    // Revoke refresh token
    await this.refreshTokenRepository.update(
      { token: refreshToken },
      { isRevoked: true },
    );

    // Log logout
    await this.logAudit(userId, AuditAction.LOGOUT, 'User', userId, null, null);

    return {
      success: true,
      message: 'Logout successful',
    };
  }

  private async generateAccessToken(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '1h'),
    });
  }

  private async generateRefreshToken(
    user: User,
    ipAddress: string,
    userAgent: string,
  ): Promise<RefreshToken> {
    const payload = {
      sub: user.id,
      type: 'refresh',
    };

    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const refreshToken = this.refreshTokenRepository.create({
      userId: user.id,
      token,
      expiresAt,
      ipAddress,
      userAgent,
    });

    return this.refreshTokenRepository.save(refreshToken);
  }

  private async handleFailedLogin(user: User) {
    const failedAttempts = user.failedLoginAttempts + 1;
    const updateData: any = { failedLoginAttempts: failedAttempts };

    // Lock account after 5 failed attempts for 30 minutes
    if (failedAttempts >= 5) {
      const lockUntil = new Date();
      lockUntil.setMinutes(lockUntil.getMinutes() + 30);
      updateData.accountLockedUntil = lockUntil;
    }

    await this.userRepository.update(user.id, updateData);
  }

  private async logAudit(
    userId: string,
    action: AuditAction,
    entityType: string,
    entityId: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const auditLog = this.auditLogRepository.create({
      userId,
      action,
      entityType,
      entityId,
      ipAddress,
      userAgent,
    });

    await this.auditLogRepository.save(auditLog);
  }
}
```

#### Task 2.1.5: Create Auth Controller

**Create: `backend/src/auth/auth.controller.ts`**

```typescript
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Ip,
  Headers,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { RefreshTokenDto, RefreshTokenResponseDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 403, description: 'Account locked or inactive' })
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.login(loginDto, ipAddress, userAgent);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed', type: RefreshTokenResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Ip() ipAddress: string,
  ) {
    return this.authService.refreshToken(refreshTokenDto, ipAddress);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(
    @Request() req,
    @Body() body: { refreshToken: string },
  ) {
    return this.authService.logout(req.user.id, body.refreshToken);
  }
}
```

#### Task 2.1.6: Create JWT Auth Guard

**Create: `backend/src/auth/guards/jwt-auth.guard.ts`**

```typescript
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
```

**Create: `backend/src/auth/decorators/public.decorator.ts`**

```typescript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

#### Task 2.1.7: Create Auth Module

**Create: `backend/src/auth/auth.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { AuditLog } from './entities/audit-log.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RefreshToken, AuditLog]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', '1h'),
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

### Phase 2.2: Users Module (Day 4)

**📖 Reference:** API_Specification_Document.md § 6

#### Task 2.2.1: Create Users Service

**Create: `backend/src/users/users.service.ts`**

```typescript
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(page = 1, limit = 20, role?: UserRole) {
    const query = this.userRepository.createQueryBuilder('user');

    if (role) {
      query.where('user.role = :role', { role });
    }

    query.andWhere('user.deletedAt IS NULL');

    const [items, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      success: true,
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async create(createUserDto: CreateUserDto, createdById: string) {
    // Check if username or email already exists
    const existing = await this.userRepository.findOne({
      where: [
        { username: createUserDto.username },
        { email: createUserDto.email },
      ],
    });

    if (existing) {
      throw new ConflictException('Username or email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      ...createUserDto,
      passwordHash,
      createdById,
    });

    const saved = await this.userRepository.save(user);

    // Remove password from response
    delete saved.passwordHash;

    return {
      success: true,
      message: 'User created successfully',
      data: saved,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto, updatedById: string) {
    const user = await this.findById(id);

    // If updating password, hash it
    if (updateUserDto.password) {
      updateUserDto['passwordHash'] = await bcrypt.hash(updateUserDto.password, 10);
      delete updateUserDto.password;
    }

    Object.assign(user, updateUserDto, { updatedById });

    const updated = await this.userRepository.save(user);

    delete updated.passwordHash;

    return {
      success: true,
      message: 'User updated successfully',
      data: updated,
    };
  }

  async delete(id: string, deletedById: string) {
    const user = await this.findById(id);

    // Soft delete
    user.deletedAt = new Date();
    user.deletedById = deletedById;

    await this.userRepository.save(user);

    return {
      success: true,
      message: 'User deleted successfully',
    };
  }
}
```

**Create: `backend/src/users/dto/create-user.dto.ts`**

```typescript
import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9._]+$/)
  username: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  password: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fullName?: string;

  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phoneNumber?: string;
}
```

**Create: `backend/src/users/dto/update-user.dto.ts`**

```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
```

**Create: `backend/src/users/users.controller.ts`**

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get all users' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('role') role?: UserRole,
  ) {
    return this.usersService.findAll(page, limit, role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create new user' })
  async create(@Body() createUserDto: CreateUserDto, @Request() req) {
    return this.usersService.create(createUserDto, req.user.id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update user' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    return this.usersService.update(id, updateUserDto, req.user.id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete user' })
  async delete(@Param('id') id: string, @Request() req) {
    return this.usersService.delete(id, req.user.id);
  }
}
```

**Create: `backend/src/users/users.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

**(To be continued in next section...)**

---

### Phase 2.3: Role-Based Access Control (RBAC) - Day 5

**📖 Reference:** System_Architecture_Document.md § 8 (Security), API_Specification_Document.md § 3.4

**✅ Tasks:**

#### Task 2.3.1: Create Roles Guard
- **File:** `backend/src/auth/guards/roles.guard.ts`
- **Purpose:** Kiểm tra role của user có đủ quyền truy cập endpoint không
- **Logic:** 
  - Extract user từ request (đã được JWT guard authenticate)
  - So sánh user.role với required roles từ @Roles() decorator
  - Throw ForbiddenException nếu không có quyền

#### Task 2.3.2: Create Roles Decorator
- **File:** `backend/src/auth/decorators/roles.decorator.ts`
- **Purpose:** Decorator để mark endpoint cần role nào
- **Usage:** `@Roles(UserRole.ADMIN, UserRole.MANAGER)`

#### Task 2.3.3: Create Current User Decorator
- **File:** `backend/src/auth/decorators/current-user.decorator.ts`
- **Purpose:** Decorator để inject current user vào controller
- **Usage:** `@CurrentUser() user: User`

#### Task 2.3.4: Update App Module with Global Guards
- **File:** `backend/src/app.module.ts`
- **Add:** APP_GUARD provider cho JwtAuthGuard (global authentication)
- **Note:** Endpoints cần public phải dùng @Public() decorator

### Phase 2.4: Common Utilities & Middleware - Day 5

**📖 Reference:** System_Architecture_Document.md § 4.3 (Error Handling)

**✅ Tasks:**

#### Task 2.4.1: Exception Filters
- **File:** `backend/src/common/filters/http-exception.filter.ts`
- **Purpose:** Bắt tất cả HTTP exceptions và format response theo chuẩn API
- **Format Response:**
  ```
  {
    success: false,
    error: {
      code: "ERR_001",
      message: "Error message",
      details: [...]
    },
    timestamp: "2025-11-02T10:00:00Z"
  }
  ```

#### Task 2.4.2: Validation Pipe
- **File:** `backend/src/common/pipes/validation.pipe.ts`
- **Purpose:** Global validation cho tất cả DTOs
- **Config:** 
  - whitelist: true (strip non-whitelisted properties)
  - forbidNonWhitelisted: true (throw error if extra properties)
  - transform: true (auto transform types)

#### Task 2.4.3: Transform Interceptor
- **File:** `backend/src/common/interceptors/transform.interceptor.ts`
- **Purpose:** Wrap tất cả responses trong standard format
- **Format:**
  ```
  {
    success: true,
    data: {...},
    meta: {...},
    timestamp: "..."
  }
  ```

#### Task 2.4.4: Logging Interceptor
- **File:** `backend/src/common/interceptors/logging.interceptor.ts`
- **Purpose:** Log tất cả requests/responses
- **Log format:** `[METHOD] /path - Status: 200 - Duration: 123ms`

#### Task 2.4.5: CORS Configuration
- **File:** `backend/src/main.ts`
- **Enable CORS** với origins từ .env (CORS_ORIGIN)
- **Allow:** credentials, common headers

#### Task 2.4.6: Swagger/OpenAPI Setup
- **File:** `backend/src/main.ts`
- **Install:** `@nestjs/swagger`
- **Config:** 
  - Title: "PortLink Orchestrator API"
  - Version: "1.0"
  - Bearer Auth scheme
- **URL:** http://localhost:4000/api/docs

**✅ Verification Phase 2:**
```bash
# Start backend
npm run start:dev

# Test endpoints:
POST /api/v1/auth/login
GET  /api/v1/users (requires auth + admin role)
GET  /api/docs (Swagger UI)
```

---

## PHASE 3: Core Business Logic - Operations Module

**📅 Duration:** 5 days  
**🎯 Goal:** Implement tất cả core business logic cho quản lý tàu, bến, cẩu, lịch trình, và tasks

### Phase 3.1: Assets Module - Day 6

**📖 Reference:** 
- API_Specification_Document.md (Operations endpoints)
- Database_Design_Document.md § 3.2 (Asset entity)
- PortLinkSRS.md RQF-016

**✅ Tasks:**

#### Task 3.1.1: Assets Service
- **File:** `backend/src/operations/assets.service.ts`
- **Methods:**
  - `findAll(filters)`: List assets với pagination, filter by type/status/zone
  - `findById(id)`: Get asset details
  - `create(dto)`: Tạo asset mới (berth, crane, yard, truck)
  - `update(id, dto)`: Cập nhật thông tin asset
  - `delete(id)`: Soft delete asset
  - `updateStatus(id, status)`: Thay đổi status (AVAILABLE, OCCUPIED, MAINTENANCE)
  - `findAvailable(type, timeRange)`: Tìm assets available trong khoảng thời gian

#### Task 3.1.2: Assets DTOs
- **Files:** `backend/src/operations/dto/`
  - `create-asset.dto.ts`: Validate asset creation (code unique, specifications theo type)
  - `update-asset.dto.ts`: Partial update
  - `asset-filter.dto.ts`: Query filters (type, status, zone, search)
  - `update-asset-status.dto.ts`: Change status with notes

#### Task 3.1.3: Assets Controller
- **File:** `backend/src/operations/assets.controller.ts`
- **Endpoints:**
  - `GET /assets` - List (OPERATIONS, MANAGER, ADMIN)
  - `GET /assets/:id` - Detail (ALL authenticated)
  - `POST /assets` - Create (ADMIN only)
  - `PATCH /assets/:id` - Update (ADMIN only)
  - `DELETE /assets/:id` - Delete (ADMIN only)
  - `PATCH /assets/:id/status` - Update status (OPERATIONS, ADMIN)

#### Task 3.1.4: Business Rules Validation
- **Berth validation:**
  - maxDraft >= vessel draft
  - maxLOA >= vessel LOA
  - Zone compatibility
- **Crane validation:**
  - Crane capacity >= cargo weight
  - Crane reach compatibility

### Phase 3.2: Ship Visits Module - Day 6-7

**📖 Reference:** 
- API_Specification_Document.md (Ship Visits endpoints)
- PortLinkSRS.md RQF-005, RQF-017

**✅ Tasks:**

#### Task 3.2.1: Ship Visits Service
- **File:** `backend/src/operations/ship-visits.service.ts`
- **Methods:**
  - `findAll(filters)`: List ship visits với filters (status, date range, ship name, work type)
  - `findById(id)`: Get visit details
  - `create(dto)`: Tạo ship visit từ TOS data
  - `update(id, dto)`: Cập nhật ETA, ATA, cargo info
  - `updateStatus(id, status)`: Change status (PLANNED → APPROACHING → BERTHED → WORKING → COMPLETED → DEPARTED)
  - `findUpcoming()`: Tàu sắp đến trong 24h
  - `findCurrent()`: Tàu đang trong cảng
  - `calculateEstimatedDuration()`: Tính thời gian làm việc dự kiến dựa trên cargo quantity

#### Task 3.2.2: Ship Visits DTOs
- **Files:**
  - `create-ship-visit.dto.ts`: Validate tàu mới (TOS reference unique, ETA future date)
  - `update-ship-visit.dto.ts`: Partial update
  - `ship-visit-filter.dto.ts`: Filters
  - `update-ship-visit-status.dto.ts`: Status transition validation

#### Task 3.2.3: Ship Visits Controller
- **Endpoints:**
  - `GET /ship-visits` - List (ALL authenticated)
  - `GET /ship-visits/upcoming` - Upcoming arrivals (ALL)
  - `GET /ship-visits/current` - Current in port (ALL)
  - `GET /ship-visits/:id` - Detail (ALL)
  - `POST /ship-visits` - Create (OPERATIONS, ADMIN)
  - `PATCH /ship-visits/:id` - Update (OPERATIONS, ADMIN)
  - `PATCH /ship-visits/:id/status` - Update status (OPERATIONS, DRIVER, ADMIN)

#### Task 3.2.4: Status Transition Validation
- **Logic:** Validate status transitions:
  - PLANNED → APPROACHING ✅
  - APPROACHING → BERTHED ✅
  - BERTHED → WORKING ✅
  - WORKING → COMPLETED ✅
  - COMPLETED → DEPARTED ✅
  - Invalid transitions throw BadRequestException

### Phase 3.3: Schedules Module - Day 7-8

**📖 Reference:** 
- API_Specification_Document.md (Schedules endpoints)
- PortLinkSRS.md RQF-005, RQF-010

**✅ Tasks:**

#### Task 3.3.1: Schedules Service
- **File:** `backend/src/operations/schedules.service.ts`
- **Methods:**
  - `findAll(filters)`: List schedules (active, simulation, date range)
  - `findById(id, includeTasks)`: Get schedule với/không tasks
  - `findActive()`: Get current active schedule
  - `create(dto)`: Tạo schedule mới
  - `clone(id, name)`: Clone schedule làm base cho simulation
  - `activate(id)`: Set schedule làm active (deactivate old active)
  - `validateSchedule(id)`: Check conflicts trong schedule
  - **Important:** Chỉ có 1 active schedule (is_active=true, is_simulation=false) tại một thời điểm

#### Task 3.3.2: Schedules DTOs
- **Files:**
  - `create-schedule.dto.ts`: Name, startTime, endTime, isSimulation
  - `update-schedule.dto.ts`: Partial update
  - `schedule-filter.dto.ts`: Filters
  - `clone-schedule.dto.ts`: New name, scenario description

#### Task 3.3.3: Schedules Controller
- **Endpoints:**
  - `GET /schedules` - List (ALL)
  - `GET /schedules/active` - Get active schedule (ALL)
  - `GET /schedules/:id` - Detail (ALL)
  - `POST /schedules` - Create (OPERATIONS, ADMIN)
  - `POST /schedules/:id/clone` - Clone for simulation (OPERATIONS, ADMIN)
  - `PATCH /schedules/:id/activate` - Activate schedule (ADMIN only)
  - `DELETE /schedules/:id` - Delete simulation schedule (ADMIN)

### Phase 3.4: Tasks Module - Day 8-9

**📖 Reference:** 
- API_Specification_Document.md (Tasks endpoints)
- PortLinkSRS.md RQF-008, RQF-009

**✅ Tasks:**

#### Task 3.4.1: Tasks Service
- **File:** `backend/src/operations/tasks.service.ts`
- **Methods:**
  - `findAll(filters)`: List tasks (by schedule, ship visit, berth, crane, assigned user, status, date range)
  - `findById(id)`: Get task details với relations (shipVisit, berth, crane, assignedTo)
  - `findByUser(userId)`: Tasks assigned to specific user (for DRIVER)
  - `findPending()`: Tasks chưa assign
  - `create(dto)`: Tạo task trong schedule
  - `update(id, dto)`: Update task info
  - `assign(id, userId)`: Assign task to user
  - `updateStatus(id, status)`: Change status (PENDING → ASSIGNED → IN_PROGRESS → COMPLETED)
  - `detectConflicts(taskId)`: Check xung đột với tasks khác (cùng berth/crane, overlap time)

#### Task 3.4.2: Tasks DTOs
- **Files:**
  - `create-task.dto.ts`: Validate task (berth OR crane must be set, time range valid)
  - `update-task.dto.ts`: Partial update
  - `task-filter.dto.ts`: Complex filters
  - `assign-task.dto.ts`: Assign to user
  - `update-task-status.dto.ts`: Status + notes

#### Task 3.4.3: Tasks Controller
- **Endpoints:**
  - `GET /tasks` - List (ALL)
  - `GET /tasks/my-tasks` - My assigned tasks (DRIVER)
  - `GET /tasks/pending` - Unassigned tasks (OPERATIONS, ADMIN)
  - `GET /tasks/:id` - Detail (ALL)
  - `POST /tasks` - Create (OPERATIONS, ADMIN)
  - `PATCH /tasks/:id` - Update (OPERATIONS, ADMIN)
  - `PATCH /tasks/:id/assign` - Assign (OPERATIONS, ADMIN)
  - `PATCH /tasks/:id/status` - Update status (DRIVER, OPERATIONS, ADMIN)

#### Task 3.4.4: Conflict Detection Logic
- **Algorithm:**
  1. Get all tasks in same schedule
  2. Filter tasks với same berth OR same crane
  3. Check time overlap: `(start1 < end2) AND (start2 < end1)`
  4. Return conflicts array với details

### Phase 3.5: Real-time WebSocket Integration - Day 9-10

**📖 Reference:** 
- System_Architecture_Document.md (WebSocket layer)
- PortLinkSRS.md RQN-002 (Real-time requirement)

**✅ Tasks:**

#### Task 3.5.1: WebSocket Gateway Setup
- **File:** `backend/src/websocket/websocket.gateway.ts`
- **Install:** `@nestjs/websockets @nestjs/platform-socket.io socket.io`
- **Config:**
  - CORS: same as REST API
  - Namespace: `/ws`
  - Authentication: JWT token trong handshake

#### Task 3.5.2: Event Emitters
- **Files:** `backend/src/websocket/events/`
- **Events to emit:**
  - `schedule.updated` - Khi schedule thay đổi
  - `task.created` - Task mới
  - `task.updated` - Task cập nhật
  - `task.status_changed` - Task status change
  - `ship_visit.updated` - Ship visit info change
  - `ship_visit.status_changed` - Ship arrival/departure
  - `asset.status_changed` - Berth/crane status change
  - `conflict.detected` - Phát hiện xung đột mới
  - `kpi.updated` - KPI metrics update

#### Task 3.5.3: Event Listeners in Services
- **Update các services:**
  - AssetsService: emit `asset.status_changed` khi updateStatus()
  - ShipVisitsService: emit `ship_visit.status_changed` khi updateStatus()
  - TasksService: emit `task.status_changed` khi updateStatus()
  - SchedulesService: emit `schedule.updated` khi activate()

#### Task 3.5.4: Room Management
- **Logic:**
  - User join room theo role:
    - `schedule:{scheduleId}` - Theo dõi schedule cụ thể
    - `user:{userId}` - Nhận notifications cá nhân
    - `all` - Broadcast toàn hệ thống (cho dashboard)

### Phase 3.6: Notifications & Event Logs Module - Day 10

**📖 Reference:** 
- PortLinkSRS.md RQF-014, RQF-015
- Database_Design_Document.md (EventLog entity)

**✅ Tasks:**

#### Task 3.6.1: Event Logs Service
- **File:** `backend/src/notifications/event-logs.service.ts`
- **Methods:**
  - `create(eventType, severity, message, details, userId)`: Ghi log event
  - `findAll(filters)`: List logs (by type, severity, user, date range)
  - `findByUser(userId)`: User's notifications
  - `markAsRead(userId, eventIds)`: Mark notifications đã đọc
  - `export(filters, format)`: Export logs (CSV, JSON)

#### Task 3.6.2: Auto-logging Interceptor
- **File:** `backend/src/notifications/interceptors/event-logger.interceptor.ts`
- **Purpose:** Tự động log tất cả important actions:
  - User login/logout
  - Schedule changes
  - Task status changes
  - Ship arrivals/departures
  - Conflicts detected

#### Task 3.6.3: Event Logs Controller
- **Endpoints:**
  - `GET /event-logs` - List (OPERATIONS, MANAGER, ADMIN)
  - `GET /event-logs/my-notifications` - User's notifications (ALL)
  - `PATCH /event-logs/mark-read` - Mark as read (ALL)
  - `GET /event-logs/export` - Export (ADMIN)

**✅ Verification Phase 3:**
```bash
# Test complete workflow:
1. Create assets (berths, cranes)
2. Create ship visit
3. Create schedule
4. Create tasks for ship visit
5. Assign tasks to driver
6. Driver updates task status
7. Check WebSocket events emitted
8. Check event logs created
9. Verify no conflicts detected
```

---

## PHASE 4: Simulation Engine & What-If Analysis

**📅 Duration:** 4 days  
**🎯 Goal:** Implement simulation engine để chạy kịch bản "What-If" và phát hiện conflicts (RQN-001: < 5 seconds)

### Phase 4.1: Simulation Engine Core - Day 11

**📖 Reference:** 
- PortLinkSRS.md RQF-008 to RQF-013 (Critical requirements)
- System_Architecture_Document.md (Simulation module)

**✅ Tasks:**

#### Task 4.1.1: Simulation Service
- **File:** `backend/src/simulation/simulation.service.ts`
- **Core Methods:**
  - `createSimulation(scenarioDto)`: Tạo simulation run mới
  - `runSimulation(simulationId)`: Execute simulation
  - `getSimulationResult(simulationId)`: Get results
  - `compareSchedules(baseScheduleId, resultScheduleId)`: So sánh before/after

#### Task 4.1.2: Simulation Algorithm (Core Logic)
**Algorithm Flow:**
```
1. INPUT: Base schedule + Scenario changes
   - Scenario types: SHIP_DELAY, ASSET_MAINTENANCE, CUSTOM
   - Changes: [{entityType, entityId, field, oldValue, newValue}]

2. CLONE BASE SCHEDULE:
   - Copy schedule → new simulation schedule
   - Copy all tasks → adjust IDs
   - Mark as isSimulation = true

3. APPLY SCENARIO CHANGES:
   - If SHIP_DELAY: Update ship_visit.etaActual → cascade update all related tasks
   - If ASSET_MAINTENANCE: Mark asset unavailable → find alternative or delay tasks
   - If CUSTOM: Apply custom changes

4. RECALCULATE SCHEDULE:
   - For each affected task:
     - Check resource availability (berth, crane)
     - Adjust start/end time based on dependencies
     - Update predicted times

5. DETECT CONFLICTS:
   - Run conflict detection (Task 4.2)
   - Find: double bookings, capacity exceeded, time violations

6. GENERATE RECOMMENDATIONS:
   - For each conflict:
     - Suggest alternative berth/crane
     - Suggest time adjustments
     - Estimate impact

7. OUTPUT:
   - New schedule with adjusted tasks
   - List of conflicts with severity
   - Recommendations
   - Execution time (must be < 5 seconds)
```

#### Task 4.1.3: Scenario Handlers
- **Files:** `backend/src/simulation/handlers/`
  - `ship-delay.handler.ts`: Handle tàu trễ X hours
  - `asset-maintenance.handler.ts`: Handle bến/cẩu bảo trì
  - `custom-scenario.handler.ts`: Handle custom changes

#### Task 4.1.4: Performance Optimization
- **Requirements:** Execution time < 5 seconds (RQN-001)
- **Techniques:**
  - Use in-memory calculations (không lưu DB mỗi step)
  - Batch operations
  - Index queries properly
  - Cache asset availability
  - Parallel processing cho independent tasks

### Phase 4.2: Conflict Detection Engine - Day 11-12

**📖 Reference:** PortLinkSRS.md RQF-011

**✅ Tasks:**

#### Task 4.2.1: Conflict Detection Service
- **File:** `backend/src/simulation/conflict-detection.service.ts`
- **Methods:**
  - `detectAllConflicts(scheduleId)`: Scan toàn bộ schedule
  - `detectTaskConflicts(taskId)`: Check conflicts cho 1 task
  - `calculateSeverity(conflict)`: Determine LOW/MEDIUM/HIGH/CRITICAL

#### Task 4.2.2: Conflict Types Detection
**Algorithms:**

1. **RESOURCE_DOUBLE_BOOKING:**
   ```
   - Get all tasks in schedule
   - Group by berth_id or crane_id
   - For each group, check time overlaps
   - Overlap = (task1.start < task2.end) AND (task2.start < task1.end)
   ```

2. **CAPACITY_EXCEEDED:**
   ```
   - Check berth maxDraft vs vessel draft
   - Check berth maxLOA vs vessel LOA
   - Check crane capacity vs cargo weight
   ```

3. **TIME_CONSTRAINT_VIOLATION:**
   ```
   - Check if task.startTime < shipVisit.etaActual (can't start before ship arrives)
   - Check if task.endTime > berth.maintenanceWindow
   ```

4. **DEPENDENCY_VIOLATION:**
   ```
   - Check task.dependencies.predecessorTaskIds
   - Ensure all predecessor tasks completed before this task starts
   ```

#### Task 4.2.3: Conflict Severity Calculation
```
CRITICAL: Ship cannot berth (no available berth matching requirements)
HIGH: Significant delay (> 4 hours) or revenue impact
MEDIUM: Moderate delay (1-4 hours)
LOW: Minor adjustment needed (< 1 hour)
```

### Phase 4.3: Optimization & Recommendations - Day 12

**📖 Reference:** PortLinkSRS.md RQF-013

**✅ Tasks:**

#### Task 4.3.1: Recommendation Engine
- **File:** `backend/src/simulation/recommendation.service.ts`
- **Methods:**
  - `generateRecommendations(conflicts)`: Tạo giải pháp cho conflicts
  - `findAlternativeBerth(task, conflict)`: Tìm bến thay thế
  - `findAlternativeCrane(task, conflict)`: Tìm cẩu thay thế
  - `suggestTimeAdjustment(task, conflict)`: Đề xuất dời giờ
  - `estimateImpact(recommendation)`: Tính impact của giải pháp

#### Task 4.3.2: Recommendation Algorithms

**1. Alternative Berth Finder:**
```
Input: Task with berth conflict
Logic:
1. Get ship requirements (draft, LOA, cargo type)
2. Find all berths matching requirements
3. Check availability in required time range
4. Rank by:
   - Distance/zone preference
   - Equipment availability
   - Operational cost
5. Return top 3 alternatives
```

**2. Time Adjustment Optimizer:**
```
Input: Conflicting tasks
Logic:
1. Calculate minimum delay needed
2. Check cascade effects on dependent tasks
3. Estimate total delay impact
4. Suggest: "Delay Task A by 2 hours → affects Task B, C"
```

**3. Resource Reallocation:**
```
Input: Overbooked resource
Logic:
1. Identify all tasks using resource
2. Calculate priority (based on ship size, cargo value, SLA)
3. Suggest moving lower priority tasks to alternative
```

#### Task 4.3.3: Impact Estimation
- **Metrics:**
  - Delay time (hours)
  - Affected tasks count
  - Revenue impact (if cargo value available)
  - Resource utilization change

### Phase 4.4: Simulation APIs & Integration - Day 13-14

**✅ Tasks:**

#### Task 4.4.1: Simulation DTOs
- **Files:** `backend/src/simulation/dto/`
  - `create-simulation.dto.ts`: Scenario definition
  - `simulation-result.dto.ts`: Results format
  - `conflict.dto.ts`: Conflict details
  - `recommendation.dto.ts`: Recommendation format

#### Task 4.4.2: Simulation Controller
- **File:** `backend/src/simulation/simulation.controller.ts`
- **Endpoints:**
  - `POST /simulations` - Create & run simulation (OPERATIONS, MANAGER, ADMIN)
  - `GET /simulations/:id` - Get simulation result (ALL)
  - `GET /simulations` - List simulations (ALL)
  - `POST /simulations/:id/apply` - Apply simulation → activate schedule (ADMIN)
  - `DELETE /simulations/:id` - Delete simulation (ADMIN)

#### Task 4.4.3: WebSocket Integration
- **Emit events:**
  - `simulation.started` - Khi bắt đầu run
  - `simulation.progress` - Progress updates (nếu > 2s)
  - `simulation.completed` - Kết quả
  - `simulation.failed` - Lỗi

#### Task 4.4.4: Caching Layer
- **Install:** `@nestjs/cache-manager cache-manager`
- **Setup Redis cache:**
  - Cache simulation results (TTL: 1 hour)
  - Cache conflict detection results
  - Cache asset availability calculations
- **Key format:** `sim:{simulationId}:result`

**✅ Verification Phase 4:**
```bash
# Test simulation workflow:
1. Create base schedule with 5 tasks
2. Run simulation: "Ship A delayed 3 hours"
3. Verify execution time < 5 seconds
4. Check conflicts detected
5. Verify recommendations generated
6. Compare before/after schedules
7. Test WebSocket events emitted
8. Test apply simulation (activate new schedule)
```

---

**📄 End of Part 2 - Summary**

## ✅ Part 2 Complete Coverage:

### Phase 2: Backend Foundation ✅
- Authentication Module (JWT, Login, Refresh, Logout)
- Users Module (CRUD)
- RBAC (Roles Guard, Decorators)
- Common Utilities (Filters, Interceptors, Pipes)
- Swagger/OpenAPI documentation

### Phase 3: Core Business Logic ✅
- Assets Module (Berths, Cranes, Yards, Trucks)
- Ship Visits Module (Arrivals, Departures, Status)
- Schedules Module (Active schedule management)
- Tasks Module (Assignment, Status tracking)
- Real-time WebSocket (Live updates)
- Event Logs & Notifications

### Phase 4: Simulation Engine ✅
- Simulation Core (What-If scenarios)
- Conflict Detection (4 types)
- Recommendation Engine (Alternative solutions)
- Performance optimization (< 5s requirement)
- Redis caching

## 📋 Next: Part 3 Will Cover:

- **Phase 5:** Frontend Development (React + TypeScript)
- **Phase 6:** Integration & Deployment
- **Phase 7:** Testing & Production Launch

**Total estimated: ~8 weeks development**

---

**🎯 Key Requirements Covered:**
- ✅ RQF-001 to RQF-004: Authentication
- ✅ RQF-005 to RQF-007: Dashboard data APIs
- ✅ RQF-008 to RQF-013: Simulation & What-If
- ✅ RQF-014 to RQF-015: Notifications & Logs
- ✅ RQF-016 to RQF-018: Asset management & Integration
- ✅ RQN-001: Performance < 5s
- ✅ RQN-002: Real-time WebSocket
- ✅ RQN-006 to RQN-010: Security, Logging, Error handling

---

# DEVELOPMENT OUTLINE - PART 3

**Coverage:** Phase 5-7 (Frontend, Integration, Deployment, Testing)

---

## PHASE 5: Frontend Development - React + TypeScript

**📅 Duration:** 10 days  
**🎯 Goal:** Build complete frontend UI cho tất cả personas (P-1, P-2, P-3, P-4) với focus vào Digital Twin Dashboard

### Phase 5.1: Frontend Foundation - Day 15-16

**📖 Reference:** 
- System_Architecture_Document.md (Frontend layer)
- User_Manual_Guide.md (UI/UX requirements)
- PortLinkSRS.md RQN-003, RQN-004 (Responsive, Hi-Fidelity)

**✅ Tasks:**

#### Task 5.1.1: Initialize React Project
```bash
cd frontend
npm create vite@latest . -- --template react-ts

# Install core dependencies
npm install react-router-dom
npm install @reduxjs/toolkit react-redux
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
npm install axios
npm install socket.io-client
npm install react-hook-form yup @hookform/resolvers
npm install date-fns
npm install recharts d3
npm install i18next react-i18next

# Install dev dependencies
npm install -D @types/node
npm install -D eslint prettier
```

#### Task 5.1.2: Project Structure Setup
```
frontend/src/
├── app/
│   ├── App.tsx
│   ├── store.ts (Redux store config)
│   └── routes.tsx
├── features/
│   ├── auth/
│   │   ├── authSlice.ts
│   │   ├── authService.ts
│   │   ├── LoginPage.tsx
│   │   └── ProtectedRoute.tsx
│   ├── dashboard/
│   ├── vessels/
│   ├── berths/
│   ├── tasks/
│   ├── simulation/
│   └── analytics/
├── components/
│   ├── common/
│   │   ├── Layout/
│   │   ├── Navbar/
│   │   ├── Sidebar/
│   │   ├── Loader/
│   │   └── ErrorBoundary/
│   └── charts/
├── services/
│   ├── api.ts (Axios config)
│   ├── websocket.ts (Socket.io config)
│   └── i18n.ts
├── types/
│   ├── user.types.ts
│   ├── vessel.types.ts
│   ├── schedule.types.ts
│   └── api.types.ts
├── utils/
│   ├── formatters.ts
│   ├── validators.ts
│   └── constants.ts
└── assets/
    ├── images/
    └── styles/
```

#### Task 5.1.3: API Service Configuration
- **File:** `frontend/src/services/api.ts`
- **Setup:**
  - Axios instance with base URL from env
  - Request interceptor: Add JWT token to headers
  - Response interceptor: Handle 401 (auto logout), 403, 500
  - Error handling wrapper
  - Type-safe API methods

#### Task 5.1.4: Redux Store Setup
- **File:** `frontend/src/app/store.ts`
- **Slices to create:**
  - `authSlice`: user, token, isAuthenticated
  - `vesselsSlice`: vessels list, current vessel
  - `schedulesSlice`: active schedule, schedules list
  - `tasksSlice`: tasks list, my tasks
  - `assetsSlice`: berths, cranes
  - `simulationSlice`: current simulation, results
  - `notificationsSlice`: unread count, notifications list
- **Use RTK Query** for API calls with caching

#### Task 5.1.5: WebSocket Service
- **File:** `frontend/src/services/websocket.ts`
- **Features:**
  - Connect on login with JWT token
  - Auto reconnect on disconnect
  - Join rooms based on active page
  - Event listeners for real-time updates
  - Dispatch Redux actions on events

#### Task 5.1.6: i18n Configuration
- **Files:** 
  - `frontend/src/services/i18n.ts`
  - `frontend/public/locales/vi/translation.json`
  - `frontend/public/locales/en/translation.json`
- **Support:** Vietnamese (default), English
- **Translation keys:** Organize by features

#### Task 5.1.7: Theme & Styling
- **File:** `frontend/src/app/theme.ts`
- **MUI Theme config:**
  - Primary color: Blue (#1976d2)
  - Secondary color: Orange (#ff9800)
  - Success: Green, Error: Red, Warning: Yellow
  - Typography: Roboto
  - Responsive breakpoints
- **Dark mode support** (optional)

### Phase 5.2: Authentication UI - Day 16

**📖 Reference:** User_Manual_Guide.md § 2.1

**✅ Tasks:**

#### Task 5.2.1: Login Page
- **File:** `frontend/src/features/auth/LoginPage.tsx`
- **Features:**
  - Username/password form với validation
  - Language switcher (EN/VI)
  - Remember me checkbox
  - Loading state
  - Error messages display
  - Redirect after successful login
- **Validation:**
  - Username: required, 3-50 chars
  - Password: required, min 8 chars

#### Task 5.2.2: Protected Route Component
- **File:** `frontend/src/features/auth/ProtectedRoute.tsx`
- **Logic:**
  - Check if user authenticated
  - If not → redirect to /login
  - If yes → render children
  - Also check role-based access

#### Task 5.2.3: Auth Service
- **File:** `frontend/src/features/auth/authService.ts`
- **Methods:**
  - `login(username, password)`: Call API, save token, update Redux
  - `logout()`: Clear token, disconnect WebSocket, redirect
  - `refreshToken()`: Auto refresh before expiry
  - `getCurrentUser()`: Get user from token

### Phase 5.3: Main Layout & Navigation - Day 17

**📖 Reference:** User_Manual_Guide.md § 2.2

**✅ Tasks:**

#### Task 5.3.1: Main Layout Component
- **File:** `frontend/src/components/common/Layout/MainLayout.tsx`
- **Structure:**
  - Top AppBar: Logo, title, notifications, user menu, language switch, logout
  - Sidebar: Navigation menu (collapse/expand)
  - Main content area
  - Breadcrumbs

#### Task 5.3.2: Navigation Menu
- **Dynamic menu by role:**
  - **ALL:** Dashboard, My Tasks, Notifications
  - **OPERATIONS:** + Vessels, Schedules, Tasks Management, Simulations
  - **MANAGER:** + Analytics, Reports
  - **ADMIN:** + Users, Assets, Settings
  - **DRIVER:** Dashboard, My Tasks only

#### Task 5.3.3: Notifications Component
- **File:** `frontend/src/components/common/Notifications/NotificationsPanel.tsx`
- **Features:**
  - Badge with unread count
  - Dropdown list of recent notifications
  - Click to view details
  - Mark as read
  - Real-time updates via WebSocket
  - Sound/desktop notifications (optional)

### Phase 5.4: Digital Twin Dashboard - Day 18-20 (PRIORITY #1)

**📖 Reference:** 
- PortLinkSRS.md RQF-005, RQF-006, RQF-007 (Critical features)
- User_Manual_Guide.md § 3.1

**✅ Tasks:**

#### Task 5.4.1: Dashboard Layout
- **File:** `frontend/src/features/dashboard/DashboardPage.tsx`
- **Layout:** Grid system 12 columns
  - Top row: KPI cards (4 cards x 3 cols each)
  - Middle row: Port Layout Map (8 cols) + Upcoming Events (4 cols)
  - Bottom row: Gantt Chart (full width 12 cols)

#### Task 5.4.2: KPI Cards Component
- **File:** `frontend/src/features/dashboard/components/KpiCards.tsx`
- **4 cards:**
  1. Active Vessels (count + icon)
  2. Berths Occupied (X/Total + percentage)
  3. Pending Tasks (count + icon)
  4. Utilization Rate (percentage + trend)
- **Features:**
  - Real-time updates
  - Click to drill-down
  - Loading skeletons

#### Task 5.4.3: Port Layout Heatmap
- **File:** `frontend/src/features/dashboard/components/PortLayoutMap.tsx`
- **Technology:** SVG-based or Canvas
- **Features:**
  - Visual representation of port (berths positions)
  - Color-coded berths:
    - 🟢 Green: Available
    - 🟡 Yellow: Occupied (ending soon)
    - 🔴 Red: Occupied (long time)
    - ⚫ Gray: Maintenance
  - Hover tooltip: Berth details, current vessel, ETA/ETD
  - Click: Show berth details modal
  - Real-time updates via WebSocket
- **Data:** Fetch from `/assets?type=BERTH`

#### Task 5.4.4: Gantt Chart Component (CRITICAL - Hi-Fidelity)
- **File:** `frontend/src/features/dashboard/components/GanttChart.tsx`
- **Technology Options:**
  - **Option 1:** DHTMLX Gantt (commercial license required)
  - **Option 2:** Bryntum Gantt (commercial license required)
  - **Option 3:** Custom D3.js implementation (free, more work)
- **Features:**
  - **Timeline:** Horizontal time axis (hours/days)
  - **Resources:** Vertical axis (Berths + Cranes)
  - **Tasks:** Bars showing ship visits + operations
  - **Color coding:**
    - Blue: Berthing
    - Green: Loading
    - Orange: Unloading
    - Red: Conflicts/delays
  - **Interactions:**
    - Zoom in/out (scroll wheel)
    - Pan (drag)
    - Hover: Task details tooltip
    - Click: Task details modal
  - **Real-time updates:** Tasks move/update live
- **Data:** 
  - Fetch active schedule from `/schedules/active`
  - Fetch tasks from `/tasks?scheduleId={id}`
  - Listen to WebSocket `task.updated` events

#### Task 5.4.5: Upcoming Events Panel
- **File:** `frontend/src/features/dashboard/components/UpcomingEvents.tsx`
- **Display:**
  - List of next 10 events (arrivals, departures, task deadlines)
  - Format: Time countdown, event type icon, description
  - Auto-scroll or paginated
- **Data:** Fetch from `/ship-visits/upcoming` + `/tasks?status=PENDING`

#### Task 5.4.6: Real-time Integration
- **WebSocket events to handle:**
  - `schedule.updated` → Refresh Gantt chart
  - `task.created` / `task.updated` → Update Gantt bar
  - `ship_visit.status_changed` → Update heatmap + events
  - `asset.status_changed` → Update heatmap colors
  - `kpi.updated` → Update KPI cards
- **Optimization:** Debounce rapid updates (max 1 update/second)

### Phase 5.5: Vessels Management - Day 20-21

**📖 Reference:** User_Manual_Guide.md § 5 (P-1 Operations Manager)

**✅ Tasks:**

#### Task 5.5.1: Vessels List Page
- **File:** `frontend/src/features/vessels/VesselsListPage.tsx`
- **Features:**
  - Data table with columns: Ship Name, IMO, Type, ETA, Status, Actions
  - Filters: Status, Date range, Ship type
  - Search: Ship name
  - Pagination: 20 items/page
  - Sort: By ETA, status, name
  - Actions: View details, Edit, Update status

#### Task 5.5.2: Vessel Details Modal
- **File:** `frontend/src/features/vessels/VesselDetailsModal.tsx`
- **Display:**
  - Ship information (name, IMO, LOA, draft, cargo)
  - Timeline: ETA → ATA → Work → ATD
  - Assigned berth, cranes
  - Related tasks list
  - Status history
- **Actions:** Update status, Edit info

#### Task 5.5.3: Create/Edit Vessel Form
- **File:** `frontend/src/features/vessels/VesselForm.tsx`
- **Fields:**
  - Ship name*, IMO, Vessel type
  - LOA*, Draft*
  - TOS Reference*
  - ETA (TOS)*, Actual ETA
  - Work type* (Loading/Unloading/Both)
  - Cargo quantity, type
  - Special requirements (textarea)
- **Validation:** React Hook Form + Yup schema
- **Actions:** Save (POST/PATCH `/ship-visits`)

### Phase 5.6: Tasks Management - Day 21-22

**📖 Reference:** User_Manual_Guide.md § 5, 6 (P-1, P-2)

**✅ Tasks:**

#### Task 5.6.1: Tasks List Page (for P-1 Operations)
- **File:** `frontend/src/features/tasks/TasksListPage.tsx`
- **Features:**
  - Data table: Task ID, Vessel, Berth/Crane, Type, Time, Status, Assigned To, Actions
  - Filters: Status, Berth, Crane, Date range, Assigned user
  - Bulk actions: Assign multiple tasks
  - Quick assign dropdown
  - Status color indicators

#### Task 5.6.2: My Tasks Page (for P-2 Driver)
- **File:** `frontend/src/features/tasks/MyTasksPage.tsx`
- **Features:**
  - Simpler UI for mobile-friendly
  - Card view of assigned tasks
  - Large buttons: Start Task, Complete Task, Report Issue
  - Current task highlighted
  - Voice input for notes (optional)

#### Task 5.6.3: Task Details Modal
- **File:** `frontend/src/features/tasks/TaskDetailsModal.tsx`
- **Display:**
  - Task info: Type, vessel, berth/crane, time
  - Status timeline
  - Assigned user
  - Notes history
  - Dependencies (predecessor/successor tasks)
- **Actions:** 
  - Assign/Reassign (P-1)
  - Update status (P-1, P-2)
  - Add notes

#### Task 5.6.4: Quick Status Update
- **Component:** `frontend/src/features/tasks/QuickStatusUpdate.tsx`
- **For P-2 (Driver):**
  - Simple modal with big buttons
  - Options: Start, Pause, Complete, Report Problem
  - Optional note field
  - Confirmation

### Phase 5.7: What-If Simulation UI - Day 22-23 (CRITICAL)

**📖 Reference:** 
- PortLinkSRS.md RQF-008 to RQF-013 (Core feature)
- User_Manual_Guide.md § 9

**✅ Tasks:**

#### Task 5.7.1: Simulation Page Layout
- **File:** `frontend/src/features/simulation/SimulationPage.tsx`
- **Layout:**
  - Left panel (30%): Scenario builder
  - Right panel (70%): Results comparison

#### Task 5.7.2: Scenario Builder Component
- **File:** `frontend/src/features/simulation/ScenarioBuilder.tsx`
- **Features:**
  - **Step 1:** Select scenario type
    - Ship Delay
    - Asset Maintenance
    - Custom Changes
  - **Step 2:** Configure scenario
    - **Ship Delay:** Select vessel, delay duration (hours)
    - **Asset Maintenance:** Select berth/crane, start time, duration
    - **Custom:** Free-form changes
  - **Step 3:** Name simulation, description
  - **Button:** Run Simulation (with loading state)

#### Task 5.7.3: Simulation Results Component
- **File:** `frontend/src/features/simulation/SimulationResults.tsx`
- **Display:**
  - **Before/After comparison:**
    - Side-by-side Gantt charts (or overlay)
    - Highlight changed tasks (red = conflict, yellow = adjusted)
  - **Conflicts Summary:**
    - Count by severity (Critical, High, Medium, Low)
    - List of conflicts with details
  - **Recommendations:**
    - List of suggested solutions
    - Impact estimates
  - **Metrics comparison:**
    - Berth utilization: Before vs After
    - Total delay: Before vs After
    - Affected tasks count
- **Actions:**
  - Apply Simulation (ADMIN only) → Activate result schedule
  - Save for later
  - Discard

#### Task 5.7.4: Conflicts List Component
- **File:** `frontend/src/features/simulation/ConflictsList.tsx`
- **Display:**
  - Grouped by severity
  - Each conflict card shows:
    - Type icon + name
    - Affected tasks
    - Time/resource details
    - Recommended solutions (expandable)
- **Interactions:**
  - Click to highlight on Gantt
  - Expand/collapse details

#### Task 5.7.5: Real-time Simulation Progress
- **WebSocket integration:**
  - `simulation.started` → Show loading spinner
  - `simulation.progress` → Update progress bar (if > 2s)
  - `simulation.completed` → Load results
  - `simulation.failed` → Show error message
- **Timeout:** 10 seconds max wait

### Phase 5.8: Analytics & Reports - Day 23-24

**📖 Reference:** User_Manual_Guide.md § 11 (P-4 Port Manager)

**✅ Tasks:**

#### Task 5.8.1: Analytics Dashboard
- **File:** `frontend/src/features/analytics/AnalyticsDashboard.tsx`
- **Charts:**
  1. **Berth Utilization Trend** (Line chart - 30 days)
  2. **Vessel Turnaround Time** (Bar chart - avg by week)
  3. **Task Completion Rate** (Pie chart - Completed vs Delayed)
  4. **Resource Usage Heatmap** (Calendar heatmap)
  5. **Cargo Volume** (Area chart - by month)
- **Technology:** Recharts library
- **Filters:** Date range, berth/crane selector

#### Task 5.8.2: Reports Page
- **File:** `frontend/src/features/analytics/ReportsPage.tsx`
- **Features:**
  - Predefined report templates:
    - Daily Operations Report
    - Weekly Performance Report
    - Monthly Summary Report
  - Custom report builder
  - Date range selector
  - Export options: PDF, Excel, CSV
  - Email schedule (future)

#### Task 5.8.3: KPI Details Page
- **File:** `frontend/src/features/analytics/KpiDetailsPage.tsx`
- **Display:**
  - Select KPI type (dropdown)
  - Historical data table
  - Trend chart
  - Benchmarks/targets
  - Drill-down by resource

### Phase 5.9: Admin Panel - Day 24

**📖 Reference:** User_Manual_Guide.md § 7 (P-3 Admin)

**✅ Tasks:**

#### Task 5.9.1: Users Management Page
- **File:** `frontend/src/features/admin/UsersPage.tsx`
- **Features:**
  - Users list table
  - Create user button → form modal
  - Edit user (inline or modal)
  - Activate/Deactivate user
  - Reset password
  - Filters: Role, status

#### Task 5.9.2: Assets Management Page
- **File:** `frontend/src/features/admin/AssetsPage.tsx`
- **Features:**
  - Assets list grouped by type (tabs: Berths, Cranes, Yards, Trucks)
  - Create asset form
  - Edit asset
  - Change status (Available, Maintenance, Out of Service)
  - Visual map for berth positions (drag-drop to set coordinates)

#### Task 5.9.3: System Settings Page
- **File:** `frontend/src/features/admin/SettingsPage.tsx`
- **Settings:**
  - General: Port name, timezone
  - Notifications: Email config, alert thresholds
  - Integration: TOS API endpoint, credentials
  - Backup: Schedule, retention

### Phase 5.10: Mobile Responsiveness & PWA - Day 25

**📖 Reference:** PortLinkSRS.md RQN-003

**✅ Tasks:**

#### Task 5.10.1: Responsive Design
- **Breakpoints:**
  - Mobile: < 600px (1 column, simplified Gantt)
  - Tablet: 600-960px (2 columns, compact Gantt)
  - Desktop: > 960px (full layout)
- **Mobile-specific adjustments:**
  - Collapsible sidebar → hamburger menu
  - Cards instead of tables
  - Touch-friendly buttons (min 44px)
  - Simplified Gantt (vertical timeline for mobile)

#### Task 5.10.2: PWA Configuration
- **File:** `frontend/public/manifest.json`
- **Features:**
  - App name, icons (192x192, 512x512)
  - Theme color, background color
  - Display: standalone
  - Offline support (service worker)
- **Install prompt:** Custom button to install app

#### Task 5.10.3: Mobile-Optimized Pages
- **Priority for P-2 (Driver):**
  - Login page (large inputs)
  - My Tasks page (card view)
  - Quick status update (big buttons)
  - Notifications (push notifications)

---

## PHASE 6: Integration & TOS Connector

**📅 Duration:** 3 days  
**🎯 Goal:** Integrate với Terminal Operating System (TOS) để sync data

### Phase 6.1: TOS Integration Module - Day 26-27

**📖 Reference:** 
- PortLinkSRS.md RQF-017, RQF-018
- System_Architecture_Document.md (Integration layer)

**✅ Tasks:**

#### Task 6.1.1: TOS Connector Service
- **File:** `backend/src/integration/tos-connector.service.ts`
- **Purpose:** Connect to external TOS system để fetch ship schedules
- **Methods:**
  - `fetchShipSchedules()`: Get upcoming ship visits from TOS
  - `syncShipVisit(tosReference)`: Sync single ship visit
  - `mapTOStoShipVisit(tosData)`: Transform TOS data → ShipVisit entity
  - `handleWebhook(tosEvent)`: Receive real-time updates from TOS (if available)

#### Task 6.1.2: TOS API Client
- **File:** `backend/src/integration/clients/tos-api.client.ts`
- **Setup:**
  - HTTP client (Axios) with TOS base URL
  - Authentication (API key, OAuth, etc.)
  - Retry logic with exponential backoff
  - Error handling & logging

#### Task 6.1.3: Data Mapping & Validation
- **File:** `backend/src/integration/mappers/tos.mapper.ts`
- **Logic:**
  - Map TOS ship schedule → ShipVisit DTO
  - Validate mapped data (check required fields)
  - Handle missing/invalid data (log warnings, use defaults)
  - Check for duplicates (by TOS reference)

#### Task 6.1.4: Scheduled Sync Job
- **File:** `backend/src/integration/jobs/tos-sync.job.ts`
- **Install:** `@nestjs/schedule`
- **Schedule:** Every 15 minutes (configurable)
- **Logic:**
  1. Fetch ship schedules from TOS
  2. For each ship:
     - Check if exists in DB (by TOS reference)
     - If new → create ShipVisit
     - If exists → update ETA, cargo, status
  3. Log sync results (created, updated, errors)
  4. Emit WebSocket event `tos.synced`

#### Task 6.1.5: TOS Integration Controller
- **File:** `backend/src/integration/tos.controller.ts`
- **Endpoints:**
  - `POST /integration/tos/sync` - Manual trigger sync (ADMIN)
  - `GET /integration/tos/status` - Get last sync status
  - `POST /integration/tos/webhook` - Receive TOS webhooks (if supported)

### Phase 6.2: External Systems Integration - Day 27-28

**✅ Tasks:**

#### Task 6.2.1: Asset Status Monitoring
- **File:** `backend/src/integration/asset-monitor.service.ts`
- **Purpose:** Sync real-time asset status từ IoT devices / SCADA systems
- **Methods:**
  - `subscribeToAssetUpdates()`: Subscribe to MQTT/WebSocket feeds
  - `handleAssetStatusChange(assetId, status)`: Update asset status in DB
  - `detectAssetFailures()`: Auto-detect crane/berth failures

#### Task 6.2.2: Email Notifications (Optional)
- **File:** `backend/src/integration/email.service.ts`
- **Install:** `@nestjs-modules/mailer nodemailer`
- **Use cases:**
  - Send alerts on critical conflicts
  - Send daily reports to managers
  - Send task assignments to drivers

#### Task 6.2.3: Integration Configuration
- **File:** `backend/src/integration/integration.module.ts`
- **Config:**
  - TOS API endpoint, credentials (from .env)
  - Email SMTP settings
  - MQTT broker URL (if using)
  - Sync intervals

---

## PHASE 7: Testing, Deployment & Production Launch

**📅 Duration:** 5 days  
**🎯 Goal:** Comprehensive testing, deployment, và production readiness

### Phase 7.1: Backend Testing - Day 28-29

**📖 Reference:** System_Architecture_Document.md (Testing strategy)

**✅ Tasks:**

#### Task 7.1.1: Unit Tests
- **Tool:** Jest (included in NestJS)
- **Coverage target:** ≥ 80%
- **Files:** `backend/test/unit/`
- **Test cases:**
  - **Services:**
    - AuthService: login success/fail, token refresh, logout
    - UsersService: CRUD operations, validation
    - TasksService: conflict detection logic
    - SimulationService: scenario execution, < 5s performance
  - **Utilities:**
    - Validators, formatters, helpers

#### Task 7.1.2: Integration Tests
- **Tool:** Jest + Supertest
- **Files:** `backend/test/integration/`
- **Test cases:**
  - **API endpoints:**
    - POST /auth/login → returns token
    - GET /schedules/active → returns active schedule
    - POST /simulations → runs simulation, returns results
  - **Database operations:**
    - Create user → verify in DB
    - Update task status → check cascade effects
  - **WebSocket:**
    - Connect → emit event → verify received

#### Task 7.1.3: E2E Tests
- **Tool:** Jest + Supertest
- **Files:** `backend/test/e2e/`
- **Test workflows:**
  1. Complete user journey:
     - Login → Create ship visit → Create schedule → Create tasks → Assign tasks → Update status
  2. Simulation workflow:
     - Login → Run simulation (ship delay) → Verify conflicts detected → Check recommendations
  3. Real-time updates:
     - Login → Subscribe to WebSocket → Update task → Verify event received

### Phase 7.2: Frontend Testing - Day 29

**✅ Tasks:**

#### Task 7.2.1: Component Tests
- **Tool:** Vitest + React Testing Library
- **Files:** `frontend/src/**/__tests__/`
- **Test cases:**
  - LoginPage: form validation, submit success/error
  - GanttChart: renders tasks, handles clicks
  - SimulationBuilder: scenario selection, form submission
  - NotificationsPanel: displays notifications, marks read

#### Task 7.2.2: Integration Tests
- **Test workflows:**
  - Login flow → Redirect to dashboard
  - Create vessel → Shows in list
  - Run simulation → Displays results

#### Task 7.2.3: E2E Tests (Optional)
- **Tool:** Playwright or Cypress
- **Test critical paths:**
  - Full login → dashboard → simulation → results
  - Mobile responsive: Login on mobile viewport

### Phase 7.3: Performance Testing - Day 30

**📖 Reference:** PortLinkSRS.md RQN-001 (< 5s simulation)

**✅ Tasks:**

#### Task 7.3.1: Load Testing
- **Tool:** Apache JMeter or Artillery
- **Scenarios:**
  - 50 concurrent users accessing dashboard
  - 10 users running simulations simultaneously
  - 100 WebSocket connections
- **Metrics:**
  - Response time: API < 200ms, Simulation < 5s
  - Throughput: > 100 requests/second
  - Error rate: < 1%

#### Task 7.3.2: Stress Testing
- **Goal:** Find breaking point
- **Scenarios:**
  - Gradually increase users to 200
  - Large schedule (500 tasks) simulation
  - Database query optimization check

#### Task 7.3.3: Performance Optimization
- **Backend:**
  - Add database indexes if missing
  - Enable Redis caching for frequent queries
  - Optimize simulation algorithm (parallel processing)
- **Frontend:**
  - Lazy load routes (React.lazy)
  - Memoize heavy components (React.memo)
  - Optimize Gantt chart rendering (virtualization)

### Phase 7.4: Security Testing - Day 30

**✅ Tasks:**

#### Task 7.4.1: Security Audit
- **Check:**
  - SQL Injection: Test all endpoints with malicious inputs
  - XSS: Test form inputs with scripts
  - CSRF: Verify CSRF tokens
  - Authentication: Test JWT expiry, refresh flow
  - Authorization: Test role-based access (try access admin endpoint as DRIVER)

#### Task 7.4.2: Dependency Audit
```bash
# Backend
cd backend
npm audit
npm audit fix

# Frontend
cd frontend
npm audit
npm audit fix
```

#### Task 7.4.3: HTTPS & SSL
- **Setup:** SSL certificates (Let's Encrypt)
- **Verify:** All API calls use HTTPS
- **HSTS:** Enable HTTP Strict Transport Security

### Phase 7.5: Deployment - Day 31-32

**📖 Reference:** Deployment_Plan_Document.md (Complete guide)

**✅ Tasks:**

#### Task 7.5.1: Environment Setup
- **Servers:**
  - Production server (Ubuntu 22.04 LTS)
  - Staging server (optional)
- **Install:**
  - Docker, Docker Compose
  - Nginx
  - PostgreSQL 14
  - Redis 7
  - SSL certificates

#### Task 7.5.2: Docker Build & Push
```bash
# Build backend image
cd backend
docker build -t portlink-backend:1.0 -f Dockerfile.prod .

# Build frontend image
cd frontend
docker build -t portlink-frontend:1.0 -f Dockerfile.prod .

# Push to registry (if using Docker Hub / private registry)
docker push portlink-backend:1.0
docker push portlink-frontend:1.0
```

#### Task 7.5.3: Production Configuration
- **Files:**
  - `backend/.env.production`
  - `frontend/.env.production`
  - `docker-compose.prod.yml`
  - `nginx/conf.d/portlink.conf`
- **Update:**
  - Database credentials (strong passwords)
  - JWT secrets (generate new)
  - API URLs (production domain)
  - CORS origins

#### Task 7.5.4: Database Migration
```bash
# On production server
cd backend
npm run migration:run
npm run seed # Initial data (admin user, assets)
```

#### Task 7.5.5: Deploy Application
```bash
# On production server
docker-compose -f docker-compose.prod.yml up -d

# Verify services
docker-compose ps

# Check logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

#### Task 7.5.6: Nginx Configuration
- **Setup reverse proxy:**
  - `portlink.yourdomain.com` → Frontend (port 80)
  - `api.portlink.yourdomain.com` → Backend (port 4000)
  - WebSocket support (`/ws` endpoint)
- **Enable SSL:** Certbot for Let's Encrypt

#### Task 7.5.7: Monitoring Setup
- **Install:**
  - PM2 (if not using Docker) or Docker health checks
  - Log aggregation (optional: ELK stack)
  - Uptime monitoring (UptimeRobot, Pingdom)
- **Alerts:**
  - Server down → Email/SMS
  - High CPU/memory → Alert
  - Database connection errors → Alert

### Phase 7.6: Production Launch - Day 32

**✅ Tasks:**

#### Task 7.6.1: Pre-launch Checklist
- [ ] All tests passing
- [ ] Performance benchmarks met (< 5s simulation)
- [ ] Security audit completed
- [ ] Database backed up
- [ ] SSL certificates valid
- [ ] Environment variables set correctly
- [ ] Monitoring active
- [ ] Documentation complete

#### Task 7.6.2: Smoke Testing on Production
- **Test:**
  - Login as all roles (ADMIN, OPS, DRIVER, MANAGER)
  - Create ship visit
  - Create schedule with tasks
  - Run simulation (verify < 5s)
  - Check WebSocket real-time updates
  - Test mobile responsive
  - Verify all API endpoints

#### Task 7.6.3: User Training
- **Materials:**
  - User Manual (already created)
  - Video tutorials (record screen)
  - Quick start guides per persona
- **Training sessions:**
  - Admin: System configuration
  - Operations: Daily workflows
  - Drivers: Mobile app usage
  - Managers: Reports and analytics

#### Task 7.6.4: Go Live
- **Steps:**
  1. Announce maintenance window
  2. Backup current production (if replacing old system)
  3. Deploy new system
  4. Verify all services running
  5. Monitor for 1 hour
  6. Announce system available

#### Task 7.6.5: Post-launch Monitoring
- **Week 1:**
  - Monitor errors in logs daily
  - Track performance metrics
  - Gather user feedback
  - Quick hotfixes if needed
- **Week 2-4:**
  - Continue monitoring
  - Create backlog for improvements
  - Plan iteration 2 features

---

## PHASE 8: Documentation & Handover

**📅 Duration:** 2 days  
**🎯 Goal:** Complete documentation và knowledge transfer

### Phase 8.1: Technical Documentation - Day 33

**✅ Tasks:**

#### Task 8.1.1: API Documentation
- **Swagger/OpenAPI:** Already auto-generated
- **Additional:**
  - Postman collection export
  - WebSocket events reference
  - Error codes reference

#### Task 8.1.2: Code Documentation
- **Backend:**
  - JSDoc comments for complex functions
  - README per module
- **Frontend:**
  - Component props documentation
  - State management guide

#### Task 8.1.3: Deployment Guide
- **Already created:** Deployment_Plan_Document.md
- **Add:**
  - Troubleshooting common issues
  - Rollback procedures
  - Scaling guide

### Phase 8.2: Operational Documentation - Day 33-34

**✅ Tasks:**

#### Task 8.2.1: Admin Guide
- **Topics:**
  - How to add users
  - How to manage assets
  - How to configure TOS integration
  - How to export reports
  - How to backup database

#### Task 8.2.2: Maintenance Guide
- **Topics:**
  - Daily health checks
  - Weekly database cleanup
  - Monthly performance reviews
  - Log rotation
  - Certificate renewal

#### Task 8.2.3: Troubleshooting Guide
- **Common issues:**
  - "Cannot login" → Check JWT secret, database
  - "Simulation slow" → Check server resources, indexes
  - "WebSocket not connecting" → Check CORS, firewall
  - "Data not syncing from TOS" → Check API credentials, logs

### Phase 8.3: Knowledge Transfer - Day 34

**✅ Tasks:**

#### Task 8.3.1: Code Walkthrough
- **Sessions:**
  - Backend architecture overview
  - Frontend architecture overview
  - Database schema explanation
  - Simulation algorithm deep-dive

#### Task 8.3.2: Operations Training
- **Topics:**
  - How to deploy updates
  - How to monitor system health
  - How to handle incidents
  - How to scale system

#### Task 8.3.3: Handover Checklist
- [ ] Source code repository access
- [ ] Production server access
- [ ] Database credentials
- [ ] API keys and secrets
- [ ] Monitoring dashboards access
- [ ] Documentation URLs
- [ ] Support contact information

---

## SUMMARY: Complete Development Timeline

```
┌─────────────────────────────────────────────────────────────────┐
│                   8-WEEK DEVELOPMENT PLAN                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ WEEK 1-2: Backend Foundation                                    │
│   ├── Phase 1: Database & Data Layer (Day 1-3)                  │
│   └── Phase 2: Backend Foundation (Day 4-5)                     │
│                                                                  │
│ WEEK 3-4: Core Business Logic                                   │
│   ├── Phase 3: Operations Module (Day 6-10)                     │
│   └── Phase 4: Simulation Engine (Day 11-14)                    │
│                                                                  │
│ WEEK 5-7: Frontend Development                                  │
│   └── Phase 5: React Frontend (Day 15-25)                       │
│       ├── Foundation & Auth (Day 15-16)                         │
│       ├── Layout & Navigation (Day 17)                          │
│       ├── Digital Twin Dashboard ⭐ (Day 18-20)                 │
│       ├── Vessels & Tasks (Day 20-22)                           │
│       ├── Simulation UI ⭐ (Day 22-23)                          │
│       ├── Analytics & Admin (Day 23-24)                         │
│       └── Mobile & PWA (Day 25)                                 │
│                                                                  │
│ WEEK 8: Integration & Launch                                    │
│   ├── Phase 6: TOS Integration (Day 26-28)                      │
│   ├── Phase 7: Testing & Deployment (Day 28-32)                 │
│   └── Phase 8: Documentation & Handover (Day 33-34)             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

⭐ = Critical features (hi-fidelity required)
```

## Requirements Coverage Matrix

| Requirement | Status | Phase | Notes |
|-------------|--------|-------|-------|
| **RQF-001** Login | ✅ | 2.1, 5.2 | JWT auth + UI |
| **RQF-002** Mobile login | ✅ | 5.10 | Responsive |
| **RQF-003** User management | ✅ | 2.2, 5.9 | CRUD + UI |
| **RQF-004** Role-based access | ✅ | 2.3 | RBAC guards |
| **RQF-005** Gantt chart | ✅ | 5.4 | Hi-fidelity ⭐ |
| **RQF-006** Port layout map | ✅ | 5.4 | Heatmap ⭐ |
| **RQF-007** KPI dashboard | ✅ | 5.4, 5.8 | Real-time |
| **RQF-008** What-If UI | ✅ | 5.7 | Scenario builder |
| **RQF-009** Mobile incident report | ✅ | 5.6, 5.10 | Driver UI |
| **RQF-010** Simulation engine | ✅ | 4.1 | < 5s ⭐ |
| **RQF-011** Conflict detection | ✅ | 4.2 | 4 types |
| **RQF-012** Before/After compare | ✅ | 5.7 | Visual diff |
| **RQF-013** Recommendations | ✅ | 4.3 | AI-based |
| **RQF-014** Event logs | ✅ | 3.6 | Full audit |
| **RQF-015** Export logs | ✅ | 3.6, 5.8 | CSV export |
| **RQF-016** Asset config | ✅ | 3.1, 5.9 | Admin UI |
| **RQF-017** TOS integration | ✅ | 6.1 | Auto sync |
| **RQF-018** Real-time status | ✅ | 6.2 | IoT/MQTT |
| **RQN-001** Performance < 5s | ✅ | 4.1, 7.3 | Load tested |
| **RQN-002** Real-time WebSocket | ✅ | 3.5, 5.4 | Socket.io |
| **RQN-003** Responsive | ✅ | 5.10 | Mobile-first |
| **RQN-004** Hi-fidelity UI | ✅ | 5.4 | MUI + D3.js |
| **RQN-005** Scalability | ✅ | 7.3 | Load tested |
| **RQN-006** Security | ✅ | 2.1, 7.4 | JWT + RBAC |
| **RQN-007** Logging | ✅ | 2.4, 3.6 | All actions |
| **RQN-008** Error handling | ✅ | 2.4 | Global filters |
| **RQN-009** Backup | ✅ | 7.5 | Automated |
| **RQN-010** Bilingual | ✅ | 5.1 | i18n (VI/EN) |

**Coverage: 100% ✅**

---

## AI Agent Development Guidelines

### 📚 How to Use This Document

**For AI Development Agents:**

1. **Read sequentially** - Follow phases in order (1 → 8)
2. **Check references** - Each task references source documents
3. **Verify completion** - Use verification steps after each phase
4. **Test continuously** - Run tests after implementing each module
5. **Document as you go** - Update docs with any deviations

### 🔑 Critical Success Factors

**Must-haves for production:**
- ✅ Simulation < 5 seconds (RQN-001)
- ✅ Hi-fidelity Gantt chart (RQF-005)
- ✅ Real-time updates (RQN-002)
- ✅ Conflict detection working (RQF-011)
- ✅ Mobile responsive (RQN-003)
- ✅ Security (JWT + RBAC)
- ✅ All personas can perform their workflows

### 🚨 Common Pitfalls to Avoid

1. **Don't skip entity relationships** - Properly set up foreign keys
2. **Don't forget indexes** - Performance will suffer
3. **Don't hardcode** - Use environment variables
4. **Don't ignore errors** - Proper error handling from day 1
5. **Don't skip tests** - Write tests as you code
6. **Don't skip WebSocket** - Real-time is critical
7. **Don't optimize prematurely** - But measure performance

### 💡 Best Practices

**Code Quality:**
- Follow TypeScript strict mode
- Use ESLint + Prettier
- Write meaningful commit messages
- Code review before merge

**Testing:**
- TDD when possible
- Test edge cases
- Mock external dependencies
- Keep tests fast

**Documentation:**
- Update docs when code changes
- Document why, not what
- Include examples
- Keep README updated

---

## 🎉 COMPLETION CHECKLIST

### Phase 1-4: Backend ✅
- [ ] All entities created with proper relationships
- [ ] All migrations run successfully
- [ ] Seed data loaded
- [ ] All API endpoints implemented
- [ ] Authentication working (JWT)
- [ ] Authorization working (RBAC)
- [ ] WebSocket real-time working
- [ ] Simulation engine < 5 seconds
- [ ] Conflict detection accurate
- [ ] Unit tests ≥ 80% coverage
- [ ] Integration tests passing
- [ ] E2E tests passing

### Phase 5: Frontend ✅
- [ ] Login page working
- [ ] Dashboard with Gantt chart (hi-fidelity)
- [ ] Port layout heatmap
- [ ] Real-time updates working
- [ ] Simulation UI complete
- [ ] All CRUD operations working
- [ ] Mobile responsive
- [ ] PWA installable
- [ ] i18n working (EN/VI)
- [ ] Component tests passing

### Phase 6: Integration ✅
- [ ] TOS connector working
- [ ] Auto-sync scheduled
- [ ] Data mapping accurate
- [ ] Error handling robust

### Phase 7: Deployment ✅
- [ ] Docker images built
- [ ] Production environment setup
- [ ] SSL certificates installed
- [ ] Database migrated
- [ ] Application deployed
- [ ] Monitoring active
- [ ] Backups configured
- [ ] Load testing passed
- [ ] Security audit passed

### Phase 8: Documentation ✅
- [ ] API documentation complete
- [ ] User manual complete
- [ ] Admin guide complete
- [ ] Deployment guide complete
- [ ] Knowledge transfer done

---

**🎯 END OF DEVELOPMENT OUTLINE - PART 3**

**Total Pages:** ~100 pages comprehensive guide  
**Total Duration:** 8 weeks (34 working days)  
**Team Size:** 2-4 developers recommended  
**Success Rate:** High (if followed systematically)

**Good luck with the development! 🚀**

