package cmd

import (
	"github.com/databrokerglobal/dxc/utils"

	"fmt"

	"github.com/spf13/cobra"
)

// verifyCmd represents the verify command
var verifyCmd = &cobra.Command{
	Use:   "verify",
	Short: "Verify a signature",
	Long: `Verify a provided signature.
	
You must provide the signature, the data that was signed, and the public key corresponding to the private key used to generate the signature
	
example use:

go run main.go verify -k 0x04a7c36f8064f2c4075ed38db509e46bfd29ebe73bb3c23afeaa039ef8b9803b93fa95790cb386c7204c483c0c057c8d1a1b08a536caddc0c8e8e12d72d255916d -s 0xc83d417a3b99535e784a72af0d9772c019c776aa0dfe4313c001a5548f6cf254477f5334c30da59531bb521278edc98f1959009253dda4ee9f63fe5562ead5aa00 -d bou

above example assumes you used the below private key when signing:

go run main.go sign -p 0xae78c8b502571dba876742437f8bc78b689cf8518356c0921393d89caaf284ce -d bou`,
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

	valid, err := utils.VerifySignature(data, signature, publicKeyHex)
	if err != nil {
		fmt.Println("error verifying signature. err: " + err.Error())
		return
	}
	if valid {
		fmt.Println("✔️✔️ the signature is valid ✔️✔️")
	} else {
		fmt.Println("⚠️⚠️ !! the signature is not valid !! ⚠️⚠️")
	}
}
