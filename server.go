package main

import (
	"github.com/joho/godotenv"

	"github.com/databrokerglobal/dxc/filemanager"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
)

func main() {
	e := echo.New()

	// Hide startup banner
	e.HideBanner = true
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
	e.POST("/upload", filemanager.Upload)
	// Download file route
	e.GET("/download", filemanager.Download)

	// Loading env file
	err := godotenv.Load()
	if err != nil {
		e.Logger.Error("No env file loaded...")
	}

	// Log stuff if port is busy f.e.
	e.Logger.Fatal(e.Start(":1323"))
}
