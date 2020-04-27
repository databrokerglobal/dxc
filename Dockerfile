FROM mhart/alpine-node:12 AS ui
WORKDIR /
COPY /ui .
RUN npm install --silent
RUN npm run build

FROM golang:latest
WORKDIR /
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN rm -rf ui
RUN mkdir build
COPY --from=ui build ./build
RUN go build -o main .
CMD ["./main"]

