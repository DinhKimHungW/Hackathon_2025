# Phase 5.11.4: Missing Pages Implementation - PLAN

## Overview
Implement the remaining pages that are currently missing or have placeholder content. Focus on creating functional, polished pages with proper layouts, data display, and user interactions.

---

## 🎯 Objectives

1. **Schedules Page** - Port operation schedules and timelines
2. **Tasks Page** - Task management and assignments
3. **Assets Page** - Port assets and equipment management
4. **Conflicts Page** - Schedule conflicts and resolutions
5. **Simulation Page** - Port operation simulations
6. **Event Logs Page** - System event history
7. **Settings Page** - Application settings
8. **Profile Page** - User profile management

---

## 📋 Priority Order

### High Priority (Core Functionality)
1. **Schedules Page** - Critical for port operations
2. **Tasks Page** - Essential for workflow management
3. **Assets Page** - Important for resource tracking

### Medium Priority (Supporting Features)
4. **Event Logs Page** - Important for monitoring
5. **Conflicts Page** - Helps prevent scheduling issues
6. **Settings Page** - User preferences

### Lower Priority (Advanced Features)
7. **Simulation Page** - Advanced planning tool
8. **Profile Page** - User personalization

---

## 🚀 Implementation Plan

### Phase 5.11.4.1: Schedules Page
**File**: `frontend/src/features/schedules/SchedulesList.tsx`

**Features**:
- [ ] Calendar view (day/week/month)
- [ ] Timeline visualization
- [ ] Schedule list with filters
- [ ] Create/Edit schedule dialog
- [ ] Conflict indicators
- [ ] Export to calendar formats

**Components Needed**:
- ScheduleCalendar (using MUI date components)
- ScheduleTimeline (gantt-style)
- ScheduleCard
- ScheduleFilters
- CreateScheduleDialog

**Data Structure**:
```typescript
interface Schedule {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  shipVisitId?: string;
  berthId?: string;
  taskIds: string[];
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### Phase 5.11.4.2: Tasks Page
**File**: `frontend/src/features/tasks/TasksList.tsx`

**Features**:
- [ ] Kanban board view
- [ ] List view with sorting
- [ ] Task filtering (status, priority, assignee)
- [ ] Create/Edit task dialog
- [ ] Bulk task assignment
- [ ] Subtask support
- [ ] Progress tracking

**Components Needed**:
- TaskKanbanBoard (drag & drop)
- TaskCard
- TaskListItem
- TaskFilters
- CreateTaskDialog
- TaskDetailsPanel

**Data Structure**:
```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignedTo?: string;
  dueDate?: Date;
  shipVisitId?: string;
  scheduleId?: string;
  tags: string[];
  subtasks: SubTask[];
  progress: number; // 0-100
  createdAt: Date;
  updatedAt: Date;
}
```

---

### Phase 5.11.4.3: Assets Page
**File**: `frontend/src/features/assets/AssetsList.tsx`

**Features**:
- [ ] Asset inventory list
- [ ] Asset status tracking
- [ ] Maintenance schedule
- [ ] Asset allocation
- [ ] Filter by type/status/location
- [ ] Asset details modal

**Components Needed**:
- AssetCard
- AssetListItem
- AssetTable
- AssetFilters
- AssetDetailsDialog
- MaintenanceSchedule

**Data Structure**:
```typescript
interface Asset {
  id: string;
  name: string;
  type: 'CRANE' | 'FORKLIFT' | 'TRUCK' | 'CONTAINER' | 'EQUIPMENT';
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'OUT_OF_SERVICE';
  location: string;
  capacity?: number;
  currentLoad?: number;
  assignedTo?: string;
  maintenanceSchedule?: MaintenanceRecord[];
  lastInspection?: Date;
  nextMaintenance?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### Phase 5.11.4.4: Event Logs Page
**File**: `frontend/src/features/eventLogs/EventLogsList.tsx`

**Features**:
- [ ] Real-time event stream
- [ ] Filter by type/severity/user/date
- [ ] Search functionality
- [ ] Event details expansion
- [ ] Export logs (CSV/JSON)
- [ ] Event type icons

**Components Needed**:
- EventLogList
- EventLogItem
- EventLogFilters
- EventDetailsExpansion
- EventTypeIcon

**Data Structure**:
```typescript
interface EventLog {
  id: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  category: 'SHIP_VISIT' | 'TASK' | 'ASSET' | 'SCHEDULE' | 'USER' | 'SYSTEM';
  message: string;
  details?: Record<string, any>;
  userId?: string;
  username?: string;
  ipAddress?: string;
  timestamp: Date;
}
```

---

### Phase 5.11.4.5: Conflicts Page
**File**: `frontend/src/features/conflicts/ConflictsList.tsx`

**Features**:
- [ ] Conflict detection list
- [ ] Visual conflict indicators
- [ ] Resolution suggestions
- [ ] Resolve conflict action
- [ ] Conflict history
- [ ] Filter by type/status

**Components Needed**:
- ConflictCard
- ConflictTimeline
- ConflictFilters
- ResolveConflictDialog
- ConflictSuggestions

**Data Structure**:
```typescript
interface Conflict {
  id: string;
  type: 'BERTH_OVERLAP' | 'RESOURCE_DOUBLE_BOOKING' | 'SCHEDULE_CLASH' | 'CAPACITY_EXCEEDED';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'DETECTED' | 'ACKNOWLEDGED' | 'RESOLVING' | 'RESOLVED' | 'IGNORED';
  entities: ConflictEntity[];
  detectedAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolution?: string;
  suggestions?: string[];
}
```

---

### Phase 5.11.4.6: Settings Page
**File**: `frontend/src/features/settings/Settings.tsx`

**Features**:
- [ ] User preferences
- [ ] Theme selection (light/dark/auto)
- [ ] Language selection
- [ ] Notification settings
- [ ] Display preferences
- [ ] Time zone settings
- [ ] Export/Import settings

**Components Needed**:
- SettingsTabs
- GeneralSettings
- AppearanceSettings
- NotificationSettings
- PrivacySettings

**Settings Structure**:
```typescript
interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  language: 'en' | 'vi';
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  notifications: {
    email: boolean;
    push: boolean;
    shipArrivals: boolean;
    taskAssignments: boolean;
    conflicts: boolean;
  };
  display: {
    defaultView: 'grid' | 'list' | 'table';
    itemsPerPage: number;
    showTutorials: boolean;
  };
}
```

---

### Phase 5.11.4.7: Profile Page
**File**: `frontend/src/features/profile/Profile.tsx`

**Features**:
- [ ] User information display
- [ ] Edit profile form
- [ ] Avatar upload
- [ ] Password change
- [ ] Activity history
- [ ] Notification preferences

**Components Needed**:
- ProfileHeader
- ProfileForm
- AvatarUpload
- PasswordChangeDialog
- ActivityTimeline

---

### Phase 5.11.4.8: Simulation Page
**File**: `frontend/src/features/simulation/SimulationPage.tsx`

**Features**:
- [ ] Simulation scenario setup
- [ ] Parameter configuration
- [ ] Run simulation
- [ ] Results visualization
- [ ] Compare scenarios
- [ ] Export results

**Components Needed**:
- SimulationConfig
- SimulationRunner
- SimulationResults
- ResultsChart
- ScenarioComparison

---

## 🎨 Design Patterns to Reuse

### From Ship Visits Page
1. **ViewToggle** - Grid/List/Table switching
2. **Filters with Basic/Advanced** - Toggle filter modes
3. **Bulk Actions Toolbar** - Multi-select operations
4. **Empty States** - No data placeholders
5. **Loading Skeletons** - Loading states
6. **Status Badges** - Color-coded status indicators

### Common Components to Create
1. **DataTable** - Reusable table with sorting/filtering
2. **Timeline** - Vertical/horizontal timeline component
3. **EmptyState** - Consistent empty state design
4. **ConfirmDialog** - Reusable confirmation dialog
5. **FormDialog** - Modal form wrapper

---

## 📦 Redux Slices Needed

Each feature will need a Redux slice:

```typescript
// schedules/schedulesSlice.ts
// tasks/tasksSlice.ts
// assets/assetsSlice.ts
// eventLogs/eventLogsSlice.ts
// conflicts/conflictsSlice.ts
// settings/settingsSlice.ts
```

Each slice should follow the pattern:
- State: { items, loading, error, filters, pagination }
- Thunks: fetchItems, createItem, updateItem, deleteItem
- Selectors: selectItems, selectLoading, selectError

---

## 🔧 Implementation Strategy

### Phase 1: Core Pages (1-3)
1. Create basic page structure
2. Implement list view with filters
3. Add create/edit dialogs
4. Connect to Redux/API

### Phase 2: Supporting Pages (4-6)
1. Reuse components from Phase 1
2. Add page-specific features
3. Integrate with existing features

### Phase 3: Advanced Pages (7-8)
1. Build on existing patterns
2. Add advanced visualizations
3. Polish and testing

---

## 📝 File Structure

```
frontend/src/features/
├── schedules/
│   ├── SchedulesList.tsx
│   ├── schedulesSlice.ts
│   └── components/
│       ├── ScheduleCalendar.tsx
│       ├── ScheduleTimeline.tsx
│       ├── ScheduleCard.tsx
│       ├── ScheduleFilters.tsx
│       └── CreateScheduleDialog.tsx
├── tasks/
│   ├── TasksList.tsx
│   ├── tasksSlice.ts
│   └── components/
│       ├── TaskKanbanBoard.tsx
│       ├── TaskCard.tsx
│       ├── TaskFilters.tsx
│       └── CreateTaskDialog.tsx
├── assets/
│   ├── AssetsList.tsx
│   ├── assetsSlice.ts
│   └── components/
│       ├── AssetCard.tsx
│       ├── AssetFilters.tsx
│       └── AssetDetailsDialog.tsx
├── eventLogs/
│   ├── EventLogsList.tsx
│   ├── eventLogsSlice.ts
│   └── components/
│       ├── EventLogItem.tsx
│       └── EventLogFilters.tsx
├── conflicts/
│   ├── ConflictsList.tsx
│   ├── conflictsSlice.ts
│   └── components/
│       ├── ConflictCard.tsx
│       └── ResolveConflictDialog.tsx
├── settings/
│   ├── Settings.tsx
│   └── components/
│       ├── GeneralSettings.tsx
│       ├── AppearanceSettings.tsx
│       └── NotificationSettings.tsx
├── profile/
│   ├── Profile.tsx
│   └── components/
│       ├── ProfileForm.tsx
│       └── AvatarUpload.tsx
└── simulation/
    ├── SimulationPage.tsx
    └── components/
        ├── SimulationConfig.tsx
        └── SimulationResults.tsx
```

---

## 🎯 Success Criteria

For each page:
- [ ] Responsive design (mobile/tablet/desktop)
- [ ] Loading states with skeletons
- [ ] Empty states with helpful messages
- [ ] Error handling with user feedback
- [ ] Accessible (keyboard navigation, ARIA labels)
- [ ] Consistent with design system
- [ ] Redux state management
- [ ] Type-safe with TypeScript

---

## 🚦 Starting Point

**Begin with Schedules Page** - Most critical for port operations and will establish patterns for other pages.

Next steps:
1. Create SchedulesList.tsx with basic layout
2. Create schedulesSlice.ts for state management
3. Build ScheduleCalendar component
4. Add filters and view modes
5. Implement create/edit functionality
6. Test and iterate

---

## 📚 Dependencies

Existing:
- MUI components
- Redux Toolkit
- React Router
- date-fns

New (if needed):
- @mui/x-date-pickers (already installed)
- react-beautiful-dnd (for Kanban drag & drop)
- recharts or nivo (for advanced charts in simulation)

---

## ⏱️ Estimated Timeline

- **Schedules**: 2-3 sessions
- **Tasks**: 2-3 sessions
- **Assets**: 2 sessions
- **Event Logs**: 1-2 sessions
- **Conflicts**: 2 sessions
- **Settings**: 1 session
- **Profile**: 1 session
- **Simulation**: 2-3 sessions

**Total**: ~15-20 development sessions

---

## 📊 Current Status

- [x] Phase 5.11.1: Dashboard Redesign
- [x] Phase 5.11.2: Ship Visits Views
- [x] Phase 5.11.3: Advanced Filters & Bulk Actions
- [ ] Phase 5.11.4: Missing Pages Implementation ← **STARTING NOW**

**Next Action**: Begin with Schedules Page (Phase 5.11.4.1)
