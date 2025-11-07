# 🚀 Quick Start - Schedules System Testing

## Chạy Application

### 1. Start Backend
```powershell
cd backend
npm install
npm run start:dev
```

### 2. Start Frontend
```powershell
cd frontend
npm install
npm run dev
```

### 3. Open Browser
```
http://localhost:5173
```

---

## 🧪 Testing Guide

### Login Credentials

| Role | Email | Password | View |
|------|-------|----------|------|
| **ADMIN** | admin@portlink.com | admin123 | Dashboard + Full Features |
| **MANAGER** | manager@portlink.com | manager123 | Ship View + Management |
| **OPERATIONS** | ops@portlink.com | ops123 | Ship Schedule View |
| **DRIVER** | driver@portlink.com | driver123 | Work Schedule Cards |

---

## ✅ Testing Checklist

### Test 1: ADMIN Role
- [ ] Login as admin
- [ ] Navigate to Schedules page
- [ ] Should see **Dashboard** with statistics
- [ ] Check 5 stats cards (Total/Active/Completed/Pending/Cancelled)
- [ ] Check 3 resource cards (Berths/Vehicles/Personnel)
- [ ] Try entity filter buttons (All/Ships/Drivers/Berths/Personnel)
- [ ] Should see recent schedules list
- [ ] Toggle to Timeline view (button visible)
- [ ] Check toolbar has Export, Filter, Analytics buttons
- [ ] Responsive: Resize window, check mobile view

### Test 2: MANAGER Role
- [ ] Login as manager
- [ ] Navigate to Schedules page
- [ ] Should see **Ship Schedule View**
- [ ] Check ship cards with vessel info
- [ ] Should see berthing information
- [ ] Check cargo operations list
- [ ] Port services chips visible
- [ ] Timeline view available
- [ ] No Delete button (permission check)
- [ ] Responsive: Check tablet/mobile views

### Test 3: OPERATIONS Role
- [ ] Login as operations
- [ ] Navigate to Schedules page
- [ ] Header shows "Lịch trình Tàu của Tôi"
- [ ] Should see **Ship Schedule Cards**
- [ ] Check vessel details (name, IMO, voyage)
- [ ] Progress bar for in-progress schedules
- [ ] Berthing info panel
- [ ] Cargo operations timeline
- [ ] Special requirements alert
- [ ] No Edit/Delete buttons
- [ ] Only List view (no Timeline toggle on mobile)

### Test 4: DRIVER Role
- [ ] Login as driver
- [ ] Navigate to Schedules page  
- [ ] Header shows "Lịch trình Làm việc"
- [ ] Should see **Work Schedule Cards**
- [ ] Check time & shift info
- [ ] Vehicle number visible
- [ ] Gate number visible
- [ ] Container details card
- [ ] Route panel (origin → destination)
- [ ] Distance & duration
- [ ] Notes section if available
- [ ] No Edit/Delete buttons
- [ ] Only personal schedules

### Test 5: Responsive Design
- [ ] **Desktop (> 960px)**
  - Full toolbar visible
  - Timeline view default for Admin/Manager
  - All buttons with text
  - Grid layouts
  
- [ ] **Tablet (600-960px)**
  - Compact toolbar
  - Both views available
  - Medium cards
  - Some icon-only buttons
  
- [ ] **Mobile (< 600px)**
  - Force list view
  - Single column
  - QuickActions FAB visible (bottom right)
  - Large touch targets
  - Icon-only toolbar

### Test 6: QuickActions FAB (Mobile Only)
- [ ] Resize to mobile (<600px)
- [ ] Should see floating button (bottom right)
- [ ] Click to expand speed dial
- [ ] **Admin** sees: Create, Filter, Export, Analytics, Refresh
- [ ] **Manager** sees: Create, Assign, Analytics, Filter, Refresh
- [ ] **Operations** sees: Start, Complete, Report, Refresh
- [ ] **Driver** sees: View Route, Start, Complete, Report
- [ ] Click any action - check console log

### Test 7: Permissions
- [ ] **Admin**: All buttons visible
- [ ] **Manager**: No Delete button
- [ ] **Operations**: No Create/Edit/Delete
- [ ] **Driver**: Only Start/Complete actions
- [ ] Export only for Admin/Manager
- [ ] Filter for Admin/Manager/Operations
- [ ] Analytics for Admin/Manager

---

## 📱 Device Testing

### Chrome DevTools
1. Press F12
2. Click Device Toolbar icon (Ctrl+Shift+M)
3. Test with:
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPad (768px)
   - iPad Pro (1024px)
   - Desktop (1920px)

### Real Devices
- [ ] Test on actual phone
- [ ] Test on tablet
- [ ] Test on laptop
- [ ] Test on large monitor

---

## 🎨 Visual Checks

### Colors
- [ ] Status chips use correct colors
  - 🟡 Warning (Pending)
  - 🔵 Info (Scheduled)
  - 🟢 Primary (In Progress)
  - ✅ Success (Completed)
  - 🔴 Error (Cancelled)

### Animations
- [ ] Hover effects on cards
- [ ] Smooth transitions (200ms)
- [ ] FAB expand animation
- [ ] Loading states
- [ ] Progress bars animate

### Typography
- [ ] Headers readable
- [ ] Body text comfortable
- [ ] Responsive font sizes
- [ ] Proper hierarchy

---

## 🐛 Known Issues to Check

1. ⚠️ **Mock Data**: Ship/Driver details using mock data
   - Verify data structure
   - Check for null/undefined
   
2. ⚠️ **Backend**: No real API yet
   - Schedules from Redux store
   - May need seed data
   
3. ⚠️ **Timeline**: Not fully mobile optimized
   - Check if timeline loads on mobile
   - May need to test separately

---

## 💡 Quick Actions Test

### Admin Actions
```
Create → Console: "Create new schedule"
Filter → Opens filter dialog
Export → Console: "Export schedules"
Analytics → Console: "Show analytics"
Refresh → Fetches schedules again
```

### Manager Actions
```
Create → Console: "Create new schedule"
Assign → Console: "Assign resources"
Analytics → Console: "Show analytics"
Filter → Opens filter dialog
Refresh → Fetches schedules
```

### Operations Actions
```
Start → Console: "Start task"
Complete → Console: "Complete task"
Report → Console: "Report issue"
Refresh → Fetches schedules
```

### Driver Actions
```
View Route → Console: "View route"
Start → Console: "Start task"
Complete → Console: "Complete task"
Report → Console: "Report issue"
```

---

## 📊 Performance Check

Open DevTools Performance tab:
- [ ] Page load < 2s
- [ ] Smooth scrolling (60fps)
- [ ] No layout shifts
- [ ] No memory leaks
- [ ] Efficient re-renders

---

## ✨ Success Criteria

- [ ] All 4 roles display different views
- [ ] Responsive works on all breakpoints
- [ ] QuickActions FAB appears on mobile
- [ ] Permissions enforced correctly
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Smooth user experience
- [ ] Clear visual hierarchy

---

## 📞 Report Issues

If you find bugs:
1. Take screenshot
2. Note the role & device
3. Check browser console
4. Document steps to reproduce
5. Create issue or report

---

**Happy Testing! 🎉**

_Last Updated: 05/11/2025_
