FROM arm32v7/golang:1.14-alpine AS builder

RUN apk update && apk add --no-cache git gcc=10.2.1_pre1-r3 g++=10.2.1_pre1-r3 linux-headers

WORKDIR $GOPATH/src/github.com/databrokerglobal/dxc/
COPY . .

RUN go get -d -v

RUN CGO_ENABLED=1 GOOS=linux GOARCH=arm GOARM=7 go build -ldflags="-w -s" -o /go/bin/dxc


FROM arm32v7/golang:1.14-alpine

COPY --from=builder /go/bin/dxc /go/bin/dxc

ENTRYPOINT ["/go/bin/dxc"]