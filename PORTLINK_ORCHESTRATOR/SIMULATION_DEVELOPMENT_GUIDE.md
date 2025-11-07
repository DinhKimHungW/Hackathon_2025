# SIMULATION MODULE - DEVELOPMENT GUIDE

**Dự án:** PortLink Orchestrator - Simulation & What-If Engine  
**Ngày:** 04/11/2025  
**Trạng thái:** Backend Complete ✅ | Frontend In Development 🚧

---

## 1. OVERVIEW

### 1.1. Mục tiêu
Module Simulation cho phép người điều phối (P-1) và quản lý (P-4):
- **Tạo kịch bản "What-If"** để dự đoán tác động của các sự kiện (tàu trễ, bảo trì thiết bị)
- **Phát hiện xung đột** trước khi chúng xảy ra trong thực tế
- **Nhận đề xuất tối ưu** để giải quyết xung đột
- **So sánh metrics** giữa lịch gốc và lịch mô phỏng

### 1.2. Yêu cầu từ SRS
- **RQF-008:** Giao diện "What-If" để nhập kịch bản giả định
- **RQF-010:** Bộ máy mô phỏng tính toán lại lịch trình
- **RQF-011:** Tự động dự đoán và làm nổi bật xung đột
- **RQF-012:** Hiển thị kết quả trên Gantt chart
- **RQF-013:** Đề xuất giải pháp tối ưu
- **RQN-001:** Thời gian chạy mô phỏng **< 5 giây** ⚠️

---

## 2. BACKEND ARCHITECTURE (✅ IMPLEMENTED)

### 2.1. Core Services

#### **SimulationService** (`backend/src/modules/simulation/simulation.service.ts`)
**Trách nhiệm chính:**
```typescript
runSimulation(dto: CreateSimulationDto): Promise<SimulationResultDto>
```

**Flow (7 bước):**
1. **Validate** base schedule tồn tại
2. **Clone** schedule + tasks (tạo bản sao để thao tác)
3. **Apply Scenario** changes (ship delay / asset maintenance / custom)
4. **Recalculate** schedule times (shift tasks theo delay)
5. **Detect Conflicts** (gọi ConflictDetectionService)
6. **Generate Recommendations** (gọi RecommendationService)
7. **Calculate Metrics** (affected tasks, delay hours, utilization)

**Performance:** 
- Đo thời gian execution (`executionTimeMs`)
- Log warning nếu > 5000ms
- Cache kết quả trong Redis (TTL: 1 hour)

#### **ConflictDetectionService** (`conflict-detection.service.ts`)
**Phát hiện 4 loại xung đột:**
- `RESOURCE_DOUBLE_BOOKING`: Cùng asset, cùng thời gian
- `CAPACITY_EXCEEDED`: Vượt capacity của asset
- `TIME_CONSTRAINT_VIOLATION`: Vi phạm dependency tasks
- `DEPENDENCY_VIOLATION`: Task predecessor chưa complete

**Algorithm:**
```typescript
// Pseudo-code
for each task1 in schedule:
  for each task2 in schedule (where task2 !== task1):
    if task1.assetId === task2.assetId:
      if timeOverlap(task1, task2):
        => conflict!
```

#### **RecommendationService** (`recommendation.service.ts`)
**Tạo giải pháp cho từng conflict:**
- **Reschedule Task:** Delay task đến sau conflict
- **Reassign Asset:** Chuyển task sang asset khác (available)
- **Split Task:** Chia task thành 2 phases (trước/sau conflict)
- **Adjust Priority:** Đề xuất thay đổi priority order

### 2.2. DTOs & Types

```typescript
// Input: Tạo simulation
interface CreateSimulationDto {
  name: string;
  baseScheduleId: string; // Schedule gốc
  scenarioType: ScenarioType; // SHIP_DELAY | ASSET_MAINTENANCE | CUSTOM
  changes: Array<{
    entityType: 'ship_visit' | 'asset' | 'task';
    entityId?: string;
    field: string;
    oldValue: any;
    newValue: any; // e.g., delay hours, maintenance window
  }>;
}

// Output: Kết quả simulation
interface SimulationResultDto {
  id: string;
  name: string;
  status: SimulationStatus; // PENDING | RUNNING | COMPLETED | FAILED
  baseScheduleId: string;
  resultScheduleId: string; // Schedule sau khi clone & apply changes
  scenarioType: ScenarioType;
  executionTimeMs: number; // ⚠️ Must be < 5000
  conflictsDetected: number;
  conflicts: ConflictDetailDto[];
  recommendations: RecommendationDto[];
  metrics: {
    totalTasks: number;
    affectedTasks: number;
    totalDelayHours: number;
    resourceUtilizationBefore: number;
    resourceUtilizationAfter: number;
  };
  startedAt: Date;
  completedAt: Date;
}
```

### 2.3. API Endpoints (Backend)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/simulation/run` | Chạy simulation mới | OPS, ADMIN |
| GET | `/api/v1/simulation/:id` | Lấy kết quả simulation (cached) | OPS, ADMIN, MANAGER |
| POST | `/api/v1/simulation/:id/apply` | Apply simulation (activate result schedule) | ADMIN |
| DELETE | `/api/v1/simulation/:id` | Xóa simulation | ADMIN |

### 2.4. WebSocket Events

**Emitted by Backend:**
```typescript
// Khi simulation bắt đầu
emit('simulation:started', { name, scenarioType, timestamp });

// Khi simulation hoàn thành
emit('simulation:completed', SimulationResultDto);

// Khi simulation thất bại
emit('simulation:failed', { name, error, timestamp });
```

---

## 3. FRONTEND DEVELOPMENT (🚧 TO DO)

### 3.1. Yêu cầu Giao diện

#### **3.1.1. SimulationPage Layout**
```
┌─────────────────────────────────────────────────────────────┐
│ Simulation & What-If Scenarios                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────┐  ┌──────────────────────────┐ │
│  │  Create Simulation      │  │  Recent Simulations      │ │
│  │  ----------------       │  │  -------------------     │ │
│  │  • Scenario Name        │  │  [List of past runs]     │ │
│  │  • Base Schedule        │  │  - Ship Delay 3h (2h ago)│ │
│  │  • Scenario Type:       │  │  - Crane Maint (5h ago)  │ │
│  │    [ ] Ship Delay       │  │                          │ │
│  │    [ ] Asset Maint      │  │  [View Details] [Delete] │ │
│  │    [ ] Custom           │  │                          │ │
│  │                         │  └──────────────────────────┘ │
│  │  [Configuration Panel]  │                               │
│  │                         │                               │
│  │  [Run Simulation] 🚀    │                               │
│  └─────────────────────────┘                               │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Simulation Results (If run)                          │ │
│  │  ──────────────────────────────────────────────────── │ │
│  │  ✅ Completed in 2.3s                                 │ │
│  │                                                        │ │
│  │  📊 Metrics Comparison                                │ │
│  │  • Total Tasks: 15 → 15                               │ │
│  │  • Affected Tasks: 0 → 7                              │ │
│  │  • Total Delay: 0h → 3.5h                             │ │
│  │                                                        │ │
│  │  ⚠️ Conflicts Detected: 2                             │ │
│  │  [Show Details]                                       │ │
│  │                                                        │ │
│  │  💡 Recommendations: 3                                │ │
│  │  [View Suggestions]                                   │ │
│  │                                                        │ │
│  │  📈 Gantt Comparison                                  │ │
│  │  [Original Schedule (gray) vs Simulated (colored)]   │ │
│  │                                                        │ │
│  │  [Apply Simulation] [Discard]                         │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### **3.1.2. Configuration Panels (Theo Scenario Type)**

**A. Ship Delay Scenario:**
```typescript
interface ShipDelayConfig {
  shipVisitId: string;    // Select từ dropdown
  delayHours: number;     // Input number (1-48)
  reason: string;         // Optional text
}
```

**Form Fields:**
- **Ship:** Dropdown list ship visits (từ active schedule)
- **Delay (hours):** Number input (min: 1, max: 48)
- **Reason:** Text input (optional)

**B. Asset Maintenance Scenario:**
```typescript
interface AssetMaintenanceConfig {
  assetId: string;           // Select từ dropdown (berths/cranes)
  maintenanceStart: Date;    // DateTimePicker
  maintenanceDuration: number; // Hours
  notes: string;             // Optional
}
```

**Form Fields:**
- **Asset:** Dropdown (filter by type: Berth/Crane)
- **Start Time:** DateTimePicker
- **Duration (hours):** Number input
- **Notes:** Textarea

**C. Custom Scenario:**
```typescript
interface CustomConfig {
  changes: Array<{
    entityType: 'task' | 'asset';
    entityId: string;
    field: string;
    newValue: any;
  }>;
}
```

**Form:** Dynamic list cho phép add/remove changes.

### 3.2. Redux State Management

#### **3.2.1. simulationSlice.ts**

```typescript
interface SimulationState {
  scenarios: SimulationResultDto[];
  currentScenario: SimulationResultDto | null;
  loading: boolean;
  error: string | null;
}

// Thunks
export const runSimulation = createAsyncThunk(
  'simulation/run',
  async (dto: CreateSimulationDto) => {
    const response = await simulationApi.runSimulation(dto);
    return response.data;
  }
);

export const fetchSimulationResult = createAsyncThunk(
  'simulation/fetchResult',
  async (id: string) => {
    const response = await simulationApi.getSimulation(id);
    return response.data;
  }
);

export const applySimulation = createAsyncThunk(
  'simulation/apply',
  async (id: string) => {
    await simulationApi.applySimulation(id);
    return id;
  }
);
```

#### **3.2.2. simulationApi.ts**

```typescript
export const simulationApi = {
  runSimulation: (dto: CreateSimulationDto) =>
    axiosInstance.post('/simulation/run', dto),
  
  getSimulation: (id: string) =>
    axiosInstance.get(`/simulation/${id}`),
  
  applySimulation: (id: string) =>
    axiosInstance.post(`/simulation/${id}/apply`),
  
  deleteSimulation: (id: string) =>
    axiosInstance.delete(`/simulation/${id}`),
};
```

### 3.3. Key Components

#### **3.3.1. ScenarioForm Component**

**Props:**
```typescript
interface ScenarioFormProps {
  onSubmit: (dto: CreateSimulationDto) => void;
  loading: boolean;
}
```

**Features:**
- Multi-step form (Wizard):
  1. Select scenario type
  2. Configure scenario (dynamic form)
  3. Review & confirm
- Validation (react-hook-form + yup)
- Real-time preview of changes

#### **3.3.2. SimulationResults Component**

**Props:**
```typescript
interface SimulationResultsProps {
  result: SimulationResultDto;
  onApply: () => void;
  onDiscard: () => void;
}
```

**Sub-components:**
- **MetricsComparison:** Before/After cards
- **ConflictsList:** Expandable conflict details với severity badges
- **RecommendationsList:** Actionable suggestions
- **GanttComparison:** Dual Gantt (original gray overlay + simulated colored)

#### **3.3.3. ConflictDetails Component**

```typescript
interface ConflictDetailsProps {
  conflict: ConflictDetailDto;
}
```

**Display:**
```
⚠️ RESOURCE_DOUBLE_BOOKING (Severity: HIGH)
───────────────────────────────────────────
Description: Berth B-01 double-booked at 14:00-16:00

Affected Tasks:
• Task #123: Ship A - Loading (14:00 - 15:30)
• Task #124: Ship B - Unloading (14:30 - 16:00)

Overlap: 1 hour
```

#### **3.3.4. RecommendationCard Component**

```typescript
interface RecommendationCardProps {
  recommendation: RecommendationDto;
  onAccept?: () => void;
}
```

**Display:**
```
💡 Recommendation #1: Reassign Asset

Type: REASSIGN_ASSET
Description: Move Task #124 to Berth B-02 (available 14:00-18:00)

Estimated Impact:
• Eliminates conflict
• No additional delay
• Berth B-02 utilization: 85% → 92%

[Accept] [Dismiss]
```

### 3.4. WebSocket Integration

```typescript
// In SimulationPage.tsx
useEffect(() => {
  const socket = io(WEBSOCKET_URL);

  socket.on('simulation:started', (data) => {
    toast.info(`Simulation "${data.name}" started...`);
    setLoading(true);
  });

  socket.on('simulation:completed', (result: SimulationResultDto) => {
    toast.success(`Simulation completed in ${result.executionTimeMs}ms`);
    dispatch(simulationSlice.actions.setCurrentScenario(result));
    setLoading(false);
  });

  socket.on('simulation:failed', (data) => {
    toast.error(`Simulation failed: ${data.error}`);
    setLoading(false);
  });

  return () => socket.disconnect();
}, []);
```

### 3.5. Gantt Chart Integration

**Requirements:**
- Hiển thị **2 layers** trên cùng 1 timeline:
  - **Layer 1 (Background, Gray, 50% opacity):** Original schedule tasks
  - **Layer 2 (Foreground, Colored):** Simulated schedule tasks
- Highlight conflicts bằng red border
- Tooltips show task details + changes

**Implementation (D3.js):**
```typescript
// Pseudo-code
const ganttData = {
  original: originalSchedule.tasks.map(/* transform */),
  simulated: simulatedSchedule.tasks.map(/* transform */),
  conflicts: conflicts.map(/* mark positions */),
};

// Render original tasks (gray bars)
svg.selectAll('.original-task')
  .data(ganttData.original)
  .enter()
  .append('rect')
  .attr('class', 'original-task')
  .style('fill', '#ccc')
  .style('opacity', 0.5);

// Render simulated tasks (colored bars)
svg.selectAll('.simulated-task')
  .data(ganttData.simulated)
  .enter()
  .append('rect')
  .attr('class', 'simulated-task')
  .style('fill', d => getTaskColor(d.status))
  .style('stroke', d => hasConflict(d) ? 'red' : 'none');
```

---

## 4. TESTING SCENARIOS

### 4.1. Test Case 1: Ship Delay Scenario

**Setup:**
```
Base Schedule (Active):
• Ship A: 10:00 - 12:00 (Berth B-01, Crane C-01)
• Ship B: 12:00 - 14:00 (Berth B-01, Crane C-02)
```

**Action:**
```typescript
const dto: CreateSimulationDto = {
  name: 'Test Ship A Delay 3h',
  baseScheduleId: 'active-schedule-id',
  scenarioType: ScenarioType.SHIP_DELAY,
  changes: [{
    entityType: 'ship_visit',
    entityId: 'ship-a-id',
    field: 'etaActual',
    oldValue: '10:00',
    newValue: 3, // Delay 3 hours
  }],
};
```

**Expected Result:**
```typescript
{
  executionTimeMs: < 5000,
  conflictsDetected: 1,
  conflicts: [{
    type: 'RESOURCE_DOUBLE_BOOKING',
    severity: 'HIGH',
    description: 'Berth B-01 double-booked 13:00-14:00',
    affectedTasks: ['Task A (13:00-15:00)', 'Task B (12:00-14:00)'],
  }],
  recommendations: [{
    type: 'DELAY_TASK',
    description: 'Delay Ship B to 15:00-17:00',
  }],
  metrics: {
    affectedTasks: 2,
    totalDelayHours: 3,
  },
}
```

### 4.2. Test Case 2: Asset Maintenance

**Setup:**
```
Base Schedule:
• Task 1: 14:00 - 16:00 (Crane C-01)
• Task 2: 16:00 - 18:00 (Crane C-01)
```

**Action:**
```typescript
const dto: CreateSimulationDto = {
  name: 'Crane C-01 Maintenance',
  baseScheduleId: 'active-schedule-id',
  scenarioType: ScenarioType.ASSET_MAINTENANCE,
  changes: [{
    entityType: 'asset',
    entityId: 'crane-c-01',
    field: 'maintenanceWindow',
    newValue: {
      maintenanceStart: '15:00',
      maintenanceDuration: 2, // 2 hours
    },
  }],
};
```

**Expected Result:**
```typescript
{
  conflictsDetected: 1,
  conflicts: [{
    type: 'RESOURCE_DOUBLE_BOOKING',
    description: 'Task 1 overlaps with maintenance 15:00-17:00',
  }],
  recommendations: [{
    type: 'REASSIGN_ASSET',
    description: 'Move Task 1 to Crane C-02',
  }],
}
```

---

## 5. PERFORMANCE OPTIMIZATION

### 5.1. Backend Optimizations

**✅ Already Implemented:**
- **Redis Caching:** Cache simulation results (1 hour TTL)
- **Transaction Rollback:** Use QueryRunner for atomic operations
- **Selective Loading:** Only load necessary relations

**🚧 Future Improvements:**
- **Parallel Conflict Detection:** Use `Promise.all()` để check conflicts đồng thời
- **Incremental Recalculation:** Chỉ recalculate affected tasks (không phải toàn bộ schedule)
- **Indexing:** Add indexes cho `startTime`, `endTime`, `assetId` trong tasks table

### 5.2. Frontend Optimizations

- **Debounce Form Inputs:** Tránh re-render liên tục khi user typing
- **Memoize Gantt Data:** Use `useMemo` cho gantt transformations
- **Virtual Scrolling:** Nếu conflict list/task list quá dài (react-window)
- **Code Splitting:** Lazy load Simulation page (`React.lazy()`)

---

## 6. ACCEPTANCE CRITERIA

### Backend:
- [x] `runSimulation()` execution time < 5s (95% test cases)
- [x] Phát hiện 4 loại conflicts
- [x] Generate 3+ recommendation types
- [x] Redis cache working (verified via logs)
- [x] WebSocket events emitted correctly

### Frontend (TODO):
- [ ] Scenario form validation đầy đủ
- [ ] Gantt chart hiển thị 2 layers (original + simulated)
- [ ] Conflict list với severity badges
- [ ] Recommendation cards với accept/dismiss actions
- [ ] Real-time progress via WebSocket
- [ ] Mobile responsive (iPad trở lên)

---

## 7. NEXT STEPS

### 7.1. Immediate (Week 1)
1. **Tạo SimulationPage UI**
   - Replace placeholder với ScenarioForm
   - Implement 3 scenario type forms
   
2. **Redux Integration**
   - Setup simulationSlice.ts
   - Connect to API endpoints

3. **Results Display**
   - MetricsComparison component
   - ConflictsList component
   - Basic recommendations display

### 7.2. Short-term (Week 2)
4. **Gantt Comparison**
   - Dual-layer rendering
   - Conflict highlighting
   - Tooltips with change details

5. **WebSocket Real-time**
   - Progress indicators
   - Live updates

6. **Polish & Testing**
   - E2E tests cho các scenarios
   - Performance profiling
   - Bug fixes

---

## 8. RESOURCES

### Backend Code:
- `backend/src/modules/simulation/simulation.service.ts`
- `backend/src/modules/simulation/conflict-detection.service.ts`
- `backend/src/modules/simulation/recommendation.service.ts`

### Frontend Placeholder:
- `frontend/src/features/simulation/SimulationPage.tsx`

### API Documentation:
- Swagger: `http://localhost:4000/api/docs#/Simulation`

### References:
- PortLinkSRS.md (RQF-008 đến RQF-013)
- Dev_outline.md (Phase 4: Simulation Engine)
- API_Specification_Document.md

---

**✅ Backend Implementation Complete**  
**🚧 Frontend Development Ready to Start**  

_Last Updated: 04/11/2025_
