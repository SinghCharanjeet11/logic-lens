# LogicLens Infrastructure Setup

This directory contains Infrastructure as Code (IaC) templates and scripts for setting up the AWS backend infrastructure for LogicLens.

## Prerequisites

- AWS CLI installed and configured
- AWS credentials with appropriate permissions (DynamoDB, Lambda, API Gateway, IAM)
- Node.js 18+ (for Lambda functions)
- AWS region: us-east-1

## DynamoDB Table Setup

### Option 1: Using CloudFormation (Recommended)

```bash
# Deploy the CloudFormation stack
aws cloudformation create-stack \
  --stack-name logiclens-dynamodb \
  --template-body file://dynamodb-table.yaml \
  --region us-east-1

# Wait for stack creation to complete
aws cloudformation wait stack-create-complete \
  --stack-name logiclens-dynamodb \
  --region us-east-1

# Get the table name
aws cloudformation describe-stacks \
  --stack-name logiclens-dynamodb \
  --query 'Stacks[0].Outputs' \
  --region us-east-1
```

### Option 2: Using AWS CLI Script

```bash
# Make the script executable
chmod +x setup-dynamodb.sh

# Run the setup script
./setup-dynamodb.sh
```

### Option 3: Manual Setup via AWS Console

1. Go to AWS Console → DynamoDB → Tables → Create table
2. Configure:
   - **Table name**: LogicLens-Sessions
   - **Partition key**: sessionId (String)
   - **Table settings**: On-demand capacity
3. After creation, configure:
   - **TTL**: Enable with attribute name `ttl`
   - **GSI**: Create index named `CreatedAtIndex` with partition key `createdAt` (String)

## DynamoDB Table Schema

### Primary Key
- **sessionId** (String, Partition Key): Unique identifier for each session

### Attributes
- **sessionId** (String): UUID v4 session identifier
- **code** (String): User's code snippet
- **language** (String): Programming language (js, ts, py, java, go)
- **context** (String): User's goal (understanding, debugging, optimizing)
- **questions** (List): Array of generated questions
- **answers** (List): Array of user answers
- **gaps** (List): Array of detected reasoning gaps
- **refactoredCode** (String): Improved code version
- **checklist** (List): Reasoning checklist items
- **createdAt** (String): ISO 8601 timestamp
- **updatedAt** (String): ISO 8601 timestamp
- **ttl** (Number): Unix timestamp for automatic deletion (24 hours)
- **languagePreference** (String): User's language preference (en, hi)

### Global Secondary Index
- **CreatedAtIndex**: Allows querying sessions by creation time
  - Partition key: createdAt (String)
  - Projection: ALL

### TTL Configuration
- **Attribute**: ttl
- **Duration**: 24 hours from creation
- **Purpose**: Automatic cleanup of old sessions to reduce storage costs

## Cost Estimation

### DynamoDB Costs (Pay-per-request)
- **Write requests**: $1.25 per million writes
- **Read requests**: $0.25 per million reads
- **Storage**: $0.25 per GB-month

### Estimated Usage per Session
- 1 write (create session): ~1 KB
- 3 writes (update with questions, answers, results): ~3 KB each
- 2 reads (fetch session): ~1 KB each
- Total: ~4 writes + 2 reads per session

### Cost per Session
- Writes: 4 × ($1.25 / 1,000,000) = $0.000005
- Reads: 2 × ($0.25 / 1,000,000) = $0.0000005
- **Total DynamoDB cost per session: ~$0.0000055** (negligible)

### Monthly Cost Estimate (1000 sessions)
- DynamoDB: ~$0.01
- Storage (1000 sessions × 10 KB × $0.25/GB): ~$0.0025
- **Total: <$0.02/month**

## Verification

After setup, verify the table exists:

```bash
# Describe the table
aws dynamodb describe-table \
  --table-name LogicLens-Sessions \
  --region us-east-1

# Check TTL status
aws dynamodb describe-time-to-live \
  --table-name LogicLens-Sessions \
  --region us-east-1

# List GSIs
aws dynamodb describe-table \
  --table-name LogicLens-Sessions \
  --query 'Table.GlobalSecondaryIndexes' \
  --region us-east-1
```

## Cleanup

To delete the table:

```bash
# Using CloudFormation
aws cloudformation delete-stack \
  --stack-name logiclens-dynamodb \
  --region us-east-1

# Or using AWS CLI directly
aws dynamodb delete-table \
  --table-name LogicLens-Sessions \
  --region us-east-1
```

## Next Steps

After DynamoDB setup:
1. Deploy Lambda functions (see `lambda/` directory)
2. Set up API Gateway endpoints
3. Update `.env.local` with table name
