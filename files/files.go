package files

import (
	"fmt"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"github.com/labstack/echo"
)

// Upload file controller
func Upload(c echo.Context) error {
	// Read form fields
	name := c.FormValue("name")
	email := c.FormValue("email")

	//-----------
	// Read file
	//-----------

	// Source - File stream from upload
	file, err := c.FormFile("file")
	if err != nil {
		return err
	}

	// Open file to return its data source
	src, err := file.Open()
	if err != nil {
		return err
	}
	defer src.Close()

	// Load env files
	err = godotenv.Load()
	if err != nil {
		return err
	}

	// Load file path
	var filePath string
	if os.Getenv("GO_ENV") == "development" {
		filePath = os.Getenv("LOCAL_FILES_DIR")
	} else {
		filePath = "/var/files"
	}

	// Open same file in the mounted docker volume (or just local dir if go_env=development)
	from, err := os.Open(fmt.Sprintf("%s/%s", filePath, file.Filename))
	if err != nil {
		return err
	}
	defer from.Close()

	// Read some bytes from opened file in volume
	b1 := make([]byte, 22)
	n1, err := from.Read(b1)
	if err != nil {
		return err
	}

	// Return succes message
	return c.HTML(http.StatusOK, fmt.Sprintf("<p>File %s uploaded successfully with fields name=%s and email=%s and working file_snippet=%s.</p>", file.Filename, name, email, string(b1[:n1])))
}
