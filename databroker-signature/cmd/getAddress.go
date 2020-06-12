package cmd

import (
	"github.com/databrokerglobal/dxc/utils"
	"github.com/pkg/errors"

	"fmt"

	"github.com/spf13/cobra"
)

// GetAddressCmd represents the getAddress command
func GetAddressCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "getAddress",
		Short: "get public key and address from private key",
		Long: `get public key and address from private key.
		
	example use:

	go run main.go getAddress -p 0xae78c8b502571dba876742437f8bc78b689cf8518356c0921393d89caaf284ce`,
		RunE: func(cmd *cobra.Command, args []string) error {

			privateKey, _ := cmd.Flags().GetString("privateKey")

			output, err := getAddress(privateKey)
			if err != nil {
				fmt.Fprintf(cmd.OutOrStdout(), err.Error())
				return err
			}

			fmt.Fprintf(cmd.OutOrStdout(), output)

			return nil
		},
	}
	cmd.Flags().StringP("privateKey", "p", "", "private key in hex format")
	cmd.MarkFlagRequired("privateKey")
	return cmd
}

func init() {

	rootCmd.AddCommand(GetAddressCmd())
}

func getAddress(privateKeyHex string) (output string, err error) {

	output = ""

	hexPublicKey, err := utils.HexPublicKeyFromHexPrivateKey(privateKeyHex)
	if err != nil {
		return "", errors.Wrap(err, "error calculating public key from private key")
	}
	output += fmt.Sprintf("publicKey: %s\n", hexPublicKey)

	address, err := utils.AddressFromHexPrivateKey(privateKeyHex)
	if err != nil {
		return "", errors.Wrap(err, "error calculating address from private key")
	}
	output += fmt.Sprintf("address: %s\n", address)

	return output, nil
}
