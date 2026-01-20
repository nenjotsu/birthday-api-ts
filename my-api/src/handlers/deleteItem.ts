import { DeleteCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { DeleteItemEvent, LambdaResponse, DeleteItemResponse } from '../types';
import { createDynamoDBClient, getTableName } from '../utils/dynamodb';
import {
  successResponse,
  notFoundResponse,
  internalErrorResponse,
  badRequestResponse,
} from '../utils/response';

const docClient = createDynamoDBClient();
const TABLE_NAME = getTableName();

export const handler = async (event: DeleteItemEvent): Promise<LambdaResponse> => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    const { id } = event.pathParameters || {};

    if (!id || id.trim() === '') {
      return badRequestResponse('Item ID is required');
    }

    // First, check if the item exists
    const getCommand = new GetCommand({
      TableName: TABLE_NAME,
      Key: { id },
    });

    const getResponse = await docClient.send(getCommand);

    if (!getResponse.Item) {
      return notFoundResponse(`Item with id '${id}' not found`);
    }

    const deleteCommand = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id },
      // Optional: Use ReturnValues to get the deleted item back
      ReturnValues: 'ALL_OLD',
    });

    const deleteResponse = await docClient.send(deleteCommand);

    console.log('Item deleted:', deleteResponse.Attributes);

    const response: DeleteItemResponse = {
      message: 'Item '+ id + ' deleted successfully',
    };

    return successResponse<DeleteItemResponse>(response);
  } catch (error) {
    return internalErrorResponse(error as Error);
  }
};