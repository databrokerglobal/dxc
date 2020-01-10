package filemanager

import (
	"fmt"
	"net/http"

	"github.com/databrokerglobal/dxc/database"
	"github.com/labstack/echo"
)

// Upload file controller
func Upload(c echo.Context) error {
	// Read form fields
	name := c.FormValue("name")

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

	err = createOneFile(&database.File{Name: name})

	// Return succes message
	return c.HTML(http.StatusOK, fmt.Sprintf("<p>File %s uploaded successfully with field name=%s. File checksum result: OK</p>", file.Filename, name))
}
