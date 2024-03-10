import dotenv from "dotenv";
import { initializeRedisClient, subscriber } from "./utils/redisInitializer";
import { commandOptions } from "redis";

dotenv.config();

initializeRedisClient();

async function main() {
	while(true) {
		console.log("Deployment service started");
		const response = await subscriber.brPop(
			commandOptions({isolated: true}),
			process.env.BUILD_QUEUE_KEY ?? "build-queue",
			0
		)
		console.log(response);
	}
}

main();


