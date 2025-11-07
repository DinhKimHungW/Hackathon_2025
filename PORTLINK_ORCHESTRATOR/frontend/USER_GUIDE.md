# PortLink Orchestrator - User Guide

**Complete guide for end-users of the Port Operations Management Platform**

---

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Dashboard](#dashboard)
- [Ship Visits Management](#ship-visits-management)
- [Schedules & Tasks](#schedules--tasks)
- [Assets Management](#assets-management)
- [Conflicts Management](#conflicts-management)
- [Simulation](#simulation)
- [Event Logs](#event-logs)
- [Settings](#settings)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Getting Started

### Login

1. Navigate to the PortLink Orchestrator URL
2. Enter your **username** and **password**
3. Click **"Login"**
4. You will be redirected to the Dashboard

**Default credentials (development):**
- Username: `admin`
- Password: `admin123`

**Password Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number

### User Interface Overview

```
┌─────────────────────────────────────────────────────┐
│  Logo    PortLink Orchestrator      [User] [Theme]  │ ← Header
├─────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌───────────────────────────────────┐  │
│ │ Menu    │ │                                   │  │
│ │         │ │    Content Area                   │  │
│ │ - Dash  │ │    (Current page)                 │  │
│ │ - Ships │ │                                   │  │
│ │ - Tasks │ │                                   │  │
│ │ ...     │ │                                   │  │
│ └─────────┘ └───────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

**Key Elements:**
- **Header**: Logo, user menu, theme toggle
- **Sidebar**: Main navigation menu
- **Content Area**: Current page/module
- **Breadcrumbs**: Navigation trail (top of content)
- **Action Buttons**: Top-right of content (e.g., "Create Ship Visit")

### Navigation

**Desktop:**
- Click menu items in left sidebar
- Use breadcrumbs to navigate up hierarchy

**Mobile:**
- Tap hamburger icon (☰) to open menu
- Swipe from left to open sidebar

---

## 📊 Dashboard

### Overview

The Dashboard provides real-time KPIs and system status at a glance.

**Key Metrics:**
1. **Total Ship Visits** - All ship visits in system
2. **Active Ship Visits** - Currently in port
3. **Total Tasks** - All tasks in system
4. **Pending Tasks** - Tasks awaiting action
5. **Active Conflicts** - Unresolved conflicts
6. **Assets Status** - Available/In-Use/Maintenance

### Real-Time Updates

- KPIs update automatically via WebSocket
- **Green pulse icon** indicates live connection
- **Red icon** indicates disconnected (will auto-reconnect)

### Viewing Details

- Click on any KPI card to view detailed breakdown
- Charts show trends over time
- Export data using **"Export"** button (top-right)

---

## 🚢 Ship Visits Management

### Viewing Ship Visits

1. Click **"Ship Visits"** in sidebar
2. View list of all ship visits
3. Use filters to narrow results:
   - **Status**: Scheduled, Arrived, In Progress, Departed
   - **Date Range**: Start/End dates
   - **Search**: Ship name or IMO number

**Columns:**
- Ship Name
- IMO Number
- Visit Type (Container, Bulk, Tanker, etc.)
- Arrival Time (ETA/ATA)
- Departure Time (ETD/ATD)
- Status (with color indicators)
- Actions (View, Edit, Delete)

### Creating a Ship Visit

1. Click **"Create Ship Visit"** button (top-right)
2. Fill in required fields:
   - **Ship Name** (e.g., "MSC Oscar")
   - **IMO Number** (7-digit, e.g., "9793320")
   - **Visit Type** (Container, Bulk, Tanker, etc.)
   - **Expected Arrival** (date & time)
   - **Expected Departure** (date & time)
   - **Berth Assignment** (select from available berths)
3. Optional fields:
   - Cargo Details
   - Priority (High, Medium, Low)
   - Notes
4. Click **"Create"**
5. Success message appears
6. New ship visit appears in list

### Editing a Ship Visit

1. Find ship visit in list
2. Click **Edit icon** (pencil) in Actions column
3. Update fields as needed
4. Click **"Save Changes"**
5. Confirmation message appears

**Note:** Some fields cannot be edited after arrival (e.g., IMO number)

### Deleting a Ship Visit

1. Find ship visit in list
2. Click **Delete icon** (trash) in Actions column
3. Confirm deletion in dialog
4. Ship visit removed from list

**Warning:** Deleting a ship visit will also delete associated tasks and schedules.

### Ship Visit Details

Click **View icon** (eye) to see full details:
- Ship information
- Timeline (scheduled → arrived → departed)
- Assigned berth and cranes
- Associated tasks
- Conflict history
- Event logs

---

## 📅 Schedules & Tasks

### Viewing Schedules

1. Click **"Schedules"** in sidebar
2. Choose view mode:
   - **Gantt Chart** (timeline view)
   - **Kanban Board** (status columns)
   - **List View** (table format)

**Gantt Chart:**
- Timeline shows task start/end times
- Color-coded by ship visit
- Drag tasks to reschedule
- Zoom in/out with scroll or buttons

**Kanban Board:**
- Columns: To Do, In Progress, Completed
- Drag cards between columns to update status
- Cards show task name, ship, and priority

### Creating a Task

1. Click **"Create Task"** button
2. Fill in fields:
   - **Task Name** (e.g., "Container Unloading")
   - **Ship Visit** (select from dropdown)
   - **Task Type** (Loading, Unloading, Inspection, etc.)
   - **Start Time** (date & time)
   - **End Time** (date & time)
   - **Assigned Crane** (select available crane)
   - **Priority** (High, Medium, Low)
3. Click **"Create"**
4. Task appears in schedule

**Dependencies:**
- Some tasks depend on others (e.g., inspection before loading)
- System prevents creating conflicting tasks
- Dependencies shown with arrows in Gantt chart

### Editing Tasks

**Gantt Chart Method:**
1. Drag task bar to change start/end time
2. System checks for conflicts
3. Auto-saves on drop

**Form Method:**
1. Click task card/row
2. Edit in modal dialog
3. Click **"Save"**

### Task Status Updates

**Manual Update:**
1. Click task card
2. Change **Status** dropdown
3. Click **"Save"**

**Drag & Drop (Kanban):**
1. Drag task card to new column
2. Auto-saves status

**Status Options:**
- Pending
- In Progress
- Completed
- Cancelled

---

## 🏗 Assets Management

### Asset Types

1. **Berths** - Docking locations for ships
2. **Cranes** - Loading/unloading equipment
3. **Trucks** - Transport vehicles
4. **Warehouses** - Storage facilities

### Viewing Assets

1. Click **"Assets"** in sidebar
2. Select asset type from tabs
3. View list with:
   - Asset name and ID
   - Status (Available, In Use, Maintenance, Out of Service)
   - Current assignment (if in use)
   - Last maintenance date
   - Actions

**Status Indicators:**
- 🟢 **Available** - Ready for use
- 🔵 **In Use** - Currently assigned
- 🟡 **Maintenance** - Under maintenance
- 🔴 **Out of Service** - Not operational

### Creating an Asset

1. Select asset type tab
2. Click **"Create [Asset Type]"**
3. Fill in fields:
   - **Name** (e.g., "Berth A1")
   - **Capacity** (e.g., 5000 TEU for berth)
   - **Status** (default: Available)
   - **Specifications** (JSON format, optional)
4. Click **"Create"**

### Updating Asset Status

1. Find asset in list
2. Click **"Change Status"** button
3. Select new status:
   - Available
   - In Use (auto-set when assigned)
   - Maintenance
   - Out of Service
4. Add reason/notes (optional)
5. Click **"Update"**

### Maintenance Scheduling

1. Click asset row
2. Go to **"Maintenance"** tab
3. Click **"Schedule Maintenance"**
4. Set:
   - Start date/time
   - Estimated duration
   - Maintenance type (Routine, Repair, Upgrade)
   - Notes
5. Click **"Schedule"**
6. Asset status changes to "Maintenance"
7. Notification sent to operations team

---

## ⚠️ Conflicts Management

### What Are Conflicts?

Conflicts occur when resources or schedules overlap. Types:

1. **Resource Conflict** - Same asset assigned twice
2. **Berth Conflict** - Multiple ships at same berth
3. **Crane Conflict** - Crane double-booked
4. **Time Conflict** - Overlapping task schedules

### Viewing Conflicts

1. Click **"Conflicts"** in sidebar
2. View active conflicts list
3. Filter by:
   - **Type** (Resource, Berth, Crane, Time)
   - **Severity** (Critical, High, Medium, Low)
   - **Status** (Active, Resolved)

**Conflict Card Shows:**
- Conflict type and severity
- Description (what overlaps)
- Affected ships/tasks
- Suggested resolutions
- Action buttons

**Severity Indicators:**
- 🔴 **Critical** - Operations blocked
- 🟠 **High** - Significant impact
- 🟡 **Medium** - Minor impact
- 🟢 **Low** - No immediate impact

### Resolving Conflicts

**Option 1: Accept Suggestion**
1. Review system suggestion
2. Click **"Accept Suggestion"**
3. System auto-reschedules

**Option 2: Manual Resolution**
1. Click **"Resolve Manually"**
2. Choose action:
   - Reassign resource
   - Reschedule task
   - Change priority
   - Cancel task
3. Confirm changes
4. Conflict marked as resolved

**Option 3: Ignore (Low Priority)**
1. Click **"Ignore"** for low-severity conflicts
2. Add reason
3. Conflict hidden from active list

### Conflict Notifications

- **Desktop**: Browser notifications (if enabled)
- **In-App**: Red badge on Conflicts menu
- **Email**: Sent for critical conflicts (admin only)

**Enable Notifications:**
1. Click user menu → **Settings**
2. Go to **Notifications** tab
3. Toggle **"Conflict Alerts"**
4. Allow browser notifications when prompted

---

## 🔬 Simulation

### What-If Scenarios

Simulation allows testing changes without affecting real schedules.

### Creating a Simulation

1. Click **"Simulation"** in sidebar
2. Click **"New Simulation"**
3. Enter:
   - **Simulation Name** (e.g., "Add 2 Cranes Test")
   - **Description** (optional)
   - **Base Date Range** (use existing schedule data)
4. Click **"Create"**

### Modifying Scenario

**Add Ships:**
1. In simulation view, click **"Add Ship Visit"**
2. Enter details (same as normal ship visit)
3. Ship added to simulation only

**Change Resources:**
1. Click **"Resources"** tab
2. Add/remove/modify assets
3. Changes apply to simulation only

**Reschedule Tasks:**
1. Use Gantt chart (same as normal scheduling)
2. Drag tasks to new times
3. System detects conflicts in simulation

### Running Simulation

1. Click **"Run Simulation"** button
2. System calculates:
   - Resource utilization
   - Conflict detection
   - KPI changes
   - Bottlenecks
3. View results in dashboard:
   - **Before/After** KPIs comparison
   - Conflict count
   - Efficiency metrics
4. Export report (PDF/Excel)

### Applying Simulation

**If simulation successful:**
1. Click **"Apply to Real Schedule"**
2. Confirm application
3. All changes applied to production schedule
4. Simulation archived

**If simulation failed:**
1. Modify scenario
2. Re-run simulation
3. Or click **"Discard"** to delete

---

## 📜 Event Logs

### Viewing Logs

1. Click **"Event Logs"** in sidebar
2. View audit trail of all system events
3. Logs show:
   - Timestamp
   - Event type (14 types)
   - Severity (Info, Warning, Error, Critical)
   - Description
   - User (who performed action)
   - IP address

**Event Types:**
- Ship Visit Created/Updated/Deleted
- Task Created/Updated/Completed
- Conflict Detected/Resolved
- Asset Status Changed
- User Login/Logout
- Simulation Run
- System Errors

### Filtering Logs

**By Date:**
- Last 24 hours
- Last 7 days
- Last 30 days
- Custom range

**By Event Type:**
- Select one or multiple types
- Click **"Apply Filter"**

**By Severity:**
- Info (routine events)
- Warning (potential issues)
- Error (failures)
- Critical (system errors)

**By User:**
- Search by username
- View specific user's activity

### Exporting Logs

1. Apply desired filters
2. Click **"Export"** button
3. Choose format:
   - CSV (for Excel/Google Sheets)
   - JSON (for developers)
   - PDF (for reports)
4. File downloads automatically

**Use Cases:**
- Compliance audits
- Incident investigation
- Performance analysis
- User activity tracking

---

## ⚙️ Settings

### User Profile

1. Click user icon (top-right) → **Profile**
2. Update:
   - Display name
   - Email
   - Phone number
3. Click **"Save Changes"**

### Change Password

1. User menu → **Profile**
2. Go to **Security** tab
3. Enter:
   - Current password
   - New password
   - Confirm new password
4. Click **"Update Password"**

### Theme Settings

**Toggle Light/Dark Mode:**
- Click theme toggle button (top-right)
- Or: Settings → **Appearance** → Select theme

**Theme Options:**
- Light (default)
- Dark
- Auto (follows system preference)

### Notification Preferences

1. Settings → **Notifications**
2. Toggle options:
   - Conflict alerts
   - Task updates
   - Ship arrivals/departures
   - System maintenance
3. Choose delivery method:
   - Browser notifications
   - Email (admin only)
   - In-app only

---

## 🛠 Troubleshooting

### Common Issues

**1. Cannot Login**
- Check username/password (case-sensitive)
- Ensure Caps Lock is off
- Contact admin to reset password
- Clear browser cache and retry

**2. Data Not Loading**
- Check internet connection
- Refresh page (F5)
- Check server status (contact IT)
- Try different browser

**3. Changes Not Saving**
- Ensure all required fields filled
- Check for validation errors (red text)
- Wait for loading spinner to complete
- Check internet connection

**4. Real-Time Updates Not Working**
- Green pulse icon should be visible
- If red, WebSocket disconnected
- Refresh page to reconnect
- Check firewall settings

**5. Conflicts Not Detected**
- System detects conflicts automatically
- Check Conflicts page manually
- Ensure tasks have correct times
- Report to admin if issue persists

### Browser Compatibility

**Supported Browsers:**
- Chrome 90+ ✅
- Firefox 88+ ✅
- Edge 90+ ✅
- Safari 14+ ✅

**Not Supported:**
- Internet Explorer ❌

### Getting Help

**Documentation:**
- README.md - Quick start guide
- DEVELOPMENT.md - Technical guide
- API_INTEGRATION.md - Backend integration

**Support:**
- Email: support@portlink.com
- Phone: +1 (555) 123-4567
- Submit ticket: portal.portlink.com/support

---

**User Guide - Version 1.0**  
**Last Updated: January 2025**
