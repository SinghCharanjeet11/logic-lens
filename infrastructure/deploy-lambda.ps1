# LogicLens Lambda Deployment Script (PowerShell)
# Packages and deploys all Lambda functions to AWS

Write-Host "🚀 Starting LogicLens Lambda deployment..." -ForegroundColor Green

$REGION = if ($env:AWS_REGION) { $env:AWS_REGION } else { "us-east-1" }
$ROLE_NAME = "LogicLensLambdaExecutionRole"
$TABLE_NAME = "LogicLensSessionsTable"

Write-Host "Region: $REGION" -ForegroundColor Cyan
Write-Host "DynamoDB Table: $TABLE_NAME" -ForegroundColor Cyan
Write-Host ""

# Function to create IAM role
function Create-IAMRole {
    Write-Host "Checking IAM role..." -ForegroundColor Yellow
    
    $roleExists = $false
    try {
        $role = aws iam get-role --role-name $ROLE_NAME 2>$null | ConvertFrom-Json
        $roleExists = $true
        Write-Host "✓ IAM role already exists" -ForegroundColor Green
        return $role.Role.Arn
    } catch {
        Write-Host "Creating IAM role..." -ForegroundColor Yellow
    }
    
    if (-not $roleExists) {
        # Create trust policy
        $trustPolicy = @"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
"@
        
        $trustPolicy | Out-File -FilePath "$env:TEMP\trust-policy.json" -Encoding UTF8
        
        $roleArn = (aws iam create-role `
            --role-name $ROLE_NAME `
            --assume-role-policy-document "file://$env:TEMP\trust-policy.json" `
            --query 'Role.Arn' `
            --output text)
        
        # Attach policies
        aws iam attach-role-policy `
            --role-name $ROLE_NAME `
            --policy-arn "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
        
        aws iam attach-role-policy `
            --role-name $ROLE_NAME `
            --policy-arn "arn:aws:iam::aws:policy/AmazonBedrockFullAccess"
        
        aws iam attach-role-policy `
            --role-name $ROLE_NAME `
            --policy-arn "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
        
        Write-Host "✓ IAM role created" -ForegroundColor Green
        Write-Host "Waiting 10 seconds for role to propagate..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        
        return $roleArn
    }
}

# Function to deploy Lambda
function Deploy-Lambda {
    param(
        [string]$FunctionName,
        [string]$FunctionDir,
        [string]$Handler = "index.handler",
        [int]$Timeout = 30,
        [int]$Memory = 1024
    )
    
    Write-Host "Deploying $FunctionName..." -ForegroundColor Yellow
    
    Push-Location $FunctionDir
    
    # Install dependencies
    if (Test-Path "package.json") {
        Write-Host "Installing dependencies..." -ForegroundColor Cyan
        npm install --production 2>$null
    }
    
    # Create deployment package
    Write-Host "Creating deployment package..." -ForegroundColor Cyan
    $zipPath = "$env:TEMP\$FunctionName.zip"
    if (Test-Path $zipPath) { Remove-Item $zipPath }
    
    Compress-Archive -Path * -DestinationPath $zipPath -Force
    
    Pop-Location
    
    # Check if function exists
    $functionExists = $false
    try {
        aws lambda get-function --function-name $FunctionName --region $REGION 2>$null
        $functionExists = $true
    } catch {}
    
    if ($functionExists) {
        Write-Host "Updating existing function..." -ForegroundColor Cyan
        aws lambda update-function-code `
            --function-name $FunctionName `
            --zip-file "fileb://$zipPath" `
            --region $REGION | Out-Null
        
        aws lambda update-function-configuration `
            --function-name $FunctionName `
            --timeout $Timeout `
            --memory-size $Memory `
            --environment "Variables={DYNAMODB_TABLE=$TABLE_NAME,AWS_REGION=$REGION}" `
            --region $REGION | Out-Null
    } else {
        Write-Host "Creating new function..." -ForegroundColor Cyan
        aws lambda create-function `
            --function-name $FunctionName `
            --runtime nodejs20.x `
            --role $script:ROLE_ARN `
            --handler $Handler `
            --zip-file "fileb://$zipPath" `
            --timeout $Timeout `
            --memory-size $Memory `
            --environment "Variables={DYNAMODB_TABLE=$TABLE_NAME,AWS_REGION=$REGION}" `
            --region $REGION | Out-Null
    }
    
    Write-Host "✓ $FunctionName deployed" -ForegroundColor Green
    
    # Clean up
    Remove-Item $zipPath
}

# Main deployment
$script:ROLE_ARN = Create-IAMRole

Write-Host ""

# Deploy Lambda functions
Deploy-Lambda -FunctionName "LogicLens-QuestionGeneration" -FunctionDir "..\lambda\question-generation"
Deploy-Lambda -FunctionName "LogicLens-GapDetection" -FunctionDir "..\lambda\gap-detection"
Deploy-Lambda -FunctionName "LogicLens-RefactorCode" -FunctionDir "..\lambda\refactor-code"

Write-Host ""
Write-Host "✅ All Lambda functions deployed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run .\setup-api-gateway.ps1 to create API endpoints" -ForegroundColor White
Write-Host "2. Test the functions using the AWS Console or CLI" -ForegroundColor White
Write-Host "3. Update your frontend .env.local with the API Gateway URL" -ForegroundColor White
