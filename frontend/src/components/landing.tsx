import { CardTitle, CardDescription, CardHeader, CardContent, Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import axios from "axios";

const BACKEND_UPLOAD_URL = import.meta.env.BACKEND_UPLOAD_URL || "http://localhost:9000";
export function Landing() {
  const [gitURL, setGitURL] = useState("");
  const [requestURL, setRequestURL] = useState("");
  const [consoleText, setConsoleText] = useState("Aliqua excepteur magna laboris voluptate sunt velit proident cillum fugiat dolore est in exercitation sunt.Esse elit ullamco ipsum fugiat deserunt consequat.Sit officia eiusmod magna mollit cupidatat commodo amet quis pariatur in sit excepteur.Anim quis cillum eiusmod culpa esse ipsum sunt ad veniam mollit duis Lorem.Laborum consequat Lorem adipisicing laboris ut id.Ullamco magna nulla culpa nisi exercitation reprehenderit cupidatat qui pariatur."); // State for console text

  const consoleRef = useRef(null); // Reference to the console div

  const handleUploadClick = async () => {
    try {
      const res = await axios.post(`${BACKEND_UPLOAD_URL}/project`, {
        gitURL: gitURL,
      });
      const newRequestURL = res?.data?.data?.url;
      setRequestURL(newRequestURL);
      // Add success message to console text
      setConsoleText(prevText => `${prevText}\nSuccessfully deployed! URL: ${newRequestURL}`);
    } catch (error) {
      // Add error message to console text
      setConsoleText(prevText => `${prevText}\nFailed to deploy: ${error?.message}`);
    }
  };

  const handleReset = () => {
    setGitURL("");
    setRequestURL("");
    setConsoleText(""); // Clear console text
  };

  return (
    <main className="flex flex-row min-h-screen bg-gray-50 dark:bg-gray-900 p-4 justify-center items-center">
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* First Half */}
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl">Deploy your GitHub Repository</CardTitle>
            <CardDescription>Enter the URL of your GitHub repository to deploy it</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="github-url">GitHub Repository URL</Label>
                <Input
                  onChange={(e) => setGitURL(e.target.value)}
                  value={gitURL}
                  placeholder="https://github.com/username/repo"
                />
              </div>
              <Button
                onClick={handleUploadClick}
                className="w-full"
                type="submit"
              >
                Upload
              </Button>
            </div>
          </CardContent>
        </Card>
        {requestURL && (
          <Card className="w-full max-w-md mt-8">
            <CardHeader>
              <CardTitle className="text-xl">Deployment Status</CardTitle>
              <CardDescription>Your website is successfully deployed!</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="deployed-url">Deployed URL</Label>
                <Input id="deployed-url" readOnly type="url" value={requestURL} />
              </div>
              <br />
              <Button className="w-full" variant="outline">
                <a href={requestURL} target="_blank">
                  Visit Website
                </a>
              </Button>
            </CardContent>
          </Card>
        )}
        <Button
          onClick={handleReset}
          disabled={!requestURL}
          className="mt-10"
          type="submit"
        >
          Reset
        </Button>
      </div>

      {/* Second Half */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <Card className="w-full max-w-md h-full">
          <CardHeader>
            <CardTitle className="text-xl">Console Output</CardTitle>
            <CardDescription>Output logs of your deployment</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="bg-black text-white p-4 rounded-md overflow-y-scroll h-64 w-full"
              ref={consoleRef}
            >
              {consoleText.split("\n").map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}