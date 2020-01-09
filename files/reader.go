package files

import (
	"fmt"
	"mime/multipart"
	"os"

	"github.com/joho/godotenv"
)

// ReadFile read a multipart uploaded file from controller
func readFile(file *multipart.FileHeader) (string, error) {
	// Open file to return its data source
	src, err := file.Open()
	if err != nil {
		return "", err
	}
	defer src.Close()

	// Load env files
	err = godotenv.Load()
	if err != nil {
		return "", err
	}

	// Load file path
	var filePath string
	if os.Getenv("GO_ENV") == "development" {
		filePath = os.Getenv("LOCAL_FILES_DIR")
	} else {
		filePath = "/var/files"
	}

	// Open same file in the mounted docker volume (or just local dir if go_env=development)
	from, err := os.Open(fmt.Sprintf("%s/%s", filePath, file.Filename))
	if err != nil {
		return "", err
	}
	defer from.Close()

	// Read some bytes from opened file in volume
	b1 := make([]byte, 22)
	n1, err := from.Read(b1)
	if err != nil {
		return "", err
	}
	var fileSnippet string
	fileSnippet = string(b1[:n1])

	return fileSnippet, nil
}
