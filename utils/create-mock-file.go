package utils

import (
	"bytes"

	"github.com/spf13/afero"
)

var appFs = afero.NewMemMapFs()

// CreateMockFile : Creates a mock file for testing purposes
func CreateMockFile(mockFile []byte) *bytes.Buffer {
	var body *bytes.Buffer

	// case if file is nil or has size = 0
	if mockFile == nil {
		// create dir
		appFs.MkdirAll("/tmp", 0755)
		afero.WriteFile(appFs, "/tmp/testfile", mockFile, 0644)

		// test file path
		filePath := "/tmp/testfile"

		file, err := appFs.Open(filePath)
		if err != nil {
			return nil
		}
		defer file.Close()

		body = &bytes.Buffer{}

		// normal flow
	} else {
		// create dir
		appFs.MkdirAll("/tmp", 0755)
		afero.WriteFile(appFs, "/tmp/testfile", mockFile, 0644)

		// test file path
		filePath := "/tmp/testfile"

		file, err := appFs.Open(filePath)
		if err != nil {
			return nil
		}
		defer file.Close()

		body = &bytes.Buffer{}
	}

	return body

}
