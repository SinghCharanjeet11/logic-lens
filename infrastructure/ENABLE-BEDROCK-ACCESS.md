# Enable AWS Bedrock Model Access

## Current Issue
AWS Bedrock requires explicit model access approval even after adding a payment method.

## Steps to Enable Claude 3 Haiku Access

### 1. Navigate to Bedrock Console
Go to: https://console.aws.amazon.com/bedrock/home?region=us-east-1#/modelaccess

Or:
1. Open AWS Console
2. Search for "Bedrock" in the services search
3. Click on "Bedrock" service
4. In the left sidebar, click "Model access"

### 2. Request Model Access
1. You'll see a list of available models
2. Find "Claude 3 Haiku" by Anthropic
3. Check the box next to "Claude 3 Haiku"
4. Click "Request model access" or "Modify model access" button at the top
5. Review and click "Submit"

### 3. Wait for Approval
- **Standard models (like Claude 3 Haiku):** Usually instant approval
- **Status will change from "Not available" to "Access granted"**
- Look for a green checkmark next to the model

### 4. Verify Access
After approval, verify with this command:
```bash
aws bedrock list-foundation-models --region us-east-1 --query "modelSummaries[?contains(modelId, 'claude-3-haiku')]"
```

### 5. Re-test the API
Once you see "Access granted" status:
```powershell
.\test-api-endpoint.ps1
```

## Expected Timeline
- Payment method processing: 2-5 minutes
- Model access approval: Instant (for standard models)
- Total wait time: ~5 minutes maximum

## Troubleshooting

### If Model Access is Still Denied
1. **Check payment method status:**
   - Go to: AWS Console → Account → Payment methods
   - Ensure card status is "Active" or "Verified"

2. **Check Bedrock service availability:**
   - Ensure you're in us-east-1 region
   - Some regions don't support all models

3. **Check IAM permissions:**
   - Lambda execution role needs `bedrock:InvokeModel` permission
   - Already configured in your setup ✅

4. **Wait the full 5 minutes:**
   - AWS systems need time to propagate changes
   - Try again after 5 minutes

### If Still Not Working After 10 Minutes
Contact AWS Support or check:
- AWS Service Health Dashboard: https://status.aws.amazon.com/
- Bedrock service status in your region

## Alternative: Use Different Model
If Claude 3 Haiku access is delayed, you can temporarily use:
- **Claude 3 Sonnet:** `anthropic.claude-3-sonnet-20240229-v1:0`
- **Claude 3.5 Sonnet:** `anthropic.claude-3-5-sonnet-20240620-v1:0`

Update the MODEL_ID in all three Lambda functions:
```javascript
const MODEL_ID = 'anthropic.claude-3-5-sonnet-20240620-v1:0';
```

Then redeploy:
```powershell
.\infrastructure\redeploy-all-lambdas.ps1
```

## Current Configuration
- **Model:** Claude 3 Haiku (`anthropic.claude-3-haiku-20240307-v1:0`)
- **Region:** us-east-1
- **Lambda Functions:** All 3 configured correctly
- **API Gateway:** Deployed and accessible
- **DynamoDB:** Active and ready

**Only missing:** Bedrock model access approval
