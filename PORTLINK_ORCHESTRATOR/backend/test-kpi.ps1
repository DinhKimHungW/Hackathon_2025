# PortLink KPI Endpoints Test Script
# Test all KPI endpoints with authentication

Write-Host "`n╔═══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║       PORTLINK KPI ENDPOINTS TEST            ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Wait for server to be ready
Write-Host "⏳ Waiting for backend server..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

try {
    # Step 1: Login and get token
    Write-Host "`n[1/6] 🔐 Authenticating..." -ForegroundColor Cyan
    $loginBody = @{
        email = 'admin@portlink.com'
        password = 'Admin@123'
    } | ConvertTo-Json
    
    $loginResult = Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/auth/login' `
        -Method POST `
        -Body $loginBody `
        -ContentType 'application/json'
    
    $token = $loginResult.access_token
    Write-Host "✅ Login successful! Token: $($token.Substring(0,30))..." -ForegroundColor Green
    
    $headers = @{
        Authorization = "Bearer $token"
    }
    
    # Step 2: Test KPI Summary
    Write-Host "`n[2/6] 📊 Testing GET /api/v1/kpis/summary..." -ForegroundColor Cyan
    try {
        $summary = Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/kpis/summary' -Headers $headers
        Write-Host "✅ KPI Summary:" -ForegroundColor Green
        Write-Host "   Ships: $($summary.ships.total) total, $($summary.ships.berthing) berthing" -ForegroundColor White
        Write-Host "   Tasks: $($summary.tasks.total) total, $($summary.tasks.active) active, $($summary.tasks.completionRate)% complete" -ForegroundColor White
        Write-Host "   Assets: $($summary.assets.total) total, $($summary.assets.inUse) in use, $($summary.assets.utilizationRate)% utilization" -ForegroundColor White
        Write-Host "   Schedules: $($summary.schedules.total) total, $($summary.schedules.active) active" -ForegroundColor White
    } catch {
        Write-Host "❌ FAILED: $_" -ForegroundColor Red
    }
    
    # Step 3: Test Ship Arrivals Chart
    Write-Host "`n[3/6] 🚢 Testing GET /api/v1/kpis/charts/ship-arrivals?days=7..." -ForegroundColor Cyan
    try {
        $shipArrivals = Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/kpis/charts/ship-arrivals?days=7' -Headers $headers
        Write-Host "✅ Ship Arrivals: $($shipArrivals.Count) data points" -ForegroundColor Green
        if ($shipArrivals.Count -gt 0) {
            Write-Host "   Latest: $($shipArrivals[-1].date) - $($shipArrivals[-1].arrivals) arrivals, $($shipArrivals[-1].departures) departures" -ForegroundColor White
        }
    } catch {
        Write-Host "❌ FAILED: $_" -ForegroundColor Red
    }
    
    # Step 4: Test Task Status Chart
    Write-Host "`n[4/6] 📋 Testing GET /api/v1/kpis/charts/task-status..." -ForegroundColor Cyan
    try {
        $taskStatus = Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/kpis/charts/task-status' -Headers $headers
        Write-Host "✅ Task Status Distribution:" -ForegroundColor Green
        foreach ($status in $taskStatus) {
            Write-Host "   $($status.status): $($status.count) ($($status.percentage)%)" -ForegroundColor White
        }
    } catch {
        Write-Host "❌ FAILED: $_" -ForegroundColor Red
    }
    
    # Step 5: Test Asset Utilization Chart
    Write-Host "`n[5/6] 🏗️  Testing GET /api/v1/kpis/charts/asset-utilization..." -ForegroundColor Cyan
    try {
        $assetUtil = Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/kpis/charts/asset-utilization' -Headers $headers
        Write-Host "✅ Asset Utilization by Type:" -ForegroundColor Green
        foreach ($asset in $assetUtil) {
            Write-Host "   $($asset.type): $($asset.inUse)/$($asset.total) in use ($($asset.utilizationRate)%)" -ForegroundColor White
        }
    } catch {
        Write-Host "❌ FAILED: $_" -ForegroundColor Red
    }
    
    # Step 6: Test Schedule Timeline Chart
    Write-Host "`n[6/6] 📅 Testing GET /api/v1/kpis/charts/schedule-timeline?days=7..." -ForegroundColor Cyan
    try {
        $scheduleTimeline = Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/kpis/charts/schedule-timeline?days=7' -Headers $headers
        Write-Host "✅ Schedule Timeline: $($scheduleTimeline.Count) data points" -ForegroundColor Green
        if ($scheduleTimeline.Count -gt 0) {
            Write-Host "   Latest: $($scheduleTimeline[-1].date) - $($scheduleTimeline[-1].scheduled) scheduled, $($scheduleTimeline[-1].active) active, $($scheduleTimeline[-1].completed) completed" -ForegroundColor White
        }
    } catch {
        Write-Host "❌ FAILED: $_" -ForegroundColor Red
    }
    
    # Summary
    Write-Host "`n╔═══════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║          ✅ ALL KPI TESTS COMPLETED!          ║" -ForegroundColor Green
    Write-Host "╚═══════════════════════════════════════════════╝`n" -ForegroundColor Green
    
} catch {
    Write-Host "`n❌ TEST FAILED!" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "`n💡 Make sure backend server is running on http://localhost:3000" -ForegroundColor Yellow
}
