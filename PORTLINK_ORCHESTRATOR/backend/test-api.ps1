# Test API Script
$baseUrl = "http://localhost:3000/api/v1"

# Login
Write-Host "Testing Login..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@catlai.com"
    password = "Admin@2025"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.data.accessToken
Write-Host "Login successful! Token: $($token.Substring(0, 20))..." -ForegroundColor Green

# Test Assets API
Write-Host "`nTesting Assets API..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
}
$assetsResponse = Invoke-RestMethod -Uri "$baseUrl/assets" -Method Get -Headers $headers
Write-Host "Assets count: $($assetsResponse.data.Count)" -ForegroundColor Green
Write-Host "First 3 assets:" -ForegroundColor Cyan
$assetsResponse.data | Select-Object -First 3 | Format-Table assetCode, name, type, status

# Test Conflicts API
Write-Host "`nTesting Conflicts API..." -ForegroundColor Yellow
$conflictsResponse = Invoke-RestMethod -Uri "$baseUrl/conflicts?page=1&limit=10" -Method Get -Headers $headers
Write-Host "Conflicts response type: $($conflictsResponse.GetType().Name)" -ForegroundColor Cyan
Write-Host "Conflicts data type: $($conflictsResponse.data.GetType().Name)" -ForegroundColor Cyan
if ($conflictsResponse.data) {
    Write-Host "Conflicts count: $($conflictsResponse.data.Count)" -ForegroundColor Green
    if ($conflictsResponse.data.Count -gt 0) {
        Write-Host "All conflicts:" -ForegroundColor Cyan
        $conflictsResponse.data | Format-Table conflictType, severity, @{Label="Description";Expression={$_.description.Substring(0, [Math]::Min(50, $_.description.Length))}}, resolved -AutoSize
    } else {
        Write-Host "No conflicts found!" -ForegroundColor Red
    }
} else {
    Write-Host "No data in response!" -ForegroundColor Red
    Write-Host "Full response: $($conflictsResponse | ConvertTo-Json)" -ForegroundColor Yellow
}

# Test Conflicts Stats
Write-Host "`nTesting Conflicts Stats..." -ForegroundColor Yellow
$statsResponse = Invoke-RestMethod -Uri "$baseUrl/conflicts/stats" -Method Get -Headers $headers
Write-Host "Stats: $($statsResponse.data | ConvertTo-Json)" -ForegroundColor Cyan

Write-Host "`nAPI Test Complete!" -ForegroundColor Green
