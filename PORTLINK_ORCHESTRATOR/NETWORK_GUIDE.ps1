# ========================================
# HUONG DAN CHAY PORTLINK TU DIEN THOAI
# ========================================

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  PortLink Network Access Configuration      " -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# 1. IP may tinh
Write-Host "BUOC 1: IP CUA MAY TINH" -ForegroundColor Yellow
Write-Host "   IP Address: 172.20.10.8" -ForegroundColor Green
Write-Host ""

# 2. Mo Firewall
Write-Host "BUOC 2: MO FIREWALL (CAN QUYEN ADMIN)" -ForegroundColor Yellow
Write-Host "   1. Mo PowerShell voi quyen Administrator" -ForegroundColor White
Write-Host "   2. Chay file: open-firewall.ps1" -ForegroundColor Green
Write-Host ""

# 3. Restart Backend & Frontend
Write-Host "BUOC 3: KHOI DONG LAI BACKEND VA FRONTEND" -ForegroundColor Yellow
Write-Host "   Backend va Frontend da duoc cau hinh:" -ForegroundColor White
Write-Host "   - Bind 0.0.0.0 (cho phep truy cap tu mang)" -ForegroundColor Green
Write-Host "   - CORS da duoc cau hinh cho IP mang" -ForegroundColor Green
Write-Host ""

# 4. URLs
Write-Host "BUOC 4: URL TRUY CAP" -ForegroundColor Yellow
Write-Host ""
Write-Host "   TU MAY TINH:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "   Backend:  http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "   TU DIEN THOAI (cung WiFi):" -ForegroundColor Cyan
Write-Host "   Frontend: http://172.20.10.8:5173" -ForegroundColor White
Write-Host "   Backend:  http://172.20.10.8:3000" -ForegroundColor White
Write-Host ""

# 5. Tai khoan
Write-Host "TAI KHOAN DANG NHAP:" -ForegroundColor Yellow
Write-Host "   Admin:      admin@catlai.com / Admin@2025" -ForegroundColor White
Write-Host "   Manager:    manager@catlai.com / Manager@2025" -ForegroundColor White
Write-Host "   Operations: ops@catlai.com / Ops@2025" -ForegroundColor White
Write-Host "   Driver:     driver@catlai.com / Driver@2025" -ForegroundColor White
Write-Host ""

# 6. Luu y
Write-Host "LUU Y:" -ForegroundColor Red
Write-Host "   1. May tinh va dien thoai phai cung mang WiFi" -ForegroundColor White
Write-Host "   2. Can mo Firewall truoc khi truy cap" -ForegroundColor White
Write-Host "   3. Backend va Frontend phai dang chay" -ForegroundColor White
Write-Host ""

# 7. Test
Write-Host "KIEM TRA KET NOI:" -ForegroundColor Yellow
Write-Host "   Tu dien thoai, mo trinh duyet va thu:" -ForegroundColor White
Write-Host "   http://172.20.10.8:3000/api/v1/health" -ForegroundColor Green
Write-Host ""

Write-Host "===============================================" -ForegroundColor Green
Write-Host "    Configuration Completed Successfully!    " -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""

pause
