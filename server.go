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
	"github.com/databrokerglobal/dxc/syncstatus"
	"github.com/databrokerglobal/dxc/usermanager"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	echoSwagger "github.com/swaggo/echo-swagger"

	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"time"

	"github.com/databrokerglobal/dxc/database"
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
		getNewSentinelHUBAccessToken() // get first acccess_token
		wg.Done()
		ticker() // automatic fetch of access_token every 30 minutes
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

func getNewSentinelHUBAccessToken() {

	data := url.Values{
		"client_id":     {"cb4535f7-4a15-4e40-8533-e4913735cc01"},
		"client_secret": {"0|E{6W}(3<,6s!<g*OIXyCwQV%lEn:zxAf?$VGJu"},
		"grant_type":    {"client_credentials"},
	}

	resp, err := http.PostForm("https://services.sentinel-hub.com/oauth/token", data)

	if err != nil {
		fmt.Println("## Inside main ERROR")
		panic(err)
	}

	var res map[string]interface{}

	json.NewDecoder(resp.Body).Decode(&res)

	//fmt.Println(res["access_token"])

	// add token in database

	str := fmt.Sprintf("%v", res["access_token"])

	//fmt.Println("")
	//fmt.Println(str)

	database.DBInstance.CreateSentiID(str)

	//fmt.Println("")
	returnedSentiID, err := database.DBInstance.GetLatestSentiID()
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Saved TOKEN = " + returnedSentiID)

	//fmt.Println("*********")
}

func ticker() {

	fmt.Println("## Ticker initiating ")

	ticker := time.NewTicker(30 * time.Minute)
	done := make(chan bool)
	go func() {
		for {
			select {
			case <-done:
				return
			case t := <-ticker.C:
				fmt.Println("Accessing new token at", t)
				getNewSentinelHUBAccessToken()
			}
		}
	}()

	//time.Sleep(50 * time.Second) // this can stop the infinite ticker
	//ticker.Stop()
	//done <- true
	//fmt.Println("Ticker stopped")

	fmt.Println("## Ticker running in-background ")

}
