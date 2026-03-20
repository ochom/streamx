# syntax=docker/dockerfile:1

##
## Build
##
FROM oven/bun:latest AS build

WORKDIR /app

COPY ./api .

RUN bun install

EXPOSE 8080

CMD [ "bun", "start" ]
