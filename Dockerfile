FROM alpine:edge
RUN apk update
RUN apk upgrade
RUN apk add --update go=1.13.10-r0 gcc=9.3.0-r2 g++=9.3.0-r2 linux-headers
WORKDIR /
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN touch dxc.db
# CGO_ENABLED=1 is required for sqlite to work
RUN CGO_ENABLED=1 GOOS=linux GOARCH=amd64 go build -o main .
CMD ["./main"]