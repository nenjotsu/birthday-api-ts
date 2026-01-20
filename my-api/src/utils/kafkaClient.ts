import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: "kafka-app",
  brokers: ["kafka:9093"]
});

export const TOPIC_USERS = "users";

export interface UserCreatedEvent {
  fullName: string;
  birthday: string;
}
