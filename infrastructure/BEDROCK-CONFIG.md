# AWS Bedrock Configuration for LogicLens

## Model Selection

**Selected Model:** Claude 3.5 Sonnet  
**Model ID:** `anthropic.claude-3-5-sonnet-20240620-v1:0`  
**Region:** us-east-1 (primary) or us-west-2 (fallback)

## Why Claude 3.5 Sonnet?

1. **Stability:** Officially supported, production-ready model
2. **Reliability:** Better reasoning quality than Haiku
3. **Availability:** Widely available in AWS Bedrock regions
4. **Cost-Effective:** Balanced performance vs. cost for hackathon demo
5. **No Experimental Features:** Avoids preview/beta model issues

## Token Usage Estimates

Per session (typical):
- Question Generation: ~500-1000 input + ~300-500 output tokens
- Gap Detection: ~1000-1500 input + ~800-1200 output tokens  
- Code Refactoring: ~1200-1800 input + ~1000-1500 output tokens

**Total per session:** ~5000-7000 tokens (~$0.03-$0.05 per session)

## IAM Permissions Required

Your Lambda execution role needs:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": [
        "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-sonnet-20240620-v1:0"
      ]
    }
  ]
}
```

## Bedrock Model Access

Before deploying, ensure Claude 3.5 Sonnet is enabled:

1. Go to AWS Console → Bedrock → Model access
2. Request access to "Claude 3.5 Sonnet"
3. Wait for approval (usually instant for standard models)
4. Verify status shows "Access granted"

## Request Configuration

All Lambda functions use:

```javascript
const payload = {
  anthropic_version: 'bedrock-2023-05-31',
  max_tokens: 1000-2500, // varies by function
  temperature: 0.3-0.7,  // varies by use case
  messages: [...],
  system: "..."
};
```

## Error Handling

The Lambda functions now include:

1. **Clear logging:** Model ID, region, token usage logged
2. **Explicit error messages:** Bedrock errors caught and logged
3. **No silent failures:** All errors propagate with context
4. **CloudWatch integration:** All logs available for debugging

## Testing Checklist

- [ ] Model access granted in Bedrock console
- [ ] IAM role has InvokeModel permission
- [ ] Lambda functions deployed with correct model ID
- [ ] Test endpoint returns successful response
- [ ] CloudWatch logs show successful Bedrock invocations
- [ ] Token usage is within budget expectations

## Troubleshooting

### Error: "Could not resolve the foundation model"
- Check model ID spelling
- Verify region supports Claude 3.5 Sonnet
- Confirm model access is granted

### Error: "AccessDeniedException"
- Check Lambda execution role IAM permissions
- Verify Bedrock resource ARN in policy
- Ensure model access is approved

### Error: "ThrottlingException"
- Bedrock has rate limits per account
- Implement exponential backoff
- Consider requesting quota increase

### High Costs
- Monitor token usage in CloudWatch
- Reduce max_tokens if responses are too long
- Cache similar requests if possible
- Consider switching to Haiku for non-critical paths

## Demo Day Checklist

- [ ] All Lambda functions using Claude 3.5 Sonnet
- [ ] Test run completed successfully
- [ ] CloudWatch logs reviewed (no errors)
- [ ] Cost monitoring dashboard set up
- [ ] Backup plan if Bedrock is unavailable
- [ ] Sample code snippets prepared for demo
- [ ] Error handling tested (simulate failures)

## Cost Monitoring

Monitor these CloudWatch metrics:
- `InvocationCount` per Lambda
- `Duration` per Lambda
- Custom metric: Token usage per session
- Custom metric: Cost per session

Set up billing alerts:
- Alert at $60 (60% of budget)
- Alert at $80 (80% of budget)
- Hard stop at $100

## Support Resources

- [AWS Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [Claude Model Documentation](https://docs.anthropic.com/claude/docs)
- [Bedrock Pricing](https://aws.amazon.com/bedrock/pricing/)
- [Bedrock Quotas](https://docs.aws.amazon.com/bedrock/latest/userguide/quotas.html)
