package products

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/databrokerglobal/dxc/database"

	"github.com/databrokerglobal/dxc/filemanager"
	"github.com/fatih/color"
)

// ExecuteStatusTicker execute 10 min interval ticker
func ExecuteStatusTicker() {
	ticker := time.NewTicker(10 * time.Minute)

	color.Blue("\nPreparing status request to the DXS...")

	for range ticker.C {
		var wg sync.WaitGroup
		wg.Add(1)

		go func() {
			doChecks()
			wg.Done()
		}()

		wg.Wait()

		go func() {
			sendStatus()
		}()
	}
}

func doChecks() {
	var wg sync.WaitGroup
	wg.Add(1)

	go func() {
		filemanager.CheckingFiles()
		wg.Done()
	}()

	wg.Wait()

	wg.Add(1)

	go func() {
		CheckHost()
		wg.Done()
	}()

	wg.Wait()

	defer color.Magenta("Finished checking product files and hosts...")
}

func sendStatus() {
	products, err := database.DBInstance.GetProducts()
	if err != nil {
		log.Fatal("Database error: ", err)
	}

	var productsArray []map[string]string

	for _, product := range *products {
		if product.Did != "" {
			productObject := make(map[string]string)
			productObject["did"] = product.Did
			productObject["status"] = product.Status
			productsArray = append(productsArray, productObject)
		}
	}

	challenge, err := database.DBInstance.GetCurrentChallenge()
	if err != nil {
		log.Fatal("Database error: ", err)
	}

	body := make(map[string]interface{})

	body["challenge"] = challenge.Challenge
	body["products"] = productsArray

	jsonBody, err := json.Marshal(body)
	fmt.Println(string(jsonBody))
	if err != nil {
		log.Fatal("JSON encoding error: ", err)
	}

	dxsURL := os.Getenv("DXS_HOST")

	client := &http.Client{}
	req, err := http.NewRequest("POST", fmt.Sprintf("%s/dxc", TrimLastSlash(dxsURL)), bytes.NewBuffer(jsonBody))
	req.SetBasicAuth("0x2f112ad225E011f067b2E456532918E6D679F978", "cb6075edfcdc003565bc7a6c")
	resp, err := client.Do(req)

	if err != nil {
		color.Red("Error sending status request to the DXS host (%s): %v", dxsURL, err)
	} else {
		color.Green("Successfully sent status to the DXS host (%s): %v", dxsURL, *resp)
	}
}
