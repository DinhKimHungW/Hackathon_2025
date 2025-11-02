**Dự án:** PortLink Orchestrator - Giai đoạn 1: Bản sao số (Digital Twin)
**Ngày tạo:** 02/11/2025
**Người lập:** Đinh Kim Hưng

---

## 1. Giới thiệu & Mục tiêu

### 1.1. Giới thiệu
Dự án PortLink Orchestrator nhằm xây dựng một hệ thống "Bản sao số" (Digital Twin) cho hoạt động điều hành bến cảng.

Hiện tại, việc điều phối (tàu, bến, cẩu, xe) đang diễn ra thủ công, rời rạc, dẫn đến xung đột lịch và phản ứng chậm với sự cố. Nghiêm trọng hơn, ban quản lý thiếu một công cụ để dự đoán được tác động dây chuyền khi một sự cố xảy ra, hoặc khi muốn thử một kịch bản điều phối mới.

Hệ thống này cung cấp một mô hình kỹ thuật số, động, theo thời gian thực của cảng, cho phép người dùng không chỉ "Quan sát" hiện tại mà còn "Mô phỏng" tương lai.

### 1.2. Mục tiêu Giai đoạn 1
Mục tiêu của giai đoạn 1 là triển khai một Bảng điều khiển (Dashboard) "Bản sao số" có khả năng:

* **TRỰC QUAN HÓA:** Hiển thị trạng thái thời gian thực của các tài sản cảng (bến, cẩu, tàu).
* **DỰ ĐOÁN:** Chạy mô phỏng các hoạt động (ví dụ: 24 giờ tới) để dự đoán các điểm xung đột, tắc nghẽn.
* **HỖ TRỢ QUYẾT ĐỊNH (What-If):** Cho phép người điều phối đặt câu hỏi "Điều gì sẽ xảy ra nếu...?" và thấy ngay tác động lên lịch trình.
* **TỐI ƯU HÓA:** Đề xuất các giải pháp để giải quyết các xung đột được dự đoán.

---

## 2. Phạm vi (Scope)

### 2.1. Trong phạm vi (In-Scope)
* **Nền tảng:** Ứng dụng web, có hỗ trợ giao diện Responsive (tối ưu cho di động).
* **Người dùng (Personas):**
    * **P-1 (Ưu tiên #1):** Điều phối viên nội cảng (OPS/Control Room).
    * **P-2 (Ưu tiên #2):** Thuyền trưởng / Tài xế (dùng mobile để báo cáo sự cố thực tế).
    * **P-3 (Ưu tiên #3):** Quản lý Cảng (Port Manager) (theo dõi KPIs).
* **Tính năng chính:**
    * **(Ưu tiên Cao) Bảng điều khiển Digital Twin:** Trực quan hóa sơ đồ bến cảng (layout) và biểu đồ Gantt thời gian thực, với chất lượng hoàn thiện cao nhất.
    * **(Ưu tiên Cao) Module KPIs:** Theo dõi và trực quan hóa các chỉ số hiệu suất vận hành (ví dụ: thời gian chờ, tỷ lệ lấp đầy bến).
    * **Bộ máy Mô phỏng & "What-If":** Giao diện cho phép người dùng nhập kịch bản giả định và chạy mô phỏng dự đoán.
    * **Engine Tối ưu hóa:** Đề xuất giải pháp (ví dụ: đổi bến) khi phát hiện xung đột.
    * **Module Tích hợp:** Kết nối (read-only) với Hệ thống Điều hành Cảng (TOS) để lấy lịch tàu và trạng thái thực tế.
* **Công nghệ:**
    * **Backend:** Node.js (Sử dụng NestJS/Express.js, Socket.io và các thư viện phù hợp cho real-time & mô phỏng).
    * **Frontend:** React (hoặc Vue).
* **Ngôn ngữ:** Hỗ trợ song ngữ Tiếng Việt / Tiếng Anh.

### 2.2. Ngoài phạm vi (Out-of-Scope - Giai đoạn 1)
* Gửi thông báo thực (SMS, Email, Push Notification).
* Tích hợp sâu (ghi/write) vào TOS hoặc các hệ thống bên ngoài (ví dụ: Hải quan, E-Port, Kế toán).
* Quản lý chi tiết kho bãi, container (chỉ tập trung vào tối ưu Tàu - Bến - Cẩu).
* Tính năng "Chat UI tự nhiên (NLU)" (Sẽ được đưa vào Giai đoạn 2).

### 2.3. Lộ trình Mở rộng (Future Scope - Giai đoạn 2)
* **Tích hợp AI Chatbot & AI Agents:** Giai đoạn 2 sẽ tập trung vào việc tích hợp một AI Chatbot điều hành.
* **Mục tiêu:** Cho phép tất cả các bên (P-1, P-2, P-4) tương tác và điều hành hệ thống hoàn toàn bằng ngôn ngữ tự nhiên (Tiếng Việt/Anh), giúp giảm đáng kể thời gian thao tác và tăng tính dễ sử dụng.
* **Ví dụ:** Người dùng có thể chat: "Tàu A báo trễ 3 tiếng, cập nhật lịch và cho tôi biết tàu nào bị ảnh hưởng?" và AI Agent sẽ tự động chạy kịch bản "What-If".
* **Ghi chú kỹ thuật (Demo):** Phần demo/PoC cho tính năng này sẽ sử dụng GitHub API để xử lý các truy vấn ngôn ngữ.

---

## 3. Thuật ngữ & Từ viết tắt
* **OPS:** Operations / Điều phối viên nội cảng.
* **Digital Twin (Bản sao số):** Mô hình kỹ thuật số, thời gian thực của một hệ thống vật lý.
* **TOS (Terminal Operating System):** Hệ thống Điều hành Cảng (phần mềm lõi của cảng).
* **Simulation (Mô phỏng):** Quá trình chạy giả lập các kịch bản tương lai.
* **What-If:** Kịch bản "Điều gì sẽ xảy ra nếu...".
* **KPI:** Key Performance Indicator (Chỉ số hiệu suất).
* **Gantt:** Biểu đồ Gantt.

---

## 4. Các bên liên quan & Người dùng (Personas)

| ID | Vai trò | Mô tả | Nhu cầu chính | Nền tảng sử dụng |
| :--- | :--- | :--- | :--- | :--- |
| **P-1** | Điều phối viên (OPS) | (Ưu tiên #1) Người giám sát và ra quyết định vận hành 24/7. | Chạy kịch bản "What-If", xem lịch Gantt, nhận đề xuất tối ưu. | Desktop (Web) |
| **P-2** | Thuyền trưởng / Tài xế | Người trực tiếp vận hành (tàu, xe). | Báo cáo sự cố thực tế (trễ giờ, hỏng hóc) nhanh chóng. | Di động (Web Responsive) |
| **P-3** | Quản trị viên (Admin) | Người cấu hình hệ thống (tài khoản, tài sản cảng). | Thêm/sửa/xóa tài khoản, cấu hình bến, cầu. | Desktop (Web) |
| **P-4** | Quản lý Cảng (Manager) | Người giám sát hiệu suất tổng thể của cảng. | Theo dõi Dashboard KPIs (lợi nhuận, hiệu suất, thời gian chờ). | Desktop / Tablet |

---

## 5. Yêu cầu Chức năng (Functional Requirements)

### Module 1: Quản lý Tài khoản & Xác thực
* **RQF-001:** Là một (P-1, P-3, P-4), tôi muốn đăng nhập vào hệ thống bằng Tên đăng nhập và Mật khẩu.
* **RQF-002:** Là một (P-2), tôi muốn đăng nhập vào hệ thống trên di động.
* **RQF-003:** Là một (P-3), tôi muốn tạo/vô hiệu hóa tài khoản cho các vai trò khác.
* **RQF-004:** (Hệ thống) Phải phân quyền nghiêm ngặt theo vai trò (P-1, P-2, P-3, P-4).

### Module 2: Bảng điều khiển Bản sao số (Ưu tiên CAO NHẤT)
> **Ghi chú:** Đây là module có độ ưu tiên cao nhất. Giao diện phải đảm bảo tính "Dễ nhìn, dễ sử dụng, và hiệu quả" (Hi-Fidelity). Biểu đồ Gantt và Sơ đồ bến cảng phải mượt mà, dễ đọc, và phản ánh thay đổi ngay lập tức (real-time).

* **RQF-005:** Là một (P-1, P-4), tôi muốn xem một biểu đồ Gantt (dùng D3.js, Bryntum hoặc thư viện tương đương) hiển thị lịch trình của Tàu, Bến, Cẩu theo trục thời gian thực.
* **RQF-006:** Là một (P-1, P-4), tôi muốn xem một sơ đồ (map layout) trực quan của cảng, hiển thị trạng thái (trống, bận, bảo trì) của Bến và Cẩu bằng màu sắc và cho phép tương tác (ví dụ: nhấp vào Bến để xem chi tiết tàu).
* **RQF-007:** Là một (P-4), tôi muốn xem Dashboard KPIs, bao gồm:
    * Thời gian quay vòng tàu (trung bình).
    * Tỷ lệ lấp đầy bến (hiện tại và dự đoán 24h).
    * Năng suất cẩu (lượt di chuyển/giờ).
    * Thời gian chờ của tàu (trung bình).
    * Tỷ lệ sử dụng bãi (sơ bộ).
    * *Các KPIs này phải được trực quan hóa một cách chuyên nghiệp, dễ hiểu.*

### Module 3: Bộ máy Mô phỏng & Kịch bản "What-If"
* **RQF-008:** Là một (P-1), tôi muốn truy cập giao diện "What-If" để nhập một kịch bản giả định (ví dụ: "Tàu A trễ 3 giờ", "Cẩu 2 bảo trì từ 14:00 đến 16:00").
* **RQF-009:** Là một (P-2), tôi muốn truy cập một Biểu mẫu (Form) đơn giản trên di động để báo cáo sự cố thực tế.
* **RQF-010:** (Hệ thống) Ngay khi kịch bản "What-If" (RQF-008) được gửi, hệ thống (Backend Node.js) phải kích hoạt Bộ máy Mô phỏng để tính toán lại toàn bộ lịch trình bị ảnh hưởng.
* **RQF-011:** (Hệ thống) Bộ máy Mô phỏng phải tự động dự đoán và làm nổi bật các xung đột (bottlenecks) mới (ví dụ: Tàu B giờ sẽ phải chờ bến 1.5 giờ).
* **RQF-012:** (Hệ thống) Kết quả mô phỏng phải được hiển thị trên Gantt chart (ví dụ: lịch cũ mờ đi, lịch dự đoán mới hiện rõ) để (P-1) so sánh tác động.
* **RQF-013:** (Hệ thống) Khi phát hiện xung đột, hệ thống phải đề xuất ít nhất 01 giải pháp tối ưu (ví dụ: "Xung đột! Đề xuất: Chuyển Tàu B sang Bến 2 (đang trống)?").

### Module 4: Trung tâm Thông báo & Log
* **RQF-014:** Là một (P-1), tôi muốn xem một "Trung tâm Thông báo" (dạng Log) ghi lại tất cả các sự kiện thực tế (từ P-2) và các mô phỏng (từ P-1) đã chạy.
* **RQF-015:** Là một (P-1), tôi muốn có thể xuất file log (CSV) này để làm bằng chứng.

### Module 5: Quản trị & Tích hợp
* **RQF-016:** Là một (P-3), tôi muốn có một giao diện để định nghĩa các tài sản của cảng (tên bến, số lượng cầu, vị trí layout) để engine có dữ liệu tính toán.
* **RQF-017:** (Hệ thống) Phải tự động đồng bộ (read-only) lịch tàu (ETA, công việc) từ hệ thống TOS qua API.
* **RQF-018:** (Hệ thống) Phải nhận dữ liệu trạng thái (status) thời gian thực từ các hệ thống giám sát (ví dụ: Cẩu, Bến) qua API/MQTT (nếu có).

---

## 6. Yêu cầu Phi chức năng (Non-Functional Requirements)

| ID | Hạng mục | Yêu cầu chi tiết | Ghi chú |
| :--- | :--- | :--- | :--- |
| **RQN-001** | **Hiệu năng** | Thời gian chạy mô phỏng "What-If" và trả về kết quả (lịch mới) phải **dưới 5 giây**. | `(Yêu cầu cốt lõi)` |
| **RQN-002** | | Dashboard (Gantt & Map) phải cập nhật real-time (qua WebSockets) mà không cần tải lại trang. | |
| **RQN-003** | **Tính tiện dụng** | Giao diện phải Responsive (tương thích tốt với di động cho P-2). | |
| **RQN-004** | | Giao diện (P-1, P-4) phải đạt độ hoàn thiện cao (hi-fidelity), ưu tiên tính rõ ràng, trực quan, dễ sử dụng và hiệu quả. Tương tác phải mượt mà. | `(Ưu tiên Cao)` |
| **RQN-005** | **Khả năng mở rộng** | Hệ thống phải xử lý được **10-50 sự kiện/giờ** trong giờ cao điểm. | |
| **RQN-006** | | Kiến trúc phải **Modular** (Microservices) để dễ nâng cấp các engine (Mô phỏng, Tối ưu hóa) độc lập. | |
| **RQN-007** | **Bảo trì** | Backend **bắt buộc** viết bằng **Node.js**. | `(Tận dụng hệ sinh thái thư viện real-time (Socket.io) và hiệu năng bất đồng bộ)` |
| **RQN-008** | | Frontend (UI) sử dụng **React** (hoặc Vue). | |
| **RQN-009** | **Triển khai** | Hệ thống phải được đóng gói (Docker) để triển khai trên hạ tầng Cloud hoặc On-premise của cảng. | |
| **RQN-010** | **Lưu trữ Dữ liệu** | Dữ liệu Log (RQF-014) phải được lưu trữ tối thiểu **3 tháng**. | |
| **RQN-011** | **Bảo mật** | Phân quyền truy cập nghiêm ngặt theo vai trò (P-1, P-2, P-3, P-4). | |
| **RQN-012** | **Bản địa hóa** | Hệ thống hỗ trợ 2 ngôn ngữ: **Tiếng Việt và Tiếng Anh**. | |

---

## 7. Mô hình Dữ liệu (Sơ bộ)

* **User:** (UserID, Username, PasswordHash, Role: {OPS, Driver, Admin, Manager})
* **Asset:** (AssetID, Name, Type: {Berth, Crane}, Status, Position_X, Position_Y)
* **ShipVisit:** (VisitID, ShipName, ETA_TOS, ETA_Actual, ETD_Predicted, Status, Work_Required)
* **Schedule:** (ScheduleID, Version, CreatedAt, IsActive, IsSimulation)
* **Task:** (TaskID, FK_ScheduleID, FK_ShipVisitID, FK_AssetID, StartTime_Pred, EndTime_Pred)
* **EventLog:** (LogID, Timestamp, UserID, EventType: {Actual, Simulation}, Description)
* **SimulationRun:** (RunID, FK_Base_ScheduleID, FK_User_OPS, Input_Scenario_JSON, Output_KPIs_JSON, Suggested_Solution_ID)

---

## 8. Mô tả Giao diện (Wireframes)

### 8.1. Màn hình Đăng nhập (Desktop & Mobile)
* Logo PortLink, Tên đăng nhập, Mật khẩu, Lựa chọn ngôn ngữ, Nút "Đăng nhập".

### 8.2. Màn hình Điều phối chính (P-1, P-4, Desktop) - Layout 3 khu vực
* **Khu vực 1 (Bản đồ - 40%):** Sơ đồ layout cảng (RQF-006). (Hi-Fidelity).
* **Khu vực 2 (Lịch trình - 60%):** Biểu đồ Gantt (RQF-005). (Hi-Fidelity, Real-time).
* **Khu vực 3 (Sidebar/Tab - Bên phải):**
    * **Tab 1: KPIs (P-4):** Hiển thị các KPIs (RQF-007). (Hi-Fidelity).
    * **Tab 2: What-If (P-1):** Giao diện nhập kịch bản (RQF-008).
    * **Tab 3: Thông báo (P-1):** Trung tâm thông báo/log (RQF-014).

### 8.3. Màn hình Báo cáo Sự cố (P-2, Mobile)
* Layout 1 cột đơn giản: Tiêu đề "Báo cáo Sự cố", Form (RQF-009) và Nút "Gửi".

---

## 9. Giả định & Ràng buộc

**Giả định:**
* Hệ thống TOS của cảng **có API** để cung cấp dữ liệu lịch tàu và trạng thái (read-only).
* Các quy tắc nghiệp vụ (constraints) cho engine mô phỏng sẽ được cung cấp.
* Người dùng P-1 (Điều phối) đã có kiến thức nghiệp vụ cảng.

**Ràng buộc:**
* **Công nghệ:** Backend: **Node.js**. Frontend: **React**.
* **Phạm vi:** Giai đoạn 1 tập trung vào Tàu - Bến - Cẩu.
* **Chất lượng:** Các module trực quan hóa (Gantt, Map, KPIs) phải đạt chất lượng chuyên nghiệp, "xịn nhất có thể".

---

## 10. Phụ lục: Kịch bản Nghiệp vụ 1 (Use Case: Xử lý "What-If")

* **Bối cảnh:** 1 Bến, 2 Cầu.
* **Setup (09:00):**
    * (P-1) Đăng nhập. Dashboard (Map + Gantt) hiển thị:
    * Tàu A: 10:00 - 12:00 (Bến 1, Cầu 1).
    * Tàu B: 12:00 - 14:00 (Bến 1, Cầu 2).
    * KPI "Thời gian chờ" = 0 giờ.
* **Bước 1 (Nhập "What-If"):** (P-1) vào Tab "What-If", nhập kịch bản: "Tàu A", "Sự cố kỹ thuật", "Trễ 3 giờ".
* **Bước 2 (Mô phỏng):** (P-1) nhấn "Chạy Mô phỏng".
* **Bước 3 (Tính toán):** (Hệ thống Backend Node.js) Kích hoạt Engine. Tính toán (<5s):
    * Tàu A trễ 3h -> Lịch mới: 13:00 - 15:00 (Bến 1, Cầu 1).
    * *Xung đột:* Tàu A (bắt đầu 13:00) xung đột với Tàu B (bắt đầu 12:00) tại Bến 1.
    * *Giải quyết:* Engine lùi lịch Tàu B -> Lịch mới: 15:00 - 17:00 (Bến 1, Cầu 2).
* **Bước 4 (Hiển thị Tác động):**
    * Gantt chart (React) cập nhật real-time: Hiển thị lịch Tàu A, Tàu B cũ (nét mờ) VÀ lịch mới (nét đậm).
    * Map Layout: Bến 1 hiển thị "Bận" (Đỏ) lâu hơn.
    * Tab KPIs: KPI "Thời gian chờ trung bình" (24h tới) cập nhật, tăng lên 1.5 giờ.
* **Bước 5 (Đề xuất):**
    * Tab Thông báo: "Xung đột! Tàu B phải chờ 3h. Đề xuất: Chuyển Tàu B sang Bến 2 (hiện đang trống 12:00 - 16:00)?"
* **Kết quả:** (P-1) đã thấy trước tương lai, hiểu rõ tác động và có giải pháp thay thế.