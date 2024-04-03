import { PROJECT_ID } from "index";
import { redisClient } from "./redisClient";

export function publishLog (log: string) {
    redisClient.publish(`logs:${PROJECT_ID}`, JSON.stringify(log));
}