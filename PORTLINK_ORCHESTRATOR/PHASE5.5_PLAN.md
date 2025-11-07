# Phase 5.5: Schedule & Task Management UI

**Status**: Planning  
**Priority**: High  
**Dependencies**: Phase 5.4 Complete ✅  
**Estimated Duration**: 8-10 hours  
**Target Date**: November 3-4, 2025

---

## 📋 Overview

Implement comprehensive Schedule and Task Management UI with:
- **Schedule Calendar View** (Weekly/Monthly)
- **Task List with Kanban Board**
- **Task Assignment & Tracking**
- **Gantt Chart for Schedules**
- **Real-time Updates** via WebSocket
- **Drag & Drop** for task assignment

---

## 🎯 Goals

1. ✅ Enable port operators to view and manage schedules
2. ✅ Provide task assignment and tracking capabilities
3. ✅ Visualize schedule timeline with Gantt chart
4. ✅ Support drag-and-drop task management (Kanban)
5. ✅ Real-time collaboration via WebSocket
6. ✅ Filter and search tasks by status, assignee, date

---

## 📝 Step-by-Step Plan

### **Step 1: Redux Slices** (2 files, ~600 lines)

**Files to create**:
1. `frontend/src/features/schedules/schedulesSlice.ts` (~300 lines)
2. `frontend/src/features/tasks/tasksSlice.ts` (~300 lines)

**Features**:

**Schedule Slice**:
```typescript
// State
interface SchedulesState {
  schedules: Schedule[];
  currentSchedule: Schedule | null;
  calendarView: 'week' | 'month';
  selectedDate: Date;
  filters: ScheduleFilters;
  loading: boolean;
  error: string | null;
}

// Async Thunks
fetchSchedules()
fetchScheduleById(id)
createSchedule(data)
updateSchedule(id, data)
deleteSchedule(id)
fetchSchedulesByDateRange(start, end)

// Reducers
setCalendarView(view)
setSelectedDate(date)
setFilters(filters)
addScheduleRealtime(schedule)
updateScheduleRealtime(schedule)
removeScheduleRealtime(id)
```

**Task Slice**:
```typescript
// State
interface TasksState {
  tasks: Task[];
  currentTask: Task | null;
  kanbanColumns: KanbanColumn[];
  filters: TaskFilters;
  loading: boolean;
  error: string | null;
}

// Async Thunks
fetchTasks()
fetchTaskById(id)
createTask(data)
updateTask(id, data)
deleteTask(id)
assignTask(taskId, userId)
updateTaskStatus(taskId, status)
reorderTasks(sourceIndex, destIndex, columnId)

// Reducers
setFilters(filters)
moveTask(taskId, newColumnId, newIndex)
addTaskRealtime(task)
updateTaskRealtime(task)
removeTaskRealtime(id)
```

---

### **Step 2: Schedule Calendar Component** (~400 lines)

**File**: `frontend/src/features/schedules/components/ScheduleCalendar.tsx`

**Features**:
- **Library**: `@mui/x-date-pickers` + `react-big-calendar`
- View modes: Week, Month
- Event click → Show schedule details
- Drag & drop to reschedule
- Color-coded by status
- Toolbar with view toggle + date navigation

**Event Types**:
- Ship Arrival/Departure
- Maintenance Schedule
- Task Deadlines
- Port Operations

**Calendar Props**:
```typescript
<Calendar
  localizer={dateFnsLocalizer}
  events={schedules}
  startAccessor="startTime"
  endAccessor="endTime"
  onSelectEvent={handleEventClick}
  onEventDrop={handleEventDrop}
  views={['week', 'month']}
  defaultView="week"
/>
```

---

### **Step 3: Task Kanban Board** (~500 lines)

**File**: `frontend/src/features/tasks/components/TaskKanban.tsx`

**Features**:
- **Library**: `@hello-pangea/dnd` (react-beautiful-dnd fork)
- 4 Columns: To Do, In Progress, Review, Done
- Drag & drop between columns
- Task cards with assignee avatar
- Quick actions: Edit, Delete, Assign
- Task count per column

**Columns**:
```typescript
const columns = [
  { id: 'TODO', title: 'To Do', color: '#e3f2fd' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: '#fff3e0' },
  { id: 'REVIEW', title: 'Review', color: '#f3e5f5' },
  { id: 'DONE', title: 'Done', color: '#e8f5e9' },
];
```

**Task Card**:
- Task title + description
- Priority badge (High, Medium, Low)
- Due date with countdown
- Assigned user avatar
- Task type icon (Loading, Unloading, Inspection, Maintenance)

---

### **Step 4: Task List View** (~350 lines)

**File**: `frontend/src/features/tasks/TaskList.tsx`

**Features**:
- Material-UI Table with sorting & pagination
- Columns: Title, Type, Status, Priority, Assignee, Due Date, Actions
- Row actions: View, Edit, Delete, Reassign
- Bulk selection for multi-task operations
- Export to CSV

**Filters**:
- Search by title/description
- Filter by status (5 options)
- Filter by assignee (dropdown)
- Filter by priority (3 options)
- Date range picker (due date)

---

### **Step 5: Schedule Gantt Chart** (~450 lines)

**File**: `frontend/src/features/schedules/components/ScheduleGantt.tsx`

**Features**:
- **Library**: `@bryntum/gantt-react` or `dhtmlx-gantt`
- Timeline visualization of schedules
- Dependencies between tasks
- Critical path highlighting
- Progress bars
- Zoom controls (Day, Week, Month)

**Gantt Data**:
```typescript
{
  id: '1',
  text: 'Container Ship Arrival',
  start_date: '2025-11-03',
  duration: 2,
  progress: 0.6,
  parent: 'berth-1',
  color: '#1976d2',
}
```

---

### **Step 6: Task Form Component** (~400 lines)

**File**: `frontend/src/features/tasks/TaskForm.tsx`

**Features**:
- React Hook Form + Yup validation
- Fields:
  - Task Title (required)
  - Description (Quill rich text editor)
  - Task Type (dropdown: LOADING, UNLOADING, INSPECTION, MAINTENANCE)
  - Priority (dropdown: HIGH, MEDIUM, LOW)
  - Status (dropdown: TODO, IN_PROGRESS, REVIEW, DONE)
  - Assignee (autocomplete with user search)
  - Due Date (DateTimePicker)
  - Estimated Hours (number input)
  - Related Schedule (autocomplete)
  - Related Ship Visit (autocomplete)
  - Attachments (file upload)

**Validation**:
```typescript
const schema = yup.object({
  title: yup.string().required().min(3).max(100),
  description: yup.string().max(500),
  type: yup.string().oneOf(['LOADING', 'UNLOADING', 'INSPECTION', 'MAINTENANCE']),
  priority: yup.string().oneOf(['HIGH', 'MEDIUM', 'LOW']),
  assigneeId: yup.string().uuid(),
  dueDate: yup.date().min(new Date(), 'Due date must be in future'),
  estimatedHours: yup.number().positive().max(999),
});
```

---

### **Step 7: Schedule Form Component** (~350 lines)

**File**: `frontend/src/features/schedules/ScheduleForm.tsx`

**Features**:
- React Hook Form + Yup validation
- Fields:
  - Schedule Name (required)
  - Description
  - Schedule Type (dropdown: SHIP_ARRIVAL, MAINTENANCE, PORT_OPERATION)
  - Start Time (DateTimePicker)
  - End Time (DateTimePicker)
  - Berth/Location (autocomplete)
  - Related Ship Visit (autocomplete)
  - Recurrence (dropdown: None, Daily, Weekly, Monthly)
  - Status (dropdown: SCHEDULED, ACTIVE, COMPLETED, CANCELLED)
  - Notes (textarea)

**Validation**:
```typescript
const schema = yup.object({
  name: yup.string().required().min(3).max(100),
  type: yup.string().oneOf(['SHIP_ARRIVAL', 'MAINTENANCE', 'PORT_OPERATION']),
  startTime: yup.date().required(),
  endTime: yup.date().min(yup.ref('startTime'), 'End time must be after start time'),
  berthId: yup.string().uuid(),
  recurrence: yup.string().oneOf(['NONE', 'DAILY', 'WEEKLY', 'MONTHLY']),
});
```

---

### **Step 8: Task Detail Modal** (~300 lines)

**File**: `frontend/src/features/tasks/components/TaskDetailModal.tsx`

**Features**:
- Material-UI Dialog (fullScreen on mobile)
- 3 Sections:
  1. **Overview**: Title, Type, Priority, Status, Assignee
  2. **Timeline**: Created, Started, Completed timestamps
  3. **Activity Log**: Comments, status changes, assignments
- Actions: Edit, Delete, Complete, Reassign
- Comment section with rich text editor
- Attachment preview/download

---

### **Step 9: WebSocket Integration** (2 files, ~400 lines)

**Files**:
1. `frontend/src/features/schedules/hooks/useScheduleSocket.ts` (~200 lines)
2. `frontend/src/features/tasks/hooks/useTaskSocket.ts` (~200 lines)

**Features**:

**Schedule Socket Events**:
```typescript
schedule:created      → addScheduleRealtime() + Notification
schedule:updated      → updateScheduleRealtime() + Notification
schedule:deleted      → removeScheduleRealtime() + Notification
schedule:started      → updateScheduleRealtime() + Notification
schedule:completed    → updateScheduleRealtime() + Notification
```

**Task Socket Events**:
```typescript
task:created          → addTaskRealtime() + Notification
task:updated          → updateTaskRealtime() + Notification
task:deleted          → removeTaskRealtime() + Notification
task:assigned         → updateTaskRealtime() + Notification
task:status-changed   → updateTaskRealtime() + Notification
task:commented        → updateTaskRealtime() + Notification
```

**Socket.IO Configuration**:
```typescript
const SOCKET_URL = 'http://localhost:3000';
const SOCKET_NAMESPACE = '/ws';

const socket = io(`${SOCKET_URL}${SOCKET_NAMESPACE}`, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 3000,
});
```

---

### **Step 10: Testing & Documentation** (~2 hours)

**Testing Checklist**:
- ✅ Schedule Calendar view (week/month toggle)
- ✅ Task Kanban drag & drop
- ✅ Task List sorting & filtering
- ✅ Schedule Gantt chart rendering
- ✅ Task form validation
- ✅ Schedule form validation
- ✅ Task assignment workflow
- ✅ Real-time updates (WebSocket)
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Error handling (401, 404, 500)

**Documentation**:
- Update `PHASE5.5_COMPLETE.md` with:
  - Step-by-step progress
  - File structure
  - Testing results
  - Known issues
  - Lessons learned

---

## 📦 Dependencies to Install

```bash
cd frontend
npm install --save \
  react-big-calendar \
  @hello-pangea/dnd \
  @bryntum/gantt-react \
  react-quill \
  date-fns
```

**Package Purposes**:
- `react-big-calendar`: Schedule calendar component
- `@hello-pangea/dnd`: Drag & drop for Kanban board
- `@bryntum/gantt-react` or `dhtmlx-gantt`: Gantt chart
- `react-quill`: Rich text editor for task descriptions
- `date-fns`: Date manipulation and formatting

---

## 🗂️ File Structure

```
frontend/src/features/
├── schedules/
│   ├── schedulesSlice.ts           (~300 lines) - Redux slice
│   ├── ScheduleList.tsx            (~250 lines) - List page
│   ├── ScheduleForm.tsx            (~350 lines) - Create/Edit form
│   ├── components/
│   │   ├── ScheduleCalendar.tsx    (~400 lines) - Calendar view
│   │   ├── ScheduleGantt.tsx       (~450 lines) - Gantt chart
│   │   └── ScheduleCard.tsx        (~150 lines) - List card
│   └── hooks/
│       └── useScheduleSocket.ts    (~200 lines) - Socket.IO hook
│
└── tasks/
    ├── tasksSlice.ts               (~300 lines) - Redux slice
    ├── TaskList.tsx                (~350 lines) - List page
    ├── TaskForm.tsx                (~400 lines) - Create/Edit form
    ├── components/
    │   ├── TaskKanban.tsx          (~500 lines) - Kanban board
    │   ├── TaskCard.tsx            (~200 lines) - Kanban card
    │   ├── TaskDetailModal.tsx     (~300 lines) - Detail modal
    │   └── TaskFilters.tsx         (~200 lines) - Filter controls
    └── hooks/
        └── useTaskSocket.ts        (~200 lines) - Socket.IO hook
```

**Total**: 16 files, ~4,400 lines

---

## 🎨 UI/UX Design

### **Color Scheme**

**Task Priority**:
```typescript
HIGH:   #d32f2f (red)
MEDIUM: #ed6c02 (orange)
LOW:    #2e7d32 (green)
```

**Task Status**:
```typescript
TODO:        #e3f2fd (light blue)
IN_PROGRESS: #fff3e0 (light orange)
REVIEW:      #f3e5f5 (light purple)
DONE:        #e8f5e9 (light green)
```

**Schedule Type**:
```typescript
SHIP_ARRIVAL:   #1976d2 (blue)
MAINTENANCE:    #ed6c02 (orange)
PORT_OPERATION: #9c27b0 (purple)
```

### **Responsive Breakpoints**

```typescript
Mobile:  0-600px   (Kanban: 1 column, Calendar: Day view only)
Tablet:  600-960px (Kanban: 2 columns, Calendar: Week view)
Desktop: 960px+    (Kanban: 4 columns, Calendar: Week/Month)
```

---

## 🐛 Anticipated Challenges

1. **Drag & Drop Performance**: Large task lists may cause lag
   - **Solution**: Virtualize lists with `react-window`

2. **Gantt Chart Complexity**: Many dependencies can be hard to visualize
   - **Solution**: Implement zoom levels and filters

3. **Calendar Event Overlap**: Multiple events at same time
   - **Solution**: Stack events with visual grouping

4. **Real-time Conflicts**: Multiple users editing same task
   - **Solution**: Implement optimistic updates + conflict resolution

5. **Rich Text Editor**: Handling images and formatting
   - **Solution**: Use Quill with limited toolbar options

---

## 🧪 Testing Strategy

### **Unit Tests**
- Redux slice reducers
- Form validation schemas
- Date formatting utilities
- WebSocket event handlers

### **Integration Tests**
- Calendar event rendering
- Kanban drag & drop
- Gantt chart updates
- Task assignment flow

### **Manual Tests**
- Create/Edit/Delete schedules
- Assign/Reassign tasks
- Drag tasks between Kanban columns
- View Gantt chart dependencies
- Real-time updates across multiple browser windows

---

## 📊 Success Metrics

- ✅ All 16 components render without errors
- ✅ Drag & drop works smoothly (<100ms response)
- ✅ Calendar loads 100 events in <1s
- ✅ Gantt chart renders 50 tasks in <2s
- ✅ WebSocket events update UI in <500ms
- ✅ Form validation shows errors in <100ms
- ✅ Mobile responsive (tested on 360px width)
- ✅ Zero console errors/warnings

---

## 🚀 Next Steps After Phase 5.5

### **Phase 5.6: Assets Management UI**
- Asset List & Detail Views
- Asset Assignment to Tasks
- Maintenance Schedules
- Asset Utilization Dashboard
- QR Code Scanning for Asset Tracking

### **Phase 5.7: Simulation Interface**
- Port Simulation Dashboard
- Resource Allocation Visualization
- Conflict Detection Alerts
- Simulation Controls (Play, Pause, Reset, Speed)
- Scenario Comparison Tool

---

## 📝 Notes

- **Gantt Chart Library**: May need paid license for commercial use (Bryntum). Consider open-source alternatives like `frappe-gantt` or build custom with D3.js.

- **Drag & Drop**: `@hello-pangea/dnd` is maintained fork of deprecated `react-beautiful-dnd`.

- **Calendar Library**: `react-big-calendar` is most popular but has some accessibility issues. Consider alternatives like `@fullcalendar/react`.

- **WebSocket Namespace**: Reuse `/ws` namespace from Phase 5.4, add new event types for schedules and tasks.

---

**Ready to start Phase 5.5?** Let me know and I'll begin with Step 1! 🚀
