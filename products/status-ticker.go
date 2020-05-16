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
			SendStatus()
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

// SendStatus sends the dxc status and products to the DXS
func SendStatus() {
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

	userAuth, err := database.DBInstance.GetLatestUserAuth()
	if err != nil {
		color.Red("Error sending status request because of error getting user auth. err: ", err)
	}
	if userAuth == nil {
		color.Red("Error sending status request because no user auth data in exist in db")
	}

	client := &http.Client{}
	req, err := http.NewRequest("POST", fmt.Sprintf("%s/dxc", TrimLastSlash(dxsURL)), bytes.NewBuffer(jsonBody))
	req.SetBasicAuth(userAuth.Address, userAuth.APIKey)
	resp, err := client.Do(req)

	if err != nil {
		color.Red("Error sending status request to the DXS host (%s): %v", dxsURL, err)
	} else {
		color.Green("Successfully sent status to the DXS host (%s): %v", dxsURL, *resp)
	}
}
