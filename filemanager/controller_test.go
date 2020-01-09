package filemanager

import (
	"bytes"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"github.com/labstack/echo"
)

// Creates a new file upload http request with extra params
func newfileUploadRequest(uri string, params map[string]string, paramName, path string) *http.Request {
	file, err := os.Open(path)
	if err != nil {
		return nil
	}
	defer file.Close()

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, err := writer.CreateFormFile(paramName, filepath.Base(path))
	if err != nil {
		return nil
	}
	_, err = io.Copy(part, file)

	for key, val := range params {
		_ = writer.WriteField(key, val)
	}
	err = writer.Close()
	if err != nil {
		return nil
	}

	req := httptest.NewRequest(http.MethodPost, uri, body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	return req
}

// Upload file controller
func mockUpload(c echo.Context) error {
	// Read form fields
	name := c.FormValue("name")
	email := c.FormValue("email")

	//-----------
	// Read file
	//-----------

	// Source - File stream from upload
	file, err := c.FormFile("file")
	if err != nil {
		return err
	}

	// Return succes message
	return c.HTML(http.StatusOK, fmt.Sprintf("<p>File %s uploaded successfully with fields name=%s and email=%s. File checksum result: OK</p>", file.Filename, name, email))
}

// Test of file upload route
func TestUpload(t *testing.T) {
	// test file in local dir to use
	filePath := "/Users/adrienblavier/Documents/settlemint/dxc/test.txt"

	formParams := map[string]string{
		"name":  "adrien",
		"email": "example@mail.com",
	}

	e := echo.New()
	req := newfileUploadRequest("/upload", formParams, "file", filePath)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	err := mockUpload(c)

	if err != nil {
		t.Errorf("Test failed: %s", err)
	}
}
