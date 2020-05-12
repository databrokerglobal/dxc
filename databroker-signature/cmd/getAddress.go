package cmd

import (
	"github.com/databrokerglobal/dxc/utils"

	"fmt"

	"github.com/spf13/cobra"
)

// getAddressCmd represents the getAddress command
var getAddressCmd = &cobra.Command{
	Use:   "getAddress",
	Short: "get public key and address from private key",
	Long: `get public key and address from private key.
	
example use:

go run main.go getAddress -p 0xae78c8b502571dba876742437f8bc78b689cf8518356c0921393d89caaf284ce`,
	Run: func(cmd *cobra.Command, args []string) {

		privateKey, _ := cmd.Flags().GetString("privateKey")

		getAddress(privateKey)
	},
}

func init() {
	rootCmd.AddCommand(getAddressCmd)

	getAddressCmd.Flags().StringP("privateKey", "p", "", "private key in hex format")
	getAddressCmd.MarkFlagRequired("privateKey")
}

func getAddress(privateKeyHex string) {

	hexPublicKey, err := utils.HexPublicKeyFromHexPrivateKey(privateKeyHex)
	if err != nil {
		fmt.Println("error calculating public key from private key: " + err.Error())
		return
	}
	fmt.Println("publicKey: " + hexPublicKey)

	address, err := utils.AddressFromHexPrivateKey(privateKeyHex)
	if err != nil {
		fmt.Println("error calculating address from private key: " + err.Error())
		return
	}
	fmt.Println("address: " + address)
}
