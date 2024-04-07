import { publisher } from "./redisPublisher";

const PROJECT_ID = process.env.PROJECT_ID;

export function publishLog (log: string) {
    publisher.publish(`logs:${PROJECT_ID}`, JSON.stringify(log));
}