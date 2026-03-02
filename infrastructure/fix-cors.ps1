# Fix CORS for API Gateway
$REGION = "us-east-1"
$API_ID = "313j557qfj"

Write-Host "Fixing CORS configuration..." -ForegroundColor Green

$endpoints = @("generate-questions", "analyze-answers", "refactor-code")

foreach ($endpoint in $endpoints) {
    Write-Host "Processing $endpoint..." -ForegroundColor Yellow
    
    # Get resource ID
    $query = "items[?path=='/$endpoint'].id"
    $RESOURCE_ID = aws apigateway get-resources --rest-api-id $API_ID --region $REGION --query $query --output text
    
    if ($RESOURCE_ID) {
        # Delete existing OPTIONS
        aws apigateway delete-method --rest-api-id $API_ID --resource-id $RESOURCE_ID --http-method OPTIONS --region $REGION 2>$null
        
        # Create OPTIONS method
        aws apigateway put-method --rest-api-id $API_ID --resource-id $RESOURCE_ID --http-method OPTIONS --authorization-type NONE --region $REGION | Out-Null
        
        # Method response
        aws apigateway put-method-response --rest-api-id $API_ID --resource-id $RESOURCE_ID --http-method OPTIONS --status-code 200 --response-parameters "method.response.header.Access-Control-Allow-Headers=false,method.response.header.Access-Control-Allow-Methods=false,method.response.header.Access-Control-Allow-Origin=false" --region $REGION | Out-Null
        
        # Integration
        $template = '{"application/json":"{\"statusCode\": 200}"}'
        aws apigateway put-integration --rest-api-id $API_ID --resource-id $RESOURCE_ID --http-method OPTIONS --type MOCK --request-templates $template --region $REGION | Out-Null
        
        # Integration response
        aws apigateway put-integration-response --rest-api-id $API_ID --resource-id $RESOURCE_ID --http-method OPTIONS --status-code 200 --response-parameters "method.response.header.Access-Control-Allow-Headers='Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',method.response.header.Access-Control-Allow-Methods='POST,OPTIONS',method.response.header.Access-Control-Allow-Origin='*'" --region $REGION | Out-Null
        
        Write-Host "Done: $endpoint" -ForegroundColor Green
    }
}

# Deploy
Write-Host "Deploying..." -ForegroundColor Yellow
aws apigateway create-deployment --rest-api-id $API_ID --stage-name prod --region $REGION | Out-Null

Write-Host "Complete!" -ForegroundColor Green
