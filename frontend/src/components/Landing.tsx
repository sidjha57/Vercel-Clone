import {
	CardTitle,
	CardDescription,
	CardHeader,
	CardContent,
	Card,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const BACKEND_UPLOAD_URL =
	import.meta.env.BACKEND_UPLOAD_URL || "http://localhost:9000";
const SOCKET_SERVER_URL =
	import.meta.env.SOCKET_SERVER_URL || "http://localhost:9003";
const socket = io(SOCKET_SERVER_URL);

export function Landing() {
	const [gitURL, setGitURL] = useState("");
	const [requestURL, setRequestURL] = useState("");
	const [consoleText, setConsoleText] = useState<string[]>([]); // State for console text
	const [projectID, setProjectID] = useState("");
	const [isMounted, setIsMounted] = useState(false);
	const [disableVisitWebsite, setDisableVisitWebsite] = useState(true);
  // const consoleRef = useRef(null);
	const handleUploadClick = useCallback(async () => {
		try {
			const res = await axios.post(`${BACKEND_UPLOAD_URL}/project`, {
				gitURL: gitURL,
			});
			const newRequestURL = res?.data?.data?.url;
			const projectID = res?.data?.data?.projectID;
			setRequestURL(newRequestURL);
			setProjectID(projectID);
			console.log("handleUploadClick()");
		} catch (error: unknown) {
			setConsoleText((prevText) => [
				...prevText,
				`Failed to deploy: ${error?.message}`,
			]);
		}
	}, [gitURL]);

	const handleReset = () => {
		setGitURL("");
		setRequestURL("");
		setConsoleText([]); // Clear console text
		console.log("handleReset()");
	};

  // useEffect(() => {
  //   if (consoleRef.current) {
  //     consoleRef.current.scrollTop = consoleRef.scrollHeight;
  //   }
  // }, [consoleText]);

  


	// Define a useEffect to connect the socket only once when the component mounts
	useEffect(() => {
		console.log("Socket connect()");
		socket.connect(); // Connect the socket
		return () => {
			socket.disconnect(); // Disconnect the socket when component unmounts
		};
	}, []);

	// Listen for messages
	useEffect(() => {
		console.log("Socket subscribe()");
		if (!isMounted) {
			// Set the flag to true after the first mount
			setIsMounted(true);
			return;
		}

		const handleMessage = (data: string) => {
      // Remove double quotes from the data string
      const cleanedData = data.replace(/["\n]/g, '');
        
      // Log the cleaned data
      console.log("Received message:", cleanedData);
      
      // Update consoleText with the cleaned data
      setConsoleText((prevText) => [...prevText, cleanedData])
			
			if (cleanedData === 'Done ...') {
        console.log('Enabled...')
				setDisableVisitWebsite(false);
			}
		};

		socket.emit("subscribe", `logs:${projectID}`, (error: unknown) => {
			if (error) {
				console.error("Error subscribing:", error);
			}
		});

		// Listen for messages on the 'logs' channel
		socket.on("message", handleMessage);

		// Clean up on unmount
		return () => {
			socket.off(`logs:${projectID}`, handleMessage);
		};
	}, [projectID]);

	return (
		<main className="flex flex-row min-h-screen bg-gray-50 dark:bg-gray-900 p-4 justify-center items-center">
			<div className="flex-1 flex flex-col items-center justify-center">
				{/* First Half */}
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle className="text-xl">
							Deploy your GitHub Repository
						</CardTitle>
						<CardDescription>
							Enter the URL of your GitHub repository to deploy it
						</CardDescription>
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
							<CardDescription>
								Your website is successfully deployed!
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								<Label htmlFor="deployed-url">Deployed URL</Label>
								<Input
									id="deployed-url"
									readOnly
									type="url"
									value={requestURL}
								/>
							</div>
							<br />
							<a href={requestURL} target="_blank">
								<Button
									variant="success"
									disabled={disableVisitWebsite}
									className="w-full"
								>
									Visit Website
								</Button>
							</a>
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
					<CardContent >
						<div
							className="bg-black text-white p-4 rounded-md overflow-y-scroll w-full"
							style={{ height: "500px" }}
              // ref={consoleRef}
						>
							{consoleText.reverse().map((line, index) => (
								<p key={index} className="pt-2">
									{line}
								</p>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</main>
	);
}
