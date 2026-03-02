# Redeploy all Lambda functions with Claude 3.5 Sonnet
# Run this script from the project root

Write-Host "=== Redeploying All Lambda Functions with Claude 3.5 Sonnet ===" -ForegroundColor Cyan

$ErrorActionPreference = "Stop"

# Configuration
$REGION = "us-east-1"
$LAMBDAS = @(
    @{Name="LogicLens-QuestionGeneration"; Dir="lambda/question-generation"},
    @{Name="LogicLens-GapDetection"; Dir="lambda/gap-detection"},
    @{Name="LogicLens-RefactorCode"; Dir="lambda/refactor-code"}
)

foreach ($lambda in $LAMBDAS) {
    Write-Host "`n--- Deploying $($lambda.Name) ---" -ForegroundColor Yellow
    
    $dir = $lambda.Dir
    $functionName = $lambda.Name
    
    # Navigate to Lambda directory
    Push-Location $dir
    
    # Install dependencies if needed
    if (Test-Path "package.json") {
        Write-Host "Installing dependencies..." -ForegroundColor Gray
        npm install --omit=dev 2>&1 | Out-Null
    }
    
    # Create deployment package in temp location
    Write-Host "Creating deployment package..." -ForegroundColor Gray
    $zipPath = Join-Path $env:TEMP "$functionName.zip"
    if (Test-Path $zipPath) {
        Remove-Item $zipPath -Force
    }
    
    Compress-Archive -Path * -DestinationPath $zipPath -Force
    
    Pop-Location
    
    # Update Lambda function
    Write-Host "Updating Lambda function code..." -ForegroundColor Gray
    aws lambda update-function-code --function-name $functionName --zip-file "fileb://$zipPath" --region $REGION --no-cli-pager
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "SUCCESS: $functionName deployed" -ForegroundColor Green
        Remove-Item $zipPath -Force
    } else {
        Write-Host "FAILED: $functionName deployment failed" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n=== All Lambda Functions Deployed Successfully ===" -ForegroundColor Green
Write-Host "Model: Claude 3.5 Sonnet (anthropic.claude-3-5-sonnet-20240620-v1:0)" -ForegroundColor Cyan
Write-Host "Region: $REGION" -ForegroundColor Cyan
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Test the API endpoints to verify Bedrock integration" -ForegroundColor White
Write-Host "2. Check CloudWatch Logs for any errors" -ForegroundColor White
Write-Host "3. Monitor token usage and costs" -ForegroundColor White
