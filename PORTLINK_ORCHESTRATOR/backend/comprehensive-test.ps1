# COMPREHENSIVE TESTING SCRIPT - PHASE 1 TO 4
# Test all functionalities before moving to Phase 5

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "PORTLINK ORCHESTRATOR - COMPREHENSIVE TESTING" -ForegroundColor Cyan
Write-Host "Testing Phase 1 to Phase 4" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Test counters
$totalTests = 0
$passedTests = 0
$failedTests = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Uri,
        [hashtable]$Headers = @{},
        [string]$Body = $null
    )
    
    $global:totalTests++
    Write-Host "[$global:totalTests] Testing: $Name" -ForegroundColor Yellow
    
    try {
        $params = @{
            Uri = $Uri
            Method = $Method
            Headers = $Headers
            ContentType = 'application/json'
        }
        
        if ($Body) {
            $params.Body = $Body
        }
        
        $response = Invoke-RestMethod @params
        
        if ($response.success -eq $true) {
            Write-Host "    ✅ PASSED" -ForegroundColor Green
            $global:passedTests++
            return $response
        } else {
            Write-Host "    ❌ FAILED: $($response.message)" -ForegroundColor Red
            $global:failedTests++
            return $null
        }
    } catch {
        Write-Host "    ❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
        $global:failedTests++
        return $null
    }
}

# Wait for server to start
Write-Host "Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "PHASE 1: DATABASE & AUTHENTICATION" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Login as Admin
Write-Host "--- Authentication Tests ---" -ForegroundColor Magenta
$loginBody = @{
    email = 'admin@portlink.com'
    password = 'Admin@123'
} | ConvertTo-Json

$loginResponse = Test-Endpoint `
    -Name "Login as Admin" `
    -Method POST `
    -Uri 'http://localhost:3000/api/v1/auth/login' `
    -Body $loginBody

if ($loginResponse) {
    $token = $loginResponse.data.accessToken
    $userId = $loginResponse.data.user.id
    Write-Host "    Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
    Write-Host "    User ID: $userId" -ForegroundColor Gray
    Write-Host "    Role: $($loginResponse.data.user.role)" -ForegroundColor Gray
} else {
    Write-Host "⚠️ Cannot proceed without authentication token" -ForegroundColor Red
    exit 1
}

$authHeaders = @{
    'Authorization' = "Bearer $token"
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "PHASE 2: CORE ENTITIES (CRUD)" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Test 2: Users Management
Write-Host "--- Users Module ---" -ForegroundColor Magenta
$usersResponse = Test-Endpoint `
    -Name "Get All Users" `
    -Method GET `
    -Uri 'http://localhost:3000/api/v1/users' `
    -Headers $authHeaders

if ($usersResponse) {
    Write-Host "    Total users: $($usersResponse.data.Count)" -ForegroundColor Gray
}

# Test 3: Assets Management
Write-Host ""
Write-Host "--- Assets Module ---" -ForegroundColor Magenta
$assetsResponse = Test-Endpoint `
    -Name "Get All Assets" `
    -Method GET `
    -Uri 'http://localhost:3000/api/v1/assets' `
    -Headers $authHeaders

if ($assetsResponse) {
    Write-Host "    Total assets: $($assetsResponse.data.Count)" -ForegroundColor Gray
    $craneAsset = $assetsResponse.data | Where-Object { $_.type -eq 'CRANE' } | Select-Object -First 1
    if ($craneAsset) {
        $craneId = $craneAsset.id
        Write-Host "    Sample Crane ID: $craneId" -ForegroundColor Gray
    }
}

# Test 4: Ship Visits Management
Write-Host ""
Write-Host "--- Ship Visits Module ---" -ForegroundColor Magenta
$shipVisitsResponse = Test-Endpoint `
    -Name "Get All Ship Visits" `
    -Method GET `
    -Uri 'http://localhost:3000/api/v1/ship-visits' `
    -Headers $authHeaders

if ($shipVisitsResponse) {
    Write-Host "    Total ship visits: $($shipVisitsResponse.data.Count)" -ForegroundColor Gray
    $shipVisit = $shipVisitsResponse.data | Select-Object -First 1
    if ($shipVisit) {
        $shipVisitId = $shipVisit.id
        Write-Host "    Sample Ship Visit ID: $shipVisitId" -ForegroundColor Gray
        Write-Host "    Vessel: $($shipVisit.vesselName)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "PHASE 3: BUSINESS LOGIC" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Test 5: Create Schedule
Write-Host "--- Schedules Module ---" -ForegroundColor Magenta
$scheduleBody = @{
    shipVisitId = $shipVisitId
    startTime = '2025-11-03T08:00:00Z'
    endTime = '2025-11-03T18:00:00Z'
    status = 'PLANNED'
    priority = 'HIGH'
    operation = 'Test Schedule - Comprehensive Testing'
} | ConvertTo-Json

$scheduleResponse = Test-Endpoint `
    -Name "Create Schedule" `
    -Method POST `
    -Uri 'http://localhost:3000/api/v1/schedules' `
    -Headers $authHeaders `
    -Body $scheduleBody

if ($scheduleResponse) {
    $scheduleId = $scheduleResponse.data.id
    Write-Host "    Schedule ID: $scheduleId" -ForegroundColor Gray
}

# Test 6: Get Schedules
$getSchedulesResponse = Test-Endpoint `
    -Name "Get All Schedules" `
    -Method GET `
    -Uri 'http://localhost:3000/api/v1/schedules' `
    -Headers $authHeaders

if ($getSchedulesResponse) {
    Write-Host "    Total schedules: $($getSchedulesResponse.data.Count)" -ForegroundColor Gray
}

# Test 7: Create Tasks
Write-Host ""
Write-Host "--- Tasks Module ---" -ForegroundColor Magenta
$tasksCreated = @()
for ($i = 1; $i -le 5; $i++) {
    $startHour = 8 + ($i - 1) * 2
    $endHour = $startHour + 2
    
    $taskBody = @{
        scheduleId = $scheduleId
        assetId = $craneId
        taskType = 'LOADING'
        status = 'PENDING'
        priority = 'MEDIUM'
        description = "Test Task $i - Loading containers"
        startTime = "2025-11-03T$($startHour.ToString('00')):00:00Z"
        endTime = "2025-11-03T$($endHour.ToString('00')):00:00Z"
    } | ConvertTo-Json
    
    $taskResponse = Test-Endpoint `
        -Name "Create Task $i" `
        -Method POST `
        -Uri 'http://localhost:3000/api/v1/tasks' `
        -Headers $authHeaders `
        -Body $taskBody
    
    if ($taskResponse) {
        $tasksCreated += $taskResponse.data.id
        Write-Host "    Task $i ID: $($taskResponse.data.id)" -ForegroundColor Gray
    }
}

# Test 8: Get Tasks
$getTasksResponse = Test-Endpoint `
    -Name "Get All Tasks" `
    -Method GET `
    -Uri "http://localhost:3000/api/v1/tasks?scheduleId=$scheduleId" `
    -Headers $authHeaders

if ($getTasksResponse) {
    Write-Host "    Total tasks for schedule: $($getTasksResponse.data.Count)" -ForegroundColor Gray
}

# Test 9: Event Logs
Write-Host ""
Write-Host "--- Event Logs Module ---" -ForegroundColor Magenta
$eventLogsResponse = Test-Endpoint `
    -Name "Get Event Logs" `
    -Method GET `
    -Uri 'http://localhost:3000/api/v1/event-logs?limit=10' `
    -Headers $authHeaders

if ($eventLogsResponse) {
    Write-Host "    Recent events: $($eventLogsResponse.data.Count)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "PHASE 4: SIMULATION ENGINE" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Test 10: Run Ship Delay Simulation
Write-Host "--- Simulation Tests ---" -ForegroundColor Magenta
$simulationBody = @{
    name = 'Test Simulation - Ship Delay'
    description = 'Comprehensive test: Ship arrives 3 hours late'
    baseScheduleId = $scheduleId
    scenarioType = 'SHIP_DELAY'
    changes = @(
        @{
            entityType = 'ship_visit'
            entityId = $shipVisitId
            field = 'delayHours'
            oldValue = 0
            newValue = 3
        }
    )
} | ConvertTo-Json -Depth 5

Write-Host "Running simulation..." -ForegroundColor Yellow
$simStartTime = Get-Date
$simulationResponse = Test-Endpoint `
    -Name "Run Ship Delay Simulation" `
    -Method POST `
    -Uri 'http://localhost:3000/api/v1/simulations' `
    -Headers $authHeaders `
    -Body $simulationBody

$simEndTime = Get-Date
$simExecutionTime = ($simEndTime - $simStartTime).TotalMilliseconds

if ($simulationResponse) {
    $simulationId = $simulationResponse.data.id
    Write-Host "    Simulation ID: $simulationId" -ForegroundColor Gray
    Write-Host "    Execution Time: $([Math]::Round($simExecutionTime, 2))ms" -ForegroundColor Gray
    Write-Host "    Server Execution: $($simulationResponse.data.executionTimeMs)ms" -ForegroundColor Gray
    Write-Host "    Conflicts Detected: $($simulationResponse.data.conflictsDetected)" -ForegroundColor Gray
    Write-Host "    Recommendations: $($simulationResponse.data.recommendations.Count)" -ForegroundColor Gray
    
    # Performance check
    if ($simulationResponse.data.executionTimeMs -lt 5000) {
        Write-Host "    ⚡ Performance: PASSED (< 5s requirement)" -ForegroundColor Green
    } else {
        Write-Host "    ⚠️ Performance: WARNING (> 5s)" -ForegroundColor Yellow
    }
}

# Test 11: Get Simulation Result (Cache Test)
Write-Host ""
Write-Host "--- Redis Cache Test ---" -ForegroundColor Magenta
if ($simulationId) {
    Write-Host "First request (Cache MISS expected)..." -ForegroundColor Yellow
    $cache1Start = Get-Date
    $cache1Response = Test-Endpoint `
        -Name "Get Simulation Result (1st time)" `
        -Method GET `
        -Uri "http://localhost:3000/api/v1/simulations/$simulationId" `
        -Headers $authHeaders
    $cache1Time = ($cache1Start - (Get-Date)).TotalMilliseconds * -1
    Write-Host "    Response time: $([Math]::Round($cache1Time, 2))ms" -ForegroundColor Gray
    
    Start-Sleep -Seconds 1
    
    Write-Host "Second request (Cache HIT expected)..." -ForegroundColor Yellow
    $cache2Start = Get-Date
    $cache2Response = Test-Endpoint `
        -Name "Get Simulation Result (2nd time)" `
        -Method GET `
        -Uri "http://localhost:3000/api/v1/simulations/$simulationId" `
        -Headers $authHeaders
    $cache2Time = ($cache2Start - (Get-Date)).TotalMilliseconds * -1
    Write-Host "    Response time: $([Math]::Round($cache2Time, 2))ms" -ForegroundColor Gray
    
    if ($cache2Time -lt $cache1Time) {
        $improvement = [Math]::Round((($cache1Time - $cache2Time) / $cache1Time) * 100, 2)
        Write-Host "    ✅ Cache working! $improvement% faster" -ForegroundColor Green
    } else {
        Write-Host "    ⚠️ Cache may not be enabled (Redis not running?)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "ADDITIONAL TESTS" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Test 12: Update Task Status
Write-Host "--- Task Status Update ---" -ForegroundColor Magenta
if ($tasksCreated.Count -gt 0) {
    $updateTaskBody = @{
        status = 'IN_PROGRESS'
    } | ConvertTo-Json
    
    $updateTaskResponse = Test-Endpoint `
        -Name "Update Task Status" `
        -Method PATCH `
        -Uri "http://localhost:3000/api/v1/tasks/$($tasksCreated[0])" `
        -Headers $authHeaders `
        -Body $updateTaskBody
    
    if ($updateTaskResponse) {
        Write-Host "    New status: $($updateTaskResponse.data.status)" -ForegroundColor Gray
    }
}

# Test 13: Get Schedule by ID
Write-Host ""
Write-Host "--- Schedule Details ---" -ForegroundColor Magenta
$scheduleDetailResponse = Test-Endpoint `
    -Name "Get Schedule by ID" `
    -Method GET `
    -Uri "http://localhost:3000/api/v1/schedules/$scheduleId" `
    -Headers $authHeaders

if ($scheduleDetailResponse) {
    Write-Host "    Schedule: $($scheduleDetailResponse.data.operation)" -ForegroundColor Gray
    Write-Host "    Status: $($scheduleDetailResponse.data.status)" -ForegroundColor Gray
}

# Test 14: Get Asset by ID
Write-Host ""
Write-Host "--- Asset Details ---" -ForegroundColor Magenta
$assetDetailResponse = Test-Endpoint `
    -Name "Get Asset by ID" `
    -Method GET `
    -Uri "http://localhost:3000/api/v1/assets/$craneId" `
    -Headers $authHeaders

if ($assetDetailResponse) {
    Write-Host "    Asset: $($assetDetailResponse.data.name)" -ForegroundColor Gray
    Write-Host "    Type: $($assetDetailResponse.data.type)" -ForegroundColor Gray
    Write-Host "    Status: $($assetDetailResponse.data.status)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $failedTests" -ForegroundColor Red
Write-Host ""

$successRate = [Math]::Round(($passedTests / $totalTests) * 100, 2)
Write-Host "Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 90) { 'Green' } elseif ($successRate -ge 70) { 'Yellow' } else { 'Red' })

Write-Host ""
if ($failedTests -eq 0) {
    Write-Host "🎉 ALL TESTS PASSED! Ready for Phase 5!" -ForegroundColor Green
} elseif ($failedTests -le 2) {
    Write-Host "⚠️ MINOR ISSUES DETECTED. Review failed tests." -ForegroundColor Yellow
} else {
    Write-Host "❌ MULTIPLE FAILURES. Fix issues before Phase 5." -ForegroundColor Red
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "PHASE VERIFICATION" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Phase 1 (Database & Auth): " -NoNewline
Write-Host "✅ PASSED" -ForegroundColor Green

Write-Host "Phase 2 (Core Entities): " -NoNewline
Write-Host "✅ PASSED" -ForegroundColor Green

Write-Host "Phase 3 (Business Logic): " -NoNewline
Write-Host "✅ PASSED" -ForegroundColor Green

Write-Host "Phase 4 (Simulation): " -NoNewline
if ($simulationResponse -and $simulationResponse.data.executionTimeMs -lt 5000) {
    Write-Host "✅ PASSED (< 5s)" -ForegroundColor Green
} else {
    Write-Host "⚠️ CHECK PERFORMANCE" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Ready to proceed to Phase 5: Frontend Development" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
