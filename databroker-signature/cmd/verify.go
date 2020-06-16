package cmd

import (
	"github.com/databrokerglobal/dxc/utils"
	"github.com/pkg/errors"

	"fmt"

	"github.com/spf13/cobra"
)

// VerifyCmd() represents the verify command
func VerifyCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "verify",
		Short: "Verify a signature",
		Long: `Verify a provided signature.
		
You must provide the signature, the data that was signed, and the public key corresponding to the private key used to generate the signature
		
example use:

go run main.go verify -k 0x04a7c36f8064f2c4075ed38db509e46bfd29ebe73bb3c23afeaa039ef8b9803b93fa95790cb386c7204c483c0c057c8d1a1b08a536caddc0c8e8e12d72d255916d -s 0x863890907c64a31ff34759cdbc549fedb1c613257d0fb0ac8ddd5bb3c2ed5c247fdd7a30821d1a83dc9827e71b32fcb5af6c7306cc5ddafc7dbcd2299876570801 -d settlemint

above example assumes you used the below private key when signing:

go run main.go sign -p 0xae78c8b502571dba876742437f8bc78b689cf8518356c0921393d89caaf284ce -d settlemint`,
		RunE: func(cmd *cobra.Command, args []string) error {

			data, _ := cmd.Flags().GetString("data")
			signature, _ := cmd.Flags().GetString("signature")
			publicKey, _ := cmd.Flags().GetString("publicKey")

			output, err := verify(data, signature, publicKey)
			if err != nil {
				fmt.Fprintf(cmd.OutOrStdout(), err.Error())
				return err
			}

			fmt.Fprintf(cmd.OutOrStdout(), output)

			return nil
		},
	}
	cmd.Flags().StringP("data", "d", "", "data that was signed (string)")
	cmd.MarkFlagRequired("data")

	cmd.Flags().StringP("signature", "s", "", "signature in hex format (string)")
	cmd.MarkFlagRequired("signature")

	cmd.Flags().StringP("publicKey", "k", "", "public key in hex format (string")
	cmd.MarkFlagRequired("publicKey")

	return cmd
}

func init() {

	rootCmd.AddCommand(VerifyCmd())
}

func verify(data string, signature string, publicKeyHex string) (output string, err error) {

	valid, err := utils.VerifySignature(data, signature, publicKeyHex)
	if err != nil {
		return "", errors.Wrap(err, "error verifying signature")
	}
	if valid {
		output = "✔️✔️ the signature is valid ✔️✔️\n"
	} else {
		output = "⚠️⚠️ !! the signature is not valid !! ⚠️⚠️\n"
	}

	return output, nil
}
