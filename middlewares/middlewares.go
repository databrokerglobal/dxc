package middlewares

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"io/ioutil"
	"net/http"

	"github.com/databrokerglobal/dxc/utils"
	"github.com/pkg/errors"

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

		verificationDataB64 := c.QueryParam("DXC_PRODUCT_KEY") // File type request

		if verificationDataB64 == "" {
			verificationDataB64 = c.Request().Header.Get("DXC_PRODUCT_KEY") // API type request
			if verificationDataB64 == "" {
				// check if MQTT type request
				var bodyBytes []byte
				if c.Request().Body != nil {
					bodyBytes, _ = ioutil.ReadAll(c.Request().Body)
				}
				// Restore the io.ReadCloser to its original state
				c.Request().Body = ioutil.NopCloser(bytes.NewBuffer(bodyBytes))

				body := map[string]interface{}{}
				if err := json.Unmarshal(bodyBytes, &body); err == nil {
					if _, usernameExists := body["Username"]; usernameExists {
						if valPassword, passwordExists := body["Password"]; passwordExists {
							verificationDataB64 = valPassword.(string)
						}
					}
				}
			}
		}

		if verificationDataB64 == "" {
			return c.JSON(http.StatusUnauthorized, "DXC_PRODUCT_KEY or password are not included")
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

// CheckDXCProductKey is generic function to check the key
func CheckDXCProductKey(verificationDataB64 string) error {

	if verificationDataB64 == "" {
		return errors.New("DXC_PRODUCT_KEY or password are not included")
	}

	verificationData, err := base64.RawURLEncoding.DecodeString(verificationDataB64)
	if err != nil {
		return errors.Wrap(err, "Base64 encoding of DXC_PRODUCT_KEY is not valid")
	}
	verificationDataObject := VerificationData{}
	json.Unmarshal(verificationData, &verificationDataObject)

	// check signature is valid

	sigIsValid, err := utils.VerifySignature(verificationDataObject.UnsignedData, verificationDataObject.Signature, verificationDataObject.PublicKey)
	if err != nil {
		return errors.Wrap(err, "DXC_PRODUCT_KEY is not valid")
	}
	if !sigIsValid {
		return errors.New("Signature is not valid")
	}

	// check address in signed data is same as address derived from public key

	challengeData, err := base64.StdEncoding.DecodeString(verificationDataObject.UnsignedData)
	if err != nil {
		return errors.Wrap(err, "ase64 encoding of challenge data is not valid")
	}
	challengeDataObject := ChallengeDataObject{}
	json.Unmarshal(challengeData, &challengeDataObject)

	addressFromPubKey, err := utils.AddressFromHexPublicKey(verificationDataObject.PublicKey)
	if err != nil {
		return errors.Wrap(err, "Provided public key is not valid")
	}

	if addressFromPubKey != challengeDataObject.Address {
		return errors.New("The address in signed data is not the same as the one created from the public key passed as a parameter")
	}

	// TODO: check supplied challenge exists in db and is not older that the start of the deal

	// TODO: check address (take from public key -- use crypto utils) is allowed to use that did

	return nil
}
