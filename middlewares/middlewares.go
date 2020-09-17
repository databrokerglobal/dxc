package middlewares

import (
	"encoding/base64"
	"encoding/json"
	"os"

	"github.com/databrokerglobal/dxc/utils"
	"github.com/pkg/errors"
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

// CheckDXCProductKey is generic function to check the key
func CheckDXCProductKey(verificationDataB64 string) (did string, err error) {

	if verificationDataB64 == "" {
		return "", errors.New("DXC_PRODUCT_KEY or password are not included")
	}

	verificationData, err := base64.RawURLEncoding.DecodeString(verificationDataB64)
	if err != nil {
		return "", errors.Wrap(err, "Base64 encoding of DXC_PRODUCT_KEY is not valid")
	}
	verificationDataObject := VerificationData{}
	json.Unmarshal(verificationData, &verificationDataObject)

	// check signature is valid

	sigIsValid, err := utils.VerifySignature(verificationDataObject.UnsignedData, verificationDataObject.Signature, verificationDataObject.PublicKey)
	if err != nil {
		return "", errors.Wrap(err, "DXC_PRODUCT_KEY is not valid")
	}
	if !sigIsValid {
		return "", errors.New("Signature is not valid")
	}

	// check address in signed data is same as address derived from public key

	challengeData, err := base64.StdEncoding.DecodeString(verificationDataObject.UnsignedData)
	if err != nil {
		return "", errors.Wrap(err, "ase64 encoding of challenge data is not valid")
	}
	challengeDataObject := ChallengeDataObject{}
	json.Unmarshal(challengeData, &challengeDataObject)

	addressFromPubKey, err := utils.AddressFromHexPublicKey(verificationDataObject.PublicKey)
	if err != nil {
		return "", errors.Wrap(err, "Provided public key is not valid")
	}

	if addressFromPubKey != challengeDataObject.Address {
		return "", errors.New("The address in signed data is not the same as the one created from the public key passed as a parameter")
	}

	// TODO: check supplied challenge exists in db and is not older that the start of the deal

	// TODO: check address (take from public key -- use crypto utils) is allowed to use that did

	return challengeDataObject.DID, nil
}

// CheckDXCSecureKey checks the DXC secure key, for access to most admin functions
func CheckDXCSecureKey(dxcSecureKey string) (err error) {
	envDXCSecureKey := os.Getenv("DXC_SECURE_KEY")
	if envDXCSecureKey == "" {
		return nil
	}
	if dxcSecureKey == "" {
		return errors.New("DXC_SECURE_KEY not included in the headers")
	}
	if dxcSecureKey != envDXCSecureKey {
		return errors.New("DXC_SECURE_KEY is incorrect")
	}
	return nil
}
