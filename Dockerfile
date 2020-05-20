FROM mhart/alpine-node:12 AS ui
WORKDIR /
COPY /ui .
ARG REACT_APP_DXC_HOST
ENV REACT_APP_DXC_HOST $REACT_APP_DXC_HOST
RUN npm install --silent
RUN npm run build --silent

FROM alpine:edge as api
RUN apk update
RUN apk upgrade
RUN apk add --update go=1.13.10-r0 gcc=9.3.0-r2 g++=9.3.0-r2 linux-headers
WORKDIR /
COPY go.mod go.sum ./
RUN go mod download
COPY . .
# CGO_ENABLED=1 is required for sqlite to work
RUN CGO_ENABLED=1 GOOS=linux GOARCH=amd64 go build -o main .

FROM alpine:edge
WORKDIR /
RUN mkdir build
RUN touch dxc.db
COPY --from=ui build ./build
COPY --from=api main .
CMD ["./main"]
