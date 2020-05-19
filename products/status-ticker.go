package products

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/databrokerglobal/dxc/database"

	"github.com/databrokerglobal/dxc/filemanager"
	"github.com/fatih/color"
)

// DXCObject to make the json object for posting the /dxc
type DXCObject struct {
	Challenge string       `json:"challenge"`
	Address   string       `json:"address"`
	Host      string       `json:"host"`
	Port      string       `json:"port"`
	Products  []DXCProduct `json:"products"`
}

// DXCProduct struct to make a json of the products in DXCObject
type DXCProduct struct {
	Name   string    `json:"name"`
	DID    string    `json:"did"`
	Type   string    `json:"type"`
	Status string    `json:"status"`
	Files  []DXCFile `json:"files"`
}

// DXCFile struct to make a json of the files in DXCProduct
type DXCFile struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

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
		color.Red("Error sending status request because of error getting products from db. err: ", err)
		return
	}

	challenge, err := database.DBInstance.GetCurrentChallenge()
	if err != nil {
		color.Red("Error sending status request because of error getting current challenge. err: ", err)
		return
	}

	userAuth, err := database.DBInstance.GetLatestUserAuth()
	if err != nil {
		color.Red("Error sending status request because of error getting user auth. err: ", err)
		return
	}
	if userAuth == nil {
		color.Red("Error sending status request because no user auth data exist in db")
		return
	}

	bodyRequest := &DXCObject{
		Challenge: challenge.Challenge,
		Address:   userAuth.Address,
		Host:      os.Getenv("REACT_APP_DXC_HOST"),
		Port:      "8080",
	}

	bodyRequest.Products = make([]DXCProduct, 0)

	for _, product := range *products {
		if product.Did != "" && product.Type == "FILE" && len(product.Files) > 0 {

			dxcProduct := DXCProduct{
				DID:    product.Did,
				Status: product.Status,
				Name:   product.Name,
				Type:   product.Type,
			}

			dxcProduct.Files = make([]DXCFile, 0)

			for _, file := range product.Files {
				dxcFile := DXCFile{
					ID:   fmt.Sprint(file.ID),
					Name: file.Name,
				}
				dxcProduct.Files = append(dxcProduct.Files, dxcFile)
			}

			bodyRequest.Products = append(bodyRequest.Products, dxcProduct)
		}
	}

	bodyRequestJSON, err := json.Marshal(bodyRequest)
	if err != nil {
		color.Red("Error marshalling DXCObject json. err: ", err)
		return
	}

	dxsURL := os.Getenv("DXS_HOST")

	client := &http.Client{}
	req, err := http.NewRequest("POST", fmt.Sprintf("%s/dxc", TrimLastSlash(dxsURL)), bytes.NewBuffer(bodyRequestJSON))
	req.SetBasicAuth(userAuth.Address, userAuth.APIKey)
	resp, err := client.Do(req)

	if err != nil {
		color.Red("Error sending status request to the DXS host (%s): %v", dxsURL, err)
	} else {
		color.Green("Successfully sent status to the DXS host (%s): %v", dxsURL, *resp)
	}
}
