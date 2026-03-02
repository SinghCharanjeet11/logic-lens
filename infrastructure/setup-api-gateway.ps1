# LogicLens API Gateway Setup Script (PowerShell)
# Creates REST API with endpoints for all Lambda functions

Write-Host "🚀 Setting up API Gateway for LogicLens..." -ForegroundColor Green

$REGION = if ($env:AWS_REGION) { $env:AWS_REGION } else { "us-east-1" }
$API_NAME = "LogicLensAPI"
$STAGE_NAME = "prod"

# Get AWS Account ID
$ACCOUNT_ID = (aws sts get-caller-identity --query Account --output text)

Write-Host "Region: $REGION" -ForegroundColor Cyan
Write-Host "Account ID: $ACCOUNT_ID" -ForegroundColor Cyan
Write-Host ""

# Create or get API
Write-Host "Creating REST API..." -ForegroundColor Yellow

$API_ID = (aws apigateway get-rest-apis --region $REGION --query "items[?name=='$API_NAME'].id" --output text)

if ([string]::IsNullOrEmpty($API_ID)) {
    $API_ID = (aws apigateway create-rest-api `
        --name $API_NAME `
        --description "LogicLens API for code analysis and question generation" `
        --endpoint-configuration "types=REGIONAL" `
        --region $REGION `
        --query 'id' `
        --output text)
    Write-Host "✓ API created: $API_ID" -ForegroundColor Green
} else {
    Write-Host "✓ Using existing API: $API_ID" -ForegroundColor Green
}

# Get root resource ID
$ROOT_ID = (aws apigateway get-resources --rest-api-id $API_ID --region $REGION --query 'items[?path==`/`].id' --output text)

# Function to create endpoint
function Create-Endpoint {
    param(
        [string]$ResourcePath,
        [string]$LambdaFunction
    )
    
    Write-Host "Creating endpoint: /$ResourcePath" -ForegroundColor Yellow
    
    # Create resource
    $RESOURCE_ID = (aws apigateway get-resources --rest-api-id $API_ID --region $REGION --query "items[?path=='/$ResourcePath'].id" --output text)
    
    if ([string]::IsNullOrEmpty($RESOURCE_ID)) {
        $RESOURCE_ID = (aws apigateway create-resource `
            --rest-api-id $API_ID `
            --parent-id $ROOT_ID `
            --path-part $ResourcePath `
            --region $REGION `
            --query 'id' `
            --output text)
    }
    
    # Create OPTIONS method for CORS
    try {
        aws apigateway put-method `
            --rest-api-id $API_ID `
            --resource-id $RESOURCE_ID `
            --http-method OPTIONS `
            --authorization-type NONE `
            --region $REGION 2>$null
        
        aws apigateway put-method-response `
            --rest-api-id $API_ID `
            --resource-id $RESOURCE_ID `
            --http-method OPTIONS `
            --status-code 200 `
            --response-parameters '{\"method.response.header.Access-Control-Allow-Headers\":false,\"method.response.header.Access-Control-Allow-Methods\":false,\"method.response.header.Access-Control-Allow-Origin\":false}' `
            --region $REGION 2>$null
        
        aws apigateway put-integration `
            --rest-api-id $API_ID `
            --resource-id $RESOURCE_ID `
            --http-method OPTIONS `
            --type MOCK `
            --request-templates '{\"application/json\":\"{\\\"statusCode\\\": 200}\"}' `
            --region $REGION 2>$null
        
        aws apigateway put-integration-response `
            --rest-api-id $API_ID `
            --resource-id $RESOURCE_ID `
            --http-method OPTIONS `
            --status-code 200 `
            --response-parameters '{\"method.response.header.Access-Control-Allow-Headers\":\"'"'"'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"'"'\",\"method.response.header.Access-Control-Allow-Methods\":\"'"'"'POST,OPTIONS'"'"'\",\"method.response.header.Access-Control-Allow-Origin\":\"'"'"'*'"'"'\"}' `
            --region $REGION 2>$null
    } catch {}
    
    # Create POST method
    try {
        aws apigateway put-method `
            --rest-api-id $API_ID `
            --resource-id $RESOURCE_ID `
            --http-method POST `
            --authorization-type NONE `
            --region $REGION 2>$null
    } catch {}
    
    # Integrate with Lambda
    $LAMBDA_ARN = "arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:$LambdaFunction"
    
    try {
        aws apigateway put-integration `
            --rest-api-id $API_ID `
            --resource-id $RESOURCE_ID `
            --http-method POST `
            --type AWS_PROXY `
            --integration-http-method POST `
            --uri "arn:aws:apigateway:${REGION}:lambda:path/2015-03-31/functions/$LAMBDA_ARN/invocations" `
            --region $REGION 2>$null
    } catch {}
    
    # Grant API Gateway permission to invoke Lambda
    $timestamp = [int][double]::Parse((Get-Date -UFormat %s))
    try {
        aws lambda add-permission `
            --function-name $LambdaFunction `
            --statement-id "apigateway-$ResourcePath-$timestamp" `
            --action lambda:InvokeFunction `
            --principal apigateway.amazonaws.com `
            --source-arn "arn:aws:execute-api:${REGION}:${ACCOUNT_ID}:${API_ID}/*/POST/$ResourcePath" `
            --region $REGION 2>$null
    } catch {}
    
    Write-Host "✓ Endpoint created: /$ResourcePath" -ForegroundColor Green
}

# Create endpoints
Create-Endpoint -ResourcePath "generate-questions" -LambdaFunction "LogicLens-QuestionGeneration"
Create-Endpoint -ResourcePath "analyze-answers" -LambdaFunction "LogicLens-GapDetection"
Create-Endpoint -ResourcePath "refactor-code" -LambdaFunction "LogicLens-RefactorCode"

# Deploy API
Write-Host "Deploying API to $STAGE_NAME stage..." -ForegroundColor Yellow

aws apigateway create-deployment `
    --rest-api-id $API_ID `
    --stage-name $STAGE_NAME `
    --description "LogicLens API deployment" `
    --region $REGION | Out-Null

Write-Host "✓ API deployed" -ForegroundColor Green

# Get API URL
$API_URL = "https://$API_ID.execute-api.$REGION.amazonaws.com/$STAGE_NAME"

Write-Host ""
Write-Host "✅ API Gateway setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "API URL: $API_URL" -ForegroundColor Cyan
Write-Host ""
Write-Host "Endpoints:" -ForegroundColor Yellow
Write-Host "  POST $API_URL/generate-questions" -ForegroundColor White
Write-Host "  POST $API_URL/analyze-answers" -ForegroundColor White
Write-Host "  POST $API_URL/refactor-code" -ForegroundColor White
Write-Host ""
Write-Host "Add this to your .env.local:" -ForegroundColor Yellow
Write-Host "NEXT_PUBLIC_API_URL=$API_URL" -ForegroundColor Cyan
