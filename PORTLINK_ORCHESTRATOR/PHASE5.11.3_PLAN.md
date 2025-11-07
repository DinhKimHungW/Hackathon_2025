# Phase 5.11.3: Advanced Filters & Bulk Actions - PLAN

**Priority**: HIGH  
**Status**: 📋 PLANNED  
**Estimated Duration**: 2 hours  
**Dependencies**: Phase 5.11.2 (Ship Visits Views)

---

## 🎯 Objectives

### Primary Goals
- ✅ Create advanced filter panel for Ship Visits
- ✅ Add date range picker for ETA/ETD filtering
- ✅ Add multi-select dropdowns for status, ship type, berth
- ✅ Add search by ship name, IMO number
- ✅ Save and load filter presets
- ✅ Add bulk actions toolbar (multi-select, bulk operations)

### Secondary Goals
- ✅ Add filter count badges
- ✅ Add "Clear all filters" button
- ✅ Add filter panel collapse/expand
- ✅ Persist filters to localStorage
- ✅ Add filter summary chips

---

## 📋 Implementation Tasks

### Task 1: Enhanced Filter Panel (45 min)

**Files to Create:**
1. `frontend/src/features/shipVisits/components/ShipVisitFiltersAdvanced.tsx`
2. `frontend/src/components/common/DateRangePicker.tsx`
3. `frontend/src/components/common/MultiSelectDropdown.tsx`

**Features:**
- Collapsible filter panel (Accordion/Drawer)
- Date range picker with presets (Today, This Week, This Month, Custom)
- Multi-select for Status (checkboxes)
- Multi-select for Ship Type (checkboxes)
- Multi-select for Berth (autocomplete)
- Search input (ship name or IMO)
- Active filter count badge
- Clear all filters button
- Apply/Reset buttons

### Task 2: Filter Presets (30 min)

**Features:**
- Save current filters as preset
- Load saved presets
- Delete presets
- Default presets: "Active Ships", "Departing Today", "All Delayed"
- Preset dropdown in filter panel
- Store presets in localStorage

### Task 3: Bulk Actions Toolbar (30 min)

**Files to Create:**
1. `frontend/src/features/shipVisits/components/BulkActionsToolbar.tsx`

**Features:**
- Checkbox column in table/list view
- "Select All" checkbox in header
- Selected count indicator
- Bulk actions menu:
  - Change status (bulk update)
  - Export selected (CSV)
  - Delete selected (with confirmation)
  - Assign berth (bulk assign)
- Sticky toolbar when items selected
- Deselect all button

### Task 4: Integration (15 min)

**Updates to ShipVisitList.tsx:**
- Replace basic filters with advanced filter panel
- Add bulk selection state
- Add bulk action handlers
- Update API calls with filter params
- Show filter summary chips

---

## 🎨 Design Specifications

### Filter Panel Layout

```
┌─────────────────────────────────────────────────┐
│ 🔍 Filters (3 active)          [Clear] [Collapse]│
├─────────────────────────────────────────────────┤
│ Search: [Ship name or IMO number...........    ]│
│                                                  │
│ Date Range: [This Week ▼]                       │
│   From: [Jan 1, 2025]  To: [Jan 7, 2025]        │
│                                                  │
│ Status: [☑ Scheduled ☑ Arrived ☐ Departed]      │
│                                                  │
│ Ship Type: [Container, Tanker ▼]                │
│                                                  │
│ Berth: [B-12, B-15 ▼]                            │
│                                                  │
│ Saved Filters: [My Filters ▼]                   │
│                                                  │
│ [Apply Filters]  [Reset]  [Save as Preset]      │
└─────────────────────────────────────────────────┘
```

### Bulk Actions Toolbar (when items selected)

```
┌─────────────────────────────────────────────────┐
│ ☑ 5 items selected  [Actions ▼] [Deselect All] │
│   - Change Status                                │
│   - Export Selected (CSV)                        │
│   - Assign Berth                                 │
│   - Delete Selected                              │
└─────────────────────────────────────────────────┘
```

---

## 📊 Success Metrics

### Before (Current):
- ✅ Basic filters (status dropdown, search)
- ❌ No date filtering
- ❌ No bulk actions
- ❌ No filter presets

### After (Target):
- ✅ Advanced filter panel with 6+ filter types
- ✅ Date range picker with presets
- ✅ Multi-select for all categorical filters
- ✅ Filter presets (save/load)
- ✅ Bulk selection and actions
- ✅ Filter summary chips
- ✅ Persistent filters (localStorage)

---

## 🚀 Next Steps After Phase 5.11.3

**Phase 5.11.4**: Missing Pages (Schedules, Tasks, Assets, etc.)  
**Phase 5.11.5**: Advanced Components (DataTable, Timeline, etc.)  
**Phase 5.11.6**: Polish & Testing

---

**Status**: Ready to implement  
**Created**: November 2025
