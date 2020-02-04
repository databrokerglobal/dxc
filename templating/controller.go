package templating

import (
	"net/http"
	"os"

	"github.com/databrokerglobal/dxc/database"
	"github.com/labstack/echo"
)

// IndexData file list template generator
type IndexData struct {
	Files *[]database.File
}

// IndexHandler render index html
func IndexHandler(c echo.Context) error {
	var omit bool

	if len(os.Args) > 1 && os.Args[1][:5] == "-test" {
		omit = true
	}

	var files *[]database.File
	var err error

	if !omit {
		files, err = database.DBInstance.GetFiles()
	}

	if err != nil {
		return c.String(http.StatusNotFound, "No file metadata stored in the database")
	}

	data := IndexData{
		Files: files,
	}

	return c.Render(http.StatusOK, "data", data)
}
