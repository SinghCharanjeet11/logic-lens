#!/bin/bash

# LogicLens API Gateway Setup Script
# Creates REST API with endpoints for all Lambda functions

set -e

echo "🚀 Setting up API Gateway for LogicLens..."

# Configuration
REGION=${AWS_REGION:-us-east-1}
API_NAME="LogicLensAPI"
STAGE_NAME="prod"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Get AWS Account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo "Region: $REGION"
echo "Account ID: $ACCOUNT_ID"
echo ""

# Create or get API
echo -e "${YELLOW}Creating REST API...${NC}"

API_ID=$(aws apigateway get-rest-apis --region $REGION --query "items[?name=='$API_NAME'].id" --output text)

if [ -z "$API_ID" ]; then
  API_ID=$(aws apigateway create-rest-api \
    --name $API_NAME \
    --description "LogicLens API for code analysis and question generation" \
    --endpoint-configuration types=REGIONAL \
    --region $REGION \
    --query 'id' \
    --output text)
  echo -e "${GREEN}✓ API created: $API_ID${NC}"
else
  echo -e "${GREEN}✓ Using existing API: $API_ID${NC}"
fi

# Get root resource ID
ROOT_ID=$(aws apigateway get-resources --rest-api-id $API_ID --region $REGION --query 'items[?path==`/`].id' --output text)

# Function to create resource and method
create_endpoint() {
  local RESOURCE_PATH=$1
  local LAMBDA_FUNCTION=$2
  local METHOD="POST"
  
  echo -e "${YELLOW}Creating endpoint: /$RESOURCE_PATH${NC}"
  
  # Create resource
  RESOURCE_ID=$(aws apigateway get-resources --rest-api-id $API_ID --region $REGION --query "items[?path=='/$RESOURCE_PATH'].id" --output text)
  
  if [ -z "$RESOURCE_ID" ]; then
    RESOURCE_ID=$(aws apigateway create-resource \
      --rest-api-id $API_ID \
      --parent-id $ROOT_ID \
      --path-part $RESOURCE_PATH \
      --region $REGION \
      --query 'id' \
      --output text)
  fi
  
  # Create OPTIONS method for CORS
  aws apigateway put-method \
    --rest-api-id $API_ID \
    --resource-id $RESOURCE_ID \
    --http-method OPTIONS \
    --authorization-type NONE \
    --region $REGION 2>/dev/null || true
  
  aws apigateway put-method-response \
    --rest-api-id $API_ID \
    --resource-id $RESOURCE_ID \
    --http-method OPTIONS \
    --status-code 200 \
    --response-parameters '{"method.response.header.Access-Control-Allow-Headers":false,"method.response.header.Access-Control-Allow-Methods":false,"method.response.header.Access-Control-Allow-Origin":false}' \
    --region $REGION 2>/dev/null || true
  
  aws apigateway put-integration \
    --rest-api-id $API_ID \
    --resource-id $RESOURCE_ID \
    --http-method OPTIONS \
    --type MOCK \
    --request-templates '{"application/json":"{\"statusCode\": 200}"}' \
    --region $REGION 2>/dev/null || true
  
  aws apigateway put-integration-response \
    --rest-api-id $API_ID \
    --resource-id $RESOURCE_ID \
    --http-method OPTIONS \
    --status-code 200 \
    --response-parameters '{"method.response.header.Access-Control-Allow-Headers":"'"'"'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"'"'","method.response.header.Access-Control-Allow-Methods":"'"'"'POST,OPTIONS'"'"'","method.response.header.Access-Control-Allow-Origin":"'"'"'*'"'"'"}' \
    --region $REGION 2>/dev/null || true
  
  # Create POST method
  aws apigateway put-method \
    --rest-api-id $API_ID \
    --resource-id $RESOURCE_ID \
    --http-method $METHOD \
    --authorization-type NONE \
    --region $REGION 2>/dev/null || true
  
  # Integrate with Lambda
  LAMBDA_ARN="arn:aws:lambda:$REGION:$ACCOUNT_ID:function:$LAMBDA_FUNCTION"
  
  aws apigateway put-integration \
    --rest-api-id $API_ID \
    --resource-id $RESOURCE_ID \
    --http-method $METHOD \
    --type AWS_PROXY \
    --integration-http-method POST \
    --uri "arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/$LAMBDA_ARN/invocations" \
    --region $REGION 2>/dev/null || true
  
  # Grant API Gateway permission to invoke Lambda
  aws lambda add-permission \
    --function-name $LAMBDA_FUNCTION \
    --statement-id apigateway-$RESOURCE_PATH-$(date +%s) \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:$REGION:$ACCOUNT_ID:$API_ID/*/$METHOD/$RESOURCE_PATH" \
    --region $REGION 2>/dev/null || true
  
  echo -e "${GREEN}✓ Endpoint created: /$RESOURCE_PATH${NC}"
}

# Create endpoints
create_endpoint "generate-questions" "LogicLens-QuestionGeneration"
create_endpoint "analyze-answers" "LogicLens-GapDetection"
create_endpoint "refactor-code" "LogicLens-RefactorCode"

# Deploy API
echo -e "${YELLOW}Deploying API to $STAGE_NAME stage...${NC}"

aws apigateway create-deployment \
  --rest-api-id $API_ID \
  --stage-name $STAGE_NAME \
  --description "LogicLens API deployment" \
  --region $REGION > /dev/null

echo -e "${GREEN}✓ API deployed${NC}"

# Get API URL
API_URL="https://$API_ID.execute-api.$REGION.amazonaws.com/$STAGE_NAME"

echo ""
echo -e "${GREEN}✅ API Gateway setup complete!${NC}"
echo ""
echo "API URL: $API_URL"
echo ""
echo "Endpoints:"
echo "  POST $API_URL/generate-questions"
echo "  POST $API_URL/analyze-answers"
echo "  POST $API_URL/refactor-code"
echo ""
echo "Add this to your .env.local:"
echo "NEXT_PUBLIC_API_URL=$API_URL"
