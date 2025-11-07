$ErrorActionPreference = "Stop"

Write-Host "`n=== Uploading Frontend Files via Kudu VFS ===" -ForegroundColor Cyan

# Get credentials
Write-Host "Getting credentials..." -ForegroundColor Yellow
$xml = az webapp deployment list-publishing-profiles --resource-group portlink-rg --name portlink-frontend --xml
$pubXml = [xml]$xml
$cred = $pubXml.publishData.publishProfile | Where-Object { $_.publishMethod -eq 'MSDeploy' } | Select-Object -First 1

$username = $cred.userName
$password = $cred.userPWD
$auth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${username}:${password}"))
$commonHeaders = @{ Authorization = "Basic $auth" }

# Kudu VFS base (trailing slash required)
$kuduBase = "https://portlink-frontend.scm.azurewebsites.net/api/vfs/site/wwwroot/"

# Helpers
function Encode-Path([string]$rel) {
    $segments = $rel -split '/'
    return ($segments | ForEach-Object { [System.Uri]::EscapeDataString($_) }) -join '/'
}

function Ensure-Dir($relativeDir) {
    # Create directory via PUT with If-None-Match: *
    $encoded = Encode-Path $relativeDir
    $dirUrl = "$kuduBase$encoded/"
    try {
        Invoke-WebRequest -Uri $dirUrl -Method PUT -Headers ($commonHeaders + @{ 'If-None-Match'='*' }) -Body '' -ContentType 'application/octet-stream' | Out-Null
    } catch { }
}

# Paths
$distPath = "C:\\Users\\khvnp\\Documents\\Hackathon_2025\\PORTLINK_ORCHESTRATOR\\frontend\\dist"

# Create directories first (including nested)
$dirs = Get-ChildItem -Path $distPath -Recurse -Directory | Sort-Object FullName
Write-Host "Creating $($dirs.Count) directories..." -ForegroundColor Yellow
foreach ($dir in $dirs) {
    if ($dir.FullName.Length -le $distPath.Length) { continue }
    $relDir = $dir.FullName.Substring($distPath.Length + 1).Replace('\\','/')
    if ([string]::IsNullOrWhiteSpace($relDir)) { continue }
    Ensure-Dir $relDir
}

# Upload files
$files = Get-ChildItem -Path $distPath -Recurse -File
Write-Host "Found $($files.Count) files to upload`n" -ForegroundColor Yellow

$uploaded = 0
$index = 0
foreach ($file in $files) {
    $index++
    $relativePath = $file.FullName.Substring($distPath.Length + 1).Replace('\\', '/')
    $encodedRel = Encode-Path $relativePath
    $url = "$kuduBase$encodedRel"

    Write-Host "[$index/$($files.Count)] $relativePath" -NoNewline
    
    try {
        Invoke-WebRequest -Uri $url -Method PUT -InFile $file.FullName -Headers ($commonHeaders + @{ 'If-Match'='*' }) -ContentType "application/octet-stream" | Out-Null
        Write-Host " OK" -ForegroundColor Green
        $uploaded++
    }
    catch {
        Write-Host " FAILED" -ForegroundColor Red
        try {
            $resp = $_.Exception.Response
            if ($resp) {
                Write-Host ("    HTTP {0} {1}" -f [int]$resp.StatusCode, $resp.StatusDescription) -ForegroundColor DarkYellow
                $sr = New-Object System.IO.StreamReader($resp.GetResponseStream())
                $body = $sr.ReadToEnd()
                if ($body) { Write-Host ("    Body: {0}" -f $body) -ForegroundColor DarkGray }
            }
        } catch { }
    }
}

Write-Host "`nUploaded $uploaded / $($files.Count) files" -ForegroundColor Cyan

# Restart
Write-Host "`nRestarting app..." -ForegroundColor Yellow
az webapp restart --resource-group portlink-rg --name portlink-frontend --output none

Write-Host "`nDone!" -ForegroundColor Green
Write-Host "URL: https://portlink-frontend.azurewebsites.net`n" -ForegroundColor Cyan
