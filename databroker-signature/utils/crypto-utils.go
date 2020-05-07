// go-ethereum crypto stuff: https://goethereumbook.org/en/

package utils

import (
	"bytes"
	"crypto/ecdsa"
	"log"

	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/crypto"
)

// HexPublicKeyFromHexPrivateKey takes a private key in hex format and returns the corresponding public key in hex format
func HexPublicKeyFromHexPrivateKey(hexPrivateKey string) (hexPublicKey string) {

	privateKey := privateKeyFromHexPrivateKey(hexPrivateKey)

	publicKey := privateKey.Public()
	publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
	if !ok {
		log.Fatal("error casting public key to ECDSA")
	}
	publicKeyBytes := crypto.FromECDSAPub(publicKeyECDSA)
	hexPublicKey = hexutil.Encode(publicKeyBytes)

	return
}

// AddressFromHexPrivateKey takes a private key in hex format and returns the corresponding address
func AddressFromHexPrivateKey(hexPrivateKey string) (address string) {

	privateKey := privateKeyFromHexPrivateKey(hexPrivateKey)

	publicKey := privateKey.Public()
	publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
	if !ok {
		log.Fatal("error casting public key to ECDSA")
	}

	address = crypto.PubkeyToAddress(*publicKeyECDSA).Hex()

	return
}

// SignDataWithPrivateKey takes a piece of data (string), and signs the hash of that piece of data with the provided private key (hex string)
func SignDataWithPrivateKey(data string, hexPrivateKey string) (signature string) {

	privateKey := privateKeyFromHexPrivateKey(hexPrivateKey)

	dataBytes := []byte(data)
	hashData := crypto.Keccak256Hash(dataBytes)

	signatureBytes, err := crypto.Sign(hashData.Bytes(), privateKey)
	if err != nil {
		log.Fatal(err)
	}

	signature = hexutil.Encode(signatureBytes)

	return
}

// VerifySignature takes a signature and verify that it correspond to the provided piece of data and public key (in hex format)
func VerifySignature(data string, signature string, hexPublicKey string) bool {

	publicKeyBytes, err := hexutil.Decode(hexPublicKey)
	if err != nil {
		log.Fatal(err)
	}

	dataBytes := []byte(data)
	hashData := crypto.Keccak256Hash(dataBytes)

	signatureBytes, err := hexutil.Decode(signature)
	if err != nil {
		log.Fatal(err)
	}
	sigPublicKeyECDSA, err := crypto.SigToPub(hashData.Bytes(), signatureBytes)
	if err != nil {
		log.Fatal(err)
	}

	sigPublicKeyBytes := crypto.FromECDSAPub(sigPublicKeyECDSA)

	return bytes.Equal(sigPublicKeyBytes, publicKeyBytes)
}

func privateKeyFromHexPrivateKey(hexPrivateKey string) (privateKey *ecdsa.PrivateKey) {

	privateKey, err := crypto.HexToECDSA(hexPrivateKey[2:])
	if err != nil {
		log.Fatal(err)
	}

	return
}
