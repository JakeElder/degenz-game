FROM node:16.14-alpine
RUN apk update
RUN apk --no-cache add procps
WORKDIR /app
ENV PATH="/app/out/full/node_modules/.bin:${PATH}"
COPY . .
RUN npx turbo prune --scope=discord --docker
RUN cp -r ./patches ./out/full/patches
WORKDIR /app/out/full
RUN cp ./packages/config/src/config.example.ts ./packages/config/src/config.ts
RUN yarn install
RUN yarn turbo run build

CMD ["pm2-docker", "node", "--", "-r", "source-map-support/register", "apps/discord/dist/main.js"]
