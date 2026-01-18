import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { ScheduledLambdaEvent } from '../types';
import { createDynamoDBClient, getTableName } from '../utils/dynamodb';

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
    // Example: Count items in database
    const command = new ScanCommand({
      TableName: TABLE_NAME,
      Select: 'COUNT',
    });

    const response = await docClient.send(command);
    const itemCount = response.Count || 0;

    console.log(`Current item count: ${itemCount}`);

    // Your scheduled logic here
    // Examples:
    // - Cleanup old items
    // - Send notifications
    // - Generate reports
    // - Aggregate data
    // - Sync with external systems

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