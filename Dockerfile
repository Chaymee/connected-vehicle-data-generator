# https://snyk.io/blog/choosing-the-best-node-js-docker-image/
FROM node:16.17.0-bullseye-slim

# https://techoverflow.net/2021/01/13/how-to-use-apt-install-correctly-in-your-dockerfile/
# wget for https://github.com/Eficode/wait-for
ENV DEBIAN_FRONTEND=noninteractive
RUN apt update && apt install -y wget && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app
COPY . /usr/src/app
RUN npm install
CMD "node" "app.js"