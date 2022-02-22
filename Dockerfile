FROM node:16.14-alpine AS base
RUN apk update
RUN apk --no-cache add procps
WORKDIR /app
ENV PATH="/app/node_modules/.bin:${PATH}"

FROM base AS builder
RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=discord --docker

FROM base AS installer
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
COPY patches ./patches
RUN yarn install

FROM base AS sourcer
COPY --from=installer /app/ .
COPY --from=builder /app/out/full .
COPY .gitignore .gitignore
RUN yarn turbo run build --scope=discord --include-dependencies --no-deps

CMD ["pm2-docker", "node", "--", "-r", "source-map-support/register", "apps/discord/dist/main.js"]
