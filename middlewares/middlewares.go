package middlewares

import (
	"encoding/base64"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/databrokerglobal/dxc/utils"

	_ "github.com/databrokerglobal/dxc/docs"
	"github.com/labstack/echo/v4"
)

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

		sigIsValid, err := utils.VerifySignature(verificationDataObject.UnsignedData, verificationDataObject.Signature, verificationDataObject.PublicKey)
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

		// TODO: check address (take from public key -- use crypto utils) is allowed to use that did

		if err := next(c); err != nil {
			c.Error(err)
		}

		return nil
	}
}
