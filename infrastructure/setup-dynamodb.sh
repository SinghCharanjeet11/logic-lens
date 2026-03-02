#!/bin/bash

# Setup script for LogicLens DynamoDB table
# This script creates the DynamoDB table using AWS CLI

set -e

echo "Creating LogicLens DynamoDB table..."

# Create the table
aws dynamodb create-table \
  --table-name LogicLens-Sessions \
  --attribute-definitions \
    AttributeName=sessionId,AttributeType=S \
    AttributeName=createdAt,AttributeType=S \
  --key-schema \
    AttributeName=sessionId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes \
    "[
      {
        \"IndexName\": \"CreatedAtIndex\",
        \"KeySchema\": [{\"AttributeName\":\"createdAt\",\"KeyType\":\"HASH\"}],
        \"Projection\": {\"ProjectionType\":\"ALL\"}
      }
    ]" \
  --tags \
    Key=Project,Value=LogicLens \
    Key=Environment,Value=Production \
  --region us-east-1

echo "Waiting for table to be active..."
aws dynamodb wait table-exists --table-name LogicLens-Sessions --region us-east-1

echo "Enabling TTL on the table..."
aws dynamodb update-time-to-live \
  --table-name LogicLens-Sessions \
  --time-to-live-specification "Enabled=true, AttributeName=ttl" \
  --region us-east-1

echo "DynamoDB table created successfully!"
echo "Table name: LogicLens-Sessions"
echo "Region: us-east-1"
