package utils

import (
	"fmt"
	"reflect"
	"testing"
)

func TestGenerateRandomBytes(t *testing.T) {

	length := 6

	randomBytes, err := GenerateRandomBytes(length)

	if err != nil {
		t.Errorf("Could not generate random bytes")
	} else {
		if len(randomBytes) != length {
			t.Errorf("Length should be %d but is %d.", length, len(randomBytes))
		}
		if fmt.Sprintf("%s", reflect.TypeOf(randomBytes)) != "[]uint8" {
			t.Errorf("Type should be []uint8 but is %s.", fmt.Sprintf("%s", reflect.TypeOf(randomBytes)))
		}
	}
}

func TestGenerateRandomString(t *testing.T) {

	length := 6

	randomString, err := GenerateRandomString(length)

	if err != nil {
		t.Errorf("Could not generate random string")
	} else {
		if len(randomString) != length {
			t.Errorf("Length should be %d but is %d.", length, len(randomString))
		}
		if fmt.Sprintf("%s", reflect.TypeOf(randomString)) != "string" {
			t.Errorf("Type should be string but is %s.", fmt.Sprintf("%s", reflect.TypeOf(randomString)))
		}
	}
}
