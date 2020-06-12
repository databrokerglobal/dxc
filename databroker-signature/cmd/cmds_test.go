package cmd

import (
	"bytes"
	"io/ioutil"
	"testing"
)

func TestGetAddressCmd(t *testing.T) {
	cmd := GetAddressCmd()
	b := bytes.NewBufferString("")
	cmd.SetOut(b)
	cmd.SetArgs([]string{"-p", "0xae78c8b502571dba876742437f8bc78b689cf8518356c0921393d89caaf284ce"})
	cmd.Execute()
	out, err := ioutil.ReadAll(b)
	if err != nil {
		t.Fatal(err)
	}
	output := string(out)
	expectedOutput := `publicKey: 0x04a7c36f8064f2c4075ed38db509e46bfd29ebe73bb3c23afeaa039ef8b9803b93fa95790cb386c7204c483c0c057c8d1a1b08a536caddc0c8e8e12d72d255916d
address: 0x2f112ad225E011f067b2E456532918E6D679F978
`
	if output != expectedOutput {
		t.Errorf("Output not correct. Should be\n\n%s\n\nbut is\n\n%s", expectedOutput, output)
	}
}
