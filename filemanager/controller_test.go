package filemanager

import (
	"bytes"
	"errors"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"testing"

	"github.com/labstack/echo"
	"github.com/spf13/afero"
)

// mock io lib
var appFs = afero.NewMemMapFs()

// Creates a new file upload http request with extra params
func newfileUploadRequest(uri string, paramName string, mockFile []byte) *http.Request {
	var body *bytes.Buffer
	var writer *multipart.Writer

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
		writer = multipart.NewWriter(body)
		_, err = writer.CreateFormFile("file", filepath.Base(file.Name()))

		if err != nil {
			log.Fatal(err)
		}
		writer.Close()

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
		writer = multipart.NewWriter(body)
		part, err := writer.CreateFormFile("file", filepath.Base(file.Name()))

		if err != nil {
			log.Fatal(err)
		}

		io.Copy(part, file)
		writer.Close()
	}

	request := httptest.NewRequest("POST", "/upload", body)
	request.Header.Add("Content-Type", writer.FormDataContentType())

	return request
}

func createRequestAndCallUploadMockHandler(url string, param string, file []byte) error {
	e := echo.New()

	req := newfileUploadRequest(url, param, file)
	rec := httptest.NewRecorder()

	c := e.NewContext(req, rec)

	err := MockUpload(c)

	if err != nil {
		return err
	}

	return nil
}

// Upload file controller
func MockUpload(c echo.Context) error {
	// Source - File stream from upload
	file, err := c.FormFile("file")
	if file.Size == 0 {
		return errors.New("File is empty")
	}
	if err != nil {
		return err
	}

	// Return succes message
	return nil
}

// Test of file upload route
func TestUpload(t *testing.T) {

	type args struct {
		url   string
		param string
		file  []byte
	}

	tests := []struct {
		name string
		args args
		want bool
	}{
		{"Case 1: all normal", args{url: "/upload", param: "file", file: []byte("Test")}, true},
		{"Case 2: empty file", args{url: "/upload", param: "file", file: nil}, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := createRequestAndCallUploadMockHandler(tt.args.url, tt.args.param, tt.args.file)
			res := err == nil
			if res != tt.want {
				t.Errorf("Mock upload handler test case %s failed: %v", tt.name, err)
			}
		})
	}
}
