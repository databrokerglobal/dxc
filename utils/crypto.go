// go-ethereum crypto stuff explanation: https://goethereumbook.org/en/

package utils

import (
	"bytes"
	"crypto/ecdsa"

	errors "github.com/pkg/errors"

	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/crypto"
)

// HexPublicKeyFromHexPrivateKey takes a private key in hex format and returns the corresponding public key in hex format
func HexPublicKeyFromHexPrivateKey(hexPrivateKey string) (hexPublicKey string, err error) {

	privateKey, err := privateKeyFromHexPrivateKey(hexPrivateKey)
	if err != nil {
		return "", errors.Wrap(err, "could not calculate private key from hex private key")
	}

	publicKey := privateKey.Public()
	publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
	if !ok {
		return "", errors.New("error casting public key to ECDSA")
	}
	publicKeyBytes := crypto.FromECDSAPub(publicKeyECDSA)
	hexPublicKey = hexutil.Encode(publicKeyBytes)

	return
}

// AddressFromHexPrivateKey takes a private key in hex format and returns the corresponding address
func AddressFromHexPrivateKey(hexPrivateKey string) (address string, err error) {

	privateKey, err := privateKeyFromHexPrivateKey(hexPrivateKey)
	if err != nil {
		return "", errors.Wrap(err, "could not calculate private key from hex private key")
	}

	publicKey := privateKey.Public()
	publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
	if !ok {
		return "", errors.New("error casting public key to ECDSA")
	}

	address = crypto.PubkeyToAddress(*publicKeyECDSA).Hex()

	return
}

// AddressFromHexPublicKey takes a public key in hex format and returns the corresponding address
func AddressFromHexPublicKey(hexPublicKey string) (address string, err error) {

	publicKeyECDSA, err := publicKeyFromHexPublicKey(hexPublicKey)
	if err != nil {
		return "", errors.Wrap(err, "could not calculate public key from hex public key")
	}

	address = crypto.PubkeyToAddress(*publicKeyECDSA).Hex()

	return
}

// SignDataWithPrivateKey takes a piece of data (string), and signs the hash of that piece of data with the provided private key (hex string)
func SignDataWithPrivateKey(data string, hexPrivateKey string) (signature string, err error) {

	privateKey, err := privateKeyFromHexPrivateKey(hexPrivateKey)
	if err != nil {
		return "", errors.Wrap(err, "could not calculate private key from hex private key")
	}

	dataBytes := []byte(data)
	hashData := crypto.Keccak256Hash(dataBytes)

	signatureBytes, err := crypto.Sign(hashData.Bytes(), privateKey)
	if err != nil {
		return "", errors.Wrap(err, "error of the signing function")
	}

	signature = hexutil.Encode(signatureBytes)

	return
}

// VerifySignature takes a signature and verify that it correspond to the provided piece of data and public key (in hex format)
func VerifySignature(data string, signature string, hexPublicKey string) (valid bool, err error) {

	publicKeyBytes, err := hexutil.Decode(hexPublicKey)
	if err != nil {
		return false, errors.Wrap(err, "error decoding hex public key")
	}

	dataBytes := []byte(data)
	hashData := crypto.Keccak256Hash(dataBytes)

	signatureBytes, err := hexutil.Decode(signature)
	if err != nil {
		return false, errors.Wrap(err, "error decoding signature")
	}
	sigPublicKeyECDSA, err := crypto.SigToPub(hashData.Bytes(), signatureBytes)
	if err != nil {
		return false, errors.Wrap(err, "error finding public key from signature")
	}

	sigPublicKeyBytes := crypto.FromECDSAPub(sigPublicKeyECDSA)

	valid = bytes.Equal(sigPublicKeyBytes, publicKeyBytes)

	return
}

func privateKeyFromHexPrivateKey(hexPrivateKey string) (privateKey *ecdsa.PrivateKey, err error) {

	privateKey, err = crypto.HexToECDSA(hexPrivateKey[2:])
	if err != nil {
		return nil, errors.Wrap(err, "error of HexToECDSA")
	}

	return
}

func publicKeyFromHexPublicKey(hexPublicKey string) (publicKey *ecdsa.PublicKey, err error) {

	publicKeyBytes, err := hexutil.Decode(hexPublicKey)
	if err != nil {
		return nil, errors.Wrap(err, "error decoding hex public key")
	}

	publicKey, err = crypto.UnmarshalPubkey(publicKeyBytes)
	if err != nil {
		return nil, errors.Wrap(err, "error unmarshaling public key")
	}

	return
}
