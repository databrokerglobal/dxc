package datasources

import (
	"bytes"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"net/url"
	"os"
	"path"
	"path/filepath"
	"strings"

	"github.com/databrokerglobal/dxc/database"
	"github.com/databrokerglobal/dxc/utils"
	"github.com/pkg/errors"

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

	datasource.Available = true

	if err := database.DBInstance.CreateDatasource(datasource); err != nil {
		return err
	}
	SendStatus()

	return c.JSON(http.StatusCreated, datasource.Did)
}

// AddExampleDatasources create example datasources
// AddExampleDatasources godoc
// @Summary Create example datasources
// @Description Create example datasources
// @Tags dev
// @Accept json
// @Produce json
// @Success 201 {string} string "Success"
// @Failure 400 {string} string "Error creating datasources"
// @Router /add-example-datasources [post]
func AddExampleDatasources(c echo.Context) error {

	count := 0

	datasource := new(database.Datasource)
	datasource.Name = "file 1"
	datasource.Available = true
	datasource.Type = "FILE"
	datasource.Host = trimLastSlash("https://file-examples.com/wp-content/uploads/2017/02/file_example_XLS_10.xls")
	rand, _ := utils.GenerateRandomStringURLSafe(10)
	datasource.Did = fmt.Sprintf("did:databroker:%s:%s:%s", strings.Replace(datasource.Name, " ", "", -1), datasource.Type, rand)
	if err := database.DBInstance.CreateDatasource(datasource); err != nil {
		return err
	}
	count++

	datasource = new(database.Datasource)
	datasource.Name = "file 2"
	datasource.Available = true
	datasource.Type = "FILE"
	datasource.Host = trimLastSlash("https://file-examples.com/wp-content/uploads/2017/02/file_example_XLSX_10.xlsx")
	rand, _ = utils.GenerateRandomStringURLSafe(10)
	datasource.Did = fmt.Sprintf("did:databroker:%s:%s:%s", strings.Replace(datasource.Name, " ", "", -1), datasource.Type, rand)
	if err := database.DBInstance.CreateDatasource(datasource); err != nil {
		return err
	}
	count++

	datasource = new(database.Datasource)
	datasource.Name = "file 3 (ftp)"
	datasource.Available = true
	datasource.Type = "FILE"
	datasource.Host = trimLastSlash("ftp://speedtest.tele2.net/100KB.zip")
	rand, _ = utils.GenerateRandomStringURLSafe(10)
	datasource.Did = fmt.Sprintf("did:databroker:%s:%s:%s", strings.Replace(datasource.Name, " ", "", -1), datasource.Type, rand)
	if err := database.DBInstance.CreateDatasource(datasource); err != nil {
		return err
	}
	count++

	datasource = new(database.Datasource)
	datasource.Name = "api 1"
	datasource.Available = true
	datasource.Type = "API"
	datasource.Host = trimLastSlash("https://jsonplaceholder.typicode.com")
	rand, _ = utils.GenerateRandomStringURLSafe(10)
	datasource.Did = fmt.Sprintf("did:databroker:%s:%s:%s", strings.Replace(datasource.Name, " ", "", -1), datasource.Type, rand)
	if err := database.DBInstance.CreateDatasource(datasource); err != nil {
		return err
	}
	count++

	SendStatus()
	return c.String(http.StatusCreated, fmt.Sprintf("%d example datasources successfully created!", count))
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

// GetFile for the user to get the data source data
// GetFile godoc
// @Summary Get the file (for users)
// @Description Get the file (for users)
// @Tags data
// @Accept json
// @Param DXC_KEY query string true "Signed verification data"
// @Produce octet-stream
// @Success 200 {file} string true
// @Failure 401 {string} string "Request not authorized. Signature and verification data invalid"
// @Failure 404 {string} string "Datasource not found"
// @Failure 500 {string} string "Internal server error"
// @Router /getfile [get]
func GetFile(c echo.Context) error {

	did, err := url.QueryUnescape(c.Request().Header.Get("did"))
	if err != nil {
		return c.String(http.StatusInternalServerError, "Could not read the did")
	}

	if did == "" {
		return c.String(http.StatusBadRequest, "no did included in the verification data")
	}

	datasource, err := database.DBInstance.GetDatasourceByDID(did)
	if err != nil {
		return c.String(http.StatusNotFound, errors.Wrap(err, "data source not found in db").Error())
	}

	if datasource.Type == "FILE" {

		filename := path.Base(datasource.Host)
		rand, _ := utils.GenerateRandomStringURLSafe(10)
		pathToFile := "tempFiles/" + rand + "/" + filename
		err := downloadFile(pathToFile, datasource.Host)
		if err != nil {
			return c.String(http.StatusInternalServerError, "could not download file. error: "+err.Error())
		}
		defer os.RemoveAll(filepath.Dir(pathToFile))

		return c.Attachment(pathToFile, filename)
	}

	if datasource.Type == "API" {

		body, err := ioutil.ReadAll(c.Request().Body)
		if err != nil {
			c.String(http.StatusInternalServerError, err.Error())
			return nil
		}

		// if body is of multipart type, reassign it here
		c.Request().Body = ioutil.NopCloser(bytes.NewReader(body))

		proxyReq, err := http.NewRequest("GET", datasource.Host, nil)
		if err != nil {
			c.String(http.StatusInternalServerError, err.Error())
			return nil
		}

		err = executeRequest(c, proxyReq)
		return c.String(http.StatusAccepted, "")
	}

	return c.String(http.StatusBadRequest, "datasource type not supported")
}

// ProxyAPI redirects api
func ProxyAPI(c echo.Context) error {

	did, err := url.QueryUnescape(c.Request().Header.Get("did"))
	if err != nil {
		return c.String(http.StatusInternalServerError, "Could not read the did")
	}

	if did == "" {
		return c.String(http.StatusBadRequest, "no did included in the verification data")
	}

	datasource, err := database.DBInstance.GetDatasourceByDID(did)
	if err != nil {
		return c.String(http.StatusNotFound, errors.Wrap(err, "data source not found in db").Error())
	}

	if datasource.Type != "API" {
		return c.String(http.StatusBadRequest, "datasource is not of type API")
	}

	req := c.Request()

	body, err := ioutil.ReadAll(req.Body)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return nil
	}

	// if body is of multipart type, reassign it here
	req.Body = ioutil.NopCloser(bytes.NewReader(body))

	// build new url
	url := fmt.Sprintf("%s%s", datasource.Host, strings.Replace(req.RequestURI, "/api", "", 1))

	proxyReq, err := http.NewRequest(req.Method, url, bytes.NewReader(body))
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return nil
	}

	// Copy header, filter logic could be added later
	proxyReq.Header = make(http.Header)
	for index, value := range req.Header {
		if !strings.EqualFold("did", index) && !strings.EqualFold("DXC_KEY", index) { // do not include headers we use ourselves
			proxyReq.Header[index] = value
		}
	}

	err = executeRequest(c, proxyReq)
	return c.String(http.StatusAccepted, "")
}

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

func trimLastSlash(host string) (h string) {
	h = host
	for strings.Split(h, "")[len(h)-1] == "/" {
		h = strings.TrimSuffix(h, "/")
	}
	return h
}

func downloadFile(pathToFile string, url string) error {

	// Get the data
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	// Create the file
	if err = os.MkdirAll(filepath.Dir(pathToFile), 0770); err != nil {
		return err
	}
	out, err := os.Create(pathToFile)
	if err != nil {
		return err
	}
	defer out.Close()

	// Write the body to file
	_, err = io.Copy(out, resp.Body)
	return err
}
