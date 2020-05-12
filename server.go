package main

import (
	"encoding/base64"
	"encoding/json"
	"net/http"
	"strings"
	"sync"

	"github.com/databrokerglobal/dxc/cryptoutils"

	"github.com/fatih/color"
	"github.com/joho/godotenv"

	_ "github.com/databrokerglobal/dxc/docs"
	"github.com/databrokerglobal/dxc/ethereum"
	"github.com/databrokerglobal/dxc/filemanager"
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
	e.POST("/files/upload", filemanager.Upload, CheckLocalhost)
	// Download file route
	e.GET("/file/download", filemanager.Download, CheckLocalhost)
	e.GET("/files", filemanager.GetAll, CheckLocalhost)

	// PRODUCTS
	e.POST("/product", products.AddOne, CheckLocalhost)
	e.GET("/product/:uuid", products.GetOne, CheckLocalhost)
	e.GET("/products", products.GetAll, CheckLocalhost)

	////
	// routes accessible by users
	////

	e.GET("/getdata/:did/file", filemanager.GetDataFile, DataAccessVerification)

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

	wg.Add(2)

	//////////////////////////
	// File Checker Routine //
	//////////////////////////

	go func() {
		filemanager.CheckingFiles()
		wg.Done()
	}()

	/////////////////////////////////////
	// Ethereum RPC connection routine //
	/////////////////////////////////////

	go func() {
		ethereum.ServeContract()
		wg.Done()
	}()

	wg.Wait()

	// Log stuff if port is busy f.e.
	e.Logger.Fatal(e.Start(":8080"))

}

// CheckLocalhost is middlewaere to check if request if from localhost
func CheckLocalhost(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {

		arrayHost := strings.Split(c.Request().Host, ":") // splits the host and the port

		if arrayHost[0] != "localhost" {
			return c.String(http.StatusUnauthorized, "this route is only accessible locally")
		}

		if err := next(c); err != nil {
			c.Error(err)
		}

		return nil
	}
}

// VerificationData is a struct to convert url verification data to json
type VerificationData struct {
	UnsignedData string `json:"unsignedData"`
	Signature    string `json:"signature"`
	PublicKey    string `json:"publicKey"`
}

// ChallengeDataObject is a struct to convert data that was used for the signature to json
type ChallengeDataObject struct {
	DID       string `json:"did"`
	Challenge string `json:"challenge"`
}

// DataAccessVerification is middlewaere to check access to data
func DataAccessVerification(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {

		verificationDataB64 := c.QueryParam("verificationdata")
		did := c.Param("did")

		verificationData, err := base64.RawURLEncoding.DecodeString(verificationDataB64)
		if err != nil {
			return c.String(http.StatusBadRequest, "Base64 encoding of verification data is not valid. err: "+err.Error())
		}
		verificationDataObject := VerificationData{}
		json.Unmarshal(verificationData, &verificationDataObject)

		// check signature is valid

		sigIsValid, err := cryptoutils.VerifySignature(verificationDataObject.UnsignedData, verificationDataObject.Signature, verificationDataObject.PublicKey)
		if err != nil {
			return c.String(http.StatusBadRequest, "Verification data is not valid. err: "+err.Error())
		}
		if !sigIsValid {
			return c.String(http.StatusUnauthorized, "Signature is not valid.")
		}

		// check did in signed data is same in param

		challengeData, err := base64.RawStdEncoding.DecodeString(verificationDataObject.UnsignedData)
		if err != nil {
			return c.String(http.StatusBadRequest, "Base64 encoding of challenge data is not valid. err: "+err.Error())
		}
		challengeDataObject := ChallengeDataObject{}
		json.Unmarshal(challengeData, &challengeDataObject)

		if did != challengeDataObject.DID {
			return c.String(http.StatusBadRequest, "The DID of the product in signed data is not the same as the one passed as a parameter.")
		}

		// TODO: check supplied challenge exists in db and is not older that the start of the deal

		// TODO: check address (take from public key -- use cryptoutils) is allowed to use that did

		if err := next(c); err != nil {
			c.Error(err)
		}

		return nil
	}
}
