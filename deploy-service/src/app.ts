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
		await downloadFromS3(`output/${id}`, __dirname); // this is not really required we can stream it directly from github
		await buildProject(id || "", __dirname); // this should be done in docker container
		console.log("Project built successfully with id: " + id);

		const files: string[] = [];
		getFilesInDirectory(path.join(__dirname, `output/${id}/dist`), files);
		console.log(files);

		// We should keep a track of how many build files are we uploading can keep a track of number of api calls we are making
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

		// better way would be to set it in a persistent database
		const statusKey = (process.env.STATUS_KEY as string || 'status') + `:${id}`;
		
		try {
			await subscriber.SET(statusKey, 'deployed');
		} catch (error) {
			console.error(error);
		}
	}
}

main();