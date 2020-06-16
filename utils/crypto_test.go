// go-ethereum crypto stuff explanation: https://goethereumbook.org/en/

package utils

import (
	"testing"
)

func TestHexPublicKeyFromHexPrivateKey(t *testing.T) {

	tables := []struct {
		privateKey    string
		shouldSucceed bool
		publicKey     string
	}{
		{
			"0xae78c8b502571dba876742437f8bc78b689cf8518356c0921393d89caaf284ce",
			true,
			"0x04a7c36f8064f2c4075ed38db509e46bfd29ebe73bb3c23afeaa039ef8b9803b93fa95790cb386c7204c483c0c057c8d1a1b08a536caddc0c8e8e12d72d255916d",
		},
		{
			"0xae78c8b502571dba876742437f8bc78b689cf8518356c0921393d89caaf284c", // private key not valid
			false,
			"",
		},
	}

	for i, table := range tables {
		hexPublicKey, err := HexPublicKeyFromHexPrivateKey(table.privateKey)
		if err != nil && table.shouldSucceed {
			t.Errorf("case %d: should have succeeded but got error: %s", i, err.Error())
		}
		if table.shouldSucceed && hexPublicKey != table.publicKey {
			t.Errorf("case %d: Result should be %s but is %s.", i, table.publicKey, hexPublicKey)
		}
	}
}

func TestAddressFromHexPrivateKey(t *testing.T) {

	tables := []struct {
		privateKey    string
		shouldSucceed bool
		address       string
	}{
		{
			"0xae78c8b502571dba876742437f8bc78b689cf8518356c0921393d89caaf284ce",
			true,
			"0x2f112ad225E011f067b2E456532918E6D679F978",
		},
		{
			"0xae78c8b502571dba876742437f8bc78b689cf8518356c0921393d89caaf284c", // private key not valid
			false,
			"",
		},
	}

	for i, table := range tables {
		address, err := AddressFromHexPrivateKey(table.privateKey)
		if err != nil && table.shouldSucceed {
			t.Errorf("case %d: should have succeeded but got error: %s", i, err.Error())
		}
		if table.shouldSucceed && address != table.address {
			t.Errorf("case %d: Result should be %s but is %s.", i, table.address, address)
		}
	}
}

func TestAddressFromHexPublicKey(t *testing.T) {

	tables := []struct {
		publicKey     string
		shouldSucceed bool
		address       string
	}{
		{
			"0x04a7c36f8064f2c4075ed38db509e46bfd29ebe73bb3c23afeaa039ef8b9803b93fa95790cb386c7204c483c0c057c8d1a1b08a536caddc0c8e8e12d72d255916d",
			true,
			"0x2f112ad225E011f067b2E456532918E6D679F978",
		},
		{
			"0x04a7c36f8064f2c4075ed38db509e46bfd29ebe73bb3c23afeaa039ef8b9803b93fa95790cb386c7204c483c0c057c8d1a1b08a536caddc0c8e8e12d72d255916", // public key not valid
			false,
			"",
		},
	}

	for i, table := range tables {
		address, err := AddressFromHexPublicKey(table.publicKey)
		if err != nil && table.shouldSucceed {
			t.Errorf("case %d: should have succeeded but got error: %s", i, err.Error())
		}
		if table.shouldSucceed && address != table.address {
			t.Errorf("case %d: Result should be %s but is %s.", i, table.address, address)
		}
	}
}

func TestSignDataWithPrivateKey(t *testing.T) {

	tables := []struct {
		data          string
		privateKey    string
		shouldSucceed bool
		signature     string
	}{
		{
			"eyJkaWQiOiIwMDAxIiwiY2hhbGxlbmdlIjoiMDAwMSJ9",
			"0xae78c8b502571dba876742437f8bc78b689cf8518356c0921393d89caaf284ce",
			true,
			"0xe82a7475c50b3473f9374a27370ff4487b56554faec3d87464feecb00c3fc3ac322ea62d5c7afd9fa6f76c364928171bd63aab821bcd49c0038f547761e3353500",
		},
		{
			"eyJkaWQiOiIwMDAxIiwiY2hhbGxlbmdlIjoiMDAwMSJ9",
			"0xae78c8b502571dba876742437f8bc78b689cf8518356c0921393d89caaf284", // private key not valid
			false,
			"",
		},
	}

	for i, table := range tables {
		signature, err := SignDataWithPrivateKey(table.data, table.privateKey)
		if err != nil && table.shouldSucceed {
			t.Errorf("case %d: should have succeeded but got error: %s", i, err.Error())
		}
		if table.shouldSucceed && signature != table.signature {
			t.Errorf("case %d: Result should be %s but is %s.", i, table.signature, signature)
		}
	}
}

func TestVerifySignature(t *testing.T) {

	tables := []struct {
		data          string
		signature     string
		publicKey     string
		shouldSucceed bool
		valid         bool
	}{
		{
			"eyJkaWQiOiIwMDAxIiwiY2hhbGxlbmdlIjoiMDAwMSJ9",
			"0xe82a7475c50b3473f9374a27370ff4487b56554faec3d87464feecb00c3fc3ac322ea62d5c7afd9fa6f76c364928171bd63aab821bcd49c0038f547761e3353500",
			"0x04a7c36f8064f2c4075ed38db509e46bfd29ebe73bb3c23afeaa039ef8b9803b93fa95790cb386c7204c483c0c057c8d1a1b08a536caddc0c8e8e12d72d255916d",
			true,
			true,
		},
		{
			"eyJkaWQiOiIwMDAxIiwiY2hhbGxlbmdlIjoiMDAwMSJ0", // data was changed
			"0xe82a7475c50b3473f9374a27370ff4487b56554faec3d87464feecb00c3fc3ac322ea62d5c7afd9fa6f76c364928171bd63aab821bcd49c0038f547761e3353500",
			"0x04a7c36f8064f2c4075ed38db509e46bfd29ebe73bb3c23afeaa039ef8b9803b93fa95790cb386c7204c483c0c057c8d1a1b08a536caddc0c8e8e12d72d255916d",
			true,
			false,
		},
		{
			"eyJkaWQiOiIwMDAxIiwiY2hhbGxlbmdlIjoiMDAwMSJ9",
			"0xf82a7475c50b3473f9374a27370ff4487b56554faec3d87464feecb00c3fc3ac322ea62d5c7afd9fa6f76c364928171bd63aab821bcd49c0038f547761e3353500", // signature is wrong
			"0x04a7c36f8064f2c4075ed38db509e46bfd29ebe73bb3c23afeaa039ef8b9803b93fa95790cb386c7204c483c0c057c8d1a1b08a536caddc0c8e8e12d72d255916d",
			false,
			false,
		},
		{
			"eyJkaWQiOiIwMDAxIiwiY2hhbGxlbmdlIjoiMDAwMSJ9",
			"0xe82a7475c50b3473f9374a27370ff4487b56554faec3d87464feecb00c3fc3ac322ea62d5c7afd9fa6f76c364928171bd63aab821bcd49c0038f547761e3353500",
			"0x04a7c36f8064f2c4075ed38db509e46bfd29ebe73bb3c23afeaa039ef8b9803b93fa95790cb386c7204c483c0c057c8d1a1b08a536caddc0c8e8e12d72d25591", // public key not valid
			false,
			true,
		},
	}

	for i, table := range tables {
		valid, err := VerifySignature(table.data, table.signature, table.publicKey)
		if err != nil && table.shouldSucceed {
			t.Errorf("case %d: should have succeeded but got error: %s", i, err.Error())
		}
		if table.shouldSucceed && valid != table.valid {
			t.Errorf("case %d: Result should be %t but is %t.", i, table.valid, valid)
		}
	}
}
