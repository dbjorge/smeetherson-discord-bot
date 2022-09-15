FROM node:16 AS build

RUN mkdir -p /usr/src/bot
WORKDIR /usr/src/bot

COPY package.json yarn.lock .
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

FROM node:16 AS bot
# ffmpeg required at runtime for connecting to voice channels
RUN apt-get update && apt-get install -y \
  ffmpeg \
  && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /usr/src/bot
WORKDIR /usr/src/bot

COPY package.json yarn.lock .
RUN yarn install --frozen-lockfile --production
COPY --from=build /usr/src/bot/dist ./dist

# health check server
EXPOSE 8080
CMD ["yarn", "start"]