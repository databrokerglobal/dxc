package templating

import (
	"net/http"

	"github.com/databrokerglobal/dxc/database"
	"github.com/labstack/echo"
)

type IndexData struct {
	Files *[]database.File
}

// IndexHandler render index html
func IndexHandler(c echo.Context) error {
	files, err := getAllFiles()
	if err != nil {
		return c.String(http.StatusNotFound, "No file metadata stored in the database")
	}

	data := IndexData{
		Files: files,
	}

	return c.Render(http.StatusOK, "data", data)
}
