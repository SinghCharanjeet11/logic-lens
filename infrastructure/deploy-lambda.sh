#!/bin/bash

# LogicLens Lambda Deployment Script
# This script packages and deploys all Lambda functions to AWS

set -e

echo "🚀 Starting LogicLens Lambda deployment..."

# Configuration
REGION=${AWS_REGION:-us-east-1}
ROLE_NAME="LogicLensLambdaExecutionRole"
TABLE_NAME="LogicLensSessionsTable"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to create IAM role if it doesn't exist
create_iam_role() {
  echo -e "${YELLOW}Checking IAM role...${NC}"
  
  if aws iam get-role --role-name $ROLE_NAME 2>/dev/null; then
    echo -e "${GREEN}✓ IAM role already exists${NC}"
    ROLE_ARN=$(aws iam get-role --role-name $ROLE_NAME --query 'Role.Arn' --output text)
  else
    echo "Creating IAM role..."
    
    # Create trust policy
    cat > /tmp/trust-policy.json <<EOF
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
EOF
    
    ROLE_ARN=$(aws iam create-role \
      --role-name $ROLE_NAME \
      --assume-role-policy-document file:///tmp/trust-policy.json \
      --query 'Role.Arn' \
      --output text)
    
    # Attach policies
    aws iam attach-role-policy \
      --role-name $ROLE_NAME \
      --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
    
    aws iam attach-role-policy \
      --role-name $ROLE_NAME \
      --policy-arn arn:aws:iam::aws:policy/AmazonBedrockFullAccess
    
    aws iam attach-role-policy \
      --role-name $ROLE_NAME \
      --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess
    
    echo -e "${GREEN}✓ IAM role created${NC}"
    echo "Waiting 10 seconds for role to propagate..."
    sleep 10
  fi
  
  echo "Role ARN: $ROLE_ARN"
}

# Function to deploy a Lambda function
deploy_lambda() {
  local FUNCTION_NAME=$1
  local FUNCTION_DIR=$2
  local HANDLER=${3:-index.handler}
  local TIMEOUT=${4:-30}
  local MEMORY=${5:-1024}
  
  echo -e "${YELLOW}Deploying $FUNCTION_NAME...${NC}"
  
  cd $FUNCTION_DIR
  
  # Install dependencies
  if [ -f "package.json" ]; then
    echo "Installing dependencies..."
    npm install --production
  fi
  
  # Create deployment package
  echo "Creating deployment package..."
  zip -r /tmp/${FUNCTION_NAME}.zip . -x "*.git*" "*.sh"
  
  cd - > /dev/null
  
  # Check if function exists
  if aws lambda get-function --function-name $FUNCTION_NAME --region $REGION 2>/dev/null; then
    echo "Updating existing function..."
    aws lambda update-function-code \
      --function-name $FUNCTION_NAME \
      --zip-file fileb:///tmp/${FUNCTION_NAME}.zip \
      --region $REGION > /dev/null
    
    aws lambda update-function-configuration \
      --function-name $FUNCTION_NAME \
      --timeout $TIMEOUT \
      --memory-size $MEMORY \
      --environment "Variables={DYNAMODB_TABLE=$TABLE_NAME,AWS_REGION=$REGION}" \
      --region $REGION > /dev/null
  else
    echo "Creating new function..."
    aws lambda create-function \
      --function-name $FUNCTION_NAME \
      --runtime nodejs20.x \
      --role $ROLE_ARN \
      --handler $HANDLER \
      --zip-file fileb:///tmp/${FUNCTION_NAME}.zip \
      --timeout $TIMEOUT \
      --memory-size $MEMORY \
      --environment "Variables={DYNAMODB_TABLE=$TABLE_NAME,AWS_REGION=$REGION}" \
      --region $REGION > /dev/null
  fi
  
  echo -e "${GREEN}✓ $FUNCTION_NAME deployed${NC}"
  
  # Clean up
  rm /tmp/${FUNCTION_NAME}.zip
}

# Main deployment
echo "Region: $REGION"
echo "DynamoDB Table: $TABLE_NAME"
echo ""

# Create IAM role
create_iam_role

echo ""

# Deploy Lambda functions
deploy_lambda "LogicLens-QuestionGeneration" "../lambda/question-generation" "index.handler" 30 1024
deploy_lambda "LogicLens-GapDetection" "../lambda/gap-detection" "index.handler" 30 1024
deploy_lambda "LogicLens-RefactorCode" "../lambda/refactor-code" "index.handler" 30 1024

echo ""
echo -e "${GREEN}✅ All Lambda functions deployed successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Run ./setup-api-gateway.sh to create API endpoints"
echo "2. Test the functions using the AWS Console or CLI"
echo "3. Update your frontend .env.local with the API Gateway URL"
