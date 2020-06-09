package main

import (
	"log"
	"os"
	"sync"

	"github.com/fatih/color"
	"github.com/joho/godotenv"

	"github.com/databrokerglobal/dxc/datasources"
	_ "github.com/databrokerglobal/dxc/docs"
	"github.com/databrokerglobal/dxc/ethereum"
	"github.com/databrokerglobal/dxc/middlewares"
	"github.com/databrokerglobal/dxc/syncstatus"
	"github.com/databrokerglobal/dxc/usermanager"

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
	// e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
	// 	AllowOrigins: []string{"http://localhost:3000"},
	// 	AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept},
	// }))
	e.Use(middleware.CORS())

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

	// DATASOURCES
	e.POST("/datasource", datasources.AddOneDatasource)                   //, middlewares.CheckLocalhost)
	e.POST("/add-example-datasources", datasources.AddExampleDatasources) //, middlewares.CheckLocalhost)
	e.GET("/datasource/:did", datasources.GetOneDatasource)               //, middlewares.CheckLocalhost)
	e.DELETE("/datasource/:did", datasources.DeleteDatasource)            //, middlewares.CheckLocalhost)
	e.GET("/datasources", datasources.GetAllDatasources)                  //, middlewares.CheckLocalhost)

	// SYNCSTATUSES
	e.GET("/syncstatuses/last24h", syncstatus.GetLatestSyncStatuses) //, middlewares.CheckLocalhost)

	// USERS
	e.POST("/user/authinfo", usermanager.SaveUserAuth) //, middlewares.CheckLocalhost)
	e.GET("/user/authinfo", usermanager.GetUserAuth)   //, middlewares.CheckLocalhost)

	////
	// routes accessible by users
	////

	e.GET("/getfile", datasources.GetFile, middlewares.DataAccessVerification)

	// API Datasources Request Redirect
	e.Any("/api/*", datasources.ProxyAPI, middlewares.DataAccessVerification)

	// Loading env file
	err := godotenv.Load()
	if err != nil {
		e.Logger.Info("No env file loaded. It's ok if you are running with docker and if you passed the .enf file that way.")
	}

	dxcHost := os.Getenv("DXC_HOST")
	if dxcHost == "" {
		log.Fatalf("DXC_HOST env variable is not set!")
	}

	/////////////////
	// GO ROUTINES //
	/////////////////

	var wg sync.WaitGroup

	wg.Add(1)

	//////////////////////////
	// Hosts Checker Routine //
	//////////////////////////

	go func() {
		// datasources.CheckHost()
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

	go datasources.ExecuteStatusTicker()

	port := "8080"

	// Log stuff if port is busy f.e.
	e.Logger.Fatal(e.Start(":" + port))
}
