FROM node:16.14-alpine
RUN apk update
RUN apk --no-cache add procps
WORKDIR /app
ENV PATH="/app/out/full/node_modules/.bin:${PATH}"
COPY . .
RUN npx turbo prune --scope=discord --docker
COPY ./patches ./out/full/patches
WORKDIR /app/out/full
RUN yarn install
RUN yarn turbo run build
# RUN yarn install
# RUN yarn turbo run build --scope=discord --include-dependencies --no-deps

CMD ["pm2-docker", "node", "--", "-r", "source-map-support/register", "apps/discord/dist/main.js"]
