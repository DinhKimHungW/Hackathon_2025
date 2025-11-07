# Phase 5.4 - Ship Visits Management UI

**Start Date:** November 3, 2025  
**Estimated Duration:** 6-8 hours  
**Status:** 🟡 IN PROGRESS  
**Dependencies:** Phase 5.2 (Auth ✅), Phase 5.3 (Dashboard ✅)

---

## 📋 Overview

Phase 5.4 implements comprehensive Ship Visits management interface with CRUD operations, status tracking, timeline visualization, and real-time updates. Users can view ship arrivals, manage berth assignments, update visit status, and track cargo operations.

---

## 🎯 Objectives

1. ✅ Build Ship Visits list view with filtering, sorting, and search
2. ✅ Create Ship Visit detail view with full information display
3. ✅ Implement Create/Edit Ship Visit forms with validation
4. ✅ Add status update controls (Scheduled → Arrived → Berthing → Loading/Unloading → Completed → Departed)
5. ✅ Integrate real-time WebSocket updates for ship status changes
6. ✅ Add timeline visualization for ship visit history

---

## 📐 Architecture

### **Frontend Structure**
```
frontend/src/features/shipVisits/
├── ShipVisitList.tsx           # Main list view with filters
├── ShipVisitDetail.tsx         # Detail view with tabs
├── ShipVisitForm.tsx           # Create/Edit form
├── shipVisitsSlice.ts          # Redux state management
├── components/
│   ├── ShipVisitCard.tsx       # Ship visit card component
│   ├── ShipVisitFilters.tsx    # Filter controls
│   ├── ShipVisitTimeline.tsx   # Timeline visualization
│   ├── StatusBadge.tsx         # Status indicator
│   └── BerthAssignment.tsx     # Berth selector
└── types/
    └── shipVisit.types.ts      # TypeScript interfaces
```

### **Backend API Endpoints** (Already exists - Phase 2-4)
```
GET    /api/v1/ship-visits              # List all ship visits
GET    /api/v1/ship-visits/:id          # Get ship visit by ID
POST   /api/v1/ship-visits              # Create new ship visit
PATCH  /api/v1/ship-visits/:id          # Update ship visit
DELETE /api/v1/ship-visits/:id          # Delete ship visit
PATCH  /api/v1/ship-visits/:id/status   # Update status
PATCH  /api/v1/ship-visits/:id/arrival  # Record arrival time
PATCH  /api/v1/ship-visits/:id/departure # Record departure time
GET    /api/v1/ship-visits/statistics   # Get statistics
GET    /api/v1/ship-visits/upcoming     # Get upcoming visits
GET    /api/v1/ship-visits/active       # Get active visits
GET    /api/v1/ship-visits/by-status/:status # Filter by status
```

---

## 📝 Step-by-Step Implementation

### **Step 1: Ship Visits Redux State** ⏳ NOT STARTED
**File:** `frontend/src/features/shipVisits/shipVisitsSlice.ts` (≈250 lines)

**State Interface:**
```typescript
interface ShipVisitsState {
  shipVisits: ShipVisit[];           // All ship visits
  currentShipVisit: ShipVisit | null; // Selected ship visit
  filters: {
    status: ShipVisitStatus | 'ALL';
    search: string;
    dateRange: { start: Date | null; end: Date | null };
    portId: string | 'ALL';
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  loading: boolean;
  error: string | null;
  statistics: ShipVisitStatistics | null;
}
```

**Async Thunks:**
- `fetchShipVisits(filters)` - GET /ship-visits with query params
- `fetchShipVisitById(id)` - GET /ship-visits/:id
- `createShipVisit(data)` - POST /ship-visits
- `updateShipVisit({ id, data })` - PATCH /ship-visits/:id
- `deleteShipVisit(id)` - DELETE /ship-visits/:id
- `updateShipVisitStatus({ id, status })` - PATCH /ship-visits/:id/status
- `recordArrival(id)` - PATCH /ship-visits/:id/arrival
- `recordDeparture(id)` - PATCH /ship-visits/:id/departure
- `fetchStatistics()` - GET /ship-visits/statistics

**Actions:**
- `setFilters(filters)` - Update filter state
- `setPagination({ page, limit })` - Update pagination
- `clearError()` - Clear error message
- `updateShipVisitRealtime(shipVisit)` - Socket.IO update

**Selectors:**
- `selectShipVisits` - Get filtered ship visits
- `selectCurrentShipVisit` - Get selected ship visit
- `selectShipVisitsLoading` - Get loading state
- `selectShipVisitsError` - Get error message
- `selectShipVisitsFilters` - Get current filters
- `selectShipVisitStatistics` - Get statistics

---

### **Step 2: Ship Visit Card Component** ⏳ NOT STARTED
**File:** `frontend/src/features/shipVisits/components/ShipVisitCard.tsx` (≈120 lines)

**Features:**
- Material-UI Card with hover effect
- Ship name, IMO number, vessel type
- Status badge with color coding
- ETA/ETD timestamps
- Berth assignment display
- Cargo type and quantity
- Quick action buttons (View, Edit, Update Status)
- Loading skeleton state

**Props:**
```typescript
interface ShipVisitCardProps {
  shipVisit: ShipVisit;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onStatusUpdate: (id: string, status: ShipVisitStatus) => void;
  loading?: boolean;
}
```

---

### **Step 3: Ship Visit List View** ⏳ NOT STARTED
**File:** `frontend/src/features/shipVisits/ShipVisitList.tsx` (≈200 lines)

**Layout:**
```
┌─────────────────────────────────────────────┐
│ Ship Visits Management                      │
│ [+ New Ship Visit]  [Refresh] [Export]      │
├─────────────────────────────────────────────┤
│ Filters: [Status ▼] [Search...] [Date Range]│
├─────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│ │Ship Card │ │Ship Card │ │Ship Card │    │
│ └──────────┘ └──────────┘ └──────────┘    │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│ │Ship Card │ │Ship Card │ │Ship Card │    │
│ └──────────┘ └──────────┘ └──────────┘    │
├─────────────────────────────────────────────┤
│ Pagination: [< 1 2 3 ... 10 >]              │
└─────────────────────────────────────────────┘
```

**Features:**
- Header with title, "New Ship Visit" button, refresh, export
- Filter bar with status dropdown, search input, date range picker
- Grid view (3 columns desktop, 2 tablet, 1 mobile)
- Pagination controls (Material-UI Pagination)
- Empty state when no ship visits
- Loading skeleton grid
- Error alert display

**Redux Integration:**
- Fetch ship visits on mount with filters
- Dispatch filter changes
- Navigate to detail view on card click
- Navigate to form on "New Ship Visit" click

---

### **Step 4: Ship Visit Filters Component** ⏳ NOT STARTED
**File:** `frontend/src/features/shipVisits/components/ShipVisitFilters.tsx` (≈100 lines)

**Filter Controls:**
1. **Status Dropdown:**
   - Options: ALL, PLANNED, ARRIVED, IN_PROGRESS, COMPLETED, DEPARTED, CANCELLED
   - Material-UI Select with color-coded chips

2. **Search Input:**
   - Debounced search (500ms delay)
   - Search by ship name, IMO, vessel type
   - Clear button

3. **Date Range Picker:**
   - Material-UI DatePicker
   - Start date and end date
   - Preset ranges (Today, This Week, This Month)

4. **Reset Filters Button:**
   - Clear all filters to default

**Props:**
```typescript
interface ShipVisitFiltersProps {
  filters: ShipVisitsFilters;
  onFilterChange: (filters: Partial<ShipVisitsFilters>) => void;
}
```

---

### **Step 5: Ship Visit Detail View** ⏳ NOT STARTED
**File:** `frontend/src/features/shipVisits/ShipVisitDetail.tsx` (≈250 lines)

**Layout with Material-UI Tabs:**
```
┌─────────────────────────────────────────────────┐
│ ← Back to List                                  │
│ Ship Visit: MV Ocean Star (IMO 1234567)         │
│ Status: [BERTHING] [Update Status ▼] [Edit]    │
├─────────────────────────────────────────────────┤
│ [Overview] [Timeline] [Cargo] [Documents]       │
├─────────────────────────────────────────────────┤
│ OVERVIEW TAB:                                   │
│ ┌─────────────────┬─────────────────┐          │
│ │ Ship Info       │ Visit Details   │          │
│ │ - Name          │ - ETA           │          │
│ │ - IMO           │ - ETD           │          │
│ │ - Vessel Type   │ - Berth         │          │
│ │ - Flag          │ - Purpose       │          │
│ │ - Gross Tonnage │ - Agent         │          │
│ └─────────────────┴─────────────────┘          │
└─────────────────────────────────────────────────┘
```

**Tabs:**
1. **Overview Tab:**
   - Ship information section (name, IMO, type, flag, tonnage)
   - Visit details section (ETA, ETD, berth, purpose, agent)
   - Current status with timeline progress bar

2. **Timeline Tab:**
   - Vertical timeline with status history
   - Timestamp for each status change
   - User who made the change
   - Automatic events (arrival, departure, berthing)

3. **Cargo Tab:**
   - Cargo type and quantity
   - Loading/unloading status
   - Related tasks list
   - Link to task management

4. **Documents Tab:**
   - Uploaded documents list
   - Document upload button
   - Document preview/download

**Action Buttons:**
- Back to list
- Edit ship visit
- Update status dropdown
- Delete ship visit (with confirmation)
- Record arrival/departure (if applicable)

---

### **Step 6: Ship Visit Form (Create/Edit)** ⏳ NOT STARTED
**File:** `frontend/src/features/shipVisits/ShipVisitForm.tsx` (≈300 lines)

**Form Sections:**
```
┌─────────────────────────────────────────┐
│ Create New Ship Visit / Edit Ship Visit │
├─────────────────────────────────────────┤
│ Ship Information                         │
│ ┌─────────────────────────────────────┐ │
│ │ Ship Name *        [______________] │ │
│ │ IMO Number *       [______________] │ │
│ │ Vessel Type *      [Dropdown ▼]    │ │
│ │ Flag               [______________] │ │
│ │ Gross Tonnage      [______________] │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ Visit Details                            │
│ ┌─────────────────────────────────────┐ │
│ │ ETA *              [DateTime Picker]│ │
│ │ ETD *              [DateTime Picker]│ │
│ │ Berth Assignment   [Dropdown ▼]    │ │
│ │ Visit Purpose *    [Dropdown ▼]    │ │
│ │ Agent Company      [______________] │ │
│ │ Agent Contact      [______________] │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ Cargo Information                        │
│ ┌─────────────────────────────────────┐ │
│ │ Cargo Type *       [Dropdown ▼]    │ │
│ │ Cargo Quantity     [______________] │ │
│ │ Cargo Unit         [Dropdown ▼]    │ │
│ │ Special Notes      [Text Area]     │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ [Cancel] [Save Draft] [Submit]          │
└─────────────────────────────────────────┘
```

**Form Validation (React Hook Form + Yup):**
```typescript
const shipVisitSchema = yup.object({
  shipName: yup.string().required('Ship name is required'),
  imoNumber: yup.string()
    .required('IMO number is required')
    .matches(/^IMO\d{7}$/, 'Invalid IMO format (e.g., IMO1234567)'),
  vesselType: yup.string().required('Vessel type is required'),
  flag: yup.string(),
  grossTonnage: yup.number().positive(),
  eta: yup.date().required('ETA is required').min(new Date(), 'ETA must be in the future'),
  etd: yup.date()
    .required('ETD is required')
    .min(yup.ref('eta'), 'ETD must be after ETA'),
  berthId: yup.string(),
  visitPurpose: yup.string().required('Visit purpose is required'),
  agentCompany: yup.string(),
  agentContact: yup.string(),
  cargoType: yup.string().required('Cargo type is required'),
  cargoQuantity: yup.number().positive(),
  cargoUnit: yup.string(),
  specialNotes: yup.string(),
});
```

**Dropdowns Data:**
- Vessel Types: Container, Bulk Carrier, Tanker, General Cargo, Ro-Ro, Passenger
- Visit Purpose: Loading, Unloading, Transshipment, Bunkering, Repair, Other
- Cargo Types: Container, Dry Bulk, Liquid Bulk, General Cargo, Vehicles, Passengers
- Cargo Units: TEU, Tons, Cubic Meters, Units, Passengers
- Berth Assignment: Fetch from backend /api/v1/berths

**Form Features:**
- Auto-fill IMO validation (check format)
- ETA/ETD validation (ETD > ETA)
- Berth availability check (optional)
- Draft save (localStorage)
- Unsaved changes warning
- Submit loading state
- Success/error notifications

---

### **Step 7: Status Badge Component** ⏳ NOT STARTED
**File:** `frontend/src/features/shipVisits/components/StatusBadge.tsx` (≈60 lines)

**Status Colors:**
```typescript
const statusConfig = {
  PLANNED: { color: '#2196f3', label: 'Planned', icon: 'Schedule' },
  ARRIVED: { color: '#4caf50', label: 'Arrived', icon: 'CheckCircle' },
  IN_PROGRESS: { color: '#ff9800', label: 'In Progress', icon: 'Refresh' },
  COMPLETED: { color: '#9c27b0', label: 'Completed', icon: 'Done' },
  DEPARTED: { color: '#607d8b', label: 'Departed', icon: 'Flight' },
  CANCELLED: { color: '#f44336', label: 'Cancelled', icon: 'Cancel' },
};
```

**Component:**
- Material-UI Chip with custom styling
- Status icon from Material Icons
- Tooltip with full status description
- Size variants (small, medium, large)

---

### **Step 8: Ship Visit Timeline Component** ⏳ NOT STARTED
**File:** `frontend/src/features/shipVisits/components/ShipVisitTimeline.tsx` (≈150 lines)

**Timeline Events:**
1. Visit Created (timestamp, user)
2. Status Changed (PLANNED → ARRIVED → ...)
3. Berth Assigned (berth name, timestamp)
4. Cargo Operations Started
5. Cargo Operations Completed
6. Departure Recorded

**Visual Design:**
- Material-UI Timeline component
- Color-coded timeline dots matching status colors
- Timestamp formatting (relative time + absolute time on hover)
- User avatar for manual events
- System icon for automatic events

---

### **Step 9: Real-time WebSocket Integration** ⏳ NOT STARTED
**File:** `frontend/src/features/shipVisits/hooks/useShipVisitSocket.ts` (≈80 lines)

**Socket Events:**
```typescript
// Listen to:
socket.on('ship_visit:created', (shipVisit) => {
  dispatch(addShipVisit(shipVisit));
  showNotification(`New ship visit: ${shipVisit.shipName}`);
});

socket.on('ship_visit:updated', (shipVisit) => {
  dispatch(updateShipVisitRealtime(shipVisit));
});

socket.on('ship_visit:status_changed', ({ id, status, timestamp }) => {
  dispatch(updateShipVisitStatus({ id, status }));
  showNotification(`Ship visit status changed to ${status}`);
});

socket.on('ship_visit:deleted', (id) => {
  dispatch(removeShipVisit(id));
});
```

**Notification System:**
- Material-UI Snackbar for real-time notifications
- Auto-dismiss after 5 seconds
- Action button to view details
- Queue multiple notifications

---

### **Step 10: API Integration & Testing** ⏳ NOT STARTED

**API Layer:**
- File: `frontend/src/api/shipVisits.api.ts` (≈150 lines)
- Functions for all CRUD operations
- TypeScript interfaces matching backend DTOs
- Axios interceptors for auth and error handling

**Testing Checklist:**
- ✅ Create new ship visit
- ✅ Edit existing ship visit
- ✅ Delete ship visit (with confirmation)
- ✅ Update status (all transitions)
- ✅ Record arrival time
- ✅ Record departure time
- ✅ Filter by status
- ✅ Search by ship name/IMO
- ✅ Filter by date range
- ✅ Pagination (navigate pages)
- ✅ Real-time updates (test with 2 browser windows)
- ✅ Form validation (all fields)
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Loading states
- ✅ Error handling

---

## 📊 Files Summary

### New Files (11 files, ≈1,700 lines)
```
frontend/src/features/shipVisits/
├── ShipVisitList.tsx (≈200 lines)
├── ShipVisitDetail.tsx (≈250 lines)
├── ShipVisitForm.tsx (≈300 lines)
├── shipVisitsSlice.ts (≈250 lines)
├── components/
│   ├── ShipVisitCard.tsx (≈120 lines)
│   ├── ShipVisitFilters.tsx (≈100 lines)
│   ├── ShipVisitTimeline.tsx (≈150 lines)
│   ├── StatusBadge.tsx (≈60 lines)
│   └── BerthAssignment.tsx (≈80 lines)
├── hooks/
│   └── useShipVisitSocket.ts (≈80 lines)
└── types/
    └── shipVisit.types.ts (≈100 lines)

frontend/src/api/
└── shipVisits.api.ts (≈150 lines)

frontend/src/components/layout/
└── Sidebar.tsx (UPDATED - add Ship Visits nav item)
```

### Updated Files
```
frontend/src/store/store.ts (add shipVisitsReducer)
frontend/src/App.tsx (add Ship Visits routes)
```

---

## 🎨 Design Requirements

### **Color Palette**
```typescript
const colors = {
  primary: '#1976d2',      // Blue - Main actions
  success: '#4caf50',      // Green - Arrived, Completed
  warning: '#ff9800',      // Orange - In Progress
  error: '#f44336',        // Red - Cancelled
  info: '#2196f3',         // Light Blue - Planned
  purple: '#9c27b0',       // Purple - Departed
  grey: '#607d8b',         // Grey - Inactive
};
```

### **Typography**
- Headings: Roboto Bold
- Body: Roboto Regular
- Monospace (IMO): Roboto Mono

### **Spacing**
- Card padding: 24px
- Grid gap: 24px
- Form field spacing: 16px

---

## 🔄 User Flows

### **Flow 1: Create New Ship Visit**
1. User clicks "New Ship Visit" button
2. Navigate to `/ship-visits/new`
3. Fill form with ship and visit details
4. Submit form
5. Backend validates and creates ship visit
6. Show success notification
7. Navigate to ship visit detail page
8. WebSocket broadcasts `ship_visit:created` to all users

### **Flow 2: Update Ship Visit Status**
1. User opens ship visit detail
2. Click "Update Status" dropdown
3. Select new status (e.g., ARRIVED)
4. Confirm status change dialog
5. Backend updates status and records timestamp
6. Update Redux state
7. Show success notification
8. WebSocket broadcasts `ship_visit:status_changed`
9. Timeline updates with new event

### **Flow 3: Record Ship Arrival**
1. Ship visit in PLANNED status
2. User clicks "Record Arrival" button
3. Confirm arrival dialog (auto-fill current timestamp)
4. Backend updates status to ARRIVED and records actualArrival
5. Update Redux state
6. Show notification "Ship MV Ocean Star has arrived"
7. WebSocket update to all users
8. Timeline adds arrival event

---

## 🧪 Testing Scenarios

### **Scenario 1: Multiple Users Real-time Update**
1. User A creates new ship visit
2. User B should see new ship visit card appear instantly
3. User A updates status to ARRIVED
4. User B should see status badge update in real-time
5. User B opens detail page
6. User A records departure
7. User B should see timeline update without refresh

### **Scenario 2: Form Validation**
1. Open new ship visit form
2. Try to submit empty form → Show 8 validation errors
3. Fill ship name only → Show 7 remaining errors
4. Fill ETA after ETD → Show "ETD must be after ETA" error
5. Enter invalid IMO format → Show "Invalid IMO format" error
6. Fill all required fields correctly → Submit succeeds

### **Scenario 3: Pagination & Filtering**
1. Create 25 ship visits (test data)
2. Set pagination to 10 per page
3. Navigate to page 2 → Show ship visits 11-20
4. Filter by status ARRIVED → Show only ARRIVED visits
5. Search for "Ocean" → Show only ships with "Ocean" in name
6. Clear filters → Show all 25 ships again

---

## 📈 Performance Requirements

| Metric | Target | Critical |
|--------|--------|----------|
| List load time | <1s | <2s |
| Detail load time | <500ms | <1s |
| Form submission | <1s | <2s |
| WebSocket latency | <200ms | <500ms |
| Search debounce | 300ms | 500ms |
| Card render (50 items) | <2s | <3s |

---

## 🚀 Deployment Checklist

- [ ] All TypeScript errors resolved
- [ ] All ESLint warnings fixed
- [ ] Unit tests written (Jest + React Testing Library)
- [ ] Integration tests for API calls
- [ ] Responsive design tested (Chrome DevTools)
- [ ] Cross-browser testing (Chrome, Firefox, Edge)
- [ ] WebSocket connection handling (disconnect/reconnect)
- [ ] Error boundary added for component crashes
- [ ] Loading skeletons for all async operations
- [ ] Success/error notifications for all actions
- [ ] Form validation covers all edge cases
- [ ] Backend API endpoints tested with Postman
- [ ] Database migrations applied
- [ ] Seed data script ready

---

## 📚 Documentation

### **User Guide Sections**
1. Viewing Ship Visits List
2. Creating New Ship Visit
3. Editing Ship Visit Details
4. Updating Ship Visit Status
5. Recording Arrival/Departure
6. Filtering and Searching
7. Understanding Timeline
8. Managing Cargo Information

### **Developer Documentation**
1. Redux state structure
2. API endpoint reference
3. WebSocket event reference
4. Form validation schema
5. Component props reference
6. Custom hooks usage

---

## 🎯 Success Criteria

✅ Phase 5.4 is complete when:
1. Users can view, create, edit, delete ship visits
2. All status transitions work correctly
3. Real-time updates work across multiple users
4. Form validation prevents invalid data
5. Timeline shows complete visit history
6. Filters and search work correctly
7. Pagination works smoothly
8. Responsive design works on mobile/tablet
9. All tests pass
10. No TypeScript/ESLint errors

---

**Phase 5.4 Priority:** HIGH  
**Estimated Completion:** 6-8 hours  
**Next Phase:** Phase 5.5 - Schedule & Task Management UI
