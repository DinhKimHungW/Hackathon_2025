# ========================================
# HƯỚNG DẪN CHẠY PORTLINK TỪ ĐIỆN THOẠI
# ========================================

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║       PortLink Network Access Configuration Guide            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# 1. Hiển thị IP máy tính
Write-Host "📍 BƯỚC 1: IP CỦA MÁY TÍNH" -ForegroundColor Yellow
Write-Host "   IP Address: 172.20.10.8" -ForegroundColor Green
Write-Host ""

# 2. Mở Firewall
Write-Host "🔥 BƯỚC 2: MỞ FIREWALL" -ForegroundColor Yellow
Write-Host "   Chạy PowerShell với quyền Administrator và thực hiện:" -ForegroundColor White
Write-Host "   Right-click PowerShell -> Run as Administrator" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Sau đó chạy file: open-firewall.ps1" -ForegroundColor Green
Write-Host "   Hoặc chạy lệnh:" -ForegroundColor White
Write-Host '   New-NetFirewallRule -DisplayName "PortLink Backend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow' -ForegroundColor Gray
Write-Host '   New-NetFirewallRule -DisplayName "PortLink Frontend" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow' -ForegroundColor Gray
Write-Host ""

# 3. Restart Backend & Frontend
Write-Host "🔄 BƯỚC 3: KHỞI ĐỘNG LẠI BACKEND VÀ FRONTEND" -ForegroundColor Yellow
Write-Host "   Backend đã được cấu hình để:" -ForegroundColor White
Write-Host "   - Bind 0.0.0.0 (cho phép truy cập từ mạng)" -ForegroundColor Green
Write-Host "   - CORS cho phép: localhost, 172.20.10.8, portlink.tech" -ForegroundColor Green
Write-Host ""
Write-Host "   Frontend đã được cấu hình để:" -ForegroundColor White
Write-Host "   - Bind 0.0.0.0 (cho phép truy cập từ mạng)" -ForegroundColor Green
Write-Host "   - API URL: http://172.20.10.8:3000" -ForegroundColor Green
Write-Host ""

# 4. URLs để truy cập
Write-Host "🌐 BƯỚC 4: URL TRUY CẬP" -ForegroundColor Yellow
Write-Host ""
Write-Host "   TỪ MÁY TÍNH (localhost):" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "   Backend:  http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "   TỪ ĐIỆN THOẠI (cùng WiFi):" -ForegroundColor Cyan
Write-Host "   Frontend: http://172.20.10.8:5173" -ForegroundColor White
Write-Host "   Backend:  http://172.20.10.8:3000" -ForegroundColor White
Write-Host ""
Write-Host "   VỚI DOMAIN portlink.tech:" -ForegroundColor Cyan
Write-Host "   Cần cấu hình DNS trên điện thoại:" -ForegroundColor White
Write-Host "   - Android: Dùng app 'Virtual Hosts' (không cần root)" -ForegroundColor Gray
Write-Host "   - iPhone: Dùng app 'DNSCloak' hoặc profile DNS" -ForegroundColor Gray
Write-Host "   - Thêm entry: 172.20.10.8 portlink.tech" -ForegroundColor Gray
Write-Host ""

# 5. Tài khoản đăng nhập
Write-Host "👤 TÀI KHOẢN ĐĂNG NHẬP:" -ForegroundColor Yellow
Write-Host "   Admin:      admin@catlai.com / Admin@2025" -ForegroundColor White
Write-Host "   Manager:    manager@catlai.com / Manager@2025" -ForegroundColor White
Write-Host "   Operations: ops@catlai.com / Ops@2025" -ForegroundColor White
Write-Host "   Driver:     driver@catlai.com / Driver@2025" -ForegroundColor White
Write-Host ""

# 6. Lưu ý
Write-Host "⚠️  LƯU Ý:" -ForegroundColor Red
Write-Host "   1. Máy tính và điện thoại phải cùng mạng WiFi" -ForegroundColor White
Write-Host "   2. Cần mở Firewall trước khi truy cập từ điện thoại" -ForegroundColor White
Write-Host "   3. Nếu thay đổi mạng, IP có thể thay đổi" -ForegroundColor White
Write-Host "   4. Backend và Frontend phải đang chạy" -ForegroundColor White
Write-Host ""

# 7. Kiểm tra kết nối
Write-Host "🔍 KIỂM TRA KẾT NỐI:" -ForegroundColor Yellow
Write-Host "   Từ điện thoại, mở trình duyệt và thử:" -ForegroundColor White
Write-Host "   http://172.20.10.8:3000/api/v1/health" -ForegroundColor Green
Write-Host "   Nếu thấy {\"status\":\"ok\"} nghĩa là đã kết nối thành công!" -ForegroundColor Green
Write-Host ""

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              ✓ Configuration Completed!                       ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "Press any key to continue..." -ForegroundColor Yellow
pause
