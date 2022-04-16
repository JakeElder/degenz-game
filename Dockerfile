FROM node:16.14-alpine
RUN apk update
RUN apk --no-cache add procps
WORKDIR /app
COPY . .
RUN cp ./packages/config/src/config.example.ts ./packages/config/src/config.ts
RUN yarn install
ENV PATH="/app/node_modules/.bin:${PATH}"

CMD ["pm2-docker", "ts-node", "--", "apps/discord/src/main.ts"]
