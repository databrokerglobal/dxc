# DXC API

## Architecture MVP #1

<img style="float: center;" src="./public/assets/dxc-architecture.svg">

## How to run unit tests

```
$ go test -v -race ./...
```

## How to run

### Docker

Environment var:

```
# Runtime env
## local = not dockerized
## docker = docker
GO_ENV=docker

# File directories
LOCAL_FILES_DIR=/path/to/files
```

Run

```
$ docker-compose build
$ docker-compose up -d
```

Navigate to localhost:8080

### Local

Environment var:

```
# Runtime env
## local = no docker
## docker = docker
GO_ENV=local

# File directories
LOCAL_FILES_DIR=/path/to/files
```

Run

```
$ go build && ./dxc
```

Navigate to localhost:1323

## To Do

### File stuff

- [x] Upload file and make it match with file in volume
- [x] Nice error handling when file doesn't match
- [x] Store the upload event in db
- [x] Unit test the crap out of it
- [x] Add/Get products
- [x] Request redirect to Host API (GET)
- [x] Request redirect to Host API (POST)
- [x] More clever file checker, files can be restored
- [ ] Fully functional UI
