#! /bin/bash

 go test ./... --coverprofile outfile  &&
 go tool cover -html=outfile -o ./test/coverage.html &&
 rm outfile