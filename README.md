## Replication of Vercel's Technology Documentation

<img width="1512" alt="Screenshot 2024-04-21 at 11 30 59 AM" src="https://github.com/sidjha57/my-vercel/assets/62923020/55cccb4c-4d25-4754-b5a8-4241e7f6483e">

### Key Features:

1. **Scalable and High-Performance Design**: Utilizing a Micro-service Architecture.
2. **Rapid Deployment**: Easily scalable in parallel.
3. **Reverse Proxy**: Efficiently retrieves deployed resources.
4. **Container Log Collection**: Seamless collection from Docker containers.

### Starting the Application:

1. **Setup Infrastructure**:
   - Create S3 bucket, ECR, EWS instance, and Aiven Redis instance.

2. **Build and Deploy Services**:
   - Build the `build-service` and deploy on ECR, following these steps for other services:
     - Run `npm install`.
     - Execute `npm build`.
     - Follow Docker build and upload steps for ECR.

3. **Create ECS Task**:
   - Establish a task on ECS to execute the `build-service`.

4. **Run Frontend Application**:
   - Launch the frontend application and provide a GitHub repository link.

https://www.youtube.com/redirect?event=video_description&redir_token=QUFFLUhqa3g3cmtZcERBTWg2d3gzTS1ma1dvTElicWs3QXxBQ3Jtc0ttb1FmUkh1S0NwazQ1SmhYcXN5TTAzVFF6WGNraktQN0FYWFJSNjF6WXphZ2VXMDB5OGNJS3NldjItMzlTeXc2RjBvMVM5RGFBVjhycmV4WUFELS1DZk84UFgwN3dVOWw3OEhiSTNyRE9HTklBdmRycw&q=http%3A%2F%2Fadf.ly%2F9208454%2Fneed-for-speed-most-wanted-2005&v=Mn061jXkJnI
