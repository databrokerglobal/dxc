package templating

import (
	"net/http"

	"github.com/databrokerglobal/dxc/database"
	"github.com/labstack/echo"
)

type IndexData struct {
	Files []database.File
}

// IndexHandler render index html
func IndexHandler(c echo.Context) error {
	file := database.File{Name: "Test"}

	data := IndexData{
		Files: []database.File{file},
	}

	return c.Render(http.StatusOK, "data", data)
}
