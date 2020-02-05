package filemanager

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/databrokerglobal/dxc/utils"
	"github.com/labstack/echo"
)

func generateUploadRequest(data *bytes.Buffer) echo.Context {
	e := echo.New()
	c := utils.GenerateTestEchoRequest(http.MethodPost, "/upload", data)
	req := c.Request()
	req.Header.Set(echo.HeaderContentType, echo.MIMEMultipartForm)
	rec := httptest.NewRecorder()
	c = e.NewContext(req, rec)
	return c
}

func generateDownloadRequest(fileName string) echo.Context {
	e := echo.New()
	c := utils.GenerateTestEchoRequest(http.MethodGet, "/download", nil)
	req := c.Request()
	q := req.URL.Query()
	q.Add("name", fileName)
	req.URL.RawQuery = q.Encode()
	rec := httptest.NewRecorder()
	c = e.NewContext(req, rec)
	return c
}

func TestUpload(t *testing.T) {
	type args struct {
		c echo.Context
	}

	tests := []struct {
		name    string
		args    args
		wantErr bool
	}{
		{"First case", args{c: generateUploadRequest(utils.CreateMockFile([]byte("stuff")))}, false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if err := Upload(tt.args.c); (err != nil) != tt.wantErr {
				t.Errorf("Upload() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestDownload(t *testing.T) {
	type args struct {
		c echo.Context
	}
	tests := []struct {
		name    string
		args    args
		wantErr bool
	}{
		{"First case", args{c: generateDownloadRequest("test.txt")}, false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if err := Download(tt.args.c); (err != nil) != tt.wantErr {
				t.Errorf("Download() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}
