package templating

import (
	"net/http"

	"github.com/databrokerglobal/dxc/database"
	"github.com/labstack/echo"
)

// IndexData file list template generator
type IndexData struct {
	Files *[]database.File
}

// IndexHandler render index html
func IndexHandler(c echo.Context) error {
	files, err := database.DB.GetFiles()
	if err != nil {
		return c.String(http.StatusNotFound, "No file metadata stored in the database")
	}

	data := IndexData{
		Files: files,
	}

	return c.Render(http.StatusOK, "data", data)
}
