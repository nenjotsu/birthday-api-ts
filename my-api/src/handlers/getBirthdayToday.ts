
// import { GetItemsEvent, LambdaResponse } from '../types';
// import {
//   internalErrorResponse,
//   successResponse,
// } from '../utils/response';
// import { findBirthdaysTodayOptimized } from './scheduled';


// export const handler = async (event: GetItemsEvent): Promise<LambdaResponse> => {
//   console.log('Event:', JSON.stringify(event, null, 2));

//   try {
//     const users = await findBirthdaysTodayOptimized();
//     const itemCount = users.length || 0;
//     return successResponse({ itemCount, users });
//   } catch (error) {
//     return internalErrorResponse(error as Error);
//   }
// };
