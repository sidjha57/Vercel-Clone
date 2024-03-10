import { uploadFile } from "./aws";
import path from "path";

export const uploadAllFiles = async (files: string[]): Promise<void> => {
  try {
    const uploadPromises: Promise<void>[] = files.map(async (filePath) => {
      const relativePath = path.relative(__dirname, filePath);
      await uploadFile(relativePath, filePath);
    });

    await Promise.all(uploadPromises);
    console.log("All files uploaded successfully");
  } catch (error: any) {

    console.error("Error uploading files:", error.message);
    throw new Error(error)
    // Log additional information from the error object if needed (e.g., error.code)
  }
};
