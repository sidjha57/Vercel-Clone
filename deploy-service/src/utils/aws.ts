import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "./awsClient";
import { promises as fsPromise } from "node:fs";
import fs from "node:fs";
import path from "path";
import { pipeline } from "stream/promises";
import Readable from "stream";

// fileName: output/lmfxr/README.md
// localFileName: /Users/sid/Coding/Development/Vercel Clone/upload-service/src/output/lmfxr/README.md
export const uploadFile = async (fileName: string, localFilePath: string) => {
	console.log("Uploading file");
	const fileContent = await fsPromise.readFile(localFilePath); // Specify encoding if needed

	const upload = await s3.putObject({
		Body: fileContent,
		Bucket: "vercel",
		Key: fileName,
	});

	// console.log(upload);
	console.log("Uploaded file: " + fileName);
};

// prefix: output/lmfxr
export const downloadFromS3 = async (
	prefix: string,
	localDirectory: string,
) => {
	console.log("Downloading");
	try {
		// List all objects in the bucket with the specified prefix
		const listObjectsParams = { Bucket: "vercel", Prefix: prefix };
		const objectsResponse = await s3.listObjects(listObjectsParams);
		const objects = objectsResponse.Contents;

		// console.log(objects);

		if (!objects) {
			return;
		}

		// Fatest way to do it but files can be much larger and cannot be stored in memory
		// Download all objects in parallel
		const downloadPromises = objects.map(async (object) => {
			const getObjectParams = {
				Bucket: "vercel",
				Key: object.Key as string,
			};

			const command = new GetObjectCommand(getObjectParams);
			const data = await s3.send(command);

			if (data?.Body) {
				const inputStream = await data.Body.transformToByteArray();
				const localFilePath = path.join(localDirectory, object.Key as string);

				// Accumulate data in memory
				return { filePath: localFilePath, data: Buffer.from(inputStream) };
			}
		});

		const fileData = await Promise.all(downloadPromises);

		// Write all files in a single operation
		await Promise.all(
			fileData.map(async (fileInfo) => {
				if (fileInfo && fileInfo.filePath && fileInfo.data) {
					const { filePath, data } = fileInfo;
					if (!fs.existsSync(filePath)) {
						await fsPromise.mkdir(path.dirname(filePath), { recursive: true });
					}
					await fsPromise.writeFile(filePath, data);
				}
			}),
		);

		// A bit slow but works for large files as well (this needs to be fixed in the future)
		// Download all objects in parallel
		// const downloadPromises = objects.map(async (object) => {
		// 	const getObjectParams = {
		// 		Bucket: "vercel",
		// 		Key: object.Key as string,
		// 	};

		// 	const command = new GetObjectCommand(getObjectParams);

		// 	// Use a writable stream to directly write to the file
		// 	const localFilePath = path.join(localDirectory, object.Key as string);
		// 	const outputStream = fs.createWriteStream(localFilePath);
		// 	if (!fs.existsSync(localFilePath)) {
		// 		await fsPromise.mkdir(path.dirname(localFilePath), { recursive: true });
		// 	}
		// 	try {
		// 		const data = await s3.send(command);

		// 		if (data?.Body) {
		// 			const inputStream = await data.Body.transformToByteArray();
		// 			// Use stream pipeline for handling large files
					
		// 			await new Promise<void>((resolve, reject) => {
		// 				pipeline(Readable.from(inputStream), outputStream, (err?: Error | null) => {
		// 					if (err) {
		// 						reject(err);
		// 					} else {
		// 						resolve();
		// 					}
		// 				});
		// 			});
		// 		}
		// 	} catch (error) {
		// 		console.error(`Error downloading object '${object.Key}':`, error);
		// 	} finally {
		// 		outputStream.close(); // Ensure the stream is closed
		// 	}
		// });

		// await Promise.all(downloadPromises);

		// console.log(respose);

		console.log("Downloaded");
	} catch (error) {
		console.error("Error downloading objects:", error);
	}
};

export const deleteAllDirectories = async (bucketName: string) => {
	try {
		// List all objects in the bucket
		const listObjectsParams = { Bucket: bucketName };
		const objectsResponse = await s3.listObjects(listObjectsParams);
		const objects = objectsResponse.Contents;

		if (!objects) {
			return;
		}

		// Extract directory names from object keys
		const directories = new Set<string>();
		for (const object of objects) {
			const keyParts = object.Key?.split("/");
			if (keyParts && keyParts.length > 1) {
				directories.add(keyParts[0]);
			}
		}

		// Delete objects within each directory
		const deletePromises = Array.from(directories).map(async (directory) => {
			const objectsToDelete = objects
				.filter((object) => object.Key?.startsWith(`${directory}/`))
				.map((object) => ({ Key: object.Key as string }));

			if (objectsToDelete && objectsToDelete.length > 0) {
				const deleteObjectsParams = {
					Bucket: bucketName,
					Delete: { Objects: objectsToDelete },
				};
				await s3.deleteObjects(deleteObjectsParams);
				console.log(`Deleted objects in directory: ${directory}`);
			}
		});

		await Promise.all(deletePromises);
	} catch (error) {
		console.error("Error deleting directories:", error);
	}
};
