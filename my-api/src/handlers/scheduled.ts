import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { Item, ScheduledLambdaEvent } from '../types';
import { createDynamoDBClient, getTableName } from '../utils/dynamodb';
import { getPossibleBirthdayKeys, is9AMInUserTimezone, isBirthdayToday } from '../utils/timecheck';
import { birthdayGreetProducer } from '../producers/birthdayGreet';
import { TOPIC_USERS } from '../utils/kafkaClient';

const docClient = createDynamoDBClient();
const TABLE_NAME = getTableName();

interface ScheduledTaskStats {
  timestamp: string;
  itemCount: number;
  status: 'success' | 'error';
  error?: string;
}

export const handler = async (event: ScheduledLambdaEvent): Promise<{ statusCode: number; body: string }> => {
  console.log('Scheduled event triggered:', JSON.stringify(event, null, 2));
  console.log('Execution time:', new Date().toISOString());

  try {
    const users = await findBirthdaysTodayOptimized();
    const itemCount = users.length || 0;

    // call producer 
    const messages = users.map((user) => ({
      key: `${user.firstName}-${user.lastName}`,  // For partitioning
      value: JSON.stringify({
        fullname: `${user.firstName} ${user.lastName}`,
        birthday: user.birthday,
      }),
      headers: { source: "birthday-scheduler" },
    }));

    await birthdayGreetProducer({
      topic: TOPIC_USERS,
      messages,
    });

    console.log('messages:', messages);

    const stats: ScheduledTaskStats = {
      timestamp: new Date().toISOString(),
      itemCount,
      status: 'success',
    };
    console.log('Scheduled task completed:', stats);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Scheduled task executed successfully',
        stats,
      }),
    };
  } catch (error) {
    const err = error as Error;
    console.error('Scheduled task error:', err);

    const stats: ScheduledTaskStats = {
      timestamp: new Date().toISOString(),
      itemCount: 0,
      status: 'error',
      error: err.message,
    };

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Scheduled task failed',
        stats,
      }),
    };
  }
};


/**
   * Optimized version using GSI (if you have month-day index)
   * Create GSI with: birthdayMonthDay as partition key
   */
export const findBirthdaysTodayOptimized = async (): Promise<Item[]> => {
  try {
    // Get unique month-day combinations for all timezones that could be "today"
    const monthDayKeys = getPossibleBirthdayKeys();
    console.log(`Checking ${monthDayKeys.length} possible birthday keys:`, monthDayKeys);

    const birthdayUsers: Item[] = [];

    // Query each month-day combination
    for (const monthDay of monthDayKeys) {
      const command = new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'BirthdayMonthDayIndex', // GSI name
        KeyConditionExpression: 'birthdayMonthDay = :monthDay',
        ExpressionAttributeValues: {
          ':monthDay': monthDay,
        },
      });

      const response = await docClient.send(command);
      const users = (response.Items || []) as Item[];

      // Filter by timezone to ensure it's actually their birthday and filter the time to 9AM on their timezone
      const validBirthdayUsers = users.filter((user) => isBirthdayToday(user) && is9AMInUserTimezone(user));
      birthdayUsers.push(...validBirthdayUsers);
    }

    console.log(`Found ${birthdayUsers.length} birthday users (optimized)`);

    return birthdayUsers;
  } catch (error) {
    console.error('Error finding birthdays (optimized):', error);
    throw error;
  }
}