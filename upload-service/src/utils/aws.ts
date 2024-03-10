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

	console.log(upload);
	console.log("Uploaded file: " + fileName);
};
