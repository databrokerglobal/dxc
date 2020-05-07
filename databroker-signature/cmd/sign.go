package cmd

import (
	"crypto/ecdsa"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"

	"github.com/spf13/cobra"

	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/crypto"
)

// Wallet struc to read wallet json file
type Wallet struct {
	PrivateKey          string `json:"privateKey"`
	PublicKey           string `json:"publicKey"`
	CompressedPublicKey string `json:"compressedPublicKey"`
	Address             string `json:"address"`
}

// signCmd represents the sign command
var signCmd = &cobra.Command{
	Use:   "sign",
	Short: "sign a piece of data with your private key",
	Long:  `sign a piece of data with your private key`,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("sign called")
		sign()
	},
}

func init() {
	rootCmd.AddCommand(signCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// signCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// signCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}

func sign() {

	// go-ethereum crypto stuff: https://goethereumbook.org/en/

	// read wallet file
	walletJSONFile, err := os.Open("wallet.json")
	if err != nil {
		log.Fatal(err)
	}
	defer walletJSONFile.Close()
	walletByteValue, _ := ioutil.ReadAll(walletJSONFile)
	var wallet Wallet
	json.Unmarshal(walletByteValue, &wallet)

	privateKey, err := crypto.GenerateKey()
	if err != nil {
		log.Fatal(err)
	}
	fmt.Print("private key: ")
	fmt.Println(privateKey)
	privateKeyBytes := crypto.FromECDSA(privateKey)
	privateKeyHex := hexutil.Encode(privateKeyBytes)
	fmt.Print("private key hex: ")
	fmt.Println(privateKeyHex)

	privateKeyFromBytes, err := crypto.ToECDSA(privateKeyBytes)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Print("privateKeyFromBytes: ")
	fmt.Println(privateKeyFromBytes)

	publicKey := privateKey.Public()
	publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
	if !ok {
		log.Fatal("error casting public key to ECDSA")
	}

	publicKeyBytes := crypto.FromECDSAPub(publicKeyECDSA)
	fmt.Print("public key: ")
	fmt.Println(hexutil.Encode(publicKeyBytes)[4:])

	// address := crypto.PubkeyToAddress(*publicKeyECDSA).Hex()
	// fmt.Println(address)
	reversedPrivateKeyBytes, err := hexutil.Decode(privateKeyHex)
	if err != nil {
		log.Fatal(err)
	}
	reversedPrivateKeyFromBytes, err := crypto.ToECDSA(reversedPrivateKeyBytes)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Print("reversedPrivateKeyFromBytes: ")
	fmt.Println(reversedPrivateKeyFromBytes)

}
