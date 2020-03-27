package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"strings"
)

func main() {
	data, err := ioutil.ReadFile(os.Args[1])
	if err != nil {
		log.Fatal(err)
	}

	var artifact map[string]interface{}

	if err := json.Unmarshal(data, &artifact); err != nil {
		log.Fatal(err)
	}

	jsonAbi, err := json.Marshal(artifact["abi"])
	if err != nil {
		log.Fatal(err)
	}

	if err := ioutil.WriteFile(strings.ToLower(fmt.Sprintf("../abi/%s.abi", artifact["contractName"])), jsonAbi, 0644); err != nil {
		log.Fatal(err)
	}
}
