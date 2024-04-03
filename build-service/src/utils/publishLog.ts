import { PROJECT_ID } from "index";
import { redisClient } from "./redisPublisher";

export function publishLog (log: string) {
    redisClient.publish(`logs:${PROJECT_ID}`, JSON.stringify(log));
}