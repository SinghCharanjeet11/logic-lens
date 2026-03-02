# Test Bedrock integration with Claude 3.5 Sonnet
# Run this after deploying the Lambda functions

Write-Host "=== Testing Bedrock Integration ===" -ForegroundColor Cyan

$ErrorActionPreference = "Stop"

# Configuration
$API_ENDPOINT = Read-Host "Enter your API Gateway endpoint URL (e.g., https://xxx.execute-api.us-east-1.amazonaws.com/prod)"

# Test payload
$testCode = @"
function calculateDiscount(price, quantity) {
    if (quantity > 10) {
        return price * 0.9;
    }
    return price;
}
"@

$payload = @{
    code = $testCode
    context = "debugging"
    language = "en"
} | ConvertTo-Json

Write-Host "`nTest Code:" -ForegroundColor Yellow
Write-Host $testCode

Write-Host "`nSending request to question generation endpoint..." -ForegroundColor Gray

try {
    $response = Invoke-RestMethod `
        -Uri "$API_ENDPOINT/generate-questions" `
        -Method POST `
        -Body $payload `
        -ContentType "application/json" `
        -TimeoutSec 30
    
    Write-Host "`n✓ Success! Bedrock is working correctly." -ForegroundColor Green
    Write-Host "`nSession ID: $($response.sessionId)" -ForegroundColor Cyan
    Write-Host "Questions Generated: $($response.questions.Count)" -ForegroundColor Cyan
    
    Write-Host "`nGenerated Questions:" -ForegroundColor Yellow
    $response.questions | ForEach-Object {
        Write-Host "  Q$($_.id): $($_.question)" -ForegroundColor White
        Write-Host "  Focus: $($_.focus)" -ForegroundColor Gray
        Write-Host ""
    }
    
    Write-Host "✓ Claude 3.5 Sonnet is working reliably!" -ForegroundColor Green
    
} catch {
    Write-Host "`n✗ Test Failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "`nResponse Body:" -ForegroundColor Yellow
        Write-Host $responseBody -ForegroundColor Gray
    }
    
    Write-Host "`nTroubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Check Lambda function logs in CloudWatch"
    Write-Host "2. Verify Bedrock model access in IAM permissions"
    Write-Host "3. Ensure us-east-1 region has Claude 3.5 Sonnet enabled"
    Write-Host "4. Check API Gateway CORS configuration"
    
    exit 1
}
