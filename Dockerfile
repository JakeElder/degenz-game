FROM node:16.14-alpine
RUN apk update
RUN apk --no-cache add procps
WORKDIR /app
COPY . .
ENV PATH="/app/out/node_modules/.bin:${PATH}"
RUN npx turbo prune --scope=discord 
RUN cp -r ./patches ./out/patches \
    && cp ./out/packages/config/src/config.example.ts ./out/packages/config/src/config.ts
WORKDIR /app/out
RUN yarn install
RUN yarn turbo run build

CMD ["pm2-docker", "node", "--", "-r", "source-map-support/register", "apps/discord/src/main.js"]
