# syntax=docker/dockerfile:1

##
## Build
##
FROM oven/bun:latest AS build

WORKDIR /app

COPY . .

RUN bun install && \
    bun run build

FROM oven/bun:latest AS runner

WORKDIR /app

COPY --from=build /app/dist ./

EXPOSE 8080

CMD [ "bun", "index.js" ]
