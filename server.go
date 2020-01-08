package main

import (
	"github.com/databrokerglobal/dxc/files"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
)

func main() {
	e := echo.New()

	// Load the echo logger
	e.Use(middleware.Logger())
	// Pevents api from crashing if panic
	e.Use(middleware.Recover())

	////////////
	// ROUTES //
	////////////

	// Static index.html route, serve html
	e.Static("/", "public")
	// Upload file route
	e.POST("/upload", files.Upload)

	// Log stuff if port is busy f.e.
	e.Logger.Fatal(e.Start(":1323"))
}
