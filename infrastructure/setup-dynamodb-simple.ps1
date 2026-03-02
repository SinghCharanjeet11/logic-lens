# LogicLens DynamoDB Setup Script (PowerShell)
# Creates DynamoDB table for session management

Write-Host "Setting up DynamoDB table for LogicLens..." -ForegroundColor Green

$TABLE_NAME = "LogicLensSessionsTable"
$REGION = if ($env:AWS_REGION) { $env:AWS_REGION } else { "us-east-1" }

Write-Host "Region: $REGION" -ForegroundColor Cyan
Write-Host "Table Name: $TABLE_NAME" -ForegroundColor Cyan
Write-Host ""

# Check if table already exists
Write-Host "Checking if table exists..." -ForegroundColor Yellow
$tableExists = $false
try {
    $result = aws dynamodb describe-table --table-name $TABLE_NAME --region $REGION 2>&1
    if ($LASTEXITCODE -eq 0) {
        $tableExists = $true
        Write-Host "Table already exists" -ForegroundColor Green
    }
} catch {
    Write-Host "Table does not exist, creating..." -ForegroundColor Yellow
}

if (-not $tableExists) {
    # Create table
    Write-Host "Creating DynamoDB table..." -ForegroundColor Yellow
    
    aws dynamodb create-table `
        --table-name $TABLE_NAME `
        --attribute-definitions AttributeName=sessionId,AttributeType=S `
        --key-schema AttributeName=sessionId,KeyType=HASH `
        --billing-mode PAY_PER_REQUEST `
        --region $REGION `
        --tags Key=Project,Value=LogicLens Key=Environment,Value=Production
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Table created successfully" -ForegroundColor Green
        
        # Wait for table to be active
        Write-Host "Waiting for table to become active..." -ForegroundColor Yellow
        aws dynamodb wait table-exists --table-name $TABLE_NAME --region $REGION
        
        # Enable TTL
        Write-Host "Enabling TTL (24-hour auto-cleanup)..." -ForegroundColor Yellow
        aws dynamodb update-time-to-live `
            --table-name $TABLE_NAME `
            --time-to-live-specification "Enabled=true,AttributeName=ttl" `
            --region $REGION
        
        Write-Host "TTL enabled" -ForegroundColor Green
    } else {
        Write-Host "Failed to create table" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "DynamoDB setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Table Details:" -ForegroundColor Cyan
aws dynamodb describe-table --table-name $TABLE_NAME --region $REGION --query "Table.[TableName,TableStatus,ItemCount]" --output table

Write-Host ""
Write-Host "Next step: Run deploy-lambda-simple.ps1" -ForegroundColor Yellow
