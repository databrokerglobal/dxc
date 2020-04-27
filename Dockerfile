FROM mhart/alpine-node:12 AS ui
WORKDIR /
COPY /ui .
RUN npm install --silent
RUN npm run build --silent

FROM alpine:edge as api
RUN apk update
RUN apk upgrade
RUN apk add --update go=1.13.10-r0 gcc=9.3.0-r1 g++=9.3.0-r1 linux-headers
WORKDIR /
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=1 GOOS=linux GOARCH=amd64 go build -o main .

FROM alpine:edge
WORKDIR /
RUN mkdir build
RUN touch dxc.db
COPY --from=ui build ./build
COPY --from=api main .
CMD ["./main"]
