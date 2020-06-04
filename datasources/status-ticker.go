package datasources

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/databrokerglobal/dxc/database"

	"github.com/fatih/color"
)

// DXCObject to make the json object for posting the /dxc
type DXCObject struct {
	Challenge   string          `json:"challenge"`
	Address     string          `json:"address"`
	Host        string          `json:"host"`
	Port        string          `json:"port"`
	Datasources []DXCDatasource `json:"datasources"`
}

// DXCDatasource struct to make a json of the datasources in DXCObject
type DXCDatasource struct {
	Name      string `json:"name"`
	DID       string `json:"did"`
	Type      string `json:"type"`
	Available bool   `json:"available"`
}

// DXSAPIKey object allows to decode the api key and get the dxs host
type DXSAPIKey struct {
	Key  string `json:"k"`
	Host string `json:"h"`
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

	wg.Add(1)

	go func() {
		CheckHost()
		wg.Done()
	}()

	wg.Wait()

	defer color.Magenta("Finished checking datasources.")
}

// SendStatus sends the dxc status and datasources to the DXS
func SendStatus() {
	datasources, err := database.DBInstance.GetDatasources()
	if err != nil {
		color.Red("Error sending status request because of error getting datasources from db. err: ", err)
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
		Host:      os.Getenv("DXC_HOST"),
		Port:      "8080",
	}

	bodyRequest.Datasources = make([]DXCDatasource, 0)

	for _, datasource := range *datasources {
		if datasource.Did != "" {

			dxcDatasource := DXCDatasource{
				DID:       datasource.Did,
				Available: datasource.Available,
				Name:      datasource.Name,
				Type:      datasource.Type,
			}

			bodyRequest.Datasources = append(bodyRequest.Datasources, dxcDatasource)
		}
	}

	bodyRequestJSON, err := json.Marshal(bodyRequest)
	if err != nil {
		color.Red("Error marshalling DXCObject json. err: ", err)
		return
	}

	// get dxs url from api key
	dxsAPIKeyB64 := userAuth.APIKey
	dxsAPIKeyData, err := base64.StdEncoding.DecodeString(dxsAPIKeyB64)
	if err != nil {
		color.Red("Error decoding api key. err: ", err.Error())
		return
	}
	dxsAPIKey := DXSAPIKey{}
	json.Unmarshal(dxsAPIKeyData, &dxsAPIKey)

	dxsURL := dxsAPIKey.Host

	client := &http.Client{}
	req, err := http.NewRequest("POST", fmt.Sprintf("%s/dxc", trimLastSlash(dxsURL)), bytes.NewBuffer(bodyRequestJSON))
	req.SetBasicAuth(userAuth.Address, userAuth.APIKey)
	resp, err := client.Do(req)

	if err != nil {
		color.Red("Error sending status request to the DXS host (%s): %v", dxsURL, err)
	} else {
		color.Green("Successfully sent status to the DXS host (%s): %v", dxsURL, *resp)
	}
}
