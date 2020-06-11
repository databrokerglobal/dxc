package usermanager

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/fatih/color"
	"github.com/labstack/echo/v4"
	"github.com/pkg/errors"

	"github.com/databrokerglobal/dxc/database"
	"github.com/databrokerglobal/dxc/datasources"
	"github.com/databrokerglobal/dxc/ethereum"
	"github.com/databrokerglobal/dxc/utils"
)

// DXSAPIKey object allows to decode the api key and get the dxs host
type DXSAPIKey struct {
	Key  string `json:"k"`
	Host string `json:"h"`
}

// SaveUserAuth to save the address and api key
// Create godoc
// @Summary Save auth info
// @Description Save address and api key for authentication with DXS
// @Tags user
// @Param address query string true "Address"
// @Param apiKey query string true "API Key"
// @Success 200 {string} string true
// @Failure 500 {string} string "Error saving auth info"
// @Router /user/authinfo [post]
func SaveUserAuth(c echo.Context) error {

	address := c.QueryParam("address")
	apiKey := c.QueryParam("apiKey")

	if address == "" || apiKey == "" {
		return c.String(http.StatusBadRequest, "address and api key cannot be empty")
	}

	err := database.DBInstance.SaveNewUserAuth(address, apiKey)
	if err != nil {
		return c.String(http.StatusInternalServerError, errors.Wrap(err, "error saving user auth").Error())
	}

	datasources.SendStatus()

	getInfuraIDAndServeContract(address, apiKey)

	return c.JSON(http.StatusAccepted, "success saving the data")
}

// GetUserAuth to get the address and api key
// Create godoc
// @Summary Get auth info
// @Description Get address and api key for authentication with DXS
// @Tags user
// @Produce json
// @Success 200 {object} database.UserAuth true
// @Failure 404 {string} string "Not data found"
// @Failure 500 {string} string "Error getting auth info"
// @Router /user/authinfo [get]
func GetUserAuth(c echo.Context) error {

	userAuth, err := database.DBInstance.GetLatestUserAuth()
	if err != nil {
		return c.String(http.StatusInternalServerError, errors.Wrap(err, "error getting user auth").Error())
	}
	if userAuth == nil {
		return c.String(http.StatusNotFound, "no user auth data in exist in db")
	}

	return c.JSON(http.StatusOK, userAuth)
}

func getInfuraIDAndServeContract(address string, apiKey string) {
	// get dxs url from api key
	dxsAPIKeyData, err := base64.StdEncoding.DecodeString(apiKey)
	if err != nil {
		color.Red("Error decoding api key. err: ", err.Error())
	} else {
		dxsAPIKey := DXSAPIKey{}
		json.Unmarshal(dxsAPIKeyData, &dxsAPIKey)

		dxsURL := dxsAPIKey.Host

		client := &http.Client{}
		req, _ := http.NewRequest("GET", fmt.Sprintf("%s/infura/getID", utils.TrimLastSlash(dxsURL)), nil)
		req.SetBasicAuth(address, apiKey)
		resp, err := client.Do(req)

		if err == nil && resp.StatusCode == 200 {
			bodyBytes, err := ioutil.ReadAll(resp.Body)
			if err != nil {
				color.Red("Error reading response body. err: ", err.Error())
			} else {
				infuraID := string(bodyBytes)

				err = database.DBInstance.CreateInfuraID(infuraID)
				if err != nil {
					color.Red("Error saving infura ID. err: ", err.Error())
				} else {
					go ethereum.ServeContract()
				}
			}
		}
	}
}
