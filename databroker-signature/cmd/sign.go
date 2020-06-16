package cmd

import (
	"github.com/databrokerglobal/dxc/utils"
	"github.com/pkg/errors"

	"fmt"

	"github.com/spf13/cobra"
)

// signCmd represents the sign command
func SignCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "sign",
		Short: "sign a piece of data with your private key",
		Long: `sign a piece of data with your private key
		
example use:

go run main.go sign -p 0xae78c8b502571dba876742437f8bc78b689cf8518356c0921393d89caaf284ce -d settlemint`,
		RunE: func(cmd *cobra.Command, args []string) error {

			data, _ := cmd.Flags().GetString("data")
			privateKey, _ := cmd.Flags().GetString("privateKey")

			output, err := sign(data, privateKey)
			if err != nil {
				fmt.Fprintf(cmd.OutOrStdout(), err.Error())
				return err
			}

			fmt.Fprintf(cmd.OutOrStdout(), output)

			return nil
		},
	}
	cmd.Flags().StringP("data", "d", "", "data to be signed (string)")
	cmd.MarkFlagRequired("data")

	cmd.Flags().StringP("privateKey", "p", "", "private key in hex format")
	cmd.MarkFlagRequired("privateKey")

	return cmd
}

func init() {

	rootCmd.AddCommand(SignCmd())
}

func sign(data string, privateKeyHex string) (output string, err error) {

	signature, err := utils.SignDataWithPrivateKey(data, privateKeyHex)
	if err != nil {
		return "", errors.Wrap(err, "error signing data with private key")
	}
	output = fmt.Sprintf("signature: %s\n", signature)

	return output, nil
}
