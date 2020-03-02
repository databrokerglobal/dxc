package main

import (
	"github.com/joho/godotenv"

	"github.com/databrokerglobal/dxc/filemanager"
	"github.com/databrokerglobal/dxc/products"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
)

func main() {
	e := echo.New()

	//////////////////////////
	// Middleware          //
	////////////////////////

	// Hide startup banner
	e.HideBanner = true
	// Load the echo logger
	e.Use(middleware.Logger())
	// Prevents api from crashing if panic
	e.Use(middleware.Recover())

	// CORS
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"http://localhost:3000"},
		AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept},
	}))

	////////////
	// ROUTES //
	////////////

	// Templating
	// Static index.html route, serve html
	e.Static("/", "ui/build")

	// FILES
	// Upload file route
	e.POST("/upload", filemanager.Upload)
	// Download file route
	e.GET("/download", filemanager.Download)

	// PRODUCTS
	e.POST("/product", products.AddOne)
	e.GET("/product/:uuid", products.GetOne)
	e.GET("/products", products.GetAll)

	// PRODUCTS Request Redirect
	e.Any("api/*", products.RedirectToHost)

	// Loading env file
	err := godotenv.Load()
	if err != nil {
		e.Logger.Error("No env file loaded...")
	}

	// Log stuff if port is busy f.e.
	e.Logger.Fatal(e.Start(":1323"))
}
