package main

import (
	"sync"

	"github.com/fatih/color"
	"github.com/joho/godotenv"

	_ "github.com/databrokerglobal/dxc/docs"
	"github.com/databrokerglobal/dxc/ethereum"
	"github.com/databrokerglobal/dxc/filemanager"
	"github.com/databrokerglobal/dxc/middlewares"
	"github.com/databrokerglobal/dxc/products"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	echoSwagger "github.com/swaggo/echo-swagger"
)

// @title DXC
// @version 1.0
// @description Data eXchange Controller API

// @contact.name Databroker Github Repo
// @contact.url https://github.com/databrokerglobal/dxc

// @license.name License details
// @license.url https://github.com/databrokerglobal/dxc/blob/master/dbdao-license.txt
func main() {

	color.Blue(`
      DDDDDDDDDDDDD       XXXXXXX       XXXXXXX       CCCCCCCCCCCCC
      D::::::::::::DDD    X:::::X       X:::::X    CCC::::::::::::C
      D:::::::::::::::DD  X:::::X       X:::::X  CC:::::::::::::::C
      DDD:::::DDDDD:::::D X::::::X     X::::::X C:::::CCCCCCCC::::C
        D:::::D    D:::::DXXX:::::X   X:::::XXXC:::::C       CCCCCC
        D:::::D     D:::::D  X:::::X X:::::X  C:::::C
        D:::::D     D:::::D   X:::::X:::::X   C:::::C
        D:::::D     D:::::D    X:::::::::X    C:::::C
        D:::::D     D:::::D    X:::::::::X    C:::::C
        D:::::D     D:::::D   X:::::X:::::X   C:::::C
        D:::::D     D:::::D  X:::::X X:::::X  C:::::C
        D:::::D    D:::::DXXX:::::X   X:::::XXXC:::::C       CCCCCC
      DDD:::::DDDDD:::::D X::::::X     X::::::X C:::::CCCCCCCC::::C
      D:::::::::::::::DD  X:::::X       X:::::X  CC:::::::::::::::C
      D::::::::::::DDD    X:::::X       X:::::X    CCC::::::::::::C
      DDDDDDDDDDDDD       XXXXXXX       XXXXXXX       CCCCCCCCCCCCC
  `)

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
	e.Static("/", "build")

	e.GET("/swagger/*", echoSwagger.WrapHandler)

	////
	// routes for admin
	////

	// FILES
	// Upload file route
	e.POST("/files/upload", filemanager.Upload) //, middlewares.CheckLocalhost)
	// Download file route
	e.GET("/file/download", filemanager.Download) //, middlewares.CheckLocalhost)
	e.GET("/files", filemanager.GetAll)           //, middlewares.CheckLocalhost)

	// PRODUCTS
	e.POST("/product", products.AddOne)     //, middlewares.CheckLocalhost)
	e.GET("/product/:did", products.GetOne) //, middlewares.CheckLocalhost)
	e.GET("/products", products.GetAll)     //, middlewares.CheckLocalhost)

	////
	// routes accessible by users
	////

	e.GET("/getdata/:did/file", filemanager.GetDataFile, middlewares.DataAccessVerification)

	// PRODUCTS Request Redirect
	e.Any("/api/*", products.RedirectToHost)

	// Loading env file
	err := godotenv.Load()
	if err != nil {
		e.Logger.Error("No env file loaded...")
	}

	/////////////////
	// GO ROUTINES //
	/////////////////

	var wg sync.WaitGroup

	wg.Add(1)

	//////////////////////////
	// File Checker Routine //
	//////////////////////////

	go func() {
		filemanager.CheckingFiles()
		wg.Done()
	}()

	wg.Wait()

	wg.Add(1)

	go func() {
		products.CheckHost()
		wg.Done()
	}()

	/////////////////////////////////////
	// Ethereum RPC connection routine //
	/////////////////////////////////////

	wg.Wait()

	wg.Add(1)

	go func() {
		ethereum.ServeContract()
		wg.Done()
	}()

	wg.Wait()

	go products.ExecuteStatusTicker()

	go products.TestSendStatus()

	// Log stuff if port is busy f.e.
	e.Logger.Fatal(e.Start(":8080"))

}
