# https://snyk.io/blog/choosing-the-best-node-js-docker-image/
FROM node:16.17.0-bullseye-slim
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN npm install
CMD "node" "app.js"