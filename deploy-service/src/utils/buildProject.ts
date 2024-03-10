import { exec, spawn } from "child_process";
import path from "path";

// This is not the best way to do it, we should first containerize it and then run those commands
export function buildProject(id: string, directory: string) {
    const directoryPath = path.join(directory, `output/${id}`);
    console.log("Building project of", directoryPath);
    
    return new Promise((resolve) => {
        const child = exec(`cd ${directoryPath} && npm install && npm run build`)

        child.stdout?.on('data', function(data: string) {
            console.log('stdout: ' + data);
        });
        child.stderr?.on('data', function(data: string) {
            console.log('stderr: ' + data);
        });

        child.on('close', function(code) {
           resolve("")
        });

    })
}