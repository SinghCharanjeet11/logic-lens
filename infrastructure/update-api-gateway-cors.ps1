# Quick script to update API Gateway CORS configuration
# This ensures OPTIONS methods are properly configured

$REGION = "us-east-1"
$API_ID = "313j557qfj"  # Your existing API Gateway ID

Write-Host "Updating API Gateway CORS configuration..." -ForegroundColor Green

# Get root resource ID
$ROOT_ID = (aws apigateway get-resources --rest-api-id $API_ID --region $REGION --query 'items[?path==`/`].id' --output text)

# Function to update CORS for an endpoint
function Update-CORS {
    param([string]$ResourcePath)
    
    Write-Host "Updating CORS for /$ResourcePath..." -ForegroundColor Yellow
    
    # Get resource ID
    $RESOURCE_ID = (aws apigateway get-resources --rest-api-id $API_ID --region $REGION --query "items[?path=='/$ResourcePath'].id" --output text)
    
    if ([string]::IsNullOrEmpty($RESOURCE_ID)) {
        Write-Host "Resource not found: /$ResourcePath" -ForegroundColor Red
        return
    }
    
    # Delete existing OPTIONS method if it exists
    try {
        aws apigateway delete-method --rest-api-id $API_ID --resource-id $RESOURCE_ID --http-method OPTIONS --region $REGION 2>$null
    } catch {}
    
    # Create OPTIONS method
    aws apigateway put-method --rest-api-id $API_ID --resource-id $RESOURCE_ID --http-method OPTIONS --authorization-type NONE --region $REGION | Out-Null
    
    # Create method response
    aws apigateway put-method-response --rest-api-id $API_ID --resource-id $RESOURCE_ID --http-method OPTIONS --status-code 200 --response-parameters "method.response.header.Access-Control-Allow-Headers=false,method.response.header.Access-Control-Allow-Methods=false,method.response.header.Access-Control-Allow-Origin=false" --region $REGION | Out-Null
    
    # Create integration (MOCK)
    aws apigateway put-integration --rest-api-id $API_ID --resource-id $RESOURCE_ID --http-method OPTIONS --type MOCK --request-templates '{\"application/json\":\"{\\\"statusCode\\\": 200}\"}' --region $REGION | Out-Null
    
    # Create integration response with CORS headers
    aws apigateway put-integration-response --rest-api-id $API_ID --resource-id $RESOURCE_ID --http-method OPTIONS --status-code 200 --response-parameters "method.response.header.Access-Control-Allow-Headers='Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',method.response.header.Access-Control-Allow-Methods='POST,OPTIONS',method.response.header.Access-Control-Allow-Origin='*'" --region $REGION | Out-Null
    
    Write-Host "✓ CORS updated for /$ResourcePath" -ForegroundColor Green
}

# Update CORS for all endpoints
Update-CORS -ResourcePath "generate-questions"
Update-CORS -ResourcePath "analyze-answers"
Update-CORS -ResourcePath "refactor-code"

# Deploy changes
Write-Host "Deploying changes..." -ForegroundColor Yellow
aws apigateway create-deployment --rest-api-id $API_ID --stage-name prod --description "CORS update" --region $REGION | Out-Null

Write-Host ""
Write-Host "✅ CORS configuration updated!" -ForegroundColor Green
$API_URL = "https://${API_ID}.execute-api.${REGION}.amazonaws.com/prod"
Write-Host "API URL: $API_URL" -ForegroundColor Cyan
