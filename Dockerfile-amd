FROM golang:alpine AS builder

RUN apk update && apk add --no-cache git gcc=9.3.0-r2 g++=9.3.0-r2 linux-headers

WORKDIR $GOPATH/src/github.com/databrokerglobal/dxc/
COPY . .

RUN go get -d -v

RUN CGO_ENABLED=1 GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o /go/bin/dxc


FROM golang:alpine

COPY --from=builder /go/bin/dxc /go/bin/dxc

ENTRYPOINT ["/go/bin/dxc"]