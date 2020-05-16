package usermanager

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/pkg/errors"

	"github.com/databrokerglobal/dxc/database"
	"github.com/databrokerglobal/dxc/products"
)

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

	products.SendStatus()

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
