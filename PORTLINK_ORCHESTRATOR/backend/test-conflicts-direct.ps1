# Direct Conflicts API Test
$baseUrl = "http://localhost:3000/api/v1"

# Login
$loginBody = @{
    email = "admin@catlai.com"
    password = "Admin@2025"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.data.accessToken

$headers = @{
    "Authorization" = "Bearer $token"
}

# Test direct conflicts endpoint
Write-Host "Testing GET /api/v1/conflicts" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/conflicts" -Method Get -Headers $headers
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Content:" -ForegroundColor Cyan
    $json = $response.Content | ConvertFrom-Json
    Write-Host ($json | ConvertTo-Json -Depth 5)
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
