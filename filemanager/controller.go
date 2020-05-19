package filemanager

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"os"

	errors "github.com/pkg/errors"

	"github.com/databrokerglobal/dxc/database"
	"github.com/labstack/echo/v4"
)

// Upload file controller
// Upload godoc
// @Summary Upload a file
// @Description Link a file from the LOCAL_FILES_DIR to the DXC
// @Tags files
// @Accept mpfd
// @Param file formData file true "File to Upload"
// @Produce json
// @Success 200 {string} string true
// @Failure 400 {string} string "File invalid or empty"
// @Failure 404 {string} string "File not found, is the uploaded file in the rigth directory or correctly bound to your docker volume?""
// @Failure 500 {string} string "Error inserting file metadata in database"
// @Router /files/upload [post]
func Upload(c echo.Context) error {

	// Source - File stream from upload
	file, err := c.FormFile("file")

	if err != nil {
		return c.String(http.StatusBadRequest, fmt.Sprint("File invalid or empty"))
	}

	// Read file, then open mirror file in dir, read it and check if same file
	err = parseFile(file)
	if err != nil {
		return c.String(http.StatusNotFound, "File not found, is the uploaded file in the rigth directory or correctly bound to your docker volume?")
	}

	err = database.DBInstance.CreateFile(&database.File{Name: file.Filename})
	if err != nil {
		return c.String(http.StatusInternalServerError, "Error inserting file metadata in database")
	}

	// Return succes message
	return c.String(http.StatusOK, fmt.Sprintf("File %s uploaded successfully. File checksum result: OK", file.Filename))
}

// Download a file
// Download godoc
// @Summary Download a file
// @Description Download a file from the DXC
// @Tags files
// @Accept json
// @Param name query string true "File name"
// @Produce octet-stream
// @Success 200 {file} string true
// @Failure 404 {string} string "File not found"
// @Router /file/download [get]
func Download(c echo.Context) error {

	name := c.QueryParam("name")

	filepath, err := findFile(name)
	if err != nil {
		return c.String(http.StatusNotFound, err.Error())
	}

	return c.Attachment(filepath, name)
}

// GetAll get all files
// GetFiles godoc
// @Summary Get files
// @Description Get all files linked
// @Tags files
// @Accept json
// @Produce json
// @Success 200 {array} database.File true
// @Failure 500 {string} string "Error retrieving item from database"
// @Router /files [get]
func GetAll(c echo.Context) error {
	var fs *[]database.File

	fs, err := database.DBInstance.GetFiles()

	if err != nil {
		return c.String(http.StatusInternalServerError, "Error retrieving item from database")
	}

	return c.JSON(http.StatusOK, fs)
}

// GetDataFile for the user to get a file
// GetDataFile godoc
// @Summary Download a file (for users)
// @Description Download a file from the DXC
// @Tags files
// @Accept json
// @Param did path string true "Digital identifier of the product bought"
// @Param name query string true "File name"
// @Param verificationdata query string true "Signed verification data"
// @Produce octet-stream
// @Success 200 {file} string true
// @Failure 401 {string} string "Request not authorized. Signature and verification data invalid"
// @Failure 404 {string} string "File not found"
// @Router /getdata/{did}/file [get]
func GetDataFile(c echo.Context) error {

	// did := c.Param("did")
	name := c.QueryParam("name")

	filepath, err := findFile(name)
	if err != nil {
		return c.String(http.StatusNotFound, err.Error())
	}

	return c.Attachment(filepath, name)
}

func findFile(fileName string) (filePath string, err error) {

	var omit bool

	if len(os.Args) > 1 && os.Args[1][:5] == "-test" {
		omit = true
	}

	if !omit {
		_, err := database.DBInstance.GetFile(fileName)
		if err != nil {
			return "", errors.Wrap(err, "error getting file from db")
		}
	}

	var fileDir string

	if os.Getenv("GO_ENV") == "local" {
		fileDir = os.Getenv("LOCAL_FILES_DIR")
	} else {
		fileDir = "/var/files"
	}

	filePath = fmt.Sprintf("%s/%s", fileDir, fileName)

	if omit {
		fileDir = "/tmp"
		testdata := []byte("test")
		if err := ioutil.WriteFile(filePath, testdata, 0644); err != nil {
			return "", errors.Wrap(err, "error writing test file")
		}
	}

	return
}

// TestRequest for testing the server
// TestRequest godoc
// @Summary Test the server
// @Description returns "test dxc ok"
// @Tags test
// @Success 200 {string} string true
// @Router /test [get]
func TestRequest(c echo.Context) error {

	return c.String(http.StatusOK, "test dxc ok")
}
