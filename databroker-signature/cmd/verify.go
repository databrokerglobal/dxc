package cmd

import (
	"databroker-signature/utils"

	"fmt"

	"github.com/spf13/cobra"
)

// verifyCmd represents the verify command
var verifyCmd = &cobra.Command{
	Use:   "verify",
	Short: "Verify a signature",
	Long: `Verify a provided signature.
	
	You must provide the signature, the data that was signed, and the public key corresponding to the private key used to generate the signature`,
	Run: func(cmd *cobra.Command, args []string) {

		data, _ := cmd.Flags().GetString("data")
		signature, _ := cmd.Flags().GetString("signature")
		publicKey, _ := cmd.Flags().GetString("publicKey")

		verify(data, signature, publicKey)
	},
}

func init() {
	rootCmd.AddCommand(verifyCmd)

	verifyCmd.Flags().StringP("data", "d", "", "data that was signed (string)")
	verifyCmd.MarkFlagRequired("data")

	verifyCmd.Flags().StringP("signature", "s", "", "signature in hex format (string)")
	verifyCmd.MarkFlagRequired("signature")

	verifyCmd.Flags().StringP("publicKey", "k", "", "public key in hex format (string")
	verifyCmd.MarkFlagRequired("publicKey")
}

func verify(data string, signature string, publicKeyHex string) {

	valid := utils.VerifySignature(data, signature, publicKeyHex)
	if valid {
		fmt.Println("✔️✔️ the signature is valid ✔️✔️")
	} else {
		fmt.Println("⚠️⚠️ !! the signature is not valid !! ⚠️⚠️")
	}
}
