# https://snyk.io/blog/choosing-the-best-node-js-docker-image/
FROM node:16.17.0-bullseye-slim

WORKDIR /app
COPY . /app
RUN npm install
CMD "node" "app.js"