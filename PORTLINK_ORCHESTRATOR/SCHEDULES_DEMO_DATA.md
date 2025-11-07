# Schedules Demo Data - Test Guide

## ✅ Dữ Liệu Demo Đã Được Tạo

### Tổng Quan
Đã tạo thành công **8 demo schedules** với các trạng thái khác nhau để test module Schedules.

### Các Trạng Thái Schedule
- **SCHEDULED**: 4 schedules (sắp diễn ra trong vài giờ/ngày tới)
- **IN_PROGRESS**: 1 schedule (đang diễn ra - 45% complete)
- **PENDING**: 1 schedule (chờ phê duyệt)
- **COMPLETED**: 1 schedule (đã hoàn thành 6h trước)
- **CANCELLED**: 0 schedules (có thể tạo thêm nếu cần)

### Chi Tiết Demo Schedules

#### 1. **Vessel Arrival & Berthing** (SCHEDULED)
- Thời gian: NOW + 2 hours → NOW + 6 hours
- Priority: 10 (Highest)
- Resources: Pilot required, 2 tugboats
- Notes: High priority arrival

#### 2. **Container Unloading** (SCHEDULED)
- Thời gian: NOW + 8 hours → NOW + 20 hours
- Priority: 9
- Resources: 300 containers, 3 cranes
- Duration: 12 hours

#### 3. **Container Loading** (SCHEDULED)
- Thời gian: NOW + 24 hours → NOW + 36 hours
- Priority: 8
- Resources: 250 containers, 3 cranes

#### 4. **Active Cargo Operations** (IN_PROGRESS) ⚡
- Thời gian: NOW - 2 hours → NOW + 6 hours
- Priority: 10
- Progress: **45%** complete
- Resources: 20 personnel, 2 cranes
- Notes: Currently in progress

#### 5. **Ship Arrival** (COMPLETED) ✅
- Thời gian: NOW - 12 hours → NOW - 6 hours
- Priority: 8
- Progress: 100%
- Status: Successfully completed

#### 6. **Maintenance Check** (PENDING) ⏳
- Thời gian: NOW + 1 day → NOW + 1 day 8 hours
- Priority: 7
- Status: Waiting for approval

#### 7. **Final Inspection** (SCHEDULED)
- Thời gian: NOW + 48 hours → NOW + 52 hours
- Priority: 6
- Type: Customs inspection

#### 8. **Vessel Departure** (SCHEDULED)
- Thời gian: NOW + 3 days → NOW + 3 days 4 hours
- Priority: 9
- Resources: Pilot required, 2 tugboats

---

## 🧪 Cách Test Module Schedules

### 1. Backend API Test

```bash
# Test lấy tất cả schedules
curl http://localhost:3000/api/v1/schedules

# Test filter theo status
curl http://localhost:3000/api/v1/schedules?status=SCHEDULED
curl http://localhost:3000/api/v1/schedules?status=IN_PROGRESS

# Test schedules statistics
curl http://localhost:3000/api/v1/schedules/statistics

# Test upcoming schedules
curl http://localhost:3000/api/v1/schedules/upcoming

# Test active schedules
curl http://localhost:3000/api/v1/schedules/active
```

### 2. Frontend UI Test

#### Khởi động Frontend
```powershell
cd c:\Users\khvnp\Documents\Hackathon_2025\PORTLINK_ORCHESTRATOR\frontend
npm run dev
```

#### Truy cập Schedules Page
```
http://localhost:5173/schedules
```

#### Các Tính Năng Cần Test

1. **List View** 📋
   - Xem danh sách schedules
   - Sort theo priority, status, start time
   - Filter theo status (SCHEDULED, IN_PROGRESS, COMPLETED, PENDING)
   - Search schedules
   - Pagination

2. **Gantt Timeline View** 📊
   - Xem timeline visualization
   - Zoom in/out
   - View modes: Day, Week, Month
   - Hover để xem details
   - Click vào schedule bar để xem chi tiết
   - Observe current time indicator (red line)
   - See completed schedules (in past)
   - See in-progress schedules (progress bar overlay)

3. **Berth Allocation View** ⚓
   - Xem berth assignments
   - Drag & drop để swap berths
   - Filter berths

4. **Schedule Detail Dialog** 🔍
   - Click vào bất kỳ schedule nào
   - Xem đầy đủ thông tin: times, status, priority, resources
   - Tabs: Overview, Resources, History
   - Progress indicator cho IN_PROGRESS schedules
   - Notes và special requirements

5. **Advanced Filters** 🔎
   - Click icon Filter ở header
   - Filter theo:
     - Status (multiple select)
     - Priority range
     - Date range
     - Search text
   - Reset filters

6. **Create/Edit Schedule** ➕
   - Click FAB button (+) để tạo mới
   - Form validation
   - Date/time pickers
   - Resource assignment

---

## 📊 Expected UI Behavior

### List View
- Hiển thị 8 schedules
- Status chips với màu sắc:
  - 🔵 SCHEDULED (blue)
  - 🟢 IN_PROGRESS (green)
  - ⚪ PENDING (orange)
  - ⚫ COMPLETED (grey)
  - 🔴 CANCELLED (red)
- Priority badge (1-10)
- Progress bar cho IN_PROGRESS

### Gantt Chart
- Timeline từ quá khứ đến tương lai
- Current time line (đỏ) ở giữa
- Past schedules bên trái
- Future schedules bên phải
- IN_PROGRESS schedule có progress overlay
- Grouped by vessel/operation

### Statistics (nếu có)
- Total: 8 schedules
- Scheduled: 4
- In Progress: 1
- Pending: 1
- Completed: 1

---

## 🔧 Troubleshooting

### Nếu không thấy data
1. Check backend running: `http://localhost:3000/api/v1/schedules`
2. Check browser console for errors
3. Check network tab trong DevTools
4. Verify database có data:
   ```sql
   SELECT COUNT(*) FROM operations.schedules;
   ```

### Nếu Gantt Chart lỗi
1. Check D3 library installed: `npm list d3`
2. Check console errors
3. Verify schedules array không undefined

### Nếu frontend build lỗi
1. Fix TypeScript errors (đã liệt kê trong build output)
2. Remove unused imports
3. Fix MUI Grid/ListItem prop types

---

## 🎨 UI Enhancement Suggestions

1. **Color Coding**
   - High priority (9-10): Red/Orange accent
   - Medium priority (5-8): Blue
   - Low priority (1-4): Green

2. **Timeline Features**
   - Add conflict indicators
   - Show resource allocation
   - Add weather warnings
   - Show berth occupancy

3. **Interactive Features**
   - Drag to reschedule
   - Click to assign resources
   - Quick status updates
   - Bulk operations

---

## 📁 Related Files

### Backend
- `backend/seed-schedules-final.sql` - Demo data script
- `backend/src/modules/schedules/` - Schedules module
- `backend/src/modules/schedules/entities/schedule.entity.ts` - Entity

### Frontend
- `frontend/src/features/schedules/SchedulesPage.tsx` - Main page
- `frontend/src/features/schedules/components/GanttChart.tsx` - Timeline
- `frontend/src/features/schedules/components/ScheduleDetailDialog.tsx` - Details
- `frontend/src/features/schedules/schedulesSlice.ts` - Redux state

---

## ✨ Next Steps

1. ✅ Test tất cả views
2. ✅ Test CRUD operations
3. ✅ Test filters & search
4. ⬜ Add more demo data nếu cần
5. ⬜ Test conflict detection
6. ⬜ Test real-time updates (WebSocket)
7. ⬜ Performance optimization cho large datasets

---

**Happy Testing! 🚀**
