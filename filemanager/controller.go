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
	// Read form fields
	name := c.FormValue("name")

	// Source - File stream from upload
	file, err := c.FormFile("file")
	if err != nil {
		return err
	}

	// Read file, then open mirror file in dir, read it and check if same file
	err = parseFile(file)
	if err != nil {
		return err
	}

	err = createOneFile(&database.File{Name: name})

	// Return succes message
	return c.HTML(http.StatusOK, fmt.Sprintf("<p>File %s uploaded successfully with field name=%s. File checksum result: OK</p>", file.Filename, name))
}

// Download a file
func Download(c echo.Context) error {
	// Read form field
	name := c.FormValue("name")

	_, err := getOneFile(name)
	if err != nil {
		return err
	}

	if err = godotenv.Load(); err != nil {
		return err
	}

	var filePath string
	if os.Getenv("GO_ENV") == "development" {
		filePath = os.Getenv("LOCAL_FILES_DIR")
	} else {
		filePath = "/var/files"
	}

	return c.File(fmt.Sprintf("%s/%s", filePath, name))
}
