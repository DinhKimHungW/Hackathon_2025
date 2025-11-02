# Database Design Document (DDD)
## PortLink Orchestrator - Digital Twin Platform

**Dự án:** PortLink Orchestrator - Giai đoạn 1  
**Phiên bản:** 1.0  
**Ngày tạo:** 02/11/2025  
**Người lập:** System Architect  
**Công nghệ Database:** PostgreSQL 14+ (Primary), Redis (Caching & Real-time)

---

## Mục lục

1. [Giới thiệu](#1-giới-thiệu)
2. [Tổng quan Kiến trúc Database](#2-tổng-quan-kiến-trúc-database)
3. [Chi tiết Schema và Tables](#3-chi-tiết-schema-và-tables)
4. [Indexes và Performance Optimization](#4-indexes-và-performance-optimization)
5. [Constraints và Business Rules](#5-constraints-và-business-rules)
6. [Data Migration Strategy](#6-data-migration-strategy)
7. [Backup và Recovery Plan](#7-backup-và-recovery-plan)
8. [Security và Access Control](#8-security-và-access-control)

---

## 1. Giới thiệu

### 1.1. Mục đích
Tài liệu này mô tả chi tiết thiết kế cơ sở dữ liệu cho hệ thống PortLink Orchestrator, bao gồm:
- Schema design với tất cả tables, relationships
- Data types, constraints, indexes
- Performance optimization strategies
- Backup và recovery procedures

### 1.2. Database Technology Stack
- **Primary Database:** PostgreSQL 14+ (ACID compliance, JSON support, advanced indexing)
- **Caching Layer:** Redis 6+ (Real-time data, session management)
- **Connection Pooling:** PgBouncer
- **Migration Tool:** TypeORM migrations / Knex.js

### 1.3. Naming Conventions
- **Tables:** `snake_case`, số nhiều (VD: `users`, `ship_visits`)
- **Columns:** `snake_case`
- **Primary Keys:** `id` (UUID v4)
- **Foreign Keys:** `{table_name}_id` (VD: `user_id`, `schedule_id`)
- **Indexes:** `idx_{table}_{column}` (VD: `idx_users_email`)
- **Constraints:** `{type}_{table}_{column}` (VD: `chk_users_role`)

---

## 2. Tổng quan Kiến trúc Database

### 2.1. Database Structure

```
portlink_orchestrator_db/
├── Core Schemas
│   ├── public (main schema)
│   ├── auth (authentication & authorization)
│   ├── operations (port operations data)
│   ├── simulation (what-if scenarios)
│   └── analytics (KPIs, metrics, logs)
│
├── Partitioning Strategy
│   ├── event_logs (partitioned by month)
│   └── simulation_runs (partitioned by quarter)
│
└── Extensions
    ├── uuid-ossp (UUID generation)
    ├── pgcrypto (encryption)
    └── pg_stat_statements (query monitoring)
```

### 2.2. Entity Relationship Diagram (ERD) - High Level

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Users     │────1:N──│  EventLogs   │         │   Assets    │
│             │         │              │         │  (Berths,   │
│ - id        │         │ - id         │         │   Cranes)   │
│ - username  │         │ - user_id    │         │             │
│ - role      │         │ - event_type │         │ - id        │
└─────────────┘         │ - timestamp  │         │ - name      │
                        └──────────────┘         │ - type      │
                                                 │ - status    │
┌─────────────┐         ┌──────────────┐         └─────────────┘
│ ShipVisits  │────1:N──│    Tasks     │────N:1──┘
│             │         │              │
│ - id        │         │ - id         │
│ - ship_name │         │ - ship_visit_id
│ - eta_tos   │         │ - asset_id   │
│ - eta_actual│         │ - schedule_id│
│ - status    │         │ - start_time │
└─────────────┘         │ - end_time   │
                        └──────────────┘
                               │
                               │N:1
                               ▼
                        ┌──────────────┐
                        │  Schedules   │
                        │              │
                        │ - id         │
                        │ - version    │
                        │ - is_active  │
                        │ - is_simulation
                        └──────────────┘
                               │
                               │1:N
                               ▼
                        ┌──────────────┐
                        │ SimulationRuns
                        │              │
                        │ - id         │
                        │ - base_schedule_id
                        │ - scenario   │
                        │ - results    │
                        └──────────────┘
```

---

## 3. Chi tiết Schema và Tables

### 3.1. Schema: `auth` - Authentication & Authorization

#### Table: `auth.users`
**Mục đích:** Lưu trữ thông tin người dùng và xác thực

```sql
CREATE TABLE auth.users (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Authentication
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    
    -- User Info
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('OPS', 'DRIVER', 'ADMIN', 'MANAGER')),
    language VARCHAR(5) DEFAULT 'vi' CHECK (language IN ('vi', 'en')),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_email_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP WITH TIME ZONE,
    
    -- Security
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    -- Soft Delete
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX idx_users_email ON auth.users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_username ON auth.users(username) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role ON auth.users(role) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_active ON auth.users(is_active) WHERE deleted_at IS NULL;

-- Comments
COMMENT ON TABLE auth.users IS 'Bảng lưu trữ thông tin người dùng hệ thống';
COMMENT ON COLUMN auth.users.role IS 'Vai trò: OPS (Điều phối), DRIVER (Tài xế/Thuyền trưởng), ADMIN (Quản trị), MANAGER (Quản lý cảng)';
```

#### Table: `auth.refresh_tokens`
**Mục đích:** Quản lý JWT refresh tokens

```sql
CREATE TABLE auth.refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    user_agent TEXT
);

CREATE INDEX idx_refresh_tokens_user ON auth.refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires ON auth.refresh_tokens(expires_at);
```

#### Table: `auth.audit_logs`
**Mục đích:** Ghi lại tất cả hoạt động liên quan đến bảo mật

```sql
CREATE TABLE auth.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    action VARCHAR(50) NOT NULL, -- LOGIN, LOGOUT, PASSWORD_CHANGE, ROLE_CHANGE
    resource_type VARCHAR(50),
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

-- Partitions (auto-created monthly)
CREATE TABLE auth.audit_logs_2025_11 PARTITION OF auth.audit_logs
    FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');
```

---

### 3.2. Schema: `operations` - Port Operations Data

#### Table: `operations.assets`
**Mục đích:** Lưu trữ thông tin tài sản cảng (Bến, Cẩu)

```sql
CREATE TABLE operations.assets (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Asset Info
    code VARCHAR(20) NOT NULL UNIQUE, -- BERTH-01, CRANE-A1
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('BERTH', 'CRANE', 'YARD', 'TRUCK')),
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' 
        CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'OFFLINE')),
    
    -- Technical Specs (JSONB for flexibility)
    specifications JSONB DEFAULT '{}'::JSONB,
    -- Example for BERTH: {"length_m": 300, "depth_m": 15, "max_dwt": 50000}
    -- Example for CRANE: {"capacity_tons": 50, "reach_m": 40, "speed_mpm": 60}
    
    -- Physical Location
    position_x DECIMAL(10, 2), -- For map visualization
    position_y DECIMAL(10, 2),
    zone VARCHAR(50), -- ZONE-A, ZONE-B
    
    -- Operational Info
    hourly_cost DECIMAL(10, 2), -- For cost calculation
    maintenance_schedule JSONB, -- {"next_date": "2025-12-01", "frequency": "monthly"}
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    -- Soft Delete
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX idx_assets_type ON operations.assets(type) WHERE deleted_at IS NULL;
CREATE INDEX idx_assets_status ON operations.assets(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_assets_code ON operations.assets(code) WHERE deleted_at IS NULL;
CREATE INDEX idx_assets_zone ON operations.assets(zone) WHERE deleted_at IS NULL;
CREATE INDEX idx_assets_specs ON operations.assets USING gin(specifications);

COMMENT ON TABLE operations.assets IS 'Bảng lưu trữ tài sản cảng: Bến, Cẩu, Bãi, Xe';
```

#### Table: `operations.ship_visits`
**Mục đích:** Lưu trữ thông tin chuyến thăm của tàu

```sql
CREATE TABLE operations.ship_visits (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Ship Info
    ship_name VARCHAR(255) NOT NULL,
    imo_number VARCHAR(10), -- International Maritime Organization number
    ship_type VARCHAR(50), -- CONTAINER, BULK, TANKER
    dwt INTEGER, -- Deadweight tonnage
    
    -- Visit Schedule
    eta_tos TIMESTAMP WITH TIME ZONE NOT NULL, -- ETA from TOS (original)
    eta_actual TIMESTAMP WITH TIME ZONE, -- Actual arrival (updated by P-2)
    etd_predicted TIMESTAMP WITH TIME ZONE, -- Estimated departure
    etd_actual TIMESTAMP WITH TIME ZONE, -- Actual departure
    
    -- Work Requirements
    work_type VARCHAR(50) NOT NULL, -- LOADING, UNLOADING, BOTH
    container_count INTEGER,
    cargo_weight_tons DECIMAL(10, 2),
    work_details JSONB, -- {"container_20ft": 50, "container_40ft": 30, "reefer": 10}
    
    -- Status Tracking
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED'
        CHECK (status IN ('SCHEDULED', 'DELAYED', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'DEPARTED', 'CANCELLED')),
    
    -- Delays & Incidents
    delay_minutes INTEGER DEFAULT 0,
    delay_reason TEXT,
    incidents JSONB DEFAULT '[]'::JSONB, -- Array of incident reports
    
    -- Integration
    tos_reference VARCHAR(100), -- Reference ID from TOS system
    external_data JSONB, -- Data from external systems
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX idx_ship_visits_eta ON operations.ship_visits(eta_tos);
CREATE INDEX idx_ship_visits_status ON operations.ship_visits(status);
CREATE INDEX idx_ship_visits_ship_name ON operations.ship_visits(ship_name);
CREATE INDEX idx_ship_visits_tos_ref ON operations.ship_visits(tos_reference);
CREATE INDEX idx_ship_visits_work_type ON operations.ship_visits(work_type);

COMMENT ON TABLE operations.ship_visits IS 'Bảng lưu trữ thông tin chuyến thăm của tàu';
```

#### Table: `operations.schedules`
**Mục đích:** Lưu trữ các phiên bản lịch trình

```sql
CREATE TABLE operations.schedules (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Version Control
    version INTEGER NOT NULL,
    parent_schedule_id UUID REFERENCES operations.schedules(id), -- For tracking changes
    
    -- Schedule Type
    is_active BOOLEAN DEFAULT false, -- Only one active schedule at a time
    is_simulation BOOLEAN DEFAULT false, -- True for what-if scenarios
    is_baseline BOOLEAN DEFAULT false, -- Original TOS schedule
    
    -- Time Range
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Metadata
    name VARCHAR(255), -- "Production Schedule 2025-11-02", "What-If: Ship A delayed"
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    
    -- Approval Workflow
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES auth.users(id),
    
    CONSTRAINT chk_schedule_time_range CHECK (end_time > start_time)
);

-- Indexes
CREATE INDEX idx_schedules_active ON operations.schedules(is_active);
CREATE INDEX idx_schedules_simulation ON operations.schedules(is_simulation);
CREATE INDEX idx_schedules_time_range ON operations.schedules(start_time, end_time);
CREATE UNIQUE INDEX idx_schedules_one_active ON operations.schedules(is_active) 
    WHERE is_active = true AND is_simulation = false;

COMMENT ON TABLE operations.schedules IS 'Bảng lưu trữ các phiên bản lịch trình (thực tế và mô phỏng)';
```

#### Table: `operations.tasks`
**Mục đích:** Lưu trữ các task cụ thể trong lịch trình

```sql
CREATE TABLE operations.tasks (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relationships
    schedule_id UUID NOT NULL REFERENCES operations.schedules(id) ON DELETE CASCADE,
    ship_visit_id UUID NOT NULL REFERENCES operations.ship_visits(id),
    berth_id UUID REFERENCES operations.assets(id),
    crane_id UUID REFERENCES operations.assets(id),
    
    -- Task Type
    task_type VARCHAR(50) NOT NULL CHECK (task_type IN ('BERTHING', 'LOADING', 'UNLOADING', 'UNBERTHING')),
    sequence_order INTEGER, -- Order of tasks within same ship visit
    
    -- Time Allocation
    start_time_predicted TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time_predicted TIMESTAMP WITH TIME ZONE NOT NULL,
    start_time_actual TIMESTAMP WITH TIME ZONE,
    end_time_actual TIMESTAMP WITH TIME ZONE,
    
    -- Progress Tracking
    status VARCHAR(20) DEFAULT 'PLANNED' 
        CHECK (status IN ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'CANCELLED')),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    
    -- Performance Metrics
    containers_processed INTEGER DEFAULT 0,
    estimated_duration_minutes INTEGER,
    actual_duration_minutes INTEGER,
    
    -- Dependencies
    depends_on_task_id UUID REFERENCES operations.tasks(id),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_task_time_range CHECK (end_time_predicted > start_time_predicted),
    CONSTRAINT chk_task_berth_or_crane CHECK (berth_id IS NOT NULL OR crane_id IS NOT NULL)
);

-- Indexes
CREATE INDEX idx_tasks_schedule ON operations.tasks(schedule_id);
CREATE INDEX idx_tasks_ship_visit ON operations.tasks(ship_visit_id);
CREATE INDEX idx_tasks_berth ON operations.tasks(berth_id);
CREATE INDEX idx_tasks_crane ON operations.tasks(crane_id);
CREATE INDEX idx_tasks_time_range ON operations.tasks(start_time_predicted, end_time_predicted);
CREATE INDEX idx_tasks_status ON operations.tasks(status);

COMMENT ON TABLE operations.tasks IS 'Bảng lưu trữ các task trong lịch trình (berthing, loading, unloading)';
```

---

### 3.3. Schema: `simulation` - What-If Scenarios

#### Table: `simulation.simulation_runs`
**Mục đích:** Lưu trữ các lần chạy mô phỏng

```sql
CREATE TABLE simulation.simulation_runs (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relationships
    base_schedule_id UUID NOT NULL REFERENCES operations.schedules(id),
    result_schedule_id UUID REFERENCES operations.schedules(id), -- Generated schedule
    user_id UUID NOT NULL REFERENCES auth.users(id),
    
    -- Simulation Input
    scenario_name VARCHAR(255) NOT NULL,
    scenario_type VARCHAR(50) NOT NULL 
        CHECK (scenario_type IN ('DELAY', 'MAINTENANCE', 'EMERGENCY', 'OPTIMIZATION', 'CUSTOM')),
    input_parameters JSONB NOT NULL,
    /* Example:
    {
        "ship_visit_id": "uuid",
        "delay_hours": 3,
        "reason": "Technical issue",
        "affected_assets": ["berth-01", "crane-a1"]
    }
    */
    
    -- Simulation Output
    execution_time_ms INTEGER,
    status VARCHAR(20) DEFAULT 'RUNNING' 
        CHECK (status IN ('RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED')),
    error_message TEXT,
    
    -- Results
    conflicts_detected JSONB DEFAULT '[]'::JSONB,
    /* Example:
    [
        {
            "conflict_id": "uuid",
            "type": "BERTH_OVERLAP",
            "severity": "HIGH",
            "affected_tasks": ["task-1", "task-2"],
            "description": "Ship B must wait 3 hours"
        }
    ]
    */
    
    kpi_changes JSONB DEFAULT '{}'::JSONB,
    /* Example:
    {
        "avg_waiting_time": {"before": 0, "after": 1.5, "unit": "hours"},
        "berth_utilization": {"before": 75, "after": 82, "unit": "percent"}
    }
    */
    
    suggested_solutions JSONB DEFAULT '[]'::JSONB,
    /* Example:
    [
        {
            "solution_id": "uuid",
            "type": "BERTH_REALLOCATION",
            "description": "Move Ship B to Berth 2",
            "impact_score": 0.85,
            "implementation_cost": 1500
        }
    ]
    */
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
) PARTITION BY RANGE (created_at);

-- Partitions (quarterly)
CREATE TABLE simulation.simulation_runs_2025_q4 PARTITION OF simulation.simulation_runs
    FOR VALUES FROM ('2025-10-01') TO ('2026-01-01');

-- Indexes
CREATE INDEX idx_simulation_runs_base_schedule ON simulation.simulation_runs(base_schedule_id);
CREATE INDEX idx_simulation_runs_user ON simulation.simulation_runs(user_id);
CREATE INDEX idx_simulation_runs_status ON simulation.simulation_runs(status);
CREATE INDEX idx_simulation_runs_type ON simulation.simulation_runs(scenario_type);
CREATE INDEX idx_simulation_runs_created ON simulation.simulation_runs(created_at DESC);

COMMENT ON TABLE simulation.simulation_runs IS 'Bảng lưu trữ các lần chạy mô phỏng What-If';
```

#### Table: `simulation.optimization_solutions`
**Mục đích:** Lưu trữ các giải pháp tối ưu được đề xuất

```sql
CREATE TABLE simulation.optimization_solutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    simulation_run_id UUID NOT NULL REFERENCES simulation.simulation_runs(id) ON DELETE CASCADE,
    
    -- Solution Details
    solution_type VARCHAR(50) NOT NULL 
        CHECK (solution_type IN ('BERTH_REALLOCATION', 'CRANE_REALLOCATION', 'SCHEDULE_SHIFT', 'PRIORITY_CHANGE')),
    
    priority_rank INTEGER, -- 1 = best solution
    confidence_score DECIMAL(3, 2) CHECK (confidence_score BETWEEN 0 AND 1),
    
    -- Implementation
    implementation_steps JSONB NOT NULL,
    estimated_cost DECIMAL(10, 2),
    estimated_benefit DECIMAL(10, 2),
    
    -- Impact Analysis
    affected_ship_visits UUID[] DEFAULT '{}',
    affected_assets UUID[] DEFAULT '{}',
    impact_description TEXT,
    
    -- User Feedback
    is_accepted BOOLEAN,
    user_feedback TEXT,
    accepted_at TIMESTAMP WITH TIME ZONE,
    accepted_by UUID REFERENCES auth.users(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_optimization_solutions_simulation ON simulation.optimization_solutions(simulation_run_id);
CREATE INDEX idx_optimization_solutions_rank ON simulation.optimization_solutions(priority_rank);
```

---

### 3.4. Schema: `analytics` - KPIs, Metrics & Logs

#### Table: `analytics.event_logs`
**Mục đích:** Ghi lại tất cả sự kiện trong hệ thống

```sql
CREATE TABLE analytics.event_logs (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Event Info
    event_type VARCHAR(50) NOT NULL 
        CHECK (event_type IN ('ACTUAL_EVENT', 'SIMULATION_RUN', 'USER_ACTION', 'SYSTEM_EVENT', 'INTEGRATION_EVENT')),
    
    category VARCHAR(50) NOT NULL, -- DELAY_REPORT, SCHEDULE_UPDATE, SIMULATION, etc.
    severity VARCHAR(20) DEFAULT 'INFO' 
        CHECK (severity IN ('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL')),
    
    -- Actor
    user_id UUID REFERENCES auth.users(id),
    user_role VARCHAR(20),
    
    -- Target
    resource_type VARCHAR(50), -- SHIP_VISIT, TASK, ASSET
    resource_id UUID,
    
    -- Event Details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_data JSONB DEFAULT '{}'::JSONB,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamp
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

-- Partitions (monthly for 3 months retention)
CREATE TABLE analytics.event_logs_2025_11 PARTITION OF analytics.event_logs
    FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');

CREATE TABLE analytics.event_logs_2025_12 PARTITION OF analytics.event_logs
    FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');

CREATE TABLE analytics.event_logs_2026_01 PARTITION OF analytics.event_logs
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

-- Indexes
CREATE INDEX idx_event_logs_type ON analytics.event_logs(event_type);
CREATE INDEX idx_event_logs_category ON analytics.event_logs(category);
CREATE INDEX idx_event_logs_user ON analytics.event_logs(user_id);
CREATE INDEX idx_event_logs_resource ON analytics.event_logs(resource_type, resource_id);
CREATE INDEX idx_event_logs_occurred ON analytics.event_logs(occurred_at DESC);
CREATE INDEX idx_event_logs_severity ON analytics.event_logs(severity);

COMMENT ON TABLE analytics.event_logs IS 'Bảng ghi lại tất cả sự kiện hệ thống (Retention: 3 tháng)';
```

#### Table: `analytics.kpi_snapshots`
**Mục đích:** Lưu trữ snapshot KPIs theo thời gian

```sql
CREATE TABLE analytics.kpi_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Time Context
    snapshot_time TIMESTAMP WITH TIME ZONE NOT NULL,
    period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('REALTIME', 'HOURLY', 'DAILY', 'WEEKLY')),
    
    -- Port-wide KPIs
    kpi_data JSONB NOT NULL,
    /* Example:
    {
        "avg_ship_waiting_time_hours": 1.2,
        "berth_utilization_percent": 78.5,
        "crane_productivity_moves_per_hour": 28.3,
        "ship_turnaround_time_hours": 18.5,
        "yard_occupancy_percent": 65.2,
        "active_ships": 5,
        "scheduled_ships_24h": 8,
        "predicted_conflicts_24h": 2
    }
    */
    
    -- Asset-level KPIs
    asset_kpis JSONB DEFAULT '[]'::JSONB,
    /* Example:
    [
        {
            "asset_id": "uuid",
            "asset_code": "BERTH-01",
            "utilization_percent": 85,
            "downtime_minutes": 0
        }
    ]
    */
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_kpi_snapshots_time ON analytics.kpi_snapshots(snapshot_time DESC);
CREATE INDEX idx_kpi_snapshots_period ON analytics.kpi_snapshots(period_type);
CREATE INDEX idx_kpi_snapshots_data ON analytics.kpi_snapshots USING gin(kpi_data);
```

#### Table: `analytics.performance_metrics`
**Mục đích:** Lưu trữ metrics hiệu suất hệ thống

```sql
CREATE TABLE analytics.performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Metric Info
    metric_name VARCHAR(100) NOT NULL,
    metric_category VARCHAR(50) NOT NULL, -- API_PERFORMANCE, SIMULATION_ENGINE, DATABASE
    
    -- Measurement
    value DECIMAL(12, 4) NOT NULL,
    unit VARCHAR(20), -- ms, percent, count
    
    -- Context
    metadata JSONB DEFAULT '{}'::JSONB,
    
    measured_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_performance_metrics_name ON analytics.performance_metrics(metric_name);
CREATE INDEX idx_performance_metrics_category ON analytics.performance_metrics(metric_category);
CREATE INDEX idx_performance_metrics_measured ON analytics.performance_metrics(measured_at DESC);
```

---

## 4. Indexes và Performance Optimization

### 4.1. Composite Indexes

```sql
-- For Gantt chart queries (frequent)
CREATE INDEX idx_tasks_gantt_view ON operations.tasks(
    schedule_id, 
    start_time_predicted, 
    end_time_predicted
) WHERE status != 'CANCELLED';

-- For conflict detection
CREATE INDEX idx_tasks_conflict_detection ON operations.tasks(
    berth_id, 
    start_time_predicted, 
    end_time_predicted
) WHERE berth_id IS NOT NULL;

CREATE INDEX idx_tasks_crane_conflict ON operations.tasks(
    crane_id, 
    start_time_predicted, 
    end_time_predicted
) WHERE crane_id IS NOT NULL;

-- For dashboard queries
CREATE INDEX idx_ship_visits_dashboard ON operations.ship_visits(
    status, 
    eta_tos
) WHERE status IN ('SCHEDULED', 'DELAYED', 'ARRIVED', 'IN_PROGRESS');
```

### 4.2. Partial Indexes

```sql
-- Only index active records
CREATE INDEX idx_users_active_only ON auth.users(email) 
    WHERE deleted_at IS NULL AND is_active = true;

CREATE INDEX idx_assets_available ON operations.assets(id, type) 
    WHERE status = 'AVAILABLE' AND deleted_at IS NULL;

-- Only index recent logs
CREATE INDEX idx_event_logs_recent ON analytics.event_logs(occurred_at DESC) 
    WHERE occurred_at > CURRENT_TIMESTAMP - INTERVAL '7 days';
```

### 4.3. GIN Indexes for JSONB

```sql
-- For searching in JSONB columns
CREATE INDEX idx_assets_specifications_gin ON operations.assets USING gin(specifications);
CREATE INDEX idx_ship_visits_work_details_gin ON operations.ship_visits USING gin(work_details);
CREATE INDEX idx_simulation_runs_input_gin ON simulation.simulation_runs USING gin(input_parameters);
CREATE INDEX idx_event_logs_data_gin ON analytics.event_logs USING gin(event_data);
```

### 4.4. Performance Configuration

```sql
-- Enable query statistics
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Analyze tables regularly (can be automated with pg_cron)
-- Add to cron job:
-- ANALYZE auth.users;
-- ANALYZE operations.assets;
-- ANALYZE operations.tasks;
-- etc.
```

---

## 5. Constraints và Business Rules

### 5.1. Data Integrity Constraints

```sql
-- Ensure only one active schedule at a time
CREATE UNIQUE INDEX idx_one_active_schedule ON operations.schedules(is_active) 
    WHERE is_active = true AND is_simulation = false;

-- Prevent overlapping tasks on same berth
CREATE OR REPLACE FUNCTION check_berth_overlap()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM operations.tasks
        WHERE berth_id = NEW.berth_id
        AND schedule_id = NEW.schedule_id
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
        AND status NOT IN ('CANCELLED')
        AND (
            (NEW.start_time_predicted, NEW.end_time_predicted) OVERLAPS 
            (start_time_predicted, end_time_predicted)
        )
    ) THEN
        RAISE EXCEPTION 'Berth % has overlapping tasks', NEW.berth_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_berth_overlap
    BEFORE INSERT OR UPDATE ON operations.tasks
    FOR EACH ROW
    EXECUTE FUNCTION check_berth_overlap();
```

### 5.2. Automatic Timestamp Updates

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER trg_update_users_timestamp
    BEFORE UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_assets_timestamp
    BEFORE UPDATE ON operations.assets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_ship_visits_timestamp
    BEFORE UPDATE ON operations.ship_visits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_tasks_timestamp
    BEFORE UPDATE ON operations.tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 5.3. Data Validation Functions

```sql
-- Validate task duration is reasonable
CREATE OR REPLACE FUNCTION validate_task_duration()
RETURNS TRIGGER AS $$
DECLARE
    duration_hours INTEGER;
BEGIN
    duration_hours := EXTRACT(EPOCH FROM (NEW.end_time_predicted - NEW.start_time_predicted)) / 3600;
    
    IF duration_hours < 0.5 THEN
        RAISE EXCEPTION 'Task duration too short: % hours', duration_hours;
    END IF;
    
    IF duration_hours > 48 THEN
        RAISE WARNING 'Task duration very long: % hours', duration_hours;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_task_duration
    BEFORE INSERT OR UPDATE ON operations.tasks
    FOR EACH ROW
    EXECUTE FUNCTION validate_task_duration();
```

---

## 6. Data Migration Strategy

### 6.1. Initial Setup Script

```sql
-- File: migrations/001_initial_setup.sql

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS operations;
CREATE SCHEMA IF NOT EXISTS simulation;
CREATE SCHEMA IF NOT EXISTS analytics;

-- Grant permissions
GRANT USAGE ON SCHEMA auth TO portlink_app_user;
GRANT USAGE ON SCHEMA operations TO portlink_app_user;
GRANT USAGE ON SCHEMA simulation TO portlink_app_user;
GRANT USAGE ON SCHEMA analytics TO portlink_app_user;
```

### 6.2. Seed Data Script

```sql
-- File: migrations/002_seed_data.sql

-- Insert default admin user
INSERT INTO auth.users (username, email, password_hash, full_name, role, is_active)
VALUES (
    'admin',
    'admin@portlink.local',
    crypt('Admin@123', gen_salt('bf')), -- Use bcrypt
    'System Administrator',
    'ADMIN',
    true
);

-- Insert sample assets (Berths)
INSERT INTO operations.assets (code, name, type, status, position_x, position_y, zone, specifications)
VALUES
    ('BERTH-01', 'Bến số 1', 'BERTH', 'AVAILABLE', 100, 200, 'ZONE-A', 
     '{"length_m": 300, "depth_m": 15, "max_dwt": 50000}'::jsonb),
    ('BERTH-02', 'Bến số 2', 'BERTH', 'AVAILABLE', 100, 400, 'ZONE-A', 
     '{"length_m": 250, "depth_m": 12, "max_dwt": 35000}'::jsonb);

-- Insert sample assets (Cranes)
INSERT INTO operations.assets (code, name, type, status, position_x, position_y, zone, specifications)
VALUES
    ('CRANE-A1', 'Cẩu A1', 'CRANE', 'AVAILABLE', 150, 200, 'ZONE-A', 
     '{"capacity_tons": 50, "reach_m": 40, "speed_mpm": 60}'::jsonb),
    ('CRANE-A2', 'Cẩu A2', 'CRANE', 'AVAILABLE', 150, 400, 'ZONE-A', 
     '{"capacity_tons": 50, "reach_m": 40, "speed_mpm": 60}'::jsonb);
```

### 6.3. Migration Tools

**Using TypeORM:**

```typescript
// File: src/database/migrations/1699000000000-InitialSchema.ts

import { MigrationInterface, QueryRunner } from "typeorm";
import * as fs from 'fs';
import * as path from 'path';

export class InitialSchema1699000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const sqlFile = fs.readFileSync(
            path.join(__dirname, '../../../migrations/001_initial_setup.sql'),
            'utf8'
        );
        await queryRunner.query(sqlFile);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP SCHEMA IF EXISTS analytics CASCADE`);
        await queryRunner.query(`DROP SCHEMA IF EXISTS simulation CASCADE`);
        await queryRunner.query(`DROP SCHEMA IF EXISTS operations CASCADE`);
        await queryRunner.query(`DROP SCHEMA IF EXISTS auth CASCADE`);
    }
}
```

---

## 7. Backup và Recovery Plan

### 7.1. Backup Strategy

**Backup Types:**
- **Full Backup:** Daily at 2:00 AM (retention: 30 days)
- **Incremental Backup:** Every 6 hours (retention: 7 days)
- **Transaction Log Backup:** Continuous WAL archiving

**Backup Script:**

```bash
#!/bin/bash
# File: scripts/backup_database.sh

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/portlink"
DB_NAME="portlink_orchestrator_db"

# Full backup
pg_dump -h localhost -U postgres -F c -b -v -f \
    "${BACKUP_DIR}/full_backup_${TIMESTAMP}.dump" \
    ${DB_NAME}

# Compress
gzip "${BACKUP_DIR}/full_backup_${TIMESTAMP}.dump"

# Delete old backups (keep 30 days)
find ${BACKUP_DIR} -name "full_backup_*.dump.gz" -mtime +30 -delete

# Upload to cloud storage (S3/Azure Blob)
aws s3 cp "${BACKUP_DIR}/full_backup_${TIMESTAMP}.dump.gz" \
    s3://portlink-backups/database/
```

**Cron Schedule:**

```cron
# Full backup daily at 2 AM
0 2 * * * /opt/portlink/scripts/backup_database.sh

# Incremental backup every 6 hours
0 */6 * * * /opt/portlink/scripts/incremental_backup.sh
```

### 7.2. Recovery Procedures

**Full Recovery:**

```bash
# Restore from backup
pg_restore -h localhost -U postgres -d portlink_orchestrator_db \
    -c -v /var/backups/portlink/full_backup_20251102_020000.dump

# Verify data integrity
psql -h localhost -U postgres -d portlink_orchestrator_db << EOF
SELECT COUNT(*) FROM auth.users;
SELECT COUNT(*) FROM operations.assets;
SELECT COUNT(*) FROM operations.ship_visits;
EOF
```

**Point-in-Time Recovery (PITR):**

```bash
# Configure in postgresql.conf
# wal_level = replica
# archive_mode = on
# archive_command = 'cp %p /var/lib/postgresql/wal_archive/%f'

# Recovery command
pg_basebackup -h localhost -U postgres -D /var/lib/postgresql/recovery \
    --wal-method=stream

# Create recovery.conf
cat > /var/lib/postgresql/recovery/recovery.conf << EOF
restore_command = 'cp /var/lib/postgresql/wal_archive/%f %p'
recovery_target_time = '2025-11-02 14:30:00'
EOF
```

---

## 8. Security và Access Control

### 8.1. Database Users & Roles

```sql
-- Create application user
CREATE ROLE portlink_app_user WITH LOGIN PASSWORD 'strong_password_here';

-- Create read-only user (for reporting)
CREATE ROLE portlink_readonly WITH LOGIN PASSWORD 'readonly_password_here';

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA auth TO portlink_app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA operations TO portlink_app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA simulation TO portlink_app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA analytics TO portlink_app_user;

-- Grant sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA auth TO portlink_app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA operations TO portlink_app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA simulation TO portlink_app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA analytics TO portlink_app_user;

-- Read-only access
GRANT SELECT ON ALL TABLES IN SCHEMA operations TO portlink_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA analytics TO portlink_readonly;
```

### 8.2. Row-Level Security (RLS)

```sql
-- Enable RLS on sensitive tables
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own data
CREATE POLICY user_isolation_policy ON auth.users
    FOR ALL
    TO portlink_app_user
    USING (id = current_setting('app.current_user_id')::uuid);

-- Policy: Admins can see all
CREATE POLICY admin_access_policy ON auth.users
    FOR ALL
    TO portlink_app_user
    USING (
        EXISTS (
            SELECT 1 FROM auth.users u
            WHERE u.id = current_setting('app.current_user_id')::uuid
            AND u.role = 'ADMIN'
        )
    );
```

### 8.3. Encryption

```sql
-- Encrypt sensitive columns
ALTER TABLE auth.users 
    ALTER COLUMN password_hash TYPE TEXT 
    USING pgp_sym_encrypt(password_hash, 'encryption_key');

-- Decrypt when reading (handle in application layer for better performance)
-- SELECT pgp_sym_decrypt(password_hash::bytea, 'encryption_key') FROM auth.users;
```

### 8.4. Connection Security

**postgresql.conf:**

```ini
# SSL Configuration
ssl = on
ssl_cert_file = '/etc/postgresql/ssl/server.crt'
ssl_key_file = '/etc/postgresql/ssl/server.key'

# Connection limits
max_connections = 200
superuser_reserved_connections = 3

# Statement timeout (prevent long-running queries)
statement_timeout = 30000  # 30 seconds

# Lock timeout
lock_timeout = 10000  # 10 seconds
```

**pg_hba.conf:**

```
# TYPE  DATABASE        USER                ADDRESS         METHOD
local   all             postgres                            peer
host    all             all                 127.0.0.1/32    md5
hostssl portlink_orchestrator_db portlink_app_user 0.0.0.0/0 md5
hostssl portlink_orchestrator_db portlink_readonly 0.0.0.0/0 md5
```

---

## 9. Monitoring và Maintenance

### 9.1. Query Performance Monitoring

```sql
-- Enable pg_stat_statements
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Top 10 slowest queries
SELECT 
    query,
    calls,
    total_exec_time,
    mean_exec_time,
    max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Table bloat check
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 9.2. Vacuum và Analyze Schedule

```sql
-- Auto-vacuum configuration in postgresql.conf
# autovacuum = on
# autovacuum_vacuum_scale_factor = 0.1
# autovacuum_analyze_scale_factor = 0.05

-- Manual vacuum (can be scheduled)
VACUUM ANALYZE auth.users;
VACUUM ANALYZE operations.tasks;
VACUUM ANALYZE analytics.event_logs;
```

### 9.3. Health Check Queries

```sql
-- Database health check
SELECT 
    'Database Size' as metric,
    pg_size_pretty(pg_database_size(current_database())) as value
UNION ALL
SELECT 
    'Active Connections',
    COUNT(*)::text
FROM pg_stat_activity
WHERE state = 'active'
UNION ALL
SELECT 
    'Idle Connections',
    COUNT(*)::text
FROM pg_stat_activity
WHERE state = 'idle';

-- Cache hit ratio (should be > 90%)
SELECT 
    'Cache Hit Ratio' as metric,
    ROUND(
        100.0 * sum(blks_hit) / (sum(blks_hit) + sum(blks_read)), 2
    ) || '%' as value
FROM pg_stat_database
WHERE datname = current_database();
```

---

## 10. Appendix

### 10.1. Environment Variables

```bash
# Database Connection
DB_HOST=localhost
DB_PORT=5432
DB_NAME=portlink_orchestrator_db
DB_USER=portlink_app_user
DB_PASSWORD=strong_password_here
DB_SSL=true

# Connection Pool
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_POOL_IDLE_TIMEOUT=30000

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis_password_here
REDIS_DB=0
```

### 10.2. Database Connection (Node.js)

```typescript
// File: src/config/database.config.ts

import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    
    // SSL Configuration
    ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false
    } : false,
    
    // Connection Pool
    extra: {
        min: parseInt(process.env.DB_POOL_MIN, 10),
        max: parseInt(process.env.DB_POOL_MAX, 10),
        idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT, 10),
    },
    
    // Auto-load entities
    entities: ['dist/**/*.entity{.ts,.js}'],
    
    // Migrations
    migrations: ['dist/database/migrations/*{.ts,.js}'],
    migrationsRun: true,
    
    // Logging
    logging: process.env.NODE_ENV === 'development',
    logger: 'advanced-console',
    
    // Synchronize (NEVER use in production)
    synchronize: false,
};
```

### 10.3. Sample Queries

**Get Active Schedule with Tasks:**

```sql
SELECT 
    s.id as schedule_id,
    s.name as schedule_name,
    t.id as task_id,
    t.task_type,
    sv.ship_name,
    a_berth.name as berth_name,
    a_crane.name as crane_name,
    t.start_time_predicted,
    t.end_time_predicted,
    t.status
FROM operations.schedules s
JOIN operations.tasks t ON t.schedule_id = s.id
JOIN operations.ship_visits sv ON sv.id = t.ship_visit_id
LEFT JOIN operations.assets a_berth ON a_berth.id = t.berth_id
LEFT JOIN operations.assets a_crane ON a_crane.id = t.crane_id
WHERE s.is_active = true
    AND s.is_simulation = false
    AND t.status NOT IN ('CANCELLED')
ORDER BY t.start_time_predicted;
```

**Calculate KPIs:**

```sql
-- Average ship waiting time (last 24 hours)
SELECT 
    AVG(
        EXTRACT(EPOCH FROM (eta_actual - eta_tos)) / 3600
    ) as avg_waiting_time_hours
FROM operations.ship_visits
WHERE eta_actual IS NOT NULL
    AND eta_actual > CURRENT_TIMESTAMP - INTERVAL '24 hours';

-- Berth utilization
SELECT 
    a.code as berth_code,
    a.name as berth_name,
    COUNT(t.id) as total_tasks,
    SUM(
        EXTRACT(EPOCH FROM (t.end_time_predicted - t.start_time_predicted)) / 3600
    ) as total_occupied_hours,
    ROUND(
        100.0 * SUM(
            EXTRACT(EPOCH FROM (t.end_time_predicted - t.start_time_predicted))
        ) / (24 * 3600),
        2
    ) as utilization_percent
FROM operations.assets a
LEFT JOIN operations.tasks t ON t.berth_id = a.id
    AND t.start_time_predicted >= CURRENT_TIMESTAMP
    AND t.start_time_predicted < CURRENT_TIMESTAMP + INTERVAL '24 hours'
    AND t.status NOT IN ('CANCELLED')
WHERE a.type = 'BERTH'
    AND a.deleted_at IS NULL
GROUP BY a.id, a.code, a.name;
```

---

## 11. Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-02 | System Architect | Initial database design document |

---

**Kết thúc Database Design Document**
