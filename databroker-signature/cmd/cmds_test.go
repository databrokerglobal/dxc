package cmd

import (
	"bytes"
	"io/ioutil"
	"testing"

	"github.com/spf13/cobra"
)

func testCmd(t *testing.T, cmd *cobra.Command, arguments []string, expectedOutput string) {

	b := bytes.NewBufferString("")
	cmd.SetOut(b)
	cmd.SetArgs(arguments)
	cmd.Execute()
	out, err := ioutil.ReadAll(b)
	if err != nil {
		t.Fatal(err)
	}
	output := string(out)

	if output != expectedOutput {
		t.Errorf("Output not correct. Should be\n\n%s\n\nbut is\n\n%s", expectedOutput, output)
	}
}

func TestGetAddressCmd(t *testing.T) {
	cmd := GetAddressCmd()
	arguments := []string{
		"-p", "0xae78c8b502571dba876742437f8bc78b689cf8518356c0921393d89caaf284ce",
	}
	expectedOutput := `publicKey: 0x04a7c36f8064f2c4075ed38db509e46bfd29ebe73bb3c23afeaa039ef8b9803b93fa95790cb386c7204c483c0c057c8d1a1b08a536caddc0c8e8e12d72d255916d
address: 0x2f112ad225E011f067b2E456532918E6D679F978
`
	testCmd(t, cmd, arguments, expectedOutput)
}

func TestSignCmd(t *testing.T) {
	cmd := SignCmd()
	arguments := []string{
		"-p", "0xae78c8b502571dba876742437f8bc78b689cf8518356c0921393d89caaf284ce",
		"-d", "settlemint",
	}
	expectedOutput := `signature: 0x863890907c64a31ff34759cdbc549fedb1c613257d0fb0ac8ddd5bb3c2ed5c247fdd7a30821d1a83dc9827e71b32fcb5af6c7306cc5ddafc7dbcd2299876570801
`
	testCmd(t, cmd, arguments, expectedOutput)
}

func TestVerifyCmd(t *testing.T) {
	cmd := VerifyCmd()
	arguments := []string{
		"-k", "0x04a7c36f8064f2c4075ed38db509e46bfd29ebe73bb3c23afeaa039ef8b9803b93fa95790cb386c7204c483c0c057c8d1a1b08a536caddc0c8e8e12d72d255916d",
		"-s", "0x863890907c64a31ff34759cdbc549fedb1c613257d0fb0ac8ddd5bb3c2ed5c247fdd7a30821d1a83dc9827e71b32fcb5af6c7306cc5ddafc7dbcd2299876570801",
		"-d", "settlemint",
	}
	expectedOutput := "✔️✔️ the signature is valid ✔️✔️\n"
	testCmd(t, cmd, arguments, expectedOutput)

	cmd = VerifyCmd()
	arguments = []string{
		"-k", "0x04a7c36f8064f2c4075ed38db509e46bfd29ebe73bb3c23afeaa039ef8b9803b93fa95790cb386c7204c483c0c057c8d1a1b08a536caddc0c8e8e12d72d255916d",
		"-s", "0x863890907c64a31ff34759cdbc549fedb1c613257d0fb0ac8ddd5bb3c2ed5c247fdd7a30821d1a83dc9827e71b32fcb5af6c7306cc5ddafc7dbcd2299876570801",
		"-d", "settlemintz",
	}
	expectedOutput = "⚠️⚠️ !! the signature is not valid !! ⚠️⚠️\n"
	testCmd(t, cmd, arguments, expectedOutput)
}
