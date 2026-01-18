# Gettting Started

# Start LocalStack
```bash
# Using Docker Compose
docker-compose up -d

# Or using LocalStack CLI
localstack start -d
```

## Deploy to LocalStack

```bash
# Make script executable
chmod +x deploy-local.sh test-api.sh

# Deploy
./deploy-local.sh
```

# Test the API
```bash
# Run test script
./test-api.sh

# Or manual testing
API_ID=$(awslocal apigateway get-rest-apis --query 'items[0].id' --output text)
BASE_URL="http://localhost:4566/restapis/${API_ID}/dev/_user_request_"

# Create item
curl -X POST "$BASE_URL/items" \
  -H 'Content-Type: application/json' \
  -d '{"name":"TypeScript Item","description":"Built with TS"}'

# Get all items
curl "$BASE_URL/items" | jq .
```


```bash
# To display all log groups
aws logs describe-log-groups \
  --endpoint-url http://localhost:4566 \
  --query 'logGroups[*].logGroupName' \
  --output table
```
