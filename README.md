# Data Exchange Controller

This repo is for the development of the data exchange controller (DXC) for the databroker platform. To learn more about databroker or where the DXC fits in, check the databroker docs on notion.

The data exchange controller has three parts:

- a Go API (mostly using the echo framework)
- a React UI (ui folder)
- a Truffle project for the DTX related smart contracts (ethereum folder)

## How to run

### Environment variables (.env file):

- Docker

```
# Runtime env
## local = not dockerized
## docker = docker
GO_ENV=docker

# File directory
LOCAL_FILES_DIR=/path/to/files
```

Run the container

```
$ docker-compose build
$ docker-compose up -d
```

Navigate to localhost:8080

- Local

```
# Runtime env
## local = no docker
## docker = docker

GO_ENV=local

# File directory
LOCAL_FILES_DIR=/path/to/files
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

```
$ ./build-script.sh
$ cd dxc_build_dir
$ ./dxc
$ navigate to localhost:1323
```

## How to run unit tests

```
$ ./run-tests.sh
```

### Test coverage

After running the test script an outfile is converted into a coverage.html file detailing the test coverage for each golang package in go project. This file is located in the test folder in the root of the project

## To Do

- [x] Upload file and make it match with file in volume

- [x] Nice error handling when file doesn't match

- [x] Store the upload event in db

- [x] Unit test the crap out of it

- [x] Add/Get products

- [x] Request redirect to Host API (GET)

- [x] Request redirect to Host API (POST)

- [x] More clever file checker, files can be restored

- [x] Fully functional U
- [ ] Dynamic build script for different architectures
- [ ] Authentication
- [ ] Smart contracts
- [ ] Support for streaming protocols
- [ ] Docker update
- [ ] Download file button in UI
- [ ] Delete file / product button in UI
