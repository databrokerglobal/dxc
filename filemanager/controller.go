package filemanager

import (
	"fmt"
	"net/http"
	"os"

	"github.com/databrokerglobal/dxc/database"
	"github.com/joho/godotenv"
	"github.com/labstack/echo"
)

// Upload file controller
func Upload(c echo.Context) error {
	// Source - File stream from upload
	file, err := c.FormFile("file")
	if file.Size == 0 {
		return c.String(http.StatusBadRequest, fmt.Sprint("File invalid or empty"))
	}
	if err != nil {
		return c.String(http.StatusBadRequest, fmt.Sprint("File invalid or empty"))
	}

	// Read file, then open mirror file in dir, read it and check if same file
	err = parseFile(file)
	if err != nil {
		return c.String(http.StatusNotFound, "File not found, is the uploaded file in the rigth directory or correctly bound to your docker volume?")
	}

	err = createOneFile(&database.File{Name: file.Filename})
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

	_, err := getOneFile(name)
	if err != nil {
		return c.String(http.StatusNotFound, "File not found")
	}

	if err = godotenv.Load(); err != nil {
		return c.String(http.StatusInternalServerError, "Error loading env variables")
	}

	var filePath string
	if os.Getenv("GO_ENV") == "development" {
		filePath = os.Getenv("LOCAL_FILES_DIR")
	} else {
		filePath = "/var/files"
	}

	return c.Attachment(fmt.Sprintf("%s/%s", filePath, name), name)
}
