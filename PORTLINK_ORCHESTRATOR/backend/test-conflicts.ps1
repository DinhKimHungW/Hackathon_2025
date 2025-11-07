# Test Conflicts Feature - PortLink
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Testing PortLink Conflicts Feature" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Login
Write-Host "1. Logging in..." -ForegroundColor Yellow
$loginBody = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.access_token
    Write-Host "   Success: Got auth token" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "   Error: $_" -ForegroundColor Red
    exit 1
}

# Get all conflicts
Write-Host "2. Getting all conflicts..." -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $token" }
    $conflicts = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/conflicts" -Method GET -Headers $headers
    $total = if ($conflicts.data) { $conflicts.data.Count } else { $conflicts.Count }
    Write-Host "   Found $total conflicts" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "   Error: $_" -ForegroundColor Red
}

# Get stats
Write-Host "3. Getting statistics..." -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/conflicts/stats" -Method GET -Headers $headers
    Write-Host "   Total: $($stats.total)" -ForegroundColor White
    Write-Host "   Unresolved: $($stats.unresolved)" -ForegroundColor White
    Write-Host "   Critical: $($stats.critical)" -ForegroundColor Red
    Write-Host "   CRITICAL: $($stats.bySeverity.CRITICAL)" -ForegroundColor Red
    Write-Host "   HIGH: $($stats.bySeverity.HIGH)" -ForegroundColor Yellow
    Write-Host "   MEDIUM: $($stats.bySeverity.MEDIUM)" -ForegroundColor Cyan
    Write-Host "   LOW: $($stats.bySeverity.LOW)" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "   Error: $_" -ForegroundColor Red
}

# Get unresolved
Write-Host "4. Getting unresolved conflicts..." -ForegroundColor Yellow
try {
    $unresolved = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/conflicts/unresolved?limit=10" -Method GET -Headers $headers
    $unresolvedCount = if ($unresolved) { $unresolved.Count } else { 0 }
    Write-Host "   Found $unresolvedCount unresolved" -ForegroundColor Green
    
    if ($unresolvedCount -gt 0) {
        $unresolved | Select-Object -First 3 | ForEach-Object {
            $severity = $_.severity
            $color = switch ($severity) {
                "CRITICAL" { "Red" }
                "HIGH" { "Yellow" }
                "MEDIUM" { "Cyan" }
                "LOW" { "Green" }
                default { "White" }
            }
            $desc = $_.description.Substring(0, [Math]::Min(50, $_.description.Length))
            Write-Host "     [$severity] $desc..." -ForegroundColor $color
        }
    }
    Write-Host ""
} catch {
    Write-Host "   Error: $_" -ForegroundColor Red
}

# Test filters
Write-Host "5. Testing filters..." -ForegroundColor Yellow
try {
    $critical = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/conflicts?severity=CRITICAL" -Method GET -Headers $headers
    $criticalCount = if ($critical.data) { $critical.data.Count } else { $critical.Count }
    Write-Host "   CRITICAL filter: $criticalCount results" -ForegroundColor Red
    
    $unresolvedOnly = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/conflicts?resolved=UNRESOLVED" -Method GET -Headers $headers
    $unresolvedOnlyCount = if ($unresolvedOnly.data) { $unresolvedOnly.data.Count } else { $unresolvedOnly.Count }
    Write-Host "   UNRESOLVED filter: $unresolvedOnlyCount results" -ForegroundColor Yellow
    Write-Host ""
} catch {
    Write-Host "   Error: $_" -ForegroundColor Red
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Test Complete!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
