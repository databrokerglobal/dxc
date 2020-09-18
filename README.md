# Data Exchange Controller

This repo is for the development of the data exchange controller (DXC) for the databroker platform. To learn more about databroker or where the DXC fits in, check the databroker docs on notion.

The data exchange controller has three parts:

- a Go API (mostly using the echo framework)
- a React UI (ui folder)
- a Truffle project for the DTX related smart contracts (truffle folder)

## How to run

### Environment variables (.env file):

- Docker

```

# DXC IP/URL for access from outside. include http/https and port. no trailing slash
DXC_HOST=http://xx.xx.xx.xx:xxxx

# DXC IP for access from ui to server. localhost does not work if you use docker. include http/https and port (that you set in docker-compose).
DXC_SERVER_HOST=http://xx.xx.xx.xx:xxxx

```

Put the .env file in the root of the directory

Run the container

```
$ docker-compose build
$ docker-compose up -d
```

Navigate to localhost:8080

- Local

```
# DXC IP/URL for access from outside. include http/https and port. no trailing slash
DXC_HOST=http://xx.xx.xx.xx:xxxx

# DXC IP for access from ui to server. localhost does not work if you use docker. include http/https and port (that you set in docker-compose).
DXC_SERVER_HOST=http://xx.xx.xx.xx:xxxx
```

### Dependencies

- golang >= 1.11 (1.14 recommended)
- node 12.6.1 LTS or higher

### Run locally

```
$ go run server.go
$ cd ui
$ npm i
$ npm start
$ navigate to localhost:3000
```

## How to build

### Cross-compilation for ARM platforms

When using a host that is not ARM based a gcc cross compiler for ARM is required to compile to various ARM platforms.

#### Ubuntu

```
# Optional recommended dependency
$ sudo apt install libc6-dev-armhf-cross

# Install the compiler
$ sudo apt install gcc-multilib-arm-linux-gnueabihf
```

#### Specifying the ARM platform env variables in build-script.sh

Example for ARMv7:

```
# For the databroker signature package
env CC=arm-linux-gnueabihf-gcc GOOS=linux GOARCH=arm GOARM=7 go build -o databroker-signature

# For the DXC
env CC=arm-linux-gnueabihf-gcc CGO_ENABLED=1 GOOS=linux GOARCH=arm GOARM=7 go build -o ${BUILD_DIR}/dxc
```

List of all env variables:

https://github.com/golang/go/wiki/GoArm

# Build the DXC

```
$ ./build-script.sh
$ cd dxc_build_dir
$ touch .env && echo "list of env vars" > .env (aka set the right env vars, see above)
$ ./dxc
$ navigate to localhost:8080
```

## How to run unit tests

```
$ ./run-tests.sh
```

### Test coverage

After running the test script an outfile is converted into a coverage.html file detailing the test coverage for each golang package in go project. This file is located in the test folder in the root of the project

