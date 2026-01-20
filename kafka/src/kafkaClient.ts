import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: "kafka-app",
  brokers: ["localhost:9092"],
});

export const TOPIC_USERS = "users";

export interface UserCreatedEvent {
  fullname: string;
  // Store birthday as ISO string like "1990-01-01"
  birthday?: string;
}
