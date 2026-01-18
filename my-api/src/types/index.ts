import { APIGatewayProxyEvent, APIGatewayProxyResult, ScheduledEvent } from 'aws-lambda';

// Item type for DynamoDB
export interface Item {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Request body for creating items
export interface CreateItemRequest {
  name: string;
  description?: string;
}

// Response types
export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  error?: string;
}

export interface GetItemsResponse {
  items: Item[];
  count: number;
}

export interface CreateItemResponse {
  message: string;
  item: Item;
}

// Lambda event types
export type GetItemsEvent = APIGatewayProxyEvent;
export type CreateItemEvent = APIGatewayProxyEvent;
export type ScheduledLambdaEvent = ScheduledEvent;

// Lambda response type
export type LambdaResponse = APIGatewayProxyResult;

// DynamoDB client configuration
export interface DynamoDBConfig {
  endpoint?: string;
  region?: string;
}