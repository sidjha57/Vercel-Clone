import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import simpleGit from "simple-git";
import path from "path";
import { generateUniqueID } from "./utils/generateUniqueID";
import { getFilesInDirectory } from "./utils/getFilesInDirectory";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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
        const directoryPath = path.join(__dirname,`output/${id}`);

        try {
            await simpleGit().clone(repoUrl, directoryPath);
        } catch (err) {
            console.error(err);
            return res
                .status(404)
                .json({ message: "Repository not found", error: err, status: "fail" });
        }

        const files: string[] = [];
        await getFilesInDirectory(directoryPath, files);
        console.log(files);
    
        return res
            .status(200)
            .json({
                id: id,
                message: "Successfully contents fetched from github",
                status: "success",
            });
    } catch (err) {
        return res
            .status(500)
            .json({
                message: "Request failed",
                status: "fail",
            });
    }
	
});

const port = process.env.PORT ?? 4500;

app.listen(port, () => {
	console.log(`Listening on port ${port}`);
});
