package products

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"regexp"
	"strings"

	"github.com/databrokerglobal/dxc/database"
	"github.com/google/uuid"
	"github.com/labstack/echo"
)

// AddOne product
func AddOne(c echo.Context) error {
	p := new(database.Product)

	if err := c.Bind(p); err != nil {
		return err
	}

	if len(p.Name) == 0 {
		return c.String(http.StatusBadRequest, "400: name missing")
	}

	if len(p.Type) == 0 {
		return c.String(http.StatusBadRequest, "400: producttype missing")
	}

	if len(p.Host) == 0 {
		return c.String(http.StatusBadRequest, "400: host missing")
	}

	if strings.Split(p.Host, "")[len(p.Host)-1] == "/" {
		p.Host = strings.TrimSuffix(p.Host, "/")
	}

	tempuuid, err := uuid.NewRandom()
	if err != nil {
		return err
	}

	p.UUID = tempuuid.String()

	if err := database.DBInstance.CreateProduct(p); err != nil {
		return err
	}

	return c.JSON(http.StatusCreated, p)
}

// GetOne product
func GetOne(c echo.Context) error {
	uuid := c.Param("uuid")

	p, err := database.DBInstance.GetProduct(uuid)

	if err != nil {
		return c.String(http.StatusInternalServerError, "Error retrieving item from database")
	}

	if p == nil {
		return c.String(http.StatusNotFound, "Product not found")
	}

	return c.JSON(http.StatusOK, p)
}

// RedirectToHost based on product uuid path check if api or stream and subsequently redirect
func RedirectToHost(c echo.Context) error {
	slice := strings.Split(c.Request().RequestURI, "/")

	var p *database.Product

	// Check if string in path matches uuid regex, is valid uuid and matches product that is type API or STREAM
	for _, str := range slice {

		match, err := regexp.MatchString(`[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}`, str)
		if err != nil {
			return c.String(http.StatusNoContent, "")
		}

		if match {
			_, err := uuid.Parse(str)
			if err != nil {
				return c.String(http.StatusNoContent, "")
			}

			p, err = database.DBInstance.GetProduct(str)
			if err != nil {
				return c.String(http.StatusNoContent, "")
			}

			if p.Name == "" {
				return c.String(http.StatusNoContent, "")
			}

			if p == nil {
				return c.String(http.StatusNoContent, "")
			}

			if p.Type == "FILE" {
				return c.String(http.StatusNoContent, "")
			}

			if c.Request().Method == "GET" {
				// replace first encounter of product uuid
				requestURI := strings.TrimPrefix(strings.Replace(c.Request().RequestURI, p.UUID, "", 1), "/")

				requestURLSlice := []string{p.Host, requestURI}

				requestURL := strings.Join(requestURLSlice, "")

				resp, err := http.Get(requestURL)
				if err != nil {
					c.String(http.StatusGatewayTimeout, fmt.Sprintf("Upstream server response timeout: %v", err))
				}

				defer resp.Body.Close()
				body, err := ioutil.ReadAll(resp.Body)
				if err != nil {
					c.String(http.StatusInternalServerError, fmt.Sprintf("Error reading response body: %v", err))
				}

				return c.Blob(resp.StatusCode, resp.Header.Get("Content-Type"), body)
			}
		}
	}

	return c.String(http.StatusNoContent, "")
}
