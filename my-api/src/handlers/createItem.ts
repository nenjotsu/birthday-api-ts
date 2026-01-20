import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';
import { badRequestResponse, createdResponse, internalErrorResponse } from '../utils/response';
import { createDynamoDBClient, getTableName } from '../utils/dynamodb';


const docClient = createDynamoDBClient();
const TABLE_NAME = getTableName();

exports.handler = async (event: { body: any; }) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    const body = JSON.parse(event.body || '{}');

    // Validate required fields
    if (!body.firstName || !body.lastName || !body.birthday || !body.timezone) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          message: 'Missing required field: name',
        }),
      };
    }

    // Validate birthday format
    const birthdayRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!birthdayRegex.test(body.birthday)) {
      return badRequestResponse('Invalid birthday format');
    }

    const [, month, day] = body.birthday.split('-');
    body.birthdayMonthDay = `${month}-${day}`;

    const item = {
      id: randomUUID(),
      firstName: body.firstName,
      lastName: body.lastName,
      birthday: body.birthday,
      birthdayMonthDay: body.birthdayMonthDay,
      timezone: body.timezone,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    });

    await docClient.send(command);

    return createdResponse(item);
  } catch (error) {
    console.error('Error:', error);

    return internalErrorResponse(error as Error);
  }
};