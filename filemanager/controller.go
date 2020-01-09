package filemanager

import (
	"fmt"
	"net/http"

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

	// Read file, then open mirror file in dir, read it and check if same file
	err = parseFile(file)
	if err != nil {
		return err
	}

	// Return succes message
	return c.HTML(http.StatusOK, fmt.Sprintf("<p>File %s uploaded successfully with fields name=%s and email=%s. File checksum result: OK</p>", file.Filename, name, email))
}
