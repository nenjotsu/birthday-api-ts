import { LambdaResponse, ApiResponse } from '../types';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
};

export const createResponse = <T = any>(
  statusCode: number,
  body: ApiResponse<T> | any
): LambdaResponse => {
  return {
    statusCode,
    headers,
    body: JSON.stringify(body),
  };
};

export const successResponse = <T = any>(data: T, message: string = 'Success'): LambdaResponse => {
  return createResponse(200, { message, data });
};

export const createdResponse = <T = any>(data: T, message: string = 'Created'): LambdaResponse => {
  return createResponse(201, { message, data });
};

export const errorResponse = (
  statusCode: number,
  message: string,
  error?: string
): LambdaResponse => {
  return createResponse(statusCode, { message, error });
};

export const notFoundResponse = (message: string = 'Not found'): LambdaResponse => {
  return errorResponse(404, message);
};

export const badRequestResponse = (message: string, error?: string): LambdaResponse => {
  return errorResponse(400, message, error);
};

export const internalErrorResponse = (error: Error): LambdaResponse => {
  console.error('Internal error:', error);
  return errorResponse(500, 'Internal server error', error.message);
};