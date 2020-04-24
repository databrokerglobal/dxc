FROM mhart/alpine-node:12
WORKDIR /
COPY /ui/package.json ./
COPY /ui/package-lock.json ./
RUN npm install --silent
CMD ["npm", "run", "build"]
COPY /ui/build/ ./

FROM golang:latest
WORKDIR /
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o main .
CMD ["./main"]

