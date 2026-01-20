#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting TypeScript build and LocalStack deployment...${NC}"


# Check if LocalStack is running
if ! curl -s http://localhost:4566/_localstack/health > /dev/null; then
    echo -e "${YELLOW}LocalStack is not running. Starting LocalStack...${NC}"
    localstack start -d
    sleep 5
fi

# Install dependencies
echo -e "${GREEN}Installing dependencies...${NC}"
npm install

# Build TypeScript
echo -e "${GREEN}Compiling TypeScript...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}TypeScript compilation failed!${NC}"
    exit 1
fi

# Build the SAM application
echo -e "${GREEN}Building SAM application...${NC}"
sam build --no-use-container --template template.yaml --manifest package.json

if [ $? -ne 0 ]; then
    echo -e "${RED}SAM build failed!${NC}"
    exit 1
fi

# Deploy to LocalStack
echo -e "${GREEN}Deploying to LocalStack...${NC}"
sam deploy \
  --template-file .aws-sam/build/template.yaml \
  --stack-name my-api-stack \
  --capabilities CAPABILITY_IAM \
  --region us-east-1 \
  --no-confirm-changeset \
  --no-fail-on-empty-changeset \
  --resolve-s3 \
  --parameter-overrides \
    Environment=local

if [ $? -ne 0 ]; then
    echo -e "${RED}SAM deployment failed!${NC}"
    exit 1
fi

# Get API endpoint
echo -e "${GREEN}Getting API endpoint...${NC}"

API_ID=$(aws apigateway get-rest-apis \
  --endpoint-url http://localhost:4566 \
  --query 'items[0].id' --output text)

API_ENDPOINT="http://localhost:4566/restapis/${API_ID}/dev/_user_request_"



echo -e "${GREEN}Deployment complete!${NC}"
echo -e "${YELLOW}API Endpoint: ${API_ENDPOINT}${NC}"
echo ""
echo -e "$(aws logs describe-log-groups \
  --endpoint-url http://localhost:4566 \
  --query 'logGroups[*].logGroupName' \
  --output table)"
echo ""
echo "Run tests:          ./test-api.sh"