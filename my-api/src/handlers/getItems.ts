import { ScanCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { GetItemsEvent, LambdaResponse, Item, GetItemsResponse } from '../types';
import { createDynamoDBClient, getTableName } from '../utils/dynamodb';
import {
  successResponse,
  notFoundResponse,
  internalErrorResponse,
} from '../utils/response';

const docClient = createDynamoDBClient();
const TABLE_NAME = getTableName();

export const handler = async (event: GetItemsEvent): Promise<LambdaResponse> => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    const { id } = event.pathParameters || {};

    // Get single item by ID
    if (id) {
      const command = new GetCommand({
        TableName: TABLE_NAME,
        Key: { id },
      });

      const response = await docClient.send(command);

      if (!response.Item) {
        return notFoundResponse('Item not found');
      }

      return successResponse<Item>(response.Item as Item);
    }

    // Get all items
    const command = new ScanCommand({
      TableName: TABLE_NAME,
    });

    const response = await docClient.send(command);

    const result: GetItemsResponse = {
      items: (response.Items || []) as Item[],
      count: response.Count || 0,
    };

    return successResponse<GetItemsResponse>(result);
  } catch (error) {
    return internalErrorResponse(error as Error);
  }
};