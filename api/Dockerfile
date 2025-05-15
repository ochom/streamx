# syntax=docker/dockerfile:1

##
## Build
##
FROM golang:1.22-alpine  AS build

WORKDIR /app

COPY go.* ./
COPY go.sum ./

RUN go mod tidy

COPY . ./

RUN go build -o /server



##
## Deploy
##
FROM busybox:1.35.0-uclibc AS deploy 

WORKDIR /

COPY --from=build /server .

EXPOSE 8080

CMD ["/server"]
