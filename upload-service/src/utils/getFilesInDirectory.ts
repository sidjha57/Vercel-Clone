import fs from 'fs';
import path from 'path';

export function getFilesInDirectory (directory: string, files: string[]): string[] {
    try {
        const filesInTheDirectory = fs.readdirSync(directory);
        
        for (const file of filesInTheDirectory) {
            // console.log(`${directory}/${file}`);
            const fileFullPath = path.join(directory, file);
            if (fs.statSync(fileFullPath).isDirectory()) {
                getFilesInDirectory(fileFullPath, files)
            } else {
                files.push(fileFullPath)
            }
        }
    } catch (err) {
        console.error(err);
    }
    return [];
}
