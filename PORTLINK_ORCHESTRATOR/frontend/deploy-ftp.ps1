# Deploy Frontend to Azure via FTP
param(
    [string]$SourcePath = "$PSScriptRoot\dist",
    [string]$FtpUrl = "ftps://waws-prod-sg1-111.ftp.azurewebsites.windows.net",
    [string]$Username,
    [string]$Password
)

Write-Host "`n=== Azure FTP Deployment Script ===" -ForegroundColor Cyan
Write-Host "Source: $SourcePath" -ForegroundColor Yellow

# Get credentials if not provided
if (-not $Username -or -not $Password) {
    Write-Host "`nRetrieving FTP credentials..." -ForegroundColor Yellow
    $creds = az webapp deployment list-publishing-profiles --resource-group portlink-rg --name portlink-frontend --query "[?publishMethod=='FTP']" | ConvertFrom-Json
    $Username = $creds[0].userName
    $Password = $creds[0].userPWD
    $FtpUrl = $creds[0].publishUrl -replace '/site/wwwroot$', ''
}

Write-Host "FTP Server: $FtpUrl" -ForegroundColor Yellow
Write-Host "Username: $Username" -ForegroundColor Yellow

# Function to upload file via FTP
function Upload-FileToFtp {
    param(
        [string]$LocalFile,
        [string]$RemotePath,
        [string]$FtpServer,
        [string]$User,
        [string]$Pass
    )
    
    try {
        $uri = "$FtpServer$RemotePath"
        $webclient = New-Object System.Net.WebClient
        $webclient.Credentials = New-Object System.Net.NetworkCredential($User, $Pass)
        
        # Enable SSL/TLS for FTPS
        [System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12
        
        $webclient.UploadFile($uri, $LocalFile) | Out-Null
        return $true
    }
    catch {
        Write-Host "Error uploading ${RemotePath}: $_" -ForegroundColor Red
        return $false
    }
    finally {
        if ($webclient) { $webclient.Dispose() }
    }
}

# Function to create FTP directory
function Create-FtpDirectory {
    param(
        [string]$RemotePath,
        [string]$FtpServer,
        [string]$User,
        [string]$Pass
    )
    
    try {
        $uri = "$FtpServer$RemotePath"
        $request = [System.Net.WebRequest]::Create($uri)
        $request.Credentials = New-Object System.Net.NetworkCredential($User, $Pass)
        $request.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
        $request.EnableSsl = $true
        [System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}
        
        $response = $request.GetResponse()
        $response.Close()
        return $true
    }
    catch {
        # Directory might already exist
        return $false
    }
}

Write-Host "`nStarting upload..." -ForegroundColor Green

# Get all files
$files = Get-ChildItem -Path $SourcePath -Recurse -File

$totalFiles = $files.Count
$uploaded = 0
$failed = 0

Write-Host "Found $totalFiles files to upload`n" -ForegroundColor Yellow

foreach ($file in $files) {
    $relativePath = $file.FullName.Substring($SourcePath.Length).Replace('\', '/')
    $remotePath = "/site/wwwroot$relativePath"
    $remoteDir = Split-Path $remotePath -Parent
    
    # Create directory if needed
    if ($remoteDir -ne "/site/wwwroot") {
        Create-FtpDirectory -RemotePath $remoteDir -FtpServer $FtpUrl -User $Username -Pass $Password | Out-Null
    }
    
    # Upload file
    Write-Host "[$($uploaded + 1)/$totalFiles] Uploading: $relativePath" -NoNewline
    
    if (Upload-FileToFtp -LocalFile $file.FullName -RemotePath $remotePath -FtpServer $FtpUrl -User $Username -Pass $Password) {
        Write-Host " ✓" -ForegroundColor Green
        $uploaded++
    }
    else {
        Write-Host " ✗" -ForegroundColor Red
        $failed++
    }
}

Write-Host "`n=== Upload Complete ===" -ForegroundColor Cyan
Write-Host "Uploaded: $uploaded files" -ForegroundColor Green
if ($failed -gt 0) {
    Write-Host "Failed: $failed files" -ForegroundColor Red
}

# Restart app
Write-Host "`nRestarting app..." -ForegroundColor Yellow
az webapp restart --resource-group portlink-rg --name portlink-frontend --output none

Write-Host "`n✓ Deployment complete!" -ForegroundColor Green
Write-Host "URL: https://portlink-frontend.azurewebsites.net`n" -ForegroundColor Cyan
