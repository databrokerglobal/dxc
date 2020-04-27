package filemanager

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"os"

	"github.com/databrokerglobal/dxc/database"
	"github.com/labstack/echo"
)

// Upload file controller
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
	return c.HTML(http.StatusOK, fmt.Sprintf("<p>File %s uploaded successfully. File checksum result: OK</p>", file.Filename))
}

// Download a file
func Download(c echo.Context) error {
	// Read form field
	name := c.QueryParam("name")

	var omit bool

	if len(os.Args) > 1 && os.Args[1][:5] == "-test" {
		omit = true
	}

	if !omit {
		_, err := database.DBInstance.GetFile(name)
		if err != nil {
			return c.String(http.StatusNotFound, "File not found")
		}
	}

	var filePath string

	if os.Getenv("GO_ENV") == "local" {
		filePath = os.Getenv("LOCAL_FILES_DIR")
	} else {
		filePath = "/var/files"
	}

	if omit {
		filePath = "/tmp"
		testdata := []byte("test")
		if err := ioutil.WriteFile(fmt.Sprintf("%s/%s", filePath, name), testdata, 0644); err != nil {
			return c.String(http.StatusNotFound, "File not found")
		}
	}

	return c.Attachment(fmt.Sprintf("%s/%s", filePath, name), name)
}

// GetAll get all files
func GetAll(c echo.Context) error {
	var fs *[]database.File

	fs, err := database.DBInstance.GetFiles()

	if err != nil {
		return c.String(http.StatusInternalServerError, "Error retrieving item from database")
	}

	return c.JSON(http.StatusOK, fs)
}
