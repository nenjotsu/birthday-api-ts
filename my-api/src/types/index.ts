import { APIGatewayProxyEvent, APIGatewayProxyResult, ScheduledEvent } from 'aws-lambda';

// Item type for DynamoDB
export interface Item {
  id: string;
  firstName: string;
  lastName: string;
  birthday: string; // YYYY-MM-DD
  timezone: string;
  birthdayMonthDay?: string; // MM-DD for easier querying
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
export interface DeleteItemResponse {
  message: string;
}

// Lambda event types

export type GetItemsEvent = APIGatewayProxyEvent;
export type DeleteItemEvent = APIGatewayProxyEvent;
export type CreateItemEvent = APIGatewayProxyEvent;

export type ConsumerEvent = APIGatewayProxyEvent;
export type ProducerEvent = APIGatewayProxyEvent;

export type ScheduledLambdaEvent = ScheduledEvent;

export interface BirthdayGreetProducerDTO {
  topic: string;
  messages: Array<{ key?: string; value: any }>;
}

// Lambda response type
export type LambdaResponse = APIGatewayProxyResult;

// DynamoDB client configuration
export interface DynamoDBConfig {
  endpoint?: string;
  region?: string;
}