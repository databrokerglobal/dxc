package main

import (
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/fatih/color"
	"github.com/joho/godotenv"

	"github.com/databrokerglobal/dxc/database"
	"github.com/databrokerglobal/dxc/datasources"
	_ "github.com/databrokerglobal/dxc/docs"
	"github.com/databrokerglobal/dxc/ethereum"
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

// @securityDefinitions.apikey ApiKeyAuth
// @in header
// @name DXC_SECURE_KEY

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

	// Loading env file
	err := godotenv.Load()
	if err != nil {
		e.Logger.Info("No env file loaded. It's ok if you are running with docker and if you passed the .enf file that way.")
	}

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
	e.POST("/datasource", datasources.AddOneDatasource)
	e.POST("/add-example-datasources", datasources.AddExampleDatasources)
	e.GET("/datasource/:did", datasources.GetOneDatasource)
	e.DELETE("/datasource/:did", datasources.DeleteDatasource)
	e.PUT("/datasource/:did", datasources.UpdateDatasource)
	e.GET("/datasources", datasources.GetAllDatasources)

	// SYNCSTATUSES
	e.GET("/syncstatuses/last24h", syncstatus.GetLatestSyncStatuses)

	// USERS
	e.POST("/user/authinfo", usermanager.SaveUserAuth)
	e.GET("/user/authinfo", usermanager.GetUserAuth)

	// VERSION INFO
	e.GET("/user/versioninfo", usermanager.GetVersionInfo)
	e.GET("/user/versionhistory", usermanager.GetVersionHistory)
	e.DELETE("/user/versionhistory", usermanager.DeleteVersionHistory)

	saveVersionInfoInDatabase()

	////
	// routes accessible by users
	////

	e.GET("/getfile", datasources.GetFile)

	// API Datasources Request Redirect
	e.Any("/api/*", datasources.ProxyAPI)

	// Validate mqtt access for mqtt proxy
	e.Any("/mqtt/:cmd", datasources.CheckMQTT)

	dxcHost := os.Getenv("DXC_HOST")
	if dxcHost == "" {
		log.Fatalf("DXC_HOST env variable is not set!")
	}
	halt := os.Getenv("HALT_ON_NO_INTERNET")
	if !checkInternet() && (halt == "1" || halt == "true") {
		color.Red("Set HALT_ON_NO_INTERNET to 0 in .env file to ignore this checking and continue installing/restarting DXC server")
		color.Red("If this check is skipped then note that 'Network error' will be displayed in multiple components of UI")
		color.Red("")
		log.Fatalf("Internet is required to access datasources availibity")
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
		datasources.CheckHost() // checks on server start
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

func saveVersionInfoInDatabase() {
	// NOTE: This version number must be updated on every PR
	var version = "1.0.5"

	installedVersionInfo, err := database.DBInstance.GetInstalledVersionInfo()
	if err != nil {
		log.Fatalf("DXC_VERSION not set : " + err.Error())
	}

	forceUpgrade := os.Getenv("FORCE_UPGRADE")
	if installedVersionInfo != nil && (forceUpgrade == "1" || forceUpgrade == "true") {
		color.Green(" ")
		color.Green("---------------------------- FORCED UPGRADE ----------------------------  ")
		color.Green(" ")
		installedVersionInfo = nil
	}

	if installedVersionInfo != nil {
		if installedVersionInfo.Upgrade {
			if installedVersionInfo.Latest == version {
				color.Green(" ")
				color.Green("---------------------------- UPGRADE INSTALLATION ----------------------------  ")
				color.Green(" ")
			} else {
				haltOnUpgrade := os.Getenv("HALT_ON_UPGRADE_AVAILABLE")
				if haltOnUpgrade == "1" || haltOnUpgrade == "true" {
					color.Red(" ")
					color.Red("UPGRADE REQUIRED")
					color.Red(" ")
					color.Red("Current version is NOT the latest version available")
					color.Red("Set HALT_ON_UPGRADE_AVAILABLE to 0 in .env file to ignore this and continue with current version.")
					color.Red(" ")
					log.Fatalf("New DXC VERSION avaiable, please upgrade !!!!!!!!!!!!!!!!!!!!!!!!!!!!! ")
				}
			}
		} else {
			color.Green("---------------------------- RESTART ----------------------------  ")
			color.Green("DXC VERSION " + installedVersionInfo.Version)
			color.Green("Installed On " + installedVersionInfo.Checked)
			return
		}
	} else {
		color.Green(" ")
		color.Green("---------------------------- FRESH INSTALLATION ----------------------------  ")
		color.Green(" ")
	}
	// installing DXC for the first time so read from hardocded value set on TOP and store in database
	installedVersion := version
	currentTime := time.Now()
	installedDate := currentTime.Format("02-January-2006 15:04:05 Monday")
	if forceUpgrade == "1" || forceUpgrade == "true" {
		err = database.DBInstance.SaveInstalledVersionInfo(installedVersion, installedDate, true, "FORCED")
	} else {
		err = database.DBInstance.SaveInstalledVersionInfo(installedVersion, installedDate, false, "LATEST")
	}
	if err != nil {
		log.Fatalf("DXC_VERSION not set in database : " + err.Error())
	}
	color.Green("DXC VERSION " + installedVersion)
	color.Green("Installed On " + installedDate)
}

func checkInternet() bool {
	_, netErrors := http.Get("https://www.google.com")
	if netErrors != nil {
		color.Red("")
		color.Red("!!!!!!!!! INTERNET NOT AVAILABLE")
		color.Red("")
		return false
	}
	return true
}
