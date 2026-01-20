import { LambdaResponse, ProducerEvent } from "../types";
import { kafka, UserCreatedEvent } from "../utils/kafkaClient";
import { badRequestResponse, internalErrorResponse, successResponse } from "../utils/response";

export const handler = async (event: ProducerEvent): Promise<LambdaResponse> => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    const producer = kafka.producer();

    await producer.connect();
    const body = JSON.parse(event.body || '{}');

    if (!body.topic || !body.message) {
      return badRequestResponse('Topic and message are required');
    }

    if (!body.message.firstname || !body.message.lastname || !body.message.birthday) {
      return badRequestResponse('Message must contain firstname, lastname, and birthday');
    }
    
    const payload: UserCreatedEvent = {
      fullName: `${body.message.firstname} ${body.message.lastname}`,
      birthday: body.message.birthday,
    };

    await producer.send({
      topic: body.topic,
      messages: [
        {
          key: payload.fullName,
          value: JSON.stringify(payload),
        }],
    });


    return successResponse('Message sent successfully');
  } catch (error) {
    return internalErrorResponse(error as Error);
  }
};