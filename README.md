# Gettting Started

# Start LocalStack & Kafka
```bash
# Using Docker Compose
$ docker-compose up -d

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

# To run the consumer
```bash
cd ./kafka
npx ts-node src/consumer.ts
```



```bash
# To display all log groups
aws logs describe-log-groups \
  --endpoint-url http://localhost:4566 \
  --query 'logGroups[*].logGroupName' \
  --output table
```

# check the kafka messages
Go to http://localhost:8080/ to see the topics and messages of the users with their birthday greetings
