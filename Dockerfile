FROM node:16 AS build

# ffmpeg required for connecting to voice channels
RUN apt-get update && apt-get install -y \
  ffmpeg \
  && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /usr/src/bot
WORKDIR /usr/src/bot

COPY package.json yarn.lock /usr/src/bot
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

CMD ["yarn", "start"]