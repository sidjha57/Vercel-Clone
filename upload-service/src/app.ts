import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import path from "path";
import { generateUniqueID } from "./utils/generateUniqueID";
import { getFilesInDirectory } from "./utils/getFilesInDirectory";
import { deleteAllDirectories, uploadFile } from "./utils/aws";
import dotenv from "dotenv";
import { initializeRedisClient, publisher } from "./utils/redisInitializer";

dotenv.config();

initializeRedisClient();

const app = express();
app.use(cors());
app.use(express.json());

// deleteAllDirectories('vercel');

const getStatusKey = (id: string): string => {
	const statusKey = (process.env.STATUS_KEY as string || 'status') + `:${id}`;
	return statusKey;
}

// this service is not required build and upload can be done in one service
app.post("/deploy", async (req, res) => {
	try {
		const repoUrl: string = req.body?.repoUrl;

		console.log(req.body);
		if (!repoUrl || repoUrl === "") {
			return res
				.status(404)
				.json({ message: "No repository provided", status: "fail" });
		}

		// write a validation for proper url
		const id = generateUniqueID();
		const directoryPath = path.join(__dirname, `output/${id}`);

		// better way would be to set it in a persistent database

		try {
			await simpleGit().clone(repoUrl, directoryPath);
		} catch (err) {
			console.error(err);
			return res
				.status(404)
				.json({ message: "Repository not found", error: err, status: "fail" });
		}

		const files: string[] = [];
		getFilesInDirectory(directoryPath, files);

		try {
			await Promise.all(
				files.map(async (filePath) => {
					const relativePath = path.relative(__dirname, filePath);
					await uploadFile(relativePath, filePath);
				}),
			);

			await publisher.LPUSH(process.env.BUILD_QUEUE_KEY ?? "build-queue", id);

			
			await publisher.SET(getStatusKey(id), 'uploaded');

            // Will write a cron job which cleans up disk space on a regular interval from output folder

			console.log(`Pushed ID ${id} to build queue`);
		} catch (err) {
			console.error(err);
			await publisher.SET(getStatusKey(id), 'failed');
			throw err;
		}

		return res.status(200).json({
			id: id,
			message: "Successfully contents fetched from github",
			status: "success",
		});
	} catch (err) {
		return res.status(500).json({
			message: "Request failed",
			status: "fail",
		});
	}
});

// we could have listened to the database 4 times a second to get the latest status
app.get('/status', async (req, res) => {
	try {
		const id = req.query.id;
		if (!id || id === "") {
			return res
				.status(404)
				.json({ message: "No repository provided", status: "fail" });
		}

		const statusKey = (process.env.STATUS_KEY as string || 'status') + `:${id}`;
		let status;
		try {
			status = await publisher.GET(statusKey);
			if (!status || status === "") {
				return res
					.status(404)
					.json({ message: "Please check your id", status: "fail" });
			}
		} catch (err) {
			console.error(err);
			return res
					.status(404)
					.json({ message: "Please check your id", status: "fail" });
		}

		
		return res.status(200).json({
			message: "Fetched the current status",
			status: status
		})
	} catch (err) {
		return res.status(500).json({
			message: "Request failed",
			status: "fail",
		});
	}
})

const port = process.env.PORT ?? 4500;

app.listen(port, () => {
	console.log(`Listening on port ${port}`);
});
