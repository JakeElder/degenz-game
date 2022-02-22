FROM node:16.14-alpine AS builder
RUN apk update
RUN apk --no-cache add procps
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=discord --docker

# Add lockfile and package.json's of isolated subworkspace
FROM node:16.14-alpine AS installer
RUN apk update
WORKDIR /app
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
COPY patches ./patches
RUN yarn install

FROM node:16.14-alpine AS sourcer
RUN apk update
WORKDIR /app
COPY --from=installer /app/ .
COPY --from=builder /app/out/full .
COPY .gitignore .gitignore
RUN yarn turbo run build --scope=discord --include-dependencies --no-deps

CMD ["./node_modules/.bin/pm2-docker", "node", "--", "-r", "source-map-support/register", "apps/discord/dist/main.js"]
