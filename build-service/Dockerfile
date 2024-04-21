FROM node:20-alpine

RUN apk add git

WORKDIR /app

EXPOSE 22

COPY main.sh main.sh
COPY dist/index.js script.js
COPY package*.json ./

RUN npm install && \
    chmod +x main.sh

ENTRYPOINT [ "/app/main.sh" ]
