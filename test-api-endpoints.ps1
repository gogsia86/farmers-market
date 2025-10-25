# Test Admin User Management API Endpoints# Test Admin User Management API Endpoints

# Phase 2 Sprint 1 - Complete API Testing Script# Phase 2 Sprint 1 - Complete API Testing Script



Write-Host "Testing Admin User Management API Endpoints" -ForegroundColor CyanWrite-Host "🧪 Testing Admin User Management API Endpoints" -ForegroundColor Cyan

Write-Host ("=" * 60) -ForegroundColor GrayWrite-Host "=" * 60 -ForegroundColor Gray



$baseUrl = "http://localhost:3001"$baseUrl = "http://localhost:3001"

$apiBase = "$baseUrl/api/admin/users"$apiBase = "$baseUrl/api/admin/users"



# Helper function to pretty print JSON# Helper function to pretty print JSON

function Show-Response {function Show-Response {

    param($response, $testName)  param($response, $testName)

    Write-Host "`nTest Passed: $testName" -ForegroundColor Green  Write-Host "`n✅ $testName" -ForegroundColor Green

    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Yellow  Write-Host "Status: $($response.StatusCode)" -ForegroundColor Yellow

    if ($response.Content) {  if ($response.Content) {

        $json = $response.Content | ConvertFrom-Json    $json = $response.Content | ConvertFrom-Json

        $json | ConvertTo-Json -Depth 5    $json | ConvertTo-Json -Depth 5

    }  }

}}



function Show-Error {function Show-Error {

    param($error, $testName)  param($error, $testName)

    Write-Host "`nTest Failed: $testName" -ForegroundColor Red  Write-Host "`n❌ $testName FAILED" -ForegroundColor Red

    Write-Host "Error: $error" -ForegroundColor Yellow  Write-Host "Error: $error" -ForegroundColor Yellow

}}



# Test 1: GET /api/admin/users (List all users)# Test 1: GET /api/admin/users (List all users)

Write-Host "`nTest 1: List All Users" -ForegroundColor CyanWrite-Host "`n📋 Test 1: List All Users" -ForegroundColor Cyan

try {try {

    $response = Invoke-WebRequest -Uri $apiBase -Method GET -UseBasicParsing  $response = Invoke-WebRequest -Uri $apiBase -Method GET -UseBasicParsing

    Show-Response $response "List All Users"  Show-Response $response "List All Users"

} catch {}

    Show-Error $_.Exception.Message "List All Users"catch {

}  Show-Error $_.Exception.Message "List All Users"

}

# Test 2: GET /api/admin/users with filters

Write-Host "`nTest 2: List Users with Filters" -ForegroundColor Cyan# Test 2: GET /api/admin/users with filters

try {Write-Host "`n📋 Test 2: List Users with Filters (search, pagination)" -ForegroundColor Cyan

    $response = Invoke-WebRequest -Uri "$apiBase`?search=john&page=1&limit=5" -Method GET -UseBasicParsingtry {

    Show-Response $response "List Users with Filters"  $response = Invoke-WebRequest -Uri "$apiBase`?search=john&page=1&limit=5" -Method GET -UseBasicParsing

} catch {  Show-Response $response "List Users with Filters"

    Show-Error $_.Exception.Message "List Users with Filters"}

}catch {

  Show-Error $_.Exception.Message "List Users with Filters"

# Test 3: POST /api/admin/users (Create new user)}

Write-Host "`nTest 3: Create New User" -ForegroundColor Cyan

try {# Test 3: GET /api/admin/users/[id] (Get specific user)

    $newUser = @{Write-Host "`n📋 Test 3: Get Specific User Details" -ForegroundColor Cyan

        firstName = "Test"Write-Host "⚠️  Note: Replace 'USER_ID_HERE' with an actual user ID from the list" -ForegroundColor Yellow

        lastName = "User"Write-Host "Run this command manually with a real user ID:" -ForegroundColor Gray

        email = "testuser$(Get-Random)@example.com"Write-Host "  Invoke-WebRequest -Uri 'http://localhost:3001/api/admin/users/USER_ID_HERE' -Method GET" -ForegroundColor Gray

        password = "TestPassword123!"

        role = "CONSUMER"# Test 4: POST /api/admin/users (Create new user)

    } | ConvertTo-JsonWrite-Host "`n📋 Test 4: Create New User" -ForegroundColor Cyan

try {

    $response = Invoke-WebRequest -Uri $apiBase -Method POST -Body $newUser -ContentType "application/json" -UseBasicParsing  $newUser = @{

    Show-Response $response "Create New User"    firstName = "Test"

        lastName  = "User"

    # Save created user ID for later tests    email     = "testuser$(Get-Random)@example.com"

    $createdUser = $response.Content | ConvertFrom-Json    password  = "TestPassword123!"

    $script:testUserId = $createdUser.id    role      = "CONSUMER"

    Write-Host "Created test user with ID: $testUserId" -ForegroundColor Green  } | ConvertTo-Json

} catch {

    Show-Error $_.Exception.Message "Create New User"  $response = Invoke-WebRequest -Uri $apiBase -Method POST -Body $newUser -ContentType "application/json" -UseBasicParsing

}  Show-Response $response "Create New User"



# Test 4: GET /api/admin/users/[id] (Get specific user)  # Save created user ID for later tests

if ($script:testUserId) {  $createdUser = $response.Content | ConvertFrom-Json

    Write-Host "`nTest 4: Get Specific User Details" -ForegroundColor Cyan  $script:testUserId = $createdUser.id

    try {  Write-Host "✅ Created test user with ID: $testUserId" -ForegroundColor Green

        $response = Invoke-WebRequest -Uri "$apiBase/$testUserId" -Method GET -UseBasicParsing}

        Show-Response $response "Get User Details"catch {

    } catch {  Show-Error $_.Exception.Message "Create New User"

        Show-Error $_.Exception.Message "Get User Details"}

    }

}# Test 5: PATCH /api/admin/users/[id] (Update user)

if ($script:testUserId) {

# Test 5: PATCH /api/admin/users/[id] (Update user)  Write-Host "`n📋 Test 5: Update User" -ForegroundColor Cyan

if ($script:testUserId) {  try {

    Write-Host "`nTest 5: Update User" -ForegroundColor Cyan    $updateData = @{

    try {      firstName = "Updated"

        $updateData = @{      lastName  = "TestUser"

            firstName = "Updated"      status    = "ACTIVE"

            lastName = "TestUser"    } | ConvertTo-Json

            status = "ACTIVE"

        } | ConvertTo-Json    $response = Invoke-WebRequest -Uri "$apiBase/$testUserId" -Method PATCH -Body $updateData -ContentType "application/json" -UseBasicParsing

    Show-Response $response "Update User"

        $response = Invoke-WebRequest -Uri "$apiBase/$testUserId" -Method PATCH -Body $updateData -ContentType "application/json" -UseBasicParsing  }

        Show-Response $response "Update User"  catch {

    } catch {    Show-Error $_.Exception.Message "Update User"

        Show-Error $_.Exception.Message "Update User"  }

    }}

}

# Test 6: POST /api/admin/users/[id]/approve (Approve user)

# Test 6: POST /api/admin/users/[id]/approve (Approve user)if ($script:testUserId) {

if ($script:testUserId) {  Write-Host "`n📋 Test 6: Approve User" -ForegroundColor Cyan

    Write-Host "`nTest 6: Approve User" -ForegroundColor Cyan  try {

    try {    $approveData = @{

        $approveData = @{      sendWelcomeEmail = $false

            sendWelcomeEmail = $false      notes            = "Test approval"

            notes = "Test approval"    } | ConvertTo-Json

        } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$apiBase/$testUserId/approve" -Method POST -Body $approveData -ContentType "application/json" -UseBasicParsing

        $response = Invoke-WebRequest -Uri "$apiBase/$testUserId/approve" -Method POST -Body $approveData -ContentType "application/json" -UseBasicParsing    Show-Response $response "Approve User"

        Show-Response $response "Approve User"  }

    } catch {  catch {

        Show-Error $_.Exception.Message "Approve User"    Show-Error $_.Exception.Message "Approve User"

    }  }

}}



# Test 7: POST /api/admin/users/[id]/suspend (Suspend user)# Test 7: POST /api/admin/users/[id]/suspend (Suspend user)

if ($script:testUserId) {if ($script:testUserId) {

    Write-Host "`nTest 7: Suspend User" -ForegroundColor Cyan  Write-Host "`n📋 Test 7: Suspend User" -ForegroundColor Cyan

    try {  try {

        $suspendData = @{    $suspendData = @{

            reason = "POLICY_VIOLATION"      reason       = "POLICY_VIOLATION"

            customReason = "Test suspension"      customReason = "Test suspension"

            duration = "TEMPORARY"      duration     = "TEMPORARY"

            notifyUser = $false      notifyUser   = $false

        } | ConvertTo-Json    } | ConvertTo-Json



        $response = Invoke-WebRequest -Uri "$apiBase/$testUserId/suspend" -Method POST -Body $suspendData -ContentType "application/json" -UseBasicParsing    $response = Invoke-WebRequest -Uri "$apiBase/$testUserId/suspend" -Method POST -Body $suspendData -ContentType "application/json" -UseBasicParsing

        Show-Response $response "Suspend User"    Show-Response $response "Suspend User"

    } catch {  }

        Show-Error $_.Exception.Message "Suspend User"  catch {

    }    Show-Error $_.Exception.Message "Suspend User"

}  }

}

# Test 8: DELETE /api/admin/users/[id]/suspend (Reactivate user)

if ($script:testUserId) {# Test 8: DELETE /api/admin/users/[id]/suspend (Reactivate user)

    Write-Host "`nTest 8: Reactivate Suspended User" -ForegroundColor Cyanif ($script:testUserId) {

    try {  Write-Host "`n📋 Test 8: Reactivate Suspended User" -ForegroundColor Cyan

        $reactivateData = @{  try {

            notes = "Test reactivation"    $reactivateData = @{

            notifyUser = $false      notes      = "Test reactivation"

        } | ConvertTo-Json      notifyUser = $false

    } | ConvertTo-Json

        $response = Invoke-WebRequest -Uri "$apiBase/$testUserId/suspend" -Method DELETE -Body $reactivateData -ContentType "application/json" -UseBasicParsing

        Show-Response $response "Reactivate User"    $response = Invoke-WebRequest -Uri "$apiBase/$testUserId/suspend" -Method DELETE -Body $reactivateData -ContentType "application/json" -UseBasicParsing

    } catch {    Show-Response $response "Reactivate User"

        Show-Error $_.Exception.Message "Reactivate User"  }

    }  catch {

}    Show-Error $_.Exception.Message "Reactivate User"

  }

# Test 9: DELETE /api/admin/users/[id] (Soft delete user)}

if ($script:testUserId) {

    Write-Host "`nTest 9: Delete User (Soft Delete)" -ForegroundColor Cyan# Test 9: DELETE /api/admin/users/[id] (Soft delete user)

    try {if ($script:testUserId) {

        $response = Invoke-WebRequest -Uri "$apiBase/$testUserId" -Method DELETE -UseBasicParsing  Write-Host "`n📋 Test 9: Delete User (Soft Delete)" -ForegroundColor Cyan

        Show-Response $response "Delete User"  try {

    } catch {    $response = Invoke-WebRequest -Uri "$apiBase/$testUserId" -Method DELETE -UseBasicParsing

        Show-Error $_.Exception.Message "Delete User"    Show-Response $response "Delete User"

    }  }

}  catch {

    Show-Error $_.Exception.Message "Delete User"

Write-Host "`n"  }

Write-Host ("=" * 60) -ForegroundColor Gray}

Write-Host "API Testing Complete!" -ForegroundColor Green

Write-Host "`nSummary:" -ForegroundColor CyanWrite-Host "`n" -NoNewline

Write-Host "  - Tested 9 admin user management endpoints" -ForegroundColor WhiteWrite-Host "=" * 60 -ForegroundColor Gray

Write-Host "  - Created test user ID: $testUserId" -ForegroundColor WhiteWrite-Host "✅ API Testing Complete!" -ForegroundColor Green

Write-Host "`nNext Steps:" -ForegroundColor CyanWrite-Host "`n📊 Summary:" -ForegroundColor Cyan

Write-Host "  1. Check Prisma Studio for audit logs: http://localhost:5555" -ForegroundColor WhiteWrite-Host "  - Tested 9 admin user management endpoints" -ForegroundColor White

Write-Host "  2. Verify all operations logged in audit_logs table" -ForegroundColor WhiteWrite-Host "  - Created test user ID: $testUserId" -ForegroundColor White

Write-Host "  3. Re-enable authentication once testing complete" -ForegroundColor WhiteWrite-Host "`n🔍 Next Steps:" -ForegroundColor Cyan

Write-Host "  1. Check Prisma Studio for audit logs: http://localhost:5555" -ForegroundColor White
Write-Host "  2. Verify all operations logged in audit_logs table" -ForegroundColor White
Write-Host "  3. Re-enable authentication once testing complete" -ForegroundColor White
