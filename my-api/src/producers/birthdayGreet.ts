import { BirthdayGreetProducerDTO } from "../types";
import { kafka } from "../utils/kafkaClient";

export const birthdayGreetProducer = async (
  body: BirthdayGreetProducerDTO): Promise<void> => {

  const producer = kafka.producer();
  await producer.connect();
  try {
    if (!body.topic) {
      throw new Error('Topic is required');
    }
    if (body.messages.length === 0) {
      console.log('No messages to send');
      return;
    }
    await producer.send({
      topic: body.topic,
      messages: body.messages,
    });
  } catch (error) {
    console.error('Error in birthdayGreetProducer:', error);
    throw error;
  } finally {
    await producer.disconnect();
  }
};