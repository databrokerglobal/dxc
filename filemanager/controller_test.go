package filemanager

import (
	"bytes"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"testing"

	"github.com/labstack/echo"
	"github.com/spf13/afero"
)

// Creates a new file upload http request with extra params
func newfileMockUploadRequest(uri string, params map[string]string, paramName string) *http.Request {
	// mock io lib
	var appFs = afero.NewMemMapFs()

	// create dir
	appFs.MkdirAll("/tmp", 0755)
	afero.WriteFile(appFs, "/tmp/testfile", []byte("tesfile"), 0644)

	// test file path
	filePath := "/tmp/testfile"

	file, err := appFs.Open(filePath)
	if err != nil {
		return nil
	}
	defer file.Close()

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, err := writer.CreateFormFile(paramName, filepath.Base(filePath))
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

	//-----------
	// Read file
	//-----------

	// Source - File stream from upload
	file, err := c.FormFile("file")
	if err != nil {
		return err
	}

	// Return succes message
	return c.HTML(http.StatusOK, fmt.Sprintf("<p>File %s uploaded successfully with field name=%s. File checksum result: OK</p>", file.Filename, name))
}

// Test of file upload route
func TestUpload(t *testing.T) {
	formParams := map[string]string{
		"name": "Text File 1",
	}

	e := echo.New()
	req := newfileMockUploadRequest("/upload", formParams, "file")
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	err := mockUpload(c)

	if err != nil {
		t.Errorf("Test failed: %s", err)
	}
}
