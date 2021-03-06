package datasources

import (
	"bytes"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"path"
	"path/filepath"
	"strings"

	"github.com/databrokerglobal/dxc/database"
	"github.com/databrokerglobal/dxc/middlewares"
	"github.com/databrokerglobal/dxc/utils"

	"github.com/labstack/echo/v4"
	"github.com/pkg/errors"

	"github.com/jlaffaye/ftp"
	"github.com/pkg/sftp"
	"golang.org/x/crypto/ssh"
)

// RunningTest is true when we are running tests
var RunningTest = false

// DatasourceReq safe type for the controller
type DatasourceReq struct {
	Name        string `json:"name"`
	Type        string `json:"type"`
	Host        string `json:"host"`
	APIKeyName  string `json:"headerAPIKeyName"`
	APIKeyValue string `json:"headerAPIKeyValue"`
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
// @Security ApiKeyAuth
func AddOneDatasource(c echo.Context) error {

	dxcSecureKey := c.Request().Header.Get("DXC_SECURE_KEY")
	err := middlewares.CheckDXCSecureKey(dxcSecureKey)
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	datasource := new(database.Datasource)

	if err := c.Bind(datasource); err != nil {
		return err
	}

	status := checkDatasource(datasource)
	if status == http.StatusBadRequest {
		return c.String(http.StatusBadRequest, "Name, Type or Host are empty but are required")
	}

	datasource.Host = utils.TrimLastSlash(datasource.Host)

	if datasource.Did == "" {
		rand, _ := utils.GenerateRandomStringURLSafe(10)
		datasource.Did = fmt.Sprintf("did:databroker:%s:%s:%s", strings.Replace(datasource.Name, " ", "", -1), datasource.Type, rand)
	}

	datasource.Available = true

	if datasource.Ftpusername == "" {
		datasource.Ftpusername = "anonymous"
	}
	if datasource.Ftppassword == "" {
		datasource.Ftppassword = "anonymous"
	}

	if !RunningTest {
		if err := database.DBInstance.CreateDatasource(datasource); err != nil {
			return err
		}
		CheckHost(datasource.Did, datasource.Name)
		SendStatus()
	}

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
// @Security ApiKeyAuth
func AddExampleDatasources(c echo.Context) error {

	dxcSecureKey := c.Request().Header.Get("DXC_SECURE_KEY")
	err := middlewares.CheckDXCSecureKey(dxcSecureKey)
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	count := 0

	datasource := new(database.Datasource)
	datasource.Name = "File 1"
	datasource.Available = true
	datasource.Type = "FILE"
	datasource.Protocol = "LOCAL"
	datasource.Host = utils.TrimLastSlash("file:///etc/hosts")
	rand, _ := utils.GenerateRandomStringURLSafe(10)
	datasource.Did = fmt.Sprintf("did:databroker:%s:%s:%s", strings.Replace(datasource.Name, " ", "", -1), datasource.Type, rand)
	if !RunningTest {
		if err := database.DBInstance.CreateDatasource(datasource); err != nil {
			return err
		}
	}
	count++

	datasource = new(database.Datasource)
	datasource.Name = "File 2"
	datasource.Available = true
	datasource.Type = "FILE"
	datasource.Protocol = "LOCAL"
	datasource.Host = utils.TrimLastSlash("/etc/hosts")
	rand, _ = utils.GenerateRandomStringURLSafe(10)
	datasource.Did = fmt.Sprintf("did:databroker:%s:%s:%s", strings.Replace(datasource.Name, " ", "", -1), datasource.Type, rand)
	if !RunningTest {
		if err := database.DBInstance.CreateDatasource(datasource); err != nil {
			return err
		}
	}
	count++

	datasource = new(database.Datasource)
	datasource.Name = "File 3"
	datasource.Available = true
	datasource.Type = "FILE"
	datasource.Protocol = "HTTPS"
	datasource.Host = utils.TrimLastSlash("https://file-examples.com/wp-content/uploads/2017/02/file_example_XLS_10.xls")
	rand, _ = utils.GenerateRandomStringURLSafe(10)
	datasource.Did = fmt.Sprintf("did:databroker:%s:%s:%s", strings.Replace(datasource.Name, " ", "", -1), datasource.Type, rand)
	if !RunningTest {
		if err := database.DBInstance.CreateDatasource(datasource); err != nil {
			return err
		}
	}
	count++

	datasource = new(database.Datasource)
	datasource.Name = "File 4"
	datasource.Available = true
	datasource.Type = "FILE"
	datasource.Protocol = "HTTPS"
	datasource.Host = utils.TrimLastSlash("https://file-examples.com/wp-content/uploads/2017/02/file_example_XLSX_10.xlsx")
	rand, _ = utils.GenerateRandomStringURLSafe(10)
	datasource.Did = fmt.Sprintf("did:databroker:%s:%s:%s", strings.Replace(datasource.Name, " ", "", -1), datasource.Type, rand)
	if !RunningTest {
		if err := database.DBInstance.CreateDatasource(datasource); err != nil {
			return err
		}
	}
	count++

	datasource = new(database.Datasource)
	datasource.Name = "File 5"
	datasource.Available = true
	datasource.Type = "FILE"
	datasource.Protocol = "HTTP"
	datasource.Host = utils.TrimLastSlash("http://www.africau.edu/images/default/sample.pdf")
	rand, _ = utils.GenerateRandomStringURLSafe(10)
	datasource.Did = fmt.Sprintf("did:databroker:%s:%s:%s", strings.Replace(datasource.Name, " ", "", -1), datasource.Type, rand)
	if !RunningTest {
		if err := database.DBInstance.CreateDatasource(datasource); err != nil {
			return err
		}
	}
	count++

	datasource = new(database.Datasource)
	datasource.Name = "File 6"
	datasource.Available = true
	datasource.Type = "FILE"
	datasource.Protocol = "FTP"
	datasource.Ftpusername = "anonymous"
	datasource.Ftppassword = "anonymous"
	datasource.Host = utils.TrimLastSlash("ftp://ftp.gnu.org/gnu/Licenses/fdl-1.1.txt")
	rand, _ = utils.GenerateRandomStringURLSafe(10)
	datasource.Did = fmt.Sprintf("did:databroker:%s:%s:%s", strings.Replace(datasource.Name, " ", "", -1), datasource.Type, rand)
	if !RunningTest {
		if err := database.DBInstance.CreateDatasource(datasource); err != nil {
			return err
		}
	}
	count++

	datasource = new(database.Datasource)
	datasource.Name = "File 7"
	datasource.Available = true
	datasource.Type = "FILE"
	datasource.Protocol = "FTP"
	datasource.Ftpusername = "demo"
	datasource.Ftppassword = "demo"
	datasource.Host = utils.TrimLastSlash("ftp://demo.wftpserver.com/download/Spring.jpg")
	rand, _ = utils.GenerateRandomStringURLSafe(10)
	datasource.Did = fmt.Sprintf("did:databroker:%s:%s:%s", strings.Replace(datasource.Name, " ", "", -1), datasource.Type, rand)
	if !RunningTest {
		if err := database.DBInstance.CreateDatasource(datasource); err != nil {
			return err
		}
	}
	count++

	datasource = new(database.Datasource)
	datasource.Name = "File 8"
	datasource.Available = true
	datasource.Type = "FILE"
	datasource.Protocol = "FTPS"
	datasource.Ftpusername = "demo"
	datasource.Ftppassword = "password"
	datasource.Host = utils.TrimLastSlash("ftps://test.rebex.net//pub/example/KeyGenerator.png")
	rand, _ = utils.GenerateRandomStringURLSafe(10)
	datasource.Did = fmt.Sprintf("did:databroker:%s:%s:%s", strings.Replace(datasource.Name, " ", "", -1), datasource.Type, rand)
	if !RunningTest {
		if err := database.DBInstance.CreateDatasource(datasource); err != nil {
			return err
		}
	}
	count++

	datasource = new(database.Datasource)
	datasource.Name = "File 9"
	datasource.Available = true
	datasource.Type = "FILE"
	datasource.Protocol = "SFTP"
	datasource.Ftpusername = "demo"
	datasource.Ftppassword = "password"
	datasource.Host = utils.TrimLastSlash("sftp://test.rebex.net:22/pub/example/KeyGenerator.png")
	rand, _ = utils.GenerateRandomStringURLSafe(10)
	datasource.Did = fmt.Sprintf("did:databroker:%s:%s:%s", strings.Replace(datasource.Name, " ", "", -1), datasource.Type, rand)
	if !RunningTest {
		if err := database.DBInstance.CreateDatasource(datasource); err != nil {
			return err
		}
	}
	count++

	datasource = new(database.Datasource)
	datasource.Name = "API 1"
	datasource.Available = true
	datasource.Type = "API"
	datasource.Host = utils.TrimLastSlash("https://jsonplaceholder.typicode.com")
	rand, _ = utils.GenerateRandomStringURLSafe(10)
	datasource.Did = fmt.Sprintf("did:databroker:%s:%s:%s", strings.Replace(datasource.Name, " ", "", -1), datasource.Type, rand)
	if !RunningTest {
		if err := database.DBInstance.CreateDatasource(datasource); err != nil {
			return err
		}
	}
	count++

	if !RunningTest {
		SendStatus()
	}

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
// @Security ApiKeyAuth
func GetAllDatasources(c echo.Context) error {

	dxcSecureKey := c.Request().Header.Get("DXC_SECURE_KEY")
	err := middlewares.CheckDXCSecureKey(dxcSecureKey)
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	var datasources *[]database.Datasource

	datasources, err = database.DBInstance.GetDatasources()

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
// @Failure 400 {string} string "Bad request"
// @Failure 500 {string} string "Error retrieving datasource from database"
// @Router /datasource/{did} [get]
// @Security ApiKeyAuth
func GetOneDatasource(c echo.Context) error {

	dxcSecureKey := c.Request().Header.Get("DXC_SECURE_KEY")
	err := middlewares.CheckDXCSecureKey(dxcSecureKey)
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	did, err := url.QueryUnescape(c.Param("did"))
	if err != nil {
		return c.String(http.StatusInternalServerError, "Could not read the did")
	}
	if did == "" {
		return c.String(http.StatusBadRequest, "Bad request. did cannot be empty.")
	}

	var datasource *database.Datasource

	if !RunningTest {
		datasource, err = database.DBInstance.GetDatasourceByDID(did)
		if err != nil {
			return c.String(http.StatusInternalServerError, "Error retrieving datasource from database")
		}

		if datasource == nil {
			return c.String(http.StatusNotFound, "Datasource not found")
		}
	}

	return c.JSON(http.StatusOK, datasource)
}

// DeleteDatasource datasource
// DeleteDatasource godoc
// @Summary Delete one datasource
// @Description Delete one datasource given a did
// @Tags datasources
// @Param did path string true "Digital identifier of the datasource"
// @Success 200 {string} string "datasource successfully deleted"
// @Failure 400 {string} string "Bad request"
// @Failure 500 {string} string "Error retrieving datasource from database"
// @Router /datasource/{did} [delete]
// @Security ApiKeyAuth
func DeleteDatasource(c echo.Context) error {

	dxcSecureKey := c.Request().Header.Get("DXC_SECURE_KEY")
	err := middlewares.CheckDXCSecureKey(dxcSecureKey)
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	did, err := url.QueryUnescape(c.Param("did"))
	if err != nil {
		return c.String(http.StatusInternalServerError, "Could not read the did")
	}
	if did == "" {
		return c.String(http.StatusBadRequest, "Bad request. did cannot be empty.")
	}

	if !RunningTest {
		err = database.DBInstance.DeleteDatasource(did)
		if err != nil {
			return c.String(http.StatusInternalServerError, "Error retrieving datasource from database")
		}
	}

	return c.JSON(http.StatusOK, "datasource successfully deleted")
}

// UpdateDatasource datasource
// UpdateDatasource godoc
// @Summary Update one datasource
// @Description Modify one datasource (new name and/or host) given a did
// @Tags datasources
// @Param did path string true "Digital identifier of the datasource"
// @Param newName query string false "New name. Keep empty to keep existing name."
// @Param newHost query string false "New host. Keep empty to keep existing host."
// @Param newHeaderAPIKeyName query string false "New header API key name. Keep empty to keep existing header API key name."
// @Param newHeaderAPIKeyValue query string false "New header API key value. Keep empty to keep existing header API key value."
// @Success 200 {string} string "datasource successfully updated"
// @Failure 400 {string} string "Bad request"
// @Failure 404 {string} string "Datasource not found"
// @Failure 500 {string} string "Error retrieving datasource from database"
// @Router /datasource/{did} [put]
// @Security ApiKeyAuth
func UpdateDatasource(c echo.Context) error {

	dxcSecureKey := c.Request().Header.Get("DXC_SECURE_KEY")
	err := middlewares.CheckDXCSecureKey(dxcSecureKey)
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	did, err := url.QueryUnescape(c.Param("did"))
	if err != nil {
		return c.String(http.StatusInternalServerError, "Could not read the did. err: "+err.Error())
	}
	if did == "" {
		return c.String(http.StatusBadRequest, "Bad request. did cannot be empty.")
	}

	u := new(DatasourceReq)
	if err = c.Bind(u); err != nil {
		return c.String(http.StatusBadRequest, "Bad request. Either name or host must be present.")
	}

	newName := u.Name
	newHost := u.Host
	newHeaderAPIKeyName := u.APIKeyName
	newHeaderAPIKeyValue := u.APIKeyValue

	if newName == "" && newHost == "" && newHeaderAPIKeyName == "" && newHeaderAPIKeyValue == "" {
		// may be in query params
		newName = c.QueryParam("newName")
		newHost = c.QueryParam("newHost")
		newHeaderAPIKeyName = c.QueryParam("newHeaderAPIKeyName")
		newHeaderAPIKeyValue = c.QueryParam("newHeaderAPIKeyValue")
		if newName == "" && newHost == "" && newHeaderAPIKeyName == "" && newHeaderAPIKeyValue == "" {
			return c.String(http.StatusBadRequest, "Bad request. all values cannot both be empty.")
		}
	}

	if !RunningTest {
		datasource, err := database.DBInstance.GetDatasourceByDID(did)
		if err != nil {
			return c.String(http.StatusNotFound, "Could not retreave datasource. err: "+err.Error())
		}

		if newName != "" {
			datasource.Name = newName
		}

		if newHost != "" {
			datasource.Host = newHost
		}

		if newHeaderAPIKeyName != "" {
			datasource.HeaderAPIKeyName = newHeaderAPIKeyName
		}

		if newHeaderAPIKeyValue != "" {
			datasource.HeaderAPIKeyValue = newHeaderAPIKeyValue
		}

		err = database.DBInstance.UpdateDatasource(datasource)
		if err != nil {
			return c.String(http.StatusInternalServerError, "Could not update the datasource. err: "+err.Error())
		}

		SendStatus()
	}

	return c.JSON(http.StatusOK, "datasource successfully updated")
}

// GetFile for the user to get the data source data
// GetFile godoc
// @Summary Get the file (for users)
// @Description Get the file (for users)
// @Tags data
// @Accept json
// @Param DXC_PRODUCT_KEY query string true "Signed verification data"
// @Produce octet-stream
// @Success 200 {file} string true
// @Failure 400 {string} string "Bad request"
// @Failure 401 {string} string "Request not authorized. Signature and verification data invalid"
// @Failure 404 {string} string "Datasource not found"
// @Failure 500 {string} string "Internal server error"
// @Router /getfile [get]
func GetFile(c echo.Context) error {

	verificationDataB64 := c.QueryParam("DXC_PRODUCT_KEY") // File type request
	if verificationDataB64 == "" {
		return c.String(http.StatusUnauthorized, "DXC_PRODUCT_KEY is not included")
	}
	did, err := middlewares.CheckDXCProductKey(verificationDataB64)
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
	}

	if did == "" {
		return c.String(http.StatusBadRequest, "no did included in the verification data")
	}

	datasource, err := database.DBInstance.GetDatasourceByDID(did)
	if err != nil {
		return c.String(http.StatusNotFound, errors.Wrap(err, "data source not found in db").Error())
	}

	if datasource.Type != "FILE" {
		return c.String(http.StatusBadRequest, "datasource is not of type FILE")
	}

	oldfilename := path.Base(datasource.Host)
	filename := ""
	if idx := strings.IndexByte(oldfilename, '?'); idx >= 0 {
		filename = oldfilename[:strings.IndexByte(oldfilename, '?')]
	} else {
		filename = oldfilename
	}
	// check if protocol is local file
	if datasource.Protocol == "LOCAL" {
		// direct download of local file
		pathToFile := datasource.Host
		path := strings.Replace(pathToFile, "file://", "", -1)
		return c.Inline(path, filename)
	}
	// generate temporary file
	rand, _ := utils.GenerateRandomStringURLSafe(10)
	pathToFile := "tempFiles/" + rand + "/" + filename
	if datasource.Protocol == "HTTP" || datasource.Protocol == "HTTPS" {
		err = downloadFileHTTP(pathToFile, datasource.Host)
	} else if datasource.Protocol == "SFTP" {
		err = downloadFileSFTP(datasource.Protocol, datasource.Host, datasource.Ftpusername, datasource.Ftppassword, pathToFile, filename)
	} else {
		// if file protocol is FTP or FTPS
		err = downloadFileFTP(datasource.Protocol, datasource.Host, datasource.Ftpusername, datasource.Ftppassword, pathToFile, filename)
	}
	if err != nil {
		return c.String(http.StatusInternalServerError, "could not download file. error: "+err.Error())
	}
	defer os.RemoveAll(filepath.Dir(pathToFile))
	return c.Attachment(pathToFile, filename)
}

// ProxyAPI redirects api
func ProxyAPI(c echo.Context) error {

	verificationDataB64 := c.Request().Header.Get("DXC_PRODUCT_KEY")
	if verificationDataB64 == "" {
		return c.String(http.StatusUnauthorized, "DXC_PRODUCT_KEY is not included")
	}
	did, err := middlewares.CheckDXCProductKey(verificationDataB64)
	if err != nil {
		return c.String(http.StatusUnauthorized, err.Error())
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
		if !strings.EqualFold("did", index) && !strings.EqualFold("DXC_PRODUCT_KEY", index) { // do not include headers we use ourselves
			proxyReq.Header[index] = value
		}
	}
	if datasource.HeaderAPIKeyName != "" {
		proxyReq.Header[datasource.HeaderAPIKeyName] = []string{datasource.HeaderAPIKeyValue}
	}

	err = executeRequest(c, proxyReq)
	return c.String(http.StatusAccepted, "")
}

// CheckMQTT is a route to validate mqtt access
func CheckMQTT(c echo.Context) error {

	requestDump, err := httputil.DumpRequest(c.Request(), true)
	if err != nil {
		fmt.Println(err)
	}
	fmt.Println(string(requestDump) + "\n\n\n")

	cmd, err := url.QueryUnescape(c.Param("cmd"))
	if err != nil {
		return c.String(http.StatusForbidden, "no cmd included")
	}

	if cmd == "connect" {
		body := map[string]interface{}{}
		if err := c.Bind(&body); err != nil {
			return err
		}
		type RespConnect struct {
			Username         string `json:"Username"`
			Password         string `json:"Password"`
			ClientIdentifier string `json:"ClientIdentifier"`
		}
		if valPassword, passwordExists := body["Password"]; passwordExists {
			_, err := middlewares.CheckDXCProductKey(valPassword.(string))
			if err != nil {
				return c.String(http.StatusForbidden, err.Error())
			}
			response := RespConnect{
				Username:         "",
				Password:         "",
				ClientIdentifier: body["ClientIdentifier"].(string),
			}
			return c.JSON(http.StatusOK, response)
		}
		return c.String(http.StatusForbidden, "password missing")
	} else if cmd == "subscribe" {
		body := map[string]interface{}{}
		if err := c.Bind(&body); err != nil {
			return err
		}
		type RespSubscribe struct {
			Topic string `json:"Topic"`
		}
		response := RespSubscribe{
			Topic: body["Topic"].(string),
		}
		return c.JSON(http.StatusOK, response)
	} else if cmd == "publish" || cmd == "receive" {
		body := map[string]interface{}{}
		if err := c.Bind(&body); err != nil {
			return err
		}
		type RespSubscribe struct {
			Topic   string `json:"Topic"`
			Payload string `json:"Payload"`
		}
		response := RespSubscribe{
			Topic:   body["Topic"].(string),
			Payload: body["Payload"].(string),
		}
		return c.JSON(http.StatusOK, response)
	}

	return c.String(http.StatusForbidden, "unknown cmd")
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

func downloadFileHTTP(pathToFile string, url string) error {

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

func downloadFileFTP(protocol string, url string, ftpusername string, ftppassword string, pathToFile string, filename string) error {
	// get server address and path of file
	server, path, err := getFtpServer(protocol, url, filename)
	if err != nil {
		return err
	}
	// get client of ftp server
	client, err := ftp.Dial(server)
	if err != nil {
		return err
	}
	// now connect to server
	if err := client.Login(ftpusername, ftppassword); err != nil {
		return err
	}
	//entries, _ := client.List("*")
	// change directory to path
	client.ChangeDir(path)
	// get file entry
	entries, _ := client.List(filename)
	if len(entries) <= 0 {
		return errors.New("No file found. Please check filename or path")
	}
	// close connection
	defer client.Quit()

	for _, entry := range entries {
		name := entry.Name
		reader, err := client.Retr(name)
		if err != nil {
			panic(err)
		}
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
		_, err = io.Copy(out, reader)
		return err
	}
	return nil
}

func downloadFileSFTP(protocol string, url string, ftpusername string, ftppassword string, pathToFile string, filename string) error {
	// get server address and path of file
	server, path, err := getFtpServer(protocol, url, filename)
	if err != nil {
		return err
	}
	// get client of sftp server
	config := &ssh.ClientConfig{
		User: ftpusername,
		Auth: []ssh.AuthMethod{
			ssh.Password(ftppassword),
		},
		HostKeyCallback: ssh.InsecureIgnoreHostKey(),
		//Ciphers: []string{"3des-cbc", "aes256-cbc", "aes192-cbc", "aes128-cbc"},
	}
	conn, err := ssh.Dial("tcp", server, config)
	if err == nil {
		client, err := sftp.NewClient(conn)
		// Close connection
		defer client.Close()
		defer conn.Close()
		if err == nil {
			// cwd, err := client.ReadDir(path) //if contains(cwd, filename) {
			// skipping checking of file exists as thread processing this task periodically
			reader, err := client.Open(path + "/" + filename)
			if err != nil {
				panic(err)
			}
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
			_, err = io.Copy(out, reader)
			return err
		}
		return errors.New("Internal error in connection or login to server")
	}
	return nil
}

func getFtpServer(protocol string, url string, filename string) (string, string, error) {
	url2 := url
	if protocol == "FTP" {
		url2 = strings.Replace(url, "ftp://", "", 1) // remove ftp://
	} else if protocol == "FTPS" {
		url2 = strings.Replace(url, "ftps://", "", 1) // remove ftp://
	} else if protocol == "SFTP" {
		url2 = strings.Replace(url, "sftp://", "", 1) // remove ftp://
	} else {
		return "", "", errors.New("No file found")
	}
	index := strings.Index(url2, "/") // get index of /
	ftpserver := url2[:index]         // extracted ftpserver
	if strings.Index(ftpserver, ":") < 0 {
		if protocol == "SFTP" {
			ftpserver = ftpserver + ":22" // add default sftp port
		} else {
			ftpserver = ftpserver + ":21" // add default ftp & ftps port
		}
	}
	path := url2[index:]
	path = strings.Replace(path, filename, "", -1)
	return ftpserver, path, nil
}
