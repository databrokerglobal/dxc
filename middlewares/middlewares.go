package middlewares

import (
	"encoding/base64"
	"encoding/json"
	"net/http"

	"github.com/databrokerglobal/dxc/utils"

	_ "github.com/databrokerglobal/dxc/docs"
	"github.com/labstack/echo/v4"
)

// RunningTest is true when we are running tests
var RunningTest = false

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
	Address   string `json:"address"`
}

// DataAccessVerification is middlewaere to check access to data
func DataAccessVerification(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {

		verificationDataB64 := c.QueryParam("DXC_PRODUCT_KEY")

		if verificationDataB64 == "" {
			verificationDataB64 = c.Request().Header.Get("DXC_PRODUCT_KEY")
			if verificationDataB64 == "" {
				return c.JSON(http.StatusUnauthorized, "DXC_PRODUCT_KEY is not included")
			}
		}

		verificationData, err := base64.RawURLEncoding.DecodeString(verificationDataB64)
		if err != nil {
			return c.String(http.StatusBadRequest, "Base64 encoding of DXC_PRODUCT_KEY is not valid. err: "+err.Error())
		}
		verificationDataObject := VerificationData{}
		json.Unmarshal(verificationData, &verificationDataObject)

		// check signature is valid

		sigIsValid, err := utils.VerifySignature(verificationDataObject.UnsignedData, verificationDataObject.Signature, verificationDataObject.PublicKey)
		if err != nil {
			return c.String(http.StatusBadRequest, "DXC_PRODUCT_KEY is not valid. err: "+err.Error())
		}
		if !sigIsValid {
			return c.String(http.StatusUnauthorized, "Signature is not valid.")
		}

		// check address in signed data is same as address derived from public key

		challengeData, err := base64.StdEncoding.DecodeString(verificationDataObject.UnsignedData)
		if err != nil {
			return c.String(http.StatusBadRequest, "Base64 encoding of challenge data is not valid. err: "+err.Error())
		}
		challengeDataObject := ChallengeDataObject{}
		json.Unmarshal(challengeData, &challengeDataObject)

		addressFromPubKey, err := utils.AddressFromHexPublicKey(verificationDataObject.PublicKey)
		if err != nil {
			return c.String(http.StatusBadRequest, "Provided public key is not valid: "+err.Error())
		}

		if addressFromPubKey != challengeDataObject.Address {
			return c.String(http.StatusBadRequest, "The address in signed data is not the same as the one created from the public key passed as a parameter.")
		}

		// TODO: check supplied challenge exists in db and is not older that the start of the deal

		// TODO: check address (take from public key -- use crypto utils) is allowed to use that did

		// pass did to the request
		c.Request().Header.Set("did", challengeDataObject.DID)

		if !RunningTest {
			if err := next(c); err != nil {
				c.Error(err)
			}
		}

		return nil
	}
}
