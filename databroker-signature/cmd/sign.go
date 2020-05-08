package cmd

import (
	"databroker-signature/utils"

	"fmt"

	"github.com/spf13/cobra"
)

// signCmd represents the sign command
var signCmd = &cobra.Command{
	Use:   "sign",
	Short: "sign a piece of data with your private key",
	Long:  `sign a piece of data with your private key`,
	Run: func(cmd *cobra.Command, args []string) {

		data, _ := cmd.Flags().GetString("data")
		privateKey, _ := cmd.Flags().GetString("privateKey")

		sign(data, privateKey)
	},
}

func init() {
	rootCmd.AddCommand(signCmd)

	signCmd.Flags().StringP("data", "d", "", "data to be signed (string)")
	signCmd.MarkFlagRequired("data")

	signCmd.Flags().StringP("privateKey", "p", "", "private key in hex format")
	signCmd.MarkFlagRequired("privateKey")
}

func sign(data string, privateKeyHex string) {

	signature := utils.SignDataWithPrivateKey(data, privateKeyHex)
	fmt.Println("signature: " + signature)
}
