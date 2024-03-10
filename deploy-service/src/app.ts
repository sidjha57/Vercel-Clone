import dotenv from "dotenv";
import { initializeRedisClient, subscriber } from "./utils/redisInitializer";
import { commandOptions } from "redis";
import { downloadFromS3, uploadFile } from "./utils/aws";
import { buildProject } from "./utils/buildProject";
import { getFilesInDirectory } from "./utils/getFilesInDirectory";
import path from "path";

dotenv.config();

initializeRedisClient();

// downloadFromS3('output/a255y', __dirname);
// buildProject('t1o14', __dirname);

// const files: string[] = [];
// getFilesInDirectory(path.join(__dirname, `output/4sjl0/dist`), files);
// console.log(files);

// files.map(async (filePath) => {
// 	const relativePath = path.relative(__dirname, filePath);
// 	console.log(relativePath.replace("output/4sjl0/dist/", "build/4sjl0/"));
// }),
async function main() {
	console.log("Deployment service started");
	while (true) {
		const response = await subscriber.brPop(
			commandOptions({ isolated: true }),
			process.env.BUILD_QUEUE_KEY ?? "build-queue",
			0,
		);
		console.log(response);
		const id = response?.element;
		await downloadFromS3(`output/${id}`, __dirname);
		await buildProject(id || "", __dirname);
		console.log("Project built successfully with id: " + id);

		const files: string[] = [];
		getFilesInDirectory(path.join(__dirname, `output/${id}/dist`), files);
		console.log(files);

		console.log("Uploading the build files to s3");
		await Promise.all(
			files.map(async (filePath) => {
				const relativePath = path
					.relative(__dirname, filePath)
					.replace(`output/${id}/dist`, `build/${id}`);
				await uploadFile(relativePath, filePath);
			}),
		);
        console.log("Build files uploaded successfully to s3");
	}
}

main();