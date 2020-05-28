package datasources

import (
	"fmt"
	"net/http"
	"net/url"
	"strings"

	"github.com/databrokerglobal/dxc/database"
	"github.com/databrokerglobal/dxc/utils"

	"github.com/labstack/echo/v4"
)

// DatasourceReq safe type for the controller
type DatasourceReq struct {
	Name string `json:"name"`
	Type string `json:"type"`
	Host string `json:"host"`
}

// AddOneDatasource datasource
// AddOneDatasource godoc
// @Summary Create datasource
// @Description Create datasource
// @Tags datasources
// @Accept json
// @Produce json
// @Param datasource body DatasourceReq true "Datasource"
// @Success 201 {string} string "Success"
// @Failure 400 {string} string "Error creating datasource"
// @Router /datasource [post]
func AddOneDatasource(c echo.Context) error {
	datasource := new(database.Datasource)

	if err := c.Bind(datasource); err != nil {
		return err
	}

	status := checkDatasource(datasource)
	if status == http.StatusBadRequest {
		return c.String(http.StatusBadRequest, "Name, Type or Host are empty but are required")
	}

	datasource.Host = trimLastSlash(datasource.Host)

	if datasource.Did == "" {
		rand, _ := utils.GenerateRandomStringURLSafe(10)
		datasource.Did = fmt.Sprintf("did:databroker:%s:%s:%s", strings.Replace(datasource.Name, " ", "", -1), datasource.Type, rand)
	}

	datasource.Status = "AVAILABLE"

	if err := database.DBInstance.CreateDatasource(datasource); err != nil {
		return err
	}
	SendStatus()

	return c.JSON(http.StatusCreated, datasource.Did)
}

// GetAllDatasources return all datasources
// GetAllDatasources godoc
// @Summary Get all datasources
// @Description Get all datasources
// @Tags datasources
// @Accept json
// @Produce json
// @Success 200 {array} database.Datasource true
// @Failure 500 {string} string "Error retrieving datasources from database"
// @Router /datasources [get]
func GetAllDatasources(c echo.Context) error {

	var datasources *[]database.Datasource

	datasources, err := database.DBInstance.GetDatasources()

	if err != nil {
		return c.String(http.StatusInternalServerError, "Error retrieving item from database")
	}

	return c.JSON(http.StatusOK, datasources)
}

// GetOneDatasource datasource
// GetOneDatasource godoc
// @Summary Get one datasource
// @Description Get one datasource given a did
// @Tags datasources
// @Produce json
// @Param did path string true "Digital identifier of the datasource"
// @Success 200 {object} database.Datasource true
// @Failure 500 {string} string "Error retrieving datasource from database"
// @Router /datasource/{did} [get]
func GetOneDatasource(c echo.Context) error {
	did, err := url.QueryUnescape(c.Param("did"))
	if err != nil {
		return c.String(http.StatusInternalServerError, "Could not read the did")
	}

	var datasource *database.Datasource

	datasource, err = database.DBInstance.GetDatasourceByDID(did)

	if err != nil {
		return c.String(http.StatusInternalServerError, "Error retrieving datasource from database")
	}

	if datasource == nil {
		return c.String(http.StatusNotFound, "Datasource not found")
	}

	return c.JSON(http.StatusOK, datasource)
}

// // RedirectToHost based on product uuid path check if api or stream and subsequently redirect
// func RedirectToHost(c echo.Context) error {
// 	var omit bool

// 	if len(os.Args) > 1 && os.Args[1][:5] == "-test" {
// 		omit = true
// 	}

// 	slice := strings.Split(c.Request().RequestURI, "/")

// 	var p *database.Product

// 	// Check if string in path matches uuid regex, is valid uuid and matches product that is type API or STREAM
// 	for _, str := range slice {

// 		_, err := uuid.Parse(str)
// 		if err != nil {
// 			return c.String(http.StatusNoContent, "")
// 		}

// 		if !omit {
// 			p, err = database.DBInstance.GetProductByDID(str)
// 			if err != nil {
// 				return c.String(http.StatusNoContent, "")
// 			}
// 		}

// 		if status := checkProductForRedirect(p); status == http.StatusNoContent {
// 			return c.String(http.StatusNoContent, "")
// 		}

// 		r := buildProxyRequest(c, c.Request(), "http", p.Host)

// 		err = executeRequest(c, r)
// 	}

// 	return c.String(http.StatusNoContent, "")
// }

func checkDatasource(datasource *database.Datasource) int {
	var status int
	switch {
	case datasource == nil:
		status = http.StatusBadRequest
	case datasource.Name == "":
		status = http.StatusBadRequest
	case datasource.Type == "":
		status = http.StatusBadRequest
	case datasource.Host == "":
		status = http.StatusBadRequest
	default:
		status = http.StatusContinue
	}
	return status
}

// func checkProductForRedirect(p *database.Product) int {
// 	var status int
// 	switch {
// 	case p == nil:
// 		status = http.StatusNoContent
// 	case p.Name == "":
// 		status = http.StatusNoContent
// 	case p.Type == "":
// 		status = http.StatusNoContent
// 	case p.Host == "":
// 		status = http.StatusNoContent
// 	case p.Type == "FILE":
// 		status = http.StatusNoContent
// 	default:
// 		status = http.StatusContinue
// 	}
// 	return status
// }

// func parseRequestURL(requestURI string, p *database.Product) string {
// 	// replace first encounter of product uuid
// 	newRequestURI := strings.TrimPrefix(strings.Replace(requestURI, p.Did, "", 1), "/")

// 	requestURLSlice := []string{p.Host, newRequestURI}

// 	requestURL := strings.Join(requestURLSlice, "")

// 	return requestURL
// }

// // Take a request and build a proxy request from a host string with a certain protocol (http or https here)
// func buildProxyRequest(c echo.Context, r *http.Request, protocol string, host string) *http.Request {
// 	body, err := ioutil.ReadAll(r.Body)
// 	if err != nil {
// 		c.String(http.StatusInternalServerError, err.Error())
// 		return nil
// 	}

// 	// if body is of multipart type, reassign it here
// 	r.Body = ioutil.NopCloser(bytes.NewReader(body))

// 	// build new url
// 	url := fmt.Sprintf("%s://%s%s", protocol, host, r.RequestURI)

// 	proxyReq, err := http.NewRequest(r.Method, url, bytes.NewReader(body))
// 	if err != nil {
// 		c.String(http.StatusInternalServerError, err.Error())
// 		return nil
// 	}

// 	// Copy header, filter logic could be added later
// 	proxyReq.Header = make(http.Header)
// 	for index, value := range r.Header {
// 		proxyReq.Header[index] = value
// 	}

// 	return proxyReq
// }

// func executeRequest(c echo.Context, r *http.Request) error {

// 	// Instantiate http client
// 	client := http.Client{}

// 	resp, err := client.Do(r)
// 	if err != nil {
// 		return c.String(http.StatusBadGateway, err.Error())
// 	}

// 	// Read body
// 	stream, err := ioutil.ReadAll(resp.Body)
// 	if err != nil {
// 		if err != nil {
// 			c.String(http.StatusInternalServerError, err.Error())
// 			return nil
// 		}
// 	}

// 	// Close reader when response is returned
// 	defer resp.Body.Close()

// 	return c.Blob(resp.StatusCode, resp.Header.Get("Content-Type"), stream)
// }

func trimLastSlash(host string) (h string) {
	h = host
	for strings.Split(h, "")[len(h)-1] == "/" {
		h = strings.TrimSuffix(h, "/")
	}
	return h
}
