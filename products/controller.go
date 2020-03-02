package products

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"regexp"
	"strings"

	"github.com/databrokerglobal/dxc/database"
	"github.com/google/uuid"
	"github.com/labstack/echo"
)

func trimLastSlash(host string) (h string) {
	h = host
	for strings.Split(h, "")[len(h)-1] == "/" {
		h = strings.TrimSuffix(h, "/")
	}
	return h
}

// AddOne product
func AddOne(c echo.Context) error {
	p := new(database.Product)

	if err := c.Bind(p); err != nil {
		return err
	}

	if status := checkProduct(p); status == http.StatusBadRequest {
		return c.String(http.StatusBadRequest, "")
	}

	newHost := trimLastSlash(p.Host)
	p.Host = newHost

	tempuuid, err := uuid.NewRandom()
	if err != nil {
		return err
	}

	p.UUID = tempuuid.String()

	var omit bool

	if len(os.Args) > 1 && os.Args[1][:5] == "-test" {
		omit = true
	}

	if !omit {
		if err := database.DBInstance.CreateProduct(p); err != nil {
			return err
		}
	}

	return c.JSON(http.StatusCreated, p)
}

// GetAll return all products
func GetAll(c echo.Context) error {
	var ps *[]database.Product

	ps, err := database.DBInstance.GetProducts()

	if err != nil {
		return c.String(http.StatusInternalServerError, "Error retrieving item from database")
	}

	return c.JSON(http.StatusOK, ps)
}

// GetOne product
func GetOne(c echo.Context) error {
	uuid := c.Param("uuid")

	var omit bool

	if len(os.Args) > 1 && os.Args[1][:5] == "-test" {
		omit = true
	}

	var err error

	var p *database.Product

	if !omit {
		p, err = database.DBInstance.GetProduct(uuid)
	}

	if err != nil {
		return c.String(http.StatusInternalServerError, "Error retrieving item from database")
	}

	if p == nil {
		return c.String(http.StatusNotFound, "Product not found")
	}

	return c.JSON(http.StatusOK, p)
}

func checkProduct(p *database.Product) int {
	var status int
	switch {
	case p == nil:
		status = http.StatusBadRequest
	case p.Name == "":
		status = http.StatusBadRequest
	case p.Type == "":
		status = http.StatusBadRequest
	case p.Host == "":
		status = http.StatusBadRequest
	default:
		status = http.StatusContinue
	}
	return status
}

func checkProductForRedirect(p *database.Product) int {
	var status int
	switch {
	case p == nil:
		status = http.StatusNoContent
	case p.Name == "":
		status = http.StatusNoContent
	case p.Type == "":
		status = http.StatusNoContent
	case p.Host == "":
		status = http.StatusNoContent
	case p.Type == "FILE":
		status = http.StatusNoContent
	default:
		status = http.StatusContinue
	}
	return status
}

func parseRequestURL(requestURI string, p *database.Product) string {
	// replace first encounter of product uuid
	newRequestURI := strings.TrimPrefix(strings.Replace(requestURI, p.UUID, "", 1), "/")

	requestURLSlice := []string{p.Host, newRequestURI}

	requestURL := strings.Join(requestURLSlice, "")

	return requestURL
}

func matchingUUID(str string) (bool, error) {
	match, err := regexp.MatchString(`[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}`, str)
	if err != nil {
		return false, err
	}
	return match, err
}

// RedirectToHost based on product uuid path check if api or stream and subsequently redirect
func RedirectToHost(c echo.Context) error {
	var omit bool

	if len(os.Args) > 1 && os.Args[1][:5] == "-test" {
		omit = true
	}

	slice := strings.Split(c.Request().RequestURI, "/")

	var p *database.Product

	// Check if string in path matches uuid regex, is valid uuid and matches product that is type API or STREAM
	for _, str := range slice {

		match, err := matchingUUID(str)

		if err != nil {
			return c.String(http.StatusNoContent, "")
		}

		if match {
			_, err := uuid.Parse(str)
			if err != nil {
				return c.String(http.StatusNoContent, "")
			}

			if !omit {
				p, err = database.DBInstance.GetProduct(str)
				if err != nil {
					return c.String(http.StatusNoContent, "")
				}
			}

			if status := checkProductForRedirect(p); status == http.StatusNoContent {
				return c.String(http.StatusNoContent, "")
			}

			r := buildProxyRequest(c, c.Request(), "http", p.Host)

			err = executeRequest(c, r)
		}
	}

	return c.String(http.StatusNoContent, "")
}

// Take a request and build a proxy request from a host string with a certain protocol (http or https here)
func buildProxyRequest(c echo.Context, r *http.Request, protocol string, host string) *http.Request {
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return nil
	}

	// if body is of multipart type, reassign it here
	r.Body = ioutil.NopCloser(bytes.NewReader(body))

	// build new url
	url := fmt.Sprintf("%s://%s%s", protocol, host, r.RequestURI)

	proxyReq, err := http.NewRequest(r.Method, url, bytes.NewReader(body))
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return nil
	}

	// Copy header, filter logic could be added later
	proxyReq.Header = make(http.Header)
	for index, value := range r.Header {
		proxyReq.Header[index] = value
	}

	return proxyReq
}

func executeRequest(c echo.Context, r *http.Request) error {

	// Instantiate http client
	client := http.Client{}

	resp, err := client.Do(r)
	if err != nil {
		return c.String(http.StatusBadGateway, err.Error())
	}

	// Read body
	stream, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		if err != nil {
			c.String(http.StatusInternalServerError, err.Error())
			return nil
		}
	}

	// Close reader when response is returned
	defer resp.Body.Close()

	return c.Blob(resp.StatusCode, resp.Header.Get("Content-Type"), stream)
}
