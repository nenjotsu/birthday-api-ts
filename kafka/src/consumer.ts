import https from 'https';
import { kafka, TOPIC_USERS, UserCreatedEvent } from "./kafkaClient";
import { EachMessagePayload } from "kafkajs";

interface PostData {
  fullName: string;
}




async function runConsumer() {
  const consumer = kafka.consumer({ groupId: "users-consumer-group" });

  await consumer.connect();
  await consumer.subscribe({ topic: TOPIC_USERS, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
      if (!message.value) {
        console.warn("Received empty message value");
        return;
      }

      const raw = message.value.toString();
      let event: UserCreatedEvent;

      try {
        event = JSON.parse(raw) as UserCreatedEvent;
      } catch (err) {
        console.error("Failed to parse message", err, "raw:", raw);
        return;
      }

      console.log(`Received on topic=${topic} partition=${partition}`);
      console.log("UserCreatedEvent:", event);

      await postPipedream({ fullName: event.fullname });
    },
  });

  // keep process alive; do not disconnect here
}

const postPipedream = async (data: PostData): Promise<void> => {
  try {
    const response = await fetch("https://eox5gtmpeeybexy.m.pipedream.net/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    console.log('Response:', response.status, result);
  } catch (error) {
    console.error('Request failed:', error);
  }
};

runConsumer().catch((err) => {
  console.error("Consumer error", err);
  process.exit(1);
});
