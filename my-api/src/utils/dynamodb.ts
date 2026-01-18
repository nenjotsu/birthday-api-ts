import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { DynamoDBConfig } from '../types';

export const createDynamoDBClient = (config?: DynamoDBConfig): DynamoDBDocumentClient => {
  const client = new DynamoDBClient({
    endpoint: config?.endpoint || process.env.AWS_ENDPOINT_URL || 'http://localhost:4566',
    region: config?.region || process.env.AWS_REGION || 'us-east-1',
  });

  return DynamoDBDocumentClient.from(client);
};

export const getTableName = (): string => {
  const tableName = process.env.TABLE_NAME || 'items-table';
  return tableName;
};