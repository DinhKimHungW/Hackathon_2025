# FRONTEND AUTHENTICATION TEST
# Test the login flow and protected routes

Write-Host "`n╔══════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   FRONTEND AUTHENTICATION TEST - PHASE 5.2      ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Test prerequisites
Write-Host "📋 TEST PREREQUISITES:" -ForegroundColor Yellow
Write-Host "   ✅ Backend server running at http://localhost:3000" -ForegroundColor Green
Write-Host "   ✅ Frontend server running at http://localhost:5173" -ForegroundColor Green
Write-Host "   ✅ Test user: admin@portlink.com / Admin@123`n" -ForegroundColor Green

# Manual test checklist
Write-Host "🧪 MANUAL TEST CHECKLIST:" -ForegroundColor Yellow
Write-Host "`n1️⃣  LOGIN PAGE (http://localhost:5173/login)" -ForegroundColor Cyan
Write-Host "   [ ] Page loads without errors"
Write-Host "   [ ] Material-UI gradient background displays"
Write-Host "   [ ] Email and password fields present"
Write-Host "   [ ] 'Remember me' checkbox present"
Write-Host "   [ ] Test account credentials shown"

Write-Host "`n2️⃣  FORM VALIDATION" -ForegroundColor Cyan
Write-Host "   [ ] Submit empty form → Validation errors appear"
Write-Host "   [ ] Enter invalid email → 'Email không hợp lệ'"
Write-Host "   [ ] Enter password < 6 chars → 'Mật khẩu phải có ít nhất 6 ký tự'"
Write-Host "   [ ] Toggle password visibility → Eye icon works"

Write-Host "`n3️⃣  LOGIN FLOW" -ForegroundColor Cyan
Write-Host "   [ ] Enter: admin@portlink.com / Admin@123"
Write-Host "   [ ] Click 'Đăng nhập' button"
Write-Host "   [ ] Loading spinner appears"
Write-Host "   [ ] Redirect to /dashboard on success"

Write-Host "`n4️⃣  DASHBOARD PAGE" -ForegroundColor Cyan
Write-Host "   [ ] Dashboard loads successfully"
Write-Host "   [ ] User info displays (Xin chào, Admin User (ADMIN))"
Write-Host "   [ ] 4 feature cards displayed (Ships, Assets, Schedules, Tasks)"
Write-Host "   [ ] Success status card shows Phase 5.2 completion"
Write-Host "   [ ] 'Đăng xuất' button present"

Write-Host "`n5️⃣  BROWSER DEVELOPER TOOLS" -ForegroundColor Cyan
Write-Host "   [ ] Open DevTools (F12)"
Write-Host "   [ ] Console → No errors"
Write-Host "   [ ] Application → Local Storage:"
Write-Host "       [ ] access_token exists"
Write-Host "       [ ] refresh_token exists"
Write-Host "       [ ] user object exists with email and role"
Write-Host "   [ ] Network → Check request logs:"
Write-Host "       [ ] POST /api/v1/auth/login → 200/201 OK"
Write-Host "       [ ] Authorization header contains Bearer token"

Write-Host "`n6️⃣  PROTECTED ROUTES" -ForegroundColor Cyan
Write-Host "   [ ] Logged in → Navigate to /dashboard → Success"
Write-Host "   [ ] Click 'Đăng xuất' → Redirect to /login"
Write-Host "   [ ] Logged out → Try /dashboard → Redirect to /login"
Write-Host "   [ ] Login again → Redirect back to /dashboard"

Write-Host "`n7️⃣  TOKEN REFRESH (ADVANCED)" -ForegroundColor Cyan
Write-Host "   [ ] Login successfully"
Write-Host "   [ ] Open DevTools → Application → Local Storage"
Write-Host "   [ ] Delete 'access_token' (keep refresh_token)"
Write-Host "   [ ] Refresh page or make API call"
Write-Host "   [ ] Check Console → Should see token refresh attempt"
Write-Host "   [ ] New access_token should appear in Local Storage"

Write-Host "`n8️⃣  LOGOUT FLOW" -ForegroundColor Cyan
Write-Host "   [ ] Click 'Đăng xuất' button"
Write-Host "   [ ] Network → POST /api/v1/auth/logout → 200 OK"
Write-Host "   [ ] Local Storage cleared (all tokens removed)"
Write-Host "   [ ] Redirect to /login page"

Write-Host "`n9️⃣  ROLE-BASED ACCESS (when implemented)" -ForegroundColor Cyan
Write-Host "   [ ] Login as ADMIN → Access admin routes"
Write-Host "   [ ] Login as DRIVER → Access /unauthorized for admin routes"

Write-Host "`n🔟  ERROR HANDLING" -ForegroundColor Cyan
Write-Host "   [ ] Invalid credentials → Error alert appears"
Write-Host "   [ ] Network error → Error message shown"
Write-Host "   [ ] Backend down → Graceful error handling"

Write-Host "`n`n🎯 AUTOMATED BACKEND CHECK:" -ForegroundColor Yellow
Write-Host "   Testing backend authentication endpoint..." -ForegroundColor Gray

try {
    $body = @{
        email = 'admin@portlink.com'
        password = 'Admin@123'
    } | ConvertTo-Json

    $response = Invoke-RestMethod `
        -Uri 'http://localhost:3000/api/v1/auth/login' `
        -Method POST `
        -Body $body `
        -ContentType 'application/json' `
        -ErrorAction Stop

    Write-Host "`n   ✅ BACKEND AUTHENTICATION: WORKING" -ForegroundColor Green
    Write-Host "      User: $($response.user.email)" -ForegroundColor Cyan
    Write-Host "      Role: $($response.user.role)" -ForegroundColor Cyan
    Write-Host "      Token: $($response.access_token.Substring(0,30))..." -ForegroundColor Yellow

} catch {
    Write-Host "`n   ❌ BACKEND AUTHENTICATION: FAILED" -ForegroundColor Red
    Write-Host "      Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "      Make sure backend server is running!" -ForegroundColor Yellow
}

Write-Host "`n`n📊 TEST SUMMARY:" -ForegroundColor Yellow
Write-Host "   Frontend URL: http://localhost:5173" -ForegroundColor Cyan
Write-Host "   Backend URL:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Test Account: admin@portlink.com / Admin@123`n" -ForegroundColor Green

Write-Host "💡 TIP: Open browser to http://localhost:5173 and follow the checklist above`n" -ForegroundColor Yellow

Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Press any key to open browser..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')

# Open browser
Start-Process "http://localhost:5173"
