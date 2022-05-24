FROM node:16.14-alpine
RUN apk update
RUN apk --no-cache add procps

WORKDIR /app
COPY package.json .
RUN yarn install

COPY . .
RUN yarn build

FROM nginx:1.21.6
COPY --from=0 /app/build/ /usr/share/nginx/html
