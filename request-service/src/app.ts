import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initializeRedisClient } from "./utils/redisInitializer";
import { s3 } from "./utils/awsClient";

dotenv.config();

initializeRedisClient();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/*", async (req, res) => {
	try {
		const host = req.hostname;
		console.log(host);
		const id = host.split(".")[0];
		const filePath = req.path;

		console.log(filePath);
		console.log(id);
		console.log(`build/${id}${filePath}`);

		const { Body } = await s3.getObject({
			Bucket: "vercel",
			Key: `build/${id}${filePath}`,
		});

		let type;
		// using mimetype would be a better solution here
		if (filePath.endsWith("html")) {
			type = "text/html";
		} else if (filePath.endsWith("css")) {
			type = "text/css";
		} else if (filePath.endsWith("js")) {
			type = "application/javascript";
		} else if (
			filePath.endsWith("jpg") ||
			filePath.endsWith("jpeg") ||
			filePath.endsWith("png") ||
			filePath.endsWith("gif") ||
			filePath.endsWith("bmp") ||
			filePath.endsWith("webp")
		) {
			type = "image/*";
		} else {
			type = "application/octet-stream"; // Default to binary if type is unknown
		}

		res.setHeader("Content-Type", type);
		// this should be streamed we could use reverse proxy here instead
		let data: any = Body;
		if (type === "image/*") {
			console.log("Sending Image");
			return res.send(data);
		}
		data = await Body?.transformToString();

		// console.log(str);
		return res.send(data); // Convert the Buffer to string and send as response
	} catch (err: any) {
		console.error(err);
		if (err.code === "NoSuchKey") {
			return res.status(404).json({
				message: "File not found",
				status: "fail",
			});
		}

		// Handle other errors gracefully
		return res.status(500).json({
			message: "Request failed",
			status: "fail",
			error: err.message, // Add the error message for debugging
		});
	}
});

const port = process.env.PORT ?? 4300;

app.listen(port, () => {
	console.log(`Listening on port ${port}`);
});
