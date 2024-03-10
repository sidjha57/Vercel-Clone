import { s3 } from "./awsClient";
import { promises as fsPromise } from "node:fs";


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
