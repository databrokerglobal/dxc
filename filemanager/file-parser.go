package filemanager

import (
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"os"

	"github.com/ethereum/go-ethereum/crypto"
	"github.com/joho/godotenv"
)

// ReadFile read a multipart uploaded file from controller
func parseFile(file *multipart.FileHeader) error {
	// Open file to return its data source
	src, err := file.Open()
	if err != nil {
		return err
	}
	defer src.Close()

	// Load env files
	err = godotenv.Load()
	if err != nil {
		return err
	}

	uploadedFileSnippet, err := readBytes(src)
	if err != nil {
		return err
	}

	from, err := open(file.Filename)
	if err != nil {
		return err
	}
	defer from.Close()

	localFileSnippet, err := readBytes(from)
	if err != nil {
		return err
	}

	if matches := CompareHashes(uploadedFileSnippet, localFileSnippet); !matches {
		return errors.New("Files don't match")
	}

	return nil
}

// Read 22 first bytes and return them
/*
   Because the file can be of type os.File (local dir) or multipart.File (uploaded file),
	 we pass the io.Reader interface as an argument which has the Read method used for both types.
*/
func readBytes(file io.Reader) ([]byte, error) {
	b1 := make([]byte, 22)
	n1, err := file.Read(b1)
	if err != nil {
		return nil, err
	}
	return b1[:n1], nil
}

// CompareHashes checking if hashes are identical
func CompareHashes(file1 []byte, file2 []byte) bool {
	hash1 := crypto.Keccak256(file1)
	hash2 := crypto.Keccak256(file2)

	return string(hash1) == string(hash2)
}

// open file
func open(filename string) (*os.File, error) {
	// Load env files
	err := godotenv.Load()
	if err != nil {
		return nil, err
	}

	// Load file path
	var filePath string
	if os.Getenv("GO_ENV") == "development" {
		filePath = os.Getenv("LOCAL_FILES_DIR")
	} else {
		filePath = "/var/files"
	}

	// Open same file in the mounted docker volume (or just local dir if go_env=development)
	from, err := os.Open(fmt.Sprintf("%s/%s", filePath, filename))
	if err != nil {
		return nil, err
	}
	return from, nil
}
