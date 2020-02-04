#! /bin/bash

 go test ./... --coverprofile outfile  &&
 go tool cover -html=outfile -o cover.html &&
 rm outfile