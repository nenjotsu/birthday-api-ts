#!/bin/bash

# Get API ID from LocalStack
# API_ID=$(awslocal apigateway get-rest-apis --query 'items[0].id' --output text)
API_ID=$(aws apigateway get-rest-apis \
  --endpoint-url http://localhost:4566 \
  --query 'items[0].id' --output text)
API_NAME=$(aws apigateway get-rest-apis \
  --endpoint-url http://localhost:4566 \
  --query 'items[0].name' --output text)
BASE_URL="http://localhost:4566/restapis/${API_ID}/dev/_user_request_"

echo "Testing API at: $BASE_URL"
echo ""

# Test 1: Create an item
echo "1. Creating a new item..."
RESPONSE=$(curl -s -X POST "$BASE_URL/items" \
  -H 'Content-Type: application/json' \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "birthday": "1990-01-19",
    "timezone": "America/New_York"
  }')

echo "$RESPONSE" | jq .
ITEM_ID=$(echo "$RESPONSE" | jq -r '.item.id')
echo ""

# Test 2: Get all items
echo "2. Getting all items..."
curl -s "$BASE_URL/items" | jq .
echo ""

# Test 3: Get single item
echo "3. Getting single item by ID..."
curl -s "$BASE_URL/items/$ITEM_ID" | jq .
echo ""

# Test 4: Create another item
echo "4. Creating another item..."
curl -s -X POST "$BASE_URL/items" \
  -H 'Content-Type: application/json' \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "birthday": "1985-05-15",
    "timezone": "Europe/London"
  }' | jq .
echo ""

# Test 5: Get all items again
echo "5. Getting all items (should show 2 items)..."
curl -s "$BASE_URL/items" | jq .
echo ""

# Test 6: Delete the first item
echo "6. Deleting the first item with ID: $ITEM_ID..."
curl -s -X DELETE "$BASE_URL/items/$ITEM_ID" | jq . 
echo ""



# Test 7: Get all items again
echo "7. Getting all items (should show 1 item)..."
curl -s "$BASE_URL/items" | jq .
echo ""

echo "8. Creating a new item..."
RESPONSE=$(curl -s -X POST "$BASE_URL/items" \
  -H 'Content-Type: application/json' \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "birthday": "1990-01-19",
    "timezone": "America/New_York"
  }')

echo "9. Creating a new item..."
RESPONSE=$(curl -s -X POST "$BASE_URL/items" \
  -H 'Content-Type: application/json' \
  -d '{
    "firstName": "Pepe",
    "lastName": "Pimentel",
    "birthday": "1990-01-21",
    "timezone": "America/New_York"
  }')

echo "10. Creating a new item..."
RESPONSE=$(curl -s -X POST "$BASE_URL/items" \
  -H 'Content-Type: application/json' \
  -d '{
    "firstName": "Jose",
    "lastName": "Rizal",
    "birthday": "1990-01-20",
    "timezone": "Asia/Manila"
  }')



# Test 11: Check scheduled function logs
echo "11. Checking scheduled function logs..."
APP_NAME_SCHEDULER=$(aws logs describe-log-groups --endpoint-url http://localhost:4566 --query 'logGroups[0].[logGroupName,storedBytes][0]'   --output text)
aws logs tail \
  "$APP_NAME_SCHEDULER" \
  --since 1m \
  --format short \
  --endpoint-url http://localhost:4566

# Test 12: Delete all remaining items
# echo "12. Deleting all remaining items..."
# ITEM_IDS=$(curl -s "$BASE_URL/items" | jq -r '.data.items[].id')
# for ID in $ITEM_IDS; do
#   echo "  Deleting item with ID: $ID"
#   curl -s -X DELETE "$BASE_URL/items/$ID" | jq .``
# done
# echo ""