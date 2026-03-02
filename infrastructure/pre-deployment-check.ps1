# Pre-Deployment Verification Script
# Run this before deploying to catch issues early

Write-Host "=== LogicLens Bedrock Pre-Deployment Check ===" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"
$allChecksPass = $true

# Check 1: AWS CLI installed
Write-Host "[1/7] Checking AWS CLI..." -ForegroundColor Yellow
try {
    $awsVersion = aws --version 2>&1
    Write-Host "  ✓ AWS CLI installed: $awsVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ AWS CLI not found. Install from: https://aws.amazon.com/cli/" -ForegroundColor Red
    $allChecksPass = $false
}

# Check 2: AWS credentials configured
Write-Host "[2/7] Checking AWS credentials..." -ForegroundColor Yellow
try {
    $identity = aws sts get-caller-identity 2>&1 | ConvertFrom-Json
    Write-Host "  ✓ AWS credentials configured" -ForegroundColor Green
    Write-Host "    Account: $($identity.Account)" -ForegroundColor Gray
    Write-Host "    User/Role: $($identity.Arn)" -ForegroundColor Gray
} catch {
    Write-Host "  ✗ AWS credentials not configured. Run: aws configure" -ForegroundColor Red
    $allChecksPass = $false
}

# Check 3: Bedrock model access
Write-Host "[3/7] Checking Bedrock model access..." -ForegroundColor Yellow
try {
    $models = aws bedrock list-foundation-models --region us-east-1 2>&1
    if ($models -match "claude-3-5-sonnet") {
        Write-Host "  ✓ Claude 3.5 Sonnet available in us-east-1" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Claude 3.5 Sonnet not found. Enable in Bedrock console." -ForegroundColor Yellow
        Write-Host "    Go to: AWS Console → Bedrock → Model access" -ForegroundColor Gray
        $allChecksPass = $false
    }
} catch {
    Write-Host "  ⚠ Could not verify Bedrock access. Check permissions." -ForegroundColor Yellow
}

# Check 4: Lambda functions exist
Write-Host "[4/7] Checking Lambda functions..." -ForegroundColor Yellow
$lambdas = @("LogicLens-QuestionGeneration", "LogicLens-GapDetection", "LogicLens-RefactorCode")
$lambdaCount = 0
foreach ($lambda in $lambdas) {
    try {
        aws lambda get-function --function-name $lambda --region us-east-1 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            $lambdaCount++
        }
    } catch {}
}
if ($lambdaCount -eq 3) {
    Write-Host "  ✓ All 3 Lambda functions found" -ForegroundColor Green
} elseif ($lambdaCount -gt 0) {
    Write-Host "  ⚠ Only $lambdaCount/3 Lambda functions found" -ForegroundColor Yellow
} else {
    Write-Host "  ✗ No Lambda functions found. Deploy infrastructure first." -ForegroundColor Red
    $allChecksPass = $false
}

# Check 5: DynamoDB table exists
Write-Host "[5/7] Checking DynamoDB table..." -ForegroundColor Yellow
try {
    aws dynamodb describe-table --table-name LogicLensSessionsTable --region us-east-1 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ DynamoDB table 'LogicLensSessionsTable' exists" -ForegroundColor Green
    } else {
        Write-Host "  ✗ DynamoDB table not found. Run setup-dynamodb script." -ForegroundColor Red
        $allChecksPass = $false
    }
} catch {
    Write-Host "  ✗ Could not verify DynamoDB table" -ForegroundColor Red
    $allChecksPass = $false
}

# Check 6: Lambda code files exist
Write-Host "[6/7] Checking Lambda code files..." -ForegroundColor Yellow
$codeFiles = @(
    "lambda/question-generation/index.js",
    "lambda/gap-detection/index.js",
    "lambda/refactor-code/index.js"
)
$filesExist = $true
foreach ($file in $codeFiles) {
    if (-not (Test-Path $file)) {
        Write-Host "  ✗ Missing: $file" -ForegroundColor Red
        $filesExist = $false
        $allChecksPass = $false
    }
}
if ($filesExist) {
    Write-Host "  ✓ All Lambda code files present" -ForegroundColor Green
    
    # Check if they use Claude 3.5 Sonnet
    $content = Get-Content "lambda/question-generation/index.js" -Raw
    if ($content -match "claude-3-5-sonnet") {
        Write-Host "  ✓ Code updated to use Claude 3.5 Sonnet" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Code may not be using Claude 3.5 Sonnet" -ForegroundColor Yellow
    }
}

# Check 7: Node.js and npm installed
Write-Host "[7/7] Checking Node.js and npm..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    $npmVersion = npm --version 2>&1
    Write-Host "  ✓ Node.js $nodeVersion, npm $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Node.js/npm not found. Install from: https://nodejs.org/" -ForegroundColor Red
    $allChecksPass = $false
}

# Summary
Write-Host ""
Write-Host "=== Pre-Deployment Check Summary ===" -ForegroundColor Cyan
if ($allChecksPass) {
    Write-Host "✓ All checks passed! Ready to deploy." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Run: .\infrastructure\redeploy-all-lambdas.ps1"
    Write-Host "2. Run: .\infrastructure\test-bedrock.ps1"
    Write-Host "3. Test your frontend application"
} else {
    Write-Host "✗ Some checks failed. Fix issues before deploying." -ForegroundColor Red
    Write-Host ""
    Write-Host "Common fixes:" -ForegroundColor Yellow
    Write-Host "- Install AWS CLI: https://aws.amazon.com/cli/"
    Write-Host "- Configure credentials: aws configure"
    Write-Host "- Enable Bedrock models: AWS Console → Bedrock → Model access"
    Write-Host "- Deploy infrastructure: Run setup scripts in infrastructure/"
}

Write-Host ""
