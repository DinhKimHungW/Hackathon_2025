# 📅 Hướng dẫn Sử dụng Hệ thống Schedules

## 🎯 Tổng quan

Hệ thống Schedules đã được cải tiến với:
- **Role-based views**: Mỗi vai trò nhìn thấy thông tin phù hợp
- **Responsive design**: Hoạt động tốt trên mọi thiết bị
- **Permission system**: Phân quyền rõ ràng cho từng action

---

## 👥 Hướng dẫn cho từng Role

### 👨‍💼 ADMIN - Quản trị viên

**Quyền hạn:**
- ✅ Xem toàn bộ lịch trình cảng
- ✅ Tạo, sửa, xóa schedules
- ✅ Export dữ liệu
- ✅ Bulk operations
- ✅ Xem analytics

**Chức năng:**

1. **Chế độ xem Timeline**
   - Nhấn nút "Timeline" để xem gantt chart
   - Chọn Day/Week/Month view
   - Group by: Resource/Type/Status
   - Zoom in/out để xem chi tiết

2. **Chế độ xem List**
   - Nhấn nút "Danh sách" để xem dạng bảng
   - Tích chọn nhiều schedules
   - Bulk delete schedules đã chọn
   - Sort theo các cột

3. **Lọc và Tìm kiếm**
   - Nhấn icon Filter để mở advanced filters
   - Lọc theo: Status, Type, Date, Resource, Location
   - Search box để tìm nhanh
   - Clear filters để reset

4. **Actions**
   - **Export**: Xuất dữ liệu ra Excel/CSV
   - **Bulk Edit**: Sửa nhiều schedules cùng lúc
   - **Analytics**: Xem biểu đồ thống kê
   - **Optimize**: Tối ưu hóa lịch trình

**Tips:**
- Double-click vào schedule để xem details
- Drag & drop trên timeline để reschedule
- Right-click để context menu

---

### 👔 MANAGER - Quản lý

**Quyền hạn:**
- ✅ Xem toàn bộ lịch trình
- ✅ Tạo, sửa schedules
- ✅ Assign resources
- ✅ View analytics
- ❌ Không thể xóa

**Chức năng:**

1. **Quản lý Lịch trình**
   - Tương tự ADMIN nhưng không có quyền delete
   - Focus vào workload distribution
   - Resource allocation

2. **Assign Resources**
   - Click vào schedule
   - Nhấn "Assign Resources"
   - Chọn berth, crane, personnel
   - Save

3. **View Analytics**
   - Nhấn "View Analytics"
   - Xem:
     - Resource utilization
     - Schedule efficiency
     - Completion rates
     - Delay statistics

**Tips:**
- Sử dụng Workload view để cân bằng resources
- Check dependencies để avoid conflicts

---

### 🚢 OPERATIONS - Nhân viên Điều hành Tàu

**Quyền hạn:**
- ✅ Xem lịch trình tàu được phân công
- ✅ Update status
- ✅ Check-in
- ❌ Không thể edit/delete

**Màn hình hiển thị:**

```
┌─────────────────────────────────────┐
│ 🚢 Tên Tàu: MAERSK LINE            │
│ IMO: 9234567 | Voyage: V001        │
│ Status: 🔵 Đang neo đậu             │
│ Progress: ████████░░ 80%            │
├─────────────────────────────────────┤
│ ⚓ THÔNG TIN CẬP BẾN                │
│ Vị trí: Bến A1                      │
│ Cập bến: 05/11/2025 08:00           │
│ Rời bến: 05/11/2025 20:00           │
│ Thời gian: 12h 00m                  │
├─────────────────────────────────────┤
│ 🛠️ DỊCH VỤ CẢNG                    │
│ ⚡ Hoa tiêu: Nguyễn Văn A           │
│ 🚢 2 Tàu lai dắt                    │
│ ⚓ Dịch vụ neo đậu                   │
├─────────────────────────────────────┤
│ 📦 HOẠT ĐỘNG HÀNG HÓA               │
│ ┌─ Dỡ hàng ────────────────┐       │
│ │ 50 container | Container  │       │
│ │ 08:00 - 12:00 | ✅ Hoàn   │       │
│ └───────────────────────────┘       │
│ ┌─ Bốc hàng ────────────────┐      │
│ │ 60 container | Container  │       │
│ │ 13:00 - 18:00 | 🔵 Đang  │       │
│ └───────────────────────────┘       │
└─────────────────────────────────────┘
```

**Actions:**
1. **Check-in**: Xác nhận tàu đã cập bến
2. **Update Status**: Cập nhật tiến độ công việc
3. **View Details**: Xem chi tiết đầy đủ
4. **Report Issue**: Báo cáo vấn đề

**Tips:**
- Nhấn vào schedule để xem full details
- Update status khi hoàn thành mỗi operation
- Báo cáo ngay nếu có delay

---

### 🚛 DRIVER - Tài xế

**Quyền hạn:**
- ✅ Xem lịch làm việc của mình
- ✅ Start/Complete task
- ✅ View route
- ❌ Không thể edit

**Màn hình hiển thị:**

```
┌─────────────────────────────────────┐
│ 📋 Vận chuyển Container             │
│ 🔵 Đã lên lịch | ⏰ 08:00           │
├─────────────────────────────────────┤
│ ⏰ THỜI GIAN                         │
│ 05/11/2025 08:00 - 10:00            │
│                                     │
│ 🚛 SỐ XE          📍 CỔNG/CÔNG      │
│ 79C-12345         Cổng 1            │
├─────────────────────────────────────┤
│ 📦 CONTAINER                        │
│ MSCU1234567                         │
│ 40FT | DRY | 20,000 kg             │
├─────────────────────────────────────┤
│ 🗺️ TUYẾN ĐƯỜNG                      │
│ Điểm đi: Cảng Hải Phòng             │
│ ───────────────────────────────────  │
│ Điểm đến: Kho Hàng Nội Địa          │
│ 📏 15 km | ⏱️ ~45 phút              │
├─────────────────────────────────────┤
│ 📝 GHI CHÚ                          │
│ ⚠️ Container có hàng dễ vỡ          │
└─────────────────────────────────────┘
```

**Actions:**
1. **View Route**: Xem bản đồ chi tiết
2. **Start Task**: Bắt đầu công việc
3. **Complete Task**: Hoàn thành
4. **Report Issue**: Báo cáo sự cố

**Tips:**
- Check route trước khi bắt đầu
- Update status khi đến mỗi checkpoint
- Báo ngay nếu gặp vấn đề

---

## 📱 Sử dụng trên Mobile

### Điện thoại (< 600px)

**Tự động điều chỉnh:**
- Chỉ hiển thị List view
- Cards dạng dọc
- Touch-friendly buttons
- Simplified toolbar

**Gestures:**
- **Swipe left/right**: Navigate dates
- **Tap**: View details
- **Long press**: Quick actions
- **Pull down**: Refresh

**Tips:**
- Xoay ngang để xem nhiều thông tin hơn
- Pinch to zoom trên timeline
- Sử dụng filter để thu hẹp results

### Tablet (600-960px)

**Features:**
- Both List và Timeline available
- Two-column layout
- Full toolbar
- Medium-sized cards

---

## 🎨 Color Coding

### Status Colors:
- 🟡 **PENDING** (Chờ xử lý) - Warning yellow
- 🔵 **SCHEDULED** (Đã lên lịch) - Info blue
- 🟢 **IN_PROGRESS** (Đang thực hiện) - Primary green
- ✅ **COMPLETED** (Hoàn thành) - Success green
- 🔴 **CANCELLED** (Đã hủy) - Error red

### Priority Indicators:
- 🔴 High priority
- 🟡 Medium priority
- 🔵 Low priority

---

## ⌨️ Keyboard Shortcuts

### ADMIN/MANAGER:
- `Ctrl/Cmd + N`: New schedule
- `Ctrl/Cmd + F`: Focus search
- `Ctrl/Cmd + E`: Export
- `Ctrl/Cmd + D`: Delete selected
- `Ctrl/Cmd + A`: Select all
- `Esc`: Close dialogs

### All Users:
- `Arrow Keys`: Navigate schedules
- `Enter`: Open details
- `Space`: Select/Deselect
- `/`: Focus search

---

## 🔍 Advanced Tips

### Filtering Tips:
1. **Combine filters** để tìm chính xác
2. **Save filters** cho lần sau (coming soon)
3. **Quick filters** trên toolbar

### Timeline Tips:
1. **Zoom** với mouse wheel
2. **Pan** bằng drag
3. **Today line** hiển thị thời gian hiện tại
4. **Conflict detection** tự động highlight

### Performance Tips:
1. Sử dụng **date range filters** để giảm data
2. **Pagination** sẽ load nhanh hơn
3. Clear cache nếu lag

---

## ❓ Troubleshooting

### Không thấy schedules?
1. Check filters - có thể đang filter quá nghiêm
2. Kiểm tra date range
3. Refresh page (F5)
4. Check network connection

### Timeline không hiển thị?
1. Thử switch sang List view
2. Check browser zoom (should be 100%)
3. Clear browser cache
4. Try different browser

### Mobile không responsive?
1. Rotate device
2. Refresh page
3. Update browser
4. Check viewport settings

---

## 📞 Support

**Liên hệ:**
- Email: support@portlink.com
- Phone: 024-xxxx-xxxx
- Slack: #portlink-support

**Documentation:**
- User Manual: `/docs/user-manual.md`
- API Docs: `/docs/api-docs.md`
- FAQ: `/docs/faq.md`

---

**Version:** 5.13.0  
**Last Updated:** 05/11/2025
