# Manual AWS Setup (Copy-Paste Commands)

If the PowerShell scripts aren't working, run these commands one by one in your terminal.

## Step 1: Create DynamoDB Table

```powershell
aws dynamodb create-table --table-name LogicLensSessionsTable --attribute-definitions AttributeName=sessionId,AttributeType=S --key-schema AttributeName=sessionId,KeyType=HASH --billing-mode PAY_PER_REQUEST --region us-east-1
```

Wait for it to complete, then enable TTL:

```powershell
aws dynamodb update-time-to-live --table-name LogicLensSessionsTable --time-to-live-specification "Enabled=true,AttributeName=ttl" --region us-east-1
```

## Step 2: Create IAM Role

Create trust policy file:

```powershell
@"
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "lambda.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}
"@ | Out-File -FilePath trust-policy.json -Encoding UTF8
```

Create role:

```powershell
aws iam create-role --role-name LogicLensLambdaExecutionRole --assume-role-policy-document file://trust-policy.json
```

Attach policies:

```powershell
aws iam attach-role-policy --role-name LogicLensLambdaExecutionRole --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

aws iam attach-role-policy --role-name LogicLensLambdaExecutionRole --policy-arn arn:aws:iam::aws:policy/AmazonBedrockFullAccess

aws iam attach-role-policy --role-name LogicLensLambdaExecutionRole --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess
```

Get the role ARN (save this):

```powershell
aws iam get-role --role-name LogicLensLambdaExecutionRole --query 'Role.Arn' --output text
```

## Step 3: Deploy Lambda Functions

### 3a. Question Generation Lambda

```powershell
cd ..\lambda\question-generation
npm install --production
Compress-Archive -Path * -DestinationPath function.zip -Force

aws lambda create-function --function-name LogicLens-QuestionGeneration --runtime nodejs20.x --role YOUR_ROLE_ARN_HERE --handler index.handler --zip-file fileb://function.zip --timeout 30 --memory-size 1024 --environment "Variables={DYNAMODB_TABLE=LogicLensSessionsTable,AWS_REGION=us-east-1}" --region us-east-1

cd ..\..\infrastructure
```

### 3b. Gap Detection Lambda

```powershell
cd ..\lambda\gap-detection
npm install --production
Compress-Archive -Path * -DestinationPath function.zip -Force

aws lambda create-function --function-name LogicLens-GapDetection --runtime nodejs20.x --role YOUR_ROLE_ARN_HERE --handler index.handler --zip-file fileb://function.zip --timeout 30 --memory-size 1024 --environment "Variables={DYNAMODB_TABLE=LogicLensSessionsTable,AWS_REGION=us-east-1}" --region us-east-1

cd ..\..\infrastructure
```

### 3c. Refactor Code Lambda

```powershell
cd ..\lambda\refactor-code
npm install --production
Compress-Archive -Path * -DestinationPath function.zip -Force

aws lambda create-function --function-name LogicLens-RefactorCode --runtime nodejs20.x --role YOUR_ROLE_ARN_HERE --handler index.handler --zip-file fileb://function.zip --timeout 30 --memory-size 1024 --environment "Variables={DYNAMODB_TABLE=LogicLensSessionsTable,AWS_REGION=us-east-1}" --region us-east-1

cd ..\..\infrastructure
```

**Replace `YOUR_ROLE_ARN_HERE` with the ARN from Step 2!**

## Step 4: Create API Gateway

This is complex, so use the AWS Console instead:

### Option A: AWS Console (Recommended)

1. Go to AWS Console → API Gateway
2. Create REST API → "New API"
3. Name: "LogicLensAPI"
4. Create 3 resources:
   - `/generate-questions`
   - `/analyze-answers`
   - `/refactor-code`
5. For each resource:
   - Create POST method
   - Integration type: Lambda Function
   - Select the corresponding Lambda function
   - Enable CORS
6. Deploy API to "prod" stage
7. Copy the Invoke URL

### Option B: CLI (Advanced)

```powershell
# Create API
$API_ID = aws apigateway create-rest-api --name LogicLensAPI --endpoint-configuration types=REGIONAL --region us-east-1 --query 'id' --output text

# Get root resource
$ROOT_ID = aws apigateway get-resources --rest-api-id $API_ID --region us-east-1 --query 'items[0].id' --output text

# Create resource for generate-questions
$RESOURCE1 = aws apigateway create-resource --rest-api-id $API_ID --parent-id $ROOT_ID --path-part generate-questions --region us-east-1 --query 'id' --output text

# Create POST method
aws apigateway put-method --rest-api-id $API_ID --resource-id $RESOURCE1 --http-method POST --authorization-type NONE --region us-east-1

# Get account ID
$ACCOUNT_ID = aws sts get-caller-identity --query Account --output text

# Integrate with Lambda
aws apigateway put-integration --rest-api-id $API_ID --resource-id $RESOURCE1 --http-method POST --type AWS_PROXY --integration-http-method POST --uri "arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:${ACCOUNT_ID}:function:LogicLens-QuestionGeneration/invocations" --region us-east-1

# Grant permission
aws lambda add-permission --function-name LogicLens-QuestionGeneration --statement-id apigateway-invoke --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:us-east-1:${ACCOUNT_ID}:${API_ID}/*/POST/generate-questions" --region us-east-1

# Repeat for other endpoints...
# (This gets tedious, use AWS Console instead!)

# Deploy
aws apigateway create-deployment --rest-api-id $API_ID --stage-name prod --region us-east-1

# Get URL
Write-Host "API URL: https://${API_ID}.execute-api.us-east-1.amazonaws.com/prod"
```

## Step 5: Update .env.local

Add this line to your `.env.local` file:

```
NEXT_PUBLIC_API_URL=https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/prod
```

## Done!

Now run:

```powershell
npm install
npm run dev
```

---

## Troubleshooting

### "Access Denied" errors
- Make sure your AWS credentials are configured: `aws configure`
- Check IAM permissions

### "Role not found" errors
- Wait 10 seconds after creating the role
- Verify role exists: `aws iam get-role --role-name LogicLensLambdaExecutionRole`

### Lambda deployment fails
- Check you're in the correct directory
- Verify Node.js is installed: `node --version`
- Try deleting function.zip and recreating it
