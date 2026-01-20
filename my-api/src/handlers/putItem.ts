import { ScanCommand } from '@aws-sdk/client-dynamodb';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { badRequestResponse, internalErrorResponse, successResponse } from '../utils/response';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { createDynamoDBClient, getTableName } from '../utils/dynamodb';


const docClient = createDynamoDBClient();
const TABLE_NAME = getTableName();

interface User {
  id: string;
  firstName: string;
  lastName: string;
  birthday?: string;
  timezone?: string;
  birthdayMonthDay?: string;
}

export const handler = async (event: { body: any }) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    const body = JSON.parse(event.body || '{}');

    // Validate required fields
    if (!body.firstName || !body.lastName || !body.birthday || !body.timezone) {
      return badRequestResponse('Missing required fields');
    }

    // Validate birthday format
    const birthdayRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!birthdayRegex.test(body.birthday)) {
      return badRequestResponse('Invalid birthday format');
    }

    const [, month, day] = body.birthday.split('-');
    body.birthdayMonthDay = `${month}-${day}`;

    const scanParams = {
      TableName: TABLE_NAME,
      FilterExpression: 'firstName = :fn AND lastName = :ln',
      ExpressionAttributeValues: { 
        ':fn': body.firstName, 
        ':ln': body.lastName 
      },
    };

    const scanResult = await docClient.send(new ScanCommand(scanParams));
    const items = scanResult.Items?.map((item) => unmarshall(item)) || [];

    if (items.length === 0) {
      return badRequestResponse('User does not exist');
    }

    const user = items[0] as User;  

    const updateParams = {
      TableName: TABLE_NAME,
      Key: { 
        id: user.id
      },
      UpdateExpression: 'SET #birthday = :birthday, #timezone = :timezone, #birthdayMonthDay = :birthdayMonthDay',
      ExpressionAttributeNames: { 
        '#birthday': 'birthday', 
        '#timezone': 'timezone', 
        '#birthdayMonthDay': 'birthdayMonthDay' 
      },
      ExpressionAttributeValues: { 
        ':birthday': body.birthday, 
        ':timezone': body.timezone, 
        ':birthdayMonthDay': body.birthdayMonthDay 
      },
    };

    const result = await docClient.send(new UpdateCommand(updateParams));
    return successResponse(result.Attributes);
  } catch (error) {
    console.error('Error:', error);
    return internalErrorResponse(error as Error);
  }
};
