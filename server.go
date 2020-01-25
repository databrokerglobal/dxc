package main

import (
	"github.com/joho/godotenv"
	"net/http"

	"github.com/databrokerglobal/dxc/filemanager"
	"github.com/databrokerglobal/dxc/products"
	"github.com/databrokerglobal/dxc/templating"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"

	"html/template"
)

func h(c echo.Context) error {
	return c.String(http.StatusOK, c.Request().RequestURI)
}

func main() {
	e := echo.New()

	// Hide startup banner
	e.HideBanner = true
	// Load the echo logger
	e.Use(middleware.Logger())
	// Pevents api from crashing if panic
	e.Use(middleware.Recover())

	////////////////////////
	// Template Renderer //)
	///////////////////////

	t := &templating.Template{
		Templates: template.Must(template.ParseGlob("public/*.html")),
	}
	e.Renderer = t

	////////////
	// ROUTES //
	////////////

	// FILES
	// Static index.html route, serve html
	e.GET("/", templating.IndexHandler)
	// Upload file route
	e.POST("/upload", filemanager.Upload)
	// Download file route
	e.GET("/download", filemanager.Download)

	// PRODUCTS
	e.POST("/product", products.AddOne)
	e.GET("/product/:uuid", products.GetOne)

	e.Any("/*", products.RedirectToHost)

	// Loading env file
	err := godotenv.Load()
	if err != nil {
		e.Logger.Error("No env file loaded...")
	}

	// Log stuff if port is busy f.e.
	e.Logger.Fatal(e.Start(":1324"))
}
